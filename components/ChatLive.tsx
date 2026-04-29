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
  const scrollRef = useRef<HTMLDivElement>(null);

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
      
      {/* MESSAGES LIST - FĂRĂ BARE DE SCROLL ȘI FĂRĂ GLAS GALBEN */}
      <div 
        ref={scrollRef} 
        className="flex flex-col gap-1.5 overflow-y-auto max-h-[260px] mb-3 no-scrollbar pointer-events-auto"
        style={{ maskImage: 'linear-gradient(to top, black 85%, transparent 100%)' }}
      >
        {messages.map((m) => (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={m.id} className="flex items-start">
            <div className={`py-1.5 px-3 rounded-xl rounded-bl-none backdrop-blur-3xl border ${
              m.type === 'gift' 
              ? 'bg-black/40 border-yellow-500/30' 
              : 'bg-black/30 border-white/10'
            }`}>
              <span className={`text-[9px] font-black uppercase tracking-tight mr-1.5 ${m.type === 'gift' ? 'text-yellow-500' : 'text-white/40'}`}>
                {m.sender_name}
              </span>
              <div className="text-[12px] text-white/95 leading-snug inline-block font-medium">
                {m.type === 'gift' ? (
                  <motion.span 
                    initial={{ scale: 0.8 }} animate={{ scale: [1, 1.1, 1] }} 
                    className="font-black flex items-center gap-2 text-yellow-500 italic"
                  >
                    {m.content} 
                    <div className="relative">
                       <Sparkles className="absolute -top-1.5 -right-1.5 text-white/80 w-2.5 h-2.5" />
                       <img src={m.gift_image} className="w-5 h-5 object-contain" alt="" />
                    </div>
                  </motion.span>
                ) : m.content}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* INPUT AREA - CORPORATE DESIGN */}
      <div className="relative z-50 pointer-events-auto">
        <AnimatePresence>
          {showGifts && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              className="bg-[#050505]/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 mb-2 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-yellow-500 font-bold text-[10px] uppercase italic tracking-widest">
                  <Wallet size={12}/> {userCoins}
                </div>
                <button onClick={() => setShowGifts(false)} className="text-white/20 hover:text-white"><X size={14}/></button>
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto no-scrollbar">
                {giftTypes.map(gt => (
                  <button key={gt.id} onClick={() => buyGift(gt)} className="flex flex-col items-center p-2 bg-white/5 rounded-xl border border-transparent hover:border-yellow-500/40 transition-all">
                    <img src={gt.image_url} className="w-7 h-7 object-contain mb-1" alt="" />
                    <span className="text-[8px] font-black text-yellow-500 italic">{gt.coin_price}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-3xl p-1 rounded-full border border-white/10 shadow-lg group focus-within:bg-white/10 transition-all">
          <button 
            onClick={() => setShowGifts(!showGifts)} 
            className="p-2.5 bg-yellow-500 rounded-full text-black hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <GiftIcon size={16} strokeWidth={3} />
          </button>
          
          <input 
            value={inputValue} 
            onChange={e=>setInputValue(e.target.value)} 
            onKeyDown={e=>e.key==='Enter' && sendMsg()} 
            placeholder="Scrie un mesaj..." 
            className="flex-1 bg-transparent px-2 text-[13px] text-white outline-none placeholder:text-white/20" 
          />
          
          <button 
            onClick={sendMsg} 
            className={`p-2.5 rounded-full transition-all ${inputValue.trim() ? 'bg-white text-black' : 'opacity-0'}`}
          >
            <Send size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
    </div>
  );
}
