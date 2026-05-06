"""
export_model.py — Export model untuk deployment
Simpan model dalam format yang ringan untuk inference.

Usage:
    python export_model.py
    python export_model.py --onnx   # Export juga ke ONNX
"""

import argparse
import torch
from torchvision import models

from config import Config
from train import build_model


def export_pytorch(checkpoint_path, output_path):
    """
    Export model sebagai state_dict ringan (tanpa optimizer state).
    Termasuk semua metadata yang dibutuhkan untuk inference.
    """
    checkpoint = torch.load(checkpoint_path, map_location="cpu", weights_only=True)

    # Save versi ringan — hanya yang dibutuhkan untuk inference
    inference_data = {
        "model_state_dict": checkpoint["model_state_dict"],
        "num_classes":      checkpoint["num_classes"],
        "classes":          checkpoint["classes"],
        "model_name":       checkpoint["model_name"],
        "image_size":       checkpoint["image_size"],
        "normalize_mean":   checkpoint["normalize_mean"],
        "normalize_std":    checkpoint["normalize_std"],
        "label_map":        Config.LABEL_MAP,
        "species_info":     Config.SPECIES_INFO,
    }

    torch.save(inference_data, output_path)
    
    # Hitung ukuran file
    import os
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"💾 PyTorch model saved: {output_path} ({size_mb:.1f} MB)")
    return output_path


def export_onnx(checkpoint_path, output_path):
    """Export model ke format ONNX untuk inference cross-platform."""
    checkpoint = torch.load(checkpoint_path, map_location="cpu", weights_only=True)

    model = build_model(pretrained=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    # Dummy input
    dummy = torch.randn(1, 3, Config.IMAGE_SIZE, Config.IMAGE_SIZE)

    torch.onnx.export(
        model,
        dummy,
        str(output_path),
        export_params=True,
        opset_version=13,
        do_constant_folding=True,
        input_names=["image"],
        output_names=["prediction"],
        dynamic_axes={
            "image":      {0: "batch_size"},
            "prediction": {0: "batch_size"},
        },
    )

    import os
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"💾 ONNX model saved: {output_path} ({size_mb:.1f} MB)")
    return output_path


def main():
    parser = argparse.ArgumentParser(description="Export trained model")
    parser.add_argument("--onnx", action="store_true", help="Juga export ke ONNX")
    args = parser.parse_args()

    Config.ensure_dirs()

    checkpoint_path = Config.MODEL_DIR / "best_model.pth"
    if not checkpoint_path.exists():
        print("❌ Model belum ada! Jalankan train.py dulu.")
        return

    print("🦧 IKN Wildlife Classifier — Model Export")
    print("=" * 50)

    # PyTorch export
    pytorch_path = Config.MODEL_DIR / "wildlife_classifier.pth"
    export_pytorch(checkpoint_path, pytorch_path)

    # ONNX export (optional)
    if args.onnx:
        onnx_path = Config.MODEL_DIR / "wildlife_classifier.onnx"
        export_onnx(checkpoint_path, onnx_path)

    print("\n✅ Export selesai!")
    print(f"📁 File tersimpan di: {Config.MODEL_DIR}")


if __name__ == "__main__":
    main()
