package repository

import (
	"github.com/ImYiz/wildlife-backend/internal/model"
	"gorm.io/gorm"
)

type ReportRepository struct {
	DB *gorm.DB
}

func NewReportRepository(db *gorm.DB) *ReportRepository {
	return &ReportRepository{DB: db}
}

// CREATE
func (r *ReportRepository) Create(report model.Report) (model.Report, error) {
	err := r.DB.Create(&report).Error
	return report, err
}

// GET ALL
func (r *ReportRepository) GetAll() ([]model.Report, error) {
	var reports []model.Report

	err := r.DB.
		Order("created_at desc").
		Find(&reports).Error

	return reports, err
}

// GET BY ID (optional)
func (r *ReportRepository) GetByID(id uint) (model.Report, error) {
	var report model.Report

	err := r.DB.First(&report, id).Error

	return report, err
}

// FILTER BY SPECIES
func (r *ReportRepository) GetBySpecies(species string) ([]model.Report, error) {
	var reports []model.Report

	err := r.DB.
		Where("species = ?", species).
		Order("created_at desc").
		Find(&reports).Error

	return reports, err
}

// FILTER BY RISK LEVEL
func (r *ReportRepository) GetByRisk(risk string) ([]model.Report, error) {
	var reports []model.Report

	err := r.DB.
		Where("risk_level = ?", risk).
		Order("created_at desc").
		Find(&reports).Error

	return reports, err
}

// COUNT BY RISK (UNTUK STATS)
func (r *ReportRepository) CountByRisk(risk string) (int64, error) {
	var count int64

	err := r.DB.
		Model(&model.Report{}).
		Where("risk_level = ?", risk).
		Count(&count).Error

	return count, err
}
