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

  // Scroll instant la mesaje noi
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "auto" });
    }
  }, [messages]);

  // Initializare chat & Realtime
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

    // Fetch initial
    supabase.from("messages").select("*").eq("conversation_id", convId).order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []));

    // ABONARE REALTIME (Sursa pentru "Instant")
    const channel = supabase.channel(`realtime-messages-${convId}`)
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "messages", 
        filter: `conversation_id=eq.${convId}` 
      }, (payload) => {
        setMessages((prev) => {
          // Evităm duplicatele dacă inserarea locală a fost rapidă
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [convId]);

  const handleSend = async () => {
    if (!text.trim() || !convId) return;
    const msgText = text;
    setText("");

    // Inserare în DB
    const { data: newMsg } = await supabase.from("messages").insert([{ 
      conversation_id: convId, 
      sender_id: user.id, 
      sender_type: "client", 
      text: msgText 
    }]).select().single();

    // Update UI local pentru viteză (Optimistic Update)
    if (newMsg) setMessages(prev => [...prev, newMsg]);

    await supabase.from("conversations").update({ 
      last_message_preview: msgText, 
      updated_at: new Date().toISOString() 
    }).eq("id", convId);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="mb-4 w-[calc(100vw-32px)] sm:w-[380px] h-[80vh] sm:h-[550px] bg-[#0c0c1d]/95 border border-white/10 backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* HEADER */}
            <div className="p-5 sm:p-6 bg-white/5 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/20">
                  <Sparkles size={20} className="text-black" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Smile Support</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Instant Sync</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.1 }}
                  key={m.id || i} 
                  className={`flex ${m.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-snug ${
                    m.sender_type === 'client' 
                    ? 'bg-zinc-800 text-zinc-100 rounded-tr-none' 
                    : 'bg-yellow-400 text-black font-extrabold rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* INPUT */}
            <div className="p-5 bg-white/5 border-t border-white/5">
              <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl p-1.5 focus-within:border-yellow-400/50 transition-all">
                <input 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none text-[13px] text-white px-3 outline-none"
                />
                <button 
                  onClick={handleSend} 
                  className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center text-black active:scale-90 transition-transform"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB BUTTON */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center shadow-2xl transition-colors duration-300 ${
          isOpen ? 'bg-zinc-900' : 'bg-yellow-400 shadow-yellow-400/20'
        }`}
      >
        {isOpen ? <X size={24} className="text-white" /> : <MessageSquare size={26} className="text-black" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-yellow-400"></span>
          </span>
        )}
      </motion.button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
