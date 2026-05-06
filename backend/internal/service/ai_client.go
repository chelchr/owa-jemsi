package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"time"
)

// PredictionResult menyimpan hasil prediksi dari AI service
type PredictionResult struct {
	Species      string            `json:"species"`
	SpeciesLabel string            `json:"species_label"`
	Confidence   float64           `json:"confidence"`
	RiskLevel    string            `json:"risk_level"`
	Top3         []PredictionEntry `json:"top3"`
}

// PredictionEntry menyimpan satu entry prediksi (top-3)
type PredictionEntry struct {
	Species    string  `json:"species"`
	Label      string  `json:"label"`
	Confidence float64 `json:"confidence"`
	RiskLevel  string  `json:"risk_level"`
}

// AIClient adalah HTTP client untuk berkomunikasi dengan Python AI service
type AIClient struct {
	BaseURL    string
	HTTPClient *http.Client
}

// NewAIClient membuat AIClient baru.
// URL diambil dari env AI_SERVICE_URL, default http://localhost:5000
func NewAIClient() *AIClient {
	baseURL := os.Getenv("AI_SERVICE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:5000"
	}

	return &AIClient{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second, // Timeout 30 detik untuk inference
		},
	}
}

// HealthCheck mengecek apakah AI service ready
func (c *AIClient) HealthCheck() error {
	resp, err := c.HTTPClient.Get(c.BaseURL + "/health")
	if err != nil {
		return fmt.Errorf("AI service not reachable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("AI service unhealthy, status: %d", resp.StatusCode)
	}

	return nil
}

// Predict mengirim gambar ke AI service dan mengembalikan hasil prediksi.
// imageData: raw bytes dari file gambar
// filename: nama file asli (untuk Content-Disposition)
func (c *AIClient) Predict(imageData []byte, filename string) (*PredictionResult, error) {
	// Buat multipart request body
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	part, err := writer.CreateFormFile("image", filename)
	if err != nil {
		return nil, fmt.Errorf("failed to create form file: %w", err)
	}

	if _, err := part.Write(imageData); err != nil {
		return nil, fmt.Errorf("failed to write image data: %w", err)
	}

	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("failed to close multipart writer: %w", err)
	}

	// Kirim request
	req, err := http.NewRequest("POST", c.BaseURL+"/predict", &buf)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call AI service: %w", err)
	}
	defer resp.Body.Close()

	// Baca response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI service error (status %d): %s", resp.StatusCode, string(body))
	}

	// Parse JSON response
	var result PredictionResult
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return &result, nil
}
