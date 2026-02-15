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
        <div className="p-8 flex flex-col items-start gap-2">
          <span className="hidden lg:block font-black text-xl tracking-tighter italic uppercase">
            DASHBOARD <span className="text-yellow-400">SMILELIVE</span>
          </span>
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
              Smile Live -business administration <strong>Version {version}  </strong> 
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
            {activeTab === "finances" && <BlankTab name="Finances & Coins" />}
            {activeTab === "gifts" && <BlankTab name="Gifts Config" />}
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

// --- OverviewTab Real-Time ---
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
      // Total Users
      const { count } = await supabase.from("profiles").select("*", { count: "exact" });
      setTotalUsers(count ?? 0);

      // Live Revenue
      const { data: rev } = await supabase.from("gift_transactions").select("coins_amount, created_at");
      const revenueSum = rev?.reduce((a, b) => a + (b.coins_amount ?? 0), 0) ?? 0;
      setLiveRevenue(revenueSum);
      setRevenueData(rev?.map(r => ({ date: r.created_at?.slice(0,10), revenue: r.coins_amount })) ?? []);

      // Active Lives
      const { count: liveCount, data: livePosts } = await supabase.from("posts").select("id, created_at", { count: "exact" });
      setActiveLives(liveCount ?? 0);
      setActiveLivesData(livePosts?.map(p => ({ date: p.created_at?.slice(0,10), active: 1 })) ?? []);

      // Coins Supply
      const { data: coins } = await supabase.from("profiles").select("coins");
      const totalCoins = coins?.reduce((a,b) => a + (b.coins ?? 0),0) ?? 0;
      setCoinsSupply(totalCoins);
      setCoinsData(coins?.map((c,i) => ({ name: `User ${i+1}`, value: c.coins })) ?? []);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // every 60 sec
    return () => clearInterval(interval);
  }, []);

  const COLORS = ["#FFD700", "#FF6F61", "#6B5B95", "#88B04B", "#F7CAC9", "#92A8D1"];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Total Users" value={totalUsers} icon="👥" />
        <StatCard label="Live Revenue" value={liveRevenue} icon="💵" />
        <StatCard label="Active Lives" value={activeLives} icon="🔴" />
        <StatCard label="Coins Supply" value={coinsSupply} icon="🪙" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Line Chart */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-lg">
          <h3 className="font-black text-yellow-400 mb-4 text-center">Live Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Active Lives Bar Chart */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-lg">
          <h3 className="font-black text-yellow-400 mb-4 text-center">Active Lives</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activeLivesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="active" fill="#FF6F61" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Coins Pie Chart */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-lg">
          <h3 className="font-black text-yellow-400 mb-4 text-center">Coins Supply</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={coinsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                {coinsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
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
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const itemsPerPage = 15;

  // fetchUsers primește isSilent ca să nu arate loading-ul la auto-refresh
  const fetchUsers = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    
    const from = page * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
      .from("profiles")
      .select("id, username, full_name, role, updated_at");

    // Căutare în DB pe coloanele sigure
    if (searchTerm) {
      query = query.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Supabase Error:", error.message);
    } else {
      setUsers(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    // 1. Fetch inițial la schimbarea paginii sau search-ului
    fetchUsers();

    // 2. Refresh automat la 30 secunde (30000ms)
    const interval = setInterval(() => {
      fetchUsers(true); // isSilent = true
    }, 30000);

    return () => clearInterval(interval);
  }, [page, searchTerm]); 

  return (
    <div className="space-y-6">
      {/* Header cu Bara de Căutare - Responsive */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-yellow-400 uppercase tracking-tighter">User Database</h2>
          {loading && <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>}
        </div>
        
        <input
          type="text"
          placeholder="Search name or username..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          className="w-full md:w-80 px-4 py-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-yellow-400 transition shadow-inner"
        />
      </div>

      {loading && users.length === 0 ? (
        <p className="text-gray-500 italic text-center p-20 animate-pulse bg-zinc-900/10 rounded-2xl">
          Syncing users...
        </p>
      ) : (
        <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl bg-white dark:bg-zinc-950">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-slate-50 dark:bg-zinc-900">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase border-b border-slate-200 dark:border-zinc-800 text-zinc-500">ID</th>
                <th className="p-4 text-xs font-black uppercase border-b border-slate-200 dark:border-zinc-800">Username</th>
                <th className="p-4 text-xs font-black uppercase border-b border-slate-200 dark:border-zinc-800">Full Name</th>
                <th className="p-4 text-xs font-black uppercase border-b border-slate-200 dark:border-zinc-800">Role</th>
                <th className="p-4 text-xs font-black uppercase border-b border-slate-200 dark:border-zinc-800 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: "rgba(254, 243, 199, 0.2)" }}
                  className="transition-colors group"
                >
                  <td className="p-4 font-mono text-[9px] text-zinc-500 tracking-tighter uppercase">
                    {user.id.slice(0, 8)}...
                  </td>
                  <td className="p-4 font-bold text-yellow-600 dark:text-yellow-500">
                    @{user.username}
                  </td>
                  <td className="p-4 text-sm text-zinc-700 dark:text-zinc-300">
                    {user.full_name ?? <span className="opacity-30">—</span>}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black rounded border border-zinc-200 dark:border-zinc-700 uppercase">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-[10px] font-mono text-zinc-500 text-right">
                    {new Date(user.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Control Paginare */}
      <div className="flex justify-between items-center px-4 py-2">
        <button 
          disabled={page === 0} 
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-[10px] font-black border border-zinc-200 dark:border-zinc-800 disabled:opacity-20 hover:border-yellow-400 transition"
        >
          PREVIOUS
        </button>
        <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">
          Page {page + 1}
        </span>
        <button 
          disabled={users.length < itemsPerPage} 
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-[10px] font-black border border-zinc-200 dark:border-zinc-800 disabled:opacity-20 hover:border-yellow-400 transition"
        >
          NEXT
        </button>
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
