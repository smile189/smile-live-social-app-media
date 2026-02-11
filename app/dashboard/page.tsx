"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

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
  | "gifts";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavItemType>("overview");
  const [darkMode, setDarkMode] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeLives, setActiveLives] = useState(0);
  const [coinsSupply, setCoinsSupply] = useState(0);

  // check logged-in user
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) router.push("dashboard/admin");
      else setUserEmail(user.email);
    };
    fetchUser();
  }, [darkMode]);

  // fetch overview stats
  useEffect(() => {
    const fetchStats = async () => {
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id");
      setTotalUsers(usersData?.length ?? 0);

      const { data: livesData } = await supabase
        .from("lives")
        .select("id")
        .eq("is_active", true);
      setActiveLives(livesData?.length ?? 0);

      const { data: coinsData } = await supabase
        .from("coins")
        .select("amount");
      const totalCoins = coinsData?.reduce((sum, c) => sum + (c.amount ?? 0), 0);
      setCoinsSupply(totalCoins ?? 0);
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("dashboard/admin");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-zinc-100 transition-colors duration-500 font-sans">
      {/* SIDEBAR */}
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
          <MenuBtn
            icon="📊"
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <MenuBtn
            icon="👥"
            label="Users"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <MenuBtn
            icon="🎬"
            label="Posts & Video"
            active={activeTab === "content"}
            onClick={() => setActiveTab("content")}
          />
          <MenuBtn
            icon="💰"
            label="Finances & Coins"
            active={activeTab === "finances"}
            onClick={() => setActiveTab("finances")}
          />
          <MenuBtn
            icon="🎁"
            label="Gifts Config"
            active={activeTab === "gifts"}
            onClick={() => setActiveTab("gifts")}
          />
          <MenuBtn
            icon="🚩"
            label="Moderation"
            active={activeTab === "moderation"}
            onClick={() => setActiveTab("moderation")}
          />
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
      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-12">
        {/* TOP BAR */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl lg:text-5xl font-black capitalize tracking-tighter underline decoration-yellow-400 decoration-4 underline-offset-8">
              {activeTab} <span className="text-yellow-400 font-light">Console</span>
            </h1>
            <p className="text-slate-500 dark:text-zinc-500 text-sm mt-4 font-medium tracking-wide">
              Smile Live Network Management Hub
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
            {activeTab === "overview" && (
              <OverviewTab totalUsers={totalUsers} activeLives={activeLives} coinsSupply={coinsSupply} />
            )}
            {activeTab === "users" && <UsersTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---
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

function OverviewTab({ totalUsers, activeLives, coinsSupply }: any) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Total Users" value={totalUsers} icon="👥" />
        <StatCard label="Active Lives" value={activeLives} icon="🔴" />
        <StatCard label="Coins Supply" value={coinsSupply} icon="🪙" />
        <StatCard label="Revenue" value="$45.2k" icon="💵" />
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, role, updated_at")
      .order("updated_at", { ascending: false });
    if (error) console.error("Error fetching users:", error.message);
    else setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) alert("Error deleting user: " + error.message);
    else setUsers(users.filter(u => u.id !== id));
  };

  if (loading) return <p className="italic text-gray-500">Loading users...</p>;
  if (!users.length) return <p className="italic text-gray-500">No users found.</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-yellow-400">User Directory</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-lg">
          <thead className="bg-slate-100 dark:bg-zinc-900">
            <tr>
              <th className="p-4 text-xs font-black uppercase border-b border-slate-200 dark:border-zinc-800">Username</th>
              <th className="p-4 text-xs font-black uppercase border-b border-slate-200 dark:border-zinc-800">Full Name</th>
              <th className="p-4 text-xs font-black uppercase border-b border-slate-200 dark:border-zinc-800">Role</th>
              <th className="p-4 text-xs font-black uppercase border-b border-slate-200 dark:border-zinc-800">Last Updated</th>
              <th className="p-4 text-xs font-black uppercase border-b border-slate-200 dark:border-zinc-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01, backgroundColor: "#fef3c7" }}
                transition={{ duration: 0.2 }}
                className="border-b border-slate-200 dark:border-zinc-800"
              >
                <td className="p-4 font-bold">{user.username}</td>
                <td className="p-4">{user.full_name ?? "-"}</td>
                <td className="p-4 uppercase font-black">{user.role ?? "user"}</td>
                <td className="p-4 text-xs italic">{user.updated_at ? new Date(user.updated_at).toLocaleString() : "-"}</td>
                <td className="p-4">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-[2.5rem] shadow-sm group"
    >
      <span className="text-3xl mb-4 block group-hover:rotate-12 transition-transform">{icon}</span>
      <h3 className="text-4xl font-black tracking-tighter">{value}</h3>
      <p className="text-slate-400 dark:text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-2">{label}</p>
    </motion.div>
  );
}
