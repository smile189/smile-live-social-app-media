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
  const [taps, setTaps] = useState<{ id: number; x: number; y: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const playPopSound = () => {
    const audio = new Audio('https://assets.mixkit.co');
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const handleTap = (e: any) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const id = Date.now();
    setTaps(prev => [...prev, { id, x, y }]);
    setTimeout(() => setTaps(prev => prev.filter(t => t.id !== id)), 2000);
  };

  const triggerSpectacularGift = (emoji: string) => {
    const id = Date.now();
    const xPos = 20 + Math.random() * 60;
    playPopSound();
    setActiveGifts(prev => [...prev, { id, x: xPos, emoji }]);
    setShowGifts(false);
    setTimeout(() => setActiveGifts(prev => prev.filter(g => g.id !== id)), 4000);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const newMessage = { id: Date.now().toString(), username: 'You', text: inputValue, color: '#fbbf24' };
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
  };

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col justify-end overflow-hidden select-none touch-none bg-transparent">
      
      {/* Zona detectie Tap */}
      <div className="absolute inset-0 z-0 cursor-pointer" onClick={handleTap} onTouchStart={handleTap} />

      {/* Inimi plutitoare */}
      <div className="fixed inset-0 pointer-events-none z-[50]">
        {taps.map(tap => (
          <div key={tap.id} className="absolute animate-tap-float text-6xl drop-shadow-2xl" style={{ left: tap.x - 30, top: tap.y - 30 }}>🥰</div>
        ))}
      </div>

      {/* Cadouri Mari & Confetti */}
      <div className="fixed inset-0 pointer-events-none z-[60] flex justify-center items-center">
        {activeGifts.map((g) => (
          <div key={g.id} className="absolute bottom-[20%] animate-gift-spectacular flex flex-col items-center">
            <div className="absolute inset-0 flex items-center justify-center scale-150">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="absolute w-2 h-6 rounded-full animate-confetti-burst"
                  style={{ 
                    backgroundColor: ['#fbbf24', '#f472b6', '#00d4ff', '#a855f7'][i % 4], 
                    '--angle': `${i * 22.5}deg`,
                    transform: `rotate(${i * 22.5}deg)`
                  } as any}
                />
              ))}
            </div>
            <span className="text-[12rem] drop-shadow-[0_0_50px_rgba(255,255,255,0.6)] animate-shimmer">{g.emoji}</span>
          </div>
        ))}
      </div>

      {/* Container UI - Max width pe desktop, full pe mobil */}
      <div className="relative z-[100] w-full max-w-[500px] mx-auto px-4 pb-8 flex flex-col gap-4">
        
        {/* Mesaje Chat */}
        <div 
          ref={scrollRef}
          className="flex flex-col gap-3 overflow-y-auto max-h-[35vh] scrollbar-hide pointer-events-none"
          style={{ WebkitMaskImage: 'linear-gradient(to top, black 80%, transparent 100%)' }}
        >
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 animate-in slide-in-from-bottom-2 fade-in duration-500 bg-black/20 backdrop-blur-sm p-2 rounded-xl self-start border border-white/5">
              <div className="w-[3px] h-6 bg-yellow-400 shadow-[0_0_12px_#fbbf24] rounded-full mt-1 shrink-0 animate-pulse" />
              <div className="flex flex-col">
                <span className="font-black text-[10px] tracking-widest uppercase" style={{ color: msg.color }}>{msg.username}</span>
                <span className="text-white text-[15px] font-bold drop-shadow-xl leading-tight">{msg.text}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Butoane Actiuni */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-end pointer-events-auto">
            <button onClick={() => { if(navigator.share) navigator.share({url: window.location.href}) }} className="w-12 h-12 flex flex-col items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 active:scale-75 transition-all">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current"><path d="M14.545 3l7.455 7.455-7.455 7.455V13.8C8.8 13.8 4.8 15.6 2 19.6c.6-5.6 4-11.2 12.545-12.4V3z" /></svg>
            </button>
          </div>

          {showGifts && (
            <div className="grid grid-cols-4 gap-3 bg-black/90 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/10 animate-in slide-in-from-bottom-10 pointer-events-auto shadow-2xl">
              {GIFT_OPTIONS.map((gift) => (
                <button key={gift.label} onClick={() => triggerSpectacularGift(gift.emoji)} className="flex flex-col items-center gap-2 active:scale-90 transition-transform">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl border border-white/5">{gift.emoji}</div>
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{gift.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl h-14 px-5 flex items-center shadow-2xl focus-within:border-yellow-400/50 transition-all">
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Smile words..." 
                className="bg-transparent w-full text-sm outline-none text-white placeholder:text-white/20"
              />
              {inputValue.trim() && (
                <button onClick={handleSendMessage} className="bg-yellow-400 text-black w-10 h-8 rounded-lg font-bold transition-all active:scale-90">➤</button>
              )}
            </div>
            <button onClick={() => setShowGifts(!showGifts)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${showGifts ? 'bg-yellow-400 border-white scale-110' : 'bg-white/5 border-white/10 text-white'}`}>
              <span className="text-2xl">🎁</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        
        @keyframes tap-float {
          0% { transform: translateY(0) scale(0.5); opacity: 1; }
          100% { transform: translateY(-200px) scale(2); opacity: 0; }
        }
        .animate-tap-float { animation: tap-float 1s ease-out forwards; }

        @keyframes gift-spectacular {
          0% { transform: scale(0) translateY(100px); opacity: 0; }
          20% { transform: scale(1.2) translateY(0); opacity: 1; }
          80% { transform: scale(1) translateY(0); opacity: 1; }
          100% { transform: scale(3) translateY(-100px); opacity: 0; }
        }
        .animate-gift-spectacular { animation: gift-spectacular 3s ease-in-out forwards; }

        @keyframes confetti-burst {
          0% { transform: rotate(var(--angle)) translateY(0); opacity: 1; }
          100% { transform: rotate(var(--angle)) translateY(-150px); opacity: 0; }
        }
        .animate-confetti-burst { animation: confetti-burst 1s ease-out forwards; }

        @keyframes shimmer {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.5) drop-shadow(0 0 30px gold); }
          100% { filter: brightness(1); }
        }
        .animate-shimmer { animation: shimmer 1s infinite; }
      `}</style>
    </div>
  );
}
