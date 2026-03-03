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
  const alpha = 4;   // Engagement
  const beta = 2;    // Follower
  const gamma = 1.5; // Interest
  const delta = 2;   // Live
  const epsilon = 1; // Decay

  const now = new Date().getTime();
  
  // 1. Engagement Rate
  const engagement = (Number(post.likes_count || 0) + Number(post.comments_count || 0)) / (Number(post.views || 0) + 1);
  
  // 2. Decay Temporal (Ore)
  const createdDate = new Date(post.created_at).getTime();
  const hoursOld = (now - createdDate) / 3600000;
  const decay = 1 / Math.pow(Math.max(hoursOld, 0) + 1, 1.5);

  // Ecuația SMILE
  return (
    (alpha * engagement) + 
    (beta * (post.is_follower ? 1 : 0)) + 
    (gamma * (post.interest_score || 0.5)) + 
    (delta * (post.is_live ? 1 : 0)) + 
    (epsilon * decay)
  );
};

export const sortPostsByViralScore = (posts: Post[]): Post[] => {
  return posts
    .map(post => ({ ...post, viral_score: calculateViralScore(post) }))
    .sort((a, b) => (b.viral_score || 0) - (a.viral_score || 0));
};
