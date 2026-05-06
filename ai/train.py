"""
train.py — Training script untuk IKN Wildlife Classifier
Menggunakan 2-phase transfer learning dengan EfficientNet-B0.

Usage:
    python train.py
"""

import time
import json
import copy
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models

from config import Config
from dataset import get_datasets, get_dataloaders


# ─────────────────────────────────────────────────────────────────────────────
# Model
# ─────────────────────────────────────────────────────────────────────────────

def build_model(num_classes=Config.NUM_CLASSES, pretrained=Config.PRETRAINED):
    """
    Build EfficientNet-B0 dengan custom classifier head.
    
    Args:
        num_classes: Jumlah output classes.
        pretrained: Gunakan ImageNet pretrained weights.
    
    Returns:
        model: nn.Module
    """
    if pretrained:
        weights = models.EfficientNet_B0_Weights.IMAGENET1K_V1
        model = models.efficientnet_b0(weights=weights)
        print(f"✅ Loaded EfficientNet-B0 with ImageNet pretrained weights")
    else:
        model = models.efficientnet_b0(weights=None)
        print(f"⚠️  EfficientNet-B0 initialized WITHOUT pretrained weights")

    # Ganti classifier head
    in_features = model.classifier[1].in_features  # 1280 untuk B0
    model.classifier = nn.Sequential(
        nn.Dropout(p=Config.DROPOUT_RATE, inplace=True),
        nn.Linear(in_features, num_classes),
    )

    print(f"   Classifier head: {in_features} → {num_classes}")
    return model


def freeze_backbone(model):
    """Freeze semua layer kecuali classifier head."""
    for param in model.features.parameters():
        param.requires_grad = False
    print("🔒 Backbone FROZEN — hanya classifier head yang di-train")


def unfreeze_backbone(model):
    """Unfreeze semua layer."""
    for param in model.features.parameters():
        param.requires_grad = True
    print("🔓 Backbone UNFROZEN — semua layer akan di-train")


# ─────────────────────────────────────────────────────────────────────────────
# Training utilities
# ─────────────────────────────────────────────────────────────────────────────

class EarlyStopping:
    """Early stopping berdasarkan validation loss."""

    def __init__(self, patience=Config.PATIENCE, min_delta=Config.MIN_DELTA):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_loss = None
        self.should_stop = False

    def __call__(self, val_loss):
        if self.best_loss is None:
            self.best_loss = val_loss
        elif val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.should_stop = True
                print(f"\n⏹️  Early stopping triggered! "
                      f"No improvement for {self.patience} epochs.")
        return self.should_stop


class TrainingHistory:
    """Track dan simpan metrik training."""

    def __init__(self):
        self.train_losses = []
        self.val_losses = []
        self.train_accs = []
        self.val_accs = []
        self.lrs = []
        self.epoch_times = []

    def update(self, train_loss, val_loss, train_acc, val_acc, lr, epoch_time):
        self.train_losses.append(train_loss)
        self.val_losses.append(val_loss)
        self.train_accs.append(train_acc)
        self.val_accs.append(val_acc)
        self.lrs.append(lr)
        self.epoch_times.append(epoch_time)

    def save(self, path):
        data = {
            "train_losses": self.train_losses,
            "val_losses":   self.val_losses,
            "train_accs":   self.train_accs,
            "val_accs":     self.val_accs,
            "lrs":          self.lrs,
            "epoch_times":  self.epoch_times,
        }
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        print(f"📄 Training history saved to {path}")


# ─────────────────────────────────────────────────────────────────────────────
# Training & Validation loops
# ─────────────────────────────────────────────────────────────────────────────

def train_one_epoch(model, loader, criterion, optimizer, device):
    """Train satu epoch, return (loss, accuracy)."""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for batch_idx, (images, labels) in enumerate(loader):
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc


@torch.no_grad()
def validate(model, loader, criterion, device):
    """Evaluate model, return (loss, accuracy)."""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)

        outputs = model(images)
        loss = criterion(outputs, labels)

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc


# ─────────────────────────────────────────────────────────────────────────────
# Main training function
# ─────────────────────────────────────────────────────────────────────────────

def train(model, loaders, device):
    """
    2-phase transfer learning training.
    
    Phase 1: Freeze backbone, train classifier head saja.
    Phase 2: Unfreeze semua, fine-tune dengan differential LR.
    """
    Config.ensure_dirs()

    criterion = nn.CrossEntropyLoss()
    history = TrainingHistory()
    early_stopping = EarlyStopping()

    best_val_acc = 0.0
    best_model_state = None
    global_epoch = 0

    # ── Phase 1: Frozen backbone ─────────────────────────────────────────
    print("\n" + "=" * 65)
    print("  PHASE 1: Frozen Backbone — Train Classifier Head Only")
    print("=" * 65)

    freeze_backbone(model)

    optimizer = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=Config.LR_HEAD_PHASE1,
        weight_decay=Config.WEIGHT_DECAY,
    )
    scheduler = optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=Config.EPOCHS_PHASE1,
    )

    for epoch in range(Config.EPOCHS_PHASE1):
        global_epoch += 1
        start = time.time()

        train_loss, train_acc = train_one_epoch(
            model, loaders["train"], criterion, optimizer, device
        )
        val_loss, val_acc = validate(
            model, loaders["val"], criterion, device
        )
        scheduler.step()

        elapsed = time.time() - start
        lr = optimizer.param_groups[0]["lr"]
        history.update(train_loss, val_loss, train_acc, val_acc, lr, elapsed)

        print(
            f"  Epoch {global_epoch:02d}/{Config.EPOCHS_PHASE1 + Config.EPOCHS_PHASE2} "
            f"│ Train Loss: {train_loss:.4f}  Acc: {train_acc:.4f} "
            f"│ Val Loss: {val_loss:.4f}  Acc: {val_acc:.4f} "
            f"│ LR: {lr:.2e} │ {elapsed:.1f}s"
        )

        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_model_state = copy.deepcopy(model.state_dict())
            print(f"  ✨ New best val accuracy: {val_acc:.4f}")

    # ── Phase 2: Full fine-tuning ────────────────────────────────────────
    print("\n" + "=" * 65)
    print("  PHASE 2: Full Fine-Tuning — All Layers Trainable")
    print("=" * 65)

    unfreeze_backbone(model)

    # Differential learning rate: backbone lebih kecil dari head
    optimizer = optim.AdamW([
        {"params": model.features.parameters(), "lr": Config.LR_BACKBONE},
        {"params": model.classifier.parameters(), "lr": Config.LR_HEAD_PHASE2},
    ], weight_decay=Config.WEIGHT_DECAY)

    scheduler = optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=Config.EPOCHS_PHASE2,
    )

    early_stopping = EarlyStopping()  # Reset early stopping

    for epoch in range(Config.EPOCHS_PHASE2):
        global_epoch += 1
        start = time.time()

        train_loss, train_acc = train_one_epoch(
            model, loaders["train"], criterion, optimizer, device
        )
        val_loss, val_acc = validate(
            model, loaders["val"], criterion, device
        )
        scheduler.step()

        elapsed = time.time() - start
        lr = optimizer.param_groups[1]["lr"]  # Head LR
        history.update(train_loss, val_loss, train_acc, val_acc, lr, elapsed)

        print(
            f"  Epoch {global_epoch:02d}/{Config.EPOCHS_PHASE1 + Config.EPOCHS_PHASE2} "
            f"│ Train Loss: {train_loss:.4f}  Acc: {train_acc:.4f} "
            f"│ Val Loss: {val_loss:.4f}  Acc: {val_acc:.4f} "
            f"│ LR: {lr:.2e} │ {elapsed:.1f}s"
        )

        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_model_state = copy.deepcopy(model.state_dict())
            print(f"  ✨ New best val accuracy: {val_acc:.4f}")

        # Early stopping check
        if early_stopping(val_loss):
            break

    # ── Save best model ──────────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("  SAVING RESULTS")
    print("=" * 65)

    best_model_path = Config.MODEL_DIR / "best_model.pth"
    torch.save({
        "model_state_dict": best_model_state,
        "best_val_acc":     best_val_acc,
        "num_classes":      Config.NUM_CLASSES,
        "classes":          Config.CLASSES,
        "model_name":       Config.MODEL_NAME,
        "image_size":       Config.IMAGE_SIZE,
        "normalize_mean":   Config.NORMALIZE_MEAN,
        "normalize_std":    Config.NORMALIZE_STD,
    }, best_model_path)
    print(f"💾 Best model saved to {best_model_path}")
    print(f"   Best validation accuracy: {best_val_acc:.4f}")

    # Save training history
    history.save(Config.RESULTS_DIR / "training_history.json")

    return model, history, best_val_acc


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("🦧 IKN Wildlife Classifier — Training")
    print("=" * 65)

    # Device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🖥️  Device: {device}")
    if device.type == "cuda":
        print(f"   GPU: {torch.cuda.get_device_name(0)}")
        print(f"   Memory: {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f} GB")

    # Data
    print("\n📦 Loading datasets...")
    train_ds, val_ds, test_ds = get_datasets()
    loaders = get_dataloaders(train_ds, val_ds, test_ds)

    # Model
    print("\n🏗️  Building model...")
    model = build_model()
    model = model.to(device)

    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"   Total parameters     : {total_params:,}")
    print(f"   Trainable parameters : {trainable_params:,}")

    # Train
    model, history, best_acc = train(model, loaders, device)

    # Final test evaluation
    print("\n" + "=" * 65)
    print("  FINAL TEST EVALUATION")
    print("=" * 65)

    # Load best model
    checkpoint = torch.load(
        Config.MODEL_DIR / "best_model.pth",
        map_location=device,
        weights_only=True,
    )
    model.load_state_dict(checkpoint["model_state_dict"])

    criterion = nn.CrossEntropyLoss()
    test_loss, test_acc = validate(model, loaders["test"], criterion, device)
    print(f"  Test Loss    : {test_loss:.4f}")
    print(f"  Test Accuracy: {test_acc:.4f} ({test_acc * 100:.1f}%)")
    print("\n🎉 Training selesai! Jalankan evaluate.py untuk analisis detail.")


if __name__ == "__main__":
    main()
