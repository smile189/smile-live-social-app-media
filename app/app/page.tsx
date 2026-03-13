"use client";

import { useEffect, useState, useRef, useMemo, memo, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import SidebarActions from "@/components/ActionButton";
import BottomNav from "@/components/BottomNav";
import { Play, Sparkles, Users, Radio, Music } from "lucide-react";
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

      {/* --- ADAUGAT: OVERLAY INFO (STÂNGA JOS) --- */}
      <div className="absolute bottom-24 left-4 right-16 z-50 pointer-events-none drop-shadow-2xl">
        <div className="flex flex-col gap-1.5 text-white">
          <h3 className="font-black text-base flex items-center gap-2 pointer-events-auto cursor-pointer hover:text-yellow-400 transition-colors">
            @{post.profiles?.username || 'user'}
          </h3>
          <p className="text-sm font-medium leading-snug line-clamp-2 overflow-hidden max-w-[85%] pointer-events-auto">
            {post.description || post.caption || ""}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Music size={12} className="animate-[spin_4s_linear_infinite]" />
            <span className="text-[11px] font-bold tracking-wide truncate max-w-[180px]">
              Original Audio - {post.profiles?.username}
            </span>
          </div>
        </div>
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

  // --- LOGICA INCREMENTARE VIEWS (RPC) ---
  useEffect(() => {
    if (!activePostId) return;
    const timer = setTimeout(async () => {
      await supabase.rpc('increment_post_views', { post_id: activePostId });
    }, 2500);
    return () => clearTimeout(timer);
  }, [activePostId]);

  // --- LOGICA DE MENTENANȚĂ (PĂSTRATĂ INTEGRAL) ---
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

    // Query reparat pentru a aduce și datele comentariilor + views
    const queryStr = `
      *,
      profiles!inner(*),
      likes(id),
      views_count,
      comments(
        id,
        content,
        created_at,
        profiles(username, avatar_url)
      )
    `;

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
            .select(queryStr)
            .in('user_id', followingIds)
            .range(from, from + 9);
          dataToSort = data || [];
        }
      } 
      else {
        let query = supabase.from("posts").select(queryStr);
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

  if (maintenance?.active) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 text-center text-white">
        <h1 className="text-3xl font-black mb-4">{maintenance.title}</h1>
        <p className="opacity-70">{maintenance.msg}</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* SNAP MANDATORY: Forțează oprirea la fiecare video (one by one) */}
      <div 
        ref={containerRef} 
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
        style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {posts.map((post) => (
          <section 
            key={post.id} 
            data-id={post.id} 
            className="h-full w-full snap-start snap-always relative overflow-hidden"
          >
            <MediaRenderer 
              post={post} 
              isActive={activePostId === post.id} 
              isNear={true}
              onProgress={setGlobalProgress}
            />
            <SidebarActions post={post} />
          </section>
        ))}
      </div>

      <BottomNav activePostId={activePostId} progress={globalProgress} />
    </div>
  );
}
