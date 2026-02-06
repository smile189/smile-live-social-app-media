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

  // SUPABASE REALTIME PLACEHOLDER
  // Aici vei folosi useEffect pentru a asculta canalul: 
  // const channel = supabase.channel('live-chat').on('postgres_changes', ...).subscribe()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const triggerSpectacularGift = (emoji: string) => {
    const id = Date.now();
    const xPos = 20 + Math.random() * 60;
    
    // 1. Trimite evenimentul către Supabase aici (ex: supabase.from('gifts').insert(...))
    
    setActiveGifts(prev => [...prev, { id, x: xPos, emoji }]);
    setShowGifts(false);
    
    // Curățare după animația lungă (3s)
    setTimeout(() => {
      setActiveGifts(prev => prev.filter(g => g.id !== id));
    }, 3000);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // 2. Aici vei face insert în Supabase: 
    // const { error } = await supabase.from('messages').insert([{ text: inputValue, user: ... }])

    const newMessage = { id: Date.now().toString(), username: 'Tu', text: inputValue, color: '#fbbf24' };
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
  };

  return (
    <div className="relative h-full w-full flex flex-col justify-end overflow-visible px-4">
      
      {/* 1. LAYER SPECTACULAR GIFTS (Zbor & Shockwave) */}
      <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
        {activeGifts.map((g) => (
          <div 
            key={g.id} 
            className="absolute bottom-20 flex flex-col items-center animate-gift-supernova"
            style={{ left: `${g.x}%` }}
          >
            {/* Flash de lumină / Glow exterior */}
            <div className="absolute w-32 h-32 bg-white/40 rounded-full blur-[60px] animate-pulse" />
            
            {/* Particule radiale (Explozie) */}
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-particle-out"
                style={{ '--delay': `${i * 0.1}s`, '--angle': `${i * 45}deg` } as any}
              />
            ))}

            {/* Emoji-ul Principal */}
            <span className="text-8xl drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] filter brightness-125">
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
          <div className="grid grid-cols-4 gap-3 bg-black/80 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/10 animate-in slide-in-from-bottom-10 duration-300">
            {GIFT_OPTIONS.map((gift) => (
              <button
                key={gift.label}
                onClick={() => triggerSpectacularGift(gift.emoji)}
                className="flex flex-col items-center gap-2 hover:scale-125 transition-transform active:scale-90"
              >
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/5">
                  {gift.emoji}
                </div>
                <span className="text-[9px] font-black text-white/30 tracking-widest">{gift.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowGifts(!showGifts)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${showGifts ? 'bg-yellow-400 border-white rotate-12 scale-110' : 'bg-white/5 border-white/10 text-white'}`}
          >
            <span className="text-2xl drop-shadow-md">🎁</span>
          </button>
          
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
      <span className="text-lg font-bold"> ➤</span>
    </button>
  )}
</div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes gift-supernova {
          0% { transform: translateY(0) scale(0) rotate(0deg); opacity: 0; filter: blur(20px); }
          20% { transform: translateY(-100px) scale(1.5) rotate(-10deg); opacity: 1; filter: blur(0px); }
          40% { transform: translateY(-250px) scale(1.2) rotate(10deg); }
          100% { transform: translateY(-1000px) scale(0.5) rotate(45deg); opacity: 0; }
        }
        @keyframes particle-out {
          0% { transform: rotate(var(--angle)) translateY(0); opacity: 1; }
          100% { transform: rotate(var(--angle)) translateY(-80px); opacity: 0; }
        }
        .animate-gift-supernova { animation: gift-supernova 3s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        .animate-particle-out { animation: particle-out 1s var(--delay) ease-out forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
