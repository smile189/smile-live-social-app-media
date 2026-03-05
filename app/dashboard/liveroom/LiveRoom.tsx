"use client";

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, RefreshCw, Activity, Coins, ShieldCheck, 
  VideoOff, Ban, Power, Monitor, Gift, Clock,
  ChevronDown, Search, Menu, X
} from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAGE_SIZE = 5;

export default function LiveRoom({ profileId }: { profileId?: any }) {

  const [streamers, setStreamers] = useState<any[]>([]);
  const [gifts, setGifts] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1. FETCH LIVE ASSETS (STRICT IS_LIVE)
  const fetchLive = useCallback(async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 0 : page;
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('profiles')
      .select('*, wallets(coins_balance)', { count: 'exact' })
      .eq('is_live', true)
      .order('username', { ascending: true })
      .range(from, to);

    if (search) query = query.ilike('username', `%${search}%`);

    const { data, error, count } = await query;
    
    if (!error && data) {
      setStreamers(prev => {
        const newList = reset ? data : [...prev, ...data];
        if (count !== null) setHasMore(newList.length < count);
        return newList;
      });
      if (reset && data.length > 0) setSelectedId(data[0].id);
    }
    setLoading(false);
  }, [page, search]); // Dependențe stabile

  // 2. FETCH GIFTS REAL-TIME
  const fetchGifts = useCallback(async (id: string) => {
    const { data } = await supabase
      .from('gifts')
      .select('*, sender:profiles!gifts_sender_id_fkey(username)')
      .eq('receiver_id', id)
      .order('created_at', { ascending: false })
      .limit(15);
    if (data) setGifts(data);
  }, []);

  // 3. EFFECTS
  useEffect(() => {
    setPage(0);
    fetchLive(true);
  }, [search, fetchLive]);

  useEffect(() => {
    if (page > 0) fetchLive(false);
  }, [page, fetchLive]);

  useEffect(() => {
    if (selectedId) fetchGifts(selectedId);
  }, [selectedId, fetchGifts]);

  // 4. REALTIME SYNC
  useEffect(() => {
    const channel = supabase.channel('terminal-v6')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchLive(true))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gifts' }, (p) => {
        if (selectedId && p.new.receiver_id === selectedId) fetchGifts(selectedId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedId, fetchLive, fetchGifts]);

  const handleSuspend = async (id: string) => {
    const { error } = await supabase.from('profiles').update({ is_live: false, viewer_count: 0 }).eq('id', id);
    if (!error) {
      setStreamers(prev => prev.filter(s => s.id !== id));
      setSelectedId(null);
    }
  };

  const selectedStreamer = streamers.find(s => s.id === selectedId);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] lg:h-[calc(100vh-100px)] bg-white dark:bg-[#0A0A0A] lg:rounded-3xl overflow-hidden shadow-sm font-sans relative text-left">
      
      {/* SIDEBAR - RESPONSIVE OVERLAY */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 transform lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full font-sans">
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Live Console</span>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-zinc-400"><X size={18}/></button>
          </div>
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 text-left">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl pl-9 pr-3 py-2 text-xs font-bold outline-none"/>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {streamers.map((s) => (
              <div key={s.id} onClick={() => { setSelectedId(s.id); setSidebarOpen(false); }} className={`px-6 py-5 flex items-center justify-between cursor-pointer border-b border-zinc-100 dark:border-zinc-800/50 ${selectedId === s.id ? 'bg-indigo-50 dark:bg-zinc-800 border-l-4 border-l-indigo-600 shadow-sm' : ''}`}>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black uppercase italic leading-none">{s.username}</span>
                  <div className="flex items-center gap-2 mt-1 text-amber-500 font-bold text-[10px]"><Coins size={10}/> {s.wallets?.coins_balance?.toLocaleString() || 0}</div>
                </div>
                {s.is_live && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
              </div>
            ))}
            {hasMore && (
              <button onClick={() => setPage(p => p + 1)} className="w-full py-4 text-[10px] font-black uppercase text-zinc-400 hover:text-indigo-600 flex items-center justify-center gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <ChevronDown size={14} /> Load More ({streamers.length})
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0A0A0A] overflow-hidden relative">
        {/* MOBILE HEADER */}
        <div className="lg:hidden p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
          <button onClick={() => setSidebarOpen(true)} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg"><Menu size={20}/></button>
          <h2 className="text-[10px] font-black uppercase tracking-widest truncate italic">{selectedStreamer?.username || "Terminal"}</h2>
          <div className="w-10 h-10" /> 
        </div>

        {selectedStreamer ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden italic">
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
              {/* HEADER TOOLS */}
              <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4 text-left">
                   <div className="w-10 h-10 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-black flex items-center justify-center font-black italic shadow-lg shrink-0">{selectedStreamer.username.charAt(0).toUpperCase()}</div>
                   <div>
                      <h1 className="text-lg font-black uppercase tracking-tighter leading-none">{selectedStreamer.username}</h1>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Operational</span>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase italic">Viewers</p>
                    <p className="text-base font-black italic tabular-nums">{selectedStreamer.viewer_count || 0}</p>
                  </div>
                  <button onClick={() => handleSuspend(selectedStreamer.id)} className="bg-red-600 text-white p-3 rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all"><Power size={18}/></button>
                </div>
              </div>

              {/* VIDEO PLAYER */}
              <div className="aspect-video bg-black rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl relative flex items-center justify-center group overflow-hidden">
                 <Monitor size={48} className="text-white opacity-5" />
                 <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 opacity-60">
                   <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"/><span className="text-[8px] font-black uppercase text-white tracking-widest leading-none">Telemetry Link</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => supabase.from('profiles').update({ role: 'banned', is_live: false }).eq('id', selectedStreamer.id)} className="flex items-center justify-center gap-3 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-black uppercase text-[10px] tracking-widest italic text-zinc-500 hover:text-red-500 transition-all shadow-sm"><Ban size={16}/> Blacklist</button>
                 <button className="flex items-center justify-center gap-3 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-black uppercase text-[10px] tracking-widest italic text-zinc-500 hover:text-indigo-600 transition-all shadow-sm"><RefreshCw size={16}/> Reset</button>
              </div>
            </div>


            {/* GIFT FEED */}
            <div className="w-full lg:w-96 lg:border-l border-t lg:border-t-0 border-zinc-200 dark:border-zinc-800 bg-zinc-50/10 dark:bg-zinc-950 flex flex-col shrink-0 min-h-[350px]">
               <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950 shadow-sm">
                  <div className="flex items-center gap-3 text-left"><Gift className="text-indigo-600" size={18} /><h2 className="text-xs font-black uppercase tracking-widest">Contributions</h2></div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/5 rounded-lg border border-amber-500/10 font-black text-[10px] text-amber-600">+{selectedStreamer.wallets?.coins_balance?.toLocaleString() || 0}</div>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide max-h-[400px] lg:max-h-none">
                  <AnimatePresence initial={false}>
                    {gifts.map(gift => (
                      <motion.div key={gift.id} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, scale: 0.95}} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3.5 rounded-2xl flex items-center justify-between shadow-sm border-l-4 border-l-green-500/30">
                        <div className="flex items-center gap-3 text-left leading-none">
                          <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center font-black text-[10px] uppercase border border-zinc-100 dark:border-zinc-700">{gift.sender?.username?.charAt(0) || 'G'}</div>
                          <div><p className="text-[10px] font-black uppercase leading-none">{gift.sender?.username || 'Guest'}</p><p className="text-[8px] text-zinc-400 font-bold mt-1 tracking-tighter uppercase italic">Gift Sent</p></div>
                        </div>
                        <div className="flex items-center gap-1.5 text-green-600 font-black text-xs tabular-nums shrink-0">+{gift.amount} <Coins size={12} className="text-amber-500" /></div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {gifts.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 py-20 text-center"><Clock size={24}/><p className="text-[9px] font-black uppercase tracking-[0.2em] mt-2">Awaiting Activity</p></div>
                  )}
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10 p-8 italic"><Activity size={60}/><p className="text-[10px] font-black uppercase tracking-[0.5em] mt-4">Scanning Network...</p></div>
        )}
      </main>

      {/* OVERLAY PENTRU SIDEBAR MOBILE */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />}
    </div>
  );
}
