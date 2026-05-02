"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, Fingerprint } from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleLogin = async () => {
    if (!isVerified) return;
    setError("");
    setLoading(true);

    // Citim datele de Master din .env.local / Vercel
    const masterUser = process.env.NEXT_PUBLIC_MASTER_USER;
    const masterPass = process.env.NEXT_PUBLIC_MASTER_PASS;

    // Verificare directă pe text (Username + Pass)
    if (email === masterUser && password === masterPass) {
      // Creăm "cheia" de acces în cookie
      document.cookie = "admin_access=true; path=/; max-age=86400; SameSite=Lax";
      
      // Te trimitem direct în Dashboard
      window.location.href = "/dashboard";
    } else {
      setError("INVALID_ADMIN_CREDENTIALS");
      setLoading(false);
      setIsVerified(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans antialiased overflow-hidden">
      
      {/* LEFT PANEL - PC ONLY (Optimized Framing) */}
      <div className="hidden lg:block w-[45%] bg-slate-950 relative overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          src="/smilelive.jpg" 
          className="absolute inset-0 w-full h-full object-cover"
          alt="Dashboard Visual"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-16 w-full">
          <div className="h-1 w-12 bg-yellow-400 mb-8" />
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
            SMILE LIVE <br />
            <span className="text-yellow-400 not-italic font-light">DASHBOARD</span>
          </h2>
        </div>
      </div>

      {/* RIGHT PANEL - Adaptive Container */}
      <div className="flex-1 relative flex items-center justify-center bg-white lg:bg-transparent">
        
        {/* Mobile-Only Background Wrapper */}
        <div className="lg:hidden absolute inset-0 z-0">
          <img src="/smilelive.jpg" className="w-full h-full object-cover opacity-50 blur-[2px]" alt="bg" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950" />
        </div>

        {/* Form Content */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[360px] md:max-w-[400px] px-6 relative z-10"
        >
          <header className="mb-14 text-center lg:text-left">
            <h1 className="text-4xl font-black text-white lg:text-slate-900 tracking-tighter uppercase italic">
              Login
            </h1>
            <p className="text-slate-400 text-[10px] font-bold tracking-[0.3em] mt-3 uppercase">
              Superadmin business access smile live 
            </p>
          </header>

          <div className="space-y-10">
            {/* Input Sections */}
            <div className={`space-y-8 transition-all duration-500 ${isVerified ? 'opacity-20 blur-sm pointer-events-none' : ''}`}>
              
              <div className="group border-b border-white/20 lg:border-slate-100 focus-within:border-yellow-400 transition-all duration-300">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">user or email</label>
                <div className="flex items-center">
                  <Mail className="text-slate-400 group-focus-within:text-yellow-400 transition-colors" size={16} />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-4 py-3 bg-transparent text-white lg:text-slate-900 text-base font-bold outline-none placeholder:text-slate-700"
                    placeholder=""
                  />
                </div>
              </div>

              <div className="group border-b border-white/20 lg:border-slate-100 focus-within:border-yellow-400 transition-all duration-300">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">pass</label>
                <div className="flex items-center">
                  <Lock className="text-slate-400 group-focus-within:text-yellow-400 transition-colors" size={16} />
                  <input
                    type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-transparent text-white lg:text-slate-900 text-base font-bold outline-none placeholder:text-slate-700"
                    placeholder=""
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-0 text-slate-500 hover:text-yellow-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Security Verification */}
            <div className="pt-2">
              <button
                disabled={email.length < 5 || password.length < 4}
                onClick={() => setIsVerified(!isVerified)}
                className={`w-full py-5 px-6 rounded-2xl border transition-all duration-500 flex items-center justify-between
                  ${isVerified ? 'bg-yellow-400 border-yellow-400 shadow-lg' : 'bg-white/5 lg:bg-slate-50 border-white/10 lg:border-slate-100'}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`p-2 rounded-xl transition-all duration-500 ${isVerified ? 'bg-slate-950 text-yellow-400' : 'bg-slate-900 text-slate-500'}`}>
                    <Fingerprint size={24} className={isVerified ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${isVerified ? 'text-slate-950' : 'text-white lg:text-slate-900'}`}>
                      {isVerified ? 'Verified' : ''}
                    </p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tight">secure</p>
                  </div>
                </div>
            
              </button>
            </div>

            {/* Login Button */}
            <motion.button
              disabled={loading || !isVerified}
              onClick={handleLogin}
              className={`w-full py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all duration-700
                ${isVerified ? 'bg-white lg:bg-slate-950 text-slate-950 lg:text-white shadow-2xl' : 'bg-white/5 text-white/20 opacity-30 cursor-not-allowed'}`}
            >
              Access Dashboard
              <ArrowRight size={18} className={isVerified ? 'text-yellow-400' : 'text-transparent'} />
            </motion.button>
          </div>

          <footer className="mt-20 pt-8 border-t border-white/5 lg:border-slate-50 flex justify-between items-center opacity-40">
             <span className="text-[9px] font-black tracking-widest text-white lg:text-slate-400  italic">smileliveapp.com</span>
             <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-yellow-400" />
                <div className="w-1 h-1 rounded-full bg-slate-300" />
             </div>
          </footer>
        </motion.div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center text-white">
              <div className="w-12 h-1 bg-white/10 relative overflow-hidden mb-4 rounded-full">
                <motion.div initial={{ left: "-100%" }} animate={{ left: "100%" }} transition={{ repeat: Infinity, duration: 1 }} className="absolute inset-0 bg-yellow-400" />
              </div>
              <p className="text-[9px] font-black tracking-[0.5em] uppercase text-yellow-400">Loading dashboard </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
