"use client";

import { Home, Compass, MessageSquare, Power, User } from "lucide-react";

export default function BottomNav() {
  return (
    // Container transparent, fără fundal solid
    <div className="absolute bottom-8 left-0 w-full px-6 z-50">
      <nav className="max-w-md mx-auto flex items-center justify-around">
        
        {/* HOME / FEED */}
        <button className="group flex flex-col items-center gap-1">
          <Home size={28} strokeWidth={2} className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] transition-all group-hover:text-yellow-400" />
          <span className="text-[9px] font-black text-white uppercase tracking-widest drop-shadow-md">Feed</span>
        </button>

        {/* EXPLORE */}
        <button className="group flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-all">
          <Compass size={28} strokeWidth={2} className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
          <span className="text-[9px] font-black text-white uppercase tracking-widest drop-shadow-md">Hot</span>
        </button>

        {/* PLUS CENTRAL - Singurul SOLID & COLORAT */}
        <div className="relative group">
          {/* Aura de fundal pentru adâncime */}
          <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full scale-150 opacity-50" />
          <button className="relative w-14 h-10 bg-yellow-400 rounded-xl 
                           flex items-center justify-center 
                           text-black text-3xl font-black 
                           shadow-[0_0_25px_rgba(250,204,21,0.5)]
                           hover:scale-110 active:scale-95 transition-all">
            +
          </button>
        </div>

        {/* MESAJE / CHAT */}
        <button className="group flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-all">
          <MessageSquare size={28} strokeWidth={2} className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
          <span className="text-[9px] font-black text-white uppercase tracking-widest drop-shadow-md">Chat</span>
        </button>

        {/* CONNECT / PROFIL - Stil Outlined High-Contrast */}
        <button className="group flex flex-col items-center gap-1">
          <div className="relative p-1 rounded-full border-2 border-white shadow-lg transition-all group-hover:border-yellow-400">
             <User size={22} strokeWidth={2} className="text-white group-hover:text-yellow-400" />
             {/* Indicator status online (Glow galben) */}
             <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-black animate-pulse" />
          </div>
          <span className="text-[9px] font-black text-white uppercase tracking-widest drop-shadow-md">Connect</span>
        </button>

      </nav>
    </div>
  );
}
