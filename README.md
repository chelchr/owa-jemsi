# 🦧 OWA JEMSI (Jaringan Edukasi dan Mitigasi Satwa IKN)

Solusi narahubung interaktif untuk pelaporan dan identifikasi satwa liar di kawasan Ibu Kota Nusantara (IKN). Mengusung arsitektur microservice ringan untuk area dengan sinyal minim.

## Arsitektur

```
Frontend ──► Go Backend (:8080) ──► Python AI Service (:5000)
                  │                         │
                  ▼                         ▼
             PostgreSQL              EfficientNet-B0 Model
```

- **Frontend** mengirim laporan (foto + lokasi) ke Go Backend.
- **Go Backend** meneruskan foto ke AI Service untuk prediksi spesies otomatis.
- **AI Service** mengembalikan spesies, confidence, dan risk level.
- Jika AI Service tidak tersedia, backend tetap berjalan dengan input manual dari user (graceful degradation).

## Struktur Direktori

```
owa-jemsi/
├── ai/                  # Python — AI Wildlife Classifier
│   ├── config.py        # Konfigurasi model, classes, species info
│   ├── train.py         # Training script (2-phase transfer learning)
│   ├── app.py           # Gradio UI untuk demo standalone
│   ├── inference_api.py # Flask REST API (dipanggil oleh backend)
│   ├── export_model.py  # Export model untuk deployment
│   ├── data/            # Dataset (train/val/test)
│   └── models/          # Trained model files (.pth)
│
├── backend/             # Golang — RESTful API (Gin + GORM)
│   ├── cmd/main.go      # Entry point
│   └── internal/
│       ├── config/      # Koneksi database (PostgreSQL)
│       ├── handler/     # HTTP handlers (report)
│       ├── model/       # GORM models
│       ├── repository/  # Database queries
│       ├── service/     # Business logic + AI client
│       └── utils/       # File upload helper
│
├── frontend/            # Antarmuka web pengguna
└── docs/                # Dokumen SRS
```

## Cara Menjalankan

### Prasyarat

- **Go** ≥ 1.26
- **Python** ≥ 3.10 dengan pip
- **PostgreSQL** (running)

### 1. Setup Environment

Buat file `.env` di folder `backend/`:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=owa_jemsi
DB_PORT=5432
AI_SERVICE_URL=http://localhost:5000   # opsional, default sudah localhost:5000
```

### 2. Menjalankan AI Service (Python)

```bash
cd ai
pip install torch torchvision flask pillow
python inference_api.py
```

AI service berjalan di `http://localhost:5000`.

| Endpoint | Method | Fungsi |
|---|---|---|
| `/predict` | POST | Upload gambar → prediksi spesies |
| `/health` | GET | Health check |

### 3. Menjalankan Backend (Golang)

```bash
cd backend
go mod tidy
go run cmd/main.go
```

Server backend berjalan di `http://localhost:8080`.

| Endpoint | Method | Fungsi |
|---|---|---|
| `/reports` | POST | Buat laporan baru (multipart: photo, latitude, longitude, description) |
| `/reports` | GET | Ambil semua laporan (filter: `?species=` atau `?risk=`) |
| `/stats` | GET | Statistik laporan per risk level |
| `/ping` | GET | Health check |

### 4. Menjalankan Frontend

*(Dalam pengembangan)*

## AI Model

- **Arsitektur**: EfficientNet-B0 (transfer learning dari ImageNet)
- **Training**: 2-phase — frozen backbone → full fine-tuning
- **Dataset**: 2.700 gambar dari iNaturalist (CC-licensed, research grade)
- **9 Spesies yang dikenali**:

| Spesies | Nama Latin | Status IUCN |
|---|---|---|
| 🦧 Orangutan Kalimantan | *Pongo pygmaeus* | Critically Endangered |
| 🐒 Bekantan | *Nasalis larvatus* | Endangered |
| 🐻 Beruang Madu | *Helarctos malayanus* | Vulnerable |
| 🐵 Owa Kalimantan | *Hylobates muelleri* | Endangered |
| 🦅 Rangkong | *Bucerotidae* | Varies |
| 🐘 Gajah Kalimantan | *Elephas maximus borneensis* | Endangered |
| 🦏 Badak | *Dicerorhinus sumatrensis* | Critically Endangered |
| 🐢 Penyu | *Chelonioidea* | Varies |
| 🐆 Macan Dahan | *Neofelis diardi* | Vulnerable |

## Contoh Request

```bash
# Prediksi AI langsung
curl -X POST -F "image=@foto_satwa.jpg" http://localhost:5000/predict

# Buat laporan via backend (otomatis prediksi AI)
curl -X POST \
  -F "photo=@foto_satwa.jpg" \
  -F "latitude=-1.0" \
  -F "longitude=116.8" \
  -F "description=Terlihat orangutan di dekat jalan proyek" \
  http://localhost:8080/reports
```

## Tim

**OWA JEMSI** — © 2025 IKN, Kalimantan Timur