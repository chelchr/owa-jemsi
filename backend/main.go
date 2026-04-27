package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 1. Struct untuk nangkep data dari Frontend (Rian)
type LaporanMasuk struct {
	Nama      string  `json:"nama"`
	Satwa     string  `json:"satwa"`
	Deskripsi string  `json:"deskripsi"`
	Lat       float64 `json:"lat"`
	Long      float64 `json:"long"`
}

// 2. Struct untuk dikirim ke Google Sheets
type PayloadSheets struct {
	Nama      string `json:"nama"`
	Satwa     string `json:"satwa"`
	Deskripsi string `json:"deskripsi"`
	MapsLink  string `json:"maps_link"`
}

func main() {
	r := gin.Default()

	r.POST("/api/lapor", func(c *gin.Context) {
		var req LaporanMasuk

		// FE -> JSON
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Format data salah"})
			return
		}

		// Link Gmaps
		linkGmaps := fmt.Sprintf("https://www.google.com/maps?q=%f,%f", req.Lat, req.Long)

		// Database Owa Jemsi
		dataKeSheets := PayloadSheets{
			Nama:      req.Nama,
			Satwa:     req.Satwa,
			Deskripsi: req.Deskripsi,
			MapsLink:  linkGmaps,
		}

		// Ubah jadi format JSON
		jsonData, _ := json.Marshal(dataKeSheets)

		// TARUH URL DARI GOOGLE APPS
		urlWebhookSheets := "https://script.google.com/macros/s/AKfycbw-ruCz6GSWHTLxAe-jLc6ZYThhV1J4T1aijMCnsxt-DQ1bXoK7cxVAW3DfCsPv1iw8/exec"

		// Tembak HTTP POST ke Google Sheets
		resp, err := http.Post(urlWebhookSheets, "application/json", bytes.NewBuffer(jsonData))

		// Cek apakah internet/jaringan Golang bermasalah
		if err != nil {
			fmt.Println("Error Jaringan:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengirim ke Google"})
			return
		}
		defer resp.Body.Close()

		// Cek apakah Google Sheets nolak datanya
		if resp.StatusCode != 200 && resp.StatusCode != 302 {
			fmt.Printf("Google Sheets Nolak! Status Code: %d\n", resp.StatusCode)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan ke database"})
			return
		}
		defer resp.Body.Close()

		// mock WA (boongan)
		fmt.Printf("\n[Whatsapp] Mengirim pesan ke Pak Heru: 'Ada laporan %s dari %s! Lokasi: %s'\n", req.Satwa, req.Nama, linkGmaps)

		// -> FE
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"pesan":  "Laporan Owa Jemsi berhasil diamankan!",
		})
	})

	r.Run(":8080")
}
