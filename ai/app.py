"""
app.py — Web Application untuk IKN Wildlife Classifier
Menggunakan Gradio untuk interface upload foto → prediksi spesies.

Usage:
    python app.py
"""

import torch
import torch.nn.functional as F
from torchvision import transforms, models
from PIL import Image
import gradio as gr

from config import Config
from train import build_model


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


# Transform untuk inference
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
# Prediction function
# ─────────────────────────────────────────────────────────────────────────────

@torch.no_grad()
def predict(image):
    """
    Prediksi spesies dari gambar yang diupload.
    
    Args:
        image: PIL Image dari Gradio
    
    Returns:
        confidences: dict {label: confidence} untuk Gradio Label output
        info_text: str — informasi detail spesies
    """
    if image is None:
        return {}, "⚠️ Silakan upload gambar terlebih dahulu."

    # Preprocess
    img = image.convert("RGB")
    img_tensor = inference_transform(img).unsqueeze(0).to(device)

    # Inference
    outputs = model(img_tensor)
    probs = F.softmax(outputs, dim=1)[0]

    # Build confidence dict
    confidences = {}
    for i, cls_name in enumerate(Config.CLASSES):
        display_name = Config.LABEL_MAP[cls_name]
        emoji = Config.SPECIES_INFO[cls_name]["emoji"]
        confidences[f"{emoji} {display_name}"] = float(probs[i])

    # Get top prediction
    top_idx = probs.argmax().item()
    top_class = Config.CLASSES[top_idx]
    top_conf = probs[top_idx].item()
    info = Config.SPECIES_INFO[top_class]

    # Build info text
    info_text = f"""
## {info['emoji']} {Config.LABEL_MAP[top_class]}

**Confidence:** {top_conf:.1%}

---

| | |
|---|---|
| **Nama Latin** | *{info['nama_latin']}* |
| **Status IUCN** | {_format_iucn_status(info['status_iucn'])} |
| **Habitat** | {info['habitat']} |

---

### 📝 Deskripsi
{info['deskripsi']}

---

### 📊 Top-3 Prediksi
"""
    # Add top-3
    top3_idx = probs.argsort(descending=True)[:3]
    for rank, idx in enumerate(top3_idx, 1):
        cls = Config.CLASSES[idx]
        sp = Config.SPECIES_INFO[cls]
        conf = probs[idx].item()
        bar = "█" * int(conf * 20) + "░" * (20 - int(conf * 20))
        info_text += f"\n{rank}. {sp['emoji']} **{Config.LABEL_MAP[cls]}** — {conf:.1%} `{bar}`"

    return confidences, info_text


def _format_iucn_status(status):
    """Format IUCN status dengan emoji warna."""
    status_map = {
        "Critically Endangered": "🔴 Critically Endangered (Kritis)",
        "Endangered":            "🟠 Endangered (Terancam)",
        "Vulnerable":            "🟡 Vulnerable (Rentan)",
        "Varies by species":     "🔵 Varies by species",
    }
    return status_map.get(status, status)


# ─────────────────────────────────────────────────────────────────────────────
# Gradio UI
# ─────────────────────────────────────────────────────────────────────────────

def build_interface():
    """Build Gradio interface."""

    # Custom CSS
    custom_css = """
    .gradio-container {
        max-width: 1100px !important;
        margin: auto !important;
    }
    .main-title {
        text-align: center;
        background: linear-gradient(135deg, #1a5e1a 0%, #2d8f2d 50%, #45b545 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 2.5em !important;
        font-weight: 800 !important;
        margin-bottom: 0 !important;
    }
    .subtitle {
        text-align: center;
        color: #666;
        font-size: 1.1em;
        margin-top: 0;
    }
    """

    with gr.Blocks(
        title="🦧 IKN Wildlife Classifier",
        css=custom_css,
        theme=gr.themes.Soft(
            primary_hue="green",
            secondary_hue="emerald",
            neutral_hue="slate",
        ),
    ) as demo:
        # Header
        gr.HTML("""
        <div style="text-align: center; padding: 20px 0 10px 0;">
            <h1 class="main-title">🦧 IKN Wildlife Classifier</h1>
            <p class="subtitle">
                🌿 <em>Rimba di Tengah Beton</em> — Tema 6 DSAI Assignment
                <br>
                Identifikasi 9 spesies satwa liar Ibu Kota Nusantara
            </p>
        </div>
        """)

        with gr.Row():
            # Left: Upload
            with gr.Column(scale=1):
                image_input = gr.Image(
                    type="pil",
                    label="📸 Upload Foto Satwa",
                    height=350,
                )
                predict_btn = gr.Button(
                    "🔍 Identifikasi Spesies",
                    variant="primary",
                    size="lg",
                )

                # Contoh gambar
                gr.Markdown("### 📋 Spesies yang Dapat Dikenali")
                species_list = "\n".join(
                    f"- {Config.SPECIES_INFO[c]['emoji']} **{Config.LABEL_MAP[c]}** "
                    f"(*{Config.SPECIES_INFO[c]['nama_latin']}*)"
                    for c in Config.CLASSES
                )
                gr.Markdown(species_list)

            # Right: Results
            with gr.Column(scale=1):
                label_output = gr.Label(
                    label="📊 Confidence Score",
                    num_top_classes=9,
                )
                info_output = gr.Markdown(
                    label="ℹ️ Informasi Spesies",
                    value="*Upload foto untuk memulai identifikasi...*",
                )

        # Wire up
        predict_btn.click(
            fn=predict,
            inputs=[image_input],
            outputs=[label_output, info_output],
        )
        image_input.change(
            fn=predict,
            inputs=[image_input],
            outputs=[label_output, info_output],
        )

        # Footer
        gr.HTML("""
        <div style="text-align: center; padding: 20px 0; color: #888; font-size: 0.85em;">
            <hr style="margin: 20px 0; border-color: #e0e0e0;">
            🦧 IKN Wildlife Classifier — EfficientNet-B0 Transfer Learning
            <br>
            Dataset: iNaturalist (CC-licensed, research grade) • 9 Spesies • 2.700 Gambar
        </div>
        """)

    return demo


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("🦧 IKN Wildlife Classifier — Web Application")
    print("=" * 50)

    # Load model
    model, device = load_model()

    # Build and launch
    demo = build_interface()
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        inbrowser=True,
    )
