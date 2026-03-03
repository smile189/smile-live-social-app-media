"use client";

import { useEffect, useState, useRef, useMemo, memo, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import SidebarActions from "@/components/ActionButton";
import BottomNav from "@/components/BottomNav";
import { Play } from "lucide-react";
import { sortPostsByViralScore, Post } from "@/lib/ml-algorithm";
import { prefetchVideos } from "@/lib/prefetch-utils";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MediaRenderer = memo(({ post, isActive, isNear, onProgress }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const [isPausedManually, setIsPausedManually] = useState(false);

  useEffect(() => { if (!isActive) setIsPausedManually(false); }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;
    let frameId: number;
    const sync = () => {
      if (video.duration) onProgress((video.currentTime / video.duration) * 100);
      frameId = requestAnimationFrame(sync);
    };
    frameId = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frameId);
  }, [isActive, onProgress]);

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
        if (!isNear) { video.src = ""; video.load(); }
      }
    };
    handleMedia();
  }, [isActive, isNear, isPausedManually]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.paused ? (v.play(), setIsPausedManually(false)) : (v.pause(), setIsPausedManually(true));
  };

  const safeSrc = useMemo(() => 
    (post.video_url && (isActive || isNear)) ? `${post.video_url}?v=${post.id.slice(0, 5)}#t=0.001` : null
  , [post.video_url, post.id, isActive, isNear]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden pointer-events-auto" onClick={togglePlay}>
      {safeSrc && (
        <video
          ref={videoRef}
          src={safeSrc}
          className="h-full w-auto max-w-full object-contain transform-gpu"
          loop playsInline muted={!isActive} preload={isActive ? "auto" : "metadata"}
        />
      )}
      {isPausedManually && isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-black/40 p-5 rounded-full backdrop-blur-md">
            <Play size={40} className="text-white fill-white ml-1" />
          </div>
        </div>
      )}
    </div>
  );
});

MediaRenderer.displayName = "MediaRenderer";

export default function AppPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

  const loadContent = useCallback(async (isInitial = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    const from = isInitial ? 0 : posts.length;
    const { data } = await supabase.from("posts").select(`*, profiles(*), likes(id), comments(count)` ).range(from, from + 9);
    if (data) {
      const sorted = sortPostsByViralScore(data as Post[]);
      setPosts(prev => isInitial ? sorted : [...prev, ...sorted]);
      if (isInitial && sorted.length > 0) {
          setActivePostId(sorted[0].id);
          prefetchVideos(sorted, 5);
      }
    }
    setLoading(false);
    isFetching.current = false;
  }, [posts.length]);

  useEffect(() => { loadContent(true); }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const id = entry.target.getAttribute("data-id");
            if (id) {
              setActivePostId(id);
              const idx = posts.findIndex(p => p.id === id);
              if (idx >= posts.length - 4) loadContent();
            }
          }
        });
      }, { threshold: 0.6 });
    containerRef.current?.querySelectorAll("section").forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [posts, loadContent]);

  const activeIndex = useMemo(() => posts.findIndex(p => p.id === activePostId), [posts, activePostId]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-yellow-400 font-black text-2xl italic animate-pulse">SMILE</div>;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none touch-none overscroll-none flex flex-col items-center">
      
      <div ref={containerRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10" style={{ WebkitOverflowScrolling: 'touch' }}>
        {posts.map((post, index) => (
          <section key={post.id} data-id={post.id} className="h-full w-full snap-start snap-always relative flex justify-center bg-zinc-950">
            <div className="relative h-full w-full md:max-w-[calc(100vh*9/16)] bg-black overflow-hidden">
                
                {/* Fundal Video */}
                <div className="absolute inset-0 z-0">
                  <MediaRenderer post={post} isActive={activePostId === post.id} isNear={Math.abs(index - activeIndex) <= 2} onProgress={setGlobalProgress} />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
                </div>

                {/* UI Overlay - SIDEBAR ȘI INFO */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-5 pb-24 md:pb-32 pointer-events-none">
                    <div className="flex justify-between items-end w-full">
                        {/* Info Autor/Caption */}
                        <div className="max-w-[75%] space-y-3 pointer-events-auto transform-gpu">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/20 overflow-hidden shadow-xl">
                                  <img src={post.profiles?.avatar_url} alt="" className="w-full h-full object-cover" />
                               </div>
                               <p className="text-white font-bold text-base drop-shadow-md">@{post.profiles?.username}</p>
                            </div>
                            <h2 className="text-white text-sm md:text-base font-medium line-clamp-2 leading-snug drop-shadow-lg">{post.caption}</h2>
                        </div>

                        {/* BUTOANE SIDEBAR - Acum interactivitatea e forțată aici */}
                        <div className="pointer-events-auto z-30 mb-2">
                           <SidebarActions post={post} />
                        </div>
                    </div>
                </div>
            </div>
          </section>
        ))}
      </div>

      {/* BARA DE PROGRES - Fixată global peste tot, dar la un Z-index care nu blochează butoanele */}
      <div className="fixed bottom-[72px] z-40 pointer-events-none w-full md:max-w-[calc(100vh*9/16)] h-[2.5px] bg-white/10 overflow-hidden">
        <div 
          className="h-full bg-yellow-400 shadow-[0_0_15px_#facc15] will-change-transform transform-gpu origin-left" 
          style={{ transform: `scaleX(${globalProgress / 100})`, transition: 'transform 100ms linear' }} 
        />
      </div>

      <BottomNav />
    </div>
  );
}
