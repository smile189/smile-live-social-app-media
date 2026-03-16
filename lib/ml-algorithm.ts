// lib/ml-algorithm.ts

export interface Post {
  id: string;
  created_at: string;
  likes?: any[] | { count: number };
  comments?: any[] | { count: number };
  views_count?: number;
  views?: number;
  metadata?: { views?: number };
  profiles?: { 
    is_live: boolean; 
    avatar_url?: string; 
    username?: string; 
  };
  is_live?: boolean;
  is_follower?: boolean;
  interest_score?: number;
  [key: string]: any;
}

export const calculateViralScore = (post: Post): number => {
  // 1. EXTRACTIE DATE (Mapping fix pentru Supabase)
  const likesCount = Array.isArray(post.likes) 
    ? post.likes.length 
    : (typeof post.likes === 'object' ? (post.likes as any).count : 0);

  const commentsCount = Array.isArray(post.comments) 
    ? post.comments.length 
    : (typeof post.comments === 'object' ? (post.comments as any).count : 0);

  const views = Number(post.views_count || post.views || post.metadata?.views || 0);
  const isLive = post.profiles?.is_live || post.is_live || false;

  // 2. CONSTANTE (Ponderi de forță - Citite din ENV sau Fallback-uri "agresive")
  const alpha = Number(process.env.NEXT_PUBLIC_ML_ALPHA) || 18;   // Quality (Engagement)
  const beta = Number(process.env.NEXT_PUBLIC_ML_BETA) || 8;     // Friends/Followers
  const gamma = Number(process.env.NEXT_PUBLIC_ML_GAMMA) || 12;   // Interest Match
  const delta = Number(process.env.NEXT_PUBLIC_ML_DELTA) || 25;   // Live Boost (REGE)
  const epsilon = Number(process.env.NEXT_PUBLIC_ML_EPSILON) || 5; // Decay/Stability
  const zeta = Number(process.env.NEXT_PUBLIC_ML_ZETA) || 15;    // Freshness (Explozie clipuri noi)

  // 3. LOGICA TEMPORALĂ
  const now = new Date().getTime();
  const createdDate = new Date(post.created_at).getTime();
  const hoursOld = Math.max(0, (now - createdDate) / 3600000);

  // A. Freshness Boost: Explozie în primele 3 ore
  const freshnessBoost = Math.exp(-hoursOld * 1.5); 

  // B. Time Decay: Gravitația (cum scade relevanța în timp după 24h)
  const decay = 1 / Math.pow(hoursOld + 2, 1.8);

  // 4. COMPONENTE SCOR (MATEMATICĂ TIKTOK)
  
  // Quality Ratio: Adăugăm +15 la numitor ca să nu favorizăm clipuri cu 1 view/1 like
  const qualityScore = (likesCount * 4 + commentsCount * 7) / (views + 15);

  // Popularity Boost: Vizualizările acum ajută! (Log10 pentru progresie naturală)
  const popularityBoost = Math.log10(views + 1) * 3;

  // 5. ECUAȚIA FINALĂ SMILE (V2 - "THE BEAST")
  const finalScore = (
    (alpha * qualityScore) + 
    (beta * (post.is_follower ? 1 : 0)) + 
    (gamma * (post.interest_score || 0.5)) + 
    (delta * (isLive ? 1 : 0)) + 
    (epsilon * decay) +
    (zeta * freshnessBoost) +
    popularityBoost
  );

  return isNaN(finalScore) ? 0 : finalScore;
};

export const sortPostsByViralScore = (posts: Post[]): Post[] => {
  return posts
    .map(post => ({ 
      ...post, 
      viral_score: calculateViralScore(post) 
    }))
    .sort((a, b) => (b.viral_score || 0) - (a.viral_score || 0));
};
