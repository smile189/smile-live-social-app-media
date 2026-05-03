"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  ChevronLeft, Gem, Zap, Landmark, RefreshCcw, 
  ShieldCheck, ArrowUpCircle, User, ShoppingBag, ArrowRightLeft
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"coins" | "diamonds">("coins");
  const [data, setData] = useState<any>({ profile: null, wallet: null, settings: null });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const fetchData = async () => {
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

  useEffect(() => { fetchData(); }, []);

  // FUNCȚIA 1: Schimbă COINS în DIAMONDS (ca să poată retrage ulterior)
  const convertCoinsToDiamonds = async () => {
    if (!data.wallet?.coins_balance || data.wallet.coins_balance < 1000) {
      return alert("Ai nevoie de minim 1000 Coins pentru conversie.");
    }
    setProcessing(true);
    
    // Apelăm o funcție în DB care scade coins și adaugă diamonds (cursul e stabilit de admin)
    const { error } = await supabase.rpc('convert_coins_to_diamonds', { 
      user_uuid: data.profile.id, 
      amount: 1000 
    });

    if (error) alert(error.message);
    else await fetchData();
    setProcessing(false);
  };

  // FUNCȚIA 2: Cerere de retragere FIAT (Din Diamonds)
  const handleWithdrawRequest = async () => {
    const min = data.settings?.min_withdraw_diamonds || 5000;
    if ((data.wallet?.diamonds_balance || 0) < min) {
      return alert(`Ai nevoie de minim ${min} Diamonds pentru a retrage Fiat.`);
    }

    const { error } = await supabase.from('withdrawal_requests').insert({
      user_id: data.profile.id,
      amount_diamonds: data.wallet.diamonds_balance,
      status: 'pending'
    });

    if (!error) {
      alert("Cererea de retragere a fost trimisă către Admin!");
      fetchData();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDF8F9] text-pink-500 font-black tracking-tighter">SMILE WALLET...</div>;

  return (
    <div className="min-h-screen bg-[#FDF8F9] pb-10">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 rounded-b-[2.5rem] shadow-sm mb-6 border-b border-pink-50">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="p-2 -ml-2 text-pink-500"><ChevronLeft size={24} /></Link>
          <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em]">Financial Center</span>
          <Link href="/app/marketplace" className="p-2 bg-yellow-50 text-yellow-600 rounded-full"><ShoppingBag size={20} /></Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center border border-pink-100 shadow-inner">
            {data.profile?.avatar_url ? <img src={data.profile.avatar_url} className="w-full h-full object-cover rounded-2xl" /> : <User className="text-pink-300" />}
          </div>
          <div>
            <h2 className="font-black text-zinc-800 text-sm">@{data.profile?.username}</h2>
            <p className="text-[9px] font-bold text-pink-400 uppercase tracking-widest leading-none mt-1">Status: {data.profile?.role}</p>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-6">
        {/* Switcher */}
        <div className="flex bg-zinc-200/50 p-1 rounded-2xl mb-8">
          {["coins", "diamonds"].map((t: any) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === t ? "bg-white shadow-sm text-pink-600" : "text-zinc-400"}`}>
              {t === "coins" ? "Consum (Coins)" : "Venit (Diamonds)"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "coins" ? (
            <motion.div key="coins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
                <Zap className="absolute right-[-10%] top-[-10%] w-40 h-40 opacity-10 rotate-12" />
                <p className="text-[10px] font-black uppercase opacity-60 mb-2">Balanță Actuală</p>
                <div className="flex items-center gap-3">
                  <Zap size={32} className="fill-yellow-300 text-yellow-300" />
                  <h2 className="text-6xl font-black tracking-tighter">{data.wallet?.coins_balance?.toLocaleString() || 0}</h2>
                </div>
              </div>

              {/* BUTON SCHIMB: COINS -> DIAMONDS */}
              <button 
                onClick={convertCoinsToDiamonds}
                disabled={processing}
                className="w-full py-6 bg-white border-2 border-pink-100 rounded-[2.5rem] flex items-center justify-center gap-4 group hover:border-pink-300 transition-all"
              >
                <div className="p-2 bg-pink-50 rounded-xl text-pink-500 group-hover:rotate-180 transition-transform duration-500">
                  <ArrowRightLeft size={20} />
                </div>
                <div className="text-left">
                  <p className="font-black text-zinc-800 text-xs uppercase tracking-tight">Schimbă în Diamante</p>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase">Pentru a putea retrage fiat</p>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div key="diamonds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
                <Gem className="absolute right-[-10%] top-[-10%] w-40 h-40 opacity-10 rotate-12" />
                <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Diamante Retrageri</p>
                <div className="flex items-center gap-3">
                  <Gem size={32} className="text-indigo-200" />
                  <h2 className="text-6xl font-black tracking-tighter">{data.wallet?.diamonds_balance?.toLocaleString() || 0}</h2>
                </div>
              </div>

              <div className="space-y-3">
                {/* RETRAGERE FIAT */}
                <button 
                  onClick={handleWithdrawRequest}
                  className="w-full bg-zinc-900 text-white py-7 rounded-[2.5rem] flex items-center justify-between px-10 hover:bg-black transition-all shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl"><Landmark size={24} /></div>
                    <div className="text-left">
                      <p className="font-black uppercase text-sm tracking-widest">Retrage FIAT</p>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase">Transfer Bancar / Revolut</p>
                    </div>
                  </div>
                  <ArrowUpCircle size={28} />
                </button>
              </div>

              <div className="p-6 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex items-start gap-4">
                <ShieldCheck className="text-blue-400 shrink-0" size={20} />
                <p className="text-[9px] text-blue-700 font-bold leading-relaxed uppercase">
                  Atenție: Conversia din Coins în Diamonds poate avea un comision aplicat de platformă. Cererile de retragere Fiat sunt procesate manual de admin.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
