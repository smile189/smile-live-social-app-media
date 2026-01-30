"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Header from "./header/header";
import Footer from "./footer/footer";
import { ArrowRight, Bell, ShieldCheck, Activity, Smartphone } from "lucide-react";

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isSensorActive, setIsSensorActive] = useState(false);
  
  const mouseX = useSpring(useMotionValue(0), { stiffness: 40, damping: 25 });
  const mouseY = useSpring(useMotionValue(0), { stiffness: 40, damping: 25 });

  // Funcție pentru activarea senzorilor pe Mobile (iOS/Android)
  const enableSensors = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setIsSensorActive(true);
          window.addEventListener("deviceorientation", handleOrientation);
        }
      } catch (err) { console.error("Sensor access denied"); }
    } else {
      // Android sau Browsere care nu cer permisiune explicită
      setIsSensorActive(true);
      window.addEventListener("deviceorientation", handleOrientation);
    }
  };

  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (e.beta && e.gamma) {
      // Ajustăm valorile pentru a simula perspectiva
      mouseX.set(e.gamma * 2); 
      mouseY.set((e.beta - 45) * 2);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Parallax pentru desktop (întotdeauna activ)
      const moveX = (e.clientX / window.innerWidth) - 0.5;
      const moveY = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(moveX * 60);
      mouseY.set(moveY * 60);
    };

    window.addEventListener("mousemove", handleMouseMove);
    if (videoRef.current) videoRef.current.play().catch(() => {});

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white font-sans selection:bg-yellow-400 selection:text-black overflow-hidden">
      <Header />

      {/* BACKGROUND CU PARALLAX SENSOR */}
      <motion.div 
        style={{ x: mouseX, y: mouseY, scale: 1.15 }} 
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
          autoPlay loop muted playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/20 to-black" />
      </motion.div>

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 text-center pt-20">
        
        {/* Real-time Status Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 px-4 py-2 border border-white/10 bg-white/5 backdrop-blur-3xl rounded-full flex items-center gap-3"
        >
          <div className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${isSensorActive ? 'bg-emerald-400' : 'bg-yellow-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isSensorActive ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
          </div>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2">
            {isSensorActive ? <Activity size={12} className="text-emerald-400" /> : <Smartphone size={12} className="text-yellow-400" />}
            {isSensorActive ? "Sensor Engine: Active" : "Sensor Engine: Ready"}
          </span>
        </motion.div>

        {/* Dynamic Logo */}
        <motion.div 
          style={{ x: useSpring(mouseX, {damping: 30}), y: useSpring(mouseY, {damping: 30}) }}
          className="relative mb-10"
        >
          <div className="absolute inset-0 bg-yellow-400/20 blur-[100px] rounded-full" />
          <motion.div whileHover={{ scale: 1.05 }} className="relative p-1 rounded-[32px] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <Image 
              src="/logosmile.jpeg" 
              alt="Smile Logo" 
              width={110} height={110} 
              className="rounded-[28px] sm:w-28 sm:h-28 w-24 h-24 object-cover"
            />
          </motion.div>
        </motion.div>

        <div className="max-w-5xl space-y-6">
          <motion.h1 className="text-7xl sm:text-9xl font-black tracking-tighter leading-[0.85] italic">
            SMILE <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-500">LIVE</span>
          </motion.h1>
          <p className="text-zinc-400 text-lg sm:text-2xl max-w-2xl mx-auto leading-relaxed">
            Next-gen social infrastructure. <span className="text-white italic underline decoration-yellow-400/30">Sensing connection.</span>
          </p>
        </div>

        <div className="mt-14 flex flex-col sm:flex-row gap-5 w-full justify-center items-center">
          <Link
            href="/smile_social"
            onClick={enableSensors} // ACTIVARE SENZOR LA CLICK
            className="group px-12 py-6 bg-white text-black font-black text-xs rounded-2xl flex items-center gap-4 hover:bg-yellow-400 transition-all shadow-2xl active:scale-95 uppercase tracking-widest"
          >
            Enter Ecosystem 
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
          </Link>
          
          <button className="px-12 py-6 bg-white/5 backdrop-blur-2xl text-white border border-white/10 font-black text-xs rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest">
            Notify Me
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
