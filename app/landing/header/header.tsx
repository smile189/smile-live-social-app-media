"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { 
  Home, Compass, MessageCircle, User, 
  Plus, Bell, Settings, Zap, 
  BarChart3, ShieldCheck, Megaphone, LogOut, Sparkles, Moon,
  ArrowRight
} from "lucide-react";

export default function FloatingPremiumMenu() {
  const [active, setActive] = useState("Home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { id: "Home", icon: <Home size={20} />, label: "Home" },
    { id: "Explore", icon: <Compass size={20} />, label: "Explore" },
    { id: "Messages", icon: <MessageCircle size={20} />, label: "Chat", badge: 3 },
    { id: "Profile", icon: <User size={20} />, label: "Log In" },
  ];

  const settingOptions = [
    { id: "stats", icon: <BarChart3 size={18} />, label: "Analytics", color: "text-blue-600" },
    { id: "ads", icon: <Megaphone size={18} />, label: "Ads Hub", color: "text-amber-600" },
    { id: "privacy", icon: <ShieldCheck size={18} />, label: "Security", color: "text-emerald-600" },
    { id: "dark", icon: <Moon size={18} />, label: "Interface", color: "text-indigo-600" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-3 md:p-6 flex justify-center pointer-events-none">
      <motion.div 
        layout
        className={`
          relative flex items-center justify-between 
          w-full px-2 md:px-3 py-2
          bg-white/80 backdrop-blur-2xl 
          border-2 border-black shadow-[0_10px_40px_rgba(0,0,0,0.08)] 
          rounded-[24px] md:rounded-[40px] 
          pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isScrolled ? "max-w-2xl py-1.5" : "max-w-5xl md:py-2.5"}
        `}
      >
        {/* LOGO SECTION */}
        <Link href="/" className="flex items-center gap-2 group shrink-0 ml-1">
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.1 }}
            className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg"
          >
            <Zap size={20} fill="currentColor" className="text-yellow-400" />
          </motion.div>
          {!isScrolled && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block font-black text-black tracking-tighter text-lg uppercase italic ml-1"
            >
              Smile<span className="text-rose-500">.</span>
            </motion.span>
          )}
        </Link>

        {/* NAVIGATION - PILL STYLE */}
        <nav className="flex items-center gap-1 p-1 bg-black/5 rounded-full border border-black/5 shadow-inner">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300
                ${active === item.id ? "text-black" : "text-black/40 hover:text-black"}
              `}
            >
              <span className="relative z-10">{item.icon}</span>
              {active === item.id && (
                <>
                  <motion.span layoutId="label" className="hidden md:block text-[11px] font-black uppercase tracking-widest relative z-10">
                    {item.label}
                  </motion.span>
                  <motion.div 
                    layoutId="navPill"
                    className="absolute inset-0 bg-white shadow-md border border-black/5 -z-0 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                </>
              )}
            </button>
          ))}
        </nav>

        {/* ACTIONS HUB - GLASS BRUTALIST */}
        <div className="flex items-center gap-2 md:gap-3 relative" ref={menuRef}>
          <button className="hidden sm:flex p-2 text-black/40 hover:text-black transition-transform hover:scale-110">
            <Bell size={21} strokeWidth={2.5} />
          </button>
          
          <motion.button 
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="bg-black text-white h-11 px-4 md:px-6 rounded-[18px] flex items-center gap-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
          >
            <Plus size={18} className="text-yellow-400" strokeWidth={3} />
            <span className="hidden md:block text-[11px] font-black uppercase tracking-widest leading-none">POST</span>
          </motion.button>

          <div className="relative">
            <motion.button 
              onClick={() => setShowSettings(!showSettings)}
              whileHover={{ scale: 1.05 }}
              className={`w-11 h-11 rounded-[18px] flex items-center justify-center transition-all duration-500 border-2 ${
                showSettings 
                ? "bg-black border-black text-white rotate-90 shadow-xl" 
                : "bg-white border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              }`}
            >
              {showSettings ? <Settings size={20} /> : <User size={20} />}
            </motion.button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
                  className="absolute right-0 mt-5 w-72 md:w-80 bg-white/95 backdrop-blur-3xl border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-[32px] p-3 overflow-hidden"
                >
                  {/* User Profile Banner */}
                  <div className="flex items-center gap-3 p-4 mb-2 bg-black rounded-[24px] text-white overflow-hidden relative group">
                    <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg relative z-10">
                      <Zap size={20} fill="currentColor" className="text-yellow-400" />
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Session Active</span>
                      <span className="text-sm font-black italic tracking-tighter uppercase leading-none">Adrian_X.sys</span>
                    </div>
                    <Sparkles className="absolute right-[-10px] top-[-10px] text-white/5 w-24 h-24 rotate-12" />
                  </div>

                  {/* Settings Bento List */}
                  <div className="grid grid-cols-1 gap-1">
                    {settingOptions.map((opt, idx) => (
                      <motion.button
                        key={opt.id}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-black hover:text-white transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <span className={`p-2.5 rounded-xl bg-white border-2 border-black/5 group-hover:border-white/20 group-hover:bg-white group-hover:text-black transition-all ${opt.color}`}>
                            {opt.icon}
                          </span>
                          <span className="text-[13px] font-black tracking-tight">{opt.label}</span>
                        </div>
                        <ArrowRight size={16} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Logout Button */}
                  <div className="mt-2 pt-2 border-t-2 border-black/5">
                    <button className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-rose-500 text-white border-2 border-black hover:bg-black transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none font-black text-[11px] uppercase tracking-widest">
                      <LogOut size={16} strokeWidth={3} />
                      Terminate
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
