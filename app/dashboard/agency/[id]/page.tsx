"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { SettingsTab } from "../../../../components/SettingsAgencyDash"; // saeet
import { AgencyTeam } from "../../../../components/AgencyTeam"; //agerncy team component 
import { Settings } from "lucide-react";

import { 
  LayoutDashboard,
  Users,
  Coins,
  Settings as SettingsIcon,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Bell,
  ChevronRight,
  Activity,
  Wallet,
  Globe,
  CreditCard,
  Menu,
  X,
  Sun,
  Moon,
  Send,
  LogOut,
  Copy,
  Check
} from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- COMPONENTĂ HELPER:  ---
const StripeCard = ({ label, value, icon, trend }: any) => (
  <div className="bg-white dark:bg-[#121214] border border-[#E3E8EE] dark:border-zinc-800 p-6 rounded-2xl shadow-sm transition-all hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-[#F6F9FC] dark:bg-zinc-900 rounded-lg text-[#635BFF]">{icon}</div>
      {trend && <span className="text-[9px] font-bold text-[#00CA72] bg-[#E1F8EB] dark:bg-emerald-500/10 px-2 py-1 rounded uppercase tracking-tighter">{trend}</span>}
    </div>
    <p className="text-[10px] font-bold text-[#697386] uppercase tracking-widest mb-1 italic leading-none">{label}</p>
    <h3 className="text-2xl font-black dark:text-white italic tracking-tighter uppercase leading-none">{value}</h3>
  </div>
);

// --- TAB 1: OVERVIEW ---
const OverviewTab = ({ agency, metrics }: any) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      <StripeCard label="Gross Revenue" value={`$${agency.total_revenue || 0}`} trend="+4.2%" icon={<CreditCard size={18} />} />
      <StripeCard label="Network Coins" value={metrics.coins.toLocaleString()} icon={<Wallet size={18} />} />
      <StripeCard label="Active Talents" value={agency.streamers?.length || 0} icon={<Users size={18} />} />
    </div>
    
    <div className="bg-white dark:bg-[#121214] rounded-xl border border-[#E3E8EE] dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#E3E8EE] dark:border-zinc-800 flex justify-between items-center bg-[#F8FAFC] dark:bg-zinc-900/50">
        <h3 className="font-bold text-sm uppercase italic tracking-tight flex items-center gap-2 dark:text-white">
          <Activity size={16} className="text-[#635BFF]" /> Live Talent Monitor
        </h3>
      </div>
      <div className="divide-y divide-[#E3E8EE] dark:divide-zinc-800 overflow-x-auto">
        {agency.streamers?.map((s: any) => (
          <div key={s.id} className="p-4 flex items-center justify-between hover:bg-[#F6F9FC] dark:hover:bg-zinc-900 transition-colors group min-w-[400px] sm:min-w-0">
            <div className="flex items-center gap-4">
              <img src={s.avatar_url || `https://avatar.vercel.sh{s.username}`} className="w-10 h-10 rounded-full border border-[#E3E8EE] dark:border-zinc-800 object-cover" />
              <div>
                <p className="text-sm font-bold dark:text-white uppercase italic leading-tight">{s.username}</p>
                <p className="text-[10px] text-[#697386] font-medium uppercase tracking-tighter italic">UID: {s.id.slice(0,8)}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:block text-right">
                <p className="text-[10px] font-bold text-[#697386] uppercase italic leading-none">Balance</p>
                <p className="text-xs font-bold dark:text-zinc-300">{s.wallet?.coins_balance || 0} COINS</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase italic tracking-widest ${s.is_live ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-gray-50 text-gray-400 dark:bg-zinc-800'}`}>
                {s.is_live ? '● RUN' : 'Offline'}
              </div>
              <ChevronRight size={18} className="text-[#E3E8EE] group-hover:text-[#635BFF]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- TAB 2: FINANCIALS ---
const FinancialsTab = ({ agency, refresh }: any) => {
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState("");
  const [txLoading, setTxLoading] = useState(false);

  const handleTransfer = async () => {
    if (!targetId || !amount) return;
    setTxLoading(true);
    const { error } = await supabase.rpc('transfer_agency_coins', {
      p_from_agency_id: agency.id,
      p_to_user_id: targetId,
      p_amount: parseInt(amount)
    });
    if (!error) { alert("Transfer Successful"); refresh(); }
    setTxLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
      <div className="bg-white dark:bg-[#121214] border border-[#E3E8EE] dark:border-zinc-800 p-8 rounded-2xl shadow-sm">
        <h4 className="text-sm font-black uppercase italic mb-6 dark:text-white flex items-center gap-2">
          <Send size={16} className="text-[#635BFF]" /> Coin Distribution
        </h4>
        <div className="space-y-4">
          <select 
            className="w-full bg-[#F6F9FC] dark:bg-zinc-900 border border-[#E3E8EE] dark:border-zinc-800 p-3 rounded-xl text-sm outline-none dark:text-white"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          >
            <option value="">Select Talent Recipient</option>
            {agency.streamers?.map((s: any) => (
              <option key={s.id} value={s.id}>{s.username.toUpperCase()} (Bal: {s.wallet?.coins_balance})</option>
            ))}
          </select>
          <input 
            type="number" 
            placeholder="Amount of Coins" 
            className="w-full bg-[#F6F9FC] dark:bg-zinc-900 border border-[#E3E8EE] dark:border-zinc-800 p-3 rounded-xl text-sm outline-none dark:text-white"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button 
            onClick={handleTransfer}
            disabled={txLoading}
            className="w-full bg-[#635BFF] text-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-[#5851E0] disabled:opacity-50 transition-all"
          >
            {txLoading ? "Processing..." : "Transfer Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
export default function AgencyStripeDashboard() {
  const params = useParams();
  const router = useRouter();
  const agencyId = params.id as string;

  const [activeTab, setActiveTab] = useState("overview");
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/login"); return; }
      
      const { data, error } = await supabase
        .from("agencies")
        .select(`*, owner:owner_id (*), streamers:profiles!agency_id (*, wallet:wallets(coins_balance))`)
        .eq("id", agencyId)
        .single();

      if (!error) setAgency(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [agencyId, router]);

  useEffect(() => { if (agencyId) loadData(); }, [agencyId, loadData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("login");
  };

  const copyId = () => {
    navigator.clipboard.writeText(agencyId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metrics = useMemo(() => ({
    coins: agency?.streamers?.reduce((acc: any, s: any) => acc + (s.wallet?.coins_balance || 0), 0) || 0
  }), [agency]);

  if (loading) return <div className="h-screen bg-[#F6F9FC] dark:bg-[#09090B] flex items-center justify-center"><RefreshCw className="animate-spin text-[#635BFF]" /></div>;

  const NavItems = () => (
    <nav className="flex-1 p-4 space-y-1">
      <NavItem active={activeTab === "overview"} onClick={() => {setActiveTab("overview"); setIsMobileMenuOpen(false)}} icon={<LayoutDashboard size={18} />} label="Overview" />
      <NavItem active={activeTab === "talents"} onClick={() => {setActiveTab("talents"); setIsMobileMenuOpen(false)}} icon={<Users size={18} />} label="Team" />
      <NavItem active={activeTab === "wallet"} onClick={() => {setActiveTab("wallet"); setIsMobileMenuOpen(false)}} icon={<Coins size={18} />} label="Financials" />
      <NavItem active={activeTab === "settings"} onClick={() => {setActiveTab("settings"); setIsMobileMenuOpen(false)}} icon={<Settings size={18} />} label="Settings" />
    </nav>
  );

  return (
    <div className={`flex h-screen ${isDark ? 'dark bg-[#09090B]' : 'bg-[#F6F9FC]'} text-[#1A1F36] transition-colors duration-300 overflow-hidden`}>
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-[#0C0C0E] border-r border-[#E3E8EE] dark:border-zinc-800 flex-col z-30">
        <div className="p-6 flex items-center gap-3 border-b border-[#E3E8EE] dark:border-zinc-800">
          
          <span className="font-bold text-lg dark:text-white italic tracking-tighter uppercase">dashboard </span>
        </div>
        <NavItems />
        <div className="p-4 space-y-2 border-t border-[#E3E8EE] dark:border-zinc-800">
          <button onClick={() => setIsDark(!isDark)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#F6F9FC] dark:bg-zinc-900 border border-[#E3E8EE] dark:border-zinc-800 text-[10px] font-black uppercase italic dark:text-white transition-all">
            {isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-[#635BFF]" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 text-[10px] font-black uppercase italic border border-rose-100 dark:border-rose-500/20 transition-all hover:bg-rose-100 hover:text-rose-700">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MOBILE SIDEBAR --- */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <aside className={`absolute top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#0C0C0E] transition-transform duration-300 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 flex justify-between items-center border-b dark:border-zinc-800">
             <div className="flex items-center gap-2"><Globe className="text-[#635BFF]" size={20} /><span className="font-black italic uppercase dark:text-white tracking-tighter">dashboard</span></div>
             <button onClick={() => setIsMobileMenuOpen(false)} className="dark:text-white"><X size={24} /></button>
          </div>
          <NavItems />
          <div className="p-4 mt-auto border-t dark:border-zinc-800 space-y-2">
             <button onClick={() => setIsDark(!isDark)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#F6F9FC] dark:bg-zinc-900 text-[10px] font-black uppercase italic dark:text-white">
               {isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-[#635BFF]" />} Mode
             </button>
             <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 text-[10px] font-black uppercase italic">
               <LogOut size={16} /> Logout
             </button>
          </div>
        </aside>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto relative dark:bg-[#09090B]">
        <header className="h-16 bg-white dark:bg-[#0C0C0E] border-b border-[#E3E8EE] dark:border-zinc-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden dark:text-white p-2" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
            <h2 className="text-sm font-black text-[#635BFF] uppercase italic tracking-tighter truncate max-w-[150px] sm:max-w-none">{agency.name}</h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#F6F9FC] dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg">
               <span className="text-[9px] font-black text-zinc-400 uppercase leading-none">AGENCY SMILE:</span>
               <code className="text-[10px] font-mono font-bold dark:text-zinc-300 leading-none">{agencyId.slice(0, 12)}...</code>
               <button onClick={copyId} className="text-zinc-400 hover:text-[#635BFF] transition-colors">
                 {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
               </button>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">run</div>
          </div>
        </header>

        <div className="p-4 lg:p-10 max-w-6xl mx-auto space-y-8">
          <div>
            <p className="text-[10px] font-bold text-[#635BFF] uppercase tracking-widest mb-1 italic leading-none">System Terminal / {activeTab}</p>
            <h1 className="text-3xl font-black dark:text-white italic tracking-tighter uppercase leading-none">{activeTab}</h1>
          </div>

          <div className="transition-all duration-500">
            {activeTab === "overview" && <OverviewTab agency={agency} metrics={metrics} />}
            {activeTab === "wallet" && <FinancialsTab agency={agency} refresh={loadData} />}
             {activeTab === "team" && agency?.id && (
    <AgencyTeam agencyId={agency.id} refresh={loadData} />
  )}
  
            {activeTab === "settings" && <SettingsTab agency={agency} refresh={loadData} />}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- NAV ITEM COMPONENT ---
function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? "bg-[#635BFF] text-white shadow-lg shadow-indigo-500/20 scale-[1.02]" : "text-[#697386] hover:bg-[#F6F9FC] dark:hover:bg-zinc-900"}`}>
      <span className={active ? "text-white" : "text-[#635BFF]"}>{icon}</span>
      <span className="text-[11px] font-bold uppercase italic tracking-wider leading-none">{label}</span>
    </button>
  );
}
