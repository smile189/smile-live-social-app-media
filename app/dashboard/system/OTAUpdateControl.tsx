"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  RefreshCw, Apple, Smartphone, Zap, Cpu, Radio, 
  History as HistoryIcon, HardDrive, Globe, Clock, ArrowUpRight, MessageSquare
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface OTAProps {
  sysControl: any;
  updateSystem: (data: any) => Promise<void>;
  addNotify: (msg: string, type: "success" | "info" | "warning" | "error") => void;
}

export const OTAUpdateControl = ({ sysControl, updateSystem, addNotify }: OTAProps) => {
  const [activeTab, setActiveTab] = useState<'control' | 'history'>('control');
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios'>('android');
  const [isSyncing, setIsSyncing] = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [liveDevices, setLiveDevices] = useState<any[]>([]);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchData = useCallback(async () => {
    const [{ data: devices }, { data: logs }] = await Promise.all([
      supabase.from('ota_telemetry').select('*').order('last_ping', { ascending: false }).limit(4),
      supabase.from('ota_history').select('*').order('created_at', { ascending: false }).limit(10)
    ]);
    if (devices) setLiveDevices(devices);
    if (logs) setHistory(logs);
  }, [supabase]);

  useEffect(() => {
    if (sysControl?.update_message) setUpdateMsg(sysControl.update_message);
  }, [sysControl?.update_message]);

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('ota_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ota_history' }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData, supabase]);

  const handlePush = async () => {
    if (!sysControl) return;
    setIsSyncing(true);
    
    try {
      const ver = activePlatform === 'android' ? sysControl.min_android_version : sysControl.min_ios_version;
      
      // 1. Salvăm în istoric EXACT mesajul din state-ul local (updateMsg)
      const { error: histError } = await supabase.from('ota_history').insert({ 
        version_name: ver, 
        platform: activePlatform, 
        description: updateMsg.trim() || `Update to v${ver} (no notes)`, // SALVARE REALĂ MESAJ
        created_at: new Date().toISOString()
      });

      if (histError) throw histError;

      // 2. Actualizăm sistemul
      await updateSystem({ 
        update_message: updateMsg.trim(), 
        updated_at: new Date().toISOString() 
      });

      addNotify?.("Infrastructure Synced", "success");
      fetchData();
    } catch (e) { 
      addNotify?.("Deployment Failed", "error"); 
    } finally { 
      setIsSyncing(false); 
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#050505] rounded-[2.5rem] border border-slate-200 dark:border-white/[0.05] shadow-2xl overflow-hidden font-sans">
      
      {/* HEADER TABS */}
      <div className="px-6 py-6 md:px-10 md:py-8 border-b border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.01] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 w-full sm:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 text-white shrink-0">
            <Cpu size={28} strokeWidth={2.5} />
          </div>
          <div className="space-y-1 text-left">
            <h3 className="text-sm font-black tracking-[0.2em] dark:text-white uppercase leading-none italic">OTA update notifications</h3>
            <div className="flex items-center gap-2">
           
          
            </div>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 dark:bg-white/[0.03] p-1.5 rounded-2xl border dark:border-white/5 w-full sm:w-auto">
          {(['control', 'history'] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === t ? 'bg-white dark:bg-zinc-800 text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}>
              {t === 'control' ? <Zap size={14} /> : <HistoryIcon size={14} />} {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-10">
        {activeTab === 'control' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* SELECT PLATFORM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['android', 'ios'] as const).map((p) => (
                <button key={p} onClick={() => setActivePlatform(p)} className={`group relative p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${activePlatform === p ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/5 shadow-inner' : 'border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90 ${activePlatform === p ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                      {p === 'android' ? <Smartphone size={22} /> : <Apple size={22} />}
                    </div>
                    <div className="text-left">
                      <span className={`block text-[10px] font-black uppercase tracking-widest ${activePlatform === p ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>{p} Production</span>
                    </div>
                  </div>
                  {activePlatform === p && <ArrowUpRight size={18} className="text-indigo-500" />}
                </button>
              ))}
            </div>

            {/* MESSAGE & VERSION */}
            <div className="bg-slate-50/50 dark:bg-white/[0.01] rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-6 md:p-8 space-y-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Build Target</label>
                  <p className="text-[10px] font-bold text-slate-500 uppercase italic">Version threshold</p>
                </div>
                <div className="relative w-full sm:w-auto">
                   <div className="absolute inset-y-0 left-4 flex items-center text-indigo-500"><Globe size={16} /></div>
                   <input 
                    value={(activePlatform === 'android' ? sysControl?.min_android_version : sysControl?.min_ios_version) || ""}
                    onChange={(e) => updateSystem({ [activePlatform === 'android' ? 'min_android_version' : 'min_ios_version']: e.target.value })}
                    className="w-full sm:w-40 pl-12 pr-6 py-4 bg-white dark:bg-zinc-900 border dark:border-white/10 rounded-2xl text-center font-black text-indigo-600 outline-none focus:ring-4 ring-indigo-500/10 shadow-sm"
                    placeholder="0.0.0"
                   />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 text-left block">Alert Message</label>
                <textarea 
                  value={updateMsg} 
                  onChange={(e) => setUpdateMsg(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border dark:border-white/10 p-6 rounded-3xl text-sm min-h-[120px] outline-none focus:border-indigo-500 transition-all resize-none font-medium dark:text-zinc-300"
                  placeholder="Type the message users will see..."
                />
              </div>
            </div>

            <button onClick={handlePush} disabled={isSyncing || !sysControl} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-6 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl active:scale-95 disabled:opacity-30">
              {isSyncing ? <RefreshCw size={20} className="animate-spin" /> : <Zap size={20} className="fill-indigo-400" />}
              Execute Update notify
            </button>
          </div>
        ) : (
          /* REAL HISTORY VIEW WITH REAL MESSAGES */
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            {history.map((h, i) => (
              <div key={i} className="group p-6 rounded-[2.2rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex flex-col gap-4 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.platform === 'ios' ? 'bg-slate-200 dark:bg-white/5' : 'bg-indigo-500/10 text-indigo-500'}`}>
                      {h.platform === 'ios' ? <Apple size={18} /> : <Smartphone size={18} />}
                    </div>
                    <div className="text-left">
                       <span className="block text-xs font-black dark:text-white uppercase tracking-tighter italic">Version v{h.version_name}</span>
                       <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          <Clock size={10} /> {new Date(h.created_at).toLocaleString()}
                       </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase italic tracking-widest">DEPLOYED</div>
                </div>
                
                {/* AFISARE MESAJ REAL DIN DB */}
                <div className="flex gap-3 items-start bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                   <MessageSquare size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                   <p className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 text-left leading-relaxed">
                     {h.description || "No patch notes provided for this build."}
                   </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TELEMETRY */}
        <div className="mt-12 pt-10 border-t border-slate-100 dark:border-white/[0.05]">
   
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {liveDevices.map((d, i) => (
              <div key={i} className="group p-6 rounded-[2rem] bg-white dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-all">
                    <HardDrive size={20} />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <span className="block text-xs font-black dark:text-zinc-200 tracking-tight">@{d.device_model?.split(' ')[0]}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">v{d.app_version || '1.0'}</span>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
