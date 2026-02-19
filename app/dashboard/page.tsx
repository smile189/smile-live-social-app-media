/**
 * dashboard/page.tsx - Main dashboard page for super admins, showing real-time stats and management tools.
 * Authored by BM, this page serves as the central hub for super admins to monitor and manage the Smile Live app ecosystem. 
 * It features a sidebar navigation for different management sections (Overview, Users, Content, Finances, Moderation),
 *  a top bar with profile and logout options, and a main content area that dynamically updates based on the selected section. 
 * The dashboard integrates with Supabase to fetch real-time data on users, live streams, revenue, and more, providing super admins with actionable 
 * insights and controls to effectively oversee the platform.
 * The design emphasizes a clean, modern aesthetic with a focus on usability and quick access to key metrics and actions, 
 * making it an essential tool for super admins to maintain the health and growth of the Smile Live community.
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';

import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import Chat from "./chatsupport/Chat";
import FinancesTab from "./finances/FinancesTab"; // Import real FinancesTab component
import GiftsTab from "./gifts/Gifts"; // Import real GiftsTab component
import Money from "./money/Money"; // Import real Money component
import ModerateSmile from './moderate/ModerateSmile'; 

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type NavItemType =
  | "overview"
  | "money"
  | "users"
  | "content"
  | "finances"
  | "moderation"
  | "gifts"
  | "chat";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavItemType>("overview");
  const [darkMode, setDarkMode] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const version = "1.13.180226";

  // --- Load dark mode preference ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode") !== "false";
      setDarkMode(saved);
    }
  }, []);

  // --- Apply dark mode ---
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  // --- Fetch current admin ---
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/dashboard/admin");
      else setUserEmail(user.email ?? null);
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/dashboard/admin");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030303] text-slate-900 dark:text-zinc-300 flex font-sans perspective-[2000px] overflow-hidden">
      
      {/* SIDEBAR RESPONSIVE & WOW */}
      <aside className={`
        fixed top-0 left-0 h-full z-[100] transition-all duration-500 ease-out
        ${isMobileMenuOpen ? "w-72 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-64"}
        bg-white/80 dark:bg-zinc-950/50 backdrop-blur-2xl border-r border-slate-200 dark:border-zinc-800/50 flex flex-col shadow-2xl
      `}>
        <div className="p-6 border-b border-slate-100 dark:border-zinc-900/50">
          <div className="flex items-center gap-3 group">
<motion.div 
  animate={{ rotateY: [0, 360] }} 
  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
  className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-amber-500/20"
>
  <img 
    src="logosmile.jpeg" 
    alt="Logo" 
    className="w-full h-full object-cover"
  />
</motion.div>

            <div className="flex flex-col">
              <h2 className="font-black text-xs tracking-[0.2em] uppercase dark:text-white leading-none">
                SMILE<span className="text-amber-500 italic">LIVEAPP.com</span>
              </h2>
              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter italic">
                DASHBOARD v{version}
              </span>
            </div>
          </div>
        </div>
 
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {[
            { icon: "📊", label: "Overview", key: "overview" },
            { icon: "📈", label: "Money", key: "money" },
            { icon: "👥", label: "Users List", key: "users" },
            { icon: "🎬", label: "Content Hub", key: "content" },
            { icon: "💰", label: "Financials", key: "finances" },
            { icon: "🎁", label: "Gifts System", key: "gifts" },
            { icon: "🚩", label: "Moderation", key: "moderation" },
            { icon: "💬", label: "Live Support", key: "chat" }, 
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => { setActiveTab(item.key as NavItemType); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative ${
                activeTab === item.key 
                ? "bg-amber-500/10 text-amber-500" 
                : "text-slate-500 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-900/40"
              }`}
            >
              {activeTab === item.key && (
                <motion.div layoutId="nav_active" className="absolute inset-0 border border-amber-500/20 bg-amber-500/5 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.05)]" />
              )}
              <span className="text-xl z-10">{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.1em] z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="p-4 bg-slate-50/50 dark:bg-black/20 border-t border-slate-100 dark:border-zinc-900 space-y-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-slate-400 hover:text-amber-500 transition-colors"
          >
            <span className="text-sm">{darkMode ? "☀️" : "🌙"}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Theme Mode</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 group"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse group-hover:scale-150 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">LOG OUT</span>
          </button>
        </div>
      </aside>

      {/* MAIN PANEL */}
      <main className="flex-1 lg:ml-64 relative h-screen overflow-y-auto scroll-smooth">
        
        {/* MOBILE HEADER - Apare doar sub lg */}
        <div className="lg:hidden p-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl z-[90] border-b border-slate-200 dark:border-zinc-800">
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-2xl">☰</button>
           <h2 className="text-xs font-black uppercase tracking-widest italic">DASHBOARD <span className="text-amber-500">Smile</span></h2>
           
        </div>

        <div className="p-6 lg:p-12">
          {/* TOP BAR WOW */}
          <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <motion.div 
              initial={{ rotateX: 20, opacity: 0 }} 
              animate={{ rotateX: 0, opacity: 1 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="w-8 h-[1px] bg-amber-500/40" />
              
              </div>
              <h1 className="text-4xl lg:text-7xl font-black tracking-tighter uppercase italic leading-none text-slate-900 dark:text-white underline decoration-amber-500 decoration-[10px] underline-offset-[2px]">
                {activeTab} <span className="font-thin not-italic opacity-20">/</span>
              </h1>
            </motion.div>

            {/* PROFILE BOX - 3D LIFT */}
            <motion.div 
              whileHover={{ rotateY: -10, rotateX: 10, scale: 1.02 }}
              className="flex items-center gap-4 bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200 dark:border-zinc-800/80 p-2 pr-6 rounded-2xl shadow-2xl shadow-black/5"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-black font-black text-sm">{userEmail?.charAt(0).toUpperCase() || "A"}</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black dark:text-white uppercase tracking-tight">{userEmail?.split('@')[0] || "Admin"}</span>
                <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                 
                </span>
              </div>
            </motion.div>
          </header>

          {/* CONTENT ENGINE - 3D TRANSITION */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, rotateY: 15, translateZ: -100 }}
                animate={{ opacity: 1, rotateY: 0, translateZ: 0 }}
                exit={{ opacity: 0, rotateY: -15, translateZ: -100 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 120, damping: 20 }}
                className="w-full"
              >
                {activeTab === "overview" && <OverviewTab />}
                {activeTab === "money" && <Money supabase={supabase} />}

                {activeTab === "users" && <UsersTab />}
                {activeTab === "content" && <BlankTab name="Posts & Video Content" />}
                {activeTab === "finances" && <FinancesTab />}
                {activeTab === "gifts" && <GiftsTab />}
                {activeTab === "moderation" && <ModerateSmile />}
                {activeTab === "chat" && <Chat />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[95] lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- COMPONENTS ---
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
      {active && (
        <motion.div
          layoutId="nav-bg"
          className="absolute inset-0 bg-yellow-400"
          transition={{ type: "spring", duration: 0.5 }}
        />
      )}
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
/**
 *  overview tAB DASHBOARD - display key performance indicators (KPIs) such as total users,
 *  live revenue, active lives, and coins supply.
 * @returns 
 * 
 */


export function OverviewTab() {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [liveRevenue, setLiveRevenue] = useState<number>(0);
  const [activeLives, setActiveLives] = useState<number>(0);
  const [coinsSupply, setCoinsSupply] = useState<number>(0);
  const [topHolders, setTopHolders] = useState<any[]>([]);
  const [recentTrans, setRecentTrans] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [notifications, setNotifications] = useState<{id: number, msg: string, type: 'info' | 'success'}[]>([]);

  const addNotify = (msg: string, type: 'info' | 'success' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [{id, msg, type}, ...prev].slice(0, 3));
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  };

  const fetchStats = async () => {
    const [uCount, lCount, transData, walletsData] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("id", { count: "exact", head: true }),
      supabase.from("gift_transactions")
        .select("id, coins_amount, created_at, sender_id, profiles!gift_transactions_sender_id_fkey(username)")
        .order('created_at', { ascending: false })
        .limit(25),
      supabase.from("wallets")
        .select(`coins_balance, profiles(username)`)
        .gt('coins_balance', 0)
        .order('coins_balance', { ascending: false })
    ]);

    setTotalUsers(uCount.count ?? 0);
    setActiveLives(lCount.count ?? 0);
    
    if (transData.data) {
      setRecentTrans(transData.data);
      setLiveRevenue(transData.data.reduce((a, b) => a + (b.coins_amount ?? 0), 0));
    }
    
    if (walletsData.data) {
      setCoinsSupply(walletsData.data.reduce((a, b) => a + (b.coins_balance ?? 0), 0));
      setTopHolders(walletsData.data.map(w => ({
        name: (w.profiles as any)?.username || "User",
        value: w.coins_balance
      })));
    }
  };

  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel('admin_realtime_v2')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gift_transactions' },
        async (payload) => {
          // Fetch rapid pentru username deoarece Realtime nu trimite relații (joins)
          const { data: user } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', payload.new.sender_id)
            .single();

          const enriched = {
            ...payload.new,
            profiles: { username: user?.username || 'User' }
          };

          setRecentTrans(prev => [enriched, ...prev].slice(0, 25));
          setLiveRevenue(prev => prev + (payload.new.coins_amount || 0));
          
          if (payload.new.coins_amount > 500) {
            addNotify(`High Volume: +${payload.new.coins_amount} 🪙 de la @${user?.username}`, 'info');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wallets' },
        () => {
          // Update top holders instant când se schimbă balanțele
          fetchStats();
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  const metrics = useMemo(() => {
    const last24h = recentTrans.filter(t => new Date(t.created_at) > new Date(Date.now() - 86400000));
    const vol24h = last24h.reduce((a, b) => a + (b.coins_amount || 0), 0);
    return {
      vol24h,
      velocity: coinsSupply > 0 ? ((vol24h / coinsSupply) * 100).toFixed(2) : "0.00"
    };
  }, [recentTrans, coinsSupply]);

  const exportCSV = () => {
    setIsExporting(true);
    const csv = ["Username,Balance", ...topHolders.map(h => `@${h.name},${h.value}`)].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `smile_analytics.csv`;
    link.click();
    setIsExporting(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 py-6 px-4 relative animate-in fade-in duration-700">
      {/* NOTIFICATIONS */}
      <div className="fixed top-6 right-6 z-[100] space-y-3 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`pointer-events-auto px-4 py-3 rounded-xl border shadow-2xl animate-in slide-in-from-right-10 duration-500 flex items-center gap-3 ${
            n.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-zinc-950 border-zinc-800 text-indigo-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${n.type === 'success' ? 'bg-white' : 'bg-indigo-500 animate-pulse'}`} />
            <span className="text-[10px] font-black uppercase tracking-tight">{n.msg}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <KPIBox 
    label="Total Users platform"  value={`${totalUsers.toLocaleString()} 👤`} />
        <KPIBox label="Net Revenue " value={`${liveRevenue.toLocaleString()} 🪙`} highlight />
         <KPIBox    label="Live Creators"   value={`${activeLives} 🎥`}  />
          <KPIBox  label="Total Golden Coins supply" value={`${coinsSupply.toLocaleString()} 🪙`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col h-[600px] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
             <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live Gift Transfer</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {recentTrans.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-4 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-top-1">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-zinc-400">{new Date(t.created_at).toLocaleTimeString()}</span>
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 italic">@{t.profiles?.username || 'User'}</span>
                </div>
                <span className="font-mono font-black text-indigo-600">+{t.coins_amount} 🪙</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl h-[600px] flex flex-col shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Asset Concentration</h3>
            <button onClick={exportCSV} className="text-[10px] font-bold uppercase border px-3 py-1.5 rounded-lg hover:bg-zinc-50">Export CSV</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                {topHolders.map((holder, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4 text-zinc-400">#{(i+1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-4 font-bold uppercase italic">@{holder.name}</td>
                    <td className="px-6 py-4 text-right font-black text-indigo-600">{holder.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPIBox({ label, value, highlight = false }: { label: string, value: any, highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border ${highlight ? 'bg-amber-500 border-amber-400 shadow-lg shadow-amber-500/20' : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'}`}>
      <p className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-amber-950' : 'text-zinc-400'}`}>{label}</p>
      <p className={`text-2xl font-black mt-1 ${highlight ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>{value}</p>
    </div>
  );
}


/**
 * user tab -display a paginated list of users with search functionality, 
 * fetching data from Supabase and auto-refreshing every 30 seconds for real-time updates.
 * @returns 
 */

export function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [userToDelete, setUserToDelete] = useState<any>(null); // Pentru Reconfirmare Ștergere
  const itemsPerPage = 10;

  const fetchUsers = async (silent = false) => {
    if (!silent) setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, username, full_name, role, updated_at, avatar_url, bio")
      .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
      .order("updated_at", { ascending: false })
      .range(page * itemsPerPage, (page + 1) * itemsPerPage - 1);

    if (data) setUsers(data);
    setLoading(false);
  };

  const handleSave = async (userId: string, field: string) => {
    const { error } = await supabase.from("profiles").update({ [field]: tempValue }).eq("id", userId);
    if (!error) setUsers(users.map(u => u.id === userId ? { ...u, [field]: tempValue } : u));
    setEditingCell(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const { error } = await supabase.from("profiles").delete().eq("id", userToDelete.id);
    if (!error) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(t);
  }, [page, searchTerm]);

  return (
    <div className="max-w-[1300px] mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center px-4 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Users management </h2>
         
          </div>
        </div>
        
        <div className="relative group">
          <input
            type="text"
            placeholder="Search credentials..."
            className="w-full md:w-80 pl-10 pr-4 py-2.5 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-[11px] font-medium outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all shadow-inner"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-3.5 top-3 text-zinc-500" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
      </div>

      {/* --- Data Table --- */}
      <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] overflow-hidden shadow-2xl shadow-indigo-500/5">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="bg-zinc-50/50 dark:bg-zinc-900/40">
            <tr className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/50">Identity & Bio</th>
              <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/50">Full Name</th>
              <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/50 text-center">Clearance</th>
              <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/50 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900/50">
            {users.map((user) => (
              <tr key={user.id} className="group hover:bg-indigo-500/[0.01] dark:hover:bg-indigo-500/[0.02] transition-colors">
                
                {/* --- Avatar & Identity --- */}
                <td className="px-6 py-5 align-top">
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="avatar" className="w-10 h-10 rounded-xl object-cover ring-2 ring-zinc-100 dark:ring-zinc-800 shadow-lg" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xs font-black text-indigo-500 border border-indigo-500/20 uppercase shadow-inner">
                          {user.username?.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1 min-w-[200px]">
                      {editingCell?.id === user.id && editingCell?.field === "username" ? (
                        <input autoFocus className="bg-transparent border-b border-indigo-500 text-xs font-bold text-zinc-900 dark:text-zinc-100 outline-none w-full" defaultValue={user.username} onBlur={() => setEditingCell(null)} onKeyDown={(e) => e.key === "Enter" && handleSave(user.id, "username")} onChange={(e) => setTempValue(e.target.value)} />
                      ) : (
                        <span onClick={() => { setEditingCell({ id: user.id, field: "username" }); setTempValue(user.username); }} className="text-xs font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer group-hover:text-indigo-500 transition-colors tracking-tight">@{user.username}</span>
                      )}
                      
                      {editingCell?.id === user.id && editingCell?.field === "bio" ? (
                        <textarea autoFocus className="bg-zinc-100 dark:bg-zinc-900/50 p-2 rounded-lg text-[10px] text-zinc-500 outline-none w-full resize-none border border-indigo-500/30" defaultValue={user.bio} rows={2} onBlur={() => setEditingCell(null)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSave(user.id, "bio")} onChange={(e) => setTempValue(e.target.value)} />
                      ) : (
                        <p onClick={() => { setEditingCell({ id: user.id, field: "bio" }); setTempValue(user.bio || ""); }} className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-relaxed cursor-pointer hover:text-zinc-300 transition-colors max-w-[250px] line-clamp-2">
                          {user.bio || <span className="italic opacity-30 tracking-tighter">No bio data recorded...</span>}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5 align-top font-medium">
                   {editingCell?.id === user.id && editingCell?.field === "full_name" ? (
                    <input autoFocus className="bg-transparent border-b border-purple-500 text-xs text-zinc-800 dark:text-zinc-200 outline-none w-full" defaultValue={user.full_name} onBlur={() => setEditingCell(null)} onKeyDown={(e) => e.key === "Enter" && handleSave(user.id, "full_name")} onChange={(e) => setTempValue(e.target.value)} />
                  ) : (
                    <span onClick={() => { setEditingCell({ id: user.id, field: "full_name" }); setTempValue(user.full_name || ""); }} className="text-xs text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-purple-500 transition-colors">
                      {user.full_name || <span className="opacity-10 tracking-[0.2em] font-black uppercase text-[8px]">Unassigned</span>}
                    </span>
                  )}
                </td>

                <td className="px-6 py-5 align-top text-center">
                  <select 
                    value={user.role}
                    onChange={async (e) => {
                      const val = e.target.value;
                      await supabase.from("profiles").update({ role: val }).eq("id", user.id);
                      setUsers(users.map(u => u.id === user.id ? { ...u, role: val } : u));
                    }}
                    className={`text-[9px] font-black tracking-widest px-3 py-1 rounded-lg border appearance-none cursor-pointer outline-none transition-all uppercase ${
                      user.role === 'admin' 
                      ? 'border-indigo-500/40 text-indigo-500 bg-indigo-500/5' 
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                    } hover:ring-1 hover:ring-indigo-500`}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Mod</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                {/* --- Actions & Delete --- */}
                <td className="px-6 py-5 align-top text-right">
                  <div className="flex flex-col items-end gap-3 group-hover:translate-x-[-4px] transition-transform">
                    <span className="text-[10px] font-bold font-mono text-zinc-500 tracking-tighter opacity-40">
                      {new Date(user.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                    <button 
                      onClick={() => setUserToDelete(user)}
                      className="p-2 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all border border-rose-500/20 opacity-0 group-hover:opacity-100"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Delete Confirmation Modal --- */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-950 border border-rose-500/30 p-8 rounded-[2.5rem] w-full max-w-sm shadow-[0_0_50px_rgba(244,63,94,0.1)] text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tight uppercase">Destroy Identity?</h3>
              <p className="text-xs text-zinc-500 mb-8 leading-relaxed italic">Are you sure you want to wipe <span className="text-rose-500 font-bold">@{userToDelete.username}</span> from the core database? This action is irreversible.</p>
              <div className="flex gap-3">
                <button onClick={() => setUserToDelete(null)} className="flex-1 py-3 text-[10px] font-black uppercase text-zinc-400 hover:text-white transition">Abort</button>
                <button onClick={handleDeleteUser} className="flex-1 py-3 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-95 transition-all">Confirm Wipe</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Pagination --- */}
      <div className="flex items-center justify-between px-2">

        <div className="flex gap-2">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-10 transition-all"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button>
          <button disabled={users.length < itemsPerPage} onClick={() => setPage(p => p + 1)} className="p-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl hover:shadow-indigo-500/20 disabled:opacity-10 transition-all"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
        </div>
      </div>
    </div>
  );
}

// --- BlankTab ---
function BlankTab({ name }: { name: string }) {
  return (
    <div className="p-12 bg-white dark:bg-zinc-900 rounded-3xl shadow-lg text-center text-gray-400 dark:text-gray-500 font-black">
      {name} — blank page ready for future content
    </div>
  );
}
