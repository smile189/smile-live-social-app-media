package handler



import (
	"encoding/json"
	"net/http"
	"time"
	// CORECT: Fără protocoale web, doar calea pachetului
	"://github.com"
)

// Handler este punctul de intrare pentru Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
	// Aici ar veni logica de fetch (ex: posts := supabase.Fetch())
	var posts []map[string]interface{}

	for i := range posts {
		likes := getInt(posts[i]["likes_count"])
		views := getInt(posts[i]["views"])
		comments := getInt(posts[i]["comments_count"])
		
		isLive, _ := posts[i]["is_live"].(bool)

		createdAtStr, _ := posts[i]["created_at"].(string)
		createdAt, _ := time.Parse(time.RFC3339, createdAtStr)
		hoursOld := time.Since(createdAt).Hours()

		// Calculăm scorul folosind pachetul engine
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

// getInt transformă datele din interfață în numere întregi
func getInt(v interface{}) int {
	if v == nil { return 0 }
	switch i := v.(type) {
	case float64: return int(i)
	case int: return i
	default: return 0
	}
}
