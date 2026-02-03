"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, X, Sparkles, Users, Compass, AlertCircle } from "lucide-react";

// Aici vei importa clientul tău Supabase după instalare:
// import { supabase } from "@/lib/supabase";

export default function TopNav() {
  const [activeTab, setActiveTab] = useState("foryou");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State-uri pentru integrarea cu Supabase
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [dbError, setDbError] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // --- LOC PENTRU CONECTARE SUPABASE ---
    const getLiveStats = async () => {
      try {
        // Simulare eroare până la conectarea reală:
        // const { data, error } = await supabase.from('live_stats').select('count').single();
        // if (error) throw error;
        
        // Momentan setăm null sau 0 pentru a testa starea "neconectat"
        setLiveCount(null); 
        setDbError(true); // Schimbă în false când legi DB-ul
      } catch (err) {
        setDbError(true);
      }
    };

    getLiveStats();
  }, []);

  useEffect(() => {
    if (isSearching) searchInputRef.current?.focus();
  }, [isSearching]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-2 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* --- STÂNGA: LIVE INDICATOR (DB READY / ERROR STATE) --- */}
        <div className="flex items-center min-w-[80px] sm:min-w-[120px] pl-2">
          {!isSearching && (
            <div className="flex items-center gap-2 group transition-opacity duration-300">
              <div className="relative flex items-center justify-center">
                {dbError ? (
                  <AlertCircle size={12} className="text-white/20" />
                ) : (
                  <>
                    <span className="absolute w-2 h-2 bg-red-600/40 rounded-full animate-ping" />
                    <span className="relative w-1.5 h-1.5 bg-red-600 rounded-full" />
                  </>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500/80">Live</span>
                <span className="text-[10px] font-bold text-white/30 tabular-nums">
                  {liveCount ?? "0"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* --- CENTRU: NAVIGARE (ALWAYS TEXT ON FOR YOU) --- */}
        <div className="flex-1 flex justify-center transition-all duration-500">
          {isSearching ? (
            <div className="w-full max-w-md relative animate-in fade-in zoom-in duration-300">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search smile live ..."
                className="w-full bg-white/[0.05] backdrop-blur-3xl border border-white/10 rounded-2xl py-2 px-5 text-sm text-white focus:outline-none"
              />
              <button onClick={() => setIsSearching(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                <X size={16} />
              </button>
            </div>
          ) : (
            <nav className="flex items-center bg-zinc-900/60 backdrop-blur-3xl border border-white/[0.08] p-1 rounded-2xl shadow-2xl">
              {[
                { id: "friends", label: "Friends", icon: <Users size={14} /> },
                { id: "foryou", label: "For You", icon: <Sparkles size={14} /> },
                { id: "discover", label: "Discover", icon: <Compass size={14} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3 sm:px-6 py-2 rounded-xl transition-all duration-500 ${
                    activeTab === tab.id ? "text-black shadow-xl" : "text-white/40 hover:text-white"
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-white rounded-xl animate-in fade-in duration-300" />
                  )}
                  <span className="relative z-10">{tab.icon}</span>
                  {/* TEXTUL RĂMÂNE VIZIBIL PE TOATE DISPOZITIVELE */}
                  <span className="relative z-10 text-[10px] font-black uppercase tracking-tight sm:tracking-widest">
                    {tab.label}
                  </span>
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* --- DREAPTA: UTILS (CLEAN) --- */}
        <div className="flex items-center justify-end gap-0 sm:gap-2 min-w-[80px] sm:min-w-[120px] pr-2">
          {!isSearching && (
            <button onClick={() => setIsSearching(true)} className="p-2.5 text-white/30 hover:text-white transition-all">
              <Search size={18} strokeWidth={2.5} />
            </button>
          )}
          <button className="relative p-2.5 text-white/30 hover:text-white">
            <Bell size={18} strokeWidth={2.5} />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]" />
          </button>
        </div>

      </div>
    </header>
  );
}
