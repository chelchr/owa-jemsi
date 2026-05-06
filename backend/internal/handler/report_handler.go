package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ImYiz/wildlife-backend/internal/model"
	"github.com/ImYiz/wildlife-backend/internal/service"
	"github.com/ImYiz/wildlife-backend/internal/utils"
)

type ReportHandler struct {
	Service *service.ReportService
}

func NewReportHandler(service *service.ReportService) *ReportHandler {
	return &ReportHandler{Service: service}
}

// CREATE REPORT
func (h *ReportHandler) CreateReport(c *gin.Context) {
	// ambil file
	file, err := c.FormFile("photo")
	if err != nil {
		c.JSON(400, gin.H{"error": "photo is required"})
		return
	}

	// simpan file
	path, err := utils.SaveFile(c, file)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// ambil field lain
	latitude := c.PostForm("latitude")
	longitude := c.PostForm("longitude")
	species := c.PostForm("species")
	risk := c.PostForm("risk_level")
	description := c.PostForm("description")

	// convert ke model
	report := model.Report{
		PhotoURL:    path,
		Species:     species,
		RiskLevel:   risk,
		Description: description,
	}

	// convert lat lng (optional kalau mau strict)
	fmt.Sscan(latitude, &report.Latitude)
	fmt.Sscan(longitude, &report.Longitude)

	result, err := h.Service.Create(report)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, result)
}

// GET REPORTS
func (h *ReportHandler) GetReports(c *gin.Context) {
	species := c.Query("species")
	risk := c.Query("risk")

	data, err := h.Service.GetReports(species, risk)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, data)
}

// GET STATS
func (h *ReportHandler) GetStats(c *gin.Context) {
	stats, err := h.Service.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, stats)
}
