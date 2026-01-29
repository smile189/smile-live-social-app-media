"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useMotionValue } from "framer-motion";
import Link from "next/link";
import { 
  Home, Compass, MessageCircle, User, 
  Plus, Bell, Settings, Zap, 
  BarChart3, ShieldCheck, Megaphone, LogOut, Moon,
  ArrowRight, Sparkles, LayoutGrid, X
} from "lucide-react";

export default function UltraGlassBrutalistMenu() {
  const [active, setActive] = useState("Home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Mouse Glow Tracker
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

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
    { id: "Home", icon: <Home size={20} />, label: "Feed" },
    { id: "Explore", icon: <Compass size={20} />, label: "Explore" },
    { id: "Messages", icon: <MessageCircle size={20} />, label: "Message" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-center pointer-events-none">
      <motion.div 
        onMouseMove={handleMouseMove}
        layout
        className={`
          relative flex items-center justify-between 
          w-full px-2 py-2
          bg-white/70 backdrop-blur-3xl 
          border border-white/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)]
          rounded-[30px] md:rounded-[45px] pointer-events-auto group/menu
          transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isScrolled ? "max-w-xl md:max-w-2xl" : "max-w-6xl"}
        `}
      >
        {/* Glow Effect */}
        <motion.div 
          className="absolute -inset-px rounded-[inherit] opacity-0 group-hover/menu:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,1), transparent 80%)` }}
        />

        {/* LOGO */}
        <Link href="/" className="relative z-10 ml-2">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -8 }}
            className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-[18px] md:rounded-[22px] flex items-center justify-center text-white shadow-xl"
          >
            <Zap size={22} fill="white" />
          </motion.div>
        </Link>

        {/* NAV SECTION */}
        <nav className="flex items-center gap-1 md:gap-2 bg-black/5 p-1.5 rounded-full border border-black/5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className="relative flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full transition-all duration-300"
            >
              <span className={`relative z-10 transition-colors duration-500 ${active === item.id ? "text-black" : "text-black/30"}`}>
                {item.icon}
              </span>
              <AnimatePresence>
                {active === item.id && !isScrolled && (
                  <motion.span 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="relative z-10 overflow-hidden text-[13px] font-black tracking-tight text-black hidden sm:block"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active === item.id && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute inset-0 bg-white shadow-sm border border-black/5 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* ACTIONS HUB - THE BIG SHADOW DROP */}
        <div className="flex items-center gap-2 relative z-10" ref={menuRef}>
          <button className="hidden sm:flex p-2.5 text-black/30 hover:text-black transition-transform hover:scale-110">
            <Bell size={21} strokeWidth={2.5} />
          </button>

          <div className="relative">
            <motion.button 
              onClick={() => setShowSettings(!showSettings)}
              whileTap={{ scale: 0.95 }}
              className={`h-11 md:h-13 flex items-center gap-3 pl-2 pr-5 rounded-[22px] md:rounded-[26px] border-[2.5px] transition-all duration-300 ${
                showSettings 
                ? "bg-black text-white border-black" 
                : "bg-white border-black text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${showSettings ? "border-white/20 bg-white/10 rotate-90" : "border-black bg-white"}`}>
                {showSettings ? <X size={18} /> : <LayoutGrid size={18} strokeWidth={2.5} />}
              </div>
              <span className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em]">MENU</span>
            </motion.button>

            {/* WHITE GLASS DROPDOWN */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9, rotate: 2 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9, rotate: -2 }}
                  className="absolute right-0 mt-6 w-72 md:w-80 bg-white/90 backdrop-blur-3xl border-[2.5px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] rounded-[35px] p-3 overflow-hidden"
                >
                  <div className="p-5 bg-black rounded-[28px] text-white flex items-center gap-4 mb-3 relative overflow-hidden group/card">
                    <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                       <User size={22} className="text-white" />
                    </div>
                    <div className="flex flex-col relative z-10">
                       <span className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">Access Level 01</span>
                       <span className="text-lg font-black italic tracking-tighter uppercase">Adrian_Sys</span>
                    </div>
                    <Sparkles className="absolute right-[-10px] top-[-10px] text-white/5 w-24 h-24 group-hover:rotate-12 transition-transform duration-700" />
                  </div>

                  <div className="space-y-1">
                    {[
                      { label: "Analytics", icon: <BarChart3 size={18} />, color: "hover:bg-blue-50" },
                      { label: "Security", icon: <ShieldCheck size={18} />, color: "hover:bg-emerald-50" },
                      { label: "Ads Hub", icon: <Megaphone size={18} />, color: "hover:bg-orange-50" },
                      { label: "Interface", icon: <Moon size={18} />, color: "hover:bg-purple-50" }
                    ].map((item, idx) => (
                      <motion.button 
                        key={item.label}
                        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.05 }}
                        className={`group flex items-center justify-between w-full p-4 rounded-[22px] border-2 border-transparent hover:border-black transition-all ${item.color} hover:bg-white`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="p-2.5 bg-black text-white rounded-xl group-hover:scale-110 transition-transform duration-500">{item.icon}</span>
                          <span className="text-[14px] font-black text-black tracking-tight">{item.label}</span>
                        </div>
                        <ArrowRight size={18} className="text-black opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </motion.button>
                    ))}
                  </div>

                  <button className="w-full mt-3 p-4 bg-rose-500 text-white border-[2.5px] border-black rounded-[24px] flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest hover:bg-black transition-colors shadow-lg shadow-rose-200/20">
                    <LogOut size={18} strokeWidth={3} /> Shutdown
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
