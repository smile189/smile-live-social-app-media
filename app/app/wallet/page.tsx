"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  ChevronLeft, Gem, Zap, Landmark, RefreshCcw, 
  ShieldCheck, ArrowUpCircle, User, ShoppingBag, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"coins" | "diamonds">("coins");
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [pRes, wRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('wallets').select('*').eq('user_id', user.id).single()
    ]);
    if (pRes.data) setProfile(pRes.data);
    if (wRes.data) setWallet(wRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Funcție de conversie Diamonds -> Coins (Exemplu: 100 Diamonds = 80 Coins)
  const handleExchange = async () => {
    if (!wallet || wallet.diamonds_balance < 100) return alert("Minim 100 Diamonds necesare!");
    
    setLoading(true);
    const { error } = await supabase.rpc('exchange_diamonds_to_coins', { 
      user_uuid: profile.id, 
      amount_to_exchange: 100 
    });

    if (!error) {
      setShowSuccess(true);
      await fetchData();
      setTimeout(() => setShowSuccess(false), 3000);
    }
    setLoading(false);
  };

  if (loading && !showSuccess) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F9]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <Gem className="text-pink-500" size={32} />
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F9] pb-10">
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <CheckCircle2 size={80} className="text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-zinc-800">Conversie Reușită!</h2>
              <p className="text-zinc-500 font-bold">Monedele tale au fost adăugate.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white px-6 pt-12 pb-6 rounded-b-[3rem] shadow-sm mb-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="p-2 -ml-2 text-pink-500 hover:bg-pink-50 rounded-full transition-all">
            <ChevronLeft size={24} />
          </Link>
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Revenue Center</span>
          <Link href="/app/marketplace" className="p-2 bg-yellow-50 text-yellow-600 rounded-full hover:scale-110 transition-transform">
            <ShoppingBag size={20} />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl border-2 border-pink-100 overflow-hidden bg-pink-50 shadow-inner">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-pink-300"><User /></div>}
          </div>
          <div>
            <h2 className="font-black text-zinc-800 text-lg">@{profile?.username}</h2>
            <div className="flex gap-2 mt-1">
              <span className="bg-pink-100 text-pink-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">{profile?.role || 'User'}</span>
              {profile?.agency_id && <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Agency Partner</span>}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-6">
        <div className="flex bg-pink-100/50 p-1.5 rounded-[2rem] mb-6 shadow-inner border border-white">
          {(["coins", "diamonds"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-pink-600 shadow-md" : "text-pink-400"}`}>
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "coins" ? (
            <motion.div key="coins" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                <Zap className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12" />
                <p className="text-pink-100 text-[10px] font-black uppercase tracking-widest mb-2">Available Balance</p>
                <div className="flex items-center gap-3">
                  <Zap size={28} className="fill-yellow-300 text-yellow-300" />
                  <h2 className="text-5xl font-black tracking-tighter">{wallet?.coins_balance?.toLocaleString() || 0}</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[100, 500, 1000, 5000].map((amount) => (
                  <button key={amount} className="bg-white border border-pink-50 p-6 rounded-[2.2rem] flex flex-col items-center gap-1 hover:border-pink-300 transition-all shadow-sm active:scale-95 group">
                    <Zap size={20} className="text-yellow-500 fill-yellow-500 mb-1 group-hover:scale-125 transition-transform" />
                    <span className="font-black text-zinc-800 text-lg">{amount}</span>
                    <span className="text-[10px] font-bold text-pink-400 italic">€{(amount / 100).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="diamonds" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="bg-gradient-to-br from-fuchsia-600 to-purple-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                <Gem className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12" />
                <p className="text-fuchsia-100 text-[10px] font-black uppercase tracking-widest mb-2">My Earnings</p>
                <div className="flex items-center gap-3">
                  <Gem size={28} className="text-fuchsia-200" />
                  <h2 className="text-5xl font-black tracking-tighter">{wallet?.diamonds_balance || 0}</h2>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-white border border-purple-100 py-5 rounded-[2rem] flex items-center justify-between px-6 shadow-sm group hover:border-purple-300 transition-all">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform"><Landmark size={20} /></div>
                    <div>
                      <p className="text-sm font-black text-zinc-800 uppercase tracking-tight">Withdraw Fiat</p>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">Bank / PayPal</p>
                    </div>
                  </div>
                  <ArrowUpCircle className="text-zinc-200 group-hover:text-emerald-500 transition-all" />
                </button>
                
                <button onClick={handleExchange} className="w-full bg-white border border-purple-100 py-5 rounded-[2rem] flex items-center justify-between px-6 shadow-sm group hover:border-purple-300 transition-all">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><RefreshCcw size={20} /></div>
                    <div>
                      <p className="text-sm font-black text-zinc-800 uppercase tracking-tight">Exchange to Coins</p>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">0% Fee • Instant</p>
                    </div>
                  </div>
                  <RefreshCcw className="text-zinc-200 group-hover:text-blue-500 transition-all" />
                </button>
              </div>

              <div className="p-6 bg-purple-50 rounded-[2rem] border border-purple-100 flex items-start gap-4">
                <ShieldCheck className="text-purple-400 shrink-0" size={18} />
                <p className="text-[10px] text-purple-600 font-bold leading-relaxed uppercase tracking-tighter">
                  Secured by Smile Live Finance. Minimum withdrawal: $50. Processing: 1-3 business days.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
