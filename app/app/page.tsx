/*
base code feed with user search ..V2 powered by BM 2026
*/

"use client";

import { useEffect, useState, useRef, useMemo, memo, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import SidebarActions from "@/components/ActionButton";
import BottomNav from "@/components/BottomNav";
import { Play, Sparkles, Users, Radio, Music, Search, X , Info} from "lucide-react";
import { sortPostsByViralScore, Post } from "@/lib/ml-algorithm";
import { prefetchVideos } from "@/lib/prefetch-utils";
import { useRouter } from "next/navigation";
import PolicyOverlay from "@/components/PolicySmile";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- SEARCH MODAL: CĂUTARE UTILIZATORI ---
const UserSearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Căutare în username
        const { data: usernameResults, error: error1 } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, bio, role")
          .ilike("username", `%${searchQuery}%`)
          .limit(10);

        // Căutare în full_name
        const { data: nameResults, error: error2 } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, bio, role")
          .ilike("full_name", `%${searchQuery}%`)
          .limit(10);

        if (error1 || error2) {
          console.error("Search error:", error1 || error2);
          setSearchResults([]);
        } else {
          // Combină rezultatele și elimină duplicatele
          const combined = [...(usernameResults || []), ...(nameResults || [])];
          const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
          
          console.log("Search results:", unique);
          setSearchResults(unique.slice(0, 10));
        }
      } catch (err) {
        console.error("Search catch error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleUserClick = (username: string) => {
    router.push(`app/profile/${username}`);
    onClose();
    setSearchQuery("");
    setSearchResults([]);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-zinc-900/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Searching users..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isSearching && (
            <div className="p-8 text-center text-white/40">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-purple-500"></div>
            </div>
          )}

          {!isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
            <div className="p-8 text-center text-white/40">
              No user find!
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="divide-y divide-white/5">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user.username)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar_url || "/default-avatar.png"}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                    />
                    {/* Badge pentru role special (admin, verified, etc) */}
                    {user.role && user.role !== "user" && (
                      <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white truncate">
                        @{user.username}
                      </h3>
                    </div>
                    {user.full_name && (
                      <p className="text-sm text-white/60 truncate">
                        {user.full_name}
                      </p>
                    )}
                    {user.bio && (
                      <p className="text-xs text-white/40 truncate mt-0.5">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery.trim().length < 2 && (
            <div className="p-8 text-center text-white/40 text-sm">
              Enter at least 2 characters to search for users.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- TOPNAV: NAVIGARE ÎNTRE FILTRELE ALGORITMULUI + SEARCH BUTTON ---
const TopNav = ({ activeTab, onTabChange, onSearchClick }: { 
  activeTab: string; 
  onTabChange: (id: string) => void;
  onSearchClick: () => void;
}) => {
  const tabs = [
    { id: "friends", label: "Friends", icon: <Users size={14} /> },
    { id: "foryou", label: "For You", icon: <Sparkles size={14} /> },
    { id: "live", label: "Live", icon: <Radio size={14} /> }
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-start pt-8 px-4 pointer-events-none text-white">
      {/* Search Button - Left Side */}
      <button
        onClick={onSearchClick}
        className="pointer-events-auto bg-black/40 backdrop-blur-2xl p-3 rounded-full border border-white/10 shadow-2xl hover:bg-white/10 hover:scale-105 transition-all duration-300"
        aria-label="Search users"
      >
        <Search size={20} className="text-white" />
      </button>

{/* Center Nav */}
<nav className="flex items-center bg-black/40 backdrop-blur-2xl p-1 rounded-[22px] border border-white/10 pointer-events-auto shadow-2xl">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => onTabChange(tab.id)}
      className={`relative flex items-center gap-2 px-6 py-2.5 rounded-[18px] transition-all duration-300 ${
        activeTab === tab.id ? "bg-white text-black scale-105 shadow-xl" : "text-white/40 hover:text-white"
      }`}
    >
      {/* ADAUGĂ ASTA: Randează iconița și schimbă-i culoarea în funcție de tab-ul activ */}
      <span className={`${activeTab === tab.id ? "text-pink-500" : "text-white/40"}`}>
        {tab.icon}
      </span>
      
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
    </button>
  ))}
</nav>


      {/* Spacer for symmetry */}
      <div className="w-12"></div>
    </header>
  );
};

// --- MEDIA RENDERER: MOTORUL VIDEO ---
const MediaRenderer = memo(({ post, isActive, isNear, onProgress }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();

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

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.profiles?.username) {
      router.push(`/profile/${post.profiles.username}`); //searching onto user from DB 
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black pointer-events-auto" onClick={() => setIsPaused(!isPaused)}>
      <div className="absolute top-28 left-8 z-50 pointer-events-none select-none flex items-center gap-2">
        <img 
          src="/smile_rebrand-app.png" 
          alt="Smile Icon" 
          className="w-8 h-8 object-contain" 
        />
        <span className="bg-gradient-to-br from-[#8B5CF6] to-[#FACC15] bg-clip-text text-transparent font-black italic tracking-tighter text-2xl uppercase drop-shadow-sm">
          smile
        </span>
      </div>

      {/* --- OVERLAY INFO (STÂNGA JOS) --- */}
      <div className="absolute bottom-24 left-4 right-16 z-50 pointer-events-none drop-shadow-2xl">
        <div className="flex flex-col gap-1.5 text-white">
          <h3 
            onClick={handleUsernameClick}
            className="font-black text-base flex items-center gap-2 pointer-events-auto cursor-pointer hover:text-yellow-400 transition-colors"
          >
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

const [isPolicyOpen, setIsPolicyOpen] = useState(false);///1


  // --- LOGICA INCREMENTARE VIEWS (RPC) ---
  useEffect(() => {
    if (!activePostId) return;
    const timer = setTimeout(async () => {
      await supabase.rpc('increment_post_views', { post_id: activePostId });
    }, 2513); //2513 ms retention scroll
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
      is_promoted,
      promo_budget,
      agency_id,
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
      {/* 1. BUTONUL DE ACTIVARE (Exemplu: pus în colțul dreapta sus sub TopNav) */}
      <button 
        onClick={() => setIsPolicyOpen(true)}
        className="fixed top-24 right-4 z-50 p-2 bg-white/10 backdrop-blur-md rounded-full text-white/50 hover:text-white border border-white/10 transition-all"
        title="Politicile Smile"
      >
       <Info size={20} />
      </button>
      
      <TopNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onSearchClick={() => setIsSearchOpen(true)}
      />
      
      <UserSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
      
            {/* MODALUL DE POLITICI (Adăugat aici) */}
      <PolicyOverlay 
        isOpen={isPolicyOpen} 
        onClose={() => setIsPolicyOpen(false)} 
      />

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