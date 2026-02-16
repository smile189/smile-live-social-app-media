"use client";

import React, { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageSquare, CheckCircle2, UserCircle, User } from "lucide-react";

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

  // ---------------- RESTORE SESSION ----------------
  useEffect(() => {
    const savedName = localStorage.getItem("smile_chat_name");
    const savedConvId = localStorage.getItem("smile_chat_conv_id");

    if (savedName) {
      setClientName(savedName);
      setStep("chat");
    }

    if (savedConvId) {
      setConvId(savedConvId);
    }
  }, []);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // ---------------- CREATE CONVERSATION ----------------
  const startNewConversation = async () => {
    if (!user || !clientName) return;

    localStorage.setItem("smile_chat_name", clientName);

    const existing = localStorage.getItem("smile_chat_conv_id");

    if (existing) {
      const { data } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", existing)
        .single();

      if (data) {
        setConvId(existing);
        setStep("chat");
        return;
      }
    }

    const { data: newConv } = await supabase
      .from("conversations")
      .insert([
        {
          user_id: user.id,
          user_email: clientName,
          status: "open",
          last_message_preview: "Welcome to Smile Live",
        },
      ])
      .select()
      .single();

    if (newConv) {
      setConvId(newConv.id);
      localStorage.setItem("smile_chat_conv_id", newConv.id);

      // Mesaj Automat Welcome
      await supabase.from("messages").insert([
        {
          conversation_id: newConv.id,
          sender_id: "system", 
          sender_type: "support",
          text: "Welcome to Smile Live social media! We are happy to have you here. An agent will be with you shortly.",
        },
      ]);

      setStep("chat");
    }
  };

  // ---------------- FETCH + REALTIME ----------------
  useEffect(() => {
    if (!convId) return;

    let mounted = true;

    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (mounted) setMessages(data || []);
      });

    const channel = supabase
      .channel(`chat:${convId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.find((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, [convId]);

  // ---------------- SEND MESSAGE ----------------
  const handleSend = async () => {
    if (!text.trim() || !convId) return;

    const msgText = text;
    setText("");

    const tempId = crypto.randomUUID();

    const optimistic = {
      id: tempId,
      conversation_id: convId,
      sender_id: user.id,
      sender_type: "client",
      text: msgText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);

    await supabase.from("messages").insert([
      {
        id: tempId,
        conversation_id: convId,
        sender_id: user.id,
        sender_type: "client",
        text: msgText,
      },
    ]);

    await supabase
      .from("conversations")
      .update({
        last_message_preview: msgText,
        updated_at: new Date().toISOString(),
      })
      .eq("id", convId);
  };

  return (
    <div className={`fixed z-[9999] font-sans transition-all duration-300 ${isOpen ? 'inset-0 sm:inset-auto sm:bottom-6 sm:right-6' : 'bottom-6 right-6'}`}>
      {/* WIDGET ICON - DREPTUNGHIULAR / PĂTRĂȚOS ROTUNJIT */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-yellow-400 p-4 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-black/5"
        >
          <MessageSquare className="text-black" size={32} />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.15 }}
            className="relative w-full h-full sm:w-[400px] sm:h-[650px] bg-[#0c0c1d] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-none sm:border sm:border-white/10"
          >
            {/* IMAGINE FUNDAL FIXĂ */}
            <div 
              className="absolute inset-0 opacity-[0.12] pointer-events-none grayscale z-0" 
              style={{ backgroundImage: "url('/chat.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}
            />

            {/* HEADER */}
            <div className="relative z-10 p-5 sm:p-6 bg-yellow-400 flex items-center justify-between border-b-2 border-yellow-500/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black flex items-center justify-center relative shadow-lg">
                  <span className="text-yellow-400 font-black text-lg sm:text-xl italic font-serif">S</span>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-yellow-400" />
                </div>
                <div>
                  <h4 className="text-[10px] sm:text-xs font-black uppercase text-black tracking-widest leading-none mb-1">Smile chat Support</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-700 animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] text-black/60 font-bold uppercase tracking-widest">Christina LIVE</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/10 rounded-lg text-black transition-colors">
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            {/* CONTENT AREA */}
            <div className="relative z-10 flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col">
              <div className="flex-1 flex flex-col">
                {step === "gdpr" && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                    <CheckCircle2 size={44} className="text-yellow-400" />
                    <div className="space-y-2">
                      <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-black">Privacy Secured</p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed max-w-[200px]">Accept terms to initiate your secure support line.</p>
                    </div>
                    <button onClick={() => setStep("identity")} className="w-full bg-yellow-400 text-black font-black text-[10px] uppercase py-4 rounded-2xl shadow-xl active:scale-95 transition-all">Accept & Continue</button>
                  </div>
                )}

                {step === "identity" && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <UserCircle size={52} className="text-zinc-700" />
                    <div className="w-full space-y-2 text-center">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Identify Yourself</p>
                      <input
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && startNewConversation()}
                        placeholder="Type your name..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white text-center outline-none focus:border-yellow-400/50 transition-all"
                      />
                    </div>
                    <button onClick={startNewConversation} className="w-full bg-yellow-400 text-black font-black text-[10px] uppercase py-4 rounded-2xl shadow-xl active:scale-95 transition-all">Start Chat</button>
                  </div>
                )}

                {step === "chat" && (
                  <div className="flex-1 flex flex-col space-y-6">
                    <AnimatePresence initial={false}>
                      {messages.map((m) => (
                        <motion.div 
                          key={m.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`flex items-end gap-2 ${m.sender_type === "client" ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-md ${m.sender_type === "client" ? "bg-zinc-800 text-yellow-400 border border-white/10" : "bg-yellow-400 text-black"}`}>
                            {m.sender_type === "client" ? <User size={14} /> : <span className="font-serif italic">S</span>}
                          </div>

                          <div className={`max-w-[75%] p-3 rounded-2xl text-xs flex flex-col shadow-sm ${m.sender_type === "client" ? "bg-yellow-400 text-black rounded-br-none" : "bg-white/10 text-white rounded-bl-none border border-white/5"}`}>
                            <span className="opacity-40 text-[8px] mb-1 uppercase font-black tracking-tighter">
                              {m.sender_type === "client" ? clientName : "Support Team"}
                            </span>
                            {m.text}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* INPUT AREA + FOOTER */}
            <div className="relative z-10 bg-[#0c0c1d] border-t border-white/10">
              {step === "chat" && (
                <div className="p-4 flex items-center gap-2">
                  <input 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type message..."
                    className="flex-1 bg-transparent border-none text-white text-sm outline-none px-2"
                  />
                  <button onClick={handleSend} className="p-2.5 bg-yellow-400 rounded-xl text-black shadow-lg">
                    <Send size={18} />
                  </button>
                </div>
              )}
              <div className="pb-3 pt-1 text-center">
                <p className="text-[8px] text-zinc-600  tracking-[0.25em] font-black">
                  © {new Date().getFullYear()}chat designed by smile team
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
