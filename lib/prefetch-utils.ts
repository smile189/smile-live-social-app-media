// lib/prefetch-utils.ts
import { Post } from "./ml-algorithm";

export const prefetchVideos = (posts: Post[], limit: number = 10) => {
  // 1. Verificăm dacă suntem pe client (browser)
  if (typeof document === "undefined") return;

  // 2. Curățăm link-urile de prefetch vechi (opțional, pentru a elibera RAM)
  // Dacă utilizatorul a dat scroll mult, nu mai are sens să ținem link-urile de la început
  const oldLinks = document.querySelectorAll('link[data-smile-prefetch="true"]');
  if (oldLinks.length > 20) {
    oldLinks.forEach(link => link.remove());
  }

  // 3. Luăm URL-urile deja existente într-un Set pentru viteză
  const existingLinks = new Set(
    Array.from(document.querySelectorAll('link[rel="prefetch"]'))
      .map(link => (link as HTMLLinkElement).href)
  );

  // 4. Luăm primele X postări (care sunt deja sortate după Algoritmul ML)
  posts.slice(0, limit).forEach((post) => {
    // Verificăm dacă e video și dacă nu e deja în cache/head
    if (post.video_url && post.type === "video" && !existingLinks.has(post.video_url)) {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "video";
      link.href = post.video_url;
      
      // Atribute pentru management și debug
      link.setAttribute('data-prefetch-id', post.id);
      link.setAttribute('data-smile-prefetch', 'true');
      link.setAttribute('data-ml-score', post.viral_score?.toFixed(2) || "0");

      document.head.appendChild(link);
    }
  });
};
