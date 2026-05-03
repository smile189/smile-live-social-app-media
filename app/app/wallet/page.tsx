"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  ChevronLeft, Gem, Zap, Landmark, RefreshCcw, 
  ShieldCheck, ArrowUpCircle, User, ShoppingBag, Clock
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"coins" | "diamonds">("coins");
  const [data, setData] = useState<any>({ profile: null, wallet: null, settings: null });
  const [loading, setLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false);

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const fetchAllData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [p, w, s] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('wallets').select('*').eq('user_id', user.id).single(),
      supabase.from('app_settings').select('*').eq('id', 'global_settings').single()
    ]);

    setData({ profile: p.data, wallet: w.data, settings: s.data });
    setLoading(false);
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleWithdrawRequest = async () => {
    const min = data.settings?.min_withdraw_diamonds || 5000;
    const balance = data.wallet?.diamonds_balance || 0;
    
    if (balance < min) return alert(`Minim ${min} diamante.`);

    const { error } = await supabase.from('withdrawal_requests').insert({
      user_id: data.profile.id,
      amount_diamonds: balance,
      status: 'pending'
    });

    if (!error) {
      setRequestSent(true);
      fetchAllData(); // refresh balanță
      setTimeout(() => setRequestSent(false), 3000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDF8F9] text-pink-500 font-black uppercase text-xs tracking-tighter italic">Se încarcă portofelul...</div>;

  return (
    <div className="min-h-screen bg-[#FDF8F9] pb-10">
      {/* Header Compact */}
      <div className="bg-white px-6 pt-12 pb-6 rounded-b-[2.5rem] shadow-sm mb-6 border-b border-pink-50">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="p-2 -ml-2 text-pink-500"><ChevronLeft size={24} /></Link>
          <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em]">Revenue & Coins</span>
          <Link href="/app/marketplace" className="p-2 bg-yellow-50 text-yellow-600 rounded-full"><ShoppingBag size={20} /></Link>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-100 to-rose-100 overflow-hidden shadow-inner flex items-center justify-center">
            {data.profile?.avatar_url ? <img src={data.profile.avatar_url} className="w-full h-full object-cover" /> : <User className="text-pink-300" />}
          </div>
          <div>
            <h2 className="font-black text-zinc-800 text-sm">@{data.profile?.username}</h2>
            <p className="text-[9px] font-bold text-pink-400 uppercase tracking-widest leading-none mt-1">{data.profile?.role}</p>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-6">
        <div className="flex bg-zinc-100/80 p-1 rounded-2xl mb-8">
          {["coins", "diamonds"].map((t: any) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === t ? "bg-white shadow-sm text-pink-600" : "text-zinc-400"}`}>
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "coins" ? (
            <motion.div key="coins" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-10 rounded-[3rem] text-white shadow-2xl shadow-rose-200">
                <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Balanță Monede</p>
                <div className="flex items-center justify-center gap-3">
                  <Zap size={32} className="fill-yellow-300 text-yellow-300" />
                  <h2 className="text-6xl font-black tracking-tighter">{data.wallet?.coins_balance?.toLocaleString() || 0}</h2>
                </div>
              </div>
              
              <Link href="/app/coins" className="block w-full py-5 bg-white border-2 border-pink-100 rounded-[2rem] font-black text-pink-500 text-sm uppercase hover:bg-pink-50 transition-all">
                Cumpără Monede (Pachete)
              </Link>
            </motion.div>
          ) : (
            <motion.div key="diamonds" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-gradient-to-br from-fuchsia-600 to-purple-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-fuchsia-200">
                <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Venituri Diamante</p>
                <div className="flex items-center gap-3 justify-center">
                  <Gem size={32} className="text-fuchsia-200" />
                  <h2 className="text-6xl font-black tracking-tighter">{data.wallet?.diamonds_balance?.toLocaleString() || 0}</h2>
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={handleWithdrawRequest} disabled={requestSent} className="w-full bg-white border border-zinc-100 py-6 rounded-[2rem] flex items-center justify-between px-8 hover:bg-emerald-50 transition-all disabled:opacity-50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><Landmark size={20} /></div>
                    <div className="text-left font-black uppercase text-xs tracking-tight text-zinc-800">
                      {requestSent ? "Cerere Trimisă" : "Trimite Cerere Retragere"}
                    </div>
                  </div>
                  <ArrowUpCircle className={`transition-all ${requestSent ? "text-emerald-500 scale-125" : "text-zinc-200"}`} />
                </button>

                <button className="w-full bg-white border border-zinc-100 py-6 rounded-[2rem] flex items-center justify-between px-8 group">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><RefreshCcw size={20} /></div>
                    <div className="font-black uppercase text-xs tracking-tight text-zinc-800">Schimbă în Monede</div>
                  </div>
                  <ArrowUpCircle className="text-zinc-200 rotate-90" />
                </button>
              </div>

              <div className="p-5 bg-white border border-pink-50 rounded-[2rem] flex items-start gap-4">
                <ShieldCheck className="text-pink-300 shrink-0" size={20} />
                <p className="text-[9px] text-zinc-400 font-bold leading-relaxed uppercase">
                  Cererile sunt verificate de admin conform cursului de schimb stabilit în Dashboard. Procesul durează 1-3 zile lucrătoare.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
