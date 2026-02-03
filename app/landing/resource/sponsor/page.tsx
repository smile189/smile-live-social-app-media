'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const CleanSocialInvestorPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const sections = [
    {
      title: "Market Thesis",
      content: "Smile Live is strategically positioned to capture the shifting attention of Gen-Z and Alpha demographics. By integrating proprietary AR infrastructure with low-latency streaming, we create a sovereign ecosystem that bypasses traditional media constraints."
    },
    {
      title: "Economic Architecture",
      content: "Our revenue model is built on a 35% platform commission from virtual goods. This creates a sustainable, high-margin ecosystem where creators and the platform are vertically aligned for long-term growth."
    },
    {
      title: "Infrastructure Sovereignty",
      content: "Unlike centralized competitors, Smile Live utilizes Tier-4 EEA-based data centers, ensuring full GDPR compliance and data residency—a critical requirement for the evolving European regulatory landscape."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#111] selection:bg-[#FFD700] selection:text-black font-sans antialiased">
      
      {/* --- TOP THIN ACCENT LINE --- */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#FFD700] via-[#ff0000] to-[#FFD700] z-50 opacity-80" />

      <main className="max-w-[1200px] mx-auto px-8 pt-32 pb-40">
        
        {/* --- HEADER --- */}
        <header className="mb-32 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-2xl">
            <nav className="flex items-center gap-3 mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 italic">Smile Live</span>
              <span className="w-1 h-1 bg-zinc-200 rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff0000]">Investor Relations</span>
            </nav>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-[1.1] mb-10">
              The evolution of <br />
              <span className="font-serif italic text-zinc-400">digital attention.</span>
            </h1>
            <p className="text-zinc-500 text-lg md:text-xl font-normal leading-relaxed max-w-xl">
              We are building a social streaming protocol that prioritizes sovereignty, high-fidelity interaction, and sustainable creator economics.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 border-l border-zinc-100 pl-6 h-fit">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Current Phase</span>
            <span className="text-2xl font-medium tracking-tight italic">Seed Round 2026</span>
          </div>
        </header>

        {/* --- IMAGE COMPONENT --- */}
        <section className="mb-40">
          <div className="relative aspect-[21/9] overflow-hidden bg-zinc-50 rounded-sm">
            <img 
              src="/smilelive.jpg" 
              alt="Smile Live Ecosystem" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute inset-0 border border-black/[0.03] pointer-events-none" />
          </div>
          <p className="mt-4 text-[9px] font-medium text-zinc-400 uppercase tracking-widest text-right">
            Visualization: Infrastructure Node v1.02 // Bucharest HQ
          </p>
        </section>

        {/* --- DETAILED TEXT SECTIONS --- */}
        <div className="grid md:grid-cols-3 gap-16 mb-40">
          {sections.map((sec, i) => (
            <div key={i} className="space-y-6">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#111] flex items-center gap-3">
                <span className="w-4 h-[1px] bg-[#ff0000]" /> {sec.title}
              </h2>
              <p className="text-[13px] leading-relaxed text-zinc-500 font-normal">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        {/* --- METRICS PANEL (CLEAN STYLE) --- */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-12 py-20 border-t border-b border-zinc-100 mb-40">
          {[
            { l: "Revenue Share", v: "35%", s: "Fixed Platform Margin" },
            { l: "Target Demo", v: "GZ/GA", s: "Gen-Z & Alpha Focus" },
            { l: "Latency", v: "<12ms", s: "Real-time Protocol" },
            { l: "Residency", v: "EEA", s: "Sovereign Infrastructure" }
          ].map((m, i) => (
            <div key={i} className="space-y-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{m.l}</p>
              <p className="text-3xl font-medium tracking-tighter">{m.v}</p>
              <p className="text-[11px] text-zinc-500 italic">{m.s}</p>
            </div>
          ))}
        </section>

        {/* --- CONTACT FORM (MINIMALIST) --- */}
        <section className="max-w-2xl mx-auto py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-medium tracking-tight mb-4">Request the Data Room</h2>
            <p className="text-sm text-zinc-500 italic">Access to our fiscal roadmap is granted after institutional clearance.</p>
          </div>

          {!submitted ? (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Investor Entity</label>
                  <input required className="bg-transparent border-b border-zinc-200 py-2 outline-none focus:border-black transition-colors text-sm" placeholder="e.g. Sequoia Capital" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Official Email</label>
                  <input required type="email" className="bg-transparent border-b border-zinc-200 py-2 outline-none focus:border-black transition-colors text-sm" placeholder="name@firm.com" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Investment Thesis</label>
                <textarea rows={1} className="bg-transparent border-b border-zinc-200 py-2 outline-none focus:border-black transition-colors text-sm resize-none" placeholder="Briefly describe your strategic interest..." />
              </div>
              <button type="submit" className="w-full bg-[#111] text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-black transition-all">
                Submit Request
              </button>
            </form>
          ) : (
            <div className="text-center py-10 animate-in fade-in duration-700">
              <div className="w-12 h-12 border border-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-2 h-2 bg-[#ff0000] rounded-full" />
              </div>
              <h3 className="text-xl font-medium tracking-tight mb-2">Inquiry Logged.</h3>
              <p className="text-[12px] text-zinc-500">Our liaison office will contact you within 12 business hours.</p>
            </div>
          )}
        </section>

        {/* --- FOOTER --- */}
        <footer className="mt-40 pt-10 border-t border-zinc-50 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col gap-6 items-center md:items-start group">
            <Link 
              href="/landing" 
              className="relative flex items-center justify-center px-10 py-5 overflow-hidden border border-[#ff0000]/20 transition-all duration-500 hover:border-[#ff0000] hover:shadow-[0_0_30px_rgba(255,0,0,0.15)] bg-white"
            >
              {/* Fundalul care glisează la hover */}
              <div className="absolute inset-0 w-0 bg-[#ff0000] transition-all duration-[600ms] ease-out group-hover:w-full" />
              
              <div className="relative z-10 flex items-center gap-4">
                {/* Indicatorul de status care devine alb la hover */}

                
                {/* Textul butonului */}
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#111] group-hover:text-white transition-colors duration-500 italic">
                  ← Back to Home
                </span>
              </div>
            </Link>


          </div>


        </footer>

      </main>
    </div>
  );
};

export default CleanSocialInvestorPage;
