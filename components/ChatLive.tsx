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
  { emoji: '🚀', label: 'Rocket', color: '#8a2be2' }
];

export default function ChatLive() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', username: 'Alex22', text: 'Salutare! 🔥', color: '#fbbf24' },
    { id: '2', username: 'Maria', text: 'Super stream!', color: '#60a5fa' },
  ]);
  const [showGifts, setShowGifts] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const triggerConfetti = (emoji: string) => {
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * 40,
      y: 40 + Math.random() * 20,
      emoji: emoji
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => setParticles([]), 1500);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      username: 'Tu',
      text: inputValue,
      color: '#fbbf24'
    };
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
  };

  return (
    <div className="relative h-full w-full flex flex-col justify-end overflow-visible px-4">
      
      {/* 1. LAYER CONFETTI / PARTICULE */}
      <div className="absolute inset-0 pointer-events-none z-[100]">
        {particles.map((p) => (
          <div 
            key={p.id} 
            className="absolute text-2xl animate-ping opacity-0"
            style={{ 
              left: `${p.x}%`, 
              top: `${p.y}%`,
              animation: `confetti-fly 1.5s ease-out forwards`
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* 2. CHAT FLOW (Transparent cu Linii Galbene) */}
      <div 
        ref={scrollRef}
        className="overflow-y-auto max-h-[280px] space-y-3 pb-6 scrollbar-hide"
        style={{ WebkitMaskImage: 'linear-gradient(to top, black 80%, transparent 100%)' }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="w-[3px] h-5 bg-yellow-400 shadow-[0_0_8px_#fbbf24] rounded-full mt-1 shrink-0" />
            <div className="flex flex-col">
              <span className="font-black text-[11px] tracking-tighter uppercase opacity-70" style={{ color: msg.color }}>{msg.username}</span>
              <span className="text-white text-[14px] font-medium drop-shadow-md">{msg.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. INPUT & GIFTS PANEL */}
      <div className="relative z-[60] pb-4">
        {/* MENIU CADOURI (Se deschide în sus) */}
        {showGifts && (
          <div className="absolute bottom-full mb-4 left-0 right-0 bg-black/40 backdrop-blur-3xl p-4 rounded-3xl border border-white/10 flex justify-around animate-in zoom-in-95 duration-200">
            {GIFT_OPTIONS.map((gift) => (
              <button
                key={gift.label}
                onClick={() => { triggerConfetti(gift.emoji); setShowGifts(false); }}
                className="flex flex-col items-center gap-1 hover:scale-125 transition-transform"
              >
                <span className="text-3xl drop-shadow-lg">{gift.emoji}</span>
                <span className="text-[9px] font-bold text-white/50 tracking-tighter uppercase">{gift.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* BARĂ INPUT */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowGifts(!showGifts)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border ${showGifts ? 'bg-yellow-400 border-yellow-400 text-black shadow-[0_0_20px_#fbbf24]' : 'bg-white/10 border-white/10 text-white'}`}
          >
            🎁
          </button>
          
          <div className="flex-1 relative flex items-center">
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Adaugă un comentariu..." 
              className="w-full h-12 bg-white/10 backdrop-blur-md rounded-full px-5 pr-12 text-sm border border-white/5 focus:border-yellow-400/50 outline-none transition-all"
            />
            {inputValue && (
              <button 
                onClick={handleSendMessage}
                className="absolute right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-in zoom-in spin-in-12 duration-300 shadow-lg"
              >
                <span className="text-black text-xs font-bold">↑</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes confetti-fly {
          0% { transform: translate(0,0) scale(0); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translate(calc(Math.random() * 200px - 100px), -150px) scale(1.5); opacity: 0; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
