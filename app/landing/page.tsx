"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Header from "./header/header";
import Footer from "./footer/footer";
import { ArrowRight, Bell, Activity, Smartphone, Zap } from "lucide-react";

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isSensorActive, setIsSensorActive] = useState(false);
  
  // Coordonate de bază
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Arcuri pentru mișcare fluidă
  const springX = useSpring(x, { stiffness: 60, damping: 30 });
  const springY = useSpring(y, { stiffness: 60, damping: 30 });

  // Transformări diferite pentru Background vs Logo (Parallax Effect)
  const bgX = useTransform(springX, (val) => val * 0.5); // Fundalul se mișcă mai puțin
  const bgY = useTransform(springY, (val) => val * 0.5);
  const logoX = useTransform(springX, (val) => val * 1.5); // Logo-ul se mișcă mai mult (efect 3D)
  const logoY = useTransform(springY, (val) => val * 1.5);

  const enableSensors = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setIsSensorActive(true);
          window.addEventListener("deviceorientation", handleOrientation);
        }
      } catch (err) { console.error("Acces refuzat"); }
    } else {
      setIsSensorActive(true);
      window.addEventListener("deviceorientation", handleOrientation);
    }
  };

  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (e.beta && e.gamma) {
      x.set(e.gamma * 1.5); 
      y.set((e.beta - 45) * 1.5);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX / window.innerWidth - 0.5) * 100;
      const moveY = (e.clientY / window.innerHeight - 0.5) * 100;
      x.set(moveX);
      y.set(moveY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    if (videoRef.current) videoRef.current.play().catch(() => {});

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [x, y]);

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white font-sans overflow-hidden">
      <Header />

      {/* BACKGROUND PARALLAX */}
      <motion.div 
        style={{ x: bgX, y: bgY, scale: 1.1 }} 
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
          autoPlay loop muted playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/20 to-black" />
      </motion.div>

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 text-center pt-20">
        
        {/* Status Badge */}
        <motion.div className="mb-10 px-5 py-2 border border-white/10 bg-white/5 backdrop-blur-3xl rounded-full flex items-center gap-3 shadow-2xl">
          <div className="relative flex h-2 w-2">
            <span className={`absolute inset-0 rounded-full opacity-75 animate-ping ${isSensorActive ? 'bg-emerald-400' : 'bg-yellow-400'}`}></span>
            <span className={`relative rounded-full h-2 w-2 ${isSensorActive ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
          </div>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2">
            {isSensorActive ? <Activity size={12} className="text-emerald-400" /> : <Zap size={12} className="text-yellow-400" />}
            {isSensorActive ? "Neural Engine Active" : "Sensor System Ready"}
          </span>
        </motion.div>

        {/* LOGO DYNAMIC - ACUM SE MIȘCĂ REPROȘABIL */}
        <motion.div 
          style={{ x: logoX, y: logoY }}
          className="relative mb-12"
        >
          {/* Glow dinamic care urmărește logo-ul */}
          <div className="absolute inset-0 bg-yellow-400/30 blur-[100px] rounded-full scale-150" />
          
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-1.5 rounded-[38px] bg-gradient-to-br from-white/20 to-transparent backdrop-blur-xl border border-white/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
          >
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 overflow-hidden rounded-[32px]">
              <Image 
                src="/logosmile.jpeg" 
                alt="Smile Logo" 
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </motion.div>
        </motion.div>

        <div className="max-w-5xl space-y-8">
          <h1 className="text-7xl sm:text-[10rem] font-black tracking-tighter leading-[0.8] italic">
            SMILE <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-yellow-500">LIVE</span>
          </h1>
          <p className="text-zinc-400 text-lg sm:text-2xl max-w-2xl mx-auto leading-relaxed font-medium">
            Next-gen social infrastructure. <br/>
            <span className="text-white italic underline decoration-yellow-400/40 underline-offset-8 uppercase tracking-widest text-sm font-black">
              Experience the parallax future
            </span>
          </p>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row gap-6 w-full justify-center items-center">
          <Link
            href="/smile_social"
            onClick={enableSensors}
            className="group px-14 py-7 bg-white text-black font-black text-xs rounded-2xl flex items-center gap-4 hover:bg-yellow-400 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 uppercase tracking-[0.2em]"
          >
            Enter Ecosystem 
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
          </Link>
          
          <button className="px-14 py-7 bg-white/5 backdrop-blur-3xl text-white border border-white/10 font-black text-xs rounded-2xl hover:bg-white/10 transition-all uppercase tracking-[0.2em]">
            Notify Me
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
