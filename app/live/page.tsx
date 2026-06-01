/**
 * path: app/live/page.tsx
 * about: Premium Dashboard - Displays online streamers using native Supabase schema
 * author: BM
 */

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from "@supabase/ssr";

interface ProfileFromDB {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_live: boolean | null;
  viewer_count: number | null;
  live_color: string | null;
  live_room_id: string | null;
}

export default function LiveDashboard() {
  const router = useRouter();
  const [streamers, setStreamers] = useState<ProfileFromDB[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    async function fetchLiveStreamers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, is_live, viewer_count, live_color, live_room_id')
        .eq('is_live', true);

      if (!error && data) {
        setStreamers(data as ProfileFromDB[]);
      }
      setLoading(false);
    }

    fetchLiveStreamers();

    const channel = supabase
      .channel('live_profiles_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchLiveStreamers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05010a] flex items-center justify-center text-purple-500 animate-pulse font-black uppercase tracking-widest">
        SMILE LIVE...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#05010a] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Premium Ambient Neon Lights */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation & Header Row */}
      <div className="relative z-10 flex flex-col gap-6 border-b border-white/5 pb-6 mb-12">
        {/* Interactive Back Button */}
        <div>
          <button 
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-purple-400 transition-all duration-300 bg-white/[0.02] hover:bg-purple-950/20 border border-white/5 hover:border-purple-500/30 px-4 py-2 rounded-full shadow-lg"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span> 
            Go Back
          </button>
        </div>

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500">
              SMILE LIVE
            </h1>
            <p className="text-white/50 text-sm mt-1">Watch active live streams in real time</p>
          </div>
          
          <div className="bg-purple-950/40 border border-purple-500/20 px-4 py-2 rounded-full text-xs font-bold text-purple-400 flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            {streamers.length} LIVE NOW
          </div>
        </header>
      </div>

      {/* Main Grid View */}
      {streamers.length === 0 ? (
        <div className="h-[40vh] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01] backdrop-blur-sm">
          <p className="text-white/40 font-bold uppercase tracking-widest text-sm mb-1">No Active Streams</p>
          <p className="text-white/20 text-xs">Live creators will automatically appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
          {streamers.map((streamer) => {
            const borderGlowColor = streamer.live_color || '#a855f7';

            return (
              <div
                key={streamer.id}
                onClick={() => router.push(`/live/${encodeURIComponent(streamer.username)}`)}
                style={{ '--glow-color': borderGlowColor } as React.CSSProperties}
                className="group cursor-pointer bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/5 hover:border-[var(--glow-color)] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--glow-color),0.15)] hover:-translate-y-1.5 flex flex-col shadow-xl"
              >
                {/* Preview / Thumbnail Section */}
                <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-[#11051c] to-[#07020d] flex items-center justify-center overflow-hidden">
                  
                  {/* Status Badge */}
                  <span 
                    style={{ backgroundColor: borderGlowColor }}
                    className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 shadow-lg z-10 text-white"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                  </span>

                  {/* Live Viewers Count */}
                  <span className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-[10px] font-bold text-white/90 px-2 py-0.5 rounded-md z-10 border border-white/5 tracking-wide flex items-center gap-1">
                    👁️ {streamer.viewer_count ?? 0}
                  </span>

                  {/* Centered Large Avatar Blur Backing */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                    {streamer.avatar_url ? (
                      <img 
                        src={streamer.avatar_url} 
                        alt={streamer.username}
                        className="w-20 h-20 rounded-full object-cover border-2 transition-all duration-500 group-hover:scale-110 shadow-2xl"
                        style={{ borderColor: borderGlowColor }}
                      />
                    ) : (
                      <div 
                        style={{ backgroundImage: `linear-gradient(to top right, ${borderGlowColor}, #000)` }}
                        className="w-20 h-20 rounded-full opacity-60 group-hover:opacity-90 transition-all duration-500 flex items-center justify-center text-2xl font-black text-white uppercase border border-white/10 group-hover:scale-110 shadow-2xl"
                      >
                        {streamer.username.substring(0, 2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Sub-Footer Profile Info */}
                <div className="p-4 flex items-center gap-3 bg-[#0a0512]/95 backdrop-blur-md border-t border-white/5 mt-auto transition-colors duration-300 group-hover:bg-[#12071f]/95">
                  
                  {/* Profile Micro-Avatar */}
                  <div 
                    className="w-10 h-10 rounded-full overflow-hidden border shrink-0 bg-purple-950 flex items-center justify-center font-bold text-sm text-white uppercase transition-transform duration-300 group-hover:rotate-6" 
                    style={{ borderColor: borderGlowColor }}
                  >
                    {streamer.avatar_url ? (
                      <img src={streamer.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      streamer.username.substring(0, 2)
                    )}
                  </div>

                  {/* Profile Typography Details */}
                  <div className="truncate flex-1">
                    <h4 className="font-black text-sm text-white group-hover:text-purple-400 transition-colors duration-300 truncate">
                      {streamer.username}
                    </h4>
                    <p className="text-xs text-white/40 truncate mt-0.5 font-medium tracking-wide">
                      {streamer.full_name || "Smile Live Member"}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
