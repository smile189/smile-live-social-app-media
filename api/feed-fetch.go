package handler

import (
	"encoding/json"
	"net/http"
	"time"
    // Importă pachetul engine (ajustează calea dacă e necesar)
	"://github.com" 
)

// Structura pentru a simula datele din Supabase (ajusteaz-o conform bazei tale)
type Post map[string]interface{}

func Handler(w http.ResponseWriter, r *http.Request) {
	// 1. Aici ar trebui să ai logica de fetch din Supabase (posts)
	// Presupunem că variabila `posts` este rezultatul de la Supabase
	var posts []Post 

	// 2. Logica de calcul a scorului viral (Mutată în interiorul funcției)
	for i := range posts {
		likes := getInt(posts[i]["likes_count"])
		views := getInt(posts[i]["views"])
		comments := getInt(posts[i]["comments_count"])
		
		isLive, _ := posts[i]["is_live"].(bool)

		createdAtStr, _ := posts[i]["created_at"].(string)
		createdAt, _ := time.Parse(time.RFC3339, createdAtStr)
		hoursOld := time.Since(createdAt).Hours()

		// Apelăm funcția din engine
		posts[i]["viral_score"] = engine.CalculateAdvancedScore(
			likes, 
			comments, 
			views, 
			false,   // isFollower
			isLive, 
			0.5,     // interestScore
			hoursOld,
		)
	}

	
	// 3. Răspunsul API
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

// Funcție utilitară pentru conversie sigură
func getInt(v interface{}) int {
	if v == nil { return 0 }
	switch i := v.(type) {
	case float64: return int(i)
	case int: return i
	default: return 0
	}
}
