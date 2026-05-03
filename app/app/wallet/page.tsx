"use client";
import { useEffect, useState, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  ChevronLeft, Gem, Zap, Landmark, ShieldCheck,
  ArrowUpCircle, User, ShoppingBag, X, CheckCircle2,
  AlertCircle, Banknote, CreditCard, RefreshCcw
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile     { id: string; username: string; role: string; avatar_url?: string; }
interface Wallet      { coins_balance: number; diamonds_balance: number; }
interface AppSettings { min_withdraw_diamonds?: number; diamond_value_ron?: number; }
interface PageData    { profile: Profile | null; wallet: Wallet | null; settings: AppSettings | null; }

const EMPTY_WALLET: Wallet = { coins_balance: 0, diamonds_balance: 0 };

// ─── Convert Modal (Coins → Diamonds 1:1) ────────────────────────────────────
function ConvertModal({
  wallet, onClose, onSuccess, supabase, userId,
}: {
  wallet: Wallet;
  onClose: () => void;
  onSuccess: () => void;
  supabase: ReturnType<typeof createBrowserClient>;
  userId: string;
}) {
  const [amount, setAmount]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const val     = parseInt(amount) || 0;
  const isValid = val > 0 && val <= wallet.coins_balance;

  const handleConvert = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.rpc("convert_coins_to_diamonds", {
      p_user_id: userId,
      p_amount:  val,
    });
    setLoading(false);
    if (err) { setError("Eroare la conversie. Încearcă din nou."); return; }
    onSuccess();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(255,240,245,0.7)", backdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
        className="w-full max-w-md rounded-t-[2.8rem] px-7 pt-5 pb-12 shadow-2xl"
        style={{ background: "#fff", boxShadow: "0 -20px 80px rgba(236,72,153,0.1)" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-7" style={{ background: "#f3e8ef" }} />

        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#fde68a,#fbbf24)" }}>
                <Zap size={13} className="fill-white text-white" />
              </div>
              <RefreshCcw size={13} className="text-zinc-300" />
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#e879f9,#a855f7)" }}>
                <Gem size={13} className="text-white" />
              </div>
            </div>
            <h3 className="font-black text-zinc-900 text-xl tracking-tighter mt-2">Conversie</h3>
            <p className="text-xs font-bold text-zinc-400 mt-0.5">Coins → Diamonds · rată 1 : 1</p>
          </div>
          <button onClick={onClose} className="mt-1 p-2.5 rounded-2xl transition-all" style={{ background: "#faf5f8" }}>
            <X size={16} className="text-zinc-400" />
          </button>
        </div>

        {/* Balanțe side-by-side */}
        <div className="grid grid-cols-2 gap-3 mb-7">
          <div className="rounded-2xl px-4 py-3.5" style={{ background: "#fffbeb", border: "1.5px solid #fde68a" }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: "#d97706" }}>Coins</p>
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="fill-amber-400 text-amber-400" />
              <span className="font-black text-zinc-800 text-base">{wallet.coins_balance.toLocaleString()}</span>
            </div>
          </div>
          <div className="rounded-2xl px-4 py-3.5" style={{ background: "#fdf4ff", border: "1.5px solid #e9d5ff" }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: "#a21caf" }}>Diamonds</p>
            <div className="flex items-center gap-1.5">
              <Gem size={14} className="text-fuchsia-500" />
              <span className="font-black text-zinc-800 text-base">{wallet.diamonds_balance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
            Câte Coins convertești?
          </label>
          <div className="relative">
            <Zap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 fill-amber-400 text-amber-400" />
            <input
              type="number" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="ex: 1000" min={1} max={wallet.coins_balance}
              className="w-full pl-11 pr-4 py-4 rounded-2xl font-black text-zinc-900 text-sm outline-none transition-all placeholder:text-zinc-300"
              style={{ background: "#fafafa", border: "2px solid #f3f4f6", boxShadow: "none" }}
              onFocus={e => e.currentTarget.style.borderColor = "#fbbf24"}
              onBlur={e => e.currentTarget.style.borderColor = "#f3f4f6"}
            />
          </div>
          {val > 0 && val <= wallet.coins_balance && (
            <p className="text-[10px] font-bold mt-2 text-fuchsia-500 flex items-center gap-1">
              <Gem size={10} /> Vei primi {val.toLocaleString()} diamonds
            </p>
          )}
          {val > wallet.coins_balance && val > 0 && (
            <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1">
              <AlertCircle size={10} /> Depășești balanța de coins
            </p>
          )}
        </div>

        {error && (
          <p className="mb-4 text-[10px] text-rose-500 font-bold flex items-center gap-1.5">
            <AlertCircle size={12} /> {error}
          </p>
        )}

        <button
          onClick={handleConvert} disabled={!isValid || loading}
          className="w-full py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-tight transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
          style={{ background: isValid && !loading ? "linear-gradient(90deg,#c026d3,#a855f7)" : "#e5e7eb" }}
        >
          {loading ? "Se convertește..." : `Convertește ${val > 0 ? val.toLocaleString() : ""} →`}
        </button>
        <p className="text-[9px] text-zinc-300 font-bold text-center mt-3 uppercase tracking-wide">
          Conversia este ireversibilă
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Withdraw Modal (Diamonds → Fiat) ─────────────────────────────────────────
function WithdrawModal({
  wallet, settings, onClose, onSuccess, supabase, userId,
}: {
  wallet: Wallet;
  settings: AppSettings | null;
  onClose: () => void;
  onSuccess: () => void;
  supabase: ReturnType<typeof createBrowserClient>;
  userId: string;
}) {
  const [amountDiamonds, setAmountDiamonds] = useState("");
  const [bankDetails, setBankDetails]       = useState("");
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  const dVal         = parseInt(amountDiamonds) || 0;
  const maxDiamonds  = wallet.diamonds_balance;
  const rateRon      = settings?.diamond_value_ron ?? 0;
  const estimatedRon = rateRon > 0 && dVal > 0 ? (dVal * rateRon).toFixed(2) : null;
  const isValid      = dVal > 0 && dVal <= maxDiamonds && bankDetails.trim().length > 5;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    const { error: dbErr } = await supabase.from("withdrawals").insert({
      user_id:      userId,
      amount_coins: dVal,
      amount_money: estimatedRon ? parseFloat(estimatedRon) : 0,
      bank_details: bankDetails.trim(),
      status:       "pending",
    });
    setLoading(false);
    if (dbErr) { setError("Eroare la trimitere. Încearcă din nou."); return; }
    onSuccess();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(245,240,255,0.7)", backdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
        className="w-full max-w-md rounded-t-[2.8rem] px-7 pt-5 pb-12"
        style={{ background: "#fff", boxShadow: "0 -20px 80px rgba(168,85,247,0.12)" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-7" style={{ background: "#f3e8ff" }} />

        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2" style={{ background: "linear-gradient(135deg,#e879f9,#7c3aed)" }}>
              <Landmark size={18} className="text-white" />
            </div>
            <h3 className="font-black text-zinc-900 text-xl tracking-tighter">Retragere</h3>
            <p className="text-xs font-bold text-zinc-400 mt-0.5">
              {rateRon > 0 ? `1 💎 = ${rateRon} RON · stabilit de platformă` : "Valoare stabilită de platformă"}
            </p>
          </div>
          <button onClick={onClose} className="mt-1 p-2.5 rounded-2xl" style={{ background: "#faf5ff" }}>
            <X size={16} className="text-zinc-400" />
          </button>
        </div>

        {/* Balanță diamonds */}
        <div className="flex items-center justify-between rounded-2xl px-5 py-4 mb-7" style={{ background: "#fdf4ff", border: "1.5px solid #e9d5ff" }}>
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#a21caf" }}>Disponibil</span>
          <div className="flex items-center gap-2">
            <Gem size={14} className="text-fuchsia-500" />
            <span className="font-black text-zinc-800 text-base">{maxDiamonds.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-5">
          {/* Diamonds amount */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
              Diamonds de Retras
            </label>
            <div className="relative">
              <Gem size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-fuchsia-500" />
              <input
                type="number" value={amountDiamonds}
                onChange={(e) => setAmountDiamonds(e.target.value)}
                placeholder="ex: 500" min={1} max={maxDiamonds}
                className="w-full pl-11 pr-4 py-4 rounded-2xl font-black text-zinc-900 text-sm outline-none transition-all placeholder:text-zinc-300"
                style={{ background: "#fafafa", border: "2px solid #f3f4f6" }}
                onFocus={e => e.currentTarget.style.borderColor = "#e879f9"}
                onBlur={e => e.currentTarget.style.borderColor = "#f3f4f6"}
              />
            </div>
            {estimatedRon && (
              <p className="text-[10px] font-bold mt-2 text-emerald-600 flex items-center gap-1">
                <Banknote size={10} /> Estimat: ~{estimatedRon} RON
              </p>
            )}
            {dVal > maxDiamonds && dVal > 0 && (
              <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1">
                <AlertCircle size={10} /> Depășești balanța disponibilă
              </p>
            )}
          </div>

          {/* Bank details */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
              Date Bancare
            </label>
            <div className="relative">
              <CreditCard size={16} className="absolute left-4 top-4 text-blue-400" />
              <textarea
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                placeholder={"IBAN / PayPal\nNume Titular"}
                rows={3}
                className="w-full pl-11 pr-4 py-4 rounded-2xl font-bold text-zinc-900 text-xs outline-none transition-all resize-none leading-relaxed placeholder:text-zinc-300"
                style={{ background: "#fafafa", border: "2px solid #f3f4f6" }}
                onFocus={e => e.currentTarget.style.borderColor = "#93c5fd"}
                onBlur={e => e.currentTarget.style.borderColor = "#f3f4f6"}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-[10px] text-rose-500 font-bold flex items-center gap-1.5">
            <AlertCircle size={12} /> {error}
          </p>
        )}

        <button
          onClick={handleSubmit} disabled={!isValid || loading}
          className="mt-7 w-full py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-tight transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
          style={{ background: isValid && !loading ? "linear-gradient(90deg,#7c3aed,#ec4899)" : "#e5e7eb" }}
        >
          {loading ? "Se trimite..." : "Trimite Cererea →"}
        </button>
        <p className="text-[9px] text-zinc-300 font-bold text-center mt-3 uppercase tracking-wide">
          Admin procesează în 1–3 zile lucrătoare
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function WalletPage() {
  const [activeTab, setActiveTab]         = useState<"coins" | "diamonds">("coins");
  const [data, setData]                   = useState<PageData>({ profile: null, wallet: null, settings: null });
  const [loading, setLoading]             = useState(true);
  const [modal, setModal]                 = useState<"convert" | "withdraw" | null>(null);
  const [successMsg, setSuccessMsg]       = useState<string | null>(null);

  // ✅ useMemo — previne re-creare client la fiecare render (fix Invalid Refresh Token)
  const supabase = useMemo(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []
  );

  const fetchAllData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [p, w, s] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("wallets").select("*").eq("user_id", user.id).single(),
      supabase.from("app_settings").select("*").eq("id", "global_settings").single(),
    ]);
    setData({ profile: p.data, wallet: w.data, settings: s.data });
    setLoading(false);
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleSuccess = (msg: string) => {
    setModal(null);
    setSuccessMsg(msg);
    fetchAllData();
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FDF8F9" }}>
      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4 }}
        className="font-black uppercase text-xs tracking-[0.3em] text-pink-400">
        Portofel...
      </motion.div>
    </div>
  );

  // ✅ Fix TypeError — wallet garantat non-null
  const wallet: Wallet = {
    coins_balance:    data.wallet?.coins_balance    ?? 0,
    diamonds_balance: data.wallet?.diamonds_balance ?? 0,
  };

  return (
    <>
      {/* ── BG — luminos, airy ── */}
      <div className="min-h-screen pb-16" style={{ background: "linear-gradient(160deg, #fff9fb 0%, #fdf4ff 50%, #f0fdf4 100%)" }}>

        {/* Blob decorativ */}
        <div className="fixed top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse,rgba(236,72,153,0.07) 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />
        <div className="fixed bottom-20 left-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse,rgba(168,85,247,0.06) 0%,transparent 70%)", transform: "translate(-30%,0)" }} />

        {/* ── Header ── */}
        <div className="relative px-6 pt-14 pb-8">
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all"
              style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <ChevronLeft size={20} className="text-zinc-500" />
            </Link>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300">Portofel</span>
            <Link href="/app/marketplace"
              className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all"
              style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <ShoppingBag size={18} className="text-amber-400" />
            </Link>
          </div>

          {/* User card */}
          <div className="flex items-center gap-4 p-5 rounded-[2rem]"
            style={{ background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#fce7f3,#ede9fe)" }}>
                {data.profile?.avatar_url
                  ? <img src={data.profile.avatar_url} className="w-full h-full object-cover" alt="av" />
                  : <User size={22} className="text-pink-300" />}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-zinc-900 text-base tracking-tighter truncate">@{data.profile?.username}</h2>
              <p className="text-[9px] font-black text-pink-400 uppercase tracking-widest mt-0.5">{data.profile?.role}</p>
            </div>
            {/* mini balances */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <Zap size={12} className="fill-amber-400 text-amber-400 mb-0.5" />
                <span className="text-[10px] font-black text-zinc-700">{wallet.coins_balance.toLocaleString()}</span>
              </div>
              <div className="w-px bg-zinc-100" />
              <div className="flex flex-col items-center">
                <Gem size={12} className="text-fuchsia-400 mb-0.5" />
                <span className="text-[10px] font-black text-zinc-700">{wallet.diamonds_balance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-md mx-auto px-6">
          {/* Success */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                className="mb-5 flex items-center gap-3 rounded-2xl px-4 py-3.5"
                style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}
              >
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex p-1 rounded-[1.4rem] mb-8"
            style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            {(["coins", "diamonds"] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className="flex-1 py-3.5 rounded-[1.1rem] text-[10px] font-black uppercase tracking-widest transition-all"
                style={activeTab === t
                  ? { background: t === "coins"
                      ? "linear-gradient(90deg,#fbbf24,#f59e0b)"
                      : "linear-gradient(90deg,#c026d3,#7c3aed)",
                    color: "#fff",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }
                  : { color: "#a1a1aa" }
                }>
                {t === "coins" ? "⚡ Coins" : "💎 Diamonds"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ══ COINS TAB ══ */}
            {activeTab === "coins" && (
              <motion.div key="coins"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.22 }}
                className="space-y-4">

                {/* Balance hero */}
                <div className="relative rounded-[2.5rem] overflow-hidden p-8 text-center"
                  style={{ background: "linear-gradient(135deg,#fffbeb 0%,#fef3c7 60%,#fde68a 100%)", boxShadow: "0 8px 40px rgba(251,191,36,0.2)" }}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(ellipse,rgba(251,191,36,0.3) 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-amber-500/60 mb-3">Balanță Coins</p>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Zap size={36} className="fill-amber-400 text-amber-400 drop-shadow" />
                    <span className="text-7xl font-black tracking-tighter text-zinc-900 leading-none">
                      {wallet.coins_balance.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[9px] font-bold text-amber-500/50 uppercase tracking-widest">monede disponibile</p>
                </div>

                {/* Convert CTA */}
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => setModal("convert")}
                  disabled={wallet.coins_balance <= 0}
                  className="w-full rounded-[2rem] py-5 px-6 flex items-center justify-between transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#fff", boxShadow: "0 4px 20px rgba(168,85,247,0.1)", border: "1.5px solid #f3e8ff" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,#fde68a,#c026d3)" }}>
                      <RefreshCcw size={17} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-xs uppercase tracking-tight text-zinc-800">Convertește în Diamonds</p>
                      <p className="text-[9px] font-bold text-zinc-400 mt-0.5">1 Coin = 1 Diamond</p>
                    </div>
                  </div>
                  <ArrowUpCircle size={20} className="text-fuchsia-300 rotate-90" />
                </motion.button>

                {/* Buy more */}
                <Link href="/app/coins">
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="w-full rounded-[2rem] py-5 px-6 flex items-center justify-between cursor-pointer"
                    style={{ background: "#fff", boxShadow: "0 4px 20px rgba(251,191,36,0.08)", border: "1.5px solid #fef9c3" }}>
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#fde68a,#fbbf24)" }}>
                        <ShoppingBag size={17} className="text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-xs uppercase tracking-tight text-zinc-800">Cumpără Pachete Coins</p>
                        <p className="text-[9px] font-bold text-zinc-400 mt-0.5">Pachete disponibile</p>
                      </div>
                    </div>
                    <ArrowUpCircle size={20} className="text-amber-300 -rotate-45" />
                  </motion.div>
                </Link>

                <div className="flex items-start gap-3 px-1 pt-1">
                  <ShieldCheck size={15} className="text-zinc-300 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-zinc-400 font-bold leading-relaxed uppercase tracking-wide">
                    Coins se convertesc 1:1 în Diamonds. Diamonds pot fi retrași în bani fiat conform valorii stabilite de platformă.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ══ DIAMONDS TAB ══ */}
            {activeTab === "diamonds" && (
              <motion.div key="diamonds"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.22 }}
                className="space-y-4">

                {/* Balance hero */}
                <div className="relative rounded-[2.5rem] overflow-hidden p-8 text-center"
                  style={{ background: "linear-gradient(135deg,#fdf4ff 0%,#f5f3ff 60%,#ede9fe 100%)", boxShadow: "0 8px 40px rgba(168,85,247,0.15)" }}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(ellipse,rgba(192,38,211,0.15) 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />

                  {/* Rata platformei */}
                  {data.settings?.diamond_value_ron && (
                    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-4"
                      style={{ background: "rgba(192,38,211,0.08)", border: "1px solid rgba(192,38,211,0.15)" }}>
                      <Banknote size={10} className="text-fuchsia-500" />
                      <span className="text-[9px] font-black text-fuchsia-600 uppercase tracking-widest">
                        1 💎 = {data.settings.diamond_value_ron} RON
                      </span>
                    </div>
                  )}

                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-fuchsia-400/60 mb-3">Venituri Diamonds</p>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Gem size={36} className="text-fuchsia-500 drop-shadow" />
                    <span className="text-7xl font-black tracking-tighter text-zinc-900 leading-none">
                      {wallet.diamonds_balance.toLocaleString()}
                    </span>
                  </div>

                  {data.settings?.diamond_value_ron && wallet.diamonds_balance > 0 && (
                    <p className="text-[10px] font-black text-fuchsia-500/60 mt-2">
                      ≈ {(wallet.diamonds_balance * data.settings.diamond_value_ron).toFixed(2)} RON
                    </p>
                  )}
                </div>

                {/* Withdraw CTA */}
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => setModal("withdraw")}
                  disabled={wallet.diamonds_balance <= 0}
                  className="w-full rounded-[2rem] py-5 px-6 flex items-center justify-between transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#fff", boxShadow: "0 4px 20px rgba(16,185,129,0.1)", border: "1.5px solid #d1fae5" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,#34d399,#059669)" }}>
                      <Landmark size={17} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-xs uppercase tracking-tight text-zinc-800">Retrage în Cont Bancar</p>
                      <p className="text-[9px] font-bold text-zinc-400 mt-0.5">Diamonds → RON</p>
                    </div>
                  </div>
                  <ArrowUpCircle size={20} className="text-emerald-300" />
                </motion.button>

                <div className="flex items-start gap-3 px-1 pt-1">
                  <ShieldCheck size={15} className="text-zinc-300 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-zinc-400 font-bold leading-relaxed uppercase tracking-wide">
                    Valoarea unui diamond în RON este stabilită de platformă. Retragerile sunt procesate în 1–3 zile lucrătoare.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal === "convert" && data.profile && (
          <ConvertModal
            wallet={wallet} userId={data.profile.id} supabase={supabase}
            onClose={() => setModal(null)}
            onSuccess={() => handleSuccess("Conversie efectuată cu succes!")}
          />
        )}
        {modal === "withdraw" && data.profile && (
          <WithdrawModal
            wallet={wallet} settings={data.settings} userId={data.profile.id} supabase={supabase}
            onClose={() => setModal(null)}
            onSuccess={() => handleSuccess("Cerere trimisă! Admin-ul o va procesa în curând.")}
          />
        )}
      </AnimatePresence>
    </>
  );
}