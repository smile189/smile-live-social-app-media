// lib/ml-algorithm.ts

export interface Post {
  id: string;
  created_at: string;
  likes?: any[] | { count: number };
  comments?: any[] | { count: number };
  metadata?: { views?: number };
  views?: number;
  profiles?: { is_live: boolean };
  is_live?: boolean;
  is_follower?: boolean;
  interest_score?: number;
  [key: string]: any;
}

export const calculateViralScore = (post: Post): number => {
  // 1. EXTRACTIE CIFRE REALE DIN STRUCTURA SUPABASE (Mapping Automat)
  // Dacă likes este array (select('likes(id)')), numărăm elementele. 
  // Dacă este obiect (select('likes(count)')), luăm .count
  const likesCount = Array.isArray(post.likes) 
    ? post.likes.length 
    : (typeof post.likes === 'object' ? (post.likes as any).count : 0);

  const commentsCount = Array.isArray(post.comments) 
    ? post.comments.length 
    : (typeof post.comments === 'object' ? (post.comments as any).count : 0);

  const views = Number(post.views || post.metadata?.views || 0);
  const isLive = post.profiles?.is_live || post.is_live || false;

  // 2. CONSTANTE (Din .env sau Fallback)
  const alpha = Number(process.env.NEXT_PUBLIC_ML_ALPHA) || 4;
  const beta = Number(process.env.NEXT_PUBLIC_ML_BETA) || 2;
  const gamma = Number(process.env.NEXT_PUBLIC_ML_GAMMA) || 1.5;
  const delta = Number(process.env.NEXT_PUBLIC_ML_DELTA) || 2;
  const epsilon = Number(process.env.NEXT_PUBLIC_ML_EPSILON) || 1;
  const zeta = 3; // Coeficient fix pentru Freshness (0-60 min)

  // 3. LOGICA TEMPORALĂ
  const now = new Date().getTime();
  const createdDate = new Date(post.created_at).getTime();
  const hoursOld = (now - createdDate) / 3600000;

  // 4. COMPONENTE SCOR
  // Engagement Rate (evităm împărțirea la 0)
  const engagement = (likesCount + commentsCount) / (views + 1);
  
  // Decay Temporal (scade relevanța în timp)
  const decay = 1 / Math.pow(Math.max(hoursOld, 0) + 1, 1.5);

  // Freshness Boost (Explozie în prima oră)
  const freshnessBoost = hoursOld < 1 ? Math.exp(-hoursOld) : 0;

  // 5. ECUAȚIA FINALĂ SMILE
  const finalScore = (
    (alpha * engagement) + 
    (beta * (post.is_follower ? 1 : 0)) + 
    (gamma * (post.interest_score || 0.5)) + 
    (delta * (isLive ? 1 : 0)) + 
    (epsilon * decay) +
    (zeta * freshnessBoost)
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
