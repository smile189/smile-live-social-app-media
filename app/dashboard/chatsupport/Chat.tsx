"use client";

import React, { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Clock,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  ChevronLeft,
  MessageCircle,
  Search,
  User,
  MoreHorizontal
} from "lucide-react";

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

  // SEARCH LOGIC
  const [searchTerm, setSearchTerm] = useState("");

  // unread counter
  const [unread, setUnread] = useState<Record<string, number>>({});

  const scrollRef = useRef<HTMLDivElement>(null);

  // ---------- DATE HELPERS ----------
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

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

  // ---------- AUTO SCROLL ----------
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ======================================================
  // CONVERSATIONS REALTIME
  // ======================================================
  useEffect(() => {
    const loadConversations = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      setConversations(data || []);
    };

    loadConversations();

    const channel = supabase
      .channel("dashboard-conversations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        (payload: any) => {
          setConversations((prev) => {
            const updated = [...prev];
            const idx = updated.findIndex((c) => c.id === payload.new.id);

            if (idx !== -1) updated[idx] = payload.new;
            else updated.unshift(payload.new);

            return [...updated].sort(
              (a, b) =>
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime()
            );
          });
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, []);

  // ======================================================
  // MESSAGES REALTIME
  // ======================================================
  useEffect(() => {
    if (!selectedConv) return;

    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", selectedConv.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []));

    setUnread((prev) => ({ ...prev, [selectedConv.id]: 0 }));

    const channel = supabase
      .channel(`messages:${selectedConv.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConv.id}`,
        },
        (payload: any) => {
          setMessages((prev) => {
            if (prev.find((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });

          if (payload.new.sender_type === "client") playNotificationSound();
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [selectedConv]);

  // 🔥 GLOBAL unread tracker
  useEffect(() => {
    const channel = supabase
      .channel("unread-global")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: any) => {
          if (payload.new.sender_type !== "client") return;

          const convId = payload.new.conversation_id;

          if (selectedConv?.id !== convId) {
            setUnread((prev) => ({
              ...prev,
              [convId]: (prev[convId] || 0) + 1,
            }));
          }
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [selectedConv]);

  // ======================================================
  // SEND
  // ======================================================
  const handleSend = async () => {
    if (!reply.trim() || !selectedConv) return;

    const { data: { user } } = await supabase.auth.getUser();

    const msgText = reply;
    setReply("");

    const tempId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender_type: "agent",
        text: msgText,
        created_at: new Date().toISOString(),
      },
    ]);

    await supabase.from("messages").insert([
      {
        id: tempId,
        conversation_id: selectedConv.id,
        sender_id: user?.id,
        sender_type: "agent",
        text: msgText,
      },
    ]);
  };

  const selectConversation = (conv: any) => {
    setSelectedConv(conv);
    setIsMobileListVisible(false);
    setUnread((p) => ({ ...p, [conv.id]: 0 }));
  };

  // FILTER LOGIC
  const filteredConversations = conversations.filter((c) =>
    c.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] md:h-[85vh] bg-white md:rounded-[2rem] overflow-hidden border border-slate-200 shadow-2xl font-sans m-0 md:m-4 ring-1 ring-black/5 transition-all">

      {/* SIDEBAR */}
      <div className={`${isMobileListVisible ? "flex" : "hidden"} md:flex w-full md:w-[360px] border-r border-slate-100 bg-slate-50/50 flex-col h-full shrink-0`}>
        <div className="p-6 space-y-5 bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">

              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800">
                Smile management message support chat
              </span>
            </div>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              {soundEnabled ? <Volume2 size={18} className="text-slate-600" /> : <VolumeX size={18} className="text-slate-400" />}
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" size={14} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:ring-4 ring-indigo-500/10 focus:border-indigo-200 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-2 px-3 pb-safe">
          <AnimatePresence initial={false}>
            {filteredConversations.map((c) => (
              <motion.div
                layout
                key={c.id}
                onClick={() => selectConversation(c)}
                className={`p-4 mb-2 cursor-pointer rounded-2xl transition-all border ${
                  selectedConv?.id === c.id
                    ? "bg-white border-indigo-100 shadow-sm ring-1 ring-indigo-500/10"
                    : "hover:bg-white/80 border-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${selectedConv?.id === c.id ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-slate-200 border-slate-300 text-slate-500"}`}>
                        <User size={14} />
                    </div>
                    <p className={`font-bold text-[13px] truncate ${selectedConv?.id === c.id ? "text-indigo-600" : "text-slate-700"}`}>
                      {c.user_email?.split("@")[0]}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-400 font-semibold">{formatTime(c.updated_at)}</span>
                    {unread[c.id] > 0 && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shadow-md shadow-indigo-200">
                        {unread[c.id]}
                      </motion.span>
                    )}
                  </div>
                </div>
                <p className="text-[12px] text-slate-500 truncate pl-10 opacity-80">{c.last_message || "Active customer session..."}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className={`${!isMobileListVisible ? "flex" : "hidden"} md:flex flex-1 flex-col h-full bg-white relative overflow-hidden`}>
        {selectedConv ? (
          <>
            <header className="shrink-0 h-[72px] border-b border-slate-100 flex items-center justify-between px-6 bg-white/90 backdrop-blur-md z-10">
              <div className="flex items-center gap-4 min-w-0">
                <button onClick={() => setIsMobileListVisible(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                  <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 uppercase">
                    {selectedConv.user_email?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-[14px] truncate leading-tight">{selectedConv.user_email}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active now</span>
                    </div>
                  </div>
                </div>
              </div>
              <MoreHorizontal className="text-slate-300 cursor-not-allowed" size={20} />
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50/20">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.sender_type === "agent" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[65%] group`}>
                      <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                        m.sender_type === "agent" ? "bg-slate-900 text-white rounded-tr-none shadow-indigo-100" : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                      }`}>
                        {m.text}
                      </div>
                      <p className={`text-[10px] mt-1.5 text-slate-400 font-medium px-1 flex items-center gap-1 ${m.sender_type === "agent" ? "justify-end" : "justify-start"}`}>
                        <Clock size={10} /> {formatTime(m.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <footer className="shrink-0 p-4 md:p-6 border-t border-slate-100 bg-white pb-safe">
              <div className="max-w-4xl mx-auto flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:ring-4 ring-indigo-500/5 transition-all">
                <input
                  autoFocus
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] px-3 py-2 text-slate-700"
                />
                <button
                  onClick={handleSend}
                  className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>

            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
            <MessageCircle size={48} className="text-slate-200 mb-4" />
            <h2 className="text-lg font-bold text-slate-800">Select a Conversation</h2>
            <p className="text-sm mt-2">Choose a customer inquiry to begin responding.</p>
          </div>
        )}
      </div>
    </div>
  );
}
