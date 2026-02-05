"use client";

import { useState, useEffect, useRef } from "react";
import { X, Users, Heart, Gift, Send, Zap, AlertTriangle, Sparkles, Share2, Crown, Trophy, Activity, Loader2, Coins, Flame } from "lucide-react";
import { useRouter } from "next/navigation";

interface FloatingHeart { id: number; x: number; }
interface ChatMsg { id: number; user: string; text: string; type?: 'gift' | 'system'; giftIcon?: string; color?: string; }

export default function LivePage() {
  const router = useRouter();
  const [isCdnLoading, setIsCdnLoading] = useState(true);
  const [input, setInput] = useState("");
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 1, user: "SYSTEM", text: "SIGNAL ACQUISITION STARTED...", type: 'system' },
    { id: 2, user: "SMILE_BOT", text: "Waiting for stream source... 🔴", color: "text-red-600" },
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const giftList = [
    { name: 'Rose', icon: '🌹', cost: 1 }, { name: 'Heart', icon: '🫰', cost: 5 },
    { name: 'Rocket', icon: '🚀', cost: 1000 }, { name: 'Crown', icon: '👑', cost: 5000 },
    { name: 'Lion', icon: '🦁', cost: 30000 }, { name: 'Smile Gold', icon: '🟡', cost: 100000 }
  ];

  // Auto-scroll logic (TikTok Style)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setTimeout(() => setIsCdnLoading(false), 1000);
  }, []);

  const sendHeart = () => {
    const id = Date.now();
    setHearts((prev) => [...prev, { id, x: Math.random() * 80 - 40 }]);
    setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== id)), 2000);
  };

  const handleSendGift = (gift: typeof giftList[0]) => {
    setMessages(prev => [...prev, { id: Date.now(), user: "YOU", text: `SENT ${gift.name.toUpperCase()}!`, type: 'gift', giftIcon: gift.icon }]);
    setShowGiftPanel(false);
    for(let i=0; i<8; i++) setTimeout(sendHeart, i * 100);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), user: "YOU", text: input.toUpperCase() }]);
    setInput("");
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col lg:flex-row overflow-hidden text-white font-mono selection:bg-red-600">
      
      {/* --- BROADCAST VIEWPORT --- */}
      <div className="relative flex-1 flex items-center justify-center border-r border-white/10 overflow-hidden">
        
        {/* Cinematic Black & Red Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2b0000_0%,_#000000_100%)] opacity-60" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com')]" />

        {/* Central "Waiting" Engine */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="relative">
            <div className="absolute inset-0 w-32 h-32 bg-red-600/30 rounded-full animate-ping blur-xl" />
            <div className="w-24 h-24 bg-black border-2 border-red-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.5)]">
               <Activity className="text-red-600 animate-pulse" size={40} />
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none">
              STREAM <span className="text-red-600">OFFLINE</span>
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3">
               <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
               <p className="text-white/40 text-xs font-bold uppercase tracking-[0.4em]">Establishing CDN link...</p>
            </div>
          </div>
        </div>

        {/* --- OVERLAY HUD --- */}
        <div className="absolute inset-0 p-4 lg:p-10 flex flex-col justify-between pointer-events-none z-50">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 bg-black/80 border border-red-600/20 p-2 pr-6 rounded-lg pointer-events-auto shadow-2xl">
               <div className="w-10 h-10 bg-red-600 flex items-center justify-center font-black text-black">S</div>
               <div className="flex flex-col">
                  <span className="text-sm font-black uppercase italic tracking-tighter leading-none">SMILE_LIVE_TEST</span>
                  <span className="text-[10px] font-bold text-red-600 mt-1 uppercase flex items-center gap-2">
                    <Users size={12}/> 12,482 ONLINE
                  </span>
               </div>
            </div>
            
            <button onClick={() => setShowExitConfirm(true)} className="p-4 bg-black border border-white/10 hover:bg-red-600 rounded-full pointer-events-auto transition-all">
              <X size={24} />
            </button>
          </div>

          {/* CHAT - TikTok Style (Bottom Left) */}
          <div className="mt-auto mb-24 lg:mb-0 relative w-full max-w-[340px] pointer-events-auto">
            {/* Mask to fade messages at the top */}
            <div className="absolute inset-x-0 -top-10 h-20 bg-gradient-to-b from-transparent to-transparent z-10 pointer-events-none" />
            
            <div className="max-h-[35vh] overflow-y-auto no-scrollbar space-y-3 flex flex-col pt-10 mask-tiktok">
              {messages.map((msg) => (
                <div key={msg.id} className={`animate-in slide-in-from-left-4 duration-300 ${msg.type === 'gift' ? 'scale-110 origin-left shadow-lg' : ''}`}>
                  <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-sm border ${
                    msg.type === 'gift' ? 'bg-red-600/20 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 
                    msg.type === 'system' ? 'bg-white/5 border-white/10 italic' : 'bg-black/60 border-white/5'
                  }`}>
                    <span className={`text-[10px] font-black ${msg.color || 'text-white/40'}`}>@{msg.user}:</span>
                    <span className={`text-xs font-bold leading-tight ${msg.type === 'gift' ? 'text-red-500' : 'text-white/80'}`}>
                      {msg.text}
                    </span>
                    {msg.giftIcon && <span className="text-xl animate-bounce">{msg.giftIcon}</span>}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* HEARTS */}
          <div className="absolute bottom-32 right-10 h-80 w-20 flex items-end justify-center pointer-events-none">
            {hearts.map((h) => (
              <div key={h.id} className="absolute text-red-600 animate-heart-fly" style={{ left: `${h.x}px` }}>
                <Heart size={32} fill="currentColor" />
              </div>
            ))}
          </div>

          {/* MOBILE INPUT & ACTIONS */}
          <div className="absolute bottom-6 left-4 right-4 flex items-center gap-3 pointer-events-auto lg:hidden">
            <form onSubmit={handleSendMessage} className="relative flex-1">
              <input 
                type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="TYPE MESSAGE..." 
                className="w-full bg-black border border-white/20 rounded-lg px-6 py-4 text-xs font-bold uppercase outline-none focus:border-red-600 transition-all placeholder:text-white/10"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600"><Send size={18} /></button>
            </form>
            <button onClick={() => setShowGiftPanel(true)} className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center"><Gift size={22} /></button>
            <button onClick={sendHeart} className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] active:scale-75 transition-all"><Heart size={26} fill="currentColor" /></button>
          </div>
        </div>
      </div>

      {/* --- DESKTOP PRO SIDEBAR --- */}
      <div className="hidden lg:flex w-[450px] bg-black flex-col border-l border-white/5">
        <div className="h-[80px] px-8 border-b border-white/5 flex items-center justify-between">
           <span className="text-xs font-black uppercase tracking-[0.3em] text-red-600">COMMAND_CENTER</span>
           <Activity size={18} className="text-white/20" />
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
           {messages.map(msg => (
             <div key={msg.id} className="group animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">@{msg.user}</span>
                   <div className="h-[1px] flex-1 bg-white/5" />
                </div>
                <div className={`p-4 rounded-sm border ${msg.type === 'gift' ? 'bg-red-600/5 border-red-600/20' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                   <p className={`text-sm ${msg.type === 'gift' ? 'text-red-500 font-black' : 'text-white/60'}`}>{msg.text} {msg.giftIcon}</p>
                </div>
             </div>
           ))}
           <div ref={chatEndRef} />
        </div>

        <div className="p-8 bg-[#050505] border-t border-white/5 space-y-4">
           <button onClick={() => setShowGiftPanel(true)} className="w-full py-4 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Open Gift Store</button>
           <form onSubmit={handleSendMessage} className="relative">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="ENTER DATA..." className="w-full bg-black border border-white/10 rounded-lg p-5 text-sm uppercase font-bold focus:border-red-600 outline-none" />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-red-600 rounded-md"><Send size={18}/></button>
           </form>
        </div>
      </div>

      {/* --- GIFT PANEL --- */}
      {showGiftPanel && (
        <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowGiftPanel(false)} />
          <div className="relative w-full max-w-sm bg-black border border-white/10 rounded-2xl p-8 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
               <span className="text-xs font-black uppercase tracking-[0.2em] text-red-600">GIFT_INVENTORY</span>
               <button onClick={() => setShowGiftPanel(false)}><X size={20}/></button>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {giftList.map(g => (
                <button key={g.name} onClick={() => handleSendGift(g)} className="flex flex-col items-center gap-2 group transition-transform active:scale-90">
                   <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center text-3xl group-hover:bg-red-600 transition-all">{g.icon}</div>
                   <span className="text-[8px] font-black uppercase text-white/30">{g.cost}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- EXIT MODAL --- */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <div className="bg-black border border-red-600/30 p-10 rounded-lg w-full max-w-xs text-center">
             <AlertTriangle className="text-red-600 mx-auto mb-6" size={48} />
             <h3 className="text-xl font-black uppercase italic mb-8">ABORT BROADCAST?</h3>
             <div className="flex flex-col gap-4">
                <button onClick={() => router.push("/")} className="w-full py-4 bg-red-600 font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.3)]">CONFIRM_EXIT</button>
                <button onClick={() => setShowExitConfirm(false)} className="w-full py-4 bg-white/5 font-black uppercase text-xs tracking-widest">CANCEL</button>
             </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes heartFly {
          0% { transform: translateY(0) scale(1) rotate(0); opacity: 1; }
          100% { transform: translateY(-400px) scale(2) rotate(45deg); opacity: 0; }
        }
        .animate-heart-fly { animation: heartFly 2s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .mask-tiktok {
          mask-image: linear-gradient(to top, black 80%, transparent 100%);
          -webkit-mask-image: linear-gradient(to top, black 80%, transparent 100%);
        }
      `}</style>
    </div>
  );
}
