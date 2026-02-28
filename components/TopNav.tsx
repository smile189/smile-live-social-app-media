"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Search, Bell, X, Sparkles, Users, Compass, Radio } from "lucide-react";

export default function TopNav() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [activeTab, setActiveTab] = useState("foryou");
  const [isSearching, setIsSearching] = useState(false);
  const [showLiveGlass, setShowLiveGlass] = useState(false);
  const [liveUsers, setLiveUsers] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1. FETCH LIVE USERS FROM SUPABASE
  useEffect(() => {
    const fetchLive = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_live', true)
        .order('viewer_count', { ascending: false });
      
      if (data) setLiveUsers(data);
    };

    fetchLive();

    // REALTIME: Listen for live status changes
    const channel = supabase.channel('live_status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchLive)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  // 2. TOGGLE MY LIVE STATUS (THE "WOW" PART)
  const handleGoLive = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please login to Go Live!");

    const newStatus = !isLive;
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        username: user.user_metadata?.username || user.email?.split('@')[0],
        is_live: newStatus,
        viewer_count: newStatus ? Math.floor(Math.random() * 200) + 10 : 0,
        live_color: '#a855f7'
      });

    if (!error) {
      setIsLive(newStatus);
      if (newStatus) alert("You are now LIVE! Check the Smile list.");
    }
  };

  const enterStream = (username: string) => {
    setShowLiveGlass(false);
    router.push(`/live/${username}`);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[60] px-3 py-4 sm:px-8 sm:py-6 select-none bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          
          {/* LEFT: LIVE INDICATOR */}
          <div className="flex items-center min-w-[150px]">
            <button 
              onClick={() => setShowLiveGlass(true)}
              className="group relative flex items-center gap-3 bg-black/40 hover:bg-black/60 backdrop-blur-2xl px-4 py-2 rounded-full border border-white/10 transition-all active:scale-95 shadow-2xl"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping opacity-40" />
                <span className="relative w-2 h-2 bg-red-500 rounded-full shadow-[0_0_12px_#ef4444]" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300">SMILE</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">LIVE</span>
                <span className="text-[9px] font-bold text-white/60">{liveUsers.length} ONLINE</span>
              </div>
            </button>
          </div>

          {/* CENTER: NAV */}
          <div className="flex-1 flex justify-center px-4">
             <nav className="flex items-center bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] p-1 rounded-[22px]">
                {[{ id: "friends", label: "Friends", icon: <Users size={14} /> }, { id: "foryou", label: "For You", icon: <Sparkles size={14} /> }].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-6 py-2.5 rounded-[18px] transition-all ${activeTab === tab.id ? "text-black bg-white" : "text-white/40 hover:text-white"}`}
                  >
                    <span className="relative z-10">{tab.icon}</span>
                    <span className="relative z-10 text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                  </button>
                ))}
              </nav>
          </div>

          {/* RIGHT: UTILS + GO LIVE */}
          <div className="flex items-center justify-end gap-3 min-w-[150px]">
            <button 
              onClick={handleGoLive}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isLive ? 'bg-red-600 animate-pulse text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
            >
              <Radio size={14} /> {isLive ? 'End Live' : 'Go Live'}
            </button>
            <button className="relative p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/50 transition-all">
              <Bell size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* LIVE MEDIA OVERLAY (THE GLASS VIEW) */}
      {showLiveGlass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-[100px] animate-in fade-in" onClick={() => setShowLiveGlass(false)} />
          
          <div className="relative w-full h-full flex flex-col justify-center items-center">
            <button onClick={() => setShowLiveGlass(false)} className="absolute top-10 right-10 p-4 text-white/40 hover:text-white transition-all"><X size={40} /></button>
            
            <div className="w-full flex overflow-x-auto no-scrollbar snap-x snap-mandatory px-[20%] gap-16 py-20">
              {liveUsers.length > 0 ? liveUsers.map((user) => (
                <div 
                  key={user.id} 
                  onClick={() => enterStream(user.username)}
                  className="snap-center shrink-0 cursor-pointer group flex flex-col items-center"
                >
                  <div className="relative w-48 h-48 sm:w-72 sm:h-72 rounded-full p-2 bg-gradient-to-tr from-purple-600 via-red-600 to-yellow-500 animate-spin-slow group-hover:scale-110 transition-all duration-500">
                    <div className="w-full h-full rounded-full bg-black overflow-hidden border-4 border-black">
                      <img src={user.avatar_url || 'https://api.dicebear.com' + user.username} className="w-full h-full object-cover group-hover:scale-125 transition-all" />
                    </div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-600 px-4 py-1.5 rounded-full text-xs font-black shadow-2xl">LIVE</div>
                  </div>
                  <h3 className="mt-8 text-3xl font-black text-white italic tracking-tighter uppercase group-hover:text-red-500 transition-colors">@{user.username}</h3>
                  <p className="text-white/30 font-bold text-sm uppercase tracking-[0.3em]">{user.viewer_count} Viewers</p>
                </div>
              )) : (
                <div className="text-white/20 text-4xl font-black uppercase italic tracking-tighter">No one is live yet...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
