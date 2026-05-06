package main

import (
	"log"

	"github.com/ImYiz/wildlife-backend/internal/config"
	"github.com/ImYiz/wildlife-backend/internal/handler"
	"github.com/ImYiz/wildlife-backend/internal/model"
	"github.com/ImYiz/wildlife-backend/internal/repository"
	"github.com/ImYiz/wildlife-backend/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found (skip)")
	}

	db := config.ConnectDB()

	if err := db.AutoMigrate(&model.Report{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Init AI client (connects to Python AI service)
	aiClient := service.NewAIClient()
	if err := aiClient.HealthCheck(); err != nil {
		log.Printf("⚠️  AI service not available: %v", err)
		log.Println("   Reports will use user-provided species (fallback mode)")
	} else {
		log.Println("✅ AI service connected at", aiClient.BaseURL)
	}

	reportRepo := &repository.ReportRepository{DB: db}
	reportService := &service.ReportService{Repo: reportRepo, AIClient: aiClient}
	reportHandler := &handler.ReportHandler{Service: reportService}

	r := gin.Default()
	r.Use(cors.Default())

	r.Static("/uploads", "./uploads")

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	r.POST("/reports", reportHandler.CreateReport)
	r.GET("/reports", reportHandler.GetReports)
	r.GET("/stats", reportHandler.GetStats)

	log.Println("Server running on http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
