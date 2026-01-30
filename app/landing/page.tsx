"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Header from "./header/header";
import Footer from "./footer/footer";
import { ArrowRight, Bell, ShieldCheck, Activity } from "lucide-react";

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // SENSOR LOGIC: Mouse & Gyroscope Parallax
  const mouseX = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });
  const mouseY = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });

  useEffect(() => {
    // Desktop: Mouse Move
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = (clientX / window.innerWidth) - 0.5;
      const moveY = (clientY / window.innerHeight) - 0.5;
      mouseX.set(moveX * 50); // Mișcare de 50px
      mouseY.set(moveY * 50);
    };

    // Mobile: Device Orientation (Senzor Real)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta && e.gamma) {
        mouseX.set(e.gamma * 1.5); 
        mouseY.set((e.beta - 45) * 1.5);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("deviceorientation", handleOrientation);
    
    if (videoRef.current) videoRef.current.play().catch(() => {});

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white font-sans selection:bg-yellow-400 selection:text-black overflow-hidden">
      <Header />

      {/* BACKGROUND SECTION */}
      <motion.div 
        style={{ x: mouseX, y: mouseY, scale: 1.1 }} 
        className="absolute inset-0 z-0 overflow-hidden transition-transform duration-100 ease-out"
      >
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
          autoPlay loop muted playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/20 to-black" />
      </motion.div>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 text-center pt-20">
        
        {/* Real-time Sensor Badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 px-4 py-2 border border-white/10 bg-white/5 backdrop-blur-3xl rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400/90 flex items-center gap-2">
            <Activity size={12} /> Live Node Connection: Stable
          </span>
        </motion.div>

        {/* Logo with Dynamic Shadow (Reaction to sensor) */}
        <motion.div 
          style={{ x: useSpring(mouseX, {damping: 40}), y: useSpring(mouseY, {damping: 40}) }}
          className="relative mb-10"
        >
          <div className="absolute inset-0 bg-yellow-400/20 blur-[80px] rounded-full" />
          <motion.div whileHover={{ scale: 1.05 }} className="relative p-1 rounded-[32px] bg-white/10 backdrop-blur-md border border-white/20">
            <Image 
              src="/logosmile.jpeg" 
              alt="Smile Live Logo" 
              width={110} height={110} 
              className="rounded-[28px] sm:w-28 sm:h-28 w-24 h-24 shadow-2xl object-cover"
            />
          </motion.div>
        </motion.div>

        {/* Typography */}
        <div className="max-w-5xl space-y-6">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-7xl sm:text-9xl font-black tracking-tighter leading-[0.85] italic"
          >
            SMILE <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-500">LIVE</span>
            <span className="text-sm align-top ml-2 text-yellow-500 font-bold tracking-widest uppercase">.app</span>
          </motion.h1>
          
          <p className="text-zinc-400 text-lg sm:text-2xl max-w-2xl mx-auto leading-relaxed font-light">
            Next-gen social infrastructure. 
            <span className="text-white font-medium italic block mt-2 underline decoration-yellow-400/30">
              Sensing the future of connection.
            </span>
          </p>
        </div>

        {/* CTA Section */}
        <div className="mt-14 flex flex-col sm:flex-row gap-5 w-full justify-center items-center">
          <Link
            href="/smile_social"
            className="group px-12 py-6 bg-white text-black font-black text-xs rounded-2xl flex items-center gap-4 hover:bg-yellow-400 transition-all shadow-2xl active:scale-95"
          >
            ENTER ECOSYSTEM 
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
          </Link>
          
          <button className="px-12 py-6 bg-white/5 backdrop-blur-2xl text-white border border-white/10 font-black text-xs rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 uppercase tracking-widest">
            <Bell size={18} className="text-yellow-400" />
            Notify Me
          </button>
        </div>

        {/* Live Metrics (Senzor simulat) */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 opacity-40">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black">4K</span>
            <span className="text-[9px] uppercase tracking-widest font-bold">Latency: 12ms</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black">2.4k</span>
            <span className="text-[9px] uppercase tracking-widest font-bold">Active Nodes</span>
          </div>
          <div className="flex flex-col items-center hidden md:flex">
            <span className="text-2xl font-black">SEC-256</span>
            <span className="text-[9px] uppercase tracking-widest font-bold">Encrypted</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
