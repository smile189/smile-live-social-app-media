"use client";

import React, { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, CheckCircle2, UserCircle, User } from "lucide-react";

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
  const [unread, setUnread] = useState(0);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  /* ---------------- RESTORE SESSION ---------------- */
  useEffect(() => {
    const savedName = localStorage.getItem("smile_chat_name");
    const savedConvId = localStorage.getItem("smile_chat_conv_id");

    if (savedName) {
      setClientName(savedName);
      setStep("chat");
    }

    if (savedConvId) setConvId(savedConvId);
  }, []);

  /* ---------------- STABLE AUTO SCROLL ---------------- */
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages.length]);

  /* ---------------- REALTIME + UNREAD LOGIC ---------------- */
  useEffect(() => {
    if (!convId) return;

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
          const msg = payload.new as any;

          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });

          // increment unread ONLY if chat is closed and message is from support
          if (!isOpen && msg.sender_type !== "client") {
            setUnread((u) => u + 1);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [convId, isOpen]);

  /* ---------------- OPEN CHAT => RESET UNREAD ---------------- */
  useEffect(() => {
    if (isOpen) setUnread(0);
  }, [isOpen]);

  /* ---------------- CREATE CONVERSATION ---------------- */
  const startNewConversation = async () => {
    if (!user || !clientName) return;

    localStorage.setItem("smile_chat_name", clientName);

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

    if (!newConv) return;

    setConvId(newConv.id);
    localStorage.setItem("smile_chat_conv_id", newConv.id);

    await supabase.from("messages").insert([
      {
        conversation_id: newConv.id,
        sender_id: "system",
        sender_type: "support",
        text:
          "Welcome to Smile Live! I’m Christina, your support specialist. How may I assist you today?",
      },
    ]);

    setStep("chat");
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = async () => {
    if (!text.trim() || !convId) return;

    const msgText = text;
    setText("");

    const tempId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender_type: "client",
        text: msgText,
      },
    ]);

    await supabase.from("messages").insert([
      {
        id: tempId,
        conversation_id: convId,
        sender_id: user.id,
        sender_type: "client",
        text: msgText,
      },
    ]);
  };

  return (
    <>
      {/* OPEN BUTTON WITH BADGE */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-yellow-400 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition z-[9999]"
        >
          <img src="/chat2.png" className="p-3" />

          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full h-full sm:w-[420px] sm:h-[700px] bg-[#0c0c1d] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden z-[9999]"
          >
            {/* BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div
                className="absolute inset-0 bg-cover bg-center grayscale"
                style={{ backgroundImage: "url('/chat.webp')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c1d]/80 via-[#0c0c1d]/90 to-[#0c0c1d]" />
            </div>

            {/* HEADER */}
            <div className="relative z-10 px-6 py-5 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-black">
                  Christina M.
                </h4>
                <p className="text-[10px] text-black/70 font-bold uppercase tracking-wider">
                  Senior Support Specialist • Live
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/10"
              >
                <X size={20} className="text-black" />
              </button>
            </div>

            {/* CONTENT */}
            <div
              ref={messagesContainerRef}
              className="relative z-10 flex-1 overflow-y-auto p-6 space-y-4"
            >
              {step === "gdpr" && (
                <div className="text-center space-y-6 mt-20">
                  <CheckCircle2 size={44} className="text-yellow-400 mx-auto" />
                  <button
                    onClick={() => setStep("identity")}
                    className="w-full bg-yellow-400 text-black font-black text-xs uppercase py-3 rounded-xl"
                  >
                    Accept & Continue
                  </button>
                </div>
              )}

              {step === "identity" && (
                <div className="space-y-4 mt-20">
                  <UserCircle size={50} className="mx-auto text-zinc-600" />
                  <input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Type your name..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center"
                  />
                  <button
                    onClick={startNewConversation}
                    className="w-full bg-yellow-400 text-black font-black text-xs uppercase py-3 rounded-xl"
                  >
                    Start Chat
                  </button>
                </div>
              )}

              {step === "chat" &&
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.sender_type === "client"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] p-3 text-xs rounded-2xl ${
                        m.sender_type === "client"
                          ? "bg-yellow-400 text-black"
                          : "bg-white/10 text-white border border-white/5"
                      }`}
                    >
                      <div className="text-[8px] opacity-40 uppercase mb-1 font-bold tracking-wider">
                        {m.sender_type === "client"
                          ? clientName
                          : "Christina M."}
                      </div>
                      {m.text}
                    </div>
                  </div>
                ))}
            </div>

            {/* INPUT + FOOTER */}
            <div className="relative z-10 bg-[#0c0c1d] border-t border-white/10">
              {step === "chat" && (
                <div className="p-4 flex items-center gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type message..."
                    className="flex-1 bg-transparent text-white text-sm outline-none px-2"
                  />
                  <button
                    onClick={handleSend}
                    className="p-2.5 bg-yellow-400 rounded-xl text-black shadow-lg"
                  >
                    <Send size={18} />
                  </button>
                </div>
              )}

              <div className="pb-6 pt-4 text-center border-t border-white/5">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                  © {new Date().getFullYear()} SmileLiveApp™
                </p>
                <p className="text-[9px] text-zinc-600 mt-1">
                  powered by smile live technology
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}