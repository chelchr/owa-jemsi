package utils

import (
	"fmt"
	"mime/multipart"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

func SaveFile(c *gin.Context, file *multipart.FileHeader) (string, error) {
	filename := filepath.Base(file.Filename)

	path := fmt.Sprintf("uploads/%s", filename)

	if err := c.SaveUploadedFile(file, path); err != nil {
		return "", err
	}

	return path, nil
}
