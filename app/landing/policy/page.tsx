'use client';

import React from 'react';
import Link from 'next/link';

const PolicyPage = () => {
  const lastUpdated = "February 03, 2026";

  const sections = [
    {
      title: "1. Terms of Service (ToS)",
      content: (
        <div className="space-y-4">
          <p><strong>1.1 Acceptance of Terms:</strong> By accessing or using the Smile Live platform (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.</p>
          <p><strong>1.2 Eligibility:</strong> You must be at least 18 years old (or the age of majority in your jurisdiction) to use Smile Live.</p>
          <p><strong>1.3 Accounts:</strong> Users are responsible for maintaining the confidentiality of their account credentials. You are responsible for all activities that occur under your account.</p>
          <p><strong>1.4 Virtual Goods (Coins, Stars, Gifts):</strong> Smile Live offers virtual goods such as coins, stars, and AR gifts. Virtual goods have no real-world monetary value and cannot be redeemed for cash by users, except where explicitly allowed for creators. All purchases are final and non-refundable.</p>
          <p><strong>1.5 Payments:</strong> Payments are processed by third-party providers. Smile Live does not store full payment card details.</p>
          <p><strong>1.6 Prohibited Conduct:</strong> You agree not to violate laws, infringe IP rights, use bots, or abuse gifting/payment systems.</p>
          <p><strong>1.7 Termination:</strong> Smile Live may suspend or terminate accounts at its sole discretion for violations.</p>
        </div>
      )
    },
    {
      title: "2. Virtual Goods & Creator Earnings",
      content: (
        <div className="space-y-4">
          <p><strong>2.1 Platform Commission:</strong> Smile Live retains a platform commission (e.g. 35%) from virtual gifts before creator earnings are calculated.</p>
          <p><strong>2.2 Creator Payouts:</strong> Subject to verification, compliance checks, and minimum thresholds. Payouts may be delayed in cases of suspected fraud.</p>
          <p><strong>2.3 No Ownership:</strong> Virtual goods remain licensed, not sold. Users acquire a limited, revocable license to use them within the platform.</p>
        </div>
      )
    },
    {
      title: "3. Intellectual Property Policy",
      content: (
        <div className="space-y-4">
          <p><strong>3.1 Smile Live IP:</strong> All platform content, designs, AR effects, gifts, trademarks, and software are the exclusive property of Smile Live Stream S.R.L.</p>
          <p><strong>3.2 User Content:</strong> Users grant Smile Live a worldwide, non-exclusive, royalty-free license to host, display, and distribute content.</p>
          <p><strong>3.3 Prohibited IP Use:</strong> Unauthorized use of copyrighted or trademarked material is strictly prohibited.</p>
        </div>
      )
    },
    {
      title: "4. Community Guidelines",
      content: "Smile Live is a creative and respectful environment. The following are not allowed: Hate speech or harassment, sexual exploitation or illegal content, violence or threats. We reserve the right to remove non-compliant content."
    },
    {
      title: "5. Privacy Policy",
      content: (
        <div className="space-y-4">
          <p><strong>5.1 Data Collected:</strong> Account information, device/usage data, and payment metadata (via processors).</p>
          <p><strong>5.2 Use of Data:</strong> To provide and improve the Service, prevent fraud, and comply with legal obligations.</p>
          <p><strong>5.3 Data Sharing:</strong> We do not sell personal data. Data is shared with payment processors, cloud providers, or authorities if legally required.</p>
          <p><strong>5.4 User Rights:</strong> Users may request access, correction, or deletion of data in accordance with GDPR.</p>
        </div>
      )
    },
    {
      title: "6. Anti-Fraud & Security",
      content: "Smile Live uses automated and manual systems to detect fraudulent payments, abuse of virtual goods, and suspicious account behavior. Accounts may be limited during investigations."
    },
    {
      title: "7. Disclaimers & Liability",
      content: "The Service is provided 'as is' without warranties of any kind. Smile Live is not liable for indirect or consequential damages."
    },
    {
      title: "8. Governing Law",
      content: "These Terms are governed by the laws of Romania and applicable EU regulations."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-100 selection:bg-[#FFD700] selection:text-black font-sans">
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        
        <header className="mb-16 md:mb-24">
          <div className="bg-[#FFD700] text-black text-[10px] font-black px-3 py-1 inline-block mb-6 uppercase tracking-[0.2em]">
            Draft for app / Investor Discussion
          </div>
          <h1 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter mb-4">
            Service Terms <br />& Policies
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Smile Live Stream S.R.L. • Last Updated: {lastUpdated}
          </p>
        </header>

        <div className="space-y-16">
          {sections.map((section, idx) => (
            <section key={idx} className="border-l-2 border-zinc-100 dark:border-zinc-800 pl-6 md:pl-8">
              <h2 className="text-lg md:text-xl font-black uppercase italic mb-4 tracking-tight text-[#FFD700]">
                {section.title}
              </h2>
              <div className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-base md:text-lg font-medium">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-24 pt-12 border-t border-zinc-100 dark:border-zinc-900">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">9. Official Contact</p>
              <p className="text-xl font-black italic">Smile Live Stream S.R.L.</p>
              <p className="text-zinc-500">Bucharest, Romania</p>
              <a href="mailto:support@smileliveapp.com" className="text-[#FFD700] font-bold hover:underline">
                support@smileliveapp.com
              </a>
            </div>
            
            {/* Buton de întoarcere optimizat vizual */}
            <div className="pt-12">
              <Link href="/landing" className="group relative inline-flex items-center gap-4 overflow-hidden border border-zinc-200 dark:border-zinc-800 px-8 py-4 transition-all hover:border-[#FFD700]">
                {/* Overlay-ul de fundal care se mișcă la hover */}
                <div className="absolute inset-0 translate-y-full bg-[#FFD700] transition-transform duration-300 ease-out group-hover:translate-y-0" />
                
                {/* Conținutul butonului */}
                <span className="relative text-xs font-black uppercase tracking-widest transition-colors duration-300 group-hover:text-black">
                  Return to Home
                </span>
                
                <svg 
                  className="relative w-4 h-4 transition-all duration-300 -rotate-45 group-hover:rotate-0 group-hover:text-black" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
            </div>

          </div>
        </footer>
      </main>
    </div>
  );
};

export default PolicyPage;
