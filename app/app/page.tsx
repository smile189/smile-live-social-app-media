"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import SidebarActions from "@/components/ActionButton";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import { Volume2, VolumeX, AlertCircle, Play } from "lucide-react";

function MediaRenderer({ post, isActive }: { post: any; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Pornim direct cu sunet (false)
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    return () => video.removeEventListener("timeupdate", updateProgress);
  }, []);

  // Optimizare Autoplay - Accelerare Hardware
  useEffect(() => {
    if (post.type === "video" && videoRef.current) {
      if (isActive) {
        // load() ajută la fluidizarea tranziției pe unele browsere
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            console.log("Autoplay blocked - needs user interaction for sound");
            setIsPlaying(false);
          });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
        setProgress(0);
      }
    }
  }, [isActive, post.type]);

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
      <div className="relative w-full h-full bg-black cursor-pointer overflow-hidden" onClick={togglePlay}>
        <video
          ref={videoRef}
          key={post.id}
          src={post.video_url}
          className="w-full h-full object-cover transform-gpu"
          loop
          playsInline
          muted={isMuted}
          preload="metadata"
          onError={() => setError(true)}
        />
        
        {/* Progress Bar subtire */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/10 z-50">
          <div 
            className="h-full bg-yellow-400 shadow-[0_0_8px_#facc15]" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
            <Play size={50} className="fill-white/30 text-white/50 animate-pulse" />
          </div>
        )}

        {/* Buton MUTE - ramane pentru control manual */}
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            setIsMuted(!isMuted); 
          }}
          className="absolute bottom-44 right-6 z-50 p-4 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 active:scale-75 transition-all"
        >
          {isMuted ? <VolumeX size={22} className="text-yellow-500" /> : <Volume2 size={22} className="text-white" />}
        </button>
      </div>
    );
  }

  const imageUrl = post.thumbnail_url || post.video_url;
  if (imageUrl) {
    return (
      <div className="w-full h-full bg-zinc-900">
        <img src={imageUrl} className="w-full h-full object-cover" alt="Post" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950">
      <AlertCircle size={30} className="text-zinc-800 animate-pulse" />
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
      { threshold: 0.8 } // Prag ridicat pentru a evita randarea multipla
    );

    const sections = containerRef.current?.querySelectorAll("section");
    sections?.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, [posts]);

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-yellow-400 font-black text-2xl animate-pulse tracking-widest uppercase italic">Smile</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans select-none">
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
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
            </div>

            <div className="z-10 p-8 pb-44 max-w-xl pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 text-black text-[9px] font-black uppercase tracking-wider mb-4 shadow-lg">
                 <div className="h-1 w-1 rounded-full bg-black animate-ping" /> Uplink Active
              </div>
              <h2 className="text-white text-2xl font-black uppercase tracking-tighter leading-tight drop-shadow-2xl">
                {post.caption}
              </h2>
              <p className="mt-2 text-yellow-400 text-sm font-bold opacity-90 uppercase tracking-tighter">
                @{post.profiles?.username}
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
