"use client";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Gift as GiftIcon, Wallet, X, Sparkles } from 'lucide-react';

export default function ChatLiveGlas({ streamerId }: { streamerId: string }) {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [giftTypes, setGiftTypes] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showGifts, setShowGifts] = useState(false);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [activeGiftAnim, setActiveGiftAnim] = useState<any>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // LOGICA AUDIO - Inițializare sunet exploziv
  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co");
    audioRef.current.volume = 0.6;
  }, []);

  // DETECTARE CADOU NOU PENTRU ANIMAȚIE "NEBUNĂ"
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.type === 'gift') {
        audioRef.current?.play().catch(() => {});
        setActiveGiftAnim(lastMsg);
        setTimeout(() => setActiveGiftAnim(null), 3500);
      }
    }
  }, [messages.length]);

  useEffect(() => {
    const loadData = async () => {
      const { data: gifts } = await supabase.from('gift_types').select('*').order('coin_price', { ascending: true });
      if (gifts) setGiftTypes(gifts);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: w } = await supabase.from('wallets').select('coins_balance').eq('user_id', session.user.id).maybeSingle();
        if (w) setUserCoins(w.coins_balance);
      }

      if (streamerId) {
        const { data: msgs } = await supabase.from('v_stream_messages')
          .select('*').eq('streamer_id', streamerId)
          .order('created_at', { ascending: false }).limit(30);
        if (msgs) setMessages(msgs.reverse());
      }
    };
    loadData();
  }, [streamerId, supabase]);

  useEffect(() => {
    if (!streamerId) return;
    const channel = supabase.channel(`chat_${streamerId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_chat', filter: `streamer_id=eq.${streamerId}` }, 
      async (p) => {
        const { data: full } = await supabase.from('v_stream_messages').select('*').eq('id', p.new.id).single();
        if (full) setMessages(prev => [...prev, full].slice(-50));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [streamerId, supabase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const buyGift = async (gift: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || userCoins < gift.coin_price) return;
    const { error } = await supabase.rpc('send_live_gift', {
      p_sender_id: session.user.id,
      p_streamer_id: streamerId,
      p_gift_id: gift.id,
      p_message: `a trimis un ${gift.name}`
    });
    if (!error) {
      setUserCoins(prev => prev - gift.coin_price);
      setShowGifts(false);
    }
  };

  const sendMsg = async () => {
    if (!inputValue.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const content = inputValue; setInputValue(''); 
    await supabase.from('live_chat').insert([{ streamer_id: streamerId, sender_id: session.user.id, content, type: 'text' }]);
  };

  return (
    <div className="w-full h-full relative flex flex-col justify-end p-3 overflow-hidden">
      
      {/* 🚀 EXPLOSIVE GIFT OVERLAY + PARTICLES */}
      <AnimatePresence>
        {activeGiftAnim && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Particule Aurii de fundal */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: 0, scale: 1.5, x: (Math.random() - 0.5) * 500, y: (Math.random() - 0.5) * 500 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              />
            ))}

            <motion.div 
              initial={{ opacity: 0, scale: 0, rotate: -45 }}
              animate={{ opacity: 1, scale: [1.2, 1, 1.1], rotate: 0 }}
              exit={{ opacity: 0, scale: 2, y: -200 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative flex flex-col items-center"
            >
              {/* Glow Aura Mare */}
              <div className="absolute inset-0 bg-yellow-500/40 blur-[100px] rounded-full animate-pulse" />
              
              <div className="relative z-10 bg-black/80 backdrop-blur-2xl border-4 border-yellow-500 rounded-[50px] p-10 shadow-[0_0_80px_rgba(234,179,8,0.6)]">
                 <img src={activeGiftAnim.gift_image} className="w-40 h-40 object-contain" alt="" />
                 <Sparkles className="absolute -top-6 -right-6 text-yellow-400 w-12 h-12 animate-bounce" />
              </div>

              <motion.div 
                initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="mt-6 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 text-black px-8 py-3 rounded-full font-black text-sm italic shadow-2xl flex items-center gap-3 uppercase tracking-tighter"
              >
                <Sparkles size={16} /> {activeGiftAnim.sender_name} A TRIMIS UN CADOU!
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MESSAGES LIST */}
      <div 
        ref={scrollRef} 
        className="flex flex-col gap-1.5 overflow-y-auto max-h-[260px] mb-3 no-scrollbar pointer-events-auto relative z-10"
        style={{ maskImage: 'linear-gradient(to top, black 85%, transparent 100%)' }}
      >
        {messages.map((m) => (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={m.id} className="flex items-start">
            <div className={`py-1.5 px-3 rounded-xl rounded-bl-none backdrop-blur-3xl border ${
              m.type === 'gift' ? 'bg-black/40 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'bg-black/30 border-white/10'
            }`}>
              <span className={`text-[9px] font-black uppercase tracking-tight mr-1.5 ${m.type === 'gift' ? 'text-yellow-500' : 'text-white/40'}`}>
                {m.sender_name}
              </span>
              <div className="text-[12px] text-white/95 leading-snug inline-block font-medium">
                {m.type === 'gift' ? (
                  <span className="font-black flex items-center gap-2 text-yellow-500 italic">
                    {m.content} 
                    <img src={m.gift_image} className="w-5 h-5 object-contain" alt="" />
                  </span>
                ) : m.content}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* INPUT AREA */}
      <div className="relative z-50 pointer-events-auto">
        <AnimatePresence>
          {showGifts && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }} 
              className="bg-black/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 mb-2 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-3 text-white">
                <div className="flex items-center gap-2 text-yellow-500 font-bold text-[10px] italic tracking-widest"><Wallet size={12}/> {userCoins}</div>
                <button onClick={() => setShowGifts(false)} className="text-white/20 hover:text-white transition-colors"><X size={14}/></button>
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto no-scrollbar">
                {giftTypes.map(gt => (
                  <button key={gt.id} onClick={() => buyGift(gt)} className="flex flex-col items-center p-2 bg-white/5 rounded-xl border border-transparent hover:border-yellow-500/40 active:scale-90 transition-all">
                    <img src={gt.image_url} className="w-8 h-8 object-contain mb-1" alt="" />
                    <span className="text-[8px] font-black text-yellow-500 italic">{gt.coin_price}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-3xl p-1 rounded-full border border-white/10 shadow-lg">
          <button onClick={() => setShowGifts(!showGifts)} className="p-2.5 bg-yellow-500 rounded-full text-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/20"><GiftIcon size={16} strokeWidth={3} /></button>
          <input 
            value={inputValue} onChange={e=>setInputValue(e.target.value)} 
            onKeyDown={e=>e.key==='Enter' && sendMsg()} 
            placeholder="Scrie un mesaj..." className="flex-1 bg-transparent px-2 text-[13px] text-white outline-none placeholder:text-white/20" 
          />
          <button onClick={sendMsg} className={`p-2.5 rounded-full transition-all ${inputValue.trim() ? 'bg-white text-black' : 'opacity-0'}`}><Send size={16} strokeWidth={2.5} /></button>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
    </div>
  );
}
