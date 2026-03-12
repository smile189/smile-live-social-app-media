"use client";

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface MoneyProps {
  supabase: any;
}

export default function Money({ supabase }: MoneyProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userWallet, setUserWallet] = useState<{ coins: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, count: 0, platform_profit: 0 });
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // ECONOMY CONFIG (1 COIN = 0.01€ | 35% RETENTION)
  const [economy, setEconomy] = useState<any>({
    coin_to_euro: 0.01,
    platform_retention_percent: 35,
    vault_total_cap: 1000000,
    vault_emitted: 0
  });

  const [inputCoins, setInputCoins] = useState(0);

  // 1. FETCH INITIAL DATA
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Stripe Transactions
      const { data: stripeData } = await supabase
        .from("stripe_payments")
        .select(`*, profiles:user_id (username, avatar_url, full_name)`)
        .order("created_at", { ascending: false });
      
      if (stripeData) {
        setTransactions(stripeData);
        setStats(prev => ({
          ...prev,
          total: stripeData.reduce((acc: number, t: any) => acc + (t.amount || 0), 0),
          count: stripeData.length
        }));
      }

      // Economy Config
      const { data: ecoData } = await supabase.from('app_economy').select('*').single();
      if (ecoData) setEconomy(ecoData);

      // Profiles for Selection
      const { data: profiles } = await supabase.from('profiles').select('id, username, avatar_url');
      if (profiles) setUsers(profiles);
      
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  // 2. FETCH WALLET BALANCES (FIXED EFFECT ORDER)
  const fetchSelectedUserWallet = async (userId: string) => {
    const { data } = await supabase.from('wallets').select('coins_balance').eq('user_id', userId).single();
    if (data) setUserWallet({ coins: data.coins_balance });
  };

  useEffect(() => {
    if (selectedUser) {
      fetchSelectedUserWallet(selectedUser.id);
    } else {
      setUserWallet(null);
    }
  }, [selectedUser]);

  // CALCULATIONS
  const userPayoutPercent = 100 - economy.platform_retention_percent; 
  const totalInternalCapitalEUR = economy.vault_emitted * economy.coin_to_euro;
  const grossEuro = inputCoins * economy.coin_to_euro;
  const retentionEuro = grossEuro * (economy.platform_retention_percent / 100);
  const netEuro = grossEuro - retentionEuro;

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const saveEconomy = async () => {
    setSaving(true);
    const { error } = await supabase.from('app_economy').update(economy).eq('id', 1);
    setSaving(false);
    if (!error) showStatus("Vault constants synced", "success");
  };

  const handleFinalPayout = async () => {
    if (!selectedUser || inputCoins <= 0) return showStatus("Select account and amount", "error");
    if (!userWallet || inputCoins > userWallet.coins) return showStatus("Insufficient balance", "error");

    setLoading(true);
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ 
        coins_balance: userWallet.coins - inputCoins,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', selectedUser.id);

    if (walletError) {
      showStatus(walletError.message, "error");
    } else {
      setStats(prev => ({ ...prev, platform_profit: prev.platform_profit + retentionEuro }));
      showStatus(`Burned ${inputCoins} coins. Profit: €${retentionEuro.toFixed(2)}`, "success");
      setInputCoins(0);
      fetchSelectedUserWallet(selectedUser.id);
    }
    setLoading(false);
  };

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    doc.text("SMILE LIVE - Financial Report 2026", 14, 15);
    const tableRows = transactions.map(t => [
      new Date(t.created_at).toLocaleDateString(),
      t.profiles?.username || "Unknown",
      `€${t.amount}`,
      t.status.toUpperCase()
    ]);
   autoTable(doc, { head: [['Date', 'User', 'Amount', 'Status']], body: tableRows, startY: 25, theme: 'striped' });
    doc.save(`Smile_Audit_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1400px] mx-auto px-4 animate-in fade-in duration-500 font-sans text-zinc-900 dark:text-zinc-100">
      
      {statusMsg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-right ${statusMsg.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {statusMsg.text}
        </div>
      )}

      {/* 1. TOP STATUS - REAL TIME CAPITAL & REVENUE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden shadow-2xl font-mono italic">
        <div className="bg-white dark:bg-[#0c0c0e] p-4">
          <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">Exposure (EUR)</p>
          <p className="text-2xl font-black italic tracking-tighter tabular-nums leading-none">€{totalInternalCapitalEUR.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] p-4 border-l border-zinc-100 dark:border-zinc-800 text-zinc-400">
          <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1 italic">Issued Diamonds</p>
          <p className="text-2xl font-black italic tracking-tighter leading-none">{economy.vault_emitted.toLocaleString()} 💎</p>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] p-4 border-l border-zinc-100 dark:border-zinc-800 text-indigo-500">
          <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1 italic">Platform Revenue</p>
          <p className="text-2xl font-black italic tracking-tighter leading-none">€{stats.platform_profit.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] p-4 flex items-center justify-center border-l border-zinc-100 dark:border-zinc-800">
           <button onClick={saveEconomy} className="w-full h-full text-[9px] font-black uppercase italic bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded hover:bg-indigo-600 transition-all">
             {saving ? "Syncing..." : "Update Vault"}
           </button>
        </div>
      </div>

      {/* 2. ADMIN CONFIG TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm overflow-hidden mb-10 font-mono italic">
        <ConfigTile label="Retention % (35%)" value={economy.platform_retention_percent} onChange={(v:any) => setEconomy({...economy, platform_retention_percent: v})} />
        <ConfigTile label="Coin Base (€)" value={economy.coin_to_euro} step="0.001" onChange={(v:any) => setEconomy({...economy, coin_to_euro: v})} />
        <ConfigTile label="Manual Issued 💎" value={economy.vault_emitted} onChange={(v:any) => setEconomy({...economy, vault_emitted: v})} />
        <ConfigTile label="Vault Max Supply" value={economy.vault_total_cap} onChange={(v:any) => setEconomy({...economy, vault_total_cap: v})} />
      </div>

      {/* 3. TARGET USER SELECTION & DIRECT CASHOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl flex flex-col justify-center space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-indigo-500/20 overflow-hidden">
                {selectedUser?.avatar_url && <img src={selectedUser.avatar_url} className="w-full h-full object-cover" />}
             </div>
             <div className="flex-1">
                <span className="text-[8px] font-black uppercase text-zinc-400 font-mono italic block tracking-widest leading-none">Target Account</span>
                <select 
                  onChange={(e) => setSelectedUser(users.find(u => u.id === e.target.value))}
                  className="bg-transparent text-[11px] font-black outline-none w-full italic font-mono uppercase mt-1"
                >
                  <option value="">Select User...</option>
                  {users.map(u => <option key={u.id} value={u.id}>@{u.username}</option>)}
                </select>
             </div>
          </div>
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
             <span className="text-[8px] font-black uppercase text-indigo-400 font-mono italic block tracking-widest mb-1">Account Liquidity:</span>
             <span className="text-3xl font-mono font-black italic tracking-tighter tabular-nums italic">🪙 {userWallet?.coins ?? 0}</span>
          </div>
        </div>

        <div className="lg:col-span-2 p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/30 dark:bg-white/[0.02] relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl italic font-black text-emerald-500 uppercase tracking-tighter">Liquidate</div>
          <h4 className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-6 italic font-mono text-emerald-500 font-black tracking-widest">Manual Asset Liquidation</h4>
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 text-emerald-600">
              <label className="text-[7px] font-bold text-zinc-500 block mb-1 uppercase italic tracking-tighter">Coins to Burn</label>
              <input type="number" value={inputCoins} onChange={(e) => setInputCoins(Number(e.target.value))} className="bg-transparent text-4xl font-mono font-black outline-none w-full italic tracking-tighter italic" placeholder="0" />
            </div>
            <div className="text-right">
              <span className="text-[7px] block uppercase font-mono italic text-emerald-500 font-black tracking-widest leading-none">Net EUR Payout</span>
              <span className="text-4xl font-mono font-black italic tracking-tighter leading-none italic tabular-nums italic">€{netEuro.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between text-[8px] font-mono text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3 uppercase font-bold italic tracking-tighter">
              <span>Gross: €{grossEuro.toFixed(2)}</span>
              <span className="text-indigo-500 font-black">Retention Profit ({economy.platform_retention_percent}%): +€{retentionEuro.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleFinalPayout}
            className="w-full mt-6 py-3 bg-emerald-600 text-white rounded text-[10px] font-black uppercase italic tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all"
          >
            Execute Liquidation & Issue Credit
          </button>
        </div>
      </div>

      {/* 4. KPI GRID (ORIGINAL) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Fiat Gross" value={`€${stats.total.toLocaleString()}`} />
        <StatCard label="Internal Exposure" value={`€${totalInternalCapitalEUR.toLocaleString()}`} />
        <StatCard label="Platform Revenue" value={`€${stats.platform_profit.toFixed(2)}`} />
      </div>

      {/* 5. STRIPE LEDGER (ORIGINAL) */}
      <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase italic tracking-widest font-mono italic font-bold">
          Platform Activity Ledger
          <button onClick={handleExportPDF} className="text-[8px] bg-zinc-900 px-2 py-1 rounded text-white italic font-black">Generate Audit PDF</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 text-[8px] font-black text-zinc-500 uppercase tracking-widest font-mono italic font-bold">
                <th className="px-6 py-4 uppercase italic">User Identity</th>
                <th className="px-6 py-4 text-center uppercase italic">Gross Amount</th>
                <th className="px-6 py-4 uppercase italic">Status</th>
                <th className="px-6 py-4 text-right uppercase italic tracking-tighter">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-indigo-500/5 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-2">
                    <span className="text-[11px] font-mono font-black italic tracking-tighter">@{t.profiles?.username}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-black font-mono italic tracking-tighter tabular-nums text-center italic">€{t.amount}</td>
                  <td className="px-6 py-4"><span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 italic font-black">{t.status}</span></td>
                  <td className="px-6 py-4 text-right text-[9px] font-mono text-zinc-500 italic tracking-tighter italic uppercase leading-none">{t.id?.slice(-8)} ↗</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// SUPPORT COMPONENTS
function ConfigTile({ label, value, onChange, step = "1" }: any) {
  return (
    <div className="bg-white dark:bg-[#0c0c0e] p-3 flex flex-col gap-1 border-r last:border-0 border-zinc-100 dark:border-zinc-800 group transition-all leading-none">
      <label className="text-[7px] font-black text-zinc-400 uppercase tracking-widest font-mono italic font-bold leading-none">{label}</label>
      <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="bg-transparent text-[11px] font-mono font-black outline-none text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors italic tracking-tighter tabular-nums leading-none" />
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 p-6 rounded shadow-sm relative overflow-hidden group font-mono italic">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic font-bold leading-none">{label}</p>
      <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-2 tracking-tighter italic leading-none tabular-nums italic">{value}</p>
    </div>
  );
}
