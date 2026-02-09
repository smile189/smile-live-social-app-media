/**
 * app/landing/page.tsx - The landing page for Smile Live App, showcasing the brand's vision, roadmap, and key features with a dynamic and immersive design.
 * authored by BM, inspired by Alexandra Storyteller's vision for a captivating and engaging landing experience that immediately communicates the essence of Smile Live.
 * copyright 2026 Smile Live App. All rights reserved.
 */

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
        
            {/* HERO SECTION CU LOGO-UL REVENIT ȘI POZĂ SCUFUNDATĂ */}
        <section className="relative flex flex-col items-center justify-center px-6 pt-40 pb-20 min-h-screen text-center overflow-hidden">
          
          {/* POZĂ SCUFUNDATĂ ÎN FUNDAL (SUBMERGED IMAGE) */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image 
              src="/herosmile.webp" // 
              alt="Submerged Background"
              fill
              priority
              className="object-cover grayscale opacity-20 brightness-[0.4] contrast-[1.2]"
            />
            {/* Mască radială pentru topire în fundalul negru */}
            <div className="absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_10%,#000_80%)]" />
            
            {/* Textura Grainy pentru integrare fină */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app')] opacity-10 mix-blend-overlay" />
          </div>



          {/* LOGO DYNAMIC - THE PIECE DE RESISTANCE */}
          <motion.div 
            style={{ rotateX: logoRotationX, rotateY: logoRotationY, perspective: 1000 }}
            className="relative z-10 mb-16 group cursor-none"
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

         <h1 className="relative z-10 text-3xl md:text-9xl lg:text-[12rem] xl:text-[15rem] font-black tracking-[-0.08em] leading-[0.8] sm:leading-[0.7] italic mb-10 select-none">
            SMILE <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-400 to-zinc-900">LIVE.</span>
         </h1>

          <p className="relative z-10 max-w-3xl mx-auto text-zinc-400 text-lg sm:text-2xl font-medium leading-relaxed mb-16">
            Social infrastructure built for <span className="text-white italic underline decoration-yellow-400 decoration-4 underline-offset-8">insane performance</span>. 
            Experience 4K without the lag.
          </p>

          <div className="relative z-10 flex flex-col sm:flex-row gap-6">
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


        </section>



  {/* --- SECTION: 3D SOCIAL ECOSYSTEM RING --- */}
<section className="relative py-40 md:py-60 bg-black overflow-hidden min-h-screen flex flex-col justify-center">
  
  {/* BACKGROUND EFFECTS */}
  <div className="absolute inset-0 z-0">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[600px] md:h-[900px] bg-red-600 opacity-[0.03] blur-[120px] rounded-full" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app')] opacity-20 mix-blend-overlay pointer-events-none" />
  </div>

  <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-20 items-center">
    
    {/* LEFT SIDE: TEXT CONTENT */}
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-[1px] bg-[#FFD700]" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFD700]">smile live ecosystem</span>
      </motion.div>
      
      <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] mb-6">
        SMILE LIVE <br /> 
        <span className="text-transparent" style={{ WebkitTextStroke: '1px #ff0000' }}></span>
      </h2>
      
      <p className="text-zinc-500 max-w-md text-lg font-bold italic leading-relaxed uppercase tracking-tight">
        Our ecosystem is a open social economy. From <span className="text-white">proprietary AR nodes</span> to high-fidelity creator expressions.
      </p>

      <div className="flex gap-12 pt-10">
        <div className="flex flex-col">
          <span className="text-4xl font-black italic text-red-600">0.01s</span>
          <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest mt-2 italic">Node Latency</span>
        </div>
        <div className="flex flex-col border-l border-zinc-900 pl-12">
          <span className="text-4xl font-black italic text-[#FFD700]">35%</span>
          <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest mt-2 italic">Platform Yield</span>
        </div>
      </div>
    </div>

    {/* RIGHT SIDE: 3D RING CAROUSEL */}
    <div className="relative h-[500px] md:h-[700px] flex items-center justify-center [perspective:1500px]">
      


      {/* The 3D Ring */}
      <motion.div 
        className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d]"
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {[1, 2, 3, 4, 5, 6].map((id, idx) => (
          <motion.div
            key={id}
            className="absolute w-40 h-60 md:w-56 md:h-80 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/40 backdrop-blur-md group"
            style={{
              transform: `rotateY(${idx * 60}deg) translateZ(clamp(250px, 30vw, 450px))`,
            }}
          >
            <Image 
              src={`/social${id}.jpg`} // Asigură-te că ai pozele social1.jpg, social2.jpg... în public
              alt="Social Frame" 
              fill 
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4">
               <div className="h-[1px] w-8 bg-red-600 mb-3" />
               <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">@User_Node_{id}</p>
               <p className="text-[8px] font-bold text-zinc-500 uppercase italic">Live Protocol // AR</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </div>


  {/* Accent Line Footer */}
  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
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
<Link href="app/login">
  <button className="relative z-10 px-20 py-10 bg-white text-black font-black uppercase text-sm rounded-full hover:scale-110 transition-transform shadow-2xl">
    Create Your Account
  </button>
</Link>
        </section>

      </main>
        <GDPR /> {/* GDPR EU   */} 
      <Footer />
    </div>
  );
}
