"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { ArrowRight, Zap, Globe, Shield, Radio, Users, Sparkles, Cpu, Smartphone, BarChart3, Play } from "lucide-react";
import Header from "./header/header";
import Footer from "./footer/footer";

// --- STATS COMPONENT ---
const StatItem = ({ label, value }: { label: string; value: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex flex-col items-center">
      <motion.span 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        className="text-5xl sm:text-8xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-600"
      >
        {value}
      </motion.span>
      <span className="text-red-600 text-[10px] uppercase tracking-[0.4em] font-black mt-2">{label}</span>
    </div>
  );
};

export default function LandingPage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 100, damping: 30 };
  const dx = useSpring(mouseX, springConfig);
  const dy = useSpring(mouseY, springConfig);

  // Efectul 3D pentru LOGO
  const logoRotationX = useTransform(dy, [-100, 100], [20, -20]);
  const logoRotationY = useTransform(dx, [-100, 100], [-20, 20]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 200);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 200);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen bg-[#000] text-white font-sans overflow-x-hidden selection:bg-red-600">
      <Header />
      
      {/* TEXTURĂ FUNDAL */}
      <div className="fixed inset-0 z-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app')] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-screen bg-gradient-to-b from-red-900/20 via-transparent to-transparent pointer-events-none" />

      <main className="relative z-10">
        
        {/* HERO SECTION CU LOGO-UL REVENIT */}
        <section className="flex flex-col items-center justify-center px-6 pt-40 pb-20 min-h-screen text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 px-5 py-2 border border-white/10 bg-white/5 backdrop-blur-2xl rounded-full flex items-center gap-3"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Next-Gen Live Infrastructure</span>
          </motion.div>

          {/* LOGO DYNAMIC - THE PIECE DE RESISTANCE */}
          <motion.div 
            style={{ rotateX: logoRotationX, rotateY: logoRotationY, perspective: 1000 }}
            className="relative mb-16 group cursor-none"
          >
            <div className="absolute -inset-16 bg-red-600/30 blur-[120px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="relative p-2 rounded-[50px] bg-gradient-to-br from-white/30 via-transparent to-white/5 backdrop-blur-3xl border border-white/20 shadow-[0_50px_100px_-20px_rgba(255,0,0,0.3)]"
            >
              <div className="relative w-40 h-40 sm:w-60 sm:h-60 overflow-hidden rounded-[44px]">
                <Image 
                  src="/logosmile.jpeg" 
                  alt="Smile Logo" 
                  fill 
                  priority
                  unoptimized
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </motion.div>
          </motion.div>

          <h1 className="text-7xl sm:text-[15rem] font-black tracking-[-0.08em] leading-[0.7] italic mb-10">
            SMILE <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-400 to-zinc-900">LIVE.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-zinc-400 text-lg sm:text-2xl font-medium leading-relaxed mb-16">
            Social infrastructure built for <span className="text-white italic underline decoration-yellow-400 decoration-4 underline-offset-8">insane performance</span>. 
            Experience 4K without the lag.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link href="/app" className="group relative px-16 py-8 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl overflow-hidden transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]">
               <div className="absolute inset-0 bg-yellow-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
               <span className="relative z-10 flex items-center gap-4">Access Dashboard <ArrowRight size={20} /></span>
            </Link>
          </div>
        </section>

        {/* SECTION: BENTO GRID TECH */}
        <section className="px-6 py-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto">
            {/* Live Preview Card */}
            <div className="md:col-span-8 relative bg-zinc-900/40 border border-white/10 rounded-[50px] overflow-hidden group min-h-[400px]">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-transparent to-transparent" />
                <Image 
                    src="https://images.unsplash.com" 
                    alt="4K Stream" fill unoptimized className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000" 
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <motion.div whileHover={{ scale: 1.2 }} className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black cursor-pointer">
                        <Play fill="black" size={32} />
                    </motion.div>
                </div>
                <div className="absolute bottom-10 left-10 z-20">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Ultra-Low Latency</h3>
                    <p className="text-zinc-400 max-w-xs text-sm">Engineered for real-time interaction at global scale.</p>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="md:col-span-4 space-y-6">
                <div className="p-10 bg-zinc-900/40 border border-white/10 rounded-[40px] hover:border-red-600/50 transition-colors group">
                    <Smartphone className="text-red-600 mb-6 group-hover:scale-110 transition-transform" size={40} />
                    <h4 className="text-xl font-black uppercase italic mb-2">Mobile Native</h4>
                    <p className="text-zinc-500 text-sm italic">Stream 4K from any device, anywhere.</p>
                </div>
                <div className="p-10 bg-zinc-900/40 border border-white/10 rounded-[40px] hover:border-yellow-400/50 transition-colors group">
                    <BarChart3 className="text-yellow-400 mb-6 group-hover:scale-110 transition-transform" size={40} />
                    <h4 className="text-xl font-black uppercase italic mb-2">Live Metrics</h4>
                    <p className="text-zinc-500 text-sm italic">Real-time engagement heatmaps.</p>
                </div>
            </div>
          </div>
        </section>

        {/* SECTION: MASSIVE STATS */}
        <section className="px-6 py-40 bg-zinc-900/20 border-y border-white/5">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-20">
                <StatItem label="Active Nodes" value="1.2K" />
                <StatItem label="Stream Quality" value="4K+" />
                <StatItem label="Daily Volume" value="48PB" />
            </div>
        </section>

        {/* SECTION: FINAL CALL */}
        <section className="px-6 py-60 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-red-600/20 blur-[200px] rounded-full pointer-events-none" />
            <h2 className="text-7xl sm:text-[10rem] font-black italic uppercase tracking-tighter leading-none mb-16 relative z-10">
                DONT JUST WATCH.<br/><span className="text-red-600">SMILE.</span>
            </h2>
            <button className="relative z-10 px-20 py-10 bg-white text-black font-black uppercase text-sm rounded-full hover:scale-110 transition-transform shadow-2xl">
                Create Your Account
            </button>
        </section>

      </main>

      <Footer />
    </div>
  );
}
