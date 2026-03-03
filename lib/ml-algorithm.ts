// lib/ml-algorithm.ts

export interface Post {
  id: string;
  likes_count: number;
  comments_count: number;
  views: number;
  created_at: string;
  is_live: boolean;
  is_follower: boolean;
  interest_score?: number;
  [key: string]: any;
}

export const calculateViralScore = (post: Post): number => {
  // Preluăm valorile din .env (Next.js are nevoie de prefixul NEXT_PUBLIC_ pentru a fi citite în "use client")
  // Dacă nu sunt setate, folosim fallback-urile tale
  const alpha = Number(process.env.NEXT_PUBLIC_ML_ALPHA) || 4;
  const beta = Number(process.env.NEXT_PUBLIC_ML_BETA) || 2;
  const gamma = Number(process.env.NEXT_PUBLIC_ML_GAMMA) || 1.5;
  const delta = Number(process.env.NEXT_PUBLIC_ML_DELTA) || 2;
  const epsilon = Number(process.env.NEXT_PUBLIC_ML_EPSILON) || 1;
  const zeta = 3; // Coeficient fix pentru Freshness (0-60 min)

  const now = new Date().getTime();
  const createdDate = new Date(post.created_at).getTime();
  const hoursOld = (now - createdDate) / 3600000;

  // 1. Engagement Rate
  const engagement = (Number(post.likes_count || 0) + Number(post.comments_count || 0)) / (Number(post.views || 0) + 1);
  
  // 2. Decay Temporal (Efect lung: scade după ore/zile)
  const decay = 1 / Math.pow(Math.max(hoursOld, 0) + 1, 1.5);

  // 3. Freshness Boost (Efect scurt: "explodează" în prima oră)
  const freshnessBoost = hoursOld < 1 ? Math.exp(-hoursOld) : 0;

  // Ecuația Finală SMILE
  return (
    (alpha * engagement) + 
    (beta * (post.is_follower ? 1 : 0)) + 
    (gamma * (post.interest_score || 0.5)) + 
    (delta * (post.is_live ? 1 : 0)) + 
    (epsilon * decay) +
    (zeta * freshnessBoost)
  );
};

export const sortPostsByViralScore = (posts: Post[]): Post[] => {
  return posts
    .map(post => ({ ...post, viral_score: calculateViralScore(post) }))
    .sort((a, b) => (b.viral_score || 0) - (a.viral_score || 0));
};
