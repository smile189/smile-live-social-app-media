"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { 
  Search, 
  Coins, 
  ArrowRight, 
  UserCircle, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  ArrowUpRight,
  X,
  Wallet,
  Loader2,
  Sparkles
} from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ITEMS_PER_PAGE = 12;

export default function FinancesTab() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newBalance, setNewBalance] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // --- CALCUL TOTAL COINS (LIVE PE PAGINA CURENTĂ) ---
  const pageTotalCoins = useMemo(() => {
    return data.reduce((acc, curr) => acc + (curr.coins || 0), 0);
  }, [data]);

  const fetchFinances = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: profiles, error, count } = await supabase
        .from("profiles")
        .select(`id, username, full_name, role, wallets (coins_balance)`, { count: 'exact' })
        .order('username', { ascending: true })
        .range(from, to);

      if (!error && profiles) {
        const formattedData = profiles.map(p => ({
          ...p,
          coins: Array.isArray(p.wallets) ? p.wallets[0]?.coins_balance : (p.wallets as any)?.coins_balance || 0
        }));
        setData(formattedData);
        if (count !== null) setTotalCount(count);
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFinances();
  }, [fetchFinances]);

  const confirmUpdate = async () => {
    if (!selectedUser || isUpdating) return;
    setIsUpdating(true);
    const { error } = await supabase.from("wallets").upsert({ 
      user_id: selectedUser.id, 
      coins_balance: parseInt(newBalance) || 0, 
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    if (!error) {
      setData(prev => prev.map(item => item.id === selectedUser.id ? { ...item, coins: parseInt(newBalance) } : item));
      setIsModalOpen(false);
    }
    setIsUpdating(false);
  };

  const filteredData = data.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020203] text-zinc-400 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto p-6 space-y-8 z-10">
        
        {/* TOP NAV - UPDATED WITH TOTAL COINS */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800/50 pb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">System Core</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Economy <span className="text-zinc-600 font-light">Control</span>
            </h1>
          </motion.div>
          
          <div className="flex items-center gap-2 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 p-1.5 rounded-2xl">
            {/* Stat: Users */}
            <div className="px-4 py-2 bg-zinc-800/30 rounded-xl border border-zinc-700/30 text-center min-w-[100px]">
              <p className="text-[9px] uppercase font-black text-zinc-500 tracking-wider mb-0.5">Users</p>
              <p className="text-lg font-mono text-white leading-none">{totalCount}</p>
            </div>

            {/* Stat: Total Coins (NEW) */}
            <div className="px-4 py-2 bg-amber-500/5 rounded-xl border border-amber-500/10 text-center min-w-[140px]">
              <p className="text-[9px] uppercase font-black text-amber-600/70 tracking-wider mb-0.5">Total Coins</p>
              <div className="flex items-center justify-center gap-1.5">
                <Coins size={12} className="text-amber-500" />
                <p className="text-lg font-mono text-amber-500 leading-none font-bold">
                  {pageTotalCoins.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-800 mx-1" />

            <div className="pr-4 pl-2 flex items-center gap-2">
               <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Live</span>
            </div>
          </div>
        </header>

        {/* SEARCH */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="relative max-w-md group"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search terminal..."
            className="w-full bg-zinc-900/20 border border-zinc-800/80 rounded-2xl py-4 pl-12 pr-4 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all backdrop-blur-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>

        {/* DATA GRID */}
        <LayoutGroup>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <div key={i} className="h-40 bg-zinc-900/10 animate-pulse rounded-3xl border border-zinc-800/30" />
                ))
              ) : (
                filteredData.map((user) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    key={user.id}
                    className="relative bg-zinc-900/20 border border-zinc-800/50 rounded-[2rem] p-6 hover:bg-zinc-900/40 hover:border-zinc-700/50 transition-all group overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                      <Wallet size={40} className="text-indigo-500" />
                    </div>

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center shadow-inner group-hover:border-indigo-500/50 transition-colors">
                        <UserCircle size={20} className="text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-sm font-bold text-zinc-100 truncate">{user.full_name || "Guest"}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono truncate">@{user.username}</p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between border-t border-zinc-800/50 pt-4 relative z-10">
                      <div>
                        <p className="text-[9px] uppercase text-zinc-600 font-black tracking-widest mb-1">Balance</p>
                        <div className="flex items-center gap-1.5">
                          <Coins size={14} className="text-amber-500" />
                          <span className="text-lg font-mono font-bold text-white tracking-tighter">
                            {user.coins.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setSelectedUser(user); setNewBalance(user.coins.toString()); setIsModalOpen(true); }}
                        className="bg-white hover:bg-indigo-400 text-black p-2.5 rounded-xl transition-all active:scale-90 shadow-lg shadow-indigo-500/5"
                      >
                        <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </LayoutGroup>

        {/* FOOTER */}
        <footer className="flex items-center justify-center gap-4 pt-6">
          <button 
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="p-3 rounded-2xl border border-zinc-800 hover:border-indigo-500/50 disabled:opacity-10 bg-zinc-900/40 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-800">
            Page {page + 1}
          </span>
          <button 
            disabled={(page + 1) * ITEMS_PER_PAGE >= totalCount}
            onClick={() => setPage(p => p + 1)}
            className="p-3 rounded-2xl border border-zinc-800 hover:border-indigo-500/50 disabled:opacity-10 bg-zinc-900/40 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </footer>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-amber-500" />
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Adjust Wallet</h2>
                <X className="cursor-pointer text-zinc-500 hover:text-white transition-colors" onClick={() => setIsModalOpen(false)} />
              </div>
              <div className="space-y-6">
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <p className="text-[10px] uppercase font-black text-zinc-600 mb-2">New Balance</p>
                  <input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} className="w-full bg-transparent text-2xl font-mono text-white outline-none" autoFocus />
                </div>
                <button onClick={confirmUpdate} disabled={isUpdating} className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-indigo-400 transition-all flex items-center justify-center gap-2">
                  {isUpdating ? <Loader2 className="animate-spin" /> : "Apply Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
