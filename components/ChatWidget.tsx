"use client";

import React, { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageSquare, ShieldCheck, CheckCircle2, UserCircle } from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ChatWidget({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("gdpr");
  const [clientName, setClientName] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- RESTORE SESSION FROM LOCALSTORAGE ---
  useEffect(() => {
    const savedName = localStorage.getItem("smile_chat_name");
    const savedConvId = localStorage.getItem("smile_chat_conv_id");

    if (savedName) {
      setClientName(savedName);
      setStep("chat"); // 
    }
    if (savedConvId) {
      setConvId(savedConvId);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && step === "chat") scrollToBottom();
  }, [messages, isOpen, step]);

  // INITIALIZE CONVERSATION
  const startNewConversation = async () => {
    if (!user || !clientName) return;

    // Salvăm numele local imediat
    localStorage.setItem("smile_chat_name", clientName);

    // Verificăm dacă avem deja o conversație activă salvată
    const existingConvId = localStorage.getItem("smile_chat_conv_id");

    if (existingConvId) {
      setConvId(existingConvId);
      setStep("chat");
      return;
    }

    const { data: newConv } = await supabase
      .from("conversations")
      .insert([{ 
        user_id: user.id, 
        user_email: clientName, 
        status: "open",
        last_message_preview: "Connection established" 
      }])
      .select()
      .single();
    
    if (newConv) {
      setConvId(newConv.id);
      localStorage.setItem("smile_chat_conv_id", newConv.id);
      setStep("chat");
    }
  };

  // REALTIME MESSAGES
  useEffect(() => {
    if (!convId) return;
    
    supabase.from("messages").select("*").eq("conversation_id", convId).order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []));

    const channel = supabase.channel(`chat:${convId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${convId}` }, 
      (payload) => setMessages((prev) => [...prev, payload.new]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [convId]);

  const handleSend = async () => {
    if (!text.trim() || !convId) return;
    const msgText = text;
    setText("");
    
    const optimisticMsg = { id: Math.random().toString(), text: msgText, sender_type: "client", created_at: new Date().toISOString() };
    setMessages(prev => [...prev, optimisticMsg]);

    await supabase.from("messages").insert([{ conversation_id: convId, sender_id: user.id, sender_type: "client", text: msgText }]);
    await supabase.from("conversations").update({ last_message_preview: msgText, updated_at: new Date().toISOString() }).eq("id", convId);
  };

  return (
    <div className={`fixed z-[9999] font-sans transition-all duration-300 ${isOpen ? 'inset-0 sm:inset-auto sm:bottom-6 sm:right-6' : 'bottom-6 right-6'}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="w-full h-full sm:w-[400px] sm:h-[650px] bg-[#0c0c1d] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/10"
          >
            {/* HEADER */}
            <div className="p-6 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg border border-white/20 relative">
                    <span className="text-black font-black text-xl italic font-serif">S</span>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0c0c1d]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-[0.2em] mb-1">Smile Support</h4>
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={10} className="text-yellow-400" />
                       <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Christina LIVE</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-8 bg-[radial-gradient(circle_at_bottom_left,_rgba(250,204,21,0.03),_transparent)] flex flex-col">
              
              {step === "gdpr" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                  <CheckCircle2 size={40} className="text-yellow-400" />
                  <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-black">Privacy & Security</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">Accept terms to initiate your secure support line.</p>
                  <button onClick={() => setStep("identity")} className="w-full bg-yellow-400 text-black font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-yellow-400/20 active:scale-95 transition-transform">Accept & Continue</button>
                </motion.div>
              )}

              {step === "identity" && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <UserCircle size={48} className="text-zinc-700" />
                  <div className="w-full space-y-2">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Your Identity</p>
                    <input 
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Type your name..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:border-yellow-400/50 outline-none transition-all text-center"
                    />
                  </div>
                  <button 
                    disabled={clientName.length < 3}
                    onClick={startNewConversation}
                    className="w-full bg-white text-black font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl shadow-xl active:scale-95 transition-all"
                  >
                    Start Chat
                  </button>
                </motion.div>
              )}

              {step === "chat" && (
                <div className="space-y-6">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-[13px] leading-relaxed shadow-lg ${
                        m.sender_type === 'client' ? 'bg-zinc-800 text-zinc-200 border border-white/5 rounded-tr-none' : 'bg-yellow-400 text-black font-extrabold rounded-tl-none'
                      }`}>{m.text}</div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* INPUT SECTION */}
            {step === "chat" && (
              <div className="p-6 bg-[#0c0c1d]/50 backdrop-blur-md border-t border-white/5">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 px-4 focus-within:border-yellow-400/50 transition-all">
                  <input 
                    value={text} onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none text-xs text-white py-3 outline-none"
                  />
                  <button onClick={handleSend} className="bg-yellow-400 text-black p-2.5 rounded-xl hover:scale-110 active:scale-95 transition-transform"><Send size={16} /></button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-yellow-400 rounded-[1.5rem] flex items-center justify-center shadow-2xl text-black shadow-yellow-400/20"
        >
          <MessageSquare size={30} strokeWidth={2.5} />
        </motion.button>
      )}
    </div>
  );
}
