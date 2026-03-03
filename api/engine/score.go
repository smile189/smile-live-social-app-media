package engine

import (
	"math"
	"os"
	"strconv"
)

func getMLParam(key string, fallback float64) float64 {
	val, err := strconv.ParseFloat(os.Getenv(key), 64)
	if err != nil { return fallback }
	return val
}

// Implementarea Ecuației: S = α * ((Likes + Comments) / (Views + 1)) + β * FollowBoost + γ * InterestMatch + δ * LiveBoost + ε * DecayTemporal
func CalculateAdvancedScore(likes, comments, views int, isFollower, isLive bool, interestScore float64, hoursOld float64) float64 {
	// 1. Preluăm coeficienții din .env
	alpha   := getMLParam("ML_ALPHA", 4.0)   // Ponderea Engagement Rate
	beta    := getMLParam("ML_BETA", 2.0)    // Ponderea Follower Status
	gamma   := getMLParam("ML_GAMMA", 1.5)   // Ponderea Interest Match
	delta   := getMLParam("ML_DELTA", 2.0)   // Ponderea Live Status
	epsilon := getMLParam("ML_EPSILON", 1.0) // Ponderea Decay Temporal

	// 2. Calculăm Componentele Ecuației
	
	// Engagement Rate (Likes + Comments / Views)
	// Adăugăm +1 la Views pentru a evita împărțirea la zero
	engagementRate := float64(likes + comments) / float64(views + 1)
	term1 := alpha * engagementRate

	// Follow Boost (Dacă userul urmărește creatorul, primește un boost fix)
	followBoost := 0.0
	if isFollower { followBoost = 1.0 }
	term2 := beta * followBoost

	// Interest Match (Scor de relevanță AI/CLIP deja calculat anterior)
	term3 := gamma * interestScore

	// Live Boost (Prioritate maximă dacă e Live)
	liveBoost := 0.0
	if isLive { liveBoost = 1.0 }
	term4 := delta * liveBoost

	// Decay Temporal (ε * 1 / (Timp^1.5))
	// Folosim o funcție inversă pentru ca postările noi să aibă scor mare
	decayValue := 1.0 / math.Pow(hoursOld + 1, 1.5)
	term5 := epsilon * decayValue

	// S = Suma tuturor termenilor
	finalScore := term1 + term2 + term3 + term4 + term5

	return finalScore
}
