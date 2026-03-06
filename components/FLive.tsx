"use client";
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Heart, Share2, Plus, Users, Flame, Crown } from 'lucide-react';

export default function FLive({ streamerName }: { streamerName: string }) {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [streamer, setStreamer] = useState<any>(null);
  const [likes, setLikes] = useState(0);
  const [topGifters, setTopGifters] = useState<any[]>([]);
  const [isFollowed, setIsFollowed] = useState(false);
  const [tapHearts, setTapHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: prof } = await supabase.from('profiles').select('*').eq('username', streamerName).maybeSingle();
      if (prof) {
        setStreamer(prof);
        setLikes(prof.likes_count || 0);

        // FETCH TOP 3 DONATORI (DIN VIEW-UL DE MESAJE)
        const { data: gifters } = await supabase
          .from('v_stream_messages')
          .select('sender_name')
          .eq('streamer_id', prof.id)
          .eq('type', 'gift')
          .limit(3);
        if (gifters) setTopGifters(gifters);
      }
    };
    init();
    
    const channel = supabase.channel(`live_hud`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (p) => {
        if (p.new.username === streamerName) setLikes(p.new.likes_count);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [streamerName, supabase]);

  const handleTap = useCallback(async (e: React.MouseEvent) => {
    const newHeart = { id: Date.now(), x: e.clientX, y: e.clientY };
    setTapHearts(prev => [...prev, newHeart]);
    setLikes(prev => prev + 1);
    if (streamer) supabase.rpc('increment_likes', { streamer_id: streamer.id });
    setTimeout(() => setTapHearts(prev => prev.filter(h => h.id !== newHeart.id)), 800);
  }, [streamer, supabase]);

  // FUNCTIA PROFESIONALA DE SHARE (NATIVE URL)
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SMILE LIVE - ${streamerName}`,
          text: `Uită-te la @${streamerName} LIVE acum pe Smile!`,
          url: window.location.href,
        });
      } catch (err) { console.log(err); }
    } else {
      // Fallback daca browserul nu suporta Native Share
      navigator.clipboard.writeText(window.location.href);
      alert("URL Copiat!");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-0 cursor-pointer pointer-events-auto" onClick={handleTap} />

      {/* YELLOW HEARTS */}
      <AnimatePresence>
        {tapHearts.map((h) => (
          <motion.div key={h.id} initial={{ opacity: 1, scale: 0.5, y: h.y, x: h.x - 20 }} animate={{ opacity: 0, scale: 2, y: h.y - 180, x: h.x + (Math.random() * 80 - 40) }} exit={{ opacity: 0 }} className="fixed pointer-events-none z-10 text-yellow-400">
            <Heart size={45} fill="currentColor" />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="fixed inset-0 z-50 pointer-events-none p-4 flex flex-col justify-between">
        
        {/* TOP SECTION: HUD MARE CU TOP 3 DONATORI */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-2xl p-1.5 pr-5 rounded-full border border-white/20 pointer-events-auto shadow-2xl">
              <div className="relative">
                <img src={streamer?.avatar_url || `https://api.dicebear.com{streamerName}`} className="w-12 h-12 rounded-full border-2 border-yellow-500 object-cover" />
                <AnimatePresence>
                  {!isFollowed && (
                    <motion.button 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      onClick={(e) => { e.stopPropagation(); setIsFollowed(true); }}
                      className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1.5 text-black border-2 border-black"
                    >
                      <Plus size={14} strokeWidth={4} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-white text-sm font-black flex items-center gap-1 uppercase italic">{streamerName} <ShieldCheck size={14} className="text-blue-400" /></span>
                <div className="flex items-center gap-3 font-black italic">
                   <div className="flex items-center gap-1 text-xs text-yellow-400"><Heart size={12} fill="currentColor"/> {likes.toLocaleString()}</div>
                   <div className="flex items-center gap-1 text-xs text-white/70"><Users size={12}/> {streamer?.viewer_count || 0}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
               <div className="bg-red-600 px-4 py-1.5 rounded-full text-white font-black text-xs uppercase italic tracking-widest border border-white/30 animate-pulse">LIVE</div>
               <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] text-yellow-500 font-black flex items-center gap-1 uppercase italic">
                  <Flame size={12} fill="currentColor" /> Rank #1
               </div>
            </div>
          </div>

          {/* TOP 3 DONATORI (NUME & RANK) */}
          <div className="flex gap-2 ml-2 pointer-events-auto">
             {topGifters.length > 0 ? topGifters.map((g, i) => (
               <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 backdrop-blur-xl shadow-lg ${i === 0 ? 'border-yellow-500 bg-yellow-500/20 text-yellow-500' : 'border-white/20 bg-black/40 text-white/80'}`}>
                 <span className="text-[10px] font-black italic uppercase tracking-tighter">#{i+1} {g.sender_name}</span>
                 {i === 0 && <Crown size={12} fill="currentColor" />}
               </div>
             )) : (
               <div className="bg-black/20 px-3 py-1.5 rounded-full border border-white/10 text-[9px] text-white/40 font-bold uppercase italic">Așteptând donatori...</div>
             )}
          </div>
        </div>

        {/* SIDEBAR MIC SI FAIN (TIKTOK STYLE) */}
        <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center pointer-events-auto">
          <button className="flex flex-col items-center gap-1 group opacity-80 hover:opacity-100 transition-opacity">
            <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-lg text-white border border-white/10 hover:bg-red-500/20 hover:text-red-500 transition-all">
              <Heart size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[9px] font-black text-white/70 uppercase italic tracking-tighter">Like</span>
          </button>

          <button onClick={handleShare} className="flex flex-col items-center gap-1 group opacity-80 hover:opacity-100 transition-opacity">
            <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-lg text-white border border-white/10 hover:bg-white/20 transition-all">
              <Share2 size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[9px] font-black text-white/70 uppercase italic tracking-tighter">Share</span>
          </button>
        </div>

      </div>
    </>
  );
}
