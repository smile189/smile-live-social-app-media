'use client';

import React, { useState } from 'react';
import { Code2, Briefcase, Linkedin, Github, ChevronRight, Target, Shield, Rocket, Phone } from 'lucide-react';
import Header from "@/app/landing/header/header"; 
import Footer from "@/app/landing/footer/footer";

const founders = [
  {
    name: 'Alexandra Stefan',
    role: 'Chief Executive Officer',
    focus: 'Product Strategy & Growth',
    initials: 'AS',
    icon: Briefcase,
    linkedin: 'https://linkedin.com',
    github: '#',
    bio: 'Former Product Lead with a successful in many projects. Drives the commercial vision and strategic partnerships at SmileLive for global scaling.',
    highlights: ['10+ Yrs Product Experience', 'Ex-Social media  Lead', 'Social media specialist interactive'],
    hasConsulting: true,
    phone: '+40722000000', // Înlocuiește cu numărul real al CEO-ului
    rate: '€1,000/hr'
  },
  {
    name: 'B Marius',
    role: 'Chief Technology Officer',
    focus: 'Infrastructure & Architecture',
    initials: 'MB',
    icon: Code2,
    linkedin: 'https://linkedin.com',
    github: 'https://github.com/smile189/smile-live-social-app-media',
    bio: 'Distributed systems architect. Developed SmileLive\'s streaming infrastructure capable of supporting over 100k concurrent connections.',
    highlights: ['Senior Software Eng', 'WebRTC & Go Expert', 'Smile Source main Contributor', 'ARM Cortex M/A  advanced knowledge', 'Fullstack dev'],
    hasConsulting: false
  },
];

const companyInsights = [
  {
    id: 'vision',
    title: 'Our Mission',
    description: 'Transforming live streaming monetization by eliminating middlemen, providing creators with direct, instant, and secure transactions.',
    icon: Target
  },
  {
    id: 'compliance',
    title: 'Security & Corporate',
    description: 'Financial architecture fully compliant with European regulations, auditable, and optimized for high-volume micro-transactions.',
    icon: Shield
  },
  {
    id: 'growth',
    title: 'Q3/Q4 Scalability',
    description: 'Expanding the ecosystem through native viewer-brand interaction modules and integrating new ultra-low latency protocols.',
    icon: Rocket
  }
];

export default function FoundersClient() {
  const [selectedInsight, setSelectedInsight] = useState('vision');

const activeInsight = companyInsights.find(i => i.id === selectedInsight) || companyInsights[0];
const InsightIcon = activeInsight.icon;


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-slate-900 selection:text-white flex flex-col justify-between">
      
      {/* Header-ul tău global */}
      <Header />
      
      {/* ── Main Content Area ── */}
      <main className="mx-auto max-w-5xl w-full px-4 sm:px-8 py-12 sm:py-20 flex-grow">
        
        {/* Executive Hero */}
        <div className="border-l-2 border-slate-900 pl-4 sm:pl-6 mb-16 max-w-3xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            Governance & Execution
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4 sm:leading-none">
            The team behind SmileLive.
          </h1>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            Founders with a proven track record in technology and product development, focused on rapid execution and corporate transparency.
          </p>
        </div>

        {/* Founders Grid */}
        <div className="grid gap-8 sm:grid-cols-2 mb-20">
          {founders.map((founder) => {
            const FounderIcon = founder.icon;
            return (
              <div
                key={founder.name}
                className="group relative bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-14 w-14 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-slate-900/10">
                      {founder.initials}
                    </div>
                    <div className="flex gap-2">
                      <a href={founder.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="LinkedIn">
                        <Linkedin className="h-5 w-5" />
                      </a>
                      {founder.github !== '#' && (
                        <a href={founder.github} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="GitHub">
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <FounderIcon className="h-3.5 w-3.5" />
                      {founder.focus}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-slate-800 transition-colors">
                      {founder.name}
                    </h3>
                    <p className="text-sm font-semibold text-slate-600">
                      {founder.role}
                    </p>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {founder.bio}
                  </p>
                </div>

                {/* Card Footer: Highlights & Advisory Options */}
                <div className="border-t border-slate-100 pt-4 mt-auto space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {founder.highlights.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {founder.hasConsulting && (
                    <div className="space-y-1.5">
                      <a
                        href={`tel:${founder.phone}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-3 px-4 shadow-sm shadow-amber-500/10 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        Book Advisory ({founder.rate})
                      </a>
                      <p className="text-[10px] text-slate-400 text-center font-medium">
                        *Retainer contract required prior to scheduled consultation.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Strategic Pillars Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Strategic Pillars</h3>
            <p className="text-sm text-slate-500">Select a direction below to inspect executive-level details.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 border-b border-slate-100 pb-6 mb-6">
            {companyInsights.map((insight) => (
              <button
                key={insight.id}
                onClick={() => setSelectedInsight(insight.id)}
                className={`flex items-center justify-between p-4 rounded-xl text-left font-semibold text-sm transition-all border ${
                  selectedInsight === insight.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm shadow-slate-900/15'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{insight.title}</span>
                <ChevronRight className={`h-4 w-4 transition-transform ${selectedInsight === insight.id ? 'rotate-90 text-white' : 'text-slate-400'}`} />
              </button>
            ))}
          </div>

          {/* Dynamic Info Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start transition-all duration-200">
            <div className="p-3 bg-white border border-slate-200 rounded-lg shrink-0">
              <InsightIcon className="h-6 w-6 text-slate-900" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">{activeInsight.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{activeInsight.description}</p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer-ul tău global */}
      <Footer />

    </div>
  );
}
