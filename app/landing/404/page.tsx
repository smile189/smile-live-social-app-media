"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, RefreshCcw, Radio } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-[100dvh] bg-black flex items-center justify-center overflow-hidden text-white font-sans">
      
      {/* AMBIENT BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-red-900/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-zinc-900/20 blur-[150px] rounded-full" />
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app')] pointer-events-none" />

      <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-4xl">
        
        {/* GLITCH ERROR DISPLAY */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative inline-block mb-4 sm:mb-8"
        >
          <h1 className="text-[10rem] sm:text-[15rem] md:text-[22rem] font-black italic tracking-tighter leading-none select-none opacity-5">
            404
          </h1>
          <motion.div 
            animate={{ x: [-1, 1, -1], y: [0.5, -0.5, 0.5] }}
            transition={{ repeat: Infinity, duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center pt-10"
          >
            <span className="text-4xl sm:text-8xl md:text-[11rem] font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-700">
              underconstruction
            </span>
          </motion.div>
        </motion.div>

        {/* SOCIAL THEMED MESSAGE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto"
        >


          <p className="text-zinc-500 text-base sm:text-lg md:text-xl font-medium mb-10 italic uppercase tracking-wider leading-relaxed px-4">
            The profile of page you are looking for is <span className="text-white underline decoration-red-600 underline-offset-4">out of reach</span>. 
          </p>

          {/* RESPONSIVE BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4">
            <Link
              href="/"
              className="w-full sm:w-auto group relative px-10 py-5 bg-white text-black font-black uppercase text-[10px] sm:text-xs tracking-widest rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-yellow-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Home size={14} /> Back to Feed
              </span>
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-10 py-5 border border-white/10 text-white font-black uppercase text-[10px] sm:text-xs tracking-widest rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 backdrop-blur-md active:scale-95"
            >
              <RefreshCcw size={14} /> Reconnect
            </button>
          </div>
        </motion.div>
      </div>

      {/* METADATA OVERLAY */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between items-center gap-4 pointer-events-none opacity-30">

        <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.4em]">
          Smile Live // Global Infrastructure
        </p>
      </div>
    </div>
  );
}
