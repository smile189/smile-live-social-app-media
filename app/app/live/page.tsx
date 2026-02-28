"use client";

import React from 'react';
import ChatLive from '@/components/ChatLive';
import FLive from '@/components/FLive';

/**
 * MainLive - SmileLive WOW Edition
 * Fundal ultra-vibrant mov, umbre profunde și watermark stilizat.
 */
export default function MainLive() {
  return (
    <main className="relative min-h-screen w-full bg-[#05010a] overflow-hidden flex flex-col justify-between p-6">
      
      {/* 1. FUNDAL ULTRA-MOV & VIGNETTE (Efectul WOW) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Gradient de bază Mov-Negru */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#020005] via-[#0d011a] to-[#05000a]" />
        
        {/* Glow-uri de atmosferă (Nebula Effect) */}
        <div className="absolute top-[-10%] right-[-5%] w-[70%] h-[50%] bg-purple-600/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[40%] bg-indigo-700/15 rounded-full blur-[120px]" />
        
        {/* TIKTOK STYLE SHADOWS (Vignette profund) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.8)_100%)]" />
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* 2. WATERMARK STILIZAT (SmileLive) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none">
        <h2 className="text-purple-500/[0.04] text-[10rem] md:text-[20rem] font-black tracking-tighter uppercase transform -rotate-12 italic">
          SMILE
        </h2>
      </div>

      {/* 3. LAYOUT CURAT (Ready for components) */}
      
      {/* Top - Profil/Statistici */}
      <div className="relative z-20 w-full flex justify-between items-start pt-2">
        {/* Loc liber pentru <Header /> */}
      </div>

      {/* Middle - Spatiu liber pentru stream video / alerte */}
      <div className="relative z-20 flex-1" />

<FLive />

{/* Bottom - Chat & Brand */}
<div className="relative z-20 w-full flex flex-col items-center gap-6 mt-auto">
  
  {/* Zona CHAT - Pe desktop o forțăm pe centru cu mx-auto */}
  <div 
    id="chat-mount-point" 
    className="h-[350px] w-full max-w-lg mb-4 px-4 md:mx-auto flex flex-col items-center"
  >
  <ChatLive streamerId={""} />
  </div>

</div>


    </main>
  );
}
