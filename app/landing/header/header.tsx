/**
 * Header component for the landing page, featuring a responsive navigation bar
 *  with scroll-based visibility and a mobile menu.
 * Utilizes Framer Motion for smooth animations and Next.js Link for navigation.
 * author: BM
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { 
  X, LayoutGrid, Sparkles, Users2, 
  ChevronRight, Briefcase, Wand2, 
  LogIn, Zap, Smartphone
} from "lucide-react";
import Image from "next/image";

export default function CyberIndustrialNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [openMenu, setOpenMenu] = useState<"hub" | "mobile" | null>(null);
  const { scrollY } = useScroll();

  // 
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > lastScrollY && latest > 150) {
      setIsVisible(false); // 
    } else {
      setIsVisible(true); // display the header when scrolling up
    }
    setLastScrollY(latest);
    setIsScrolled(latest > 50);
  });

  const toggleMenu = (menu: "hub" | "mobile") => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <>
      <AnimatePresence>
        {openMenu && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpenMenu(null)}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm cursor-pointer"
          />
        )}
      </AnimatePresence>

      <motion.header 
        /* animation of header visibility */
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -120 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-center font-sans"
      >
        <nav className={`
          relative flex items-center justify-between w-full max-w-7xl px-4 py-2
          transition-all duration-500 rounded-2xl border shadow-2xl
          ${isScrolled 
            ? "bg-white/10 dark:bg-black/30 backdrop-blur-xl border-white/20 md:max-w-4xl" // 
            : "bg-zinc-950/90 border-white/10 md:max-w-7xl" // 
          }
        `}>
          
          {/* LOGO SECTION */}
          <Link href="/" className="flex items-center gap-4 shrink-0 group">
            <div className="relative w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl overflow-hidden border-2 border-yellow-500 group-hover:rotate-6 transition-transform duration-300">
              <Image src="/logosmile.jpeg" alt="Logo" fill className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white text-xl md:text-3xl tracking-[-0.05em] uppercase italic leading-none transition-all">
                smile <span className="text-red-500 font-light drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">live</span>
              </span>
            </div>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl">
            <NavButton label="Agency" onClick={() => toggleMenu("hub")} active={openMenu === "hub"} isScrolled={isScrolled} />
            <NavButton label="AI Engine" href="/landing/resource/neuromusic" isScrolled={isScrolled} />
            <NavButton label="Investors" href="/landing/resource/sponsor/" isScrolled={isScrolled} />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="app/login" className="hidden md:flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white">
              <LogIn size={14} /> Login 
            </Link>

            {/* HAMBURGER BUTTON */}
            <button 
              onClick={() => toggleMenu("mobile")}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-white/5 rounded-lg border border-white/10"
            >
              <motion.span 
                animate={openMenu === "mobile" ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="w-5 h-0.5 bg-white rounded-full transition-transform"
              />
              <motion.span 
                animate={openMenu === "mobile" ? { opacity: 0 } : { opacity: 1 }}
                className="w-5 h-0.5 bg-white rounded-full"
              />
              <motion.span 
                animate={openMenu === "mobile" ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="w-5 h-0.5 bg-yellow-500 rounded-full transition-transform"
              />
            </button>
          </div>
        </nav>

        {/* MOBILE OVERLAY (Rămâne neschimbat, dar cu referința la poze) */}
        <AnimatePresence>
          {openMenu === "mobile" && (
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[110] bg-zinc-950 flex flex-col lg:hidden overflow-hidden"
            >
              <div className="absolute inset-0 z-0">
                <Image src="/social3.jpg" alt="Background" fill className="object-cover opacity-20 grayscale brightness-50" />
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />
              </div>
              <div className="relative z-10 p-6 flex flex-col h-full text-white">
                <div className="flex justify-between items-center mb-12">
                  <span className="font-black tracking-[0.2em] text-xs uppercase">Options</span>
                  <button onClick={() => setOpenMenu(null)} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"><X size={24} /></button>
                </div>
                <div className="flex flex-col gap-4 flex-1">
                  <MobileLink href="landing/resource/agency" label="Begin Agency Creator" num="01" icon={<Briefcase size={20} />} />
                  <MobileLink href="/landing/resource/neuromusic" label="AI Music creator" num="02" icon={<Wand2 size={20} />} />
                  <MobileLink href="/landing/resource/sponsor/" label="Investor Relations" num="03" icon={<Users2 size={20} />} />
                </div>
                <div className="space-y-3 mt-auto">
                  <Link href="app/login" className="flex items-center justify-center gap-3 w-full py-5 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Login</Link>
                  <Link href="/app" className="flex items-center justify-center gap-3 w-full py-6 bg-yellow-400 text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.3em]">Acces Smile web app</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}

function NavButton({ label, href, onClick, active, isScrolled }: any) {
  const content = (
    <button onClick={onClick} className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
      active 
        ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" 
        : isScrolled ? "text-white hover:bg-white/10" : "text-zinc-400 hover:text-white"
    }`}>
      {label}
    </button>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function MobileLink({ href, label, num, icon }: any) {
  return (
    <Link href={href} className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/5 group active:bg-white/10 transition-all text-white">
      <div className="flex items-center gap-5">
        <span className="text-yellow-500 font-black text-xl italic opacity-50">{num}</span>
        <div className="flex flex-col text-left">
          <span className="text-lg font-black uppercase tracking-tighter leading-none mb-1">{label}</span>
          <div className="flex items-center gap-2 text-zinc-500">{icon}</div>
        </div>
      </div>
      <ChevronRight size={20} className="text-zinc-600" />
    </Link>
  );
}
