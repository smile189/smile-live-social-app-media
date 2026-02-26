/**
 * app/landing/page.tsx - The landing page for Smile Live App, showcasing the brand's vision, roadmap, and key features with a dynamic and immersive design.
 * authored by BM, inspired by Alexandra Storyteller's vision for a captivating and engaging landing experience that immediately communicates the essence of Smile Live.
 * copyright 2026 Smile Live App. All rights reserved.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, useInView, AnimatePresence } from "framer-motion";

import { ArrowRight, Zap, Globe, Shield, Radio, Users, Sparkles, Cpu, Smartphone, BarChart3, Play } from "lucide-react";
import Header from "./header/header";
import Footer from "./footer/footer";
import GDPR from "./gdpr/gdpr";
import ChatWidget from "../../components/ChatWidget";

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


const handleStripePayment = async () => {
  // Ia valoarea curentă din input
  const input = document.querySelector('input[type="number"]') as HTMLInputElement;
  const amount = parseInt(input.value) || 1000;

  // Trimite la serverul API (fisierul route.ts creat anterior)
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  const { url } = await res.json();
  if (url) window.location.href = url; // Te trimite la Stripe
};


const SLIDES = [
  {
    image: "/social1.jpg",
    titlePrimary: "SMILE",
    titleSecondary: "LIVE.",
    description: "Social infrastructure built for insane performance. Experience 4K without the lag."
  },
  {
    image: "/social2.jpg",
    titlePrimary: "ULTRA",
    titleSecondary: "FAST.",
    description: "Built for the next generation of creators. Pure speed, no compromises."
  },
  {
    image: "/social3.jpg", // 
    titlePrimary: "BEYOND",
    titleSecondary: "LIMITS.",
    description: "Pushing the boundaries of real-time interaction. Global scale, local speed."
  },
  {
    image: "/social4.jpg", // 
    titlePrimary: "PURE",
    titleSecondary: "FLOW.",
    description: "Uninterrupted connectivity for a seamless digital experience. Feel the rhythm."
  }
];

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




const [current, setCurrent] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, 6000);
  return () => clearInterval(timer);
}, []);

  
  return (
    <div className="relative min-h-screen bg-[#000] text-white font-sans overflow-x-hidden selection:bg-red-600">
      <Header />
      
      {/* TEXTURĂ FUNDAL */}
      <div className="fixed inset-0 z-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app')] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-screen bg-gradient-to-b from-red-900/20 via-transparent to-transparent pointer-events-none" />

      <main className="relative z-10">
        

{/* ================= HERO CAROUSEL RESPONSIVE ================= */}
<section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-black">

  {/* BACKGROUND SLIDES */}
  <div className="absolute inset-0 z-0">
    <AnimatePresence mode="wait">
      {SLIDES.map((slide, index) => (
        current === index && (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.8, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt="Hero Background"
              fill
              priority
              className="object-cover brightness-[0.7] contrast-[1.3]"
            />
          </motion.div>
        )
      ))}
    </AnimatePresence>
    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
  </div>

  {/* CONTENT */}
  <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl mx-auto pt-10">
    <AnimatePresence mode="wait">
      <motion.div
        key={current}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.8 }}
      >
        {/* RESPONSIVE TEXT: text-4xl pe mobil, text-8xl pe tableta, 10rem+ pe desktop */}
        <h1 className="text-4xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-[-0.05em] leading-[0.9] sm:leading-[0.85] italic drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          {SLIDES[current].titlePrimary}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-400 to-zinc-900">
            {SLIDES[current].titleSecondary}
          </span>
        </h1>

        <p className="mt-6 sm:mt-8 text-white/90 text-base sm:text-xl md:text-2xl max-w-3xl mx-auto font-bold drop-shadow-md px-4">
          {SLIDES[current].description}
        </p>
      </motion.div>
    </AnimatePresence>

    {/* CTA: flex-col pe mobil (unul sub altul), flex-row pe desktop */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-10 sm:mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6"
    >
      <Link
        href="/app"
        className="w-full sm:w-auto px-10 py-5 sm:px-12 sm:py-6 bg-yellow-400 text-black font-black uppercase text-[10px] sm:text-xs tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl text-center"
      >
        acces Platform
      </Link>

      <Link 
        href="/app/live" 
        className="w-full sm:w-auto group relative px-10 py-5 sm:px-12 sm:py-6 border border-red-600/50 text-white font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] rounded-2xl transition-all hover:bg-red-600 hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] backdrop-blur-sm flex items-center justify-center gap-3"
      >
        <span className="relative z-10">Go LIVE</span>
      </Link>
    </motion.div>

    {/* DOT INDICATORS */}
    <div className="flex justify-center gap-3 mt-12 sm:mt-16">
      {SLIDES.map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrent(index)}
          className={`h-1.5 sm:h-2 transition-all duration-500 rounded-full ${
            current === index
              ? "w-8 sm:w-10 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              : "w-3 sm:w-4 bg-white/30 hover:bg-white/60"
          }`}
        />
      ))}
    </div>
  </div>

  {/* NAV - HIDDEN ON MOBILE */}
  <button
    onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
    className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black transition-all z-20"
  >
    ‹
  </button>

  <button
    onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
    className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black transition-all z-20"
  >
    ›
  </button>
</section>




              {/* --- REVOLUT PERSONAL SUPPORT SECTION (MIN 1000 COINS) --- */}
        <section className="px-6 py-24 max-w-5xl mx-auto border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-4">
            <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
              Smile app <span className="text-yellow-400 font-black">contributing </span>
            </h2>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-sm italic lowercase tracking-tight">
              direct infrastructure funding. transfer via revolut me. zero processing fees. 
            </p>
            <div className="flex gap-8 pt-2">
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Fixed Rate</p>
                <p className="text-xl font-bold text-white tracking-tighter">
                  $0.01 <span className="text-[10px] text-zinc-600 font-mono italic uppercase font-normal">usd / coin</span>
                </p>
              </div>
            </div>

            {/* LEGAL DISCLOSURE BOX */}
            <div className="mt-8 p-4 bg-zinc-900/30 border-l-2 border-yellow-400/50 rounded-r-xl max-w-md">
              <p className="text-[10px] text-zinc-400 leading-relaxed uppercase font-bold tracking-tighter">
                <span className="text-yellow-400">Contribution Disclosure:</span> By proceeding, you acknowledge this is a voluntary donation to support SMILE LIVE development. Smile Coins are pre-launch assets and will be officially credited to your account upon the platform's public release in 2026.
              </p>
            </div>
          </div>

          <div className="w-full md:w-[350px] bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Amount</label>
                <span className="text-[9px] font-bold text-red-600 uppercase tracking-tighter">Min. 1000</span>
              </div>
              <div className="relative">
                <input 
                  id="coin-input-field"
                  type="number" 
                  min="1000"
                  defaultValue="1000"
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const priceEl = document.getElementById('total-price');
                    const btn = document.getElementById('rev-btn') as HTMLButtonElement;
                    
                    if(priceEl) {
                      priceEl.innerText = (val * 0.01).toFixed(2);
                      if(val < 1000) {
                        priceEl.classList.add('text-red-600');
                        if(btn) {
                          btn.style.opacity = "0.5";
                          btn.style.pointerEvents = "none";
                        }
                      } else {
                        priceEl.classList.remove('text-red-600');
                        if(btn) {
                          btn.style.opacity = "1";
                          btn.style.pointerEvents = "auto";
                        }
                      }
                    }
                  }}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-2xl font-black text-white focus:border-yellow-400 outline-none transition-all appearance-none"
                />
                <Zap size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-yellow-400 opacity-30" />
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t border-zinc-800 pt-6">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Total to Send</span>
              <span className="text-4xl font-black text-white">$<span id="total-price">10.00</span></span>
            </div>

            {/* BUTONUL CATRE REVOLUT PERSONAL */}
<div className="space-y-4 w-full">
  {/* BUTONUL PRINCIPAL */}
  <button 
    id="rev-btn"
    onClick={() => {
      const valInput = document.getElementById('coin-input-field') as HTMLInputElement;
      const val = valInput ? Number(valInput.value) : 0;
      
      if(val >= 1000) {
         // Apare zona de multumire si apoi redirect dupa 3 secunde
         const thanksBox = document.getElementById('thanks-msg');
         if(thanksBox) thanksBox.classList.remove('hidden');
         
         setTimeout(() => {
           window.open('https://revolut.me/smile89', '_blank');
         }, 3000);
      }
    }}
    className="w-full bg-[#0075eb] hover:bg-white hover:text-[#0075eb] text-white py-5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2 border border-[#0075eb] shadow-xl shadow-[#0075eb]/20"
  >
    Donate via Revolut <ArrowRight size={16} strokeWidth={3} />
  </button>

  {/* MESAJUL DE MULȚUMIRE INTEGRAT (HIDDEN BY DEFAULT) */}
  <div id="thanks-msg" className="hidden animate-in fade-in slide-in-from-top-2 duration-500">
    <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl space-y-3">
      <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest text-center">
        Thank you for supporting smileliveapp.com!
      </p>
      <div className="space-y-1 text-center">
        <p className="text-[9px] text-zinc-400 uppercase font-bold">
          1. Send the exact amount on Revolut
        </p>
        <p className="text-[9px] text-white uppercase font-black tracking-tighter">
          2. Note: Include your Smile Username
        </p>
      </div>
      <p className="text-[8px] text-zinc-500 text-center italic">
        Redirecting to Revolut app in 3s...
      </p>
    </div>
  </div>
</div>


            <p className="text-[9px] text-center text-zinc-600 font-bold uppercase tracking-tighter leading-tight italic">
              * Minimum order: 1,000 coins. <br /> Coins credited manually after verification.
            </p>
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
            <div className="absolute inset-0 bg- [mask-image:radial-gradient(ellipse_at_center,transparent_10%,#000_85%)]" />
            
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
         <ChatWidget user={{ id: 'anonim', email: 'vizitator@smile.live' }} />
      <Footer />
    </div>
  );
}
