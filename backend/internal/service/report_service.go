package service

import (
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"path/filepath"

	"github.com/ImYiz/wildlife-backend/internal/model"
	"github.com/ImYiz/wildlife-backend/internal/repository"
)

type ReportService struct {
	Repo     *repository.ReportRepository
	AIClient *AIClient
}

func NewReportService(repo *repository.ReportRepository, aiClient *AIClient) *ReportService {
	return &ReportService{Repo: repo, AIClient: aiClient}
}

// CREATE REPORT — dengan prediksi AI
func (s *ReportService) Create(report model.Report, photoFile multipart.File, photoHeader *multipart.FileHeader) (model.Report, error) {

	// Baca file bytes untuk dikirim ke AI service
	imageData, err := io.ReadAll(photoFile)
	if err != nil {
		return report, fmt.Errorf("failed to read photo file: %w", err)
	}

	filename := filepath.Base(photoHeader.Filename)

	// Panggil AI service untuk prediksi
	prediction, err := s.AIClient.Predict(imageData, filename)
	if err != nil {
		// Jika AI service gagal, log error tapi tetap simpan report
		// Gunakan data dari user (fallback)
		log.Printf("⚠️  AI prediction failed: %v — using user input", err)
		report.PredictionSource = "user"
	} else {
		// Gunakan hasil AI
		report.Species = prediction.Species
		report.AIConfidence = prediction.Confidence
		report.RiskLevel = prediction.RiskLevel
		report.PredictionSource = "ai"

		log.Printf("✅ AI prediction: %s (%.1f%%) — risk: %s",
			prediction.SpeciesLabel, prediction.Confidence*100, prediction.RiskLevel)
	}

	return s.Repo.Create(report)
}

// =======================
// GET REPORTS (FILTER)
// =======================
func (s *ReportService) GetReports(species string, risk string) ([]model.Report, error) {

	if species != "" {
		return s.Repo.GetBySpecies(species)
	}

	if risk != "" {
		return s.Repo.GetByRisk(risk)
	}

	return s.Repo.GetAll()
}

// GET STATS
func (s *ReportService) GetStats() (map[string]int64, error) {

	tinggi, err := s.Repo.CountByRisk("tinggi")
	if err != nil {
		return nil, err
	}

	sedang, err := s.Repo.CountByRisk("sedang")
	if err != nil {
		return nil, err
	}

	rendah, err := s.Repo.CountByRisk("rendah")
	if err != nil {
		return nil, err
	}

	return map[string]int64{
		"tinggi": tinggi,
		"sedang": sedang,
		"rendah": rendah,
		"total":  tinggi + sedang + rendah,
	}, nil
}
