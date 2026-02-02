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
  X
} from "lucide-react";

export default function SidebarActions() {
  const [showMenu, setShowMenu] = useState(false);

  // Funcție de Share Nativă (pentru Mobile)
  const handleShare = async () => {
    const shareData = {
      title: "SmileLive App",
      text: "Check out this amazing stream!",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: Copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const mainActions = [
    { icon: Heart, count: "1.2M", active: "group-hover:text-red-500", onClick: () => {} },
    { icon: MessageSquare, count: "45K", active: "group-hover:text-blue-400", onClick: () => {} },
    { icon: Bookmark, count: "89K", active: "group-hover:text-yellow-400", onClick: () => {} },
    { icon: Share2, count: "Share", active: "group-hover:text-green-400", onClick: handleShare },
  ];

  return (
    <div className="absolute right-4 bottom-[15vh] flex flex-col items-center gap-6 z-40">
      
      {/* PROFIL CU AVATAR */}
      <div className="relative mb-4 group cursor-pointer">
        <div className="w-14 h-14 rounded-full border-2 border-white/20 p-0.5 overflow-hidden backdrop-blur-md">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-700 flex items-center justify-center">
             <span className="text-[10px] font-black text-white/50">USER</span>
          </div>
        </div>
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-black text-xs font-black shadow-lg">
          +
        </div>
      </div>

      {/* ACTIUNI PRINCIPALE */}
      {mainActions.map((item, idx) => (
        <button
          key={idx}
          onClick={item.onClick}
          className="group flex flex-col items-center gap-1.5 transition-transform active:scale-90"
        >
          <div className="relative p-2 rounded-full group-hover:bg-white/5 transition-colors">
            <item.icon
              size={30}
              strokeWidth={1.8}
              className={`text-white transition-all duration-300 drop-shadow-xl ${item.active}`}
            />
          </div>
          <span className="text-[10px] font-black text-white tracking-tighter shadow-black drop-shadow-md">
            {item.count}
          </span>
        </button>
      ))}

      {/* MENIU "MORE" (CELE 3 PUNCTE) */}
      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className={`mt-2 p-2 rounded-full transition-all ${showMenu ? "bg-white text-black scale-110" : "text-white/60 hover:text-white"}`}
        >
          {showMenu ? <X size={24} /> : <MoreHorizontal size={28} />}
        </button>

        {/* POPUP MENIU PREMIUM */}
        {showMenu && (
          <div className="absolute bottom-0 right-14 w-56 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden">
            <div className="flex flex-col gap-1 text-[12px] font-bold uppercase tracking-wider">
              
              {/* Sectiune Legala */}
              <a href="/terms" className="flex items-center gap-3 p-3 text-white/70 hover:bg-white/10 hover:text-white rounded-2xl transition-all">
                <FileText size={18} strokeWidth={1.5} />
                Terms & Policy
              </a>
              <a href="/privacy" className="flex items-center gap-3 p-3 text-white/70 hover:bg-white/10 hover:text-white rounded-2xl transition-all">
                <ShieldAlert size={18} strokeWidth={1.5} />
                Privacy
              </a>

              <div className="h-[1px] bg-white/5 my-1" />

              {/* Sectiune Actiuni Siguranta */}
              <button className="flex items-center gap-3 p-3 text-white/70 hover:bg-white/10 hover:text-white rounded-2xl transition-all">
                <Ban size={18} strokeWidth={1.5} className="text-orange-400" />
                Not Interested
              </button>
              <button className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
                <Flag size={18} strokeWidth={1.5} />
                Report
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
