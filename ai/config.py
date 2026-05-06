"""
config.py — Konfigurasi pusat untuk IKN Wildlife Classifier
Semua hyperparameter, path, dan konstanta disimpan di sini.
"""

import os
from pathlib import Path


class Config:
    """Konfigurasi training & inference."""

    # ── Paths ────────────────────────────────────────────────────────────────
    PROJECT_DIR = Path(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR    = PROJECT_DIR / "data"
    TRAIN_DIR   = DATA_DIR / "train_data"
    VAL_DIR     = DATA_DIR / "val_data"
    TEST_DIR    = DATA_DIR / "test_data"
    RESULTS_DIR = PROJECT_DIR / "results"
    MODEL_DIR   = PROJECT_DIR / "models"

    # ── Dataset ──────────────────────────────────────────────────────────────
    NUM_CLASSES = 9
    IMAGE_SIZE  = 224
    BATCH_SIZE  = 32
    NUM_WORKERS = 0  # Windows-safe; naikkan ke 4 di Linux/Colab

    CLASSES = [
        # Urutan WAJIB alfabetis — sama persis dengan cara ImageFolder load folder
        "badak",        # 0
        "bekantan",     # 1
        "beruang_madu", # 2
        "gajah",        # 3
        "macan_dahan",  # 4
        "orangutan",    # 5
        "owa",          # 6
        "penyu",        # 7
        "rangkong",     # 8
    ]

    LABEL_MAP = {
        "orangutan":    "Orangutan Kalimantan",
        "bekantan":     "Bekantan",
        "beruang_madu": "Beruang Madu",
        "owa":          "Owa Kalimantan",
        "rangkong":     "Rangkong",
        "gajah":        "Gajah Kalimantan",
        "badak":        "Badak",
        "penyu":        "Penyu",
        "macan_dahan":  "Macan Dahan",
    }

    # Index ↔ class name mapping
    IDX_TO_CLASS = {i: c for i, c in enumerate(CLASSES)}
    CLASS_TO_IDX = {c: i for i, c in enumerate(CLASSES)}

    # ── Training Hyperparameters ─────────────────────────────────────────────
    # Phase 1: Freeze backbone, hanya train classifier head
    EPOCHS_PHASE1  = 5
    LR_HEAD_PHASE1 = 1e-3

    # Phase 2: Unfreeze semua, differential learning rate
    EPOCHS_PHASE2  = 25
    LR_BACKBONE    = 1e-5
    LR_HEAD_PHASE2 = 1e-4

    WEIGHT_DECAY = 1e-4
    PATIENCE     = 7       # Early stopping patience
    MIN_DELTA    = 0.001   # Minimum improvement untuk early stopping

    # ── Normalize ────────────────────────────────────────────────────────────
    # Gunakan ImageNet defaults (update dengan nilai dari EDA jika tersedia)
    NORMALIZE_MEAN = [0.485, 0.456, 0.406]
    NORMALIZE_STD  = [0.229, 0.224, 0.225]

    # ── Model ────────────────────────────────────────────────────────────────
    MODEL_NAME     = "efficientnet_b0"
    DROPOUT_RATE   = 0.3
    PRETRAINED     = True

    # ── Augmentation ─────────────────────────────────────────────────────────
    AUG_HFLIP_PROB  = 0.5
    AUG_ROTATION    = 15
    AUG_BRIGHTNESS  = 0.3
    AUG_CONTRAST    = 0.3
    AUG_SATURATION  = 0.2
    AUG_CROP_SCALE  = (0.8, 1.0)

    # ── Info Spesies (untuk tampilan aplikasi) ───────────────────────────────
    SPECIES_INFO = {
        "orangutan": {
            "nama_latin":  "Pongo pygmaeus",
            "status_iucn": "Critically Endangered",
            "habitat":     "Hutan hujan dataran rendah Kalimantan",
            "deskripsi":   "Primata terbesar di Asia. Hidup soliter di kanopi hutan. "
                           "Populasinya menurun drastis akibat deforestasi dan perburuan.",
            "emoji":       "🦧",
        },
        "bekantan": {
            "nama_latin":  "Nasalis larvatus",
            "status_iucn": "Endangered",
            "habitat":     "Hutan bakau dan tepi sungai Kalimantan",
            "deskripsi":   "Primata endemik Kalimantan dengan hidung panjang yang khas. "
                           "Hidup berkelompok di dekat perairan.",
            "emoji":       "🐒",
        },
        "beruang_madu": {
            "nama_latin":  "Helarctos malayanus",
            "status_iucn": "Vulnerable",
            "habitat":     "Hutan tropis dataran rendah Asia Tenggara",
            "deskripsi":   "Beruang terkecil di dunia. Memiliki tanda berbentuk huruf U "
                           "berwarna kuning-oranye di dada.",
            "emoji":       "🐻",
        },
        "owa": {
            "nama_latin":  "Hylobates muelleri",
            "status_iucn": "Endangered",
            "habitat":     "Kanopi hutan Kalimantan",
            "deskripsi":   "Primata kecil yang bergerak dengan berayun di antara pohon "
                           "(brachiasi). Dikenal dengan nyanyian panjangnya di pagi hari.",
            "emoji":       "🐵",
        },
        "rangkong": {
            "nama_latin":  "Bucerotidae (famili)",
            "status_iucn": "Varies by species",
            "habitat":     "Hutan hujan tropis Kalimantan",
            "deskripsi":   "Burung besar dengan paruh melengkung dan casque di atasnya. "
                           "Penting sebagai penyebar biji di hutan.",
            "emoji":       "🦅",
        },
        "gajah": {
            "nama_latin":  "Elephas maximus borneensis",
            "status_iucn": "Endangered",
            "habitat":     "Hutan dataran rendah Kalimantan Utara",
            "deskripsi":   "Sub-spesies gajah Asia terkecil. Populasi diperkirakan "
                           "hanya sekitar 1.500 ekor di alam liar.",
            "emoji":       "🐘",
        },
        "badak": {
            "nama_latin":  "Dicerorhinus sumatrensis",
            "status_iucn": "Critically Endangered",
            "habitat":     "Hutan hujan lebat Kalimantan",
            "deskripsi":   "Badak terkecil dan paling langka. Bercula dua dan "
                           "berbulu. Populasi tinggal puluhan ekor.",
            "emoji":       "🦏",
        },
        "penyu": {
            "nama_latin":  "Chelonioidea (superfamili)",
            "status_iucn": "Varies by species",
            "habitat":     "Perairan tropis sekitar Kalimantan",
            "deskripsi":   "Reptil laut purba yang bertelur di pantai. Terancam "
                           "oleh polusi plastik dan perubahan iklim.",
            "emoji":       "🐢",
        },
        "macan_dahan": {
            "nama_latin":  "Neofelis diardi",
            "status_iucn": "Vulnerable",
            "habitat":     "Hutan hujan Kalimantan dan Sumatera",
            "deskripsi":   "Kucing besar terbesar di Kalimantan. Nokturnal dan "
                           "pemanjat ulung. Jarang terlihat di alam liar.",
            "emoji":       "🐆",
        },
    }

    @classmethod
    def ensure_dirs(cls):
        """Buat direktori output jika belum ada."""
        cls.RESULTS_DIR.mkdir(parents=True, exist_ok=True)
        cls.MODEL_DIR.mkdir(parents=True, exist_ok=True)