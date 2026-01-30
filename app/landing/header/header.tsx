"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Compass, MessageCircle, 
  Plus, X, LayoutGrid, 
  ChevronRight, Rocket, Handshake, Globe, BarChart,
  Send, Sparkles
} from "lucide-react";
import Image from "next/image";

export default function SocialLandingNav() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  
  const businessRef = useRef<HTMLDivElement>(null);
  const plusRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setIsScrolled(latest > 30));

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (businessRef.current && !businessRef.current.contains(e.target as Node)) setShowBusinessMenu(false);
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) setShowPlusMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = [
    { id: "home", path: "/", icon: <Home size={20} /> },
    { id: "explore", path: "/explore", icon: <Compass size={20} /> },
    { id: "chat", path: "/messages", icon: <MessageCircle size={20} /> },
  ];

  const devOptions = [
    { label: "Roadmap", desc: "Development stages", icon: <Rocket className="text-orange-500" />, path: "/roadmap" },
    { label: "Sponsorship", desc: "Brand partnerships", icon: <Handshake className="text-emerald-500" />, path: "/sponsors" },
    { label: "Pitch Deck", desc: "Project overview", icon: <BarChart className="text-blue-500" />, path: "/pitch" },
    { label: "Eco-System", desc: "Global reach", icon: <Globe className="text-purple-500" />, path: "/eco" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-center pointer-events-none font-sans">
      <motion.div 
        layout
        className={`
          relative flex items-center justify-between 
          w-full px-2 md:px-4 py-2
          bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl 
          border border-white/40 dark:border-white/10
          shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-[26px] md:rounded-[36px] 
          pointer-events-auto transition-all duration-500
          ${isScrolled ? "max-w-xl md:max-w-2xl py-1.5" : "max-w-full md:max-w-6xl py-3"}
        `}
      >
        {/* LOGO PERSONALIZAT */}
        <Link href="/" className="flex items-center gap-3 shrink-0 px-2 group">
          <div className="relative w-10 h-10 overflow-hidden rounded-2xl border border-white/20 shadow-xl">
            <Image 
              src="/logosmile.jpeg" 
              alt="Smile Logo" 
              fill 
              className="object-cover transition-transform group-hover:scale-110"
            />
          </div>
          {!isScrolled && (
            <span className="hidden lg:block font-extrabold text-amber-400 text-shadow-yellow-400 dark:text-white tracking-tighter text-xl italic uppercase">
              Smile Live<span className="text-rose-500">.</span>app
            </span>
          )}
        </Link>

        {/* MAIN NAV */}
        <nav className="flex items-center gap-1 bg-zinc-900/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5">
          {navLinks.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.id} href={item.path} className="relative p-2 md:px-5 md:py-2.5 flex items-center justify-center">
                <span className={`relative z-10 transition-colors ${isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400 hover:text-zinc-900"}`}>
                  {item.icon}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white dark:bg-zinc-800 shadow-md border border-black/5 rounded-full -z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ACTIONS SECTION */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* PLUS MENU -> REDIRECT APP */}
          <div className="relative" ref={plusRef}>
            <motion.button 
              onClick={() => { setShowPlusMenu(!showPlusMenu); setShowBusinessMenu(false); }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 h-10 md:h-12 px-3 md:px-6 rounded-[20px] transition-all duration-300 ${
                showPlusMenu ? "bg-rose-500 text-white shadow-lg" : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl"
              }`}
            >
              {showPlusMenu ? <X size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} className="text-rose-500" />}
              <span className="hidden sm:block text-xs font-black uppercase tracking-widest">Create</span>
            </motion.button>

            <AnimatePresence>
              {showPlusMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-[calc(100%+15px)] w-56 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-2xl rounded-[28px] p-2"
                >
                  <Link href="/app" onClick={() => setShowPlusMenu(false)}>
                    <div className="flex items-center justify-between p-4 rounded-[22px] bg-rose-500 text-white hover:bg-rose-600 transition-all group">
                      <div className="flex items-center gap-3">
                        <Send size={18} />
                        <span className="text-sm font-black uppercase tracking-tighter">New Post</span>
                      </div>
                      <Sparkles size={16} className="animate-pulse" />
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* GROWTH HUB / INVESTOR MENU */}
          <div className="relative" ref={businessRef}>
            <button 
              onClick={() => { setShowBusinessMenu(!showBusinessMenu); setShowPlusMenu(false); }}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-[20px] flex items-center justify-center transition-all border ${
                showBusinessMenu 
                ? "bg-zinc-900 text-white border-zinc-900" 
                : "bg-white/20 border-white/60 dark:border-white/10 text-zinc-900 dark:text-white hover:bg-white/50"
              }`}
            >
              <LayoutGrid size={20} />
            </button>

            <AnimatePresence>
              {showBusinessMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-[calc(100%+15px)] w-72 md:w-80 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-2xl rounded-[32px] p-2"
                >
                  <div className="p-4 mb-2 bg-zinc-900 dark:bg-white rounded-[22px] text-white dark:text-zinc-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-300 flex items-center justify-center text-white">
                      
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold">KNOWN US</span>
                      <span className="text-[10px] opacity-60 uppercase font-black tracking-widest leading-none">Our vision</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {devOptions.map((opt) => (
                      <Link key={opt.label} href={opt.path} onClick={() => setShowBusinessMenu(false)}>
                        <div className="flex items-center justify-between p-3 rounded-[20px] hover:bg-white dark:hover:bg-white/10 transition-all group border border-transparent">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                              {opt.icon}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-zinc-900 dark:text-white">{opt.label}</span>
                              <span className="text-[10px] text-zinc-500">{opt.desc}</span>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-zinc-300 group-hover:text-rose-500 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-2 p-3 border-t border-black/5 dark:border-white/5 text-center">
                    <button className="w-full py-3 bg-rose-500 text-white rounded-xl text-[11px] font-black uppercase tracking-tighter hover:bg-rose-600 transition-all shadow-lg">
                      Investor Relations
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
