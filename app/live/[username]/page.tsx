/**
 * path: app/live/[username]/page.tsx
 * about: Stream individual - Responsive TikTok Style Layout (9:16 Center Box on Desktop)
 * author: BM
 */

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserClient } from "@supabase/ssr";
import ChatLive from '@/components/ChatLive';
import FLive from '@/components/FLive';

import { LiveKitRoom, RoomAudioRenderer, VideoTrack, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';

export default function MainLive() {
  const params = useParams();
  const username = decodeURIComponent(params?.username as string || "");
  
  const [streamerId, setStreamerId] = useState<string | null>(null);
  const [liveRoomId, setLiveRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [lkToken, setLkToken] = useState<string>("");
  const [lkError, setLkError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    async function resolveStreamer() {
      if (!username) return;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, live_room_id')
          .eq('username', username)
          .maybeSingle();

        if (data) {
          setStreamerId(data.id);
          setLiveRoomId(data.live_room_id);
        }
      } catch (err) {
        console.error("Supabase Error:", err);
      } finally {
        setLoading(false);
      }
    }
    resolveStreamer();
  }, [username, supabase]);

  useEffect(() => {
    if (!username || loading || !streamerId || !liveRoomId) return;
    
    const viewerName = `viewer-${Math.floor(Math.random() * 10000)}`;
    
    fetch(`/api/token?room=${encodeURIComponent(liveRoomId)}&username=${encodeURIComponent(viewerName)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Eroare server token");
        return res.json();
      })
      .then((data) => {
        if (data.token) {
          setLkToken(data.token);
        } else {
          setLkError("Token invalid.");
        }
      })
      .catch((err) => {
        console.error("Fetch Token Error:", err);
        setLkError("Eroare de conexiune la server.");
      });
  }, [username, loading, streamerId, liveRoomId, retryKey]);

  if (loading) return (
    <div className="min-h-screen bg-[#05010a] flex items-center justify-center text-purple-500 animate-pulse font-black uppercase tracking-widest">
      SMILE LIVE...
    </div>
  );

  return (
    <main className="relative h-screen w-screen bg-[#020005] overflow-hidden flex items-center justify-center">
      
      {/* 1. FUNDAL CINEMATIC PENTRU MONITOARE MARI */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#020005] via-[#0d011a] to-[#05000a] opacity-90" />
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[160px]" />
      </div>

      {/* 2. CONTAINER RESPONSIVE TIP SMARTPHONE (9:16 Pe Desktop | Fullscreen pe Mobil) */}
      <div className="relative w-full h-full md:max-w-[450px] md:h-[92vh] md:rounded-[32px] md:border md:border-white/10 md:shadow-[0_0_50px_rgba(168,85,247,0.15)] bg-[#05010a] overflow-hidden flex flex-col z-10">
        
        {/* STRAT VIDEO INDEPENDENT */}
        <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center">
          {!liveRoomId ? (
            <div className="text-white/40 text-sm font-semibold uppercase tracking-wider px-4 text-center">
              Streamerul nu are camera pornită
            </div>
          ) : lkToken ? (
            <LiveKitRoom
              key={lkToken}
              video={false}
              audio={false}
              token={lkToken}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              connect={true}
              className="w-full h-full relative"
            >
              <RoomAudioRenderer />
              <VideoPlayerContainer onRetry={() => setRetryKey(prev => prev + 1)} />
            </LiveKitRoom>
          ) : (
            <div className="text-white/40 text-sm font-semibold uppercase tracking-wider animate-pulse flex flex-col items-center gap-3">
              {lkError ? (
                <>
                  <span className="text-red-400">{lkError}</span>
                  <button
                    onClick={() => setRetryKey(prev => prev + 1)}
                    className="text-[11px] bg-purple-600 px-3 py-1 rounded text-white uppercase font-bold"
                  >
                    Reîncearcă
                  </button>
                </>
              ) : "Se conectează la stream-ul video..."}
            </div>
          )}
        </div>
        
        {/* STRAT INTERACTIV: TAP-TAP OVERLAY (Mapat la dimensiunea containerului) */}
        <div className="absolute inset-0 z-20 pointer-events-auto">
          <FLive streamerName={username} />
        </div>

        {/* STRAT INTERACTIV SUPERIOR: CONTAINER DE CHAT ȘI CONTROALE */}
        <div className="relative z-30 mt-auto w-full flex flex-col items-center pointer-events-none p-4">
          {streamerId ? (
            <div className="h-[420px] md:h-[400px] w-full max-w-full pointer-events-auto">
              <ChatLive streamerId={streamerId} />
            </div>
          ) : (
            <div className="text-white/20 mb-10 font-bold uppercase tracking-widest text-xs">
              Profilul nu a fost găsit
            </div>
          )}
        </div>

      </div>

    </main>
  );
}

function VideoPlayerContainer({ onRetry }: { onRetry: () => void }) {
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: true }
  );

  const liveVideoTrack = tracks.find(t => t.publication?.isSubscribed) ?? null;

  if (!liveVideoTrack) {
    return (
      <div className="text-center text-white/30 font-bold uppercase tracking-widest text-xs animate-pulse flex flex-col gap-3 relative z-40 pointer-events-auto px-6">
        <span className="w-5 h-5 border-2 border-t-transparent border-purple-500 rounded-full animate-spin mx-auto" />
        <span>Se așteaptă semnalul...</span>
        <button
          onClick={onRetry}
          className="text-[10px] bg-white/5 border border-white/10 text-purple-400 font-bold px-2.5 py-1 rounded-md tracking-normal hover:bg-white/10 transition-all mt-1"
        >
          Forțează Reîncărcarea
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full absolute inset-0 bg-black">
      {/* Imaginea video principală mulată perfect (object-cover) */}
      <VideoTrack
        trackRef={liveVideoTrack}
        className="w-full h-full object-cover relative z-10"
      />
    </div>
  );
}
