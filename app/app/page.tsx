"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import SidebarActions from "@/components/ActionButton";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import { AlertCircle, Play } from "lucide-react";

// --- IMPORTURI DIN LIB ---
import { sortPostsByViralScore } from "@/lib/ml-algorithm";
import { prefetchVideos } from "@/lib/prefetch-utils";

// --- RENDERER MEDIA OPTIMIZAT ---
function MediaRenderer({ post, isActive, isNear }: { post: any; isActive: boolean; isNear: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;
    const updateProgress = () => {
      if (video.duration) setProgress((video.currentTime / video.duration) * 100);
    };
    video.addEventListener("timeupdate", updateProgress);
    return () => video.removeEventListener("timeupdate", updateProgress);
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || post.type !== "video") return;

    if (isActive) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      if (!isNear) {
        video.removeAttribute('src'); 
        video.load();
      } else {
        video.currentTime = 0;
      }
      setIsPlaying(false);
    }
  }, [isActive, isNear, post.type]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  if (post.type === "video" && !error && (isActive || isNear)) {
    return (
      <div className="relative w-full h-full flex justify-center items-center bg-black overflow-hidden transform-gpu" onClick={togglePlay}>
        <video
          ref={videoRef}
          key={post.id}
          src={post.video_url || undefined}
          className="h-full w-full md:w-auto md:aspect-[9/16] object-cover transform-gpu scale-[1.005]"
          loop
          playsInline
          muted={!isActive}
          preload="auto"
          onError={() => setError(true)}
        />
        <div className="absolute bottom-0 left-0 right-0 flex justify-center z-50">
           <div className="w-full md:w-[calc(100vh*(9/16))] h-[1.5px] bg-white/10">
              <div className="h-full bg-yellow-400 shadow-[0_0_8px_#facc15]" style={{ width: `${progress}%` }} />
           </div>
        </div>
        {!isPlaying && isActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Play size={60} className="fill-white/30 text-white/50 animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  const imageUrl = post.thumbnail_url || post.video_url;
  if (imageUrl) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-black">
        <img src={imageUrl} className="h-full w-full md:w-auto md:aspect-[9/16] object-cover transform-gpu" alt="Media" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-black"><AlertCircle size={30} className="text-zinc-800" /></div>
  );
}

// --- APP PAGE ---
export default function AppPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )).current;

  // --- FETCH & ML LOGIC ---
  useEffect(() => {
    const fetchFeed = async () => {
      // 1. Fetch date brute
      const { data } = await supabase
        .from("posts")
        .select(`*, profiles(*)`)
        .limit(50);

      if (data) {
        // 2. Aplicăm ALGORITMUL ML (Importat din lib/ml-algorithm.ts)
        const sorted = sortPostsByViralScore(data);
        
        setPosts(sorted);
        if (sorted.length > 0) setActivePostId(sorted[0].id);
        
        // 3. PREFETCH (Importat din lib/prefetch-utils.ts)
        prefetchVideos(sorted, 5);
      }
      setLoading(false);
    };
    fetchFeed();
  }, [supabase]);

  const containerRef = useRef<HTMLDivElement>(null);

  // --- INTERSECTION OBSERVER ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            if (id) setActivePostId(id);
          }
        });
      },
      { threshold: 0.6 }
    );
    const sections = containerRef.current?.querySelectorAll("section");
    sections?.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [posts]);

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center text-yellow-400 font-black text-3xl animate-pulse italic uppercase tracking-[0.2em]">Smile</div>
  );

  const activePost = posts.find(p => p.id === activePostId);
  const activeIndex = posts.findIndex(p => p.id === activePostId);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans select-none">
      <TopNav />
      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ scrollBehavior: 'auto' }}
      >
        {posts.map((post, index) => (
          <section 
            key={post.id} 
            data-id={post.id}
            className="h-full w-full snap-start snap-always relative flex flex-col justify-end overflow-hidden"
          >
            <div className="absolute inset-0 z-0">
               <MediaRenderer 
                  post={post} 
                  isActive={activePostId === post.id} 
                  // Încărcăm clipul curent + următoarele 2 pentru scroll fluid
                  isNear={index >= activeIndex && index <= activeIndex + 2}
               />
               <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90 pointer-events-none" />
            </div>

            <div className="z-10 p-6 pb-20 md:pb-28 max-w-[80%] pointer-events-none ml-0 md:ml-10">
              <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-yellow-400 text-black text-[9px] font-black uppercase mb-3 shadow-lg">
                 <div className="h-1 w-1 rounded-full bg-black animate-ping" /> Uplink Active
              </div>
              <h2 className="text-white text-xl md:text-3xl font-black uppercase tracking-tighter leading-tight drop-shadow-2xl line-clamp-2">
                {post.caption}
              </h2>
              <p className="mt-1 text-yellow-400 text-xs font-bold uppercase tracking-tighter">
                @{post.profiles?.username}
              </p>
            </div>
          </section>
        ))}
      </div>
      <div className="fixed right-3 bottom-16 md:bottom-24 z-50 pointer-events-auto transform scale-85 md:scale-100 origin-bottom-right">
         <SidebarActions post={activePost} />
      </div>
      <BottomNav />
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
