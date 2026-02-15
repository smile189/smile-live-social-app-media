"use client";

import React, { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion } from "framer-motion";
import {
  Send,
  Clock,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  ChevronLeft,
  MessageCircle,
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

  // 🔥 unread counter
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
    const ctx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
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

    return () => channel.unsubscribe();
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

    // reset unread when open chat
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

          if (payload.new.sender_type === "client") {
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
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

    return () => channel.unsubscribe();
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

  return (
    <div className="flex flex-col md:flex-row h-[90vh] md:h-[75vh] bg-white md:rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl font-sans m-2 md:m-0">

      {/* SIDEBAR */}
      <div className={`${isMobileListVisible ? "flex" : "hidden"} md:flex w-full md:w-1/3 border-r border-slate-100 bg-slate-50 flex-col`}>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Smile Panel
            </span>
            <button onClick={() => setSoundEnabled(!soundEnabled)}>
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
          <Zap size={16} className="text-yellow-500 fill-yellow-500" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => selectConversation(c)}
              className={`p-5 cursor-pointer border-b ${
                selectedConv?.id === c.id
                  ? "bg-white shadow-sm"
                  : "hover:bg-slate-200/50"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <p className="font-black text-[11px] uppercase truncate">
                  {c.user_email?.split("@")[0]}
                </p>

                <div className="flex items-center gap-2">
                  {unread[c.id] > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unread[c.id]}
                    </span>
                  )}

                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock size={10} />
                    {formatTime(c.updated_at)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 truncate">
                {c.last_message_preview}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className={`${!isMobileListVisible ? "flex" : "hidden"} md:flex flex-1 flex-col`}>
        {selectedConv ? (
          <>
            <div className="p-4 md:p-6 border-b flex justify-between bg-white">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsMobileListVisible(true)} className="md:hidden">
                  <ChevronLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center font-black">
                  {selectedConv.user_email?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-black">{selectedConv.user_email}</p>
                  <span className="text-[10px] text-green-600 font-bold">LIVE</span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-xl">
                <ShieldCheck size={12} className="text-yellow-400" />
                <span className="text-[9px] text-white font-black">Agent</span>
              </div>
            </div>

            {/* 🔥 DARKER CHAT BG */}
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-200">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  className={`flex ${m.sender_type === "agent" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col max-w-[70%]">
                    <div
                      className={`px-5 py-3 rounded-3xl text-sm ${
                        m.sender_type === "agent"
                          ? "bg-yellow-400 text-black rounded-tr-none"
                          : "bg-white border rounded-tl-none"
                      }`}
                    >
                      {m.text}
                    </div>

                    {/* 🕒 TIME */}
                    <span className="text-[10px] mt-1 text-slate-600 px-2">
                      {formatTime(m.created_at)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4 bg-white border-t">
              <div className="flex gap-2 bg-slate-100 rounded-2xl p-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 bg-transparent px-3 outline-none"
                  placeholder="Type your message..."
                />
                <button onClick={handleSend} className="p-3 bg-yellow-400 rounded-xl">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <MessageCircle size={48} />
          </div>
        )}
      </div>
    </div>
  );
}
