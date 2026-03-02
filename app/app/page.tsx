"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import SidebarActions from "@/components/ActionButton";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import { Volume2, VolumeX, AlertCircle, Play } from "lucide-react";

function MediaRenderer({ post, isActive }: { post: any; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [error, setError] = useState(false);

  // Gestionare Autoplay la scroll
  useEffect(() => {
    if (post.type === "video" && videoRef.current) {
      if (isActive) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            console.log("Autoplay blocked");
            setIsPlaying(false);
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive, post.type]);

  // Funcție Toggle Play/Pause la click
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

  if (post.type === "video" && post.video_url && !error) {
    return (
      <div className="relative w-full h-full bg-black cursor-pointer" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={post.video_url}
          className="w-full h-full object-cover"
          loop
          playsInline
          muted={isMuted}
          onError={() => setError(true)}
        />
        
        {/* Overlay vizual pentru PAUSE */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="p-5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 animate-in zoom-in duration-200">
              <Play size={40} className="fill-white text-white ml-1" />
            </div>
          </div>
        )}

        {/* Buton MUTE */}
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            setIsMuted(!isMuted); 
          }}
          className="absolute bottom-44 right-6 z-50 p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 active:scale-90 transition-transform"
        >
          {isMuted ? <VolumeX size={20} className="text-yellow-500" /> : <Volume2 size={20} className="text-white" />}
        </button>
      </div>
    );
  }

  const imageUrl = post.thumbnail_url || post.video_url;
  
  if (imageUrl) {
    return (
      <div className="w-full h-full bg-zinc-900">
        <img 
          src={imageUrl} 
          className="w-full h-full object-cover" 
          alt="Post Content"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-700">
      <AlertCircle size={40} className="mb-2 opacity-20" />
      <span className="text-[10px] uppercase tracking-widest font-black">No Signal Detected</span>
    </div>
  );
}

export default function AppPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )).current;

  useEffect(() => {
    const fetchFeed = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, profiles(*)`)
        .order("created_at", { ascending: false });
        
      if (!error && data) {
        setPosts(data);
        if (data.length > 0) setActivePostId(data[0].id);
      }
      setLoading(false);
    };
    fetchFeed();
  }, [supabase]);

  const containerRef = useRef<HTMLDivElement>(null);

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
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-yellow-400 font-black text-2xl animate-pulse tracking-[0.5em] italic uppercase">Smile Live</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans">
      <TopNav />

      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
      >
        {posts.map((post) => (
          <section 
            key={post.id} 
            data-id={post.id}
            className="h-full w-full snap-start snap-always relative flex flex-col justify-end"
          >
            <div className="absolute inset-0 z-0">
               <MediaRenderer post={post} isActive={activePostId === post.id} />
               <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none" />
            </div>

            <div className="z-10 p-8 pb-44 max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 text-black text-[9px] font-black uppercase tracking-wider mb-4">
                 <div className="h-1 w-1 rounded-full bg-black animate-ping" /> Live Uplink
              </div>
              <h2 className="text-white text-2xl font-black uppercase tracking-tighter leading-tight">
                {post.caption}
              </h2>
              <p className="mt-2 text-yellow-400/90 text-xs font-bold uppercase tracking-widest">
                @{post.profiles?.username || 'user'}
              </p>
            </div>
          </section>
        ))}
      </div>

      <SidebarActions post={posts.find(p => p.id === activePostId)} />
      <BottomNav />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
