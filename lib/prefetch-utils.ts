/**
 * prefetch-utils.ts - Utility for intelligent video prefetching in Smile Live App
 * This module provides a function to prefetch videos based on their viral score, optimizing user experience by reducing load times for high-priority content.
 * authored by BM
 */

// lib/prefetch-utils.ts
import { Post } from "./ml-algorithm";

export const prefetchVideos = async (posts: Post[], limit: number = 10) => {
  // 1. Verify is on client side
  if (typeof document === "undefined") return;

  // 2. Clean DDRAM 
  const oldLinks = document.querySelectorAll('link[data-smile-prefetch="true"]');
  if (oldLinks.length > 15) {
    oldLinks.forEach(link => link.remove());
  }

  // 3. Verify of duplicat elinks to avoid redundant prefetching
  const existingLinks = new Set(
    Array.from(document.querySelectorAll('link[rel="prefetch"]'))
      .map(link => (link as HTMLLinkElement).href)
  );

  // 4. Take post targets based on viral score, limit to top N
  const targets = posts.slice(0, limit);

  for (let i = 0; i < targets.length; i++) {
    const post = targets[i];

    if (post.video_url && post.type === "video" && !existingLinks.has(post.video_url)) {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "video";
      link.href = post.video_url;
      
      link.setAttribute('data-prefetch-id', post.id);
      link.setAttribute('data-smile-prefetch', 'true');
      link.setAttribute('data-ml-score', post.viral_score?.toFixed(2) || "0");
      link.setAttribute('data-load-order', i.toString());

      document.head.appendChild(link);

      // -
      // Primele first 2 videos was prefetched immediately, rest with a delay to avoid network congestion
      if (i >= 2) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }
};
