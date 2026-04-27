package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// 1. mock GET
	r.GET("/api/satwa", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"data":   []string{"Orangutan", "Beruang Madu", "Bekantan"},
			"pesan":  "nabil ganteng anjay",
		})
	})

	// 2. mock POST
	r.POST("/api/lapor", func(c *gin.Context) {
		c.JSON(http.StatusCreated, gin.H{
			"status": "success",
			"pesan":  "Laporansatwa berhasil diterima sistem HERU",
		})
	})

	r.Run(":8080")
}
