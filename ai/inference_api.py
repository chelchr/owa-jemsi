"""
inference_api.py — Flask REST API untuk IKN Wildlife Classifier
Endpoint inference yang dipanggil oleh Go backend.

Usage:
    python inference_api.py
"""

import io
import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
from flask import Flask, request, jsonify

from config import Config
from train import build_model


# ─────────────────────────────────────────────────────────────────────────────
# App setup
# ─────────────────────────────────────────────────────────────────────────────

app = Flask(__name__)

# IUCN status → risk level mapping
IUCN_TO_RISK = {
    "Critically Endangered": "tinggi",
    "Endangered":            "sedang",
    "Vulnerable":            "rendah",
    "Varies by species":     "sedang",
}


# ─────────────────────────────────────────────────────────────────────────────
# Load model (saat startup)
# ─────────────────────────────────────────────────────────────────────────────

def load_model():
    """Load trained model untuk inference."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Coba load exported model dulu, fallback ke best_model
    model_path = Config.MODEL_DIR / "wildlife_classifier.pth"
    if not model_path.exists():
        model_path = Config.MODEL_DIR / "best_model.pth"

    if not model_path.exists():
        raise FileNotFoundError(
            f"❌ Model tidak ditemukan di {Config.MODEL_DIR}!\n"
            "   Jalankan `python train.py` terlebih dahulu."
        )

    checkpoint = torch.load(model_path, map_location=device, weights_only=True)

    model = build_model(pretrained=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()

    print(f"✅ Model loaded from {model_path}")
    print(f"   Device: {device}")
    return model, device


# Transform untuk inference (sama persis dengan app.py)
inference_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(Config.IMAGE_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=Config.NORMALIZE_MEAN,
        std=Config.NORMALIZE_STD,
    ),
])


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "model_loaded": model is not None})


@app.route("/predict", methods=["POST"])
def predict():
    """
    Prediksi spesies dari gambar yang diupload.

    Request:
        POST /predict
        Content-Type: multipart/form-data
        Field: "image" (file gambar)

    Response:
        {
            "species": "orangutan",
            "species_label": "Orangutan Kalimantan",
            "confidence": 0.95,
            "risk_level": "tinggi",
            "top3": [
                {"species": "orangutan", "label": "Orangutan Kalimantan", "confidence": 0.95},
                ...
            ]
        }
    """
    # Validasi input
    if "image" not in request.files:
        return jsonify({"error": "Field 'image' is required"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    try:
        # Baca dan preprocess gambar
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_tensor = inference_transform(image).unsqueeze(0).to(device)

        # Inference
        with torch.no_grad():
            outputs = model(img_tensor)
            probs = F.softmax(outputs, dim=1)[0]

        # Top prediction
        top_idx = probs.argmax().item()
        top_class = Config.CLASSES[top_idx]
        top_conf = float(probs[top_idx])
        top_info = Config.SPECIES_INFO[top_class]

        # Risk level dari IUCN status
        risk_level = IUCN_TO_RISK.get(top_info["status_iucn"], "sedang")

        # Top-3 predictions
        top3_idx = probs.argsort(descending=True)[:3]
        top3 = []
        for idx in top3_idx:
            idx = idx.item()
            cls = Config.CLASSES[idx]
            info = Config.SPECIES_INFO[cls]
            top3.append({
                "species":    cls,
                "label":      Config.LABEL_MAP[cls],
                "confidence": round(float(probs[idx]), 4),
                "risk_level": IUCN_TO_RISK.get(info["status_iucn"], "sedang"),
            })

        return jsonify({
            "species":       top_class,
            "species_label": Config.LABEL_MAP[top_class],
            "confidence":    round(top_conf, 4),
            "risk_level":    risk_level,
            "top3":          top3,
        })

    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("🦧 IKN Wildlife Classifier — Inference API")
    print("=" * 50)

    # Load model saat startup
    model, device = load_model()

    print("\n🚀 Starting Flask API on port 5000...")
    print("   POST /predict  — Predict species from image")
    print("   GET  /health   — Health check")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False,
    )
