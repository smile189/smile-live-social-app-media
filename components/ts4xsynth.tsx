"use client";

import React from 'react';
import { X, Activity } from 'lucide-react';

// Interfața obligatorie pentru TypeScript
interface SynthProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TS4XSynth({ isOpen, onClose }: SynthProps) {
  // Dacă nu este deschis, nu randăm nimic
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
      {/* Fundal întunecat care închide la click */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" 
        onClick={onClose} 
      />

      {/* Terminalul Synth-ului */}
      <div className="relative w-full max-w-[420px] h-[600px] bg-[#0d011a] border border-purple-500/30 rounded-[40px] shadow-[0_0_100px_rgba(168,85,247,0.2)] overflow-hidden flex flex-col pointer-events-auto">
        
        {/* Header PRO Static */}
        <div className="p-6 flex justify-between items-center bg-gradient-to-b from-purple-900/40 to-transparent border-b border-purple-500/10">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-[11px] font-black text-white tracking-[0.2em] uppercase leading-none">
                SMILE SYNTH ENGINE
              </h3>
              <p className="text-[8px] text-purple-400/60 font-bold uppercase mt-1 tracking-tighter">
                STATUS: CONNECTED // LATENCY: 10MS
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all border border-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Iframe-ul către engine */}
        <div className="flex-1 relative bg-black">
          <iframe
            src="https://vi.imidi.ro/app_xyz2025magfshgXX/index.html"
            className="w-full h-full border-none grayscale-[0.1] contrast-[1.1]"
            allow="autoplay; midi; audio-capture"
          />
          
          {/* Overlay textură discretă */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>

        {/* Footer Tehnic */}
        <div className="py-4 text-center bg-purple-950/10 border-t border-purple-500/10">
           <p className="text-[7px] font-black text-purple-400/30 uppercase tracking-[0.5em]">
             TS4X PROTOCOL • SMILESOFT AUDIO
           </p>
        </div>
      </div>
    </div>
  );
}
