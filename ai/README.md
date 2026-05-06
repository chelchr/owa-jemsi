# 🦧 IKN Wildlife Classifier

> **Tema 6: Rimba di Tengah Beton** — DSAI Assignment #1  
> Klasifikasi 9 spesies satwa liar di kawasan Ibu Kota Nusantara (IKN)

## 📋 Spesies yang Dikenali

| # | Spesies | Nama Latin | Status IUCN |
|---|---------|-----------|-------------|
| 1 | 🦧 Orangutan Kalimantan | *Pongo pygmaeus* | Critically Endangered |
| 2 | 🐒 Bekantan | *Nasalis larvatus* | Endangered |
| 3 | 🐻 Beruang Madu | *Helarctos malayanus* | Vulnerable |
| 4 | 🐵 Owa Kalimantan | *Hylobates muelleri* | Endangered |
| 5 | 🦅 Rangkong | *Bucerotidae* | Varies |
| 6 | 🐘 Gajah Kalimantan | *Elephas maximus borneensis* | Endangered |
| 7 | 🦏 Badak | *Dicerorhinus sumatrensis* | Critically Endangered |
| 8 | 🐢 Penyu | *Chelonioidea* | Varies |
| 9 | 🐆 Macan Dahan | *Neofelis diardi* | Vulnerable |

## 📊 Dataset

- **Sumber**: iNaturalist API (CC-licensed, research grade)
- **Total**: 2.700 gambar (300 per kelas)
- **Split**: Train 240 / Val 30 / Test 30 per kelas (80/10/10%)
- **Balance**: Perfectly balanced (1:1 ratio)

## 🏗️ Arsitektur

- **Model**: EfficientNet-B0 (pretrained ImageNet)
- **Training**: 2-phase transfer learning
  - Phase 1: Freeze backbone, train classifier (5 epochs)
  - Phase 2: Full fine-tune, differential LR (25 epochs)
- **Optimizer**: AdamW + CosineAnnealingLR
- **Augmentasi**: HFlip, Rotation, ColorJitter, RandomCrop

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Buat virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

### 2. EDA (Exploratory Data Analysis)

Buka dan jalankan `eda.ipynb` di Jupyter Notebook untuk menganalisis dataset.

### 3. Training

```bash
python train.py
```

Output:
- `models/best_model.pth` — model terbaik
- `results/training_history.json` — metrik per epoch

### 4. Evaluasi

```bash
python evaluate.py
```

Output di `results/`:
- `confusion_matrix.png`
- `classification_report.txt`
- `training_curves.png`
- `per_class_accuracy.png`
- `misclassified_samples.png`

### 5. Export Model

```bash
python export_model.py          # PyTorch format
python export_model.py --onnx   # + ONNX format
```

### 6. Web Application

```bash
python app.py
```

Buka `http://localhost:7860` di browser.

## 📁 Struktur Proyek

```
├── data/
│   ├── train_data/          # 240 gambar × 9 kelas
│   ├── val_data/            # 30 gambar × 9 kelas
│   ├── test_data/           # 30 gambar × 9 kelas
│   └── dataset_metadata.json
├── models/                  # Trained model files
├── results/                 # Evaluation outputs
├── config.py                # Hyperparameters & constants
├── dataset.py               # Data loading pipeline
├── train.py                 # Training script
├── evaluate.py              # Evaluation & visualization
├── export_model.py          # Model export
├── app.py                   # Gradio web application
├── eda.ipynb                # Exploratory Data Analysis
├── requirements.txt         # Dependencies
└── README.md                # This file
```

## 🛠️ Teknologi

- **PyTorch** + **torchvision** — Deep Learning framework
- **EfficientNet-B0** — Transfer learning backbone
- **Gradio** — Web interface
- **scikit-learn** — Evaluation metrics
- **matplotlib** + **seaborn** — Visualization
