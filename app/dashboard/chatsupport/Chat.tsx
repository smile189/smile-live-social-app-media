"use client";

import React, { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Clock, ShieldCheck, Zap, Volume2, VolumeX, ChevronLeft, MessageCircle } from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Chat() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const playNotificationSound = () => {
    if (!soundEnabled) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
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
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, (payload: any) => {
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
      }, (payload: any) => {
        setMessages((prev) => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          if (payload.new.sender_type === 'client') playNotificationSound();
          return [...prev, payload.new];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConv]);

  const handleSend = async () => {
    if (!reply.trim() || !selectedConv) return;
    const { data: { user } } = await supabase.auth.getUser();
    const currentReply = reply;
    const tempId = crypto.randomUUID();
    setReply("");

    // Optimistic Update
    const optimisticMsg = {
      id: tempId,
      conversation_id: selectedConv.id,
      sender_id: user?.id,
      sender_type: "agent",
      text: currentReply,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    await supabase.from("messages").insert([{
      id: tempId,
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

  const selectConversation = (conv: any) => {
    setSelectedConv(conv);
    setIsMobileListVisible(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-[90vh] md:h-[75vh] bg-white md:rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl font-sans m-2 md:m-0">
      
      {/* SIDEBAR */}
      <div className={`${isMobileListVisible ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 border-r border-slate-100 bg-slate-50 flex-col transition-all`}>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Smile Panel</span>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-slate-400 hover:text-yellow-500 transition-colors">
               {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
          <Zap size={16} className="text-yellow-500 fill-yellow-500" />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="p-10 text-center text-slate-400 text-xs font-medium">No active chats</div>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => selectConversation(c)}
              className={`p-5 cursor-pointer transition-all border-b border-slate-100 relative ${
                selectedConv?.id === c.id ? 'bg-white shadow-sm' : 'hover:bg-slate-200/50'
              }`}
            >
              {selectedConv?.id === c.id && <motion.div layoutId="active" className="absolute left-0 top-0 h-full w-1.5 bg-yellow-400" />}
              <div className="flex justify-between items-start mb-1">
                <p className="font-black text-[11px] text-slate-800 truncate uppercase tracking-tight">
                  {c.user_email?.split('@')[0] || 'Guest User'}
                </p>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                   <Clock size={8} /> {new Date(c.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-[11px] truncate text-slate-500 font-medium leading-tight">
                {c.last_message_preview || "Wait for connection..."}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className={`${!isMobileListVisible || !isMobileListVisible && selectedConv ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white w-full h-full relative`}>
        {selectedConv ? (
          <div className="flex flex-col h-full">
            {/* Header Chat */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3 md:gap-4">
                <button onClick={() => setIsMobileListVisible(true)} className="md:hidden p-2 -ml-2 text-slate-400">
                  <ChevronLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center font-black text-black shadow-lg shadow-yellow-400/20 uppercase">
                  {selectedConv.user_email?.charAt(0)}
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase text-slate-800 tracking-widest leading-none mb-1">{selectedConv.user_email}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] text-green-600 font-black uppercase tracking-tighter">Live Connection</span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl">
                <ShieldCheck size={12} className="text-yellow-400" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Agent</span>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 p-4 md:p-8 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={m.id || i} 
                  className={`flex ${m.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] md:max-w-[70%] px-5 py-3 rounded-3xl text-[13px] shadow-sm leading-relaxed ${
                    m.sender_type === 'agent' 
                    ? 'bg-yellow-400 text-black font-bold rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-8 bg-white border-t border-slate-100">
              <div className="flex gap-2 md:gap-4 bg-slate-100 border border-slate-200 rounded-[1.5rem] p-2 focus-within:ring-4 ring-yellow-400/10 transition-all">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none text-slate-800 px-4 py-2 text-sm outline-none font-medium"
                />
                <button 
                  onClick={handleSend}
                  disabled={!reply.trim()}
                  className="p-3 bg-yellow-400 rounded-2xl text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-yellow-400/20"
                >
                  <Send size={18} strokeWidth={2.5} />
                </button>
              </div>
              <p className="text-center text-[8px] text-slate-300 font-bold uppercase tracking-[0.4em] mt-4">
                Smile Support &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
            <MessageCircle size={48} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-widest">Select a conversation to start</p>
          </div>
        )}
      </div>
    </div>
  );
}
