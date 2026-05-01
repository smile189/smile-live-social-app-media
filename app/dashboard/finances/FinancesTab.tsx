"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Coins, ChevronLeft, ChevronRight,
  Loader2, Edit2, ArrowUpDown, X,
  TrendingUp, TrendingDown, Gift, RefreshCw,
  CheckCircle2, AlertCircle, ArrowRight,
  Users, BarChart3, Zap, Clock,
  ShieldCheck, Ban, Crown, Building2
} from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ITEMS_PER_PAGE = 12;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatCoins(n: number | null | undefined): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function timeAgo(iso: string) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ROLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  admin:  { label: "Admin",  icon: <Crown size={9} />,      color: "bg-amber-50 text-amber-700 border-amber-200" },
  agency: { label: "Agency", icon: <Building2 size={9} />,  color: "bg-violet-50 text-violet-700 border-violet-200" },
  banned: { label: "Banned", icon: <Ban size={9} />,        color: "bg-red-50 text-red-600 border-red-200" },
  user:   { label: "User",   icon: <ShieldCheck size={9} />, color: "bg-slate-100 text-slate-500 border-slate-200" },
};

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-600",
  "bg-violet-100 text-violet-600",
  "bg-sky-100 text-sky-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
];

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toast }: { toast: { msg: string; type: "success" | "error" } | null }) {
  if (!toast) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2.5 text-[11px] font-bold tracking-wide border ${
        toast.type === "success"
          ? "bg-white border-emerald-200 text-emerald-700 shadow-emerald-100"
          : "bg-white border-red-200 text-red-600 shadow-red-100"
      }`}
    >
      {toast.type === "success"
        ? <CheckCircle2 size={13} className="text-emerald-500" />
        : <AlertCircle size={13} className="text-red-500" />}
      {toast.msg}
    </motion.div>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({ url, username, size = "md" }: { url?: string; username?: string; size?: "sm" | "md" | "lg" }) {
  const [err, setErr] = useState(false);
  const sz = size === "sm" ? "w-7 h-7 text-[9px]" : size === "lg" ? "w-14 h-14 text-base" : "w-9 h-9 text-xs";
  const col = AVATAR_COLORS[(username?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  return (
    <div className={`${sz} rounded-full overflow-hidden border border-slate-200 flex items-center justify-center font-black shrink-0 ${!url || err ? col : ""}`}>
      {!err && url
        ? <img src={url} className="w-full h-full object-cover" onError={() => setErr(true)} alt="" />
        : <span className="uppercase">{username?.[0] || "?"}</span>}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, highlight }: any) {
  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${
      highlight ? "border-indigo-200 ring-1 ring-indigo-100" : "border-slate-200"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
          highlight ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400"
        }`}>{icon}</div>
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">{label}</span>
      </div>
      <div className={`text-2xl font-extrabold leading-none ${highlight ? "text-indigo-700" : "text-slate-900"}`}>{value}</div>
      {sub && <div className="text-[10px] text-slate-400 mt-1.5 font-medium">{sub}</div>}
    </div>
  );
}

// ─── QUICK BTN ────────────────────────────────────────────────────────────────
function QuickBtn({ label, positive, onClick }: { label: string; positive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${
        positive
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
      }`}
    >
      {label}
    </button>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function FinancesTab() {
  const [users, setUsers]                   = useState<any[]>([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [totalCount, setTotalCount]         = useState(0);
  const [totalCoinsAll, setTotalCoinsAll]   = useState(0);
  const [totalGifted, setTotalGifted]       = useState(0);
  const [realtimeActive, setRealtimeActive] = useState(false);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"coins_desc" | "coins_asc" | "username" | "updated">("coins_desc");
  const [page, setPage]     = useState(0);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [modalUser, setModalUser]   = useState<any>(null);
  const [newBalance, setNewBalance] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [txHistory, setTxHistory]   = useState<any[]>([]);
  const [txLoading, setTxLoading]   = useState(false);
  const [modalTab, setModalTab]     = useState<"edit" | "history">("edit");

  // ── Global stats ──
  const fetchGlobalStats = useCallback(async () => {
    const [wRes, gRes] = await Promise.all([
      supabase.from("wallets").select("coins_balance"),
      supabase.from("gift_transactions").select("coins_amount"),
    ]);
    if (wRes.data) setTotalCoinsAll(wRes.data.reduce((a, w) => a + (w.coins_balance || 0), 0));
    if (gRes.data) setTotalGifted(gRes.data.reduce((a, g) => a + (g.coins_amount || 0), 0));
  }, []);

  // ── Fetch users ──
  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const { data, error, count } = await supabase
      .from("profiles")
      .select(`id, username, full_name, avatar_url, role, wallets(coins_balance, updated_at)`, { count: "exact" })
      .order("username", { ascending: true });

    if (!error && data) {
      let formatted = data.map((p) => ({
        ...p,
        coins: Array.isArray(p.wallets) ? (p.wallets[0]?.coins_balance ?? 0) : ((p.wallets as any)?.coins_balance ?? 0),
        wallet_updated: Array.isArray(p.wallets) ? p.wallets[0]?.updated_at : (p.wallets as any)?.updated_at,
      }));
      if (sortBy === "coins_desc") formatted.sort((a, b) => b.coins - a.coins);
      if (sortBy === "coins_asc")  formatted.sort((a, b) => a.coins - b.coins);
      if (sortBy === "updated")    formatted.sort((a, b) =>
        new Date(b.wallet_updated || 0).getTime() - new Date(a.wallet_updated || 0).getTime()
      );
      setUsers(formatted);
      if (count !== null) setTotalCount(count);
    }
    setLoading(false);
    setRefreshing(false);
  }, [sortBy]);

  // ── Realtime ──
  useEffect(() => {
    fetchUsers();
    fetchGlobalStats();
    const ch = supabase.channel("finances-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "wallets" }, () => { fetchUsers(true); fetchGlobalStats(); })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "gift_transactions" }, () => fetchGlobalStats())
      .subscribe((s) => setRealtimeActive(s === "SUBSCRIBED"));
    return () => { supabase.removeChannel(ch); };
  }, [fetchUsers, fetchGlobalStats]);

  useEffect(() => { setPage(0); }, [search, sortBy]);

  // ── Filtered + paginated ──
  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return users;
    return users.filter((u) => u.username?.toLowerCase().includes(s) || u.full_name?.toLowerCase().includes(s));
  }, [users, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  const pageCoins  = paginated.reduce((a, u) => a + u.coins, 0);

  // ── Update wallet ──
  const confirmUpdate = async () => {
    if (!modalUser || isUpdating) return;
    const val = parseInt(newBalance);
    if (isNaN(val) || val < 0) return showToast("Invalid amount", "error");
    setIsUpdating(true);
    const { error } = await supabase.from("wallets").upsert(
      { user_id: modalUser.id, coins_balance: val, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    if (!error) {
      setUsers((prev) => prev.map((u) => u.id === modalUser.id ? { ...u, coins: val } : u));
      showToast(`@${modalUser.username} → ${formatCoins(val)} coins`);
      setModalUser(null);
      fetchGlobalStats();
    } else showToast("Update failed", "error");
    setIsUpdating(false);
  };

  // ── Gift history ──
  const fetchHistory = useCallback(async (userId: string) => {
    setTxLoading(true);
    const [sentRes, recvRes] = await Promise.all([
      supabase.from("gift_transactions")
        .select("*, receiver:receiver_id(username, avatar_url), gift_types(name)")
        .eq("sender_id", userId).order("created_at", { ascending: false }).limit(25),
      supabase.from("gift_transactions")
        .select("*, sender:sender_id(username, avatar_url), gift_types(name)")
        .eq("receiver_id", userId).order("created_at", { ascending: false }).limit(25),
    ]);
    const sent = (sentRes.data || []).map((t) => ({ ...t, direction: "sent" }));
    const recv = (recvRes.data || []).map((t) => ({ ...t, direction: "received" }));
    setTxHistory([...sent, ...recv].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    setTxLoading(false);
  }, []);

  const openModal = (user: any) => {
    setModalUser(user);
    setNewBalance(user.coins.toString());
    setModalTab("edit");
    fetchHistory(user.id);
  };

  const adjust = (delta: number) =>
    setNewBalance((v) => Math.max(0, (parseInt(v) || 0) + delta).toString());

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-700 font-sans selection:bg-indigo-100 selection:text-indigo-800 pb-20">

      {/* Stripe accent bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 z-50" />

      <AnimatePresence><Toast toast={toast} /></AnimatePresence>

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-[3px] z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200">
              <Coins size={14} className="text-white" />
            </div>
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">
              Finance<span className="text-indigo-600">Ops</span>
            </span>
            {/* Realtime pill */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all ${
              realtimeActive ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-400"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${realtimeActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              {realtimeActive ? "Live" : "Connecting"}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span>{totalCount.toLocaleString()} users</span>
            <span className="text-slate-300">·</span>
            <span className="text-indigo-600 font-bold flex items-center gap-1">
              <Coins size={11} /> {formatCoins(totalCoinsAll)} total
            </span>
            <button
              onClick={() => { fetchUsers(true); fetchGlobalStats(); }}
              className="ml-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-all"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8 pb-12 space-y-8">

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users"  value={totalCount.toLocaleString()} icon={<Users size={15}/>}    sub="registered profiles" />
          <StatCard label="Total Coins"  value={formatCoins(totalCoinsAll)}  icon={<Coins size={15}/>}    sub="across all wallets" highlight />
          <StatCard label="Total Gifted" value={formatCoins(totalGifted)}    icon={<Gift size={15}/>}     sub="all gift transactions" />
          <StatCard label="Page Balance" value={formatCoins(pageCoins)}      icon={<BarChart3 size={15}/>} sub={`${paginated.length} users shown`} />
        </div>

        {/* ── CONTROLS ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full group">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Filter by name or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-10 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-9 py-3 text-xs font-bold text-slate-600 outline-none focus:border-indigo-400 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
            >
              <option value="coins_desc">Most Coins</option>
              <option value="coins_asc">Fewest Coins</option>
              <option value="username">A → Z</option>
              <option value="updated">Recently Updated</option>
            </select>
            <ArrowUpDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm shrink-0">
            <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all">
              <ChevronLeft size={16} />
            </button>
            <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-x border-slate-100 whitespace-nowrap">
              {page + 1} / {Math.max(1, totalPages)}
            </div>
            <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-4 border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <div className="col-span-5">User Profile</div>
            <div className="col-span-3 text-center">Wallet Balance</div>
            <div className="col-span-2 text-center">Role</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-40 bg-slate-100 rounded-full" />
                    <div className="h-2.5 w-24 bg-slate-100/70 rounded-full" />
                  </div>
                  <div className="h-7 w-24 bg-slate-100 rounded-full" />
                </div>
              ))
            ) : paginated.length === 0 ? (
              <div className="py-20 text-center">
                <Coins size={36} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">No users found</p>
                {search && <button onClick={() => setSearch("")} className="mt-2 text-indigo-500 text-xs font-bold hover:underline">Clear search</button>}
              </div>
            ) : (
              paginated.map((user, idx) => {
                const cfg = ROLE_CONFIG[user.role || "user"] || ROLE_CONFIG.user;
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.025 }}
                    className="grid grid-cols-12 px-6 py-4 items-center hover:bg-indigo-50/20 group transition-all"
                  >
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <Avatar url={user.avatar_url} username={user.username} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-800 transition-colors">
                          {user.full_name || <span className="text-slate-400 italic font-normal">No name</span>}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                        {user.wallet_updated && (
                          <p className="text-[9px] text-slate-300 flex items-center gap-1 mt-0.5">
                            <Clock size={8} /> {timeAgo(user.wallet_updated)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="col-span-3 flex justify-center">
                      <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border font-bold text-sm transition-all group-hover:scale-105 duration-200 ${
                        user.coins > 10000 ? "bg-amber-50 border-amber-200 text-amber-700"
                        : user.coins > 1000  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}>
                        <Coins size={13} /> {formatCoins(user.coins)}
                      </div>
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wide ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>

                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => openModal(user)}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-600 hover:border-indigo-600 text-slate-400 hover:text-white transition-all shadow-sm hover:shadow-indigo-200 active:scale-95"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Table footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">
                Showing {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} users
              </span>
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                Page balance: <span className="text-indigo-600 font-bold ml-1 flex items-center gap-0.5"><Coins size={10}/>{formatCoins(pageCoins)}</span>
              </span>
            </div>
          )}
        </div>

        {/* Bottom pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button disabled={page === 0} onClick={() => { setPage((p) => Math.max(0, p - 1)); window.scrollTo(0,0); }}
              className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm">
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const p = Math.max(0, Math.min(totalPages - 7, page - 3)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-[10px] font-bold transition-all ${
                      page === p
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
                    }`}>
                    {p + 1}
                  </button>
                );
              })}
            </div>
            <button disabled={page + 1 >= totalPages} onClick={() => { setPage((p) => p + 1); window.scrollTo(0,0); }}
              className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {modalUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalUser(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", damping: 24, stiffness: 320 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />

              {/* Modal header */}
              <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar url={modalUser.avatar_url} username={modalUser.username} size="lg" />
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 leading-tight">{modalUser.full_name || modalUser.username}</h2>
                    <p className="text-[11px] text-slate-400">@{modalUser.username}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Coins size={11} className="text-indigo-500" />
                      <span className="text-[11px] font-bold text-indigo-600">{formatCoins(modalUser.coins)} current</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setModalUser(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-3 border-b border-slate-100 bg-slate-50/70">
                {(["edit", "history"] as const).map((t) => (
                  <button key={t} onClick={() => setModalTab(t)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      modalTab === t ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                    }`}>
                    {t === "edit" ? "Edit Wallet" : "Gift History"}
                  </button>
                ))}
              </div>

              {/* Edit Tab */}
              {modalTab === "edit" && (
                <div className="p-7 space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quick Adjust</label>
                    <div className="flex flex-wrap gap-2">
                      {[-1000, -500, -100].map((d) => <QuickBtn key={d} label={`${d}`} positive={false} onClick={() => adjust(d)} />)}
                      {[100, 500, 1000, 5000].map((d) => <QuickBtn key={d} label={`+${d}`} positive={true} onClick={() => adjust(d)} />)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Set Exact Balance</label>
                    <div className="relative group">
                      <Coins size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        autoFocus type="number" min={0}
                        value={newBalance} onChange={(e) => setNewBalance(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && confirmUpdate()}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl py-5 pl-14 pr-6 text-3xl font-extrabold text-slate-900 outline-none transition-all"
                      />
                    </div>
                    {parseInt(newBalance) !== modalUser.coins && !isNaN(parseInt(newBalance)) && (
                      <div className="flex items-center gap-2 text-[11px] px-1">
                        <span className="text-slate-400 font-medium">{formatCoins(modalUser.coins)}</span>
                        <ArrowRight size={11} className="text-slate-300" />
                        <span className={`font-bold ${parseInt(newBalance) > modalUser.coins ? "text-emerald-600" : "text-red-500"}`}>
                          {formatCoins(parseInt(newBalance))}
                        </span>
                        <span className={`ml-auto font-bold text-[10px] px-2 py-0.5 rounded-full ${
                          parseInt(newBalance) > modalUser.coins ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                        }`}>
                          {parseInt(newBalance) > modalUser.coins ? "+" : ""}
                          {formatCoins(parseInt(newBalance) - modalUser.coins)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setModalUser(null)}
                      className="flex-1 py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-widest transition-all active:scale-[0.98]">
                      Cancel
                    </button>
                    <button onClick={confirmUpdate}
                      disabled={isUpdating || newBalance === modalUser.coins.toString() || isNaN(parseInt(newBalance))}
                      className="flex-[2] py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-40 active:scale-[0.98]">
                      {isUpdating ? <Loader2 size={15} className="animate-spin" /> : <Zap size={14} />}
                      Authorize Change
                    </button>
                  </div>
                </div>
              )}

              {/* History Tab */}
              {modalTab === "history" && (
                <div className="p-6 space-y-4">
                  {txLoading ? (
                    <div className="py-10 flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-indigo-400" size={22} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading history…</span>
                    </div>
                  ) : txHistory.length === 0 ? (
                    <div className="py-10 text-center">
                      <Gift size={32} className="text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm font-medium">No gift transactions yet</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {txHistory.map((tx) => {
                          const isSent = tx.direction === "sent";
                          const other  = isSent ? tx.receiver : tx.sender;
                          return (
                            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSent ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                                {isSent ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] text-slate-500">{isSent ? "To" : "From"}</span>
                                  <span className="text-[10px] font-bold text-slate-800">@{other?.username || "unknown"}</span>
                                  {tx.gift_types?.name && (
                                    <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-medium">
                                      {tx.gift_types.name}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] text-slate-400">{timeAgo(tx.created_at)}</span>
                              </div>
                              <div className={`text-sm font-extrabold shrink-0 ${isSent ? "text-red-500" : "text-emerald-600"}`}>
                                {isSent ? "−" : "+"}{formatCoins(tx.coins_amount)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                          <div className="text-[9px] font-bold uppercase text-slate-400 mb-1">Total Sent</div>
                          <div className="text-base font-extrabold text-red-600">
                            {formatCoins(txHistory.filter((t) => t.direction === "sent").reduce((a, t) => a + t.coins_amount, 0))}
                          </div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                          <div className="text-[9px] font-bold uppercase text-slate-400 mb-1">Total Received</div>
                          <div className="text-base font-extrabold text-emerald-600">
                            {formatCoins(txHistory.filter((t) => t.direction === "received").reduce((a, t) => a + t.coins_amount, 0))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}