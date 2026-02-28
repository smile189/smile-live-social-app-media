"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Gift as GiftIcon, Flame } from 'lucide-react';

interface ChatLiveProps {
  streamerId: string;
}

export default function ChatLive({ streamerId }: ChatLiveProps) {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [giftTypes, setGiftTypes] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [showGifts, setShowGifts] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeGifts, setActiveGifts] = useState<any[]>([]);
  const [combo, setCombo] = useState({ count: 0, lastId: '', user: '' });
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch initial gifts & messages
  useEffect(() => {
    const loadData = async () => {
      const { data: gifts } = await supabase.from('gift_types').select('*').order('coin_price', { ascending: true });
      if (gifts) setGiftTypes(gifts);

      if (streamerId) {
        const { data: msgs } = await supabase
          .from('live_messages')
          .select('*')
          .eq('receiver_id', streamerId)
          .order('created_at', { ascending: false })
          .limit(30);
        if (msgs) setMessages(msgs.reverse());
      }
    };
    loadData();
  }, [supabase, streamerId]);

  // 2. Realtime
  useEffect(() => {
    if (!streamerId) return;
    const channel = supabase.channel(`room_${streamerId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'live_messages', filter: `receiver_id=eq.${streamerId}` }, 
        (payload) => {
          const newMsg = payload.new as any;
          setMessages(prev => [...prev.filter(m => m.id !== newMsg.id), newMsg].slice(-50));
          if (newMsg.is_gift) {
            const animId = Date.now();
            setActiveGifts(prev => [...prev, { id: animId, content: newMsg.gift_emoji, user: newMsg.username_cache }]);
            setCombo(prev => ({
              count: (prev.lastId === newMsg.gift_emoji && prev.user === newMsg.username_cache) ? prev.count + 1 : 1,
              lastId: newMsg.gift_emoji,
              user: newMsg.username_cache
            }));
            setTimeout(() => setActiveGifts(prev => prev.filter(g => g.id !== animId)), 4000);
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, streamerId]);

  // 3. Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleAction = async (gift?: any) => {
    // Luăm sesiunea curentă direct
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
        console.error("No session found");
        return alert("Please log in again!");
    }

    if (!streamerId) return;

    // Generăm un username temporar dacă profilul nu e încărcat
    const displayName = user.user_metadata?.username || user.email?.split('@')[0] || 'User';

    const payload = gift ? {
      user_id: user.id,
      receiver_id: streamerId,
      content: `sent a gift`,
      username_cache: displayName,
      is_gift: true,
      gift_emoji: gift.image_url
    } : {
      user_id: user.id,
      receiver_id: streamerId,
      content: inputValue,
      username_cache: displayName,
      is_gift: false
    };

    if (!gift && !inputValue.trim()) return;
    if (!gift) setInputValue('');

    const { error } = await supabase.from('live_messages').insert([payload]);
    if (error) {
        console.error("Insert error:", error);
        alert(error.message);
    }
    if (gift) setShowGifts(false);
  };

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-end p-4 pb-10 pointer-events-none overflow-hidden text-white font-sans">
      
      {/* GIFT ANIMATIONS */}
      <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
        <AnimatePresence>
          {activeGifts.map((g) => (
            <motion.div key={g.id} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} className="absolute flex flex-col items-center">
              <img src={g.content} className="w-40 h-40 object-contain drop-shadow-2xl" alt="gift" />
              <div className="mt-2 font-black text-xl italic drop-shadow-lg uppercase text-center">{g.user} SENT A GIFT!</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-20 w-full max-w-[450px] pointer-events-auto flex flex-col items-center gap-4">
        
        {/* COMBO */}
        <AnimatePresence>
          {combo.count > 1 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-orange-500 flex items-center gap-2">
              <Flame size={28} className="fill-current animate-bounce" />
              <span className="font-black italic text-4xl">X{combo.count}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MESSAGES */}
        <div ref={scrollRef} className="w-full flex flex-col gap-2 overflow-y-auto max-h-[35vh] px-4 overflow-x-hidden scroll-smooth" style={{ maskImage: 'linear-gradient(to top, black 85%, transparent 100%)' }}>
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col items-start drop-shadow-md">
              <div className="bg-black/30 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-baseline gap-2 border border-white/10">
                <span className="text-[12px] font-bold text-yellow-400 uppercase tracking-tighter">{msg.username_cache}:</span>
                <span className="text-[15px] leading-tight">
                  {msg.is_gift ? (
                    <span className="flex items-center gap-2 text-blue-400 font-bold italic">sent <img src={msg.gift_emoji} className="w-6 h-6 object-contain" /></span>
                  ) : msg.content}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="w-full flex items-center gap-2 bg-black/50 backdrop-blur-2xl border border-white/20 rounded-full p-1.5 px-4 shadow-xl">
          <button onClick={() => setShowGifts(!showGifts)} className="p-2 text-white/60 hover:text-pink-400 transition-colors"><GiftIcon size={22} /></button>
          <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAction()} placeholder="Send a message..." className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/30" />
          <button onClick={() => handleAction()} className="p-2 text-blue-500 hover:scale-110 active:scale-90 transition-transform"><Send size={22} /></button>
        </div>
      </div>

      {/* GIFTS SELECTOR */}
      <AnimatePresence>
        {showGifts && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-28 w-[90%] max-w-xs bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-[28px] p-4 z-50 pointer-events-auto shadow-2xl">
            <div className="grid grid-cols-4 gap-4">
              {giftTypes.map((gt) => (
                <button key={gt.id} onClick={() => handleAction(gt)} className="flex flex-col items-center p-2 hover:bg-white/10 rounded-2xl transition-all active:scale-90">
                  <img src={gt.image_url} className="w-10 h-10 object-contain" alt="gift icon" />
                  <span className="text-[10px] mt-1 text-yellow-500 font-bold">{gt.coin_price}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
