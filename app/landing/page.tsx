"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { ArrowRight, Zap, Globe, Shield, Radio, Users, Sparkles, Cpu, Smartphone, BarChart3, Play } from "lucide-react";
import Header from "./header/header";
import Footer from "./footer/footer";
import GDPR from "./gdpr/gdpr";


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

         <h1 className="text-3xl md:text-9xl lg:text-[12rem] xl:text-[15rem] font-black tracking-[-0.08em] leading-[0.8] sm:leading-[0.7] italic mb-10 select-none">
  SMILE <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-400 to-zinc-900">LIVE.</span>
</h1>


          <p className="max-w-3xl mx-auto text-zinc-400 text-lg sm:text-2xl font-medium leading-relaxed mb-16">
            Social infrastructure built for <span className="text-white italic underline decoration-yellow-400 decoration-4 underline-offset-8">insane performance</span>. 
            Experience 4K without the lag.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link href="/app" className="group relative px-16 py-8 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl overflow-hidden transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]">
               <div className="absolute inset-0 bg-yellow-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
               <span className="relative z-10 flex items-center gap-4">Go to app <ArrowRight size={20} /></span>
            </Link>
          </div>
        </section>


        {/* --- SECTION: INDUSTRIAL ROADMAP WITH SEMI-OBSCURED SOCIAL BACKDROP --- */}
        <section className="px-6 py-40 max-w-6xl mx-auto relative bg-black overflow-hidden">
          
          {/* FUNDAL SOCIAL AFUMAT (RADIAL PROJECTION) */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image 
              src="/roadmap.jpg" 
              alt="Social Backdrop"
              fill
              className="object-cover grayscale brightness-[0.15] contrast-[1.2]"
              priority
            />
            {/* Mască Radială pentru integrare perfectă în negru */}
            <div className="absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_10%,#000_85%)]" />
            
            {/* Textură Grainy */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app')] opacity-10 mix-blend-soft-light" />
            
            {/* Scanline Roșu Subtil */}
            <motion.div 
              animate={{ top: ["0%", "100%"] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[1px] bg-red-600/10 shadow-[0_0_15px_#ff0000] z-0"
            />
          </div>

          {/* TITLU SECȚIUNE */}
          <div className="mb-32 relative z-10">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "100px" }}
              className="h-[4px] bg-red-600 mb-6 shadow-[0_0_30px_#ff0000]"
            />
            <h2 className="text-7xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.8]">
              The <span className="text-[#FFD700]">Roadmap.</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-800 mt-4 italic">
              Social_Infrastructure_Execution_Protocol_v2.0
            </p>
          </div>

          <div className="relative z-10">
            {/* LINIA DE PROGRES (CENTRALĂ/LATERALĂ) */}
            <div className="absolute left-4 md:left-1/2 top-0 w-[2px] h-full bg-zinc-900/50 -translate-x-1/2">
               <motion.div 
                 initial={{ height: 0 }}
                 whileInView={{ height: "100%" }}
                 viewport={{ once: false }}
                 transition={{ duration: 2.5, ease: "linear" }}
                 className="absolute top-0 left-0 w-full bg-gradient-to-b from-red-600 via-[#FFD700] to-transparent shadow-[0_0_25px_#ff0000]"
               />
            </div>

            <div className="space-y-32 md:space-y-56">
              {[
                { q: "Q1 2026", title: "Sovereign Node", status: "ACTIVE", desc: "Deployment of initial EEA server clusters. Bucharest node operational with <10ms latency.", side: "left" },
                { q: "Q2 2026", title: "Spatial Gifting", status: "LOCKED", desc: "AR-based virtual economy. Proprietary 4K high-fidelity gift rendering engine.", side: "right" },
                { q: "Q3 2026", title: "EU Grid Expand", status: "PLANNED", desc: "Berlin & Paris node activation. Full GDPR data residency sovereignty compliance.", side: "left" },
                { q: "Q4 2026", title: "Series A Round", status: "PLANNED", desc: "Institutional scaling. Strategic expansion of sovereign node network across Tier-1 EU cities.", side: "right" },
                { q: "Q1 2027", title: "Spatial Audio", status: "RESEARCH", desc: "Object-based audio protocol for immersive social environments and real-time spatial events.", side: "left" },
                { q: "Q2 2027", title: "Creator Studio", status: "DEVELOPMENT", desc: "Next-gen dashboard with real-time analytics and integrated AR filter production tools.", side: "right" },
                { q: "Q3 2027", title: "Global Mesh", status: "VISION", desc: "Decentralized node distribution crossing the Atlantic. Initial US-East Coast presence.", side: "left" },
                { q: "Q4 2027", title: "Smile Protocol", status: "VISION", desc: "Opening the API for 3rd party high-fidelity social app development on our sovereign infra.", side: "right" }
              ].map((phase, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: "-100px" }}
                  className={`relative flex items-center justify-between w-full flex-col md:flex-row ${
                    phase.side === 'right' ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Indicatorul care pulsează pe linie */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-black border-2 border-red-600 rounded-full z-20 flex items-center justify-center">
                    <motion.div 
                        whileInView={{ scale: [1, 1.4, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`w-1.5 h-1.5 rounded-full ${phase.status === 'ACTIVE' ? 'bg-[#FFD700] shadow-[0_0_10px_#FFD700]' : 'bg-zinc-800'}`} 
                    />
                  </div>

                  {/* Cardul cu Glitch la titlu */}
                  <div className="w-full md:w-[45%] ml-12 md:ml-0 group">
                    <div className="p-10 bg-black/40 backdrop-blur-md border border-zinc-900 group-hover:border-[#ff0000]/50 transition-all duration-500 relative overflow-hidden">
                      
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[11px] font-black text-red-600 uppercase tracking-widest italic">
                            {phase.q}
                        </span>
                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-tighter">Phase_0{idx + 1}</span>
                      </div>
                      
                      {/* Titlu cu efect de glitch subtil la hover */}
                      <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-6 group-hover:text-[#FFD700] transition-all group-hover:skew-x-1">
                        {phase.title}
                      </h3>
                      
                      <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-tight leading-relaxed italic border-l border-zinc-800 pl-6 group-hover:border-[#FFD700] transition-colors">
                        {phase.desc}
                      </p>

                      {/* Watermark Fundal */}
                      <div className="absolute -bottom-4 -right-4 text-7xl font-black italic text-zinc-900 opacity-10 pointer-events-none group-hover:text-red-600/20 transition-colors">
                        {phase.status}
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block w-[45%]" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* FOOTER ROADMAP */}
          <div className="mt-40 text-center relative z-10">
             <div className="h-px bg-gradient-to-r from-transparent via-zinc-900 to-transparent mb-12" />
             <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[1.5em] hover:text-red-600 transition-all cursor-default">
               Execution_Is_Sovereignty
             </p>
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
            <h2 className="text-5xl sm:text-[10rem] font-black italic uppercase tracking-tighter leading-none mb-16 relative z-10">
                DONT JUST WATCH.<br/><span className="text-red-600">SMILE.</span>
            </h2>
            <button className="relative z-10 px-20 py-10 bg-white text-black font-black uppercase text-sm rounded-full hover:scale-110 transition-transform shadow-2xl">
                Create Your Account
            </button>
        </section>

      </main>
        <GDPR /> {/* GDPR EU   */} 
      <Footer />
    </div>
  );
}
