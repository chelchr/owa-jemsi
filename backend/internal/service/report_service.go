package service

import (
	"github.com/ImYiz/wildlife-backend/internal/model"
	"github.com/ImYiz/wildlife-backend/internal/repository"
)

type ReportService struct {
	Repo *repository.ReportRepository
}

func NewReportService(repo *repository.ReportRepository) *ReportService {
	return &ReportService{Repo: repo}
}

// CREATE REPORT
func (s *ReportService) Create(report model.Report) (model.Report, error) {

	// SIMULASI AI (NANTI NABIL GANTI PAKE API NYA)
	aiSpecies := "bekantan"
	aiConfidence := 0.7

	threshold := 0.8

	finalSpecies := report.Species
	source := "user"

	if aiConfidence >= threshold {
		finalSpecies = aiSpecies
		source = "ai"
	}

	// SET FINAL DATA
	report.Species = finalSpecies
	report.AIConfidence = aiConfidence
	report.PredictionSource = source

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
