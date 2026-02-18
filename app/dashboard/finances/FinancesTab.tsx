"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { 
  Search, Coins, UserCircle, ChevronLeft, ChevronRight,
  Activity, Wallet, Loader2, Sparkles, Edit2, ArrowUpDown,
  ShieldCheck, ExternalLink, MoreHorizontal
} from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ITEMS_PER_PAGE = 10;

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

  useEffect(() => { fetchFinances(); }, [fetchFinances]);

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
    <div className="min-h-screen bg-[#F9FAFB] text-slate-600 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Indigo Accent Lines (Decorative) */}
      <div className="fixed top-0 left-0 w-full h-1 bg-indigo-600 z-50" />
      <div className="absolute top-0 right-0 w-1/3 h-px bg-gradient-to-l from-indigo-500/20 to-transparent" />

      <div className="relative max-w-[1200px] mx-auto p-6 md:p-12 space-y-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">

          
          <div className="flex gap-4 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="px-6 py-3 border-r border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Total Users</p>
              <p className="text-2xl font-bold text-slate-900 leading-none">{totalCount}</p>
            </div>
            <div className="px-6 py-3">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Page Balance</p>
              <div className="flex items-center gap-2 text-indigo-600">
                <Coins size={18} />
                <p className="text-2xl font-bold leading-none">{pageTotalCoins.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Filter by name or username..."
              className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 disabled:opacity-30 rounded-lg transition-all">
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-x border-slate-100">
              Page {page + 1}
            </div>
            <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * ITEMS_PER_PAGE >= totalCount} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 disabled:opacity-30 rounded-lg transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* LIST TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="grid grid-cols-12 px-8 py-5 border-b border-slate-100 bg-slate-50/50 text-[11px] uppercase font-bold tracking-widest text-slate-400">
            <div className="col-span-5 flex items-center gap-2">User Profile <ArrowUpDown size={12} /></div>
            <div className="col-span-3 text-center">Wallet Balance</div>
            <div className="col-span-2 text-center">Verification</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            <AnimatePresence mode="wait">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 animate-pulse px-8 flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full" />
                    <div className="h-4 w-48 bg-slate-100 rounded" />
                  </div>
                ))
              ) : (
                filteredData.map((user, idx) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    key={user.id}
                    className="grid grid-cols-12 px-8 py-5 items-center hover:bg-indigo-50/30 group transition-all"
                  >
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all duration-300">
                        <UserCircle size={22} />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-900 transition-colors truncate">{user.full_name || "New Entity"}</p>
                        <p className="text-xs font-medium text-slate-400 truncate">@{user.username}</p>
                      </div>
                    </div>

                    <div className="col-span-3 flex justify-center">
                      <div className="flex items-center gap-2 bg-indigo-50/50 px-4 py-1.5 rounded-full border border-indigo-100 group-hover:scale-105 transition-transform duration-300">
                        <Coins size={14} className="text-indigo-600" />
                        <span className="text-sm font-bold text-indigo-900">{user.coins?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-tighter border border-emerald-100">
                        Verified
                      </span>
                    </div>

                    <div className="col-span-2 text-right">
                      <button 
                        onClick={() => { setSelectedUser(user); setNewBalance(user.coins.toString()); setIsModalOpen(true); }}
                        className="p-2.5 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-indigo-200 active:scale-95"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MODAL */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />
                
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
               <div className="space-y-1">
  <div className="flex items-center gap-4">
    {/* BANUL DE AUR - REALISTIC LOOK */}
    <div className="relative group flex-shrink-0">
      {/* Glow-ul din spatele banului */}
      <div className="absolute inset-0 bg-amber-400 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
      
      {/* Corpul monedei */}
      <div className="relative h-12 w-12 rounded-full border-2 border-amber-200 bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_8px_rgba(0,0,0,0.2)] flex items-center justify-center overflow-hidden">
        {/* Reflexia metalică (Gloss) */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/30 to-transparent rotate-45 pointer-events-none" />
        
        {/* Iconița de monedă în relief */}
        <Coins size={24} className="text-amber-900/80 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
      </div>
    </div>

    <div className="flex flex-col">
      <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
        Golden Coins <span className="text-amber-600">Update</span>
      </h2>
      <p className="text-sm font-medium text-slate-400 underline decoration-amber-400/30 decoration-2 underline-offset-4">
        @{selectedUser?.username}
      </p>
    </div>
  </div>
</div>


                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                      <Wallet size={24} />
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
                       <Coins className="text-indigo-200 group-focus-within:text-indigo-600 transition-colors" size={24} />
                    </div>
                    <input 
                      autoFocus
                      type="number"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-6 pl-16 pr-6 text-3xl font-extrabold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all text-sm font-bold text-slate-400 uppercase tracking-widest active:scale-95">Cancel</button>
                    <button 
                      onClick={confirmUpdate}
                      disabled={isUpdating}
                      className="flex-[1.5] py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95"
                    >
                      {isUpdating ? <Loader2 size={20} className="animate-spin" /> : "Authorize Change"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
