"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, X, Sparkles, Users, Compass, Flame } from "lucide-react";

interface LiveUser {
  id: string;
  username: string;
  avatar: string;
  viewers: string;
  color: string;
  isHot?: boolean;
}

export default function TopNav() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("foryou");
  const [isSearching, setIsSearching] = useState(false);
  const [showLiveGlass, setShowLiveGlass] = useState(false);
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Simulăm fetch-ul din Supabase
    const mockData: LiveUser[] = [
      { id: "1", username: "alex_live", avatar: "AL", viewers: "1.2K", color: "#ff4d4d", isHot: true },
      { id: "2", username: "maria.vibe", avatar: "MV", viewers: "850", color: "#a855f7" },
      { id: "3", username: "tech.guru", avatar: "TG", viewers: "2.5K", color: "#3b82f6", isHot: true },
      { id: "4", username: "smile.queen", avatar: "SQ", viewers: "12K", color: "#ec4899" },
      { id: "5", username: "dance.king", avatar: "DK", viewers: "400", color: "#eab308" },
    ];
    setLiveUsers(mockData);
  }, []);

  // Navigare către componenta cadru (LiveFrame)
  const enterStream = (username: string) => {
    setShowLiveGlass(false);
    // Componenta de destinație va prelua username-ul pentru a cere stream-ul din CDN
    //router.push(`/live/${username}`);
    router.push(`app/live`);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-3 py-4 sm:px-8 sm:py-6 select-none">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          
          {/* --- LEFT: LIVE INDICATOR --- */}
          <div className="flex items-center min-w-[100px] sm:min-w-[150px]">
            <button 
              onClick={() => setShowLiveGlass(true)}
              className="group relative flex items-center gap-3 bg-black/40 hover:bg-black/60 backdrop-blur-2xl px-4 py-2 rounded-full border border-white/10 transition-all active:scale-95 shadow-2xl"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping opacity-40" />
                <span className="relative w-2 h-2 bg-red-500 rounded-full shadow-[0_0_12px_#ef4444]" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300"> smile</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Live</span>
                <span className="text-[9px] font-bold text-red-500/80">{liveUsers.length} </span>
              </div>
            </button>
          </div>

          {/* --- CENTER: NAVIGATION --- */}
          <div className="flex-1 flex justify-center px-4">
            {!isSearching ? (
              <nav className="flex items-center bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] p-1 rounded-[22px] shadow-2xl">
                {[{ id: "friends", label: "Friends", icon: <Users size={14} /> }, { id: "foryou", label: "For You", icon: <Sparkles size={14} /> }, { id: "discover", label: "Discover", icon: <Compass size={14} /> }].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-4 sm:px-8 py-2.5 rounded-[18px] transition-all duration-500 ease-out ${activeTab === tab.id ? "text-black" : "text-white/40 hover:text-white"}`}
                  >
                    {activeTab === tab.id && <div className="absolute inset-0 bg-white rounded-[18px] shadow-[0_10px_20px_rgba(255,255,255,0.2)] animate-in zoom-in duration-300" />}
                    <span className="relative z-10">{tab.icon}</span>
                    <span className="relative z-10 text-[10px] font-black uppercase tracking-widest hidden sm:block">{tab.label}</span>
                  </button>
                ))}
              </nav>
            ) : (
              <div className="w-full max-w-lg relative animate-in slide-in-from-top-2 duration-300">
                <input ref={searchInputRef} type="text" placeholder="Search streams..." className="w-full bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl py-3 px-6 text-sm text-white outline-none focus:ring-2 ring-white/20 transition-all" />
                <button onClick={() => setIsSearching(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"><X size={18} /></button>
              </div>
            )}
          </div>

          {/* --- RIGHT: UTILS --- */}
          <div className="flex items-center justify-end gap-2 min-w-[100px] sm:min-w-[150px]">
            {!isSearching && (
              <button onClick={() => setIsSearching(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all">
                <Search size={20} strokeWidth={2.5} />
              </button>
            )}
            <button className="relative p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all">
              <Bell size={20} strokeWidth={2.5} />
              <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-black" />
            </button>
          </div>
        </div>
      </header>

      {/* --- LIVE MEDIA LIBRARY OVERLAY --- */}
      {showLiveGlass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
          {/* Backdrop cu blur masiv */}
          <div className="absolute inset-0 bg-black/95 backdrop-blur-[100px] animate-in fade-in duration-700" onClick={() => setShowLiveGlass(false)} />
          
          <div className="relative w-full h-full flex flex-col justify-center animate-in zoom-in-95 fade-in duration-500">
            
            {/* Header: Logo REC pe Rosu + Scanline */}
            <div className="absolute top-8 sm:top-12 left-0 w-full flex justify-between px-6 sm:px-12 items-center z-50">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)] bg-black">
                  <img src="/logosmile.jpeg" alt="REC" className="w-full h-full object-cover grayscale contrast-125 brightness-75" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/20 to-transparent h-1/2 w-full animate-[scan_2s_linear_infinite]" />
                  <div className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 shadow-[0_0_10px_red]"></span>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Smile <span className="text-red-600">Studio</span></h2>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.4em]">Ready to Stream</p>
                </div>
              </div>
              <button onClick={() => setShowLiveGlass(false)} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all hover:rotate-90">
                <X size={32} />
              </button>
            </div>

            {/* SCROLLABLE CIRCULAR DISPLAY */}
            <div className="w-full flex overflow-x-auto no-scrollbar snap-x snap-mandatory touch-pan-x px-[15%] sm:px-[38%] gap-12 sm:gap-36 py-20">
              {liveUsers.map((user) => (
                <div 
                  key={user.id} 
                  onClick={() => enterStream(user.username)}
                  className="flex-shrink-0 snap-center group relative flex flex-col items-center w-[260px] sm:w-[400px] cursor-pointer"
                >
                  {/* Aura & Glow Effect */}
                  <div 
                    className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-[480px] sm:h-[480px] opacity-10 rounded-full blur-[120px] transition-all duration-700 group-hover:opacity-40"
                    style={{ backgroundColor: user.color }}
                  />
                  
                  {/* Circular Frame */}
                  <div className="relative w-52 h-52 sm:w-80 sm:h-80 rounded-full border-4 border-white/5 flex items-center justify-center bg-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-700 group-hover:scale-110 group-hover:border-red-600/50">
                    <span className="text-white/20 font-black text-7xl absolute group-hover:text-white/10 transition-colors">{user.avatar}</span>
                    
                    {/* CDN Stream Simulation Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-y-full group-hover:translate-y-[-100%] transition-transform duration-1000 ease-in-out" />
                    
                    {user.isHot && (
                      <div className="absolute top-10 flex items-center gap-1 bg-red-600 px-4 py-1 rounded-full animate-pulse shadow-lg">
                        <Flame size={14} className="text-white fill-white" />
                        <span className="text-[10px] font-black text-white uppercase">Live Now</span>
                      </div>
                    )}
                  </div>

                  <h3 className="mt-8 text-white font-black text-2xl uppercase tracking-widest group-hover:text-red-500 transition-colors">@{user.username}</h3>
                  <div className="mt-3 px-6 py-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full flex items-center gap-3 group-hover:bg-red-600 transition-all duration-500">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-tighter">{user.viewers} Watching</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <style jsx global>{`
            @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(200%); } }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
        </div>
      )}
    </>
  );
}
