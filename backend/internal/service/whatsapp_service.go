package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/ImYiz/wildlife-backend/internal/model"
)

type WhatsAppService struct {
	BaseURL string // URL lokal server Baileys (misal: http://localhost:3000)
	Target  string // Nomor target penerima (misal: "081234567890")
}

func NewWhatsAppService() *WhatsAppService {
	url := os.Getenv("WHATSAPP_BAILEYS_URL")
	if url == "" {
		url = "http://localhost:3000"
	}
	return &WhatsAppService{
		BaseURL: url,
		Target:  os.Getenv("WHATSAPP_TARGET_NUMBER"),
	}
}

// SendNotificationBaileys mengirim pesan menggunakan lokal server Baileys
func (s *WhatsAppService) SendNotificationBaileys(report model.Report) error {
	if s.Target == "" {
		log.Println("⚠️  WhatsApp target number missing, skipping notification")
		return nil
	}

	// Format pesan yang akan dikirim
	message := fmt.Sprintf(
		"🚨 *Notifikasi Satwa Masuk* 🚨\n\n"+
			"*Spesies:* %s\n"+
			"*Tingkat Risiko:* %s\n"+
			"*Deskripsi:* %s\n\n"+
			"*Lokasi:* https://maps.google.com/?q=%f,%f\n"+
			"*Sumber:* %s (Confidence: %.1f%%)",
		report.Species, report.RiskLevel, report.Description,
		report.Latitude, report.Longitude,
		report.PredictionSource, report.AIConfidence*100,
	)

	// Format payload untuk Fonnte
	payload := map[string]interface{}{
		"target": s.Target,
		"message": message,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal json payload: %w", err)
	}

	req, err := http.NewRequest("POST", s.BaseURL+"/send", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send whatsapp request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("provider returned status: %d", resp.StatusCode)
	}

	log.Println("✅ WhatsApp notification sent successfully to", s.Target)
	return nil
}
