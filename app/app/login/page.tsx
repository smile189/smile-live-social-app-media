"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false); // bifa
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificăm bifa doar la înregistrare
    if (!isLogin && !agreed) {
      setErrorMsg("Please accept the Terms & Conditions to proceed.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: email.split('@')[0] } }
        });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      if (isLogin) {
        router.push("/app");
        router.refresh();
      } else {
        setErrorMsg("Success! Please verify your email."); 
      }
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#000] flex items-center justify-center p-4 sm:p-6 text-white font-sans relative overflow-hidden">
      
      {/* BACKGROUND - */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 z-10" />
        <img 
          src="/herosmile.webp" 
          alt="SMILE Background"
          className="w-full h-full object-cover opacity-60 scale-105" 
        />
      </div>

      <div className="w-full max-w-[380px] flex flex-col gap-10 relative z-20">
        {/* Header */}
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-6xl font-black text-yellow-400 tracking-[calc(-0.05em)] italic drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
            SMILE LIVE 
          </h1>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-2 opacity-80">
            {isLogin ? "Enjoy the Social Revolution" : "Join the Social Revolution"}
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleAuth} className="flex flex-col gap-5">
          {errorMsg && (
            <div className={`p-4 rounded-2xl text-[13px] font-semibold border backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300 ${
              errorMsg.includes("Success") 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <input 
              type="email" placeholder="Email Address" required
              className="w-full bg-white/[0.03] backdrop-blur-[20px] border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-400/50 focus:bg-white/[0.07] transition-all text-[15px] placeholder:text-zinc-600"
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <input 
              type="password" placeholder="Password" required
              className="w-full bg-white/[0.03] backdrop-blur-[20px] border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-400/50 focus:bg-white/[0.07] transition-all text-[15px] placeholder:text-zinc-600"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Bifa de Terms & Policy (Doar la Register) */}
          {!isLogin && (
            <label className="flex items-start gap-3 px-1 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="peer h-4 w-4 appearance-none rounded border border-white/20 bg-white/5 transition-all checked:bg-yellow-400 checked:border-yellow-400 outline-none"
                />
                <svg className="absolute w-3 h-3 text-black pointer-events-none hidden peer-checked:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[11px] text-zinc-500 leading-tight group-hover:text-zinc-300 transition-colors">
                I agree to the <span className="text-white font-bold underline">Terms of Service</span> and <span className="text-white font-bold underline">Privacy Policy</span>.
              </span>
            </label>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="bg-yellow-400 text-black font-black py-4 rounded-2xl text-[14px] uppercase tracking-widest hover:bg-yellow-300 active:scale-[0.97] transition-all disabled:opacity-50 mt-2 shadow-[0_20px_40px_rgba(250,204,21,0.15)]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Processing
              </span>
            ) : (isLogin ? "Sign In" : "Register Now")}
          </button>
        </form>

        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }} 
            className="text-zinc-400 text-xs font-bold hover:text-white transition-colors uppercase tracking-widest"
          >
            {isLogin ? "Don't have account? Sign Up" : "Back to Login"}
          </button>
        </div>
      </div>

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
