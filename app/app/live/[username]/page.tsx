"use client";

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import ChatLive from '@/components/ChatLive';
import FLive from '@/components/FLive';
import { motion } from 'framer-motion';

export default function LiveStreamPage({ params }: { params: { username: string } }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [streamer, setStreamer] = useState<any>(null);

  // 1. FETCH STREAMER DATA FROM DB
  useEffect(() => {
    const fetchStreamer = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', params.username)
        .single();
      
      if (data) setStreamer(data);
    };
    fetchStreamer();
  }, [params.username, supabase]);

  if (!streamer) return <div className="h-screen bg-black flex items-center justify-center text-white">Loading Live...</div>;

  return (
    <main className="relative h-screen w-full bg-[#05010a] overflow-hidden flex flex-col font-sans text-white">
      
      {/* --- VIDEO LAYER (SIMULATED LIVE) --- */}
      <div className="absolute inset-0 z-0">
        {/* Aici poți pune un <video> real sau un placeholder animat */}
        <div className="w-full h-full bg-gradient-to-tr from-purple-900/40 via-black to-indigo-900/30" />
        
        {/* Placeholder pentru camera video a streamerului */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
           <div className="w-[500px] h-[500px] bg-purple-500 rounded-full blur-[150px] animate-pulse" />
        </div>
      </div>

      {/* --- OVERLAYS: TOP INFO --- */}
      <div className="relative z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl p-1.5 pr-6 rounded-full border border-white/10">
          <div className="w-12 h-12 rounded-full border-2 border-red-500 overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <img src={streamer.avatar_url || '/default-avatar.png'} className="w-full h-full object-cover" alt="streamer" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase italic leading-none">{streamer.username}</h1>
            <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" /> LIVE • {streamer.viewer_count} VIEWERS
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="bg-black/50 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 text-xs font-black text-yellow-400">
             ✨ {streamer.total_diamonds || 0}
          </div>
          <button className="bg-red-600 px-6 py-2 rounded-full text-xs font-black uppercase hover:bg-red-500 transition-all">
            FOLLOW
          </button>
        </div>
      </div>

      {/* --- MIDDLE: GIFT ANIMATIONS (FLIVE) --- */}
      <div className="relative flex-1 pointer-events-none">
        <FLive />
      </div>

      {/* --- BOTTOM: CHAT & ACTIONS (CHATLIVE) --- */}
      <div className="relative z-50 w-full max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col md:flex-row items-end justify-between gap-6">
        
        {/* CHAT-UL TĂU REALTIME (L-am făcut deja) */}
        <div className="w-full md:w-[400px] h-[450px]">
           <ChatLive />
        </div>

        {/* SIDE ACTIONS (Like, Share, Stats) */}
        <div className="hidden md:flex flex-col gap-4 mb-4">
           <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-2xl hover:scale-110 transition-all">❤️</button>
           <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-2xl hover:scale-110 transition-all">🚀</button>
        </div>
      </div>

    </main>
  );
}
