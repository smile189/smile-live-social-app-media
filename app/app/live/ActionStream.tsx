"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Send, Gift, Heart, Star, Crown, Gem, Rocket, Flame, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// Configurație cadouri de lux
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
  const [activeBigAnnounce, setActiveBigAnnounce] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages]);

  const handleSendMessage = (textOverride?: string, isGift = false) => {
    const newMessage = {
      id: Date.now(),
      text: textOverride || message,
      user: "SMILE_FAN",
      isGift
    };
    setChatMessages(prev => [...prev.slice(-10), newMessage]);
    if (!isGift) setMessage("");
  };

  // FUNCȚIE CADOU CU ANIMAȚIE "BETON" PE ECRAN
  const sendGift = (gift: typeof LUXURY_GIFTS[0]) => {
    // 1. Notificarea mare pe centru
    setActiveBigAnnounce({ ...gift, key: Date.now() });
    
    // 2. Confetti masiv
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [gift.color, '#ffffff', '#FFD700']
    });

    // 3. Mesaj în chat
    handleSendMessage(`A TRIMIS UN ${gift.label.toUpperCase()}! 🎁`, true);
    setShowGifts(false);

    // 4. Auto-hide notificare după 3 secunde
    setTimeout(() => setActiveBigAnnounce(null), 3000);
  };

  const triggerHeart = () => {
    const id = Date.now();
    setHearts(prev => [...prev, { id, x: Math.random() * 60 - 30 }]);
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 2000);
  };

  return (
    <div className="flex flex-col h-[70vh] w-full max-w-md relative overflow-visible">
      
      {/* --- ANIMAȚIE MARE PE CENTRU (GIFT ANNOUNCEMENT) --- */}
      <AnimatePresence>
        {activeBigAnnounce && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1.2, y: -50 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
            className="absolute -top-40 left-0 right-0 flex flex-col items-center z-[100] pointer-events-none"
          >
            <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-white/20 blur-[60px] rounded-full" 
                />
                <div className="bg-black/60 backdrop-blur-2xl border-2 border-white/20 p-8 rounded-[3rem] shadow-[0_0_50px_rgba(255,255,255,0.2)] flex flex-col items-center">
                    <motion.div 
                      animate={{ y: [0, -20, 0] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-7xl mb-4"
                    >
                      {activeBigAnnounce.icon}
                    </motion.div>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter text-center leading-none">
                        SUPER GIFT!<br/>
                        <span style={{ color: activeBigAnnounce.color }}>{activeBigAnnounce.label}</span>
                    </h2>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide flex flex-col justify-end">
        <AnimatePresence>
          {chatMessages.map(m => (
            <motion.div 
              key={m.id} 
              initial={{ x: -30, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              className={`p-3 rounded-2xl backdrop-blur-lg border ${m.isGift ? 'bg-white/20 border-yellow-500/50 shadow-lg' : 'bg-black/30 border-white/5'}`}
            >
              <p className={`text-[10px] font-bold ${m.isGift ? 'text-yellow-400' : 'text-red-500'}`}>SMILE_USER</p>
              <p className="text-sm text-white font-medium">{m.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* HEARTS */}
      <div className="absolute bottom-24 right-6 pointer-events-none">
        <AnimatePresence>
          {hearts.map(h => (
            <motion.div key={h.id} initial={{ y: 0 }} animate={{ y: -300, x: h.x, opacity: 0, scale: 2 }} className="absolute bottom-0 text-red-500">
              <Heart size={30} fill="currentColor" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ACTION BAR */}
      <div className="p-4 bg-zinc-900/50 backdrop-blur-xl rounded-t-[2.5rem] border-t border-white/10 flex items-center gap-3">
        <input 
          type="text" value={message} onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder="Say something..."
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white outline-none focus:border-red-500"
        />
        
        <button 
          onClick={() => setShowGifts(!showGifts)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${showGifts ? 'bg-yellow-500 text-black' : 'bg-white/10 text-yellow-500'}`}
        >
          <Gift size={20} />
        </button>

        <motion.button whileTap={{ scale: 0.6 }} onClick={triggerHeart} className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white">
          <Heart size={24} fill="currentColor" stroke="none" />
        </motion.button>
      </div>

      {/* GIFT MENU POPUP */}
      <AnimatePresence>
        {showGifts && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="absolute bottom-24 left-0 right-0 bg-black/90 p-6 rounded-[2rem] border border-white/10 grid grid-cols-4 gap-2 z-50 shadow-2xl"
          >
            {LUXURY_GIFTS.map(g => (
              <button key={g.id} onClick={() => sendGift(g)} className="flex flex-col items-center p-2 hover:bg-white/5 rounded-xl transition-all">
                <div className="text-3xl mb-1">{g.icon}</div>
                <span className="text-[9px] text-white/60 font-bold uppercase">{g.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
