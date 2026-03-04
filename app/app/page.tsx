"use client";

import { useEffect, useState, useRef, useMemo, memo, useCallback } from "react";
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
    <header className="fixed top-0 left-0 w-full z-50 flex justify-center pt-8 pointer-events-none text-white">
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
    else { 
      v.pause(); 
      if (!isNear) v.src = ""; 
    }
  }, [isActive, isNear, isPaused]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isActive) return;
    const sync = () => {
      if (v.duration) onProgress((v.currentTime / v.duration) * 100);
    };
    v.addEventListener("timeupdate", sync);
    return () => v.removeEventListener("timeupdate", sync);
  }, [isActive, onProgress]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black pointer-events-auto" onClick={() => setIsPaused(!isPaused)}>
      <div className="absolute top-28 left-8 z-50 pointer-events-none select-none">
        <span className="text-white/40 font-black italic tracking-tighter text-2xl uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          smile
        </span>
      </div>

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

// --- FEED CONTENT: COMPONENTA PRINCIPALĂ ---
export default function FeedContent() {
  const [activeTab, setActiveTab] = useState("foryou");
  const [posts, setPosts] = useState<Post[]>([]);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState<{ active: boolean; title: string; msg: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

  // --- LOGICA DE MENTENANȚĂ (BLOCK REVISION) ---
  useEffect(() => {
    const checkMaintenance = async () => {
      const { data } = await supabase
        .from("system_control")
        .select("is_maintenance_web, maintenance_title, maintenance_message")
        .eq("id", 1)
        .single();

      if (data?.is_maintenance_web) {
        setMaintenance({ active: true, title: data.maintenance_title, msg: data.maintenance_message });
      }
    };

    checkMaintenance();

    const channel = supabase
      .channel('maintenance_sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_control' }, (payload) => {
        if (payload.new.id === 1) {
          setMaintenance(payload.new.is_maintenance_web ? {
            active: true,
            title: payload.new.maintenance_title,
            msg: payload.new.maintenance_message
          } : null);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadContent = useCallback(async (isInitial = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    
    const from = isInitial ? 0 : posts.length;
    const { data: { user } } = await supabase.auth.getUser();

    let dataToSort: any[] = [];

    try {
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
      else {
        let query = supabase.from("posts").select(`*, profiles!inner(*), likes(id), comments(count)`);
        if (activeTab === "live") query = query.eq('profiles.is_live', true);
        const { data } = await query.range(from, from + 9);
        dataToSort = data || [];
      }

      if (dataToSort.length > 0) {
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

  // --- ECRAN MENTENANȚĂ ---
  if (maintenance?.active) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 text-center">
        
        <h1 className="text-3xl font-black text-yellow-400 uppercase italic mb-2 tracking-tighter">
          {maintenance.title || "Revizie Tehnică"}
        </h1>
        <p className="text-white/60 max-w-sm font-medium">
          {maintenance.msg || "Revenim imediat cu noutăți pe Smile!"}
        </p>
      </div>
    );
  }

  // --- ECRAN LOADING INITIAL ---
  if (loading && posts.length === 0) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-yellow-400 font-black text-2xl italic animate-pulse uppercase tracking-[0.2em]">Smile</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none flex flex-col items-center">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div ref={containerRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10">
        {posts.map((post, index) => (
          <section key={post.id} data-id={post.id} className="h-full w-full snap-start snap-always relative flex justify-center bg-zinc-950">
            <div className="relative h-full w-full md:max-w-[calc(100vh*9/16)] bg-black overflow-hidden">
                <MediaRenderer 
                  post={post} 
                  isActive={activePostId === post.id} 
                  isNear={Math.abs(index - activeIndex) <= 2} 
                  onProgress={setGlobalProgress} 
                />
                <SidebarActions post={post} />
                
                {activePostId === post.id && (
                  <div className="absolute bottom-0 left-0 h-[2px] bg-yellow-400 transition-all duration-100 z-50" style={{ width: `${globalProgress}%` }} />
                )}
            </div>
          </section>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
