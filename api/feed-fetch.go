/*
about : feed-fetch.go - Fetches posts from Supabase, calculates viral score, and returns sorted feed
author : BM 
*/
for i := range posts {
    // Extragem valorile din map-ul Supabase
    likes := int(getFloat(posts[i]["likes_count"]))
    views := int(getFloat(posts[i]["views"]))
    comments := 0 // Presupunem că ai o coloană comments_count
    
    // Verificăm dacă e Live (presupunem coloana is_live boolean)
    isLive := false
    if val, ok := posts[i]["is_live"].(bool); ok { isLive = val }

    createdAt, _ := time.Parse(time.RFC3339, posts[i]["created_at"].(string))
    hoursOld := time.Since(createdAt).Hours()

    // Apelăm ecuația ta
    posts[i]["viral_score"] = engine.CalculateAdvancedScore(
        likes, 
        comments, 
        views, 
        false,   // FollowBoost (aici ar veni logica de relație user-creator)
        isLive, 
        0.5,     // InterestMatch (aici ar veni output-ul de la CLIP)
        hoursOld,
    )
}
