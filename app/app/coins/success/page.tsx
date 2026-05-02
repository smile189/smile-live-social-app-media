"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { motion } from "framer-motion";
import { Coins, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 1. Mutăm logica ce folosește useSearchParams într-o componentă separată
function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session_id");

  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.push("/app/coins");
      return;
    }

    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: wallet } = await supabase
        .from("wallets")
        .select("coins_balance")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setBalance(wallet?.coins_balance ?? 0);
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [sessionId, router]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 20 }}
      className="space-y-8 max-w-sm w-full"
    >
      {/* Icon */}
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-24 h-24 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-yellow-400" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white">
          Plată <span className="text-yellow-400">reușită!</span>
        </h1>
        <p className="text-zinc-500 text-sm font-medium">
          Coins-urile tale au fost adăugate în cont
        </p>
      </div>

      {/* Balance */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 text-zinc-500">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Se actualizează balanța...</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl px-6 py-4 flex items-center justify-center gap-3"
        >
          <Coins size={22} className="text-yellow-400" />
          <div>
            <div className="text-3xl font-black text-yellow-400">
              {balance?.toLocaleString()}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
              Total coins
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col gap-3 pt-2">
        <Link
          href="/app"
          className="w-full py-4 bg-yellow-400 text-black rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-300 transition-all active:scale-[0.98]"
        >
          Back to app <ArrowRight size={16} />
        </Link>
        <Link
          href="/app/coins"
          className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
        >
          <Coins size={16} /> Buy moore coins 
        </Link>
      </div>
    </motion.div>
  );
}

// 2. Exportul principal înfășoară totul în Suspense pentru a trece Build-ul Vercel
export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center">
      <Suspense fallback={<Loader2 className="animate-spin text-yellow-400" size={32} />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
