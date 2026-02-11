"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid admin credentials");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user?.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "super_admin") {
      await supabase.auth.signOut();
      setError("Not authorized");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] font-sans antialiased overflow-hidden">
      
      {/* Background Decor subtil */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-slate-200/50 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="relative z-10 w-full max-w-[440px] px-6"
      >
        <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-100 p-10 md:p-14">
          
          {/* Brand/Logo Section */}
          <div className="flex flex-col items-center mb-12">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-yellow-400 text-2xl font-black shadow-2xl mb-6"
            >
              S
            </motion.div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
              Smile live <span className="text-yellow-400 font-light">app</span>
            </h1>
            <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase mt-2">
              Administration business 
            </p>
          </div>

          {/* Form Section */}
          <div className="space-y-5">
            <div className="relative group">
              <input
                type="email"
                className="w-full px-6 py-5 bg-slate-50 border border-transparent rounded-2xl text-slate-900 text-sm focus:bg-white focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 transition-all duration-300 outline-none placeholder:text-slate-400"
                placeholder="Corporate Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <input
                type="password"
                className="w-full px-6 py-5 bg-slate-50 border border-transparent rounded-2xl text-slate-900 text-sm focus:bg-white focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 transition-all duration-300 outline-none placeholder:text-slate-400"
                placeholder="Access Token"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 text-red-500 text-[11px] font-bold p-4 rounded-xl text-center tracking-wide border border-red-100"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01, translateY: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(15,23,42,0.4)] transition-all duration-300 disabled:opacity-50 relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? "Authenticating..." : "Establish Connection"}
              </span>
              <div className="absolute inset-0 bg-yellow-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="absolute inset-0 z-20 flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 Verify & Enter
              </span>
            </motion.button>
          </div>


        </div>
      </motion.div>

      {/* Decorative floating dots */}
      <div className="absolute top-10 right-10 flex gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}
