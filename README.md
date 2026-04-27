README.md
# OWA JEMSI (Jaringan Edukasi dan Mitigasi Satwa IKN)
Proyek ini adalah solusi narahubung interaktif untuk pelaporan satwa liar di kawasan IKN, mengusung arsitektur ringan untuk area dengan sinyal minim.

## Struktur Direktori
- `/backend`: RESTful API menggunakan Golang.
- `/frontend`: Antarmuka web pengguna.
- `/docs`: Dokumen SRS.

## Cara Menjalankan Secara Lokal (Local Run)
### 1. Menjalankan Backend (Golang)
Pastikan Go sudah terinstal di sistem Anda.
1. Buka terminal dan masuk ke direktori backend: `cd backend`
2. Unduh dependensi: `go mod tidy`
3. Jalankan server: `go run main.go`
Server backend akan berjalan di `http://localhost:8080`.

### 2. Menjalankan Frontend
(Tambahkan instruksi spesifik jika menggunakan framework tertentu seperti npm run dev)