"""
dataset.py — Data loading & augmentation pipeline
Menggunakan torchvision ImageFolder + custom transforms.
"""

import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from config import Config


def get_train_transform():
    """Augmentasi untuk training — menambah variasi data."""
    return transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomHorizontalFlip(p=Config.AUG_HFLIP_PROB),
        transforms.RandomRotation(degrees=Config.AUG_ROTATION),
        transforms.ColorJitter(
            brightness=Config.AUG_BRIGHTNESS,
            contrast=Config.AUG_CONTRAST,
            saturation=Config.AUG_SATURATION,
        ),
        transforms.RandomResizedCrop(
            Config.IMAGE_SIZE,
            scale=Config.AUG_CROP_SCALE,
        ),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=Config.NORMALIZE_MEAN,
            std=Config.NORMALIZE_STD,
        ),
    ])


def get_val_transform():
    """Transform untuk validation & test — tanpa augmentasi."""
    return transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(Config.IMAGE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=Config.NORMALIZE_MEAN,
            std=Config.NORMALIZE_STD,
        ),
    ])


def get_datasets():
    """
    Load train, val, dan test datasets menggunakan ImageFolder.
    Folder structure harus: split_dir/class_name/image.jpg
    
    Returns:
        tuple: (train_dataset, val_dataset, test_dataset)
    """
    train_dataset = datasets.ImageFolder(
        root=str(Config.TRAIN_DIR),
        transform=get_train_transform(),
    )
    val_dataset = datasets.ImageFolder(
        root=str(Config.VAL_DIR),
        transform=get_val_transform(),
    )
    test_dataset = datasets.ImageFolder(
        root=str(Config.TEST_DIR),
        transform=get_val_transform(),
    )

    # Verifikasi bahwa class ordering konsisten
    print(f"📂 Train classes: {train_dataset.classes}")
    print(f"📂 Val   classes: {val_dataset.classes}")
    print(f"📂 Test  classes: {test_dataset.classes}")
    print(f"\n📊 Dataset sizes:")
    print(f"   Train : {len(train_dataset)}")
    print(f"   Val   : {len(val_dataset)}")
    print(f"   Test  : {len(test_dataset)}")

    return train_dataset, val_dataset, test_dataset


def get_dataloaders(train_dataset=None, val_dataset=None, test_dataset=None):
    """
    Buat DataLoader untuk setiap split.
    
    Args:
        train_dataset, val_dataset, test_dataset: Dataset objects.
            Jika None, akan dibuat dari get_datasets().
    
    Returns:
        dict: {'train': DataLoader, 'val': DataLoader, 'test': DataLoader}
    """
    if train_dataset is None:
        train_dataset, val_dataset, test_dataset = get_datasets()

    loaders = {
        "train": DataLoader(
            train_dataset,
            batch_size=Config.BATCH_SIZE,
            shuffle=True,
            num_workers=Config.NUM_WORKERS,
            pin_memory=True,
            drop_last=False,
        ),
        "val": DataLoader(
            val_dataset,
            batch_size=Config.BATCH_SIZE,
            shuffle=False,
            num_workers=Config.NUM_WORKERS,
            pin_memory=True,
        ),
        "test": DataLoader(
            test_dataset,
            batch_size=Config.BATCH_SIZE,
            shuffle=False,
            num_workers=Config.NUM_WORKERS,
            pin_memory=True,
        ),
    }

    return loaders


def denormalize(tensor):
    """
    Kembalikan tensor dari normalized ke pixel [0, 1] untuk visualisasi.
    
    Args:
        tensor: Tensor shape (C, H, W) yang sudah dinormalize.
    
    Returns:
        Tensor shape (C, H, W) dalam range [0, 1].
    """
    mean = torch.tensor(Config.NORMALIZE_MEAN).view(3, 1, 1)
    std = torch.tensor(Config.NORMALIZE_STD).view(3, 1, 1)
    return torch.clamp(tensor * std + mean, 0, 1)


# ── Quick test ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("🔍 Testing dataset pipeline...\n")
    train_ds, val_ds, test_ds = get_datasets()

    # Test satu batch
    loader = get_dataloaders(train_ds, val_ds, test_ds)
    batch_imgs, batch_labels = next(iter(loader["train"]))
    print(f"\n✅ Batch shape : {batch_imgs.shape}")
    print(f"✅ Labels shape: {batch_labels.shape}")
    print(f"✅ Pixel range : [{batch_imgs.min():.3f}, {batch_imgs.max():.3f}]")
    print(f"✅ Label values: {batch_labels[:8].tolist()}")
    print(f"\n🎉 Dataset pipeline berfungsi dengan baik!")
