"use client";

import React, { useState } from 'react';
import { 
  X, Flag, Settings, Users, ShieldAlert, Volume2, VolumeX, 
  LogOut, MonitorPlay, Zap, Info, ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FLive({ streamerName = "SMILE_LIVE_PRO" }) {
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [quality, setQuality] = useState('1080p');
  const router = useRouter();

  return (
    <>
      {/* --- TOP UI LAYER --- */}
      <div className="absolute top-0 left-0 w-full z-[150] p-5 flex flex-col gap-4 pointer-events-none">
        <div className="flex justify-between items-start w-full">
          
          {/* USER INFO GLASS */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-2xl border border-white/10 p-1.5 pr-5 rounded-full pointer-events-auto shadow-xl">
            <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-slate-900">
               <img src={`https://api.dicebear.com{streamerName}`} alt="avatar" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-white text-[12px] font-bold tracking-tight">{streamerName}</span>
                <ShieldCheck className="w-3 h-3 text-blue-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white/50 text-[9px] font-black uppercase tracking-widest">Live 4K</span>
              </div>
            </div>
          </div>

          {/* VIEWERS & EXIT */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-2xl border border-white/10 px-4 h-11 rounded-full text-white shadow-xl">
              <Users className="w-4 h-4 text-white/60" />
              <span className="text-[12px] font-bold">1,284</span>
            </div>
            
            <button 
              onClick={() => setConfirmExit(true)}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-red-500/10 backdrop-blur-2xl border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl"
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* SIDE ACTIONS BAR */}
        <div className="flex flex-col gap-3 items-end pointer-events-auto mt-2">
          
          {/* MUTE TOGGLE */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-all shadow-xl"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* SETTINGS TOGGLE */}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl backdrop-blur-xl border transition-all ${showSettings ? 'bg-white text-black border-white' : 'bg-white/10 border-white/10 text-white'}`}
          >
            <Settings className={`w-5 h-5 ${showSettings ? 'animate-spin-slow' : ''}`} />
          </button>

          {/* EXPANDED OPTIONS MENU */}
          {showSettings && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-6 duration-300">
              
              {/* Quality Selector */}
              <button 
                onClick={() => setQuality(quality === '1080p' ? '720p' : '1080p')}
                className="group relative w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all"
              >
                <MonitorPlay className="w-5 h-5" />
                <span className="absolute right-14 bg-black/80 text-[10px] px-2 py-1 rounded border border-white/10 font-bold">{quality}</span>
              </button>

              {/* Low Latency Mod */}
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/10 text-yellow-400 hover:bg-yellow-400/20 transition-all">
                <Zap className="w-5 h-5" />
              </button>

              {/* Report Content */}
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                <Flag className="w-5 h-5" />
              </button>

              {/* Moderation Panel */}
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all">
                <ShieldAlert className="w-5 h-5" />
              </button>

            </div>
          )}
        </div>
      </div>

      {/* --- CORPORATE EXIT MODAL --- */}
      {confirmExit && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-[85%] max-w-sm relative animate-in zoom-in-95 duration-200">
            <div className="relative bg-white/[0.03] backdrop-blur-[60px] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl p-10 flex flex-col items-center text-center">
              
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <Info className="w-8 h-8 text-white/40" />
              </div>
              
              <h2 className="text-white text-2xl font-bold tracking-tight mb-2">
                End Session?
              </h2>
              <p className="text-white/40 text-sm font-medium mb-10 leading-relaxed">
                You are about to leave {streamerName}'s broadcast. All interactions will be closed.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => setConfirmExit(false)} 
                  className="w-full bg-white text-black font-bold py-4 rounded-2xl text-[15px] active:scale-[0.98] transition-all"
                >
                  Stay in Stream
                </button>
                
                <button 
                  onClick={() => router.push('/app')} 
                  className="w-full bg-red-600/90 hover:bg-red-600 text-white font-bold py-4 rounded-2xl text-[15px] active:scale-[0.98] transition-all shadow-lg shadow-red-900/40"
                >
                  Confirm Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </>
  );
}
