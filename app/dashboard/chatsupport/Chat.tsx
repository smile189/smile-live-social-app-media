"use client";

import React, { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Clock, ShieldCheck, Zap, Volume2, VolumeX } from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Chat() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- NOTIFICARE SONORĂ ---
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // 1. Sync Conversații (Realtime)
  useEffect(() => {
    const fetchConversations = async () => {
      const { data } = await supabase.from("conversations").select("*").order("updated_at", { ascending: false });
      if (data) setConversations(data);
    };
    fetchConversations();

    const channel = supabase.channel("db-convs")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, (payload) => {
        fetchConversations();
        if (payload.eventType === 'INSERT') playNotificationSound();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 2. Sync Mesaje (Realtime Instant)
  useEffect(() => {
    if (!selectedConv) return;
    
    supabase.from("messages").select("*").eq("conversation_id", selectedConv.id).order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []));

    const channel = supabase.channel(`db-msg-${selectedConv.id}`)
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "messages", 
        filter: `conversation_id=eq.${selectedConv.id}` 
      }, (payload) => {
        if (payload.new.sender_type === 'client') playNotificationSound();
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConv]);

  const handleSend = async () => {
    if (!reply.trim() || !selectedConv) return;
    const { data: { user } } = await supabase.auth.getUser();
    const currentReply = reply;
    setReply("");

    await supabase.from("messages").insert([{
      conversation_id: selectedConv.id,
      sender_id: user?.id,
      sender_type: "agent",
      text: currentReply
    }]);

    await supabase.from("conversations").update({ 
      last_message_preview: currentReply, 
      updated_at: new Date().toISOString() 
    }).eq("id", selectedConv.id);
  };

  return (
    <div className="flex h-[75vh] bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-xl font-sans">
      
      {/* SIDEBAR - LIGHT */}
      <div className="w-1/3 border-r border-slate-100 bg-slate-50 flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Support Center</span>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-slate-400 hover:text-yellow-500">
               {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
          <Zap size={14} className="text-yellow-500 fill-yellow-500" />
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedConv(c)}
              className={`p-5 cursor-pointer transition-all border-b border-slate-100 relative ${
                selectedConv?.id === c.id ? 'bg-white shadow-sm' : 'hover:bg-slate-100/50'
              }`}
            >
              {selectedConv?.id === c.id && <div className="absolute left-0 top-0 h-full w-1 bg-yellow-500" />}
              <div className="flex justify-between items-start mb-1">
                <p className="font-bold text-xs text-slate-800 truncate uppercase tracking-tighter">
                  {c.user_email?.split('@')[0] || 'User'}
                </p>
                <Clock size={10} className="text-slate-400" />
              </div>
              <p className="text-[11px] truncate text-slate-500 font-medium">
                {c.last_message_preview || "Waiting..."}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA - CLEAN WHITE */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConv ? (
          <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 shadow-inner">
                  {selectedConv.user_email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase text-slate-800 tracking-widest">{selectedConv.user_email}</p>
                  <p className="text-[9px] text-green-500 font-bold flex items-center gap-1">
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> LIVE SYNC
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                <ShieldCheck size={12} className="text-yellow-600" />
                <span className="text-[9px] font-black text-yellow-600 uppercase tracking-tighter">Verified Agent</span>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/30">
              {messages.map((m, i) => (
                <div key={m.id || i} className={`flex ${m.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-5 py-3 rounded-[1.5rem] text-[13px] shadow-sm ${
                    m.sender_type === 'agent' 
                    ? 'bg-yellow-400 text-black font-bold rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-8 bg-white">
              <div className="flex gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 ring-yellow-400/20 transition-all">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-transparent border-none text-slate-800 px-4 py-2 text-sm outline-none placeholder:text-slate-400 font-medium"
                  placeholder="Type your reply..."
                />
                <button onClick={handleSend} className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase shadow-md transition-transform active:scale-95">
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 grayscale">
            <Zap size={48} className="text-slate-300 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Select a Ticket</p>
          </div>
        )}
      </div>
    </div>
  );
}
