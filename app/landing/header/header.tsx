"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { 
  Plus, X, LayoutGrid, 
  Send, Sparkles, Users2, 
  ChevronRight, Briefcase, Wand2, Mic2
} from "lucide-react";
import Image from "next/image";

export default function SocialGenNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<"plus" | "hub" | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setIsScrolled(latest > 50));

  // Închide meniul la apăsarea tastei Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const toggleMenu = (menu: "plus" | "hub") => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <>
      {/* Overlay pentru a închide meniul la click oriunde în afară */}
      <AnimatePresence>
        {openMenu && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenMenu(null)}
            className="fixed inset-0 z-[90] bg-black/5 backdrop-blur-[2px] pointer-events-auto"
          />
        )}
      </AnimatePresence>

      <div className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-center pointer-events-none font-sans">
        <motion.div 
          layout
          className={`
            relative flex items-center justify-between 
            w-full px-3 py-2
            bg-white/40 dark:bg-zinc-900/60 backdrop-blur-3xl 
            border border-white/40 dark:border-white/10
            shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-[32px] md:rounded-[48px] 
            pointer-events-auto transition-all duration-500
            ${isScrolled ? "max-w-md" : "max-w-5xl"}
          `}
        >
          {/* LOGO - Acum vizibil mereu pe Mobile și PC */}
          <Link href="/" className="relative z-10 flex items-center gap-3 pl-2 group shrink-0">
            <div className="relative w-10 h-10 overflow-hidden rounded-2xl border-2 border-white/50 shadow-lg group-hover:scale-105 transition-transform shrink-0">
              <Image src="/logosmile.jpeg" alt="Logo" fill priority className="object-cover" />
            </div>
            <span className="font-black text-zinc-900 dark:text-white tracking-tighter text-sm md:text-lg italic uppercase">
              Smile <span className="text-rose-500">Live </span>
            </span>
          </Link>

          {/* BUTON PLUS (CENTRAL) */}
          <div className="relative z-20">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleMenu("plus")}
              className={`
                flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 shadow-xl
                ${openMenu === "plus" ? "bg-rose-500 text-white rotate-45" : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"}
              `}
            >
              <Plus size={24} strokeWidth={3} />
            </motion.button>

            <AnimatePresence>
              {openMenu === "plus" && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+16px)] w-56 bg-white dark:bg-zinc-900 border border-white/20 rounded-[28px] p-2 shadow-2xl overflow-hidden"
                >
                  <Link href="/app/" onClick={() => setOpenMenu(null)} className="flex items-center gap-3 p-4 rounded-[22px] bg-rose-500 text-white hover:bg-rose-600 transition-colors group">
                    <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase">New Story</span>
                  </Link>
                  <Link href="/app/live" onClick={() => setOpenMenu(null)} className="flex items-center gap-3 p-4 mt-1 rounded-[22px] hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                    <Mic2 size={18} className="text-rose-500" />
                    <span className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-300 tracking-tight">Go Live</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BUTON HUB (DREAPTA) */}
          <div className="relative z-20 pr-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleMenu("hub")}
              className={`
                w-10 h-10 rounded-2xl flex items-center justify-center transition-all border
                ${openMenu === "hub" ? "bg-white text-zinc-900 border-white shadow-inner" : "bg-white/10 border-white/20 text-zinc-800 dark:text-white hover:bg-white/30"}
              `}
            >
              <LayoutGrid size={20} strokeWidth={2} />
            </motion.button>

            <AnimatePresence>
              {openMenu === "hub" && (
                <motion.div
                  initial={{ opacity: 0, x: 10, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, y: 10, scale: 0.9 }}
                  className="absolute right-0 top-[calc(100%+16px)] w-72 bg-white/95 dark:bg-zinc-950 backdrop-blur-3xl border border-white/20 rounded-[32px] p-3 shadow-2xl"
                >
                  <div className="space-y-1">
                    <p className="px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Services</p>
                    <Link href="/agency" onClick={() => setOpenMenu(null)} className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-100 dark:hover:bg-white/5 group transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-sm"><Briefcase size={18} /></div>
                        <div><p className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-tighter">Agency Create</p></div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-300 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/landing/resource/neuromusic" onClick={() => setOpenMenu(null)} className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-100 dark:hover:bg-white/5 group transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shadow-sm"><Wand2 size={18} /></div>
                        <div><p className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-tighter">AI Music</p></div>
                      </div>
                      <Sparkles size={14} className="text-rose-500 animate-pulse" />
                    </Link>
                    <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-white/5">
                      <Link href="/landing/resource/sponsor/" onClick={() => setOpenMenu(null)} className="flex items-center gap-3 p-4 rounded-[22px] bg-amber-400 text-white shadow-lg hover:bg-amber-500 transition-all">
                        <Users2 size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Investor Relation</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}
