"use client";

import React, { useState } from 'react';
import { X, Music, activity } from 'lucide-react';

interface SynthProps {
  isOpen: boolean; // Controlat de streamerId din MainLive
}

export default function TS4XSynth({ isOpen: isStreamerActive }: SynthProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isStreamerActive) return null;

  return (
    <>
      {/* 1. BUTON CONTROL - DESIGN MINIMALIST STATIC */}
      <div className="fixed top-6 right-6 z-[100]">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`group flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-200 
            ${isExpanded 
              ? 'bg-white text-black border-white shadow-xl' 
              : 'bg-[#0d011a]/80 text-white border-white/10 hover:border-purple-500/50 hover:bg-[#1a0533]'}`}
        >
          <Music size={16} className={isExpanded ? 'text-black' : 'text-purple-400'} />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
            {isExpanded ? 'Close Studio' : 'Open Synth'}
          </span>
          
          {/* Indicator status static */}
          <div className={`w-1.5 h-1.5 rounded-full ${isExpanded ? 'bg-black/20' : 'bg-green-500'}`} />
        </button>
      </div>

      {/* 2. MODAL SYNTH - DESIGN PROFESIONAL (HARDWARE LOOK) */}
      <div className={`fixed inset-0 z-[90] flex items-center justify-center p-6 transition-all duration-300 
        ${isExpanded ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-100 invisible pointer-events-none'}`}>
        
        {/* Backdrop solid/întunecat */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsExpanded(false)} />

        <div className="relative w-full max-w-[440px] h-[620px] bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
          
          {/* Bara de titlu tip Rack-Mount */}
          <div className="h-14 flex justify-between items-center px-6 bg-[#1a1a1a] border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <h3 className="text-[11px] font-bold text-white uppercase tracking-wider leading-none">
                  TS4X Virtual Studio
                </h3>

              </div>
            </div>
            
            <button 
              onClick={() => setIsExpanded(false)}
              className="p-1.5 hover:bg-white/5 rounded-md transition-colors"
            >
              <X size={18} className="text-white/40" />
            </button>
          </div>

          {/* Zona Iframe - Integrată curat */}
<div className="flex-1 bg-black relative">
  <iframe
    src="https://vi.imidi.ro/app_xyz2025magfshgXX/index.html"
    className="w-full h-full border-none grayscale-[0.2] contrast-[1.1]"
    allow="autoplay; midi; audio-capture"
    referrerPolicy="no-referrer" // Aceasta linie poate "păcăli" protecția Vercel
    loading="eager"
  />
  
  <div className="absolute inset-0 pointer-events-none bg-white/[0.01]" />
</div>


          {/* Footer Tehnic */}
          <div className="h-10 bg-[#1a1a1a] border-t border-white/5 flex items-center px-6 justify-between">
             <div className="flex gap-4 items-center">
                <span className="text-[7px] font-mono text-green-500/70 tracking-widest uppercase">
                  Midi: Online
                </span>
                <span className="text-[7px] font-mono text-white/20 tracking-widest uppercase">
                  Buffer: 128 spl
                </span>
             </div>
             <p className="text-[7px] font-mono text-white/20 uppercase">
                Smilesoft Audio Engine
             </p>
          </div>
        </div>
      </div>
    </>
  );
}
