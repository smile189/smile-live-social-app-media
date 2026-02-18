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

import React, { useState, useEffect } from "react";
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

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type NavItemType =
  | "overview"
  | "users"
  | "content"
  | "finances"
  | "moderation"
  | "gifts"
  | "chat";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavItemType>("overview");
  const [darkMode, setDarkMode] = useState(true); // default true
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const version = "1.13.130226"; // Dashboard version for reference..0.13..13..

  // --- Load dark mode preference from localStorage on client ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode") === "true";
      setDarkMode(saved);
    }
  }, []);

  // --- Apply dark mode class and save preference ---
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  // --- fetch current admin user ---
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-zinc-100 transition-colors duration-500 font-sans flex">
      {/* SIDEBAR */}
      <aside className="fixed top-0 left-0 h-full w-20 lg:w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 z-50 flex flex-col transition-all shadow-2xl">
<div className="p-4 lg:p-6 flex lg:flex-col items-center justify-between lg:items-start border-b border-slate-100 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
  <div className="flex items-center gap-3">

    
    {/* Textul care se adaptează */}
    <div className="flex flex-col justify-center leading-none">
      <h2 className="font-black text-sm lg:text-lg tracking-tighter uppercase text-slate-900 dark:text-white italic">
        DASH<span className="text-yellow-500 underline decoration-yellow-500">BOARD</span>
      </h2>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
       smileliveapp.com <span className="text-indigo-400">v{version}</span>
      </span>
    </div>
  </div>


</div>


        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { icon: "📊", label: "Overview", key: "overview" },
            { icon: "👥", label: "Users", key: "users" },
            { icon: "🎬", label: "Posts & Video", key: "content" },
            { icon: "💰", label: "Finances & Coins", key: "finances" },
            { icon: "🎁", label: "Gifts Config", key: "gifts" },
            { icon: "🚩", label: "Moderation", key: "moderation" },
            { icon: "💬", label: "Chat Support", key: "chat" }, 

          ].map((item) => (
            <MenuBtn
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.key}
              onClick={() => setActiveTab(item.key as NavItemType)}
            />
          ))}
        </nav>

        <div className="p-6 border-t border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-zinc-900 hover:bg-yellow-400 hover:text-black transition-all group shadow-inner"
          >
            <span className="text-xl">{darkMode ? "☀️" : "🌙"}</span>
            <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-12 w-full">
        {/* TOP BAR */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl lg:text-5xl font-black capitalize tracking-tighter underline decoration-yellow-400 decoration-4 underline-offset-8">
              {activeTab} <span className="text-yellow-400 font-light">Console</span>
            </h1>
            <p className="text-slate-500 dark:text-zinc-500 text-sm mt-4 font-medium tracking-wide">
              Smile Live -business administration panel 
            </p>
          </motion.div>

          {/* PROFILE / LOGOUT */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 bg-yellow-400 text-black px-4 py-2 rounded-3xl font-black shadow-lg hover:scale-105 transition-transform relative overflow-hidden"
            >
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-yellow-400 text-lg font-extrabold shadow-inner">
                👑
              </span>
              <span className="truncate max-w-[120px]">{userEmail ?? "Admin"}</span>
              <motion.span animate={{ rotate: showProfileMenu ? 180 : 0 }} className="ml-auto text-sm font-black">
                ▼
              </motion.span>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute right-0 mt-3 w-44 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full text-left p-4 hover:bg-yellow-400 hover:text-black transition font-black text-sm rounded-t-xl"
                  >
                    Logout
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 px-4 py-2 italic">
                    Signed in as {userEmail}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* TABS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "content" && <BlankTab name="Posts & Video" />}
            {activeTab === "finances" && <FinancesTab />}
            {activeTab === "gifts" && <GiftsTab />}

             
              {activeTab === "moderation" && <BlankTab name="Moderation" />}
            {activeTab === "chat" && <Chat />}
          </motion.div>
        </AnimatePresence>
      </main>
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
function OverviewTab() {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [liveRevenue, setLiveRevenue] = useState<number>(0);
  const [activeLives, setActiveLives] = useState<number>(0);
  const [coinsSupply, setCoinsSupply] = useState<number>(0);

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [activeLivesData, setActiveLivesData] = useState<any[]>([]);
  const [coinsData, setCoinsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      // 1. Total Users
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      setTotalUsers(usersCount ?? 0);

      // 2. Live Revenue
      const { data: rev } = await supabase
        .from("gift_transactions")
        .select("coins_amount, created_at")
        .order('created_at', { ascending: true });
      
      const revenueSum = rev?.reduce((a, b) => a + (b.coins_amount ?? 0), 0) ?? 0;
      setLiveRevenue(revenueSum);
      setRevenueData(rev?.map(r => ({ date: r.created_at?.slice(5,10), revenue: r.coins_amount })) ?? []);

      // 3. Active Lives
      const { count: liveCount, data: livePosts } = await supabase
        .from("posts")
        .select("id, created_at", { count: "exact" });
      setActiveLives(liveCount ?? 0);
      setActiveLivesData(livePosts?.map(p => ({ date: p.created_at?.slice(5,10), active: 1 })) ?? []);

      // 4. Coins Supply - REPARAT PENTRU TYPESCRIPT BUILD
      const { data: wallets } = await supabase
        .from("wallets")
        .select(`coins_balance, profiles(username)`)
        .order('coins_balance', { ascending: false });

      if (wallets) {
        const total = wallets.reduce((a, b) => a + (b.coins_balance ?? 0), 0);
        setCoinsSupply(total);
        
        // REPARAT: Folosim casting (as any) pentru a preveni eroarea "Property username does not exist on type...[]"
        const formattedCoinsData = wallets.slice(0, 5).map(w => {
          const profile = w.profiles as any; // Trick pentru Vercel build
          return { 
            name: profile?.username || "User", 
            value: w.coins_balance 
          };
        });
        
        setCoinsData(formattedCoinsData);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const COLORS = ["#FFD700", "#FF6F61", "#6B5B95", "#88B04B", "#F7CAC9"];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users" value={totalUsers.toLocaleString()} icon="👥" />
        <StatCard label="Live Revenue" value={liveRevenue.toLocaleString()} icon="💰" />
        <StatCard label="Active Lives" value={activeLives} icon="🔴" />
        <StatCard label="Coins Supply" value={coinsSupply.toLocaleString()} icon="🪙" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-xl border border-zinc-100 dark:border-zinc-800">
          <h3 className="font-black text-yellow-400 text-xs uppercase tracking-widest mb-6 text-center">Revenue Flow</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis stroke="#444" fontSize={10} />
              <Tooltip contentStyle={{ borderRadius: '15px', backgroundColor: '#111', border: 'none' }} />
              <Line type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={4} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Active Lives Chart */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-xl border border-zinc-100 dark:border-zinc-800">
          <h3 className="font-black text-yellow-400 text-xs uppercase tracking-widest mb-6 text-center">Stream Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activeLivesData}>
              <XAxis dataKey="date" hide />
              <Tooltip cursor={{fill: '#222'}} contentStyle={{ borderRadius: '15px', backgroundColor: '#111', border: 'none' }} />
              <Bar dataKey="active" fill="#FF6F61" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Coins Distribution Chart */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-xl border border-zinc-100 dark:border-zinc-800">
          <h3 className="font-black text-yellow-400 text-xs uppercase tracking-widest mb-6 text-center">Top Balances</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={coinsData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5}>
                {coinsData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
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
