"use client";

import { useEffect, useState, useRef, useMemo, memo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import SidebarActions from "@/components/ActionButton";
import BottomNav from "@/components/BottomNav";
import { Play } from "lucide-react";
import { sortPostsByViralScore } from "@/lib/ml-algorithm";
import { prefetchVideos } from "@/lib/prefetch-utils";

// Singleton client - previne erorile de instanțiere multiplă în Turbopack
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MediaRenderer = memo(({ post, isActive, isNear }: { post: any; isActive: boolean; isNear: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPausedManually, setIsPausedManually] = useState(false);

  useEffect(() => {
    if (!isActive) setIsPausedManually(false);
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;
    let frameId: number;
    const sync = () => {
      if (video.duration) setProgress((video.currentTime / video.duration) * 100);
      frameId = requestAnimationFrame(sync);
    };
    frameId = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frameId);
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMedia = async () => {
      if (isActive && !isPausedManually) {
        try {
          if (playPromiseRef.current) await playPromiseRef.current.catch(() => {});
          playPromiseRef.current = video.play();
          await playPromiseRef.current;
        } catch (e) {}
      } else {
        if (playPromiseRef.current) await playPromiseRef.current.catch(() => {});
        video.pause();
        if (!isNear) {
          video.src = ""; 
          video.load();
        }
      }
    };
    handleMedia();
  }, [isActive, isNear, isPausedManually]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPausedManually(false);
    } else {
      video.pause();
      setIsPausedManually(true);
    }
  };

  const safeSrc = useMemo(() => {
    if (!post.video_url || (!isActive && !isNear)) return null;
    return `${post.video_url}?v=${post.id.slice(0, 5)}`;
  }, [post.video_url, post.id, isActive, isNear]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden transform-gpu cursor-pointer" onClick={togglePlay}>
      {safeSrc ? (
        <video
          ref={videoRef}
          src={safeSrc}
          className="h-full w-full object-cover will-change-transform scale-[1.001]"
          loop playsInline muted={!isActive} preload={isActive ? "auto" : "metadata"}
        />
      ) : (
        <div className="w-full h-full bg-black flex items-center justify-center">
           {post.thumbnail_url && <img src={post.thumbnail_url} className="w-full h-full object-cover opacity-40 blur-sm" alt="" />}
        </div>
      )}
      {isPausedManually && isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-black/40 p-5 rounded-full backdrop-blur-sm">
            <Play size={40} className="text-white fill-white ml-1" />
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/10 z-50">
        <div className="h-full bg-yellow-400 origin-left" style={{ transform: `scaleX(${progress / 100})`, transition: 'transform 0.1s linear' }} />
      </div>
    </div>
  );
});

MediaRenderer.displayName = "MediaRenderer";

export default function AppPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchFeed() {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(`*, profiles(*), likes(id), comments(count)`)
          .limit(30)
          .abortSignal(controller.signal);

        if (isMounted && !error && data) {
          const sorted = sortPostsByViralScore(data);
          setPosts(sorted);
          if (sorted.length > 0) setActivePostId(sorted[0].id);
          prefetchVideos(sorted, 5);
        }
      } catch (err: any) {
        // Ignorăm erorile de abort în consolă pentru a menține log-urile curate
        if (err.name !== 'AbortError' && isMounted) console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchFeed();
    return () => {
      isMounted = false;
      controller.abort(); // Oprește cererea imediat ce componenta se descarcă
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find(e => e.isIntersecting && e.intersectionRatio > 0.5);
        if (visible) setActivePostId(visible.target.getAttribute("data-id"));
      },
      { threshold: 0.6 }
    );
    containerRef.current?.querySelectorAll("section").forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [posts]);

  const activeIndex = useMemo(() => posts.findIndex(p => p.id === activePostId), [posts, activePostId]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-yellow-400 font-black text-2xl italic animate-pulse">SMILE</div>;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none touch-none overscroll-none">
      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {posts.map((post, index) => (
          <section key={post.id} data-id={post.id} className="h-full w-full snap-start snap-always relative flex flex-col justify-end">
            <div className="absolute inset-0 z-0">
               <MediaRenderer post={post} isActive={activePostId === post.id} isNear={Math.abs(index - activeIndex) <= 2} />
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
            </div>
            <div className="relative z-10 w-full p-6 pb-24 md:pb-32 flex justify-between items-end pointer-events-none">
                <div className="max-w-[75%] space-y-3 pointer-events-auto">
                    <div className="flex items-center gap-2">
                       <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/20 overflow-hidden shadow-lg">
                          {post.profiles?.avatar_url && <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />}
                       </div>
                       <p className="text-white font-bold drop-shadow-md">@{post.profiles?.username || 'user'}</p>
                    </div>
                    <h2 className="text-white text-sm md:text-lg font-normal drop-shadow-md line-clamp-3 leading-snug">{post.caption}</h2>
                </div>
                <div className="pointer-events-auto">
                   <SidebarActions post={post} />
                </div>
            </div>
          </section>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
