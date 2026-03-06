"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserClient } from "@supabase/ssr";
import ChatLive from '@/components/ChatLive';
import FLive from '@/components/FLive';

export default function MainLive() {
  const params = useParams();
  const username = decodeURIComponent(params?.username as string || "");
  
  const [streamerId, setStreamerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    async function resolveStreamer() {
      if (!username) return;
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (data) setStreamerId(data.id);
      setLoading(false);
    }
    resolveStreamer();
  }, [username, supabase]);

  if (loading) return <div className="min-h-screen bg-[#05010a] flex items-center justify-center text-purple-500 animate-pulse font-black uppercase">SMILE LIVE...</div>;

  return (
    <main className="relative min-h-screen w-full bg-[#05010a] overflow-hidden flex flex-col">
      
      {/* 1. FUNDAL (z-0) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#020005] via-[#0d011a] to-[#05000a]" />
        <div className="absolute top-[-10%] right-[-5%] w-[70%] h-[50%] bg-purple-600/20 rounded-full blur-[140px]" />
        <div className="absolute inset-0 z-10 flex items-center justify-center select-none opacity-20">
            <h2 className="text-purple-500 text-[10rem] md:text-[20rem] font-black tracking-tighter uppercase transform -rotate-12 italic">SMILE</h2>
        </div>
      </div>



      {/* 3. COMPONENTA DE CHAT (Z-INDEX MAI MIC CA MAGAZINUL) */}
      <div className="relative z-[50] mt-auto w-full flex flex-col items-center pointer-events-none">
        {streamerId ? (
          <div className="h-[500px] w-full max-w-lg mb-6 pointer-events-auto">
            <ChatLive streamerId={streamerId} />
          </div>
        ) : (
          <div className="text-white/20 mb-20 font-bold uppercase tracking-widest">Profilul nu a fost găsit</div>
        )}
      </div>

    </main>
  );
}
