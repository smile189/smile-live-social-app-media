"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Gift as GiftIcon, X, Sparkles, Flame } from 'lucide-react';

interface ChatLiveProps {
  streamerId?: string;
}

export default function ChatLive({ streamerId }: ChatLiveProps) {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [me, setMe] = useState<any>(null);
  const [giftTypes, setGiftTypes] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [showGifts, setShowGifts] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeGifts, setActiveGifts] = useState<any[]>([]);
  const [combo, setCombo] = useState({ count: 0, lastId: '', user: '' });
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch inițial date - LOGICĂ COMPLETĂ
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setMe(profile || { id: user.id, username: user.email?.split('@')[0] });
      }

      const { data: gifts } = await supabase.from('gift_types').select('*').order('coin_price', { ascending: true });
      if (gifts) setGiftTypes(gifts);

      const { data: msgs } = await supabase.from('live_messages').select('*').order('created_at', { ascending: false }).limit(25);
      if (msgs) setMessages(msgs.reverse());
    };
    init();
  }, [supabase]);

  // 2. Realtime Engine - LOGICĂ COMPLETĂ
  useEffect(() => {
    const channelName = `live_global_${Math.random()}`;
    
    const channel = supabase.channel(channelName, {
      config: {
        postgres_changes: [{ 
          event: 'INSERT', 
          schema: 'public', 
          table: 'live_messages' 
        }]
      }
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_messages' }, (payload) => {
      const newMsg = payload.new;
      
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg].slice(-40);
      });

      if (newMsg.is_gift) {
        const animId = Date.now();
        setActiveGifts(prev => [...prev, { id: animId, content: newMsg.gift_emoji, user: newMsg.username_cache }]);
        
        setCombo(prev => ({
          count: (prev.lastId === newMsg.gift_emoji && prev.user === newMsg.username_cache) ? prev.count + 1 : 1,
          lastId: newMsg.gift_emoji,
          user: newMsg.username_cache
        }));

        setTimeout(() => {
          setActiveGifts(prev => prev.filter(g => g.id !== animId));
        }, 4000);
      }
    })
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // 3. Logica de Trimitere - LOGICĂ COMPLETĂ
  const handleAction = async (gift?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Log in to participate!");

    if (gift) {
      const { error } = await supabase.from('gifts').insert([{
        sender_id: user.id,
        receiver_id: streamerId || user.id,
        amount: gift.coin_price
      }]);
      if (error) return alert("Transaction error: " + error.message);
      setShowGifts(false);
    } else {
      if (!inputValue.trim()) return;
      const text = inputValue;
      setInputValue('');

      const { error } = await supabase.from('live_messages').insert([{
        user_id: user.id,
        content: text,
        username_cache: me?.username || user.email?.split('@')[0],
        is_gift: false
      }]);

      if (error) {
        alert("Failed to send: " + error.message);
        setInputValue(text);
      }
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-end p-4 pb-10 pointer-events-none overflow-hidden">
      
      {/* GIFT ANIMATIONS - FĂRĂ FUNDAL / CENTRAT */}
      <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
        <AnimatePresence>
          {activeGifts.map((g) => (
            <motion.div key={g.id}
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: -40 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 3 }}
              className="absolute flex flex-col items-center"
            >
              <img src={g.content} className="w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-2xl" alt="gift" />
              <div className="mt-2 text-white font-black text-xl italic tracking-tighter drop-shadow-lg uppercase">
                {g.user} sent a gift!
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CHAT INTERFACE - CENTRAT / NO BUBBLES */}
      <div className="relative z-20 w-full max-w-[480px] pointer-events-auto flex flex-col items-center gap-4">
        
        {/* COMBO */}
        <AnimatePresence>
          {combo.count > 1 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="text-orange-500 flex items-center gap-2 drop-shadow-md"
            >
              <Flame size={20} className="fill-current animate-bounce" />
              <span className="font-black italic text-2xl tracking-tighter">X{combo.count} COMBO</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MESSAGES - PURE TEXT / CENTERED */}
        <div ref={scrollRef} className="w-full flex flex-col gap-2 overflow-y-auto max-h-[40vh] no-scrollbar px-4"
          style={{ maskImage: 'linear-gradient(to top, black 85%, transparent 100%)' }}>
          {messages.map((msg, i) => (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={msg.id || i} className="flex justify-center text-center">
              <div className="flex flex-wrap justify-center items-baseline gap-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                <span className={`text-[11px] font-bold tracking-widest uppercase ${msg.is_gift ? 'text-blue-400' : 'text-white/60'}`}>
                  {msg.username_cache}:
                </span>
                <span className={`text-[14px] text-white font-medium ${msg.is_gift ? 'italic font-bold' : ''}`}>
                  {msg.is_gift ? (
                    <span className="flex items-center gap-1.5">
                      Sent <img src={msg.gift_emoji} className="w-5 h-5 object-contain" />
                    </span>
                  ) : msg.content}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* INPUT - CORPORATE MINIMALIST */}
        <div className="w-full flex items-center gap-2 bg-black/30 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 px-4 shadow-2xl">
          <button onClick={() => setShowGifts(!showGifts)} className="p-2 text-white/50 hover:text-blue-400 transition-colors">
            <GiftIcon size={20} />
          </button>
          
          <input 
            value={inputValue} onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction()}
            placeholder="Message..."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/20"
          />
          
          <button onClick={() => handleAction()} className="p-2 text-blue-500 hover:scale-110 transition-transform">
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* GIFT SELECTOR */}
      <AnimatePresence>
        {showGifts && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-24 w-[90%] max-w-sm bg-slate-900/90 backdrop-blur-3xl rounded-[32px] p-6 z-50 pointer-events-auto border border-white/10 shadow-2xl"
          >
            <div className="grid grid-cols-4 gap-4">
              {giftTypes.map((gt) => (
                <button 
                  key={gt.id} 
                  onClick={() => handleAction(gt)}
                  className="flex flex-col items-center gap-2 hover:scale-110 transition-transform"
                >
                  <img src={gt.image_url} className="w-12 h-12 object-contain" alt={gt.name} />
                  <span className="text-[10px] text-white/40 font-bold">{gt.coin_price} 🪙</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
