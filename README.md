# 🐒 Owa Jemsi

**Owa Jemsi (Help Response Unit)** adalah platform pelaporan satwa liar interaktif. Aplikasi ini dibangun untuk memfasilitasi pelaporan perjumpaan satwa liar dengan dukungan kecerdasan buatan (AI) untuk klasifikasi spesies dan notifikasi instan berbasis WhatsApp.

---

## 🏗️ Arsitektur Proyek

Proyek ini menggunakan arsitektur *microservices* yang terbagi menjadi 4 layanan:
1. **Frontend**: Next.js (React), Tailwind CSS, React Leaflet.
2. **Backend**: Go (Gin Framework), GORM, PostgreSQL.
3. **AI Service**: Python (Flask, PyTorch) untuk *Computer Vision*.
4. **WhatsApp Bot**: Node.js (Baileys) untuk pengiriman notifikasi pesan otomatis.

---

## ⚙️ Prasyarat (*Prerequisites*)

Sebelum menjalankan aplikasi, pastikan komputer Anda telah terinstal:
- [Node.js](https://nodejs.org/) (v18 atau lebih baru)
- [Go](https://go.dev/) (v1.20 atau lebih baru)
- [Python](https://www.python.org/) (v3.9 atau lebih baru)
- [PostgreSQL](https://www.postgresql.org/)

---

## 🚀 Panduan Menjalankan Secara Lokal

Karena proyek ini terdiri dari beberapa *service*, Anda perlu membuka **4 jendela terminal yang berbeda** untuk menjalankan setiap layanannya secara bersamaan.

### 1. Persiapan Database
Pastikan server PostgreSQL Anda berjalan. Buatlah *database* baru dengan nama `owa_jemsi` (atau sesuaikan dengan konfigurasi `.env` backend Anda).

### 2. Menjalankan Backend (Go)
Backend menangani penyimpanan laporan dan API komunikasi.

```bash
cd backend
# Salin konfigurasi environment
cp .env.example .env
# Sesuaikan isi .env (seperti DB_PASS, DB_USER, dll) menggunakan text editor

# Unduh dependensi dan jalankan server
go mod tidy
go run cmd/main.go
```
✅ *Backend akan berjalan di `http://localhost:8080`*

### 3. Menjalankan AI Service (Python)
Service ini menerima gambar dari Backend untuk memprediksi jenis satwa.

```bash
cd ai
# Aktifkan virtual environment (Contoh untuk Windows)
.venv\Scripts\activate 

# (Opsional) Jika belum pernah install dependensi
pip install -r requirements.txt

# Jalankan server AI
python inference_api.py
```
✅ *AI Service akan berjalan di `http://localhost:5000`*

### 4. Menjalankan WhatsApp Bot (Node.js)
Service ini merespons laporan masuk dengan meneruskannya sebagai pesan WhatsApp.

```bash
cd whatsapp-bot
# (Opsional) Jika belum pernah install dependensi
npm install

# Jalankan bot
node index.js
```
✅ *Saat dijalankan, terminal akan menampilkan **QR Code**. Buka WhatsApp di HP Anda > Perangkat Tertaut > Tautkan Perangkat, lalu scan QR Code tersebut.* 
*Service berjalan secara lokal di `http://localhost:3000`*

### 5. Menjalankan Frontend (Next.js)
Ini adalah antarmuka web yang akan diakses oleh *user*.

```bash
cd frontend
# (Opsional) Jika belum pernah install dependensi
npm install

# Jalankan server web
npm run dev
```
✅ *Buka browser dan akses URL yang tertera di terminal (Biasanya `http://localhost:3001` jika port 3000 sudah dipakai oleh WhatsApp Bot).*

---

## 💡 Troubleshooting
- **Error Failed to fetch di Web**: Pastikan Backend Go sudah berjalan (`http://localhost:8080`).
- **AI Service tidak menyala**: Pastikan Anda telah mengaktifkan *virtual environment* Python sebelum menjalankan `inference_api.py`.
- **Notifikasi WA tidak masuk**: Pastikan target nomor di file `backend/.env` bagian `WHATSAPP_TARGET_NUMBER` sudah menggunakan format yang benar (misal: `08123...`) dan file `index.js` di bot WA dalam keadaan menyala.

---
*Dibuat untuk kelestarian alam dan satwa IKN.* 🌿