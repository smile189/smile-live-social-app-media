"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  username: string;
  text: string;
  color?: string;
}

const GIFT_OPTIONS = [
  { emoji: '💎', label: 'Diamond', color: '#00d4ff' },
  { emoji: '🔥', label: 'Fire', color: '#ff4d00' },
  { emoji: '👑', label: 'Crown', color: '#ffcc00' },
  { emoji: '🚀', label: 'Rocket', color: '#a855f7' },
  { emoji: '🎁', label: 'Surprise', color: '#ef4444' },
  { emoji: '🦁', label: 'Lion', color: '#f59e0b' },
  { emoji: '🌹', label: 'Rose', color: '#e11d48' },
  { emoji: '🍦', label: 'Ice Cream', color: '#f472b6' },
  { emoji: '⚡', label: 'Energy', color: '#fbbf24' },
  { emoji: '🦄', label: 'Unicorn', color: '#d946ef' },
  { emoji: '🛸', label: 'UFO', color: '#22c55e' },
  { emoji: '🏆', label: 'Trophy', color: '#facc15' }
];

export default function ChatLive() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showGifts, setShowGifts] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeGifts, setActiveGifts] = useState<{ id: number; x: number; emoji: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Funcție pentru sunetul spectaculos
  const playPopSound = () => {
    const audio = new Audio('https://assets.mixkit.co');
    audio.volume = 0.4;
    audio.play().catch(() => console.log("Audio interaction required"));
  };

  const triggerSpectacularGift = (emoji: string) => {
    const id = Date.now();
    const xPos = 20 + Math.random() * 60;
    
    playPopSound(); // Activează sunetul la click
    setActiveGifts(prev => [...prev, { id, x: xPos, emoji }]);
    setShowGifts(false);
    
    // Curățare după animația lungă (7s)
    setTimeout(() => {
      setActiveGifts(prev => prev.filter(g => g.id !== id));
    }, 7000);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const newMessage = { id: Date.now().toString(), username: 'Tu', text: inputValue, color: '#fbbf24' };
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
  };

  return (
    <div className="relative h-full w-full flex flex-col justify-end overflow-visible px-4">
      
      {/* 1. LAYER SPECTACULOS (Confeti + Emoji Centrat + Zbor Lin) */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex justify-center">
        {activeGifts.map((g) => (
          <div 
            key={g.id} 
            className="absolute bottom-10 animate-gift-spectacular flex flex-col items-center"
            style={{ left: `calc(50% + ${(g.x - 50) / 4}%)` }}
          >
            {/* Explozie de Confeti */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(16)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-confetti-burst"
                  style={{ 
                    backgroundColor: ['#fbbf24', '#f472b6', '#00d4ff', '#a855f7'][i % 4],
                    '--angle': `${i * 22.5}deg`,
                    '--delay': `${Math.random() * 0.2}s`
                  } as any}
                />
              ))}
            </div>

            {/* Emoji-ul Principal Strălucitor */}
            <span className="text-[10rem] drop-shadow-[0_0_50px_rgba(255,255,255,0.4)] brightness-110 animate-shimmer select-none">
              {g.emoji}
            </span>
          </div>
        ))}
      </div>

      {/* 2. CHAT FLOW (TikTok Style) */}
      <div 
        ref={scrollRef}
        className="overflow-y-auto max-h-[300px] space-y-3 pb-8 scrollbar-hide"
        style={{ WebkitMaskImage: 'linear-gradient(to top, black 80%, transparent 100%)' }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-3 animate-in slide-in-from-bottom-2 fade-in duration-500">
            <div className="w-[3px] h-6 bg-yellow-400 shadow-[0_0_12px_#fbbf24] rounded-full mt-1 shrink-0 animate-pulse" />
            <div className="flex flex-col">
              <span className="font-black text-[10px] tracking-widest uppercase text-white/40" style={{ color: msg.color }}>{msg.username}</span>
              <span className="text-white text-[15px] font-bold drop-shadow-xl">{msg.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. CONTROLS AREA */}
      <div className="relative z-[110] pb-6 flex flex-col gap-4">
        {showGifts && (
          <div className="grid grid-cols-4 gap-3 bg-black/80 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/10 animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
            {GIFT_OPTIONS.map((gift) => (
              <button
                key={gift.label}
                onClick={() => triggerSpectacularGift(gift.emoji)}
                className="flex flex-col items-center gap-2 hover:scale-125 transition-transform active:scale-90"
              >
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/5">
                  {gift.emoji}
                </div>
                <span className="text-[9px] font-black text-white/30 tracking-widest uppercase">{gift.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl h-14 px-5 flex items-center shadow-2xl focus-within:border-yellow-400/50 transition-all group">
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Smile words..." 
              className="bg-transparent w-full text-sm outline-none text-white placeholder:text-white/20"
            />
            {inputValue.trim() && (
              <button 
                onClick={handleSendMessage}
                className="bg-yellow-400 hover:bg-yellow-300 text-black w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 animate-in zoom-in slide-in-from-right-2"
              >
                <span className="text-lg font-bold">➤</span>
              </button>
            )}
          </div>

          <button 
            onClick={() => setShowGifts(!showGifts)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${showGifts ? 'bg-yellow-400 border-white rotate-12 scale-110' : 'bg-white/5 border-white/10 text-white'}`}
          >
            <span className="text-2xl drop-shadow-md">🎁</span>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gift-spectacular {
          0% { transform: translateY(0) scale(0); opacity: 0; filter: brightness(2); }
          10% { transform: translateY(-150px) scale(1.3); opacity: 1; filter: brightness(1.2); }
          100% { transform: translateY(-2200px) scale(0.6); opacity: 0; filter: blur(10px); }
        }

        @keyframes confetti-burst {
          0% { transform: rotate(var(--angle)) translateY(0) scale(1); opacity: 1; }
          100% { transform: rotate(var(--angle)) translateY(-250px) scale(0); opacity: 0; }
        }

        @keyframes shimmer {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 30px rgba(255,255,255,0.2)); }
          50% { filter: brightness(1.5) drop-shadow(0 0 60px rgba(252,211,77,0.8)); }
        }

        .animate-gift-spectacular { 
          animation: gift-spectacular 7s cubic-bezier(0.15, 0.85, 0.3, 1) forwards; 
        }

        .animate-confetti-burst {
          animation: confetti-burst 1.5s var(--delay) ease-out forwards;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite alternate;
        }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
