'use client';

import React from 'react';
import Link from 'next/link';

const PolicyPage = () => {
  const lastUpdated = "February 03, 2026";

  const sections = [
    {
      title: "Data Protection & Sovereignty",
      content: "Smile Live operates in strict accordance with the General Data Protection Regulation (GDPR) (EU) 2016/679. We implement high-level technical and organizational measures to ensure the sovereignty and confidentiality of user data. Personal information is encrypted at rest and in transit using industry-standard TLS 1.3 and AES-256 protocols."
    },
    {
      title: "Processing Activities",
      content: "Data processing is conducted solely for providing streaming services, identity verification, and platform security. We process identifiers (IP addresses, device IDs), contact information, and interaction metadata. The legal basis for processing includes contractual necessity and legitimate interest in preventing fraudulent activities within the network."
    },
    {
      title: "Server Infrastructure & Residency",
      content: "All user data is hosted on Tier-4 data centers located within the European Economic Area (EEA). We utilize a distributed cloud architecture with automated failover mechanisms to ensure 99.9% uptime. Data residency is strictly enforced, and no personal information is transferred to jurisdictions lacking an adequacy decision by the European Commission without standard contractual clauses (SCCs)."
    },
    {
      title: "User Rights & Data Access",
      content: "Under the legal framework, you hold the right to access, rectify, or request the permanent erasure of your personal data ('Right to be Forgotten'). Users may also exercise their right to data portability or object to automated decision-making processes. Requests regarding data control can be submitted via our secure legal portal."
    },
    {
      title: "Data Retention & Disposal",
      content: "Personal data is retained only for the duration necessary to fulfill the purposes for which it was collected. Upon account termination, data is subjected to a secure cryptographic erasure process. Historical logs are anonymized for statistical analysis, ensuring no re-identification is possible."
    },
    {
      title: "Cookie Governance",
      content: "The platform employs strictly necessary cookies for session management and security. Analytical and functional cookies are disabled by default and require explicit affirmative action from the user. We do not engage in cross-site tracking or sale of user browsing history to third-party data brokers."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-100 selection:bg-[#FFD700] selection:text-black">
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        
        {/* Header */}
        <header className="mb-16 md:mb-24">
          <h1 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter mb-4">
            Privacy & <br />Legal Framework
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Smile Live Official Documentation • Last Revised: {lastUpdated}
          </p>
        </header>

        {/* Content Section */}
        <div className="space-y-16 md:space-y-20">
          {sections.map((section, idx) => (
            <section key={idx} className="border-l-2 border-zinc-100 dark:border-zinc-900 pl-6 md:pl-8 group">
              <h2 className="text-lg md:text-xl font-black uppercase italic mb-4 tracking-tight flex items-center gap-3 transition-colors group-hover:text-[#FFD700]">
                <span className="w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
                {section.title}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-base md:text-lg font-medium">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        {/* Footer Contact + Back Button */}
        <footer className="mt-24 pt-12 border-t border-zinc-100 dark:border-zinc-900 flex flex-col items-center">


          <Link 
            href="/" 
            className="w-full sm:w-auto flex items-center justify-center gap-4 px-12 py-6 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:bg-[#FFD700] dark:hover:bg-[#FFD700] hover:text-black transition-all rounded-2xl group shadow-xl shadow-black/5"
          >
            <svg 
              width="20" 
              height="20" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              viewBox="0 0 24 24" 
              className="group-hover:-translate-x-1 transition-transform"
            >
              <path d="M19 12H5m7 7l-7-7 7-7" />
            </svg>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Back to Home</span>
          </Link>
        </footer>

      </main>
    </div>
  );
};

export default PolicyPage;
