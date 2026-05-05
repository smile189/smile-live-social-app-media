"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, FileText, Copyright, Info, ChevronRight, Sparkles, Mail, ShieldCheck, Zap } from "lucide-react";

interface PolicyOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "terms" | "privacy" | "copyright" | "about";

export default function PolicyOverlay({ isOpen, onClose }: PolicyOverlayProps) {
  const [activeTab, setActiveTab] = useState<TabType>("terms");

  // Blocăm scroll-ul paginii din spate când modalul este activ
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const tabs = [
    { id: "terms" as TabType, label: "Terms", icon: <FileText size={18} /> },
    { id: "privacy" as TabType, label: "Privacy", icon: <Shield size={18} /> },
    { id: "copyright" as TabType, label: "Legal", icon: <Copyright size={18} /> },
    { id: "about" as TabType, label: "About", icon: <Info size={18} /> },
  ];

  const content = {
    terms: {
      title: "Terms of Service",
      description: "Last Updated: May 2026",
      sections: [
        {
          heading: "1. Acceptance of Terms",
          text: "By accessing and using Smile, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service."
        },
        {
          heading: "2. Use License",
          text: "Permission is granted to temporarily access the materials on Smile for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title."
        },
        {
          heading: "3. User Content",
          text: "You retain all rights to any content you submit, post or display on or through the service. By posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such content."
        },
        {
          heading: "4. Prohibited Activities",
          text: "You may not use our service to: violate any laws, infringe intellectual property rights, transmit harmful code, impersonate others, harass or harm others, or engage in any fraudulent activity."
        },
        {
          heading: "5. Account Termination",
          text: "We reserve the right to terminate or suspend your account at any time, without prior notice or liability, for any reason, including breach of these Terms."
        },
        {
          heading: "6. Disclaimer",
          text: "The service is provided 'as is' without any warranties, expressed or implied. We do not warrant that the service will be uninterrupted, secure, or error-free."
        }
      ]
    },
    privacy: {
      title: "Privacy Policy",
      description: "Your Data Security is our Priority",
      sections: [
        {
          heading: "1. Information We Collect",
          text: "We collect information you provide directly (account details, profile information, content you post) and automatically (device information, usage data, cookies)."
        },
        {
          heading: "2. How We Use Your Information",
          text: "We use your information to: provide and improve our services, personalize your experience, communicate with you, ensure security, and comply with legal obligations."
        },
        {
          heading: "3. Information Sharing",
          text: "We do not sell your personal information. We may share information with service providers, for legal compliance, or with your consent. Public content you post is visible to other users."
        },
        {
          heading: "4. Data Storage and Security",
          text: "Your data is stored securely using industry-standard encryption. We implement appropriate technical and organizational measures to protect your information."
        },
        {
          heading: "5. Your Rights",
          text: "You have the right to access, correct, delete, or export your personal data. You can also object to processing or request restriction of processing."
        }
      ]
    },
    copyright: {
      title: "Copyright & DMCA",
      description: "Intellectual Property Center",
      sections: [
        {
          heading: "1. Copyright Policy",
          text: "Smile respects the intellectual property rights of others and expects users to do the same. We respond to notices of alleged copyright infringement that comply with the DMCA."
        },
        {
          heading: "2. Infringement Notification",
          text: "If you believe your copyrighted work has been copied in a way that constitutes infringement, please provide our Copyright Agent with a physical or electronic signature and identification of the copyrighted work."
        },
        {
          heading: "3. Counter-Notification",
          text: "If you believe your content was removed by mistake or misidentification, you may file a counter-notification containing: your signature, identification of removed content."
        },
        {
          heading: "4. Repeat Infringer Policy",
          text: "We will terminate the accounts of users who are repeat infringers of copyright in appropriate circumstances."
        }
      ]
    },
    about: {
      title: "About Smile",
      description: "Version 0.13.030326 BETA VERSION",
      sections: [
        {
          heading: "Our Mission",
          text: "Smile is a next-generation social video platform designed to connect creators with their communities through authentic, engaging short-form content. Our mission is to empower creativity, foster genuine connections, and redefine entertainment in the digital age."
        },
        {
          heading: "Platform Features",
          text: "Advanced algorithm for personalized discovery, high-quality video streaming, and real-time community interactions."
        },
        {
          heading: "Our Values",
          text: "Safety first, creativity always, and community driven. We believe in empowering inclusive and positive digital spaces."
        },
        {
          heading: "Contact Support",
          text: "For any inquiries or technical issues, please contact us at support@smileliveapp.com or through the in-app help center."
        }
      ]
    }
  };

  const activeContent = content[activeTab];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="relative w-full max-w-2xl bg-white sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[85vh] border border-zinc-100"
          >
            {/* Grab Handle */}
            <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-zinc-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-pink-100 shadow-sm overflow-hidden p-1.5">
                  <img 
                    src="/smile_rebrand-app.png" 
                    alt="Smile Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="font-black text-zinc-900 uppercase tracking-tighter text-xl italic leading-none">Smile Live app</span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">Legal & Info</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-500 transition-all">
                <X size={22} />
              </button>
            </div>

            {/* Navigation Pills */}
            <div className="px-4 py-4 overflow-x-auto no-scrollbar flex items-center gap-2 bg-zinc-50/50 border-b border-zinc-50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full whitespace-nowrap text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                    activeTab === tab.id 
                    ? "bg-zinc-900 text-white shadow-xl scale-105" 
                    : "bg-white text-zinc-400 border border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <span className={activeTab === tab.id ? "text-pink-400" : "text-zinc-400"}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-12 no-scrollbar">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-[1px] w-8 bg-pink-500" />
                  <span className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em]">{activeContent.description}</span>
                </div>
                
                <h1 className="text-4xl font-black text-zinc-900 italic uppercase tracking-tighter mb-10 leading-none">
                  {activeContent.title}
                </h1>
                
                <div className="space-y-10">
                  {activeContent.sections.map((section, index) => (
                    <div key={index} className="group relative">
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
                        <div className="flex flex-col gap-2">
                          <h3 className="text-zinc-900 font-black text-lg uppercase tracking-tight">
                            {section.heading}
                          </h3>
                          <p className="text-zinc-600 text-[15px] leading-relaxed font-medium">
                            {section.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-20 pt-10 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-6">

                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] text-center sm:text-right leading-relaxed">
                    © 2026 Smile Live Platform <br/>All Rights Reserved
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </AnimatePresence>
  );
}
