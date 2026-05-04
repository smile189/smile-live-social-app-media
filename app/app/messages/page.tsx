/*
 * SMILE LIVE — Direct Messages
 * Design: Soft luxury · pink/rose palette · glassmorphism · fluid animations
 */
"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Send, ChevronLeft, Shield, MoreHorizontal, Reply, Gift,
  Search, MessageSquare, Loader2, Trash2, X, ArrowLeft,
  Check, CheckCheck, Sparkles, Heart
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SharedPostCard from "@/app/app/post/[id]/SharedPostCard";
// ↑ Ajustează path-ul dacă SharedPostCard e în altă locație

// ✅ Fix: supabase creat o singură dată (evită Invalid Refresh Token)
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

const getRoomId = (id1: string, id2: string) => [id1, id2].sort().join("_");
const quickEmojis = ["❤️", "🔥", "😂", "😮", "🙌", "✨", "💫", "🎉"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parsează content-ul unui mesaj și returnează tipul */
function parseMessageContent(content: string): { type: "text" | "gift" | "post_share"; payload: any } {
  if (content.startsWith("[GIFT]:")) {
    return { type: "gift", payload: content };
  }
  try {
    const parsed = JSON.parse(content);
    if (parsed?.type === "post_share") {
      return { type: "post_share", payload: parsed };
    }
  } catch {}
  return { type: "text", payload: content };
}

/** Preview text pentru sidebar */
function getPreviewText(content: string): string {
  const { type } = parseMessageContent(content);
  if (type === "gift")      return "🎁 A trimis un cadou";
  if (type === "post_share") return "📹 A distribuit un clip";
  return content;
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────

function Avatar({ url, username, size = "md", online = false }: {
  url?: string; username?: string; size?: "sm" | "md" | "lg"; online?: boolean;
}) {
  const [err, setErr] = useState(false);
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  const colors = ["bg-pink-200 text-pink-700", "bg-rose-200 text-rose-700", "bg-fuchsia-200 text-fuchsia-700", "bg-purple-200 text-purple-700"];
  const col = colors[(username?.charCodeAt(0) || 0) % colors.length];

  return (
    <div className="relative shrink-0">
      <div className={`${sz} rounded-full overflow-hidden border-2 border-white shadow-md flex items-center justify-center font-black ${!url || err ? col : ""}`}>
        {!err && url
          ? <img src={url} className="w-full h-full object-cover" onError={() => setErr(true)} alt="" />
          : <span className="uppercase">{username?.[0] || "?"}</span>}
      </div>
      {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white shadow" />}
    </div>
  );
}

// ─── GIFT ANIMATION ───────────────────────────────────────────────────────────

function GiftAnimation({ gift, onDone }: { gift: any; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none"
      style={{ background: "radial-gradient(circle at center, rgba(236,72,153,0.15) 0%, transparent 70%)" }}>
      {[...Array(12)].map((_, i) => (
        <motion.div key={i} className="absolute w-2 h-2 rounded-full bg-pink-400"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 400, scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, delay: i * 0.1 }} />
      ))}
      <motion.div initial={{ scale: 0, rotate: -20, y: 40 }} animate={{ scale: [0, 1.15, 1], rotate: 0, y: 0 }}
        transition={{ duration: 0.7, type: "spring", damping: 15 }} className="text-center">
        <motion.div animate={{ rotate: [0, -5, 5, -3, 3, 0] }} transition={{ duration: 0.6, delay: 0.5, repeat: 2 }}>
          <img src={gift.url} className="w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-2xl" />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="text-2xl md:text-3xl font-black text-pink-600 uppercase tracking-tight mt-4">✨ New Gift!</motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="text-pink-400 font-bold mt-1">{gift.name}</motion.p>
      </motion.div>
    </motion.div>
  );
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────

function MessageBubble({ m, isMe, onReply, onDelete }: {
  m: any; isMe: boolean; onReply: () => void; onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const { type, payload } = parseMessageContent(m.content);

  const isReply = type === "text" && m.content.includes("⤵️");
  const mainContent = isReply ? m.content.split("\n").slice(1).join("\n") : m.content;
  const replyPreview = isReply ? m.content.split("\n")[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`relative ${type === "post_share" ? "max-w-[260px]" : "max-w-[78%] md:max-w-[65%]"}`}>

        {/* ── POST SHARE CARD ── */}
        {type === "post_share" && (
          <div className="relative">
            <SharedPostCard payload={payload} isMine={isMe} />
            <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
              <span className="text-[9px] text-zinc-400">
                {new Date(m.created_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
              </span>
              {isMe && <CheckCheck size={11} className="text-pink-400" />}
            </div>
            {/* Actions */}
            <AnimatePresence>
              {showActions && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className={`absolute -top-8 ${isMe ? "right-0" : "left-0"} flex items-center gap-1 bg-white border border-pink-100 rounded-full px-2 py-1 shadow-lg z-10`}>
                  <button onClick={onDelete} className="p-1 text-red-300 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── GIFT ── */}
        {type === "gift" && (
          <div className={`relative px-4 py-2.5 rounded-[1.2rem] shadow-sm ${isMe ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-br-md" : "bg-white border border-pink-100 text-zinc-800 rounded-bl-md"}`}>
            <div className="text-center py-1 px-2">
              <img src={payload.split("|")[0].replace("[GIFT]:", "")} className="w-14 h-14 mx-auto object-contain" />
              <p className={`text-[9px] font-black uppercase mt-1 ${isMe ? "text-pink-200" : "text-pink-400"}`}>
                🎁 {payload.split("|")[1]}
              </p>
            </div>
            <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
              <span className="text-[9px] text-pink-200">{new Date(m.created_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}</span>
              {isMe && <CheckCheck size={11} className="text-pink-200" />}
            </div>
            <AnimatePresence>
              {showActions && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className={`absolute -top-8 ${isMe ? "right-0" : "left-0"} flex items-center gap-1 bg-white border border-pink-100 rounded-full px-2 py-1 shadow-lg z-10`}>
                  <button onClick={onDelete} className="p-1 text-red-300 hover:text-red-500"><Trash2 size={12} /></button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── TEXT ── */}
        {type === "text" && (
          <>
            {replyPreview && (
              <div className={`mb-1 px-3 py-1.5 rounded-xl text-[10px] italic truncate border-l-2 ${isMe ? "bg-pink-400/30 border-pink-300 text-pink-100" : "bg-pink-50 border-pink-300 text-pink-500"}`}>
                {replyPreview.replace("⤵️ Replying to: ", "")}
              </div>
            )}
            <div className={`relative px-4 py-2.5 rounded-[1.2rem] shadow-sm ${isMe ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-br-md" : "bg-white border border-pink-100 text-zinc-800 rounded-bl-md"}`}>
              <p className="text-sm leading-relaxed break-words">{mainContent}</p>
            </div>
            <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
              <span className="text-[9px] text-zinc-400">{new Date(m.created_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}</span>
              {isMe && <CheckCheck size={11} className="text-pink-400" />}
            </div>
            <AnimatePresence>
              {showActions && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className={`absolute -top-8 ${isMe ? "right-0" : "left-0"} flex items-center gap-1 bg-white border border-pink-100 rounded-full px-2 py-1 shadow-lg z-10`}>
                  <button onClick={onReply} className="p-1 text-pink-400 hover:text-pink-600"><Reply size={12} /></button>
                  <div className="w-px h-3 bg-pink-100" />
                  <button onClick={onDelete} className="p-1 text-red-300 hover:text-red-500"><Trash2 size={12} /></button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function DirectChatPage() {
  const [me, setMe]                         = useState<any>(null);
  const [searchQuery, setSearchQuery]       = useState("");
  const [searchResults, setSearchResults]   = useState<any[]>([]);
  const [recentChats, setRecentChats]       = useState<any[]>([]);
  const [activePartner, setActivePartner]   = useState<any>(null);
  const [messages, setMessages]             = useState<any[]>([]);
  const [input, setInput]                   = useState("");
  const [replyTo, setReplyTo]               = useState<any>(null);
  const [sending, setSending]               = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showGiftModal, setShowGiftModal]   = useState(false);
  const [giftTypes, setGiftTypes]           = useState<any[]>([]);
  const [showOptions, setShowOptions]       = useState(false);
  const [isLoadingGifts, setIsLoadingGifts] = useState(false);
  const [activeGiftAnim, setActiveGiftAnim] = useState<any>(null);
  const [giftError, setGiftError]           = useState(false);
  const [sendingGift, setSendingGift]       = useState<string | null>(null);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
  }, []);

  const fetchRecentChats = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("direct_messages")
      .select("room_id, sender_id, created_at, content")
      .or(`sender_id.eq.${userId},room_id.ilike.%${userId}%`)
      .order("created_at", { ascending: false });

    if (data) {
      const partnerMap = new Map<string, string>();
      data.forEach(m => {
        const ids = m.room_id.split("_");
        const pId = ids[0] === userId ? ids[1] : ids[0];
        if (pId && !partnerMap.has(pId)) partnerMap.set(pId, m.content);
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, is_live")
        .in("id", Array.from(partnerMap.keys()))
        .limit(20);

      if (profiles) {
        setRecentChats(profiles.map(p => ({
          ...p,
          lastMessage: partnerMap.get(p.id) || "",
        })));
      }
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { setMe(user); fetchRecentChats(user.id); }
    };
    init();
  }, [fetchRecentChats]);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, is_live")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", me?.id)
        .limit(10);
      if (data) setSearchResults(data);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, me]);

  useEffect(() => {
    if (!me) return;

    const globalCh = supabase
      .channel("global-dm-notif")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (payload) => {
        if (payload.new.room_id.includes(me.id) && payload.new.sender_id !== me.id) fetchRecentChats(me.id);
      })
      .subscribe();

    if (!activePartner) return () => { supabase.removeChannel(globalCh); };

    const roomId = getRoomId(me.id, activePartner.id);

    supabase.from("direct_messages")
      .select("*").eq("room_id", roomId).order("created_at", { ascending: true })
      .then(({ data }) => data && setMessages(data));

    const roomCh = supabase
      .channel(`room:${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          if (payload.new.content.startsWith("[GIFT]:")) {
            const parts = payload.new.content.replace("[GIFT]:", "").split("|");
            setActiveGiftAnim({ url: parts[0], name: parts[1] });
          }
        })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "direct_messages", filter: `room_id=eq.${roomId}` },
        (payload) => setMessages(prev => prev.filter(m => m.id !== payload.old.id)))
      .subscribe();

    return () => { supabase.removeChannel(globalCh); supabase.removeChannel(roomCh); };
  }, [activePartner, me, fetchRecentChats]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (emojiContent?: string) => {
    const text = emojiContent || input.trim();
    if (!text || !me || !activePartner || sending) return;
    const finalContent = replyTo
      ? `⤵️ Replying to: "${replyTo.content.substring(0, 30)}..."\n${text}`
      : text;
    setInput(""); setReplyTo(null); setSending(true);
    await supabase.from("direct_messages").insert({
      room_id: getRoomId(me.id, activePartner.id),
      sender_id: me.id,
      content: finalContent,
    });
    setSending(false);
  };

  const deleteMessage = async (msgId: string) => {
    await supabase.from("direct_messages").delete().eq("id", msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const deleteFullChat = async () => {
    if (!activePartner || !me) return;
    const roomId = getRoomId(me.id, activePartner.id);
    await supabase.from("direct_messages").delete().eq("room_id", roomId);
    setMessages([]); setShowOptions(false); setActivePartner(null);
    fetchRecentChats(me.id);
  };

  const fetchGiftTypes = async () => {
    setIsLoadingGifts(true);
    const { data } = await supabase.from("gift_types").select("*").order("coin_price", { ascending: true });
    if (data) setGiftTypes(data);
    setIsLoadingGifts(false);
  };

  const sendGift = async (gift: any) => {
    if (!me || !activePartner || sendingGift) return;
    setGiftError(false); setSendingGift(gift.id);
    const { error } = await supabase.from("gifts").insert({ sender_id: me.id, receiver_id: activePartner.id, amount: gift.coin_price });
    if (error) { setGiftError(true); }
    else { await handleSend(`[GIFT]:${gift.image_url}|${gift.name}|${gift.coin_price}`); setShowGiftModal(false); }
    setSendingGift(null);
  };

  const displayList = searchQuery.length >= 2 ? searchResults : recentChats;

  return (
    <div className="fixed inset-0 flex font-sans overflow-hidden"
      style={{ background: "linear-gradient(135deg, #FFF0F6 0%, #FDF2F8 50%, #FFF5F7 100%)" }}>

      <AnimatePresence>
        {activeGiftAnim && <GiftAnimation gift={activeGiftAnim} onDone={() => setActiveGiftAnim(null)} />}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      <aside className={`${activePartner ? "hidden md:flex" : "flex"} w-full md:w-[300px] lg:w-[360px] flex-col h-full`}
        style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(251,207,232,0.5)" }}>

        <div className="px-5 pt-6 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/app" className="flex items-center gap-2 group">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl text-white shadow-md shadow-pink-200">
                <ArrowLeft size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Home</span>
            </Link>
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-md shadow-amber-100">
              <Shield size={14} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-zinc-900 tracking-tighter">Messages <span className="text-pink-400">✦</span></h1>

          <div className="relative group">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-pink-500 transition-colors" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Find someone..."
              className="w-full bg-white/80 border border-pink-100 focus:border-pink-300 rounded-2xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-pink-200 text-zinc-700 shadow-sm" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-500">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {displayList.length === 0 && searchQuery.length >= 2 && (
            <div className="text-center py-8 text-pink-200 text-xs font-bold uppercase tracking-widest">No users found</div>
          )}
          {displayList.map((u, i) => (
            <motion.button key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => setActivePartner(u)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group ${activePartner?.id === u.id ? "bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 shadow-sm" : "hover:bg-white/70"}`}>
              <Avatar url={u.avatar_url} username={u.username} online={u.is_live} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-zinc-800 truncate">@{u.username}</p>
                {u.lastMessage && (
                  // ✅ Preview corect pentru post_share, gift, text
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {getPreviewText(u.lastMessage)}
                  </p>
                )}
              </div>
              {activePartner?.id === u.id && <div className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />}
            </motion.button>
          ))}
        </div>
      </aside>

      {/* ── MAIN CHAT ── */}
      <main className={`${!activePartner ? "hidden md:flex" : "flex"} flex-1 flex-col h-full relative`}>
        {activePartner ? (
          <>
            {/* Header */}
            <div className="shrink-0 px-5 py-3 flex items-center justify-between border-b border-pink-100/50"
              style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)" }}>
              <div className="flex items-center gap-3">
                <button onClick={() => setActivePartner(null)} className="md:hidden p-2 text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all">
                  <ChevronLeft size={22} />
                </button>
                <Avatar url={activePartner.avatar_url} username={activePartner.username} online={activePartner.is_live} />
                <div>
                  <h3 className="font-black text-zinc-900 text-sm">@{activePartner.username}</h3>
                  <p className={`text-[10px] font-bold ${activePartner.is_live ? "text-emerald-500" : "text-zinc-400"}`}>
                    {activePartner.is_live ? "● Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setShowOptions(!showOptions)} className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-pink-50 rounded-xl transition-all">
                  <MoreHorizontal size={20} />
                </button>
                <AnimatePresence>
                  {showOptions && (
                    <motion.div initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-pink-100 rounded-2xl shadow-xl overflow-hidden z-20">
                      <button onClick={deleteFullChat} className="w-full flex items-center gap-2.5 px-4 py-3 text-red-500 hover:bg-red-50 text-xs font-bold transition-colors">
                        <Trash2 size={14} /> Delete entire chat
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3"
              style={{ background: "linear-gradient(180deg, #FFF5F8 0%, #FFF0F5 100%)" }}>
              {messages.length > 0 && (
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-pink-100" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-pink-300 px-2">Today</span>
                  <div className="flex-1 h-px bg-pink-100" />
                </div>
              )}

              {messages.map((m) => (
                <MessageBubble key={m.id} m={m} isMe={m.sender_id === me?.id}
                  onReply={() => setReplyTo(m)} onDelete={() => deleteMessage(m.id)} />
              ))}

              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                    <Heart size={28} className="text-pink-300" />
                  </div>
                  <p className="text-sm font-bold text-pink-300">Start the conversation!</p>
                  <p className="text-xs text-pink-200">Say hi to @{activePartner.username} 👋</p>
                </div>
              )}
              <div ref={scrollRef} className="h-1" />
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-pink-100/60 px-4 py-3 space-y-2.5"
              style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)" }}>
              <AnimatePresence>
                {replyTo && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between bg-pink-50 border border-pink-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Reply size={12} className="text-pink-400 shrink-0" />
                      <p className="text-[10px] text-pink-500 font-bold truncate">{replyTo.content.substring(0, 40)}...</p>
                    </div>
                    <button onClick={() => setReplyTo(null)} className="text-pink-300 hover:text-pink-500 ml-2 shrink-0"><X size={13} /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
                {quickEmojis.map(e => (
                  <button key={e} onClick={() => handleSend(e)} className="text-lg hover:scale-125 active:scale-95 transition-transform shrink-0">{e}</button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => { setShowGiftModal(true); fetchGiftTypes(); }}
                  className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-2xl shadow-md shadow-amber-200 hover:shadow-amber-300 transition-all active:scale-95 shrink-0">
                  <Gift size={18} />
                </button>
                <div className="flex-1 relative">
                  <input value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Type a message..."
                    className="w-full bg-pink-50/80 border border-pink-100 focus:border-pink-300 rounded-2xl py-3 pl-4 pr-4 text-sm outline-none transition-all placeholder:text-pink-200 text-zinc-800" />
                </div>
                <button onClick={() => handleSend()} disabled={!input.trim() || sending}
                  className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl shadow-md shadow-pink-200 hover:shadow-pink-300 disabled:opacity-40 transition-all active:scale-95 shrink-0">
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>

            {/* Gift Modal */}
            <AnimatePresence>
              {showGiftModal && (
                <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 26, stiffness: 300 }}
                  className="absolute inset-0 z-50 flex flex-col"
                  style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}>
                  <div className="px-5 py-4 border-b border-pink-100 flex items-center justify-between shrink-0">
                    <div>
                      <h2 className="font-black text-lg text-zinc-900 tracking-tight">Send a Gift <span className="text-pink-500">🎁</span></h2>
                      <p className="text-[10px] text-zinc-400 font-medium mt-0.5">to @{activePartner.username}</p>
                    </div>
                    <button onClick={() => { setShowGiftModal(false); setGiftError(false); }}
                      className="p-2 bg-pink-50 hover:bg-pink-100 rounded-xl text-pink-400 transition-all"><X size={18} /></button>
                  </div>
                  <AnimatePresence>
                    {giftError && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="mx-5 mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                        <X size={13} className="text-red-400 shrink-0" />
                        <p className="text-xs font-bold text-red-500">Not enough coins!</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex-1 overflow-y-auto p-5">
                    {isLoadingGifts ? (
                      <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-pink-400" size={28} /></div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {giftTypes.map((gt, i) => (
                          <motion.button key={gt.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            onClick={() => sendGift(gt)} disabled={sendingGift === gt.id}
                            className="relative p-4 bg-white border-2 border-pink-100 hover:border-pink-300 rounded-3xl flex flex-col items-center gap-2 transition-all hover:shadow-md hover:shadow-pink-100 active:scale-95 group">
                            {sendingGift === gt.id ? <Loader2 size={32} className="animate-spin text-pink-400" /> : <img src={gt.image_url} className="w-14 h-14 object-contain group-hover:scale-110 transition-transform" />}
                            <p className="text-[10px] font-black text-zinc-600 truncate w-full text-center">{gt.name}</p>
                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <span className="text-[9px] font-black text-amber-600">{gt.coin_price} 🪙</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 border-2 border-pink-200 flex items-center justify-center mb-6 shadow-lg shadow-pink-100">
              <MessageSquare size={32} className="text-pink-400" />
            </motion.div>
            <h3 className="text-lg font-black text-zinc-800 mb-2">No chat selected</h3>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">Pick a conversation from the left or search for someone.</p>
          </div>
        )}
      </main>
    </div>
  );
}