
"use client";

import { useState, useRef } from "react";

type Post = {
  id: number;
  user: string;
  video: string;
  likes: number;
  comments: number;
  shares: number;
  description: string;
};

export default function Home() {
  const [posts] = useState<Post[]>([
    {
      id: 1,
      user: "SmileLiveOfficial",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      likes: 123,
      comments: 45,
      shares: 12,
      description: "Bun venit pe Smile Live! Experiență 4K cinematică. 🎬✨ #SmileYellow #Premium"
    },
    {
      id: 2,
      user: "Alexandra",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      likes: 98,
      comments: 30,
      shares: 7,
      description: "Golden hour vibes 🌇✨ #SmileLive #Sunset"
    },
    {
      id: 3,
      user: "BM",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      likes: 200,
      comments: 55,
      shares: 20,
      description: "Late night coding sessions. 😎💻 #DevLife #YellowPower"
    },
  ]);

  const [muted, setMuted] = useState(true);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative font-sans">
      
      {/* Feed principal */}
      <div className="h-screen w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth hide-scrollbar pb-20">
        {posts.map((post) => (
          <VideoCard key={post.id} post={post} muted={muted} />
        ))}
      </div>

      {/* Navigare Jos (Vibe Galben Neon) */}
      <nav className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-around px-6 z-50">
        <NavButton icon="⚡" label="Home" active />
        <NavButton icon="🔥" label="Trending" />
        <div className="relative -top-5">
          <button className="w-16 h-16 bg-yellow-400 rounded-full shadow-[0_0_25px_#facc15] flex items-center justify-center text-3xl font-bold text-black border-4 border-black hover:scale-110 transition-transform">
            <span>+</span>
          </button>
        </div>
        <NavButton icon="🌟" label="VIP" />
        <NavButton icon="👑" label="Profil" />
      </nav>

      {/* Control Sunet - Stilizat */}
      <button
        className="absolute top-8 right-8 z-50 px-4 py-2 bg-yellow-400/10 backdrop-blur-md border border-yellow-400/40 rounded-full text-yellow-400 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all shadow-[0_0_15px_rgba(250,204,21,0.2)]"
        onClick={() => setMuted(!muted)}
      >
        {muted ? "✕ SUNET" : "⚡ LIVE"}
      </button>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        @keyframes float-heart {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-250px) scale(1.5) rotate(20deg); opacity: 0; }
        }
        .animate-float-heart { animation: float-heart 1.2s ease-out forwards; }
        @keyframes fade-scale {
          0% { transform: scale(0.5); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        .animate-fade-scale { animation: fade-scale 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}

function NavButton({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <button className="flex flex-col items-center gap-1 group transition-all">
      <span className={`text-2xl ${active ? 'text-yellow-400 drop-shadow-[0_0_8px_#facc15]' : 'text-white/40 group-hover:text-yellow-200'}`}>
        {icon}
      </span>
      <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-yellow-400' : 'text-white/30 group-hover:text-white'}`}>
        {label}
      </span>
    </button>
  );
}

function VideoCard({ post, muted }: { post: Post; muted: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 600);
    }
  };

  const onTimeUpdate = () => {
    if (videoRef.current) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  return (
    <div className="relative w-full h-screen snap-start flex items-center justify-center bg-zinc-950">
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer"
        src={post.video}
        autoPlay
        loop
        muted={muted}
        playsInline
        onClick={togglePlay}
        onTimeUpdate={onTimeUpdate}
      />

      {/* Feedback Visual Play/Pause - Yellow Glow */}
      {showFeedback && (
        <div className="absolute z-20 pointer-events-none">
          <div className="bg-yellow-400/20 backdrop-blur-xl p-10 rounded-full animate-fade-scale border border-yellow-400/40 shadow-[0_0_40px_rgba(250,204,21,0.3)]">
            <span className="text-5xl drop-shadow-[0_0_10px_white]">{isPlaying ? "▶" : "Ⅱ"}</span>
          </div>
        </div>
      )}

      {/* Overlay Cinematic */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />

      {/* Bara de progres Laser Galben */}
      <div className="absolute bottom-[96px] left-0 w-full h-[2px] bg-white/10 z-50">
        <div className="h-full bg-yellow-400 shadow-[0_0_10px_#facc15]" style={{ width: `${progress}%` }} />
      </div>

      {/* Content UI */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end p-6 pb-36 pointer-events-none">
        
        <div className="max-w-xl animate-slide-up pointer-events-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full border-2 border-yellow-400 p-1 shadow-[0_0_15px_rgba(250,204,21,0.4)]">
              <div className="w-full h-full rounded-full bg-yellow-400 flex items-center justify-center font-black text-black text-xl">
                {post.user[0]}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter italic drop-shadow-2xl underline decoration-yellow-400/50 underline-offset-4">@{post.user}</h2>
              <div className="flex items-center gap-2 mt-1">
                 <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                 <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-[0.2em]">Live Creator</span>
              </div>
            </div>
          </div>
          <p className="text-lg text-white/95 leading-snug drop-shadow-xl font-medium max-w-[85%]">{post.description}</p>
        </div>

        {/* Sidebar Acțiuni Galbene */}
        <div className="absolute right-4 bottom-40 flex flex-col gap-8 items-center pointer-events-auto">
          
          <SideButton icon="💛" count={post.likes} />
          <SideButton icon="🗨️" count={post.comments} />
          <SideButton icon="✈️" count={post.shares} />

          {/* Record Spinner - Theme Match */}
          <div className="w-12 h-12 rounded-full border-2 border-yellow-400/30 p-1 animate-spin-slow">
            <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-yellow-400 flex items-center justify-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }
      `}</style>
    </div>
  );
}

function SideButton({ icon, count }: { icon: string; count: number | string }) {
  return (
    <button className="flex flex-col items-center group">
      <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-yellow-400/20 flex items-center justify-center group-active:scale-75 transition-all shadow-xl hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)]">
        <span className="text-2xl drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">{icon}</span>
      </div>
      <span className="text-[11px] font-black text-yellow-400 mt-2 drop-shadow-md tracking-tighter">{count}</span>
    </button>
  );
}
