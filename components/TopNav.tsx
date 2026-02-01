"use client";

import { useState } from "react";
import { Search, Radio, Bell, Users } from "lucide-react";

export default function TopNav() {
  const [tab, setTab] = useState("foryou");

  return (
    <header className="absolute top-0 left-0 w-full h-28 z-50 px-6 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent">
      
      {/* SECTIUNE LIVE - ALERTA ROSIE */}
      <button className="flex items-center gap-2 group relative">
        <div className="relative flex items-center justify-center">
          <Radio size={24} strokeWidth={2.5} className="text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          {/* Ring de propagare pulsatoriu */}
          <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20" />
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[12px] font-black text-red-500 uppercase tracking-tighter">Live</span>
          <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Global</span>
        </div>
      </button>

      {/* SELECTOR TAB-URI - CENTRU (STIL INDUSTRIAL) */}
      <div className="flex items-center bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-full shadow-2xl">
        <button 
          onClick={() => setTab("friends")}
          className={`px-4 py-1.5 rounded-full flex items-center gap-2 transition-all ${tab === "friends" ? "bg-yellow-400 text-black" : "text-white/40 hover:text-white"}`}
        >
          <Users size={14} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-widest">Friends</span>
        </button>

        <button 
          onClick={() => setTab("foryou")}
          className={`px-4 py-1.5 rounded-full flex items-center gap-2 transition-all ${tab === "foryou" ? "bg-yellow-400 text-black" : "text-white/40 hover:text-white"}`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest">For You</span>
        </button>
      </div>

      {/* SISTEM NOTIFICARI & SEARCH */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:scale-110 transition-transform">
          <Bell size={22} strokeWidth={2} className="text-white drop-shadow-lg" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full border-2 border-black" />
        </button>
        <button className="p-2 bg-yellow-400 rounded-lg text-black shadow-[0_0_15px_rgba(250,204,21,0.4)] active:scale-90 transition-all">
          <Search size={20} strokeWidth={3} />
        </button>
      </div>

    </header>
  );
}
