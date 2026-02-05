"use client";

import { useState, useRef, useEffect } from "react";
import { Gift, Heart, Star, Crown, Gem, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const GIFTS = [
  { id: "rose", icon: Star, label: "Rose", color: "#f472b6" },
  { id: "gem", icon: Gem, label: "Gem", color: "#60a5fa" },
  { id: "crown", icon: Crown, label: "Crown", color: "#fbbf24" },
  { id: "rocket", icon: Rocket, label: "Rocket", color: "#a855f7" },
];

export default function ActionStream() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [hearts, setHearts] = useState<any[]>([]);
  const [showGifts, setShowGifts] = useState(false);
  const [bigGift, setBigGift] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  /* auto scroll */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /* hide big gift */
  useEffect(() => {
    if (!bigGift) return;
    const t = setTimeout(() => setBigGift(null), 2500);
    return () => clearTimeout(t);
  }, [bigGift]);

  const sendMessage = (text?: string, isGift = false) => {
    const content = text || message;
    if (!content.trim()) return;

    setMessages(prev => [
      ...prev.slice(-12),
      { id: Date.now(), text: content, isGift },
    ]);

    setMessage("");
  };

  const sendGift = (gift: any) => {
    setBigGift(gift);

    confetti({
      particleCount: 120,
      spread: 60,
      origin: { y: 0.7 },
      colors: [gift.color, "#ffffff"],
    });

    sendMessage(`Sent a ${gift.label}! 🎁`, true);
    setShowGifts(false);
  };

  const triggerHeart = () => {
    const id = Date.now();
    setHearts(prev => [...prev, { id, x: Math.random() * 80 - 40 }]);

    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, 1800);
  };

  return (
    <div className="flex flex-col h-[70vh] max-w-md w-full relative">

      {/* BIG GIFT */}
      <AnimatePresence>
        {bigGift && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="bg-black/80 backdrop-blur-xl p-10 rounded-3xl text-center border border-white/10">
              <bigGift.icon size={70} color={bigGift.color} />
              <p className="text-white font-bold mt-3 text-xl">
                {bigGift.label}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {messages.map(m => (
          <div
            key={m.id}
            className={`p-3 rounded-2xl text-sm ${
              m.isGift
                ? "bg-yellow-500/20 border border-yellow-400/40"
                : "bg-white/5"
            }`}
          >
            <span className="text-white">{m.text}</span>
          </div>
        ))}
      </div>

      {/* HEARTS */}
      <div className="absolute bottom-24 right-5 pointer-events-none">
        <AnimatePresence>
          {hearts.map(h => (
            <motion.div
              key={h.id}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -250, x: h.x, opacity: 0, scale: 1.8 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 text-red-500"
            >
              <Heart fill="currentColor" stroke="none" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* BAR */}
      <div className="p-3 flex gap-2 bg-zinc-900/70 backdrop-blur-xl border-t border-white/10">

        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Say something..."
          className="flex-1 bg-white/5 rounded-full px-4 py-2 text-white outline-none"
        />

        <button
          onClick={() => setShowGifts(v => !v)}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-yellow-400"
        >
          <Gift size={18} />
        </button>

        <motion.button
          whileTap={{ scale: 0.7 }}
          onClick={triggerHeart}
          className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center"
        >
          <Heart fill="white" stroke="none" size={18} />
        </motion.button>
      </div>

      {/* GIFTS */}
      <AnimatePresence>
        {showGifts && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            className="absolute bottom-20 left-2 right-2 bg-black/95 p-4 rounded-2xl grid grid-cols-4 gap-2"
          >
            {GIFTS.map(g => (
              <button
                key={g.id}
                onClick={() => sendGift(g)}
                className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-xl"
              >
                <g.icon color={g.color} />
                <span className="text-[10px] text-white/70">
                  {g.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
