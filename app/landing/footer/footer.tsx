"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Twitter, Linkedin, ArrowUpRight, Send } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#020202] border-t border-white/5 pt-20 pb-10 overflow-hidden">
      {/* Glow de fundal pentru adâncime */}
      <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
      
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16 lg:gap-8">
          
          {/* BRAND COLUMN - Ocupă 5 coloane pe desktop */}
          <div className="lg:col-span-5 space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="text-5xl sm:text-7xl font-black italic tracking-[ -0.08em] uppercase text-white leading-none">
                SMILE <span className="text-red-600 group-hover:text-yellow-400 transition-colors duration-500">LIVE.</span>
              </h2>
              <p className="text-zinc-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.5em]">
                Next-Gen Social Infrastructure
              </p>
            </motion.div>

            {/* Newsletter - Adaptat pentru mobil (full width) */}
            <div className="relative max-w-sm">
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">Join the ecosystem</p>
              <div className="group flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 focus-within:border-red-600 transition-all duration-500">
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS" 
                  className="bg-transparent border-none text-[10px] font-black tracking-widest px-4 py-3 outline-none w-full text-white placeholder:text-zinc-700"
                />
                <button className="bg-white text-black p-3 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* NAV LINKS - Grid de 2 coloane pe mobil, flex pe desktop */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Explore</h4>
              <ul className="flex flex-col gap-4">
                {["Platform", "Ecosystem", "Network", "Nodes"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="group flex items-center gap-1 text-zinc-400 hover:text-white text-sm font-bold transition-colors">
                      {item} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Studio</h4>
              <ul className="flex flex-col gap-4">
                {["Manifesto", "Careers", "Privacy", "Security"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="group flex items-center gap-1 text-zinc-400 hover:text-white text-sm font-bold transition-colors">
                      {item} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SOCIAL & INFO - Full width pe mobil */}
          <div className="lg:col-span-3 flex flex-col justify-between items-start lg:items-end gap-10">
            <div className="flex gap-4">
              {[
                { icon: <Instagram size={18} />, label: "IG" },
                { icon: <Twitter size={18} />, label: "X" },
                { icon: <Linkedin size={18} />, label: "LI" }
              ].map((soc) => (
                <Link 
                  key={soc.label} 
                  href="#" 
                  className="w-14 h-14 flex flex-col items-center justify-center border border-white/10 rounded-2xl hover:bg-white hover:text-black hover:border-white transition-all duration-500 group"
                >
                  {soc.icon}
                  <span className="text-[8px] font-black mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{soc.label}</span>
                </Link>
              ))}
            </div>
            
            <div className="text-left lg:text-right">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest leading-loose">
                Smile Live Global  <br />
                <span className="text-zinc-400">Bucharest • London • Tokyo</span>
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION - Ultra Clean */}
        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">© {currentYear} Smile Live Technologies </span>
            <div className="h-px w-8 bg-zinc-800" />
            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">All Rights Reserved</span>
          </div>
          

        </div>
      </div>

      {/* Marquee effect în fundal (Opțional, pentru extra vibe) */}
      <div className="absolute -bottom-10 left-0 w-full overflow-hidden whitespace-nowrap opacity-[0.02] pointer-events-none select-none">
        <span className="text-[15rem] font-black italic tracking-tighter">SMILE LIVE SMILE LIVE SMILE LIVE</span>
      </div>
    </footer>
  );
}
