"""
evaluate.py — Evaluasi model pada test set + visualisasi
Menghasilkan confusion matrix, classification report, training curves,
dan visualisasi prediksi salah.

Usage:
    python evaluate.py
"""

import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

import torch
import torch.nn as nn
from torchvision import models
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    top_k_accuracy_score,
)

from config import Config
from dataset import get_datasets, get_dataloaders, denormalize
from train import build_model


# ─────────────────────────────────────────────────────────────────────────────
# Styling
# ─────────────────────────────────────────────────────────────────────────────

plt.style.use("seaborn-v0_8-whitegrid")
plt.rcParams["figure.dpi"] = 120
plt.rcParams["font.size"] = 11


# ─────────────────────────────────────────────────────────────────────────────
# Load model
# ─────────────────────────────────────────────────────────────────────────────

def load_best_model(device):
    """Load best model dari checkpoint."""
    model = build_model(pretrained=False)
    checkpoint = torch.load(
        Config.MODEL_DIR / "best_model.pth",
        map_location=device,
        weights_only=True,
    )
    model.load_state_dict(checkpoint["model_state_dict"])
    model = model.to(device)
    model.eval()
    print(f"✅ Model loaded — Best val acc: {checkpoint['best_val_acc']:.4f}")
    return model, checkpoint


# ─────────────────────────────────────────────────────────────────────────────
# Collect predictions
# ─────────────────────────────────────────────────────────────────────────────

@torch.no_grad()
def get_all_predictions(model, loader, device):
    """
    Collect semua predictions, probabilities, dan ground truth.
    
    Returns:
        all_labels: np.array — ground truth labels
        all_preds: np.array — predicted labels
        all_probs: np.array — prediction probabilities (N, num_classes)
        all_images: list of tensors — gambar asli (untuk visualisasi)
    """
    all_labels = []
    all_preds = []
    all_probs = []
    all_images = []

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        probs = torch.softmax(outputs, dim=1)
        _, predicted = outputs.max(1)

        all_labels.extend(labels.cpu().numpy())
        all_preds.extend(predicted.cpu().numpy())
        all_probs.extend(probs.cpu().numpy())
        all_images.extend(images.cpu())

    return (
        np.array(all_labels),
        np.array(all_preds),
        np.array(all_probs),
        all_images,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Visualizations
# ─────────────────────────────────────────────────────────────────────────────

def plot_confusion_matrix(labels, preds, class_names, save_path):
    """Plot dan simpan confusion matrix."""
    cm = confusion_matrix(labels, preds)
    
    fig, axes = plt.subplots(1, 2, figsize=(20, 8))
    fig.suptitle("Confusion Matrix — Test Set", fontsize=16, fontweight="bold")

    # Raw counts
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=class_names, yticklabels=class_names,
        ax=axes[0], cbar_kws={"shrink": 0.8},
    )
    axes[0].set_xlabel("Prediksi", fontweight="bold")
    axes[0].set_ylabel("Aktual", fontweight="bold")
    axes[0].set_title("Jumlah (Raw Count)")

    # Normalized (percentage)
    cm_norm = cm.astype("float") / cm.sum(axis=1)[:, np.newaxis] * 100
    sns.heatmap(
        cm_norm, annot=True, fmt=".1f", cmap="Oranges",
        xticklabels=class_names, yticklabels=class_names,
        ax=axes[1], cbar_kws={"shrink": 0.8},
    )
    axes[1].set_xlabel("Prediksi", fontweight="bold")
    axes[1].set_ylabel("Aktual", fontweight="bold")
    axes[1].set_title("Persentase (%)")

    plt.tight_layout()
    plt.savefig(save_path, bbox_inches="tight")
    plt.show()
    print(f"📊 Confusion matrix saved to {save_path}")


def plot_training_curves(history_path, save_path):
    """Plot training & validation loss dan accuracy curves."""
    with open(history_path, "r") as f:
        history = json.load(f)

    epochs = range(1, len(history["train_losses"]) + 1)

    fig, axes = plt.subplots(1, 3, figsize=(20, 5))
    fig.suptitle("Training Curves", fontsize=16, fontweight="bold")

    # Loss
    axes[0].plot(epochs, history["train_losses"], "b-o", label="Train", markersize=3)
    axes[0].plot(epochs, history["val_losses"], "r-o", label="Val", markersize=3)
    axes[0].axvline(Config.EPOCHS_PHASE1, color="gray", linestyle="--", alpha=0.5,
                     label="Phase 1→2")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Loss")
    axes[0].set_title("Loss")
    axes[0].legend()

    # Accuracy
    axes[1].plot(epochs, history["train_accs"], "b-o", label="Train", markersize=3)
    axes[1].plot(epochs, history["val_accs"], "r-o", label="Val", markersize=3)
    axes[1].axvline(Config.EPOCHS_PHASE1, color="gray", linestyle="--", alpha=0.5,
                     label="Phase 1→2")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Accuracy")
    axes[1].set_title("Accuracy")
    axes[1].legend()
    axes[1].set_ylim(0, 1.05)

    # Learning Rate
    axes[2].plot(epochs, history["lrs"], "g-o", markersize=3)
    axes[2].axvline(Config.EPOCHS_PHASE1, color="gray", linestyle="--", alpha=0.5,
                     label="Phase 1→2")
    axes[2].set_xlabel("Epoch")
    axes[2].set_ylabel("Learning Rate")
    axes[2].set_title("Learning Rate Schedule")
    axes[2].legend()
    axes[2].set_yscale("log")

    plt.tight_layout()
    plt.savefig(save_path, bbox_inches="tight")
    plt.show()
    print(f"📈 Training curves saved to {save_path}")


def plot_misclassified(labels, preds, probs, images, class_names, save_path, n=16):
    """Visualisasi sample gambar yang salah prediksi."""
    # Cari indeks yang salah
    wrong_idx = np.where(labels != preds)[0]
    if len(wrong_idx) == 0:
        print("✅ Tidak ada prediksi salah! Perfect accuracy!")
        return

    # Ambil sample
    n = min(n, len(wrong_idx))
    sample_idx = wrong_idx[:n]

    cols = 4
    rows = (n + cols - 1) // cols
    fig, axes = plt.subplots(rows, cols, figsize=(16, 4 * rows))
    fig.suptitle(
        f"Prediksi Salah ({len(wrong_idx)} dari {len(labels)} gambar)",
        fontsize=14, fontweight="bold",
    )

    if rows == 1:
        axes = axes.reshape(1, -1)

    for i, idx in enumerate(sample_idx):
        row, col = divmod(i, cols)
        ax = axes[row][col]

        # Denormalize dan tampilkan gambar
        img = denormalize(images[idx]).permute(1, 2, 0).numpy()
        ax.imshow(img)

        true_label = class_names[labels[idx]]
        pred_label = class_names[preds[idx]]
        conf = probs[idx][preds[idx]] * 100

        ax.set_title(
            f"Aktual: {true_label}\nPrediksi: {pred_label} ({conf:.1f}%)",
            fontsize=9,
            color="red",
            fontweight="bold",
        )
        ax.axis("off")

    # Sembunyikan axes kosong
    for i in range(n, rows * cols):
        row, col = divmod(i, cols)
        axes[row][col].axis("off")

    plt.tight_layout()
    plt.savefig(save_path, bbox_inches="tight")
    plt.show()
    print(f"❌ Misclassified samples saved to {save_path}")


def plot_per_class_accuracy(labels, preds, class_names, save_path):
    """Bar chart akurasi per kelas."""
    cm = confusion_matrix(labels, preds)
    per_class_acc = cm.diagonal() / cm.sum(axis=1)

    fig, ax = plt.subplots(figsize=(12, 6))
    colors = ["#4CAF50" if a >= 0.9 else "#FF9800" if a >= 0.7 else "#E53935"
              for a in per_class_acc]
    bars = ax.barh(class_names, per_class_acc, color=colors, alpha=0.85)

    ax.set_xlabel("Accuracy", fontweight="bold")
    ax.set_title("Per-Class Accuracy — Test Set", fontsize=14, fontweight="bold")
    ax.set_xlim(0, 1.1)
    ax.axvline(0.9, color="green", linestyle="--", alpha=0.3, label="90% target")

    for bar, acc in zip(bars, per_class_acc):
        ax.text(acc + 0.01, bar.get_y() + bar.get_height() / 2,
                f"{acc:.1%}", va="center", fontsize=10, fontweight="bold")

    ax.legend()
    plt.tight_layout()
    plt.savefig(save_path, bbox_inches="tight")
    plt.show()
    print(f"📊 Per-class accuracy saved to {save_path}")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("🦧 IKN Wildlife Classifier — Evaluation")
    print("=" * 65)

    Config.ensure_dirs()

    # Device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🖥️  Device: {device}")

    # Load model
    model, checkpoint = load_best_model(device)

    # Load test data
    print("\n📦 Loading test dataset...")
    _, _, test_ds = get_datasets()
    loaders = get_dataloaders(test_dataset=test_ds)

    # Get predictions
    print("\n🔍 Running inference on test set...")
    labels, preds, probs, images = get_all_predictions(
        model, loaders["test"], device
    )

    # Class names (display names)
    class_names = [Config.LABEL_MAP[c] for c in Config.CLASSES]

    # ── Metrics ──────────────────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("  CLASSIFICATION REPORT")
    print("=" * 65)

    report = classification_report(
        labels, preds, target_names=class_names, digits=4,
    )
    print(report)

    # Save report
    report_path = Config.RESULTS_DIR / "classification_report.txt"
    with open(report_path, "w") as f:
        f.write("IKN Wildlife Classifier — Classification Report\n")
        f.write("=" * 65 + "\n\n")
        f.write(report)
    print(f"📄 Report saved to {report_path}")

    # Overall accuracy
    acc = accuracy_score(labels, preds)
    print(f"\n  Overall Accuracy : {acc:.4f} ({acc * 100:.1f}%)")

    # Top-3 accuracy
    try:
        top3_acc = top_k_accuracy_score(labels, probs, k=3)
        print(f"  Top-3 Accuracy   : {top3_acc:.4f} ({top3_acc * 100:.1f}%)")
    except Exception:
        pass

    # ── Plots ────────────────────────────────────────────────────────────
    print("\n📊 Generating visualizations...\n")

    # 1. Confusion Matrix
    plot_confusion_matrix(
        labels, preds, class_names,
        Config.RESULTS_DIR / "confusion_matrix.png",
    )

    # 2. Training Curves
    history_path = Config.RESULTS_DIR / "training_history.json"
    if history_path.exists():
        plot_training_curves(
            history_path,
            Config.RESULTS_DIR / "training_curves.png",
        )
    else:
        print("⚠️  training_history.json not found — skipping training curves")

    # 3. Per-class accuracy
    plot_per_class_accuracy(
        labels, preds, class_names,
        Config.RESULTS_DIR / "per_class_accuracy.png",
    )

    # 4. Misclassified samples
    plot_misclassified(
        labels, preds, probs, images, class_names,
        Config.RESULTS_DIR / "misclassified_samples.png",
    )

    print("\n" + "=" * 65)
    print("  🎉 Evaluasi selesai!")
    print(f"  📁 Semua hasil tersimpan di: {Config.RESULTS_DIR}")
    print("=" * 65)


if __name__ == "__main__":
    main()
