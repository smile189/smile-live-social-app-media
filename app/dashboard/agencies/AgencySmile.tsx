"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Plus, Search, MoreHorizontal, ArrowUpRight, 
  ShieldCheck, Activity, Trash2, Loader2, 
  CheckCircle2, ChevronRight, Server, AlertTriangle, 
  Wallet, Coins, ExternalLink // Adăugat ExternalLink
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import Link from "next/link"; // Import pentru navigare

export default function AgencyStripeCommand() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [wallet, setWallet] = useState<{coins_balance: number} | null>(null);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadData = async () => {
    setFetching(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const [agenciesRes, walletRes] = await Promise.all([
        supabase.from("agencies").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
        supabase.from("wallets").select("coins_balance").eq("user_id", user.id).single()
      ]);

      setAgencies(agenciesRes.data || []);
      setWallet(walletRes.data);
    }
    setFetching(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleDeploy = async () => {
    if (newName.length < 3) return;
    setLoading(true);
    const { error } = await supabase.rpc('forge_agency_node', { p_agency_name: newName });
    if (!error) {
      setNewName("");
      (document.getElementById('deploy_modal') as any).close();
      await loadData();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    const { error } = await supabase.from("agencies").delete().eq("id", deletingId);
    if (!error) {
      setDeletingId(null);
      await loadData();
    }
    setLoading(false);
  };

  const filteredAgencies = useMemo(() => {
    return agencies.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, agencies]);

  return (
    <div className="min-h-screen bg-[#F6F9FC] text-[#1A1F36] font-sans antialiased">
      {/* Navbar */}
      <div className="bg-white border-b border-[#E3E8EE] px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <h1 className="text-lg font-bold flex items-center gap-2 italic tracking-tighter">
            <div className="w-8 h-8 bg-[#635BFF] rounded flex items-center justify-center text-white not-italic">S</div>
            SMILE_PRO
          </h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-[#F6F9FC] border border-[#E3E8EE] px-3 py-1.5 rounded-lg">
              <Coins size={14} className="text-amber-500" />
              <span className="text-sm font-bold tracking-tight">{wallet?.coins_balance?.toLocaleString() || 0}</span>
           </div>
           <button 
              onClick={() => (document.getElementById('deploy_modal') as any).showModal()}
              className="bg-[#635BFF] text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm hover:bg-[#5851E0] transition-all flex items-center gap-2"
           >
             <Plus size={16} /> New Agency
           </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-8 space-y-8">
        {/* Metrics Grid (Revenue & Status) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E8EE] p-6 shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-[10px] font-bold text-[#697386] uppercase tracking-widest">Total Liquidity</p>
                   <h2 className="text-3xl font-black mt-1 tracking-tighter italic">
                     {wallet?.coins_balance?.toLocaleString() || 0} <span className="text-sm font-normal not-italic text-[#697386]">COINS</span>
                   </h2>
                </div>
                <Wallet className="text-[#635BFF] opacity-10" size={48} />
             </div>
             <div className="mt-8 h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={[{v:0}, {v:wallet?.coins_balance || 0}]}>
                      <Area type="monotone" dataKey="v" stroke="#635BFF" fill="#635BFF" fillOpacity={0.05} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="space-y-4">
             <div className="bg-white rounded-xl border border-[#E3E8EE] p-6 shadow-sm flex items-center justify-between group">
                <div>
                   <p className="text-[10px] font-bold text-[#697386] uppercase">Nodes Managed</p>
                   <p className="text-2xl font-black mt-1 tracking-tighter italic">{agencies.length}</p>
                </div>
                <Server className="text-[#635BFF] opacity-20 group-hover:opacity-100 transition-opacity" size={32} />
             </div>
             <div className="bg-white rounded-xl border border-[#E3E8EE] p-6 shadow-sm flex items-center justify-between group">
                <div>
                   <p className="text-[10px] font-bold text-[#697386] uppercase">Security Status</p>
                   <p className="text-2xl font-black mt-1 text-[#00CA72] tracking-tighter italic">ENCRYPTED</p>
                </div>
                <ShieldCheck className="text-[#00CA72] opacity-20 group-hover:opacity-100 transition-opacity" size={32} />
             </div>
          </div>
        </div>

        {/* Agency Table */}
        <div className="bg-white rounded-xl border border-[#E3E8EE] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E3E8EE] bg-[#F8FAFC]">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 text-[#697386]" size={16} />
                <input 
                  type="text"
                  placeholder="Search agency node..."
                  className="w-full bg-white border border-[#E3E8EE] rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>

          <table className="w-full text-left">
            <thead className="text-[10px] font-bold text-[#697386] uppercase tracking-wider bg-[#F8FAFC] border-b border-[#E3E8EE]">
              <tr>
                <th className="px-6 py-4 italic">Designation</th>
                <th className="px-6 py-4 italic">Node ID</th>
                <th className="px-6 py-4 italic">Status</th>
                <th className="px-6 py-4 text-right italic">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]">
              {fetching ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#635BFF]" />
                  </td>
                </tr>
              ) : filteredAgencies.map((a) => (
                <tr key={a.id} className="hover:bg-[#F6F9FC] transition-colors group">
                  <td className="px-6 py-4 font-bold text-sm tracking-tight uppercase italic">{a.name}</td>
                  <td className="px-6 py-4 font-mono text-[11px] text-[#697386]">/{a.id.substring(0,8)}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-[#00CA72] text-[10px] font-black uppercase">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#00CA72] animate-pulse" /> Live
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                       {/* BUTON GENERARE URL / NAVIGARE */}
                       <Link 
                         href={`/dashboard/agency/${a.id}`}
                         className="flex items-center gap-1 text-[11px] font-bold text-[#635BFF] hover:underline"
                       >
                         OPEN NODE <ExternalLink size={12} />
                       </Link>
                       <button 
                         onClick={() => setDeletingId(a.id)}
                         className="p-1.5 text-[#697386] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                       >
                         <Trash2 size={14} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Confirmare Ștergere */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-[#E3E8EE]">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold italic">Delete Node?</h3>
            <p className="text-sm text-[#697386] mt-2">
              This action is irreversible. All data associated with this agency will be terminated.
            </p>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2 border border-[#E3E8EE] rounded-md text-sm font-bold hover:bg-[#F6F9FC]"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-bold hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : "Terminate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Modal */}
      <dialog id="deploy_modal" className="modal p-0 rounded-xl shadow-2xl border border-[#E3E8EE] backdrop:bg-black/20">
        <div className="p-6 w-[400px] bg-white">
          <h3 className="font-bold text-lg italic tracking-tight">Deploy New Node</h3>
          <p className="text-sm text-[#697386] mt-1">Specify your agency designation.</p>
          <input 
            type="text" 
            className="w-full border border-[#E3E8EE] rounded-md p-2 mt-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20"
            placeholder="Agency Name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => (document.getElementById('deploy_modal') as any).close()} className="text-sm font-bold text-[#697386]">Cancel</button>
            <button 
              onClick={handleDeploy}
              disabled={loading || newName.length < 3}
              className="bg-[#635BFF] text-white px-4 py-2 rounded-md text-sm font-bold disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Initialize"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
