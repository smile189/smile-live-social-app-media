"use client";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Gift as GiftIcon, Wallet } from 'lucide-react';

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

  // 1. Initial Load
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
          .order('created_at', { ascending: false }).limit(25);
        if (msgs) setMessages(msgs.reverse());
      }
    };
    loadData();
  }, [streamerId, supabase]);

  // 2. REAL-TIME
  useEffect(() => {
    if (!streamerId) return;
    const channel = supabase.channel(`live_room_${streamerId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'live_chat', 
        filter: `streamer_id=eq.${streamerId}` 
      }, 
      async (p) => {
        const { data: full } = await supabase.from('v_stream_messages').select('*').eq('id', p.new.id).single();
        if (full) setMessages(prev => [...prev, full].slice(-50));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [streamerId, supabase]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // 3. Cadouri
  const buyGift = async (gift: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return alert("Loghează-te!");
    if (userCoins < gift.coin_price) return alert("Bani puțini!");

    setShowGifts(false); 
    const { error } = await supabase.rpc('send_live_gift', {
      p_sender_id: session.user.id,
      p_streamer_id: streamerId,
      p_gift_id: gift.id,
      p_message: `a trimis un ${gift.name}`
    });

    if (!error) setUserCoins(prev => prev - gift.coin_price);
  };

  // 4. Trimitere mesaj (REPARAT PENTRU VERCEL BUILD)
  const sendMsg = async () => {
    if (!inputValue.trim()) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    
    // FIX: Verificăm dacă session există înainte de a accesa id-ul
    if (!session) {
      alert("Trebuie să fii logat pentru a trimite mesaje!");
      return;
    }

    const content = inputValue; 
    setInputValue(''); 

    const { error } = await supabase.from('live_chat').insert([{ 
      streamer_id: streamerId, 
      sender_id: session.user.id, // Acum TypeScript știe că session nu e null
      content: content, 
      type: 'text' 
    }]);

    if (error) console.error("Eroare trimitere:", error.message);
  };

  return (
    <div className="w-full h-full relative flex flex-col justify-end p-4 overflow-hidden">
      <div 
        ref={scrollRef} 
        className="flex flex-col gap-2 overflow-y-auto max-h-[300px] mb-4 no-scrollbar pointer-events-auto z-10"
        style={{ maskImage: 'linear-gradient(to top, black 85%, transparent 100%)' }}
      >
        {messages.map((m) => (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={m.id} className="flex items-start">
            <div className={`p-2 px-4 rounded-2xl rounded-tl-none border shadow-md ${m.type === 'gift' ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-black/30 border-white/5'}`}>
              <span className={`text-[10px] font-bold uppercase mr-2 ${m.type === 'gift' ? 'text-yellow-500' : 'text-white/40'}`}>{m.sender_name}</span>
              <div className="text-[14px] text-white flex items-center gap-2">
                {m.type === 'gift' ? (
                  <span className="font-bold italic flex items-center gap-2 text-yellow-500">
                    {m.content} <img src={m.gift_image} className="w-6 h-6 object-contain" alt="gift" />
                  </span>
                ) : m.content}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative z-50 pointer-events-auto">
        <AnimatePresence>
          {showGifts && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} 
              className="bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-[30px] p-5 mb-3 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Alege Cadoul</span>
                <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm">
                  <Wallet size={14}/> <span>{userCoins}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 max-h-[200px] overflow-y-auto no-scrollbar">
                {giftTypes.map(gt => (
                  <button key={gt.id} onClick={() => buyGift(gt)} className="flex flex-col items-center p-2 bg-white/5 rounded-2xl border border-transparent hover:border-yellow-500/50 transition-all">
                    <img src={gt.image_url} className="w-10 h-10 object-contain mb-1" alt={gt.name} />
                    <span className="text-[9px] font-bold text-yellow-500">{gt.coin_price}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 bg-white/10 backdrop-blur-2xl p-1.5 rounded-full border border-white/10 shadow-xl">
          <button onClick={() => setShowGifts(!showGifts)} className="p-3 bg-yellow-500 rounded-full text-black shadow-lg hover:scale-105 transition-transform"><GiftIcon size={20} /></button>
          <input value={inputValue} onChange={e=>setInputValue(e.target.value)} onKeyDown={e=>e.key==='Enter' && sendMsg()} placeholder="Scrie ceva..." className="flex-1 bg-transparent px-2 text-white text-sm outline-none" />
          <button onClick={sendMsg} className="bg-white p-3 rounded-full text-black hover:bg-yellow-500 transition-all"><Send size={18}/></button>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
