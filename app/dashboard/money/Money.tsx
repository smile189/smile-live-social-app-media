/**
 * SMILE LIVE - DASHBOARD - MONEY MANAGEMENT
 */

"use client";

import { useState, useEffect } from 'react';

interface MoneyProps {
  supabase: any;
}

export default function Money({ supabase }: MoneyProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals]   = useState<any[]>([]);
  const [users, setUsers]               = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userWallet, setUserWallet]     = useState<{ coins: number } | null>(null);
  const [loading, setLoading]           = useState(true);
  const [wLoading, setWLoading]         = useState(false);
  const [statusMsg, setStatusMsg]       = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [saving, setSaving]             = useState(false);
  const [activeSection, setActiveSection] = useState<'cashout' | 'withdrawals'>('cashout');

  const [economy, setEconomy] = useState<any>({
    coin_to_euro: 0,
    platform_retention_percent: 0,
    vault_total_cap: 0,
    vault_emitted: 0,
    platform_revenue: 0
  });

  const [inputCoins, setInputCoins] = useState(0);

  // ── FETCH ──────────────────────────────────────────────────────────────────
  const fetchWithdrawals = async () => {
    const { data } = await supabase
      .from('withdrawals')
      .select(`*, profiles:user_id (username, avatar_url)`)
      .order('created_at', { ascending: false });
    if (data) setWithdrawals(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: stripeData } = await supabase
          .from("stripe_payments")
          .select(`*, profiles:user_id (username, avatar_url, full_name)`)
          .order("created_at", { ascending: false });
        if (stripeData) setTransactions(stripeData);

        const { data: ecoData } = await supabase
          .from('app_economy').select('*').eq('id', 1).maybeSingle();
        if (ecoData) setEconomy({ ...ecoData, platform_revenue: ecoData.platform_revenue ?? 0 });

        const { data: profiles } = await supabase.from('profiles').select('id, username, avatar_url');
        if (profiles) setUsers(profiles);

        await fetchWithdrawals();
      } catch (err) {
        console.error("Fetch error:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  const fetchSelectedUserWallet = async (userId: string) => {
    const { data } = await supabase.from('wallets').select('coins_balance').eq('user_id', userId).maybeSingle();
    if (data) setUserWallet({ coins: data.coins_balance });
  };

  useEffect(() => {
    if (selectedUser) fetchSelectedUserWallet(selectedUser.id);
    else setUserWallet(null);
  }, [selectedUser]);

  // ── CALCULATIONS ───────────────────────────────────────────────────────────
  const safeCoinToEuro       = economy.coin_to_euro || 0;
  const safeRetention        = economy.platform_retention_percent || 0;
  const grossEuro            = inputCoins * safeCoinToEuro;
  const retentionEuro        = grossEuro * (safeRetention / 100);
  const netEuro              = grossEuro - retentionEuro;
  const totalInternalCapitalEUR = (economy.vault_emitted || 0) * safeCoinToEuro;

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // ── SAVE ECONOMY ───────────────────────────────────────────────────────────
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

  // ── PAYOUT ─────────────────────────────────────────────────────────────────
  const handleFinalPayout = async () => {
    if (!selectedUser || inputCoins <= 0) return showStatus("Select account and amount", "error");
    if (!userWallet || inputCoins > userWallet.coins) return showStatus("Insufficient balance", "error");
    setLoading(true);

    const { error: walletError } = await supabase
      .from('wallets')
      .update({ coins_balance: userWallet.coins - inputCoins, updated_at: new Date().toISOString() })
      .eq('user_id', selectedUser.id);

    if (walletError) {
      showStatus(walletError.message, "error");
    } else {
      await supabase.from('liquidations').insert({
        user_id: selectedUser.id,
        coins_burned: inputCoins,
        payout_net: netEuro,
        platform_profit: retentionEuro
      });

      const newEmitted = (economy.vault_emitted || 0) - inputCoins;
      const newRevenue = (economy.platform_revenue || 0) + retentionEuro;

      const { error: ecoError } = await supabase
        .from('app_economy')
        .update({ vault_emitted: newEmitted, platform_revenue: newRevenue })
        .eq('id', 1);

      if (!ecoError) {
        setEconomy((prev: any) => ({ ...prev, vault_emitted: newEmitted, platform_revenue: newRevenue }));
        showStatus(`Burned ${inputCoins}. Profit: €${retentionEuro.toFixed(2)}`, "success");
      }
      setInputCoins(0);
      fetchSelectedUserWallet(selectedUser.id);
    }
    setLoading(false);
  };

  // ── WITHDRAWAL ACTIONS ─────────────────────────────────────────────────────
  const handleWithdrawalStatus = async (id: string, status: 'approved' | 'rejected' | 'completed', w: any) => {
    setWLoading(true);

    const { error } = await supabase
      .from('withdrawals')
      .update({ status })
      .eq('id', id);

    if (error) { showStatus(`Eroare: ${error.message}`, 'error'); setWLoading(false); return; }

    // Dacă respingem — întoarcem diamonds în wallet
    if (status === 'rejected') {
      await supabase
        .from('wallets')
        .update({ diamonds_balance: supabase.rpc('increment', { x: w.amount_coins }) })
        .eq('user_id', w.user_id);
      // fallback direct update
      const { data: wal } = await supabase.from('wallets').select('diamonds_balance').eq('user_id', w.user_id).single();
      if (wal) {
        await supabase.from('wallets')
          .update({ diamonds_balance: (wal.diamonds_balance || 0) + w.amount_coins })
          .eq('user_id', w.user_id);
      }
    }

    showStatus(`Status actualizat: ${status.toUpperCase()}`, 'success');
    await fetchWithdrawals();
    setWLoading(false);
  };

  const handleExportPDF = async () => {
    const { default: jsPDF }      = await import("jspdf");
    const { default: autoTable }  = await import("jspdf-autotable");
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

  // ── STATUS BADGE ───────────────────────────────────────────────────────────
  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
      pending:   'bg-amber-100 text-amber-700',
      approved:  'bg-blue-100 text-blue-700',
      completed: 'bg-emerald-100 text-emerald-700',
      rejected:  'bg-red-100 text-red-600',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${map[status] || 'bg-zinc-100 text-zinc-500'}`}>
        {status}
      </span>
    );
  };

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;

  return (
    <div className="space-y-6 pb-20 max-w-[1400px] mx-auto px-4 animate-in fade-in duration-500 font-sans text-zinc-900 dark:text-zinc-100">

      {statusMsg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-right ${statusMsg.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {statusMsg.text}
        </div>
      )}

      {/* ── TOP STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden shadow-2xl font-mono italic">
        <div className="bg-white dark:bg-[#0c0c0e] p-4">
          <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">Exposure (EUR)</p>
          <p className="text-2xl font-black italic tracking-tighter tabular-nums leading-none">€{totalInternalCapitalEUR.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] p-4 border-l border-zinc-100 dark:border-zinc-800 text-zinc-400">
          <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1 italic">Issued Diamonds</p>
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

      {/* ── CONFIG ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm overflow-hidden mb-6 font-mono italic">
        <ConfigTile label={`Retention % (${economy.platform_retention_percent}%)`} value={economy.platform_retention_percent} onChange={(v: any) => setEconomy({ ...economy, platform_retention_percent: v })} />
        <ConfigTile label="Coin Base (€)" value={economy.coin_to_euro} step="0.001" onChange={(v: any) => setEconomy({ ...economy, coin_to_euro: v })} />
        <ConfigTile label="Manual Supply Adjust" value={economy.vault_emitted} onChange={(v: any) => setEconomy({ ...economy, vault_emitted: v })} />
        <ConfigTile label="Vault Max Supply" value={economy.vault_total_cap} onChange={(v: any) => setEconomy({ ...economy, vault_total_cap: v })} />
      </div>

      {/* ── SECTION TOGGLE ── */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-0">
        <button
          onClick={() => setActiveSection('cashout')}
          className={`px-5 py-2.5 text-[9px] font-black uppercase tracking-widest italic border-b-2 transition-all -mb-px ${activeSection === 'cashout' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}>
          Burn & Cashout
        </button>
        <button
          onClick={() => setActiveSection('withdrawals')}
          className={`px-5 py-2.5 text-[9px] font-black uppercase tracking-widest italic border-b-2 transition-all -mb-px flex items-center gap-2 ${activeSection === 'withdrawals' ? 'border-amber-500 text-amber-500' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}>
          Cereri Retragere
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* ── CASHOUT SECTION ── */}
      {activeSection === 'cashout' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 p-6 rounded shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-zinc-400 italic">Select Beneficiary</h3>
            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2">
              {users.map(u => (
                <button key={u.id} onClick={() => setSelectedUser(u)}
                  className={`w-full flex items-center gap-3 p-2 rounded transition-all ${selectedUser?.id === u.id ? 'bg-indigo-500 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
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
                  <p className="text-3xl font-black italic tracking-tighter">{selectedUser ? selectedUser.username : "---"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-500 uppercase italic">User Balance</p>
                  <p className="text-2xl font-black italic tabular-nums text-emerald-400">{userWallet?.coins || 0} 💎</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <label className="text-[9px] font-black uppercase text-zinc-500 block mb-4 italic">Amount to Burn</label>
                  <input type="number" value={inputCoins}
                    onChange={(e) => setInputCoins(parseInt(e.target.value) || 0)}
                    className="bg-transparent border-b-2 border-zinc-800 text-5xl font-black w-full outline-none focus:border-indigo-500 transition-all italic tabular-nums" />
                </div>
                <div className="space-y-4 bg-zinc-800/30 p-6 rounded-lg border border-zinc-800 font-mono text-[11px] italic">
                  <div className="flex justify-between"><span className="text-zinc-500">Gross Value:</span><span>€{grossEuro.toFixed(2)}</span></div>
                  <div className="flex justify-between text-red-400"><span>Platform Fee ({economy.platform_retention_percent}%):</span><span>-€{retentionEuro.toFixed(2)}</span></div>
                  <div className="border-t border-zinc-800 pt-4 flex justify-between text-xl font-black text-emerald-400 tracking-tighter">
                    <span>NET PAYOUT:</span><span>€{netEuro.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button onClick={handleFinalPayout} disabled={loading || !selectedUser || inputCoins <= 0}
                className="mt-10 w-full py-5 bg-indigo-600 hover:bg-white hover:text-black transition-all rounded-lg font-black uppercase italic tracking-widest text-[11px] disabled:opacity-20">
                {loading ? "Processing..." : "Authorize Payout & Burn"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WITHDRAWALS SECTION ── */}
      {activeSection === 'withdrawals' && (
        <div className="space-y-3">
          {withdrawals.length === 0 ? (
            <div className="text-center py-20 text-zinc-400 font-black italic text-[11px] uppercase tracking-widest">
              Nu există cereri de retragere
            </div>
          ) : (
            withdrawals.map((w) => (
              <div key={w.id}
                className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 font-mono">

                {/* User */}
                <div className="flex items-center gap-3 min-w-[160px]">
                  {w.profiles?.avatar_url
                    ? <img src={w.profiles.avatar_url} className="w-8 h-8 rounded-full object-cover grayscale" />
                    : <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />}
                  <div>
                    <p className="text-[11px] font-black italic">@{w.profiles?.username || '—'}</p>
                    <p className="text-[9px] text-zinc-400">{new Date(w.created_at).toLocaleDateString('ro-RO')}</p>
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex gap-6 flex-1">
                  <div>
                    <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest mb-0.5">Diamonds</p>
                    <p className="text-base font-black italic text-fuchsia-500">💎 {(w.amount_coins || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest mb-0.5">Sumă RON</p>
                    <p className="text-base font-black italic text-emerald-600">{w.amount_money > 0 ? `${w.amount_money} RON` : '—'}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest mb-0.5">Date Bancare</p>
                    <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 truncate whitespace-pre-wrap break-all leading-tight">{w.bank_details}</p>
                  </div>
                </div>

                {/* Status + Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={w.status} />

                  {w.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleWithdrawalStatus(w.id, 'approved', w)}
                        disabled={wLoading}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[8px] font-black uppercase rounded transition-all disabled:opacity-40">
                        Aprobă
                      </button>
                      <button
                        onClick={() => handleWithdrawalStatus(w.id, 'rejected', w)}
                        disabled={wLoading}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[8px] font-black uppercase rounded transition-all disabled:opacity-40">
                        Respinge
                      </button>
                    </>
                  )}

                  {w.status === 'approved' && (
                    <button
                      onClick={() => handleWithdrawalStatus(w.id, 'completed', w)}
                      disabled={wLoading}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[8px] font-black uppercase rounded transition-all disabled:opacity-40">
                      Marchează Plătit
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── STRIPE INFLOW ── */}
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

function ConfigTile({ label, value, onChange, step = "1" }: any) {
  const displayValue = (value === undefined || value === null || isNaN(value)) ? 0 : value;
  return (
    <div className="bg-white dark:bg-[#0c0c0e] p-4">
      <p className="text-[8px] font-black uppercase mb-2 text-zinc-500 italic">{label}</p>
      <input type="number" step={step} value={displayValue}
        onChange={(e) => { const val = parseFloat(e.target.value); onChange(isNaN(val) ? 0 : val); }}
        className="bg-transparent text-xl font-black w-full outline-none focus:text-indigo-500 transition-colors italic tabular-nums" />
    </div>
  );
}