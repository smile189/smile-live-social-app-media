"use client";

import React, { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageSquare, Sparkles } from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ChatWidget({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && user && !convId) {
      const initChat = async () => {
        let { data: conv } = await supabase.from("conversations").select("id").eq("user_id", user.id).eq("status", "open").single();
        if (!conv) {
          const { data: newConv } = await supabase.from("conversations").insert([{ user_id: user.id, user_email: user.email, status: "open" }]).select().single();
          setConvId(newConv?.id);
        } else { setConvId(conv.id); }
      };
      initChat();
    }
  }, [isOpen, user, convId]);

  useEffect(() => {
    if (!convId) return;
    const fetchMsgs = async () => {
      const { data } = await supabase.from("messages").select("*").eq("conversation_id", convId).order("created_at", { ascending: true });
      setMessages(data || []);
    };
    fetchMsgs();
    const channel = supabase.channel(`client-chat-${convId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${convId}` }, 
      (payload) => setMessages((prev) => [...prev, payload.new]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [convId]);

  const handleSend = async () => {
    if (!text.trim() || !convId) return;
    const msgText = text;
    setText("");
    await supabase.from("messages").insert([{ conversation_id: convId, sender_id: user.id, sender_type: "client", text: msgText }]);
    await supabase.from("conversations").update({ last_message_preview: msgText, updated_at: new Date() }).eq("id", convId);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, rotate: -2 }}
            className="mb-6 w-[90vw] sm:w-[380px] h-[550px] bg-[#0c0c1d]/95 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden ring-1 ring-white/20"
          >
            {/* TOP DECORATION GRADIENT */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

            {/* HEADER ARTISTIC */}
            <div className="p-6 bg-gradient-to-b from-white/5 to-transparent flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                    <Sparkles size={20} className="text-black animate-pulse" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0c0c1d]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Smile Support</h4>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Always Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-red-500 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* MESSAGES AREA - AURORA STYLE */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_bottom_left,_rgba(250,204,21,0.03),_transparent)]">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                  <MessageSquare size={40} className="text-zinc-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Start a conversation</p>
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: m.sender_type === 'client' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex ${m.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-5 py-3.5 rounded-[1.8rem] text-[13px] leading-relaxed shadow-xl ${
                    m.sender_type === 'client' 
                    ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-100 rounded-tr-none border border-white/5' 
                    : 'bg-yellow-400 text-black font-extrabold rounded-tl-none shadow-yellow-400/10'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* INPUT AREA - FLOATING STYLE */}
            <div className="p-6 bg-transparent">
              <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 pr-3 focus-within:border-yellow-400/50 transition-all focus-within:bg-white/10">
                <input 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask us anything..."
                  className="flex-1 bg-transparent border-none text-[13px] text-white placeholder:text-zinc-600 focus:ring-0 outline-none px-3 py-2"
                />
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend} 
                  className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black shadow-lg hover:shadow-yellow-400/20 transition-all"
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION BUTTON - THE WOW FACTOR */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-2xl ${
          isOpen ? 'bg-zinc-900 rotate-90' : 'bg-yellow-400'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={28} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="relative">
              <MessageSquare size={28} className="text-black" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-yellow-400" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* EXTERNAL RING ANIMATION */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-[2rem] border-2 border-yellow-400 animate-ping opacity-20" />
        )}
      </motion.button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fbbf24; }
      `}</style>
    </div>
  );
}
