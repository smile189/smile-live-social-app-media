"use client";

import { useState, useEffect } from "react";
import { X, Users, MessageSquare, Zap, Share2, ShieldAlert, Monitor } from "lucide-react";
import Link from "next/link";

export default function LivePage() {
  const [isCdnLoading, setIsCdnLoading] = useState(true);

  useEffect(() => {
    // Simulăm inițializarea conexiunii cu serverul de streaming (HLS/Dash)
    const timer = setTimeout(() => setIsCdnLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* --- ZONA PRINCIPALĂ: VIDEO PLAYER FRAME --- */}
      <div className="relative flex-1 bg-black flex items-center justify-center border-r border-white/5">
        
        {/* Placeholder pentru Sursa Video CDN */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
          {isCdnLoading ? (
            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-1000">
              <div className="relative">
                <div className="w-20 h-20 border-2 border-red-600/20 rounded-full" />
                <div className="absolute top-0 w-20 h-20 border-t-2 border-red-600 rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <h3 className="text-white font-black uppercase tracking-[0.3em] text-sm">Initializing CDN</h3>
                <p className="text-white/20 text-[10px] mt-2 uppercase">Requesting HLS manifest...</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black flex flex-col items-center justify-center">
               <Monitor size={80} className="text-white/5 mb-4" />
               <span className="text-white/10 font-black text-4xl tracking-tighter italic select-none">
                 CDN_STREAM_ACTIVE_BUNNY.NET
               </span>
               <div className="mt-4 px-4 py-1 border border-red-600/30 rounded text-red-600 text-[10px] font-bold uppercase animate-pulse">
                 Buffer Ready
               </div>
            </div>
          )}
        </div>

        {/* UI Overlay: Elemente peste Live */}
        <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between pointer-events-none">
          {/* Top Bar */}
          <div className="flex justify-between items-start w-full">
            <div className="flex items-center gap-4 pointer-events-auto">
              <div className="flex items-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                <div className="bg-red-600 px-3 py-2 flex items-center gap-2">
                   <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                   <span className="text-white font-black text-[11px] uppercase tracking-wider">Live</span>
                </div>
                <div className="px-4 py-2 flex items-center gap-3">
                  <span className="text-white/90 text-sm font-bold tracking-tight italic">Global Broadcast</span>
                  <div className="h-4 w-[1px] bg-white/10" />
                  <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-bold uppercase">
                    <Users size={12} className="text-red-500" />
                    <span>0 Viewers</span>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/app" className="pointer-events-auto p-4 bg-black/40 hover:bg-red-600/20 backdrop-blur-md border border-white/10 rounded-full text-white transition-all hover:scale-110 active:scale-90">
              <X size={24} />
            </Link>
          </div>

          {/* Bottom Bar: Quick Info */}
          <div className="flex justify-between items-end pointer-events-auto">
            <div className="max-w-md space-y-3">
               <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded text-blue-400 text-[10px] font-black uppercase tracking-widest">
                 <Zap size={10} className="fill-blue-400" /> Auto-Quality: 1080p
               </div>
               <h1 className="text-white text-2xl font-black uppercase italic tracking-tighter leading-none">
                 Smile Live Streaming Interface
               </h1>
            </div>
            <div className="flex gap-2">
               <button className="p-3 bg-black/60 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
                  <Share2 size={20} />
               </button>
               <button className="p-3 bg-black/60 border border-white/10 rounded-xl text-white/60 hover:text-red-500 transition-colors">
                  <ShieldAlert size={20} />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- SIDEBAR: CHAT & INTERACTION --- */}
      <div className="w-full lg:w-[420px] bg-[#0A0A0A] flex flex-col">
        {/* Chat Header */}
        <div className="h-[72px] px-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/20">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-red-600/10 rounded flex items-center justify-center">
                <MessageSquare size={16} className="text-red-500" />
             </div>
             <span className="text-white font-black text-xs uppercase tracking-widest">Live Feed</span>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
           <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
             <p className="text-white/40 text-[11px] font-bold leading-relaxed text-center uppercase tracking-widest">
               Waiting for data from [Supabase Realtime]...
             </p>
           </div>
        </div>

        {/* Chat Input */}
        <div className="p-6 bg-zinc-900/30 border-t border-white/5">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Send a message..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-red-600/50 transition-all placeholder:text-white/20"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-600 p-2 rounded-lg text-white hover:scale-110 active:scale-95 transition-all">
              <Zap size={16} className="fill-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
