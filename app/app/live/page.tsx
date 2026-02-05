"use client";

import ActionStream from "./ActionStream";

export default function LivePage() {
  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col lg:flex-row text-white font-sans selection:bg-red-600">
      
      {/* --- LAYER 1: VIDEO FEED --- */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Background Cinematic */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a0000_0%,_#000000_100%)]" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-2 border-white/10 rounded-full flex items-center justify-center mb-4">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          </div>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">Live Feed Active</p>
        </div>

        {/* --- LAYER 2: INTERFACE OVERLAY --- */}
        <div className="absolute inset-0 p-4 lg:p-8 flex flex-col justify-between z-50 pointer-events-none">
          
          {/* Top Section (Profile) - Clickable */}
          <div className="flex justify-between items-start pointer-events-auto">
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 p-1.5 pr-5 rounded-full flex items-center gap-3 shadow-2xl">
              <div className="w-9 h-9 bg-gradient-to-tr from-red-600 to-orange-500 rounded-full border border-white/20 shadow-inner" />
              <div className="flex flex-col">
                <span className="text-[11px] font-black tracking-tight leading-none">SMILE_LIVE</span>
                <span className="text-[9px] text-red-500 font-bold animate-pulse">● 12.4k views</span>
              </div>
            </div>
            
            <button className="w-10 h-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors">
              ✕
            </button>
          </div>

          {/* Bottom Section (ActionStream preia controlul) */}
          <div className="w-full max-w-md pointer-events-auto">
            <ActionStream />
          </div>

        </div>
      </div>
    </div>
  );
}
