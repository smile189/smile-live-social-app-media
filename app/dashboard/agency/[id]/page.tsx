"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Zap, Users, Radio, ArrowUpRight, Activity, Globe, 
  RefreshCw, AlertTriangle, ShieldCheck, Settings, 
  UserPlus, Wallet, BarChart3, Fingerprint, Lock,
  ExternalLink, Ghost
} from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AgencyNodeTerminal() {
  const params = useParams();
  const router = useRouter();
  const agencyId = params.id as string;

  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSession, setUserSession] = useState<any>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserSession(session.user);

      const isUuid = agencyId.includes("-") && agencyId.length > 20;
      const column = isUuid ? "id" : "slug";

      // QUERY REPARAT: Folosim !agency_id pentru a forta relatia corecta
      const { data, error: supabaseError } = await supabase
        .from("agencies")
        .select(`
          *,
          owner:owner_id ( 
            id, username, avatar_url 
          ),
          streamers:profiles!agency_id (
            id, username, avatar_url, is_live,
            wallet:wallets(coins_balance)
          )
        `)
        .eq(column, agencyId)
        .single();

      if (supabaseError) throw supabaseError;

      if (data.owner_id !== session.user.id) {
        setError("IDENTITY_MISMATCH: Unauthorized Token for this Node.");
        return;
      }

      setAgency(data);
    } catch (err: any) {
      setError(err.message || "Agency node not discovered.");
    } finally {
      setLoading(false);
    }
  }, [agencyId, router]);

  useEffect(() => {
    if (agencyId) loadData();
  }, [agencyId, loadData]);

  const metrics = useMemo(() => {
    if (!agency) return { live: 0, coins: 0, totalStreamers: 0 };
    const streamers = agency.streamers || [];
    const live = streamers.filter((s: any) => s.is_live).length;
    const coins = streamers.reduce((acc: number, s: any) => {
        const balance = Array.isArray(s.wallet) ? s.wallet[0]?.coins_balance : s.wallet?.coins_balance;
        return acc + (balance || 0);
    }, 0);
    return { live, coins, totalStreamers: streamers.length };
  }, [agency]);

  if (loading) return (
    <div className="h-screen bg-[#09090B] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <RefreshCw className="animate-spin text-indigo-500" size={40} />
        <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" size={18} />
      </div>
      <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] animate-pulse">Authenticating Uplink...</div>
    </div>
  );

  if (error || !agency) return (
    <div className="h-screen bg-[#09090B] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="text-rose-500" size={32} />
      </div>
      <h2 className="text-white font-black uppercase tracking-widest text-sm italic">Node Critical Error</h2>
      <code className="text-rose-500/70 text-[10px] mt-4 block bg-rose-500/5 px-4 py-2 rounded-lg border border-rose-500/10 font-mono text-left max-w-md mx-auto whitespace-pre-wrap">
        [FAULT_LOG]: {error}
      </code>
      <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-white text-black text-[10px] font-black uppercase rounded-xl hover:bg-indigo-500 hover:text-white transition-all">Re-Sync Identity</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-400 font-sans antialiased p-6 lg:p-12 selection:bg-indigo-500/30">
      <div className="max-w-[1300px] mx-auto space-y-10">
        
        {/* HEADER & IDENTITY AUTH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800/50 pb-8">
          <div className="flex items-center gap-6">
             <div className="relative">
                <img src={agency.owner?.avatar_url || "https://avatar.vercel.sh"} className="w-14 h-14 rounded-2xl object-cover border border-zinc-800 shadow-2xl" />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-4 border-[#09090B]" />
             </div>
             <div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  <Lock size={10} className="text-indigo-500" /> Token Active: <span className="text-zinc-300 font-mono italic">{userSession?.id.slice(0, 12)}...</span>
                </div>
                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">{agency.name} <span className="text-indigo-600 font-normal not-italic tracking-normal ml-2 opacity-50">NODE_{agency.slug || 'AUTO'}</span></h1>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={loadData} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-xl">
              <RefreshCw size={18} />
            </button>
            <div className="px-5 py-2 bg-indigo-600 rounded-xl text-[10px] font-black text-white uppercase flex items-center gap-2 shadow-lg shadow-indigo-600/20">
              <ShieldCheck size={14} /> Identity Verified
            </div>
          </div>
        </div>

        {/* STATS CLUSTER */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Gross Revenue" value={`$${Number(agency.total_revenue || 0).toLocaleString()}`} trend="+4.2%" icon={<BarChart3 size={16} />} />
          <StatCard label="Network Coins" value={metrics.coins.toLocaleString()} subValue="COINS" icon={<Wallet size={16} />} color="indigo" />
          <StatCard label="Talents" value={metrics.totalStreamers} subValue="ACTIVE_ROSTER" icon={<Users size={16} />} />
          <div className="bg-indigo-600 p-6 rounded-[2rem] shadow-xl text-white relative overflow-hidden group">
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em] mb-4 italic">Live Pulse</p>
            <div className="flex items-center gap-4 relative z-10">
              <h3 className="text-5xl font-black italic tracking-tighter">{metrics.live}</h3>
              <div className="flex flex-col">
                 <Radio size={20} className="animate-pulse" />
                 <span className="text-[8px] font-black uppercase mt-1">Streaming</span>
              </div>
            </div>
            <Zap size={100} className="absolute -bottom-8 -right-8 opacity-20 group-hover:rotate-12 transition-transform duration-700" />
          </div>
        </div>

        {/* TERMINAL TOOLS & TALENT LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          <div className="lg:col-span-2 bg-[#121214] border border-zinc-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
             <div className="px-8 py-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/10">
                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                  <Activity size={16} className="text-indigo-500" /> Real-time Node Tracking
                </h4>
                <span className="text-[9px] font-bold text-zinc-600">{metrics.totalStreamers} ENROLLED</span>
             </div>
             
             <div className="flex-1 p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                {agency.streamers?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {agency.streamers.map((streamer: any) => (
                            <div key={streamer.id} className="bg-black/40 border border-zinc-800/50 p-4 rounded-2xl flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={streamer.avatar_url || "https://avatar.vercel.sh"} className="w-10 h-10 rounded-xl object-cover" />
                                        {streamer.is_live && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#121214] animate-pulse" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-tight">{streamer.username}</p>
                                        <p className="text-[9px] font-mono text-zinc-600">ID: {streamer.id.slice(0, 8)}</p>
                                    </div>
                                </div>
                                <button className="p-2 bg-zinc-900 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:text-white">
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-4 opacity-30">
                        <Ghost className="mx-auto" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">No nodes detected in this roster.</p>
                    </div>
                )}
             </div>
          </div>

          <div className="space-y-6">
              <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Node Control Panel</h4>
                <button className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-indigo-600 group transition-all">
                    <span className="text-[10px] font-black uppercase group-hover:text-white tracking-widest">Enrol New Talent</span>
                    <UserPlus size={16} className="text-indigo-500 group-hover:text-white" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest">Configure Node</span>
                    <Settings size={16} className="text-zinc-600" />
                </button>
                <div className="pt-4 border-t border-zinc-800/50">
                    <div className="bg-black/50 p-4 rounded-2xl border border-zinc-800">
                        <p className="text-[8px] font-black text-zinc-600 uppercase mb-2">Instance Identifier</p>
                        <p className="text-[10px] font-mono text-indigo-500 truncate">{agency.id}</p>
                    </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, trend, icon, color = "zinc" }: any) {
    return (
        <div className="bg-[#121214] border border-zinc-800/50 p-7 rounded-[2rem] group hover:border-indigo-500/30 transition-all duration-500 shadow-lg">
            <div className="flex justify-between items-start mb-6">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">{label}</p>
                <div className="p-2 bg-zinc-900 rounded-xl group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors">
                    {icon}
                </div>
            </div>
            <div className="flex items-end gap-2">
                <h3 className="text-4xl font-black text-white italic tracking-tighter">{value}</h3>
                {subValue && <span className="text-[9px] font-black text-zinc-700 uppercase mb-2 tracking-tighter">{subValue}</span>}
            </div>
            {trend && (
                <div className="mt-4 flex items-center gap-1.5 text-[9px] text-emerald-500 font-black uppercase tracking-widest">
                    <ArrowUpRight size={14} /> {trend} <span className="text-zinc-700 ml-1">UPTIME_PEAK</span>
                </div>
            )}
        </div>
    )
}
