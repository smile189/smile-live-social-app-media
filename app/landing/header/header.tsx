"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Home, Compass, MessageCircle, User, 
  Plus, Search, Bell, Settings, Zap, 
  BarChart3, ShieldCheck, Megaphone, LogOut, Sparkles, Moon
} from "lucide-react";

export default function FloatingPremiumMenu() {
  const [active, setActive] = useState("Home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowSettings(false);
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    { id: "Home", icon: <Home size={20} />, label: "Home" },
    { id: "Explore", icon: <Compass size={20} />, label: "Explore" },
    { id: "Messages", icon: <MessageCircle size={20} />, label: "Chat", badge: 3 },
    { id: "Profile", icon: <User size={20} />, label: "Log In" },
  ];

  const settingOptions = [
    { id: "stats", icon: <BarChart3 size={18} />, label: "Analytics", color: "text-blue-500" },
    { id: "ads", icon: <Megaphone size={18} />, label: "Ad Center", color: "text-yellow-600" },
    { id: "privacy", icon: <ShieldCheck size={18} />, label: "Privacy", color: "text-rose-500" },
    { id: "dark", icon: <Moon size={18} />, label: "Dark Mode", color: "text-slate-600" },
    { id: "logout", icon: <LogOut size={18} />, label: "Logout", color: "text-slate-400" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-center pointer-events-none">
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`
          relative flex items-center justify-between 
          w-full max-w-5xl px-3 md:px-4 py-2
          bg-white/40 backdrop-blur-3xl 
          border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.08)] 
          rounded-[24px] md:rounded-[32px] 
          pointer-events-auto transition-all duration-700
          ${isScrolled ? "max-w-3xl shadow-2xl border-white/20" : ""}
        `}
      >
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center text-yellow-400 shadow-xl shadow-yellow-100 group-hover:rotate-12 transition-transform duration-500">
            <Zap size={20} fill="currentColor" className="md:w-[22px] md:h-[22px]" />
          </div>
          {!isScrolled && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block font-black text-slate-900 tracking-tighter text-lg leading-none uppercase italic"
            >
              Smile<span className="text-rose-500">.</span>
            </motion.span>
          )}
        </Link>

        {/* NAVIGATION - Pill Style */}
        <nav className="flex items-center gap-1 p-1 bg-white/50 rounded-full border border-white/40">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`
                relative flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full transition-all duration-500
                ${active === item.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-900 hover:bg-white/60"}
              `}
            >
              {item.icon}
              {active === item.id && (
                <motion.span 
                  layoutId="label" 
                  className="hidden md:block text-[11px] font-black uppercase tracking-widest leading-none"
                >
                  {item.label}
                </motion.span>
              )}
              {item.badge && active !== item.id && (
                <span className="absolute top-2 right-2.5 md:right-3 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-1 md:gap-3 relative" ref={menuRef}>
          <button className="hidden sm:flex p-2 text-slate-400 hover:text-rose-500 transition-all active:scale-90">
            <Bell size={20} />
          </button>
          
          <button className="bg-slate-900 text-white w-9 h-9 md:w-auto md:px-5 md:py-2.5 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-500 transition-all shadow-xl shadow-slate-200 active:scale-95 group">
            <Plus size={20} className="text-yellow-400 group-hover:rotate-90 transition-transform duration-500" />
            <span className="hidden lg:block text-[10px] font-black tracking-widest leading-none">POST</span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                showSettings ? "bg-yellow-400 border-yellow-500 text-slate-900 scale-110 shadow-lg" : "bg-white/60 border-white/40 text-slate-400 hover:text-slate-900"
              }`}
            >
              <Settings size={18} className={showSettings ? "rotate-90 transition-all duration-500" : ""} />
            </button>

            {/* WOW SETTINGS DROPDOWN */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  className="absolute right-0 mt-4 w-56 md:w-64 bg-white/80 backdrop-blur-2xl border border-white shadow-[0_30px_60px_rgba(0,0,0,0.12)] rounded-[24px] md:rounded-[30px] p-2 ring-1 ring-black/[0.05]"
                >
                  <div className="px-4 py-3 mb-1 flex items-center justify-between border-b border-white/50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Management <Sparkles size={12} className="text-yellow-500" />
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {settingOptions.map((opt) => (
                      <button
                        key={opt.id}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-900 rounded-xl md:rounded-2xl transition-all group"
                      >
                        <span className={`${opt.color} group-hover:scale-110 transition-transform duration-300`}>{opt.icon}</span>
                        <span className="flex-1 text-left">{opt.label}</span>
                      </button>
                    ))}
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
