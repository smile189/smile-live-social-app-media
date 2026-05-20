"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Coins, Zap, Star, Crown, Sparkles, Shield,
  ChevronDown, Loader2, Check, X, Gift,
  TrendingUp, Lock, CreditCard, ArrowRight,
  Flame, Diamond, ChevronLeft
} from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── PACKAGES ─────────────────────────────────────────────────────────────────

const PACKAGES = [
  {
    id: "pack_10000",
    coins: 10000,
    prices: { eur: 9.99, usd: 10.99, ron: 49.99 },
    label: "Starter",
    sub: "Perfect to begin",
    icon: Zap,
    gradient: "from-sky-400 to-blue-600",
    glow: "rgba(56,189,248,0.15)",
    badge: null,
    popular: false,
  },
  {
    id: "pack_25000",
    coins: 25000,
    prices: { eur: 23.99, usd: 25.99, ron: 119.99 },
    label: "Popular",
    sub: "Most chosen",
    icon: Flame,
    gradient: "from-violet-400 to-purple-600",
    glow: "rgba(167,139,250,0.18)",
    badge: "Best Value",
    popular: true,
  },
  {
    id: "pack_50000",
    coins: 50000,
    prices: { eur: 45.99, usd: 49.99, ron: 229.99 },
    label: "Pro",
    sub: "For power users",
    icon: Star,
    gradient: "from-amber-400 to-orange-500",
    glow: "rgba(251,191,36,0.15)",
    badge: "Save 8%",
    popular: false,
  },
  {
    id: "pack_110000",
    coins: 110000,
    prices: { eur: 99.99, usd: 109.99, ron: 499.99 },
    label: "Elite",
    sub: "Top creator tier",
    icon: Crown,
    gradient: "from-rose-400 to-pink-600",
    glow: "rgba(251,113,133,0.15)",
    badge: "10% Extra",
    popular: false,
  },
  {
    id: "pack_1150000",
    coins: 1150000,
    prices: { eur: 999.99, usd: 1099.99, ron: 4999.99 },
    label: "Diamond",
    sub: "Ultimate status",
    icon: Diamond,
    gradient: "from-emerald-400 to-teal-600",
    glow: "rgba(52,211,153,0.15)",
    badge: "Max Savings",
    popular: false,
  },
  
];

type Currency = "eur" | "usd" | "ron";

const CURRENCIES: Record<Currency, { symbol: string; flag: string; label: string }> = {
  eur: { symbol: "€", flag: "🇪🇺", label: "EUR" },
  usd: { symbol: "$", flag: "🇺🇸", label: "USD" },
  ron: { symbol: "RON", flag: "🇷🇴", label: "RON" },
};

function formatCoins(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

function formatPrice(price: number, currency: Currency): string {
  const { symbol } = CURRENCIES[currency];
  if (currency === "ron") return `${price.toFixed(2)} RON`;
  return `${symbol}${price.toFixed(2)}`;
}

// ─── PACKAGE CARD ─────────────────────────────────────────────────────────────

function PackageCard({
  pack, currency, selected, onSelect, disabled
}: {
  pack: typeof PACKAGES[0];
  currency: Currency;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const Icon  = pack.icon;
  const price = pack.prices[currency];

  return (
    <motion.button
      layout
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      disabled={disabled}
      className={`relative w-full text-left transition-all duration-300 rounded-2xl overflow-hidden border-2 ${
        selected
          ? "border-slate-900 shadow-xl"
          : "border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} bg-white`}
      style={selected ? { boxShadow: `0 8px 32px ${pack.glow}, 0 2px 8px rgba(0,0,0,0.08)` } : {}}
    >
      {pack.popular && (
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${pack.gradient}`} />
      )}
      {pack.badge && (
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r ${pack.gradient} text-white shadow-sm`}>
          {pack.badge}
        </div>
      )}
      <div className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pack.gradient} flex items-center justify-center text-white shadow-md shrink-0`}>
          <Icon size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{pack.label}</span>
            <span className="text-[10px] text-slate-400 font-medium">{pack.sub}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{formatCoins(pack.coins)}</span>
            <span className={`text-sm font-black bg-gradient-to-r ${pack.gradient} bg-clip-text text-transparent`}>
              coins
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xl font-black text-slate-900">{formatPrice(price, currency)}</div>
            <div className="text-[9px] text-slate-400 font-medium">one-time</div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            selected ? "bg-slate-900 border-slate-900" : "border-slate-300"
          }`}>
            {selected && <Check size={12} className="text-white" />}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function CoinsShop() {
  const router = useRouter();

  const [currency, setCurrency]             = useState<Currency>("eur");
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [selected, setSelected]             = useState<string | null>(null);
  const [loading, setLoading]               = useState(false);
  const [balance, setBalance]               = useState<number | null>(null);
  const [user, setUser]                     = useState<any>(null);
  const [error, setError]                   = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUser(session.user);
      const { data: wallet } = await supabase
        .from("wallets")
        .select("coins_balance")
        .eq("user_id", session.user.id)
        .maybeSingle();
      setBalance(wallet?.coins_balance ?? 0);
    };
    load();
  }, []);

  const handleBuy = async () => {
    if (!selected || loading) return;
    if (!user) { window.location.href = "/app/login"; return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selected, currency }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const selectedPack = PACKAGES.find((p) => p.id === selected);
  const cur          = CURRENCIES[currency];

  return (
    <div className="min-h-screen font-sans" style={{ background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 50%, #faf8ff 100%)" }}>

      {/* Subtle grid pattern */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        opacity: 0.4,
      }} />

      {/* ── STICKY TOP NAV ── */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-xl mx-auto px-5 py-3 flex items-center justify-between">

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all active:scale-95 text-sm font-bold"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:block text-xs uppercase tracking-widest font-black">Back</span>
          </button>

          {/* Center logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-indigo-500 flex items-center justify-center shadow-md shadow-fuchsia-200">
              <Coins size={14} className="text-white" />
            </div>
            <span className="text-sm font-black tracking-tight text-slate-900">
              Smile{" "}
              <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
                 marketplace
              </span>
            </span>
          </div>

          {/* Balance pill */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-50 to-indigo-50 border border-fuchsia-200 px-3 py-1.5 rounded-full shadow-sm">
            <Coins size={12} className="text-yellow-500 shrink-0" />
            {balance !== null ? (
              <span className="text-xs font-black text-yellow-700">{balance.toLocaleString()}</span>
            ) : (
              <div className="w-8 h-2.5 bg-fuchsia-200/60 rounded-full animate-pulse" />
            )}
          </div>
        </div>
      </div>

      <div className="relative max-w-xl mx-auto px-5 py-10 pb-40">

{/* ── HEADER ── */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-center mb-10"
>
  {/* Coin icon */}
  <div className="relative inline-flex mb-6">
    <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-2xl scale-[2]" />
    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-200">
      <Coins size={28} className="text-white" />
    </div>
  </div>

  <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-2">
    Get{" "}
    <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
      Golden Coins
    </span>
  </h1>
  <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">
    Send gifts to your favorite creators, boost your posts, and unlock premium features.
  </p>

  {balance !== null && (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 mt-4 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-full"
    >
      <Coins size={14} className="text-amber-500" />
      <span className="text-sm font-black text-slate-700">
        {balance.toLocaleString()} coins
      </span>
      <span className="text-[10px] text-slate-400 font-medium">current balance</span>
    </motion.div>
  )}
</motion.div>

        {/* ── CURRENCY SELECTOR ── */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Select a package
          </span>
          <div className="relative">
            <button
              onClick={() => setShowCurrencyMenu((s) => !s)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-slate-300 shadow-sm transition-all"
            >
              <span>{cur.flag}</span>
              <span>{cur.label}</span>
              <ChevronDown size={12} className={`text-slate-400 transition-transform ${showCurrencyMenu ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showCurrencyMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  className="absolute top-full right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden min-w-[130px]"
                >
                  {(Object.entries(CURRENCIES) as [Currency, typeof CURRENCIES[Currency]][]).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => { setCurrency(key); setShowCurrencyMenu(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors ${
                        currency === key ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      <span>{val.flag}</span>
                      <span>{val.label}</span>
                      {currency === key && <Check size={11} className="ml-auto text-slate-900" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── PACKAGES ── */}
        <div className="space-y-3">
          {PACKAGES.map((pack, i) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: "spring", damping: 20 }}
            >
              <PackageCard
                pack={pack}
                currency={currency}
                selected={selected === pack.id}
                onSelect={() => setSelected(pack.id)}
                disabled={loading}
              />
            </motion.div>
          ))}
        </div>

        {/* ── FEATURES ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-3 gap-3"
        >
          {[
            { icon: Gift,       title: "Send Gifts",  desc: "Support live creators" },
            { icon: TrendingUp, title: "Boost Posts", desc: "Reach more people" },
            { icon: Sparkles,   title: "Go Premium",  desc: "Exclusive features" },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
              <item.icon size={18} className="text-fuchsia-400 mx-auto mb-2" />
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{item.title}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-slate-200" />

        <div className="relative max-w-xl mx-auto px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-red-500 text-xs font-bold mb-3"
              >
                <X size={12} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary row */}
          <AnimatePresence>
            {selectedPack && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between mb-3 px-1"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${selectedPack.gradient} flex items-center justify-center`}>
                    <selectedPack.icon size={11} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {formatCoins(selectedPack.coins)} coins
                  </span>
                  <span className="text-[10px] text-slate-400">· {selectedPack.label}</span>
                </div>
                <span className="text-sm font-black text-slate-900">
                  {formatPrice(selectedPack.prices[currency], currency)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleBuy}
            disabled={!selected || loading || !user}
            className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all duration-300 ${
              selected && user
                ? "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-pink-600 text-white shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 hover:brightness-110"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Processing...</>
            ) : !user ? (
              <><Lock size={15} /> Login to Purchase</>
            ) : !selected ? (
              <><Coins size={15} /> Choose a Package</>
            ) : (
              <><CreditCard size={15} /> Pay Now <ArrowRight size={14} /></>
            )}
          </motion.button>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-3 mt-3">
            {[
              { icon: Shield, text: "Secure Payment" },
              { icon: Lock,   text: "SSL Encrypted" },
            ].map((item) => (
              <span key={item.text} className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                <item.icon size={9} /> {item.text}
              </span>
            ))}
            <span className="text-slate-300">·</span>
            <span className="text-[9px] text-slate-400 font-medium">Powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}