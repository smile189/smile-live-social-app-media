package engine

import (
	"fmt"
	"math"
	"net/http"
	"os"
	"strconv"
)

// Handler adăugat pentru a satisface cerințele Vercel Serverless Functions
func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	fmt.Fprintf(w, "Engine Score Module is active. Use CalculateAdvancedScore internally.")
}

func getMLParam(key string, fallback float64) float64 {
	val, err := strconv.ParseFloat(os.Getenv(key), 64)
	if err != nil {
		return fallback
	}
	return val
}

// CalculateAdvancedScore rămâne neschimbată pentru a fi apelată din feed-fetch.go
func CalculateAdvancedScore(likes, comments, views int, isFollower, isLive bool, interestScore float64, hoursOld float64) float64 {
	// 1. Preluăm coeficienții din environment conform Vercel Docs
	alpha := getMLParam("ML_ALPHA", 4.0)
	beta := getMLParam("ML_BETA", 2.0)
	gamma := getMLParam("ML_GAMMA", 1.5)
	delta := getMLParam("ML_DELTA", 2.0)
	epsilon := getMLParam("ML_EPSILON", 1.0)

	// 2. Calculăm Componentele Ecuației
	engagementRate := float64(likes+comments) / float64(views+1)
	term1 := alpha * engagementRate

	followBoost := 0.0
	if isFollower {
		followBoost = 1.0
	}
	term2 := beta * followBoost

	term3 := gamma * interestScore

	liveBoost := 0.0
	if isLive {
		liveBoost = 1.0
	}
	term4 := delta * liveBoost

	decayValue := 1.0 / math.Pow(hoursOld+1, 1.5)
	term5 := epsilon * decayValue

	return term1 + term2 + term3 + term4 + term5
}
