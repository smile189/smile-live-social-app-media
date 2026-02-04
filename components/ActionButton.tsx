"use client";

import { useState } from "react";
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  MoreHorizontal,
  ShieldAlert,
  FileText,
  Ban,
  Flag,
  X,
  Send,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function SidebarActions() {
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState<{ id: number; left: number; delay: number }[]>([]);

  // Efect de Like SLOW MOTION
  const triggerLike = () => {
    const id = Date.now();
    const randomLeft = Math.floor(Math.random() * 100) - 50;
    const randomDelay = Math.random() * 0.5; // variație mică la pornire
    setLikes((prev) => [...prev, { id, left: randomLeft, delay: randomDelay }]);
    
    // Eliminăm inima după ce termină animația lungă (3s)
    setTimeout(() => {
      setLikes((prev) => prev.filter((like) => like.id !== id));
    }, 3000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "SmileLive", url: window.location.href }); } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const mainActions = [
    { icon: Heart, count: "1.2M", active: "group-hover:text-red-500", onClick: triggerLike },
    { icon: MessageSquare, count: "45K", active: "group-hover:text-blue-400", onClick: () => setShowComments(true) },
    { icon: Bookmark, count: "89K", active: "group-hover:text-yellow-400", onClick: () => {} },
    { icon: Share2, count: "Share", active: "group-hover:text-green-400", onClick: handleShare },
  ];

  return (
    <>
      <div className="absolute right-4 bottom-[15vh] flex flex-col items-center gap-6 z-40">
        
        {/* ANIMATIE INIMIOARE SLOW MOTION */}
        {likes.map((like) => (
          <div
            key={like.id}
            className="absolute bottom-10 pointer-events-none animate-heart-slow"
            style={{ 
              left: `${like.left}px`,
              animationDelay: `${like.delay}s`
            }}
          >
            <Heart 
              size={42} 
              fill="url(#heart-gradient)" 
              className="drop-shadow-[0_0_20px_rgba(255,50,50,0.6)]" 
            />
            {/* Gradient pentru inimi mai wow */}
            <svg width="0" height="0">
              <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4d4d" />
                <stop offset="100%" stopColor="#ff0000" />
              </linearGradient>
            </svg>
          </div>
        ))}

        {/* AVATAR */}
        <div className="relative mb-4 group cursor-pointer">
          <div className="w-14 h-14 rounded-full border-2 border-white/30 p-0.5 overflow-hidden backdrop-blur-xl bg-white/10">
            <div className="w-full h-full rounded-full bg-linear-to-tr from-zinc-900 to-zinc-700 flex items-center justify-center font-black text-white/50 text-[10px]">USER</div>
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-black text-[14px] font-black shadow-xl">+</div>
        </div>

        {mainActions.map((item, idx) => (
          <button key={idx} onClick={item.onClick} className="group flex flex-col items-center gap-1.5 transition-all active:scale-75">
            <div className="relative p-3 rounded-full group-hover:bg-white/10 transition-colors backdrop-blur-md border border-white/5">
              <item.icon size={32} strokeWidth={1.8} className={`text-white transition-all duration-300 drop-shadow-2xl ${item.active}`} />
            </div>
            <span className="text-[10px] font-black text-white tracking-widest uppercase drop-shadow-md">{item.count}</span>
          </button>
        ))}

        {/* MENIU MORE */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className={`mt-2 p-3 rounded-full transition-all ${showMenu ? "bg-white text-black" : "bg-white/10 text-white backdrop-blur-md"}`}>
            {showMenu ? <X size={24} /> : <MoreHorizontal size={28} />}
          </button>
          {showMenu && (
            <div className="absolute bottom-0 right-16 w-60 bg-zinc-900/95 backdrop-blur-3xl border border-white/10 rounded-[32px] p-4 shadow-2xl animate-in fade-in slide-in-from-right-8">
              <div className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-widest text-white/60">
                <a href="#" className="flex items-center gap-4 p-3 hover:bg-white/10 hover:text-white rounded-2xl"><FileText size={18} /> Terms & Policy</a>
                <a href="#" className="flex items-center gap-4 p-3 hover:bg-white/10 hover:text-white rounded-2xl"><ShieldAlert size={18} /> Privacy</a>
                <div className="h-[1px] bg-white/10 my-2" />
                <button className="flex items-center gap-4 p-3 hover:text-orange-400 rounded-2xl text-orange-500/80"><Ban size={18} /> Not Interested</button>
                <button className="flex items-center gap-4 p-3 hover:text-red-500 rounded-2xl text-red-500/80"><Flag size={18} /> Report</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MESAGERIE SATIN WHITE - ASCUNSĂ CORECT */}
      <div 
        className={`fixed bottom-[11vh] right-4 left-4 sm:left-auto sm:w-[440px] h-[60vh] z-50 transform transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)
        ${showComments ? "translate-y-0 opacity-100 scale-100 pointer-events-auto" : "translate-y-[120%] opacity-0 scale-95 pointer-events-none"}`}
      >
        <div className="flex flex-col h-full bg-white/90 backdrop-blur-[40px] rounded-[40px] border border-white shadow-[0_30px_100px_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="px-8 pt-8 pb-4 flex items-center justify-between font-black uppercase">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-zinc-900 rounded-2xl shadow-lg shadow-zinc-200"><MessageSquare size={18} className="text-white" /></div>
              <h3 className="text-zinc-900 text-xl tracking-tighter">Comments</h3>
            </div>
            <button onClick={() => setShowComments(false)} className="bg-zinc-100 p-3 rounded-2xl text-zinc-400"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 no-scrollbar">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-white shrink-0 shadow-sm" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="text-[11px] font-black text-zinc-900 flex items-center gap-1 uppercase">User_{i} <CheckCircle2 size={12} className="text-blue-500" /></span>
                  <p className="text-[14px] text-zinc-600 font-medium leading-relaxed bg-white/50 p-4 rounded-3xl rounded-tl-none border border-white">Satin glass effect active.</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white/50 border-t border-zinc-100">
            <div className="relative flex items-center bg-white border border-zinc-200 shadow-sm rounded-3xl p-2">
              <input type="text" placeholder="Add a comment..." className="flex-1 px-4 text-sm text-zinc-900 outline-none font-medium" />
              <button className="bg-zinc-950 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase shadow-xl active:scale-95 transition-all">Send</button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes heart-slow {
          0% { 
            transform: translateY(0) scale(0.5) rotate(0deg); 
            opacity: 0; 
          }
          15% { 
            opacity: 1; 
            transform: translateY(-50px) scale(1.2) rotate(-10deg); 
          }
          50% { 
            transform: translateY(-250px) scale(1.4) rotate(15deg) translateX(20px); 
          }
          100% { 
            transform: translateY(-600px) scale(1.8) rotate(-20deg) translateX(-20px); 
            opacity: 0; 
          }
        }
        .animate-heart-slow { 
          animation: heart-slow 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; 
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
