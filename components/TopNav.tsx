"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, X, Sparkles, Users, Compass, Play, Zap, Flame } from "lucide-react";

interface LiveUser {
  id: string;
  username: string;
  avatar: string;
  viewers: string;
  color: string;
  isHot?: boolean;
}

export default function TopNav() {
  const [activeTab, setActiveTab] = useState("foryou");
  const [isSearching, setIsSearching] = useState(false);
  const [showLiveGlass, setShowLiveGlass] = useState(false);
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // [SUPABASE INTERFACE] - Fetch active streams here
    const mockData: LiveUser[] = [
      { id: "1", username: "alex_live", avatar: "AL", viewers: "1.2K", color: "#ff4d4d", isHot: true },
      { id: "2", username: "maria.vibe", avatar: "MV", viewers: "850", color: "#a855f7" },
      { id: "3", username: "tech.guru", avatar: "TG", viewers: "2.5K", color: "#3b82f6", isHot: true },
      { id: "4", username: "smile.queen", avatar: "SQ", viewers: "12K", color: "#ec4899" },
      { id: "5", username: "dance.king", avatar: "DK", viewers: "400", color: "#eab308" },
    ];
    setLiveUsers(mockData);
  }, []);

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
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Live</span>
                <span className="text-[9px] font-bold text-red-500/80">{liveUsers.length} active</span>
              </div>
            </button>
          </div>

          {/* --- CENTER: NAVIGATION --- */}
          <div className="flex-1 flex justify-center px-4">
            {!isSearching ? (
              <nav className="flex items-center bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] p-1 rounded-[22px] shadow-2xl">
                {[
                  { id: "friends", label: "Friends", icon: <Users size={14} /> },
                  { id: "foryou", label: "For You", icon: <Sparkles size={14} /> },
                  { id: "discover", label: "Discover", icon: <Compass size={14} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-4 sm:px-8 py-2.5 rounded-[18px] transition-all duration-500 ease-out ${
                      activeTab === tab.id ? "text-black" : "text-white/40 hover:text-white"
                    }`}
                  >
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 bg-white rounded-[18px] shadow-[0_10px_20px_rgba(255,255,255,0.2)] animate-in zoom-in duration-300" />
                    )}
                    <span className="relative z-10">{tab.icon}</span>
                    <span className="relative z-10 text-[10px] font-black uppercase tracking-widest hidden sm:block">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </nav>
            ) : (
              <div className="w-full max-w-lg relative animate-in slide-in-from-top-2 duration-300">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search streams, creators, or friends..."
                  className="w-full bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl py-3 px-6 text-sm text-white outline-none focus:ring-2 ring-white/20 transition-all"
                />
                <button onClick={() => setIsSearching(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  <X size={18} />
                </button>
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
        <div className="fixed inset-0 z-[60] animate-in fade-in duration-700 overflow-hidden">
          <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-[80px]" onClick={() => setShowLiveGlass(false)} />
          
          <div className="relative h-full flex flex-col justify-center">
            {/* Header Overlay */}
            <div className="absolute top-8 sm:top-12 left-0 w-full flex justify-between px-6 sm:px-12 items-center z-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                  <Flame size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase italic leading-none tracking-tighter">Smile Live</h2>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Live Media Library</p>
                </div>
              </div>
              <button onClick={() => setShowLiveGlass(false)} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all active:scale-90">
                <X size={32} />
              </button>
            </div>

            {/* SCROLLABLE CIRCULAR DISPLAY */}
            <div className="w-full flex overflow-x-auto no-scrollbar snap-x snap-mandatory touch-pan-x px-[15%] sm:px-[38%] gap-12 sm:gap-36 py-20">
              {liveUsers.map((user) => (
                <div key={user.id} className="flex-shrink-0 snap-center group relative flex flex-col items-center w-[260px] sm:w-[400px]">
                  
                  {/* BACKGROUND DESIGN: AURA & RINGS */}
                  <div 
                    className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-[480px] sm:h-[480px] opacity-20 rounded-full blur-[100px] transition-opacity duration-700 animate-float-aura"
                    style={{ backgroundColor: user.color }}
                  />
                  <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-[320px] sm:h-[320px] border border-white/5 rounded-full scale-110 group-hover:scale-125 group-hover:border-white/20 transition-all duration-1000" />
                  <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 sm:w-[280px] sm:h-[280px] border border-white/10 rounded-full scale-100 group-hover:scale-150 group-hover:border-white/5 transition-all duration-1000 delay-100" />

                  {/* AVATAR CIRCLE */}
                  <div className="relative w-44 h-44 sm:w-64 sm:h-64 z-10 group-hover:scale-105 transition-transform duration-500">
                    <div className="w-full h-full rounded-full p-[5px] bg-gradient-to-tr from-white/40 via-white/5 to-white/20 group-hover:rotate-6 transition-transform duration-700 shadow-2xl">
                      <div className="w-full h-full rounded-full bg-zinc-900 border-[3px] border-white/10 overflow-hidden flex items-center justify-center relative">
                        <span className="text-4xl sm:text-7xl font-black text-white/5 uppercase select-none">{user.avatar}</span>
                        
                        {/* Play Overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                          <div className="bg-red-600 p-6 rounded-full shadow-[0_0_40px_rgba(220,38,38,0.6)] scale-50 group-hover:scale-100 transition-transform duration-500">
                            <Play fill="white" className="text-white ml-1" size={40} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LIVE BADGE */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 px-5 py-1.5 rounded-full border border-white/30 shadow-2xl z-30">
                      <span className="text-[10px] font-black text-white tracking-[0.2em] animate-pulse">LIVE</span>
                    </div>
                  </div>

                  {/* USER INFO */}
                  <div className="mt-16 text-center z-10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                       {user.isHot && <Flame size={20} className="text-orange-500 fill-orange-500" />}
                       <h3 className="text-white font-black text-3xl sm:text-5xl tracking-tighter uppercase group-hover:tracking-[0.1em] transition-all duration-700">
                         @{user.username}
                       </h3>
                    </div>
                    <div className="bg-white/5 backdrop-blur-3xl px-6 py-2.5 rounded-full border border-white/10 inline-flex items-center gap-3 shadow-xl mt-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                       <span className="text-[12px] text-white font-black uppercase tracking-widest">{user.viewers} Watching</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interaction Hint */}
            <div className="absolute bottom-12 left-0 w-full text-center">
               <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em] animate-bounce">Swipe to discover creators</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
