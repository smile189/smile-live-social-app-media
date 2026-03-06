"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { Gift as GiftIcon, Users, ShieldCheck, X, Wallet } from 'lucide-react';

export default function FLive({ streamerName }: { streamerName: string }) {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [streamer, setStreamer] = useState<any>(null);
  const [giftTypes, setGiftTypes] = useState<any[]>([]);
  const [showGifts, setShowGifts] = useState(false);
  const [userCoins, setUserCoins] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      // 1. Luăm profilul streamerului
      const { data: prof } = await supabase.from('profiles').select('*').eq('username', streamerName).maybeSingle();
      if (prof) setStreamer(prof);

      // 2. Luăm cadourile
      const { data: gifts } = await supabase.from('gift_types').select('*').order('coin_price', { ascending: true });
      if (gifts) setGiftTypes(gifts);

      // 3. Luăm balanța userului logat
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: w } = await supabase.from('wallets').select('coins_balance').eq('user_id', session.user.id).maybeSingle();
        if (w) setUserCoins(w.coins_balance);
        
        // Sync REALTIME pentru monede
        const channel = supabase.channel(`wallet_sync_${session.user.id}`)
          .on('postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'wallets', filter: `user_id=eq.${session.user.id}` }, 
            (payload) => setUserCoins(payload.new.coins_balance)
          ).subscribe();

        return () => { supabase.removeChannel(channel); };
      }
    };
    init();
  }, [streamerName, supabase]);

  const handlePurchase = async (gift: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return alert("Loghează-te!");
    
    // Verificăm ID-ul streamerului direct din variabila de stare sau îl recăutăm dacă e null
    let targetStreamerId = streamer?.id;
    if (!targetStreamerId) {
        const { data: s } = await supabase.from('profiles').select('id').eq('username', streamerName).single();
        targetStreamerId = s?.id;
    }

    if (!targetStreamerId) return alert("Streamer-ul nu a fost găsit!");
    if (userCoins < gift.coin_price) return alert("Bani puțini! Pune monede în Dashboard.");

    const { error } = await supabase.rpc('send_live_gift', {
      p_sender_id: session.user.id,
      p_streamer_id: targetStreamerId,
      p_gift_id: gift.id,
      p_message: `a trimis un ${gift.name}`
    });

    if (error) {
        console.error(error);
        alert("Eroare: " + error.message);
    } else {
        setShowGifts(false);
    }
  };

  return (
    <>
      {/* BUTONUL ROZ */}
      <div className="fixed bottom-10 right-6 z-[100] pointer-events-auto">
        <button 
          onClick={() => setShowGifts(true)}
          className="w-16 h-16 bg-gradient-to-tr from-pink-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 text-white cursor-pointer active:scale-90 transition-transform"
        >
          <GiftIcon size={32} />
        </button>
      </div>

      {/* MAGAZINUL */}
      <AnimatePresence>
        {showGifts && (
          <div className="fixed inset-0 z-[300] pointer-events-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGifts(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="absolute top-0 right-0 h-full w-[320px] bg-[#0a0a12] border-l border-white/10 p-6 flex flex-col shadow-2xl">
              
              <div className="flex justify-between items-center text-white mb-8">
                <h2 className="font-black text-xl italic uppercase tracking-widest">Smile Shop</h2>
                <button onClick={() => setShowGifts(false)} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white"><X size={24}/></button>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-8 flex justify-between items-center text-white">
                <Wallet className="text-yellow-500" />
                <span className="font-black text-xl text-yellow-500">{userCoins} 🪙</span>
              </div>

              <div className="grid grid-cols-3 gap-3 overflow-y-auto no-scrollbar flex-1 pb-10">
                {giftTypes.map(gt => (
                  <button 
                    key={gt.id} 
                    onClick={() => handlePurchase(gt)}
                    className={`flex flex-col items-center p-3 rounded-2xl border transition-all active:scale-95 ${
                      userCoins >= gt.coin_price 
                      ? 'bg-white/5 border-white/10 hover:border-pink-500/50' 
                      : 'opacity-20 grayscale border-transparent cursor-not-allowed'
                    }`}
                  >
                    <img src={gt.image_url} className="w-12 h-12 object-contain mb-2" alt={gt.name} />
                    <span className="text-[10px] font-black text-yellow-500 italic">{gt.coin_price} 🪙</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOP HUD */}
      <div className="fixed top-4 left-4 right-4 flex justify-between items-start z-[100] pointer-events-none">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl p-1.5 pr-4 rounded-full border border-white/10 pointer-events-auto">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-slate-900 overflow-hidden">
            <img src={streamer?.avatar_url || `https://api.dicebear.com{streamerName}`} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="text-white text-sm font-bold flex flex-col text-left">
            <span className="flex items-center gap-1">{streamerName} <ShieldCheck size={14} className="text-blue-400" /></span>
            <span className="text-[10px] text-red-500 font-black animate-pulse">Live 4K</span>
          </div>
        </div>
        <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 pointer-events-auto text-white flex items-center gap-2">
          <Users size={16} /> <span className="font-bold">{streamer?.viewer_count || 0}</span>
        </div>
      </div>
    </>
  );
}
