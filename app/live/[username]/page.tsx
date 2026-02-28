"use client";

import React, { useEffect, useState, use } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import ChatLive from '@/components/ChatLive';
import FLive from '@/components/FLive';
import { useRouter } from 'next/navigation';
import { 
  X, Flag, Settings, Users, ShieldAlert, Volume2, VolumeX, 
  MonitorPlay, Zap, Info, ShieldCheck 
} from 'lucide-react';

export default function LiveStreamPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // States pentru Logica de Control
  const [streamer, setStreamer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [quality, setQuality] = useState('1080p');

  useEffect(() => {
    const fetchStreamer = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (data) {
        setStreamer(data);
      } else {
        setStreamer({
          username: username,
          avatar_url: `https://api.dicebear.com{username}`,
          viewer_count: "1.2K",
          total_diamonds: 50
        });
      }
      setLoading(false);
    };
    fetchStreamer();
  }, [username, supabase]);

  if (loading) return (
    <div className="h-screen bg-[#05010a] flex items-center justify-center text-purple-500 font-black animate-pulse uppercase italic tracking-tighter">
      Smile Live Loading...
    </div>
  );

  return (
    <main className="relative h-screen w-full bg-[#05010a] overflow-hidden flex flex-col font-sans text-white">
      
      {/* 1. VIDEO / ATMOSPHERE LAYER */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-purple-900/40 via-black to-black">
         <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-96 h-96 bg-purple-500 rounded-full blur-[150px] animate-pulse" />
         </div>
      </div>

      {/* 2. TOP INTERFACE (LiveControls Logic Merged) */}
      <div className="relative z-[150] p-5 flex flex-col gap-4">
        <div className="flex justify-between items-start w-full">
          
          {/* STREAMER INFO */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-2xl border border-white/10 p-1.5 pr-5 rounded-full shadow-xl">
            <div className="w-10 h-10 rounded-full border border-red-500 overflow-hidden bg-slate-900 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
               <img src={streamer.avatar_url || `https://api.dicebear.com{username}`} alt="avatar" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-white text-[12px] font-bold tracking-tight">{streamer.username}</span>
                <ShieldCheck className="w-3 h-3 text-blue-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white/50 text-[9px] font-black uppercase tracking-widest italic">Live {quality}</span>
              </div>
            </div>
          </div>

          {/* VIEWERS & EXIT BUTTON */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-2xl border border-white/10 px-4 h-11 rounded-full text-white shadow-xl">
              <Users className="w-4 h-4 text-white/60" />
              <span className="text-[12px] font-bold">{streamer.viewer_count}</span>
            </div>
            <button 
              onClick={() => setConfirmExit(true)}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-red-500/20 backdrop-blur-2xl border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl"
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* SIDE ACTIONS (Vertical Settings) */}
        <div className="flex flex-col gap-3 items-end">
          <button onClick={() => setIsMuted(!isMuted)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-all shadow-xl">
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl backdrop-blur-xl border transition-all ${showSettings ? 'bg-white text-black border-white' : 'bg-white/10 border-white/10 text-white'}`}
          >
            <Settings className={`w-5 h-5 ${showSettings ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
          </button>

          {showSettings && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-6 duration-300">
              <button onClick={() => setQuality(quality === '1080p' ? '720p' : '1080p')} className="group relative w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/10 text-white">
                <MonitorPlay className="w-5 h-5" />
                <span className="absolute right-14 bg-black/80 text-[10px] px-2 py-1 rounded border border-white/10 font-bold">{quality}</span>
              </button>
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-yellow-400/20 border border-yellow-400/20 text-yellow-400"><Zap className="w-5 h-5" /></button>
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500"><Flag className="w-5 h-5" /></button>
            </div>
          )}
        </div>
      </div>



      {/* 4. CHAT LAYER (Bottom) */}
      <div className="relative z-50 w-full max-w-[500px] p-6 mt-auto">
        <div className="h-[400px]">
           <ChatLive />
        </div>
      </div>

      {/* --- EXIT MODAL --- */}
      {confirmExit && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-[85%] max-w-sm bg-white/[0.03] backdrop-blur-[60px] border border-white/10 rounded-[3rem] p-10 flex flex-col items-center text-center shadow-2xl">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
              <Info className="w-8 h-8 text-white/40" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">End Session?</h2>
            <p className="text-white/40 text-sm mb-10 leading-relaxed">You are leaving @{username}'s broadcast.</p>
            <div className="flex flex-col w-full gap-3">
              <button onClick={() => setConfirmExit(false)} className="w-full bg-white text-black font-bold py-4 rounded-2xl">Stay in Stream</button>
              <button onClick={() => router.push('/app')} className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-900/40">Confirm Exit</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
