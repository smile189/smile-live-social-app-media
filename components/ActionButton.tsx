"use client";

import { Heart, MessageSquare, Bookmark, Share2, MoreHorizontal } from "lucide-react";

export default function SidebarActions() {
  return (
    // Responsive: Poziționat la 15% de jos pentru acces ușor cu degetul
    <div className="absolute right-4 bottom-[18vh] flex flex-col items-center gap-6 z-40">
      
      {/* SLOT PROFIL CREATOR */}
      <div className="relative mb-4 group">
        <div className="w-14 h-14 rounded-full border-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.5)] p-0.5 overflow-hidden transition-transform group-hover:scale-110">
          <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center">
            <span className="text-[10px] font-black text-white">USER</span>
          </div>
        </div>
        {/* PLUS-ul Galben Solid */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black text-lg font-black border-2 border-black shadow-lg">
          +
        </div>
      </div>

      {/* ACTION BUTTONS - OUTLINE ALB VIZIBIL */}
      {[
        { icon: Heart, count: "1.2M", active: "group-hover:text-red-500" },
        { icon: MessageSquare, count: "45K", active: "group-hover:text-blue-400" },
        { icon: Bookmark, count: "89K", active: "group-hover:text-yellow-400" },
        { icon: Share2, count: "Share", active: "group-hover:text-green-400" },
      ].map((item, idx) => (
        <button key={idx} className="group flex flex-col items-center gap-1.5 transition-all">
          <div className="relative">
            {/* Shadow invizibil pentru contrast pe video-uri albe */}
            <div className="absolute inset-0 blur-md bg-black/40 rounded-full -z-10" />
            
            <item.icon 
              size={32} 
              strokeWidth={2} // Contur mai gros pentru vizibilitate
              className={`text-white transition-all duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${item.active} group-active:scale-90`} 
            />
          </div>
          <span className="text-[11px] font-black text-white tracking-widest uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
            {item.count}
          </span>
        </button>
      ))}

      <button className="mt-2 opacity-50 hover:opacity-100 transition-opacity">
        <MoreHorizontal size={28} className="text-white drop-shadow-lg" />
      </button>
    </div>
  );
}
