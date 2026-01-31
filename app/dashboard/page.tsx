"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- DATA TYPES ---
type NavItemType = "overview" | "users" | "content" | "finances" | "moderation" | "gifts";

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<NavItemType>("overview");
  const [darkMode, setDarkMode] = useState(true);

  // DARK MODE FIX: Injects class into HTML root for Tailwind global propagation
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-zinc-100 transition-colors duration-500 font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="fixed top-0 left-0 h-full w-20 lg:w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 z-50 flex flex-col transition-all shadow-2xl">
        <div className="p-8 flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 180 }}
            className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-black shadow-lg shadow-yellow-400/20"
          >
            S
          </motion.div>
          <span className="hidden lg:block font-black text-xl tracking-tighter italic uppercase">
            SMILE<span className="text-yellow-400">LIVE</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <MenuBtn icon="📊" label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <MenuBtn icon="👥" label="Users" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <MenuBtn icon="🎬" label="Posts & Video" active={activeTab === "content"} onClick={() => setActiveTab("content")} />
          <MenuBtn icon="💰" label="Finances & Coins" active={activeTab === "finances"} onClick={() => setActiveTab("finances")} />
          <MenuBtn icon="🎁" label="Gifts Config" active={activeTab === "gifts"} onClick={() => setActiveTab("gifts")} />
          <MenuBtn icon="🚩" label="Moderation" active={activeTab === "moderation"} onClick={() => setActiveTab("moderation")} />
        </nav>

        <div className="p-6 border-t border-slate-200 dark:border-zinc-800">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-zinc-900 hover:bg-yellow-400 hover:text-black transition-all group shadow-inner"
          >
            <span className="text-xl">{darkMode ? "☀️" : "🌙"}</span>
            <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-12">
        
        {/* TOP BAR */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl lg:text-5xl font-black capitalize tracking-tighter underline decoration-yellow-400 decoration-4 underline-offset-8">
              {activeTab} <span className="text-yellow-400 font-light">Console</span>
            </h1>
            <p className="text-slate-500 dark:text-zinc-500 text-sm mt-4 font-medium tracking-wide">Smile Live Network Management Hub</p>
          </motion.div>
          
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-3 pr-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-2xl shadow-inner shadow-black/20">👑</div>
            <div className="hidden sm:block">
              <p className="text-xs font-black">Admin Console</p>
              <div className="flex items-center gap-1">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                 <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">System Online</p>
              </div>
            </div>
          </div>
        </header>

        {/* ANIMATED CONTENT TABS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "finances" && <FinancesTab />}
            {activeTab === "moderation" && <ModerationTab />}
            {activeTab === "content" && <PlaceholderTab label="Bunny.net Video Stream Explorer" icon="🎬" />}
            {activeTab === "gifts" && <PlaceholderTab label="Gifts & Monetization Engine" icon="🎁" />}
            {activeTab === "users" && <PlaceholderTab label="User Directory & Global Permissions" icon="👥" />}
          </motion.div>
        </AnimatePresence>
        
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function MenuBtn({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative overflow-hidden group ${
        active 
        ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20 font-black" 
        : "text-slate-500 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-900"
      }`}
    >
      <span className="text-xl z-10 group-hover:scale-125 transition-transform">{icon}</span>
      <span className="hidden lg:block text-sm z-10 tracking-tight">{label}</span>
      {active && <motion.div layoutId="nav-bg" className="absolute inset-0 bg-yellow-400" transition={{ type: "spring", duration: 0.5 }} />}
    </button>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-[2.5rem] shadow-sm group">
      <span className="text-3xl mb-4 block group-hover:rotate-12 transition-transform">{icon}</span>
      <h3 className="text-4xl font-black tracking-tighter">{value}</h3>
      <p className="text-slate-400 dark:text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-2">{label}</p>
    </motion.div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Total Users" value="12.5k" icon="👥" />
        <StatCard label="Live Revenue" value="$45.2k" icon="💵" />
        <StatCard label="Active Lives" value="24" icon="🔴" />
        <StatCard label="Coins Supply" value="1.2M" icon="🪙" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-slate-200 dark:border-zinc-800 h-80 flex flex-col justify-center items-center border-dashed">
          <p className="text-zinc-500 font-mono text-xs italic animate-pulse">[ Waiting for Analytics Stream Data ]</p>
        </div>
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-10 rounded-[3rem] text-black shadow-2xl relative overflow-hidden"
        >
          <h4 className="font-black text-2xl mb-2 italic tracking-tighter uppercase">Security Alert</h4>
          <p className="text-sm font-bold opacity-80 leading-tight italic">Unusual behavior detected on Admin Wallet. Please verify the last 10 transactions.</p>
          <button className="mt-10 bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">Verify Logs</button>
          <span className="absolute -bottom-10 -right-10 text-[10rem] opacity-10 rotate-12">🛡️</span>
        </motion.div>
      </div>
    </div>
  );
}

function FinancesTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-800 text-white relative overflow-hidden group shadow-2xl">
          <p className="text-[10px] font-black uppercase text-yellow-500 mb-2 tracking-widest">Platform Commissions</p>
          <h2 className="text-5xl font-black tracking-tighter">12.8k <span className="text-sm opacity-30 italic">coins</span></h2>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">💰</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-[2.5rem]">
          <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Total Minted Supply</p>
          <h2 className="text-3xl font-black italic underline decoration-yellow-400 decoration-4">500,000</h2>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-[2.5rem]">
          <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Total Coins Burned</p>
          <h2 className="text-3xl font-black text-red-500 italic">120,000</h2>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 flex justify-between items-center">
          <h3 className="font-black text-2xl tracking-tight">Pending Cashouts <span className="text-yellow-400 italic font-light ml-2">Action Required</span></h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase text-zinc-500 border-b border-slate-100 dark:border-zinc-800">
              <tr>
                <th className="p-8">User Profile</th>
                <th className="p-8">IBAN Destination</th>
                <th className="p-8 text-center">Amount ($)</th>
                <th className="p-8 text-right">Burn & Complete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
              {[1, 2, 3].map(i => (
                <tr key={i} className="hover:bg-yellow-400/5 transition-colors group">
                  <td className="p-8 font-bold group-hover:translate-x-2 transition-transform italic">User_Member_{i}42</td>
                  <td className="p-8 text-[10px] font-mono opacity-50 tracking-tighter">RO42BTRL000012345{i}22</td>
                  <td className="p-8 font-black text-green-500 text-xl tracking-tighter text-center">$450.00</td>
                  <td className="p-8 text-right">
                    <motion.button whileHover={{ scale: 1.05 }} className="bg-yellow-400 text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-yellow-400/20 italic">Process Withdrawal</motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ModerationTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-10 rounded-[3rem] shadow-xl">
         <h3 className="font-black text-red-500 text-2xl mb-8 flex items-center gap-3 tracking-tighter">🚩 Security Reports Queue</h3>
         <div className="space-y-4">
           {[1, 2, 3, 4].map(i => (
              <motion.div key={i} whileHover={{ x: 10 }} className="p-6 bg-slate-50 dark:bg-zinc-950 rounded-3xl border border-transparent hover:border-red-500/20 transition-all flex justify-between items-center group">
                 <div>
                    <p className="text-xs font-black text-zinc-500 uppercase italic">Category: #Harassment</p>
                    <p className="text-lg font-bold mt-1 group-hover:text-red-500 transition-colors">Offensive content reported in Live Chat</p>
                    <p className="text-[10px] opacity-40 mt-1 uppercase font-bold">Reported by 3 Users</p>
                 </div>
                 <button className="text-[10px] font-black text-red-500 uppercase underline decoration-red-500/30 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl transition-all">Review</button>
              </motion.div>
           ))}
         </div>
      </div>
    </div>
  );
}

function PlaceholderTab({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="p-32 text-center border-4 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[4rem] flex flex-col items-center gap-6">
      <span className="text-7xl animate-bounce">{icon}</span>
      <h3 className="text-3xl font-black tracking-tight">{label}</h3>
      <p className="text-slate-500 max-w-sm italic">Connecting Bunny.net API keys and Supabase database hooks for realtime administration.</p>
    </div>
  );
}
