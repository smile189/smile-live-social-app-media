package handler

import (
	"encoding/json"
	"net/http"
	"time"
	"://github.com"
)

// Definim structura pentru a evita erorile de tip
type Post map[string]interface{}

func Handler(w http.ResponseWriter, r *http.Request) {
	// Aici ar trebui să fie logica ta de preluare a datelor (ex: din Supabase)
	// Momentan inițializăm o listă goală pentru a permite build-ul
	var posts []Post 

	for i := range posts {
		likes := getInt(posts[i]["likes_count"])
		views := getInt(posts[i]["views"])
		comments := 0 
		
		isLive, _ := posts[i]["is_live"].(bool)

		createdAtStr, _ := posts[i]["created_at"].(string)
		createdAt, _ := time.Parse(time.RFC3339, createdAtStr)
		hoursOld := time.Since(createdAt).Hours()

		// Apelăm motorul de calcul
		posts[i]["viral_score"] = engine.CalculateAdvancedScore(
			likes, 
			comments, 
			views, 
			false, 
			isLive, 
			0.5, 
			hoursOld,
		)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

// Funcție utilitară pentru a converti datele din interfață în int
func getInt(v interface{}) int {
	if v == nil { return 0 }
	switch i := v.(type) {
	case float64: return int(i)
	case int: return i
	default: return 0
	}
}
