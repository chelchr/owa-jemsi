package model

import "time"

type Report struct {
	ID uint `gorm:"primaryKey" json:"id"`

	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`

	Species   string `json:"species"`
	RiskLevel string `json:"risk_level"`

	Description string `json:"description"`
	PhotoURL    string `json:"photo_url"`

	AIConfidence     float64 `json:"ai_confidence"`
	PredictionSource string  `json:"prediction_source"` // ai atau user, tergantung confidence treshold

	CreatedAt time.Time `json:"created_at"`
}
