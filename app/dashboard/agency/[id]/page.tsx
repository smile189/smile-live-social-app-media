"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Zap, Users, Radio, Activity, RefreshCw, AlertTriangle, 
  ShieldCheck, Wallet, BarChart3, Lock
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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Luăm user-ul logat
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 2. Verificăm rolul din tabelul de PROFILE (nu din sesiune, ca să fie sigur)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const isSuperAdmin = profile?.role === 'super_admin';

      // 3. Query pentru Agenție - REPARAT cu !agency_id
      const { data, error: supabaseError } = await supabase
        .from("agencies")
        .select(`
          *,
          owner:owner_id ( id, username, avatar_url ),
          streamers:profiles!agency_id (
            id, username, avatar_url, is_live,
            wallet:wallets(coins_balance)
          )
        `)
        .eq("id", agencyId)
        .single();

      if (supabaseError) throw supabaseError;

      // 4. LOGICA DE ACCES: Dacă ești proprietarul nodului SAU ești Super Admin (control total)
      if (data.owner_id !== user.id && !isSuperAdmin) {
        setError("IDENTITY_MISMATCH: Unauthorized Node Access.");
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
      <RefreshCw className="animate-spin text-indigo-500" size={40} />
      <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] animate-pulse">Syncing Node Data...</div>
    </div>
  );

  if (error) return (
    <div className="h-screen bg-[#09090B] flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="text-rose-500 mb-4" size={48} />
      <h2 className="text-white font-black uppercase tracking-widest text-sm italic">Access Denied</h2>
      <code className="text-rose-500/70 text-[10px] mt-4 block bg-rose-500/5 px-4 py-2 rounded-lg border border-rose-500/10 font-mono">
        {error}
      </code>
      <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-white text-black text-[10px] font-black uppercase rounded-xl">Retry Sync</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-400 p-6 lg:p-12">
      <div className="max-w-[1300px] mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800/50 pb-8">
          <div className="flex items-center gap-6">
             <div className="relative">
                <img src={agency.owner?.avatar_url || "https://avatar.vercel.sh"} className="w-14 h-14 rounded-2xl border border-zinc-800 object-cover" />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-4 border-[#09090B]" />
             </div>
             <div>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                   <Lock size={10} className="text-indigo-500" /> Agency Owner: <span className="text-zinc-300 italic">{agency.owner?.username || 'Unknown'}</span>
                </p>
                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                  {agency.name} <span className="text-indigo-600 opacity-50 ml-2">NODE</span>
                </h1>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={loadData} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-white hover:text-black transition-all">
                <RefreshCw size={18} />
             </button>
             <div className="px-5 py-2 bg-indigo-600 rounded-xl text-[10px] font-black text-white uppercase flex items-center gap-2">
                <ShieldCheck size={14} /> Link Secured
             </div>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard label="Revenue" value={`$${Number(agency.total_revenue || 0).toLocaleString()}`} icon={<BarChart3 size={16} />} />
          <MetricCard label="Network Coins" value={metrics.coins.toLocaleString()} icon={<Wallet size={16} />} />
          <MetricCard label="Talents" value={metrics.totalStreamers} icon={<Users size={16} />} />
          <div className="bg-indigo-600 p-6 rounded-[2rem] text-white flex items-center justify-between">
            <h3 className="text-4xl font-black italic tracking-tighter">{metrics.live} <span className="text-xs uppercase block opacity-70">Live Now</span></h3>
            <Radio size={32} className="animate-pulse" />
          </div>
        </div>

        {/* TALENT LIST */}
        <div className="bg-[#121214] border border-zinc-800/50 rounded-[2.5rem] overflow-hidden">
           <div className="px-8 py-6 border-b border-zinc-800/50 bg-zinc-900/10 flex justify-between items-center">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3 italic font-mono">
                <Activity size={16} className="text-indigo-500" /> talents_activity_monitor
              </h4>
           </div>
           
           <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agency.streamers?.map((s: any) => (
                <div key={s.id} className="bg-black/40 border border-zinc-800/50 p-4 rounded-2xl flex items-center gap-4 hover:border-indigo-500 transition-all">
                  <img src={s.avatar_url || "https://avatar.vercel.sh"} className="w-10 h-10 rounded-xl" />
                  <div>
                    <p className="text-white font-bold text-sm uppercase italic">{s.username}</p>
                    <p className="text-[9px] text-zinc-600 font-mono tracking-widest uppercase">ID: {s.id.slice(0, 8)}</p>
                  </div>
                  {s.is_live && <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: any) {
    return (
        <div className="bg-[#121214] border border-zinc-800/50 p-6 rounded-[2rem]">
            <div className="p-3 bg-zinc-900 w-fit rounded-xl text-indigo-500 mb-4">{icon}</div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase italic mb-1">{label}</p>
            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{value}</h3>
        </div>
    );
}
