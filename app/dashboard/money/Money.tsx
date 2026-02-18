"use client";

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface MoneyProps {
  supabase: any;
}

export default function Money({ supabase }: MoneyProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, count: 0 });
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      // FETCH CONCRET: Aduce datele plății + Detalii User din tabelul 'profiles'
      const { data, error } = await supabase
        .from("stripe_payments")
        .select(`
          *,
          profiles:user_id (username, avatar_url, full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (data) {
        setTransactions(data);
        setStats({
          total: data.reduce((acc: number, t: any) => acc + (t.amount || 0), 0),
          count: data.length
        });
      }
      setLoading(false);
    };
    fetchTransactions();
  }, [supabase]);

  // GENERARE PDF DINAMIC (Fără erori de build)
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
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] } // Indigo Stripe
    });

    doc.save(`Smile_Audit_${new Date().getTime()}.pdf`);
  };

  const openStripe = (path = "") => {
    window.open(`https://dashboard.stripe.com{path}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-20 max-w-[1400px] mx-auto px-4 animate-in fade-in duration-500 font-sans">
      
      {/* 1. TOP BAR CONTROL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/50 pb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Stripe Gateway</h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-mono tracking-widest">Sincronizare Live 2026</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md text-[10px] font-black uppercase shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-zinc-700 dark:text-zinc-300"
          >
            Export Audit PDF
          </button>
          <button 
            onClick={() => setShowTransferModal(true)}
            className="px-3 py-1.5 bg-indigo-600 border border-indigo-500 rounded-md text-[10px] font-black uppercase shadow-sm hover:bg-indigo-700 transition-all text-white flex items-center gap-2"
          >
            New Transfer
          </button>
        </div>
      </div>

      {/* 2. KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Fiat Gross" value={`€${stats.total.toLocaleString()}`} icon="💳" />
        <StatCard label="Inflow Count" value={stats.count.toString()} icon="📊" />
        <StatCard label="Platform Net (Est)" value={`€${(stats.total * 0.97).toLocaleString()}`} icon="🏦" />
      </div>

      {/* 3. TRANSACTION TABLE CU IDENTITATE USER */}
      <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Financial Ledger</h3>
           <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Stripe Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-indigo-500/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden border border-zinc-700">
                        {t.profiles?.avatar_url && <img src={t.profiles.avatar_url} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500">
                          @{t.profiles?.username || "Unknown"}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono italic">ID: {t.user_id?.slice(0,8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-black text-zinc-900 dark:text-white font-mono">€{t.amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-500">
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openStripe(`test/payments/${t.id}`)}
                      className="text-[10px] font-bold text-zinc-500 hover:text-indigo-500 underline underline-offset-4"
                    >
                      {t.id?.slice(-12).toUpperCase()} ↗
                    </button>
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

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 group-hover:w-2 transition-all" />
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-2 font-mono tracking-tighter">{value}</p>
        </div>
        <span className="text-2xl opacity-20 group-hover:opacity-100 transition-opacity">{icon}</span>
      </div>
    </div>
  );
}
