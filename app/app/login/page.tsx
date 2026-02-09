"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null); // Resetăm eroarea la fiecare încercare

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
        router.push("/");
        router.refresh();
      } else {
        setErrorMsg("Succes! Verifică e-mail-ul pentru confirmare."); // Afișat ca succes
      }
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl font-black text-yellow-400 tracking-tighter italic">SMILE</h1>
          <p className="text-zinc-500 font-medium">
            {isLogin ? "Welcome back, star." : "Join the spotlight."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {/* Mesaj de Eroare/Succes Dinamic */}
          {errorMsg && (
            <div className={`p-4 rounded-xl text-sm font-bold border ${
              errorMsg.includes("Succes") 
                ? "bg-green-500/10 border-green-500/50 text-green-500" 
                : "bg-red-500/10 border-red-500/50 text-red-500"
            }`}>
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <input 
              type="email" placeholder="Email" required
              className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all text-lg"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" placeholder="Parolă" required
              className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all text-lg"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="bg-yellow-400 text-black font-black py-4 rounded-2xl text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:hover:scale-100 mt-2 shadow-lg shadow-yellow-400/10"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Processing...
              </span>
            ) : (isLogin ? "LOG IN" : "CREATE ACCOUNT")}
          </button>
        </form>

        <button 
          onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }} 
          className="text-zinc-400 text-sm font-semibold hover:text-white transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already a member? Log in"}
        </button>
      </div>
    </div>
  );
}
