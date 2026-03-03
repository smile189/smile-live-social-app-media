// lib/prefetch-utils.ts

export const prefetchVideos = (posts: any[], limit: number = 5) => {
  if (typeof document === "undefined") return;

  posts.slice(0, limit).forEach((post) => {
    if (post.video_url && !document.querySelector(`link[href="${post.video_url}"]`)) {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "video";
      link.href = post.video_url;
      document.head.appendChild(link);
    }
  });
};
