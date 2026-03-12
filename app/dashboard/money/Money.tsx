/**
 * 
 * SMILE LIVE - DASHBOARD - MONEY MANAGEMENT
 */

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
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  // ECONOMY CONFIG - SINCRONIZAT CU DB (ID: 1)
  const [economy, setEconomy] = useState<any>({
    coin_to_euro: 0,
    platform_retention_percent: 0,
    vault_total_cap: 0,
    vault_emitted: 0,
    platform_revenue: 0 
  });

  const [inputCoins, setInputCoins] = useState(0);

  // 1. FETCH INITIAL DATA
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Stripe Transactions
        const { data: stripeData } = await supabase
          .from("stripe_payments")
          .select(`*, profiles:user_id (username, avatar_url, full_name)`)
          .order("created_at", { ascending: false });
        
        if (stripeData) setTransactions(stripeData);

        // Economy Config - Citim rândul unic cu ID 1
        const { data: ecoData } = await supabase
          .from('app_economy')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        if (ecoData) {
          setEconomy({
            ...ecoData,
            platform_revenue: ecoData.platform_revenue ?? 0
          });
        }

        // Profiles for Selection
        const { data: profiles } = await supabase.from('profiles').select('id, username, avatar_url');
        if (profiles) setUsers(profiles);
      } catch (err) {
        console.error("Fetch error:", err);
      }
      
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  // 2. FETCH WALLET BALANCES
  const fetchSelectedUserWallet = async (userId: string) => {
    const { data } = await supabase.from('wallets').select('coins_balance').eq('user_id', userId).maybeSingle();
    if (data) setUserWallet({ coins: data.coins_balance });
  };

  useEffect(() => {
    if (selectedUser) fetchSelectedUserWallet(selectedUser.id);
    else setUserWallet(null);
  }, [selectedUser]);

  // CALCULATIONS (Design Stripe Style)
  const safeCoinToEuro = economy.coin_to_euro || 0;
  const safeRetention = economy.platform_retention_percent || 0;

  const grossEuro = inputCoins * safeCoinToEuro;
  const retentionEuro = grossEuro * (safeRetention / 100);
  const netEuro = grossEuro - retentionEuro;
  const totalInternalCapitalEUR = (economy.vault_emitted || 0) * safeCoinToEuro;

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // SALVARE PERMANENTĂ ÎN DB (UPSERT PE ID: 1)
  const saveEconomy = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('app_economy')
      .upsert({ ...economy, id: 1, updated_at: new Date().toISOString() })
      .select();

    setSaving(false);
    if (!error) showStatus("Vault constants synced", "success");
    else showStatus(`DB Error: ${error.message}`, "error");
  };

  // LOGICA DE PAYOUT CU ARDERE (BURN) DIN TOTAL ISSUED
  const handleFinalPayout = async () => {
    if (!selectedUser || inputCoins <= 0) return showStatus("Select account and amount", "error");
    if (!userWallet || inputCoins > userWallet.coins) return showStatus("Insufficient balance", "error");

    setLoading(true);

    // 1. Scădem din portofelul utilizatorului (User Burn)
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
      // 2. Audit in Liquidations Table
      await supabase.from('liquidations').insert({
        user_id: selectedUser.id,
        coins_burned: inputCoins,
        payout_net: netEuro,
        platform_profit: retentionEuro
      });

      // 3. ARDERE GLOBALĂ: Scădem din vault_emitted ȘI adunăm profitul în platform_revenue
      const newEmitted = (economy.vault_emitted || 0) - inputCoins;
      const newRevenue = (economy.platform_revenue || 0) + retentionEuro;

      const { error: ecoError } = await supabase
        .from('app_economy')
        .update({ 
          vault_emitted: newEmitted, 
          platform_revenue: newRevenue 
        })
        .eq('id', 1);

      if (!ecoError) {
        // Actualizăm starea locală pentru a reflecta arderea imediat pe UI
        setEconomy((prev: any) => ({ 
          ...prev, 
          vault_emitted: newEmitted, 
          platform_revenue: newRevenue 
        }));
        showStatus(`Burned ${inputCoins} globally. Profit: €${retentionEuro.toFixed(2)}`, "success");
      }
      
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
    
    autoTable(doc, { 
      head: [['Date', 'User', 'Amount', 'Status']], 
      body: tableRows, 
      startY: 25, 
      theme: 'striped' 
    });

    doc.save(`Smile_Audit_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1400px] mx-auto px-4 animate-in fade-in duration-500 font-sans text-zinc-900 dark:text-zinc-100">
      
      {statusMsg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-right ${statusMsg.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {statusMsg.text}
        </div>
      )}

      {/* 1. TOP STATUS - REAL TIME FROM DB */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden shadow-2xl font-mono italic">
        <div className="bg-white dark:bg-[#0c0c0e] p-4">
          <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">Exposure (EUR)</p>
          <p className="text-2xl font-black italic tracking-tighter tabular-nums leading-none">€{totalInternalCapitalEUR.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] p-4 border-l border-zinc-100 dark:border-zinc-800 text-zinc-400">
          <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1 italic">Issued Diamonds (Live Supply)</p>
          <p className="text-2xl font-black italic tracking-tighter leading-none">{(economy.vault_emitted || 0).toLocaleString()} 💎</p>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] p-4 border-l border-zinc-100 dark:border-zinc-800 text-indigo-500">
          <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1 italic">Platform Revenue</p>
          <p className="text-2xl font-black italic tracking-tighter leading-none">€{(economy.platform_revenue || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] p-4 flex items-center justify-center border-l border-zinc-100 dark:border-zinc-800">
           <button onClick={saveEconomy} className="w-full h-full text-[9px] font-black uppercase italic bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded hover:bg-indigo-600 transition-all">
             {saving ? "Syncing..." : "Update Vault Settings"}
           </button>
        </div>
      </div>

      {/* 2. ADMIN CONFIG TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm overflow-hidden mb-10 font-mono italic">
        <ConfigTile label={`Retention % (${economy.platform_retention_percent}%)`} value={economy.platform_retention_percent} onChange={(v:any) => setEconomy({...economy, platform_retention_percent: v})} />
        <ConfigTile label="Coin Base (€)" value={economy.coin_to_euro} step="0.001" onChange={(v:any) => setEconomy({...economy, coin_to_euro: v})} />
        <ConfigTile label="Manual Supply Adjust" value={economy.vault_emitted} onChange={(v:any) => setEconomy({...economy, vault_emitted: v})} />
        <ConfigTile label="Vault Max Supply" value={economy.vault_total_cap} onChange={(v:any) => setEconomy({...economy, vault_total_cap: v})} />
      </div>

      {/* 3. TARGET USER SELECTION & DIRECT CASHOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 p-6 rounded shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-zinc-400 italic">Select Beneficiary</h3>
          <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2">
            {users.map(u => (
              <button 
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full flex items-center gap-3 p-2 rounded transition-all ${selectedUser?.id === u.id ? 'bg-indigo-500 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <img src={u.avatar_url} className="w-6 h-6 rounded-full object-cover grayscale" />
                <span className="text-[11px] font-bold italic">{u.username}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-zinc-900 text-white p-8 rounded-xl shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2 italic">Burn & Cashout Processor</h2>
                  <p className="text-3xl font-black italic tracking-tighter">
                    {selectedUser ? selectedUser.username : "---"}
                  </p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-500 uppercase italic">User Balance</p>
                  <p className="text-2xl font-black italic tabular-nums text-emerald-400">{userWallet?.coins || 0} 💎</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div>
                  <label className="text-[9px] font-black uppercase text-zinc-500 block mb-4 italic">Amount to Burn</label>
                  <input 
                    type="number"
                    value={inputCoins}
                    onChange={(e) => setInputCoins(parseInt(e.target.value) || 0)}
                    className="bg-transparent border-b-2 border-zinc-800 text-5xl font-black w-full outline-none focus:border-indigo-500 transition-all italic tabular-nums"
                  />
               </div>
               <div className="space-y-4 bg-zinc-800/30 p-6 rounded-lg border border-zinc-800 font-mono text-[11px] italic">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Gross Value:</span>
                    <span>€{grossEuro.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span>Platform Fee ({economy.platform_retention_percent}%):</span>
                    <span>-€{retentionEuro.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-zinc-800 pt-4 flex justify-between text-xl font-black text-emerald-400 tracking-tighter">
                    <span>NET PAYOUT:</span>
                    <span>€{netEuro.toFixed(2)}</span>
                  </div>
               </div>
            </div>

            <button 
              onClick={handleFinalPayout}
              disabled={loading || !selectedUser || inputCoins <= 0}
              className="mt-10 w-full py-5 bg-indigo-600 hover:bg-white hover:text-black transition-all rounded-lg font-black uppercase italic tracking-widest text-[11px] disabled:opacity-20"
            >
              {loading ? "Processing..." : "Authorize Payout & Burn"}
            </button>
          </div>
        </div>
      </div>

      {/* 4. STRIPE INFLOW HISTORY */}
      <div className="pt-10 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] italic text-zinc-500">Stripe Inflow History</h3>
          <button onClick={handleExportPDF} className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-[9px] font-black uppercase hover:bg-zinc-900 hover:text-white transition-all italic">
            Download Audit PDF
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono italic text-[10px]">
             <thead>
                <tr className="text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="pb-4 font-black">DATE</th>
                  <th className="pb-4 font-black">USER</th>
                  <th className="pb-4 font-black">AMOUNT</th>
                  <th className="pb-4 font-black">STATUS</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {transactions.map((t, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-[#0c0c0e] transition-colors">
                    <td className="py-4 text-zinc-500">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="py-4 font-bold">{t.profiles?.username || "Guest"}</td>
                    <td className="py-4 font-black text-indigo-500">€{t.amount}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${t.status === 'succeeded' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                        {t.status}
                      </span>
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

// ConfigTile Component
function ConfigTile({ label, value, onChange, step = "1" }: any) {
  const displayValue = (value === undefined || value === null || isNaN(value)) ? 0 : value;

  return (
    <div className="bg-white dark:bg-[#0c0c0e] p-4">
      <p className="text-[8px] font-black uppercase mb-2 text-zinc-500 italic">{label}</p>
      <input 
        type="number" 
        step={step}
        value={displayValue} 
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          onChange(isNaN(val) ? 0 : val);
        }}
        className="bg-transparent text-xl font-black w-full outline-none focus:text-indigo-500 transition-colors italic tabular-nums"
      />
    </div>
  );
}
