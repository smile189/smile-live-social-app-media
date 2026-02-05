"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Send, Gift, Heart, Star, Crown, Gem, Rocket, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const LUXURY_GIFTS = [
  { id: 'rose', icon: <Star className="text-pink-400" />, label: 'Rose', color: '#f472b6' },
  { id: 'gem', icon: <Gem className="text-blue-400" />, label: 'Gem', color: '#60a5fa' },
  { id: 'crown', icon: <Crown className="text-yellow-400" />, label: 'Crown', color: '#fbbf24' },
  { id: 'rocket', icon: <Rocket className="text-purple-400" />, label: 'Rocket', color: '#a855f7' },
];

export default function ActionStream() {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [hearts, setHearts] = useState<any[]>([]);
  const [showGifts, setShowGifts] = useState(false);
  const [giftAlert, setGiftAlert] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages]);

  const handleSendMessage = (textOverride?: string, isGift = false) => {
    const newMessage = {
      id: Date.now(),
      text: textOverride || message,
      user: `User${Math.floor(Math.random() * 100)}`,
      isGift
    };
    setChatMessages(prev => [...prev.slice(-15), newMessage]);
    if (!isGift) setMessage("");
  };

  const sendGift = (gift: typeof LUXURY_GIFTS) => {
    setGiftAlert({ ...gift, key: Date.now() });
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 }, colors: [gift.color, '#fff'] });
    handleSendMessage(`a trimis ${gift.label}! 🎁`, true);
    setShowGifts(false);
    setTimeout(() => setGiftAlert(null), 4000);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md relative overflow-visible">
      
      {/* --- NOTIFICARE CADOU "BETON" (Floating Banner Like TikTok) --- */}
      <AnimatePresence>
        {giftAlert && (
          <motion.div 
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 100 }}
            className="absolute top-20 left-0 z-50 flex items-center gap-3 bg-gradient-to-r from-yellow-500/80 via-orange-500/80 to-transparent backdrop-blur-md p-2 pl-4 rounded-r-full shadow-[0_0_30px_rgba(234,179,8,0.4)] w-[90%]"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
              {giftAlert.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white uppercase italic leading-none">Special Gift</span>
              <span className="text-white font-black text-lg tracking-tighter drop-shadow-md">
                SMILE_USER <span className="text-yellow-200">sent {giftAlert.label}</span>
              </span>
            </div>
            <Sparkles className="text-yellow-200 ml-auto mr-8 animate-pulse" size={20} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CHAT STYLE TIKTOK (Fără background solid) --- */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-hide flex flex-col justify-end"
        style={{ maskImage: 'linear-gradient(to top, black 85%, transparent 100%)' }}
      >
        <AnimatePresence initial={false}>
          {chatMessages.map(m => (
            <motion.div 
              key={m.id} 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              className="flex items-start gap-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
            >
              <span className={`text-xs font-bold shrink-0 ${m.isGift ? 'text-yellow-400' : 'text-white/70'}`}>
                {m.user}:
              </span>
              <span className={`text-xs ${m.isGift ? 'text-yellow-300 font-black italic' : 'text-white font-medium'}`}>
                {m.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- ACTION BAR --- */}
      <div className="p-4 flex items-center gap-3 relative z-50">
        <div className="flex-1 relative">
          <input 
            type="text" value={message} onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Adaugă un comentariu..."
            className="w-full bg-black/20 border border-white/20 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:bg-black/40 transition-all"
          />
        </div>
        
        <button onClick={() => setShowGifts(!showGifts)} className="text-white hover:scale-110 transition-transform">
          <Gift size={26} className="text-yellow-400 drop-shadow-md" />
        </button>

        <motion.button 
          whileTap={{ scale: 0.6 }} 
          onClick={() => {
            const id = Date.now();
            setHearts(prev => [...prev, { id, x: Math.random() * 60 - 30 }]);
            setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 2000);
          }} 
          className="text-red-500 drop-shadow-md"
        >
          <Heart size={30} fill="currentColor" />
        </motion.button>
      </div>

      {/* HEARTS ANIMATION LAYER */}
      <div className="absolute bottom-20 right-6 pointer-events-none">
        <AnimatePresence>
          {hearts.map(h => (
            <motion.div key={h.id} initial={{ y: 0 }} animate={{ y: -350, x: h.x, opacity: 0, scale: 2 }} className="absolute bottom-0 text-red-500">
              <Heart size={24} fill="currentColor" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* GIFT MENU */}
      <AnimatePresence>
        {showGifts && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-20 left-4 right-4 bg-zinc-900/95 backdrop-blur-xl p-4 rounded-[2rem] border border-white/10 grid grid-cols-4 gap-2 z-50"
          >
            {LUXURY_GIFTS.map(g => (
              <button key={g.id} onClick={() => sendGift(g)} className="flex flex-col items-center p-2 hover:bg-white/10 rounded-2xl transition-all">
                <div className="text-2xl mb-1">{g.icon}</div>
                <span className="text-[8px] text-white font-bold uppercase">{g.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
