"use client";

import { useEffect, useState } from "react";
import { Download, Share, PlusSquare } from "lucide-react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [platform, setPlatform] = useState<"android" | "ios" | "other" | null>(null);

  useEffect(() => {
    // Platform Detection
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) setPlatform("android");
    else if (/iphone|ipad|ipod/.test(ua)) setPlatform("ios");
    else setPlatform("other");

    // Android PWA Prompt Logic
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installAndroid = async () => {
    if (!deferredPrompt) {
      alert("Open Chrome Menu (3 dots) and tap 'Install App'");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  };

  if (platform === "android") {
    return (
      <button 
        onClick={installAndroid}
        className="flex items-center gap-2 bg-yellow-400 text-black font-black px-6 py-3 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:scale-105 transition-transform"
      >
        <Download size={18} />
        INSTALL SMILE 🚀
      </button>
    );
  }

  if (platform === "ios") {
    return (
      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 p-4 rounded-[24px] text-center max-w-[260px] shadow-2xl">
        <p className="text-white text-[10px] font-black mb-3 uppercase tracking-[0.2em] opacity-80">
          Install on iPhone
        </p>
        <div className="flex items-center justify-center gap-2 text-white/60 text-[9px] font-bold">
          <span>Tap</span>
          <div className="bg-white/10 p-1.5 rounded-lg text-white"><Share size={12} /></div>
          <span>then</span>
          <div className="bg-white/10 p-1.5 rounded-lg text-white"><PlusSquare size={12} /></div>
          <span className="text-white italic">"Add to Home Screen"</span>
        </div>
      </div>
    );
  }

  return null;
}
