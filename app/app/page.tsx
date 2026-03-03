"use client";

import { useEffect, useState, useRef, useMemo, memo, useCallback, Suspense } from "react";
import { createBrowserClient } from "@supabase/ssr";
import SidebarActions from "@/components/ActionButton";
import BottomNav from "@/components/BottomNav";
import { Play, Sparkles, Users, Radio } from "lucide-react";
import { sortPostsByViralScore, Post } from "@/lib/ml-algorithm";
import { prefetchVideos } from "@/lib/prefetch-utils";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- TOPNAV: NAVIGARE ÎNTRE FILTRELE ALGORITMULUI ---
const TopNav = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) => {
  const tabs = [
    { id: "friends", label: "Friends", icon: <Users size={14} /> },
    { id: "foryou", label: "For You", icon: <Sparkles size={14} /> },
    { id: "live", label: "Live", icon: <Radio size={14} /> }
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-center pt-8 pointer-events-none">
      <nav className="flex items-center bg-black/40 backdrop-blur-2xl p-1 rounded-[22px] border border-white/10 pointer-events-auto shadow-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-[18px] transition-all duration-300 ${
              activeTab === tab.id ? "bg-white text-black scale-105 shadow-xl" : "text-white/40 hover:text-white"
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
};

// --- MEDIA RENDERER: MOTORUL VIDEO ---
const MediaRenderer = memo(({ post, isActive, isNear, onProgress }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive && !isPaused) v.play().catch(() => {});
    else { v.pause(); if (!isNear) v.src = ""; }
  }, [isActive, isNear, isPaused]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isActive) return;
    const sync = () => onProgress((v.currentTime / v.duration) * 100);
    v.addEventListener("timeupdate", sync);
    return () => v.removeEventListener("timeupdate", sync);
  }, [isActive, onProgress]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black pointer-events-auto" onClick={() => setIsPaused(!isPaused)}>
      {(isActive || isNear) && (
        <video
          ref={videoRef}
          src={post.video_url}
          className="h-full w-auto max-w-full object-contain transform-gpu"
          loop playsInline muted={!isActive}
        />
      )}
      {isPaused && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-10">
          <div className="p-5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl">
            <Play size={40} className="text-white fill-white opacity-80 ml-1" />
          </div>
        </div>
      )}
    </div>
  );
});

MediaRenderer.displayName = "MediaRenderer";

// --- FEED CONTENT: LOGICA DE FILTRARE ȘI ALGORITM ---
function FeedContent() {
  const [activeTab, setActiveTab] = useState("foryou");
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
    const { data: { user } } = await supabase.auth.getUser();

    let dataToSort: any[] = [];

    try {
      // 1. LOGICA PENTRU FRIENDS (Folosind tabelul follows)
      if (activeTab === "friends") {
        if (!user) {
          setPosts([]); 
          setLoading(false);
          isFetching.current = false;
          return;
        }

        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        const followingIds = follows?.map(f => f.following_id) || [];

        if (followingIds.length > 0) {
          const { data } = await supabase
            .from("posts")
            .select(`*, profiles!inner(*), likes(id), comments(count)`)
            .in('user_id', followingIds)
            .range(from, from + 9);
          dataToSort = data || [];
        }
      } 
      // 2. LOGICA PENTRU LIVE SAU FOR YOU
      else {
        let query = supabase.from("posts").select(`*, profiles!inner(*), likes(id), comments(count)`);
        
        if (activeTab === "live") {
          query = query.eq('profiles.is_live', true);
        }

        const { data } = await query.range(from, from + 9);
        dataToSort = data || [];
      }

      if (dataToSort.length > 0) {
        // Aplicăm algoritmul tău de sortare
        const sorted = sortPostsByViralScore(dataToSort as Post[]);
        setPosts(prev => isInitial ? sorted : [...prev, ...sorted]);
        if (isInitial && sorted.length > 0) {
          setActivePostId(sorted[0].id);
          prefetchVideos(sorted, 3);
        }
      } else if (isInitial) {
        setPosts([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }

    setLoading(false);
    isFetching.current = false;
  }, [posts.length, activeTab]);

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    loadContent(true);
  }, [activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          const id = entry.target.getAttribute("data-id");
          if (id) {
            setActivePostId(id);
            const idx = posts.findIndex(p => p.id === id);
            if (idx !== -1 && idx >= posts.length - 4) loadContent();
          }
        }
      });
    }, { threshold: 0.6 });
    
    const sections = containerRef.current?.querySelectorAll("section");
    sections?.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [posts, loadContent]);

  const activeIndex = useMemo(() => posts.findIndex(p => p.id === activePostId), [posts, activePostId]);

  if (loading && posts.length === 0) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-yellow-400 font-black text-2xl italic animate-pulse uppercase tracking-[0.2em]">Smile</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none flex flex-col items-center">
      
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div ref={containerRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10" style={{ WebkitOverflowScrolling: 'touch' }}>
        {posts.length > 0 ? posts.map((post, index) => (
          <section key={post.id} data-id={post.id} className="h-full w-full snap-start relative flex justify-center bg-zinc-950">
            <div className="relative h-full w-full md:max-w-[calc(100vh*9/16)] bg-black overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                
                <div className="absolute inset-0 z-0">
                  <MediaRenderer 
                    post={post} 
                    isActive={activePostId === post.id} 
                    isNear={Math.abs(index - activeIndex) <= 2} 
                    onProgress={setGlobalProgress} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />
                </div>

                <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 pb-32 pointer-events-none">
                    <div className="flex justify-between items-end w-full">
                        <div className="max-w-[80%] space-y-4 pointer-events-auto transform-gpu">
                            <div className="flex items-center gap-3">
                               <div className="w-12 h-12 rounded-full border-2 border-white/10 p-0.5 shadow-2xl overflow-hidden bg-zinc-800">
                                  <img src={post.profiles?.avatar_url || `https://api.dicebear.com{post.profiles?.username}`} className="w-full h-full rounded-full object-cover" />
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-white font-black text-base italic tracking-tighter drop-shadow-md">@{post.profiles?.username}</span>
                                  {activeTab === 'foryou' && <span className="text-[9px] text-yellow-400 font-bold tracking-widest uppercase">Viral Score: {Math.round(post.viral_score || 0)}</span>}
                               </div>
                            </div>
                            <h2 className="text-white text-sm font-medium leading-snug line-clamp-2 drop-shadow-lg">{post.caption}</h2>
                        </div>
                        <div className="pointer-events-auto mb-2"><SidebarActions post={post} /></div>
                    </div>
                </div>
            </div>
          </section>
        )) : (
          <div className="h-full flex flex-col items-center justify-center text-white/20 px-10 text-center">
            <p className="font-black italic uppercase text-xl">No content here yet</p>
            <p className="text-xs mt-2 uppercase tracking-widest leading-relaxed">Follow more creators to see their posts in this feed.</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-[72px] z-40 w-full md:max-w-[calc(100vh*9/16)] h-[2px] bg-white/5 overflow-hidden">
        <div 
          className="h-full bg-yellow-400 shadow-[0_0_15px_#facc15] transition-all duration-150 ease-linear" 
          style={{ width: `${globalProgress}%` }} 
        />
      </div>

      <BottomNav />
    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black" />}>
      <FeedContent />
    </Suspense>
  );
}
