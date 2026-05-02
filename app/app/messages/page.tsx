/*
priivate mess services     
*/
"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Send, ChevronLeft, Shield, MoreHorizontal, Reply, Gift, 
  Search, MessageSquare, Loader2, Trash2, X, ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function DirectChatPage() {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
    )
  );

  const [me, setMe] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [activePartner, setActivePartner] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftTypes, setGiftTypes] = useState<any[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [isLoadingGifts, setIsLoadingGifts] = useState(false);
  const [activeGiftAnim, setActiveGiftAnim] = useState<any>(null);
  const [giftError, setGiftError] = useState(false);

  const getRoomId = (id1: string, id2: string) => [id1, id2].sort().join("_");
  const quickEmojis = ["❤️", "🔥", "😂", "😮", "🙌", "✨"];

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setMe(user);
        fetchRecentChats(user.id);
      }
    };
    init();
  }, [supabase]);

  const fetchRecentChats = async (userId: string) => {
    const { data } = await supabase
      .from("direct_messages")
      .select("room_id, sender_id, created_at")
      .or(`sender_id.eq.${userId},room_id.ilike.%${userId}%`)
      .order("created_at", { ascending: false });

    if (data) {
      const partnerIds = new Set();
      data.forEach(m => {
        const ids = m.room_id.split("_");
        const pId = ids[0] === userId ? ids[1] : ids[0];
        if (pId) partnerIds.add(pId);
      });
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", Array.from(partnerIds))
        .limit(15);

      if (profiles) setRecentChats(profiles);
    }
  };

  const deleteMessage = async (msgId: string) => {
    const { error } = await supabase.from("direct_messages").delete().eq("id", msgId);
    if (!error) setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const deleteFullChat = async () => {
    if (!activePartner || !me) return;
    const roomId = getRoomId(me.id, activePartner.id);
    const { error } = await supabase.from("direct_messages").delete().eq("room_id", roomId);
    if (!error) {
      setMessages([]);
      setShowOptions(false);
      setActivePartner(null);
      fetchRecentChats(me.id);
    }
  };

  const fetchGiftTypes = async () => {
    setIsLoadingGifts(true);
    const { data } = await supabase
      .from("gift_types")
      .select("*")
      .order("coin_price", { ascending: true });

    if (data) setGiftTypes(data);
    setIsLoadingGifts(false);
  };

  const sendGift = async (gift: any) => {
    if (!me || !activePartner) return;
    setGiftError(false);

    const { error } = await supabase.from("gifts").insert({
      sender_id: me.id,
      receiver_id: activePartner.id,
      amount: gift.coin_price
    });

    if (error) {
      setGiftError(true);
    } else {
      await handleSend(`[GIFT]:${gift.image_url}|${gift.name}|${gift.coin_price}`);
      setShowGiftModal(false);
    }
  };

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", me?.id)
        .limit(10);

      if (data) setSearchResults(data);
    };

    const debounce = setTimeout(searchUsers, 350);
    return () => clearTimeout(debounce);
  }, [searchQuery, me]);

  useEffect(() => {
    if (!me) return;

    const globalChannel = supabase
      .channel("global-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (payload) => {
        if (payload.new.room_id.includes(me.id) && payload.new.sender_id !== me.id) {
          fetchRecentChats(me.id);
        }
      })
      .subscribe();

    if (!activePartner) return;

    const roomId = getRoomId(me.id, activePartner.id);
    supabase
      .from("direct_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .then(({ data }) => data && setMessages(data));

    const roomChannel = supabase
      .channel(`room:${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          if (payload.new.content.startsWith("[GIFT]:")) {
            const [url, name] = payload.new.content.replace("[GIFT]:", "").split("|");
            setActiveGiftAnim({ url, name });
            setTimeout(() => setActiveGiftAnim(null), 4000);
          }
        })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "direct_messages", filter: `room_id=eq.${roomId}` },
        (payload) => setMessages(prev => prev.filter(m => m.id !== payload.old.id)))
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [activePartner, me]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (emojiContent?: string) => {
    const text = emojiContent || input;
    if (!text.trim() || !me || !activePartner) return;

    const finalContent = replyTo
      ? `⤵️ Replying to: "${replyTo.content.substring(0, 20)}..."\n${text}`
      : text;

    setInput("");
    setReplyTo(null);

    await supabase.from("direct_messages").insert({
      room_id: getRoomId(me.id, activePartner.id),
      sender_id: me.id,
      content: finalContent
    });
  };

  return (
    <div className="fixed inset-0 flex bg-[#FFF0F6] text-zinc-900 font-sans overflow-hidden">

      <AnimatePresence>
        {activeGiftAnim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none bg-pink-500/10 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: [0, 1.2, 1], rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative text-center px-4"
            >
              <img src={activeGiftAnim.url} className="w-40 h-40 md:w-64 md:h-64 object-contain mx-auto" />
              <h2 className="text-2xl md:text-4xl font-black text-pink-600 uppercase mt-4">New Gift!</h2>
              <p className="text-lg font-bold text-pink-400">{activeGiftAnim.name}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className={`${activePartner ? "hidden md:flex" : "flex"} w-full md:w-[320px] lg:w-[380px] flex-col bg-white border-r border-pink-100 h-full overflow-hidden`}>
        <div className="p-4 md:p-6 border-b border-pink-50">
          <div className="flex items-center justify-between mb-4">
            <Link href="/app" className="flex items-center gap-2">
              <div className="p-2 bg-pink-500 rounded-xl text-white"><ArrowLeft size={18} /></div>
              <span className="text-[10px] font-black uppercase text-pink-500">App Home</span>
            </Link>
            <div className="p-2 bg-yellow-400 rounded-full text-white shadow-lg shadow-yellow-100"><Shield size={16} /></div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-200" size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-pink-50/50 rounded-2xl py-2.5 pl-10 pr-4 text-sm outline-none border border-transparent focus:bg-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2">
          {(searchQuery.length >= 2 ? searchResults : recentChats).map(u => (
            <button
              key={u.id}
              onClick={() => setActivePartner(u)}
              className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${
                activePartner?.id === u.id ? "bg-pink-50" : "hover:bg-pink-50/50"
              }`}
            >
              <img src={u.avatar_url} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-sm" />
              <span className="font-bold text-sm truncate">{u.username}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className={`${!activePartner ? "hidden md:flex" : "flex"} flex-1 flex-col bg-white h-full`}>
        {activePartner ? (
          <>
            <header className="h-[60px] md:h-[70px] border-b border-pink-50 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setActivePartner(null)} className="md:hidden text-pink-500">
                  <ChevronLeft size={24} />
                </button>
                <img src={activePartner.avatar_url} className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
                <h3 className="font-bold text-sm md:text-base">{activePartner.username}</h3>
              </div>

              <div className="relative">
                <button onClick={() => setShowOptions(!showOptions)} className="p-2 text-zinc-400">
                  <MoreHorizontal />
                </button>

                {showOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-pink-100 rounded-2xl shadow-xl">
                    <button
                      onClick={deleteFullChat}
                      className="w-full flex items-center gap-2 p-4 text-red-500 hover:bg-red-50 text-xs font-bold"
                    >
                      <Trash2 size={16} /> DELETE CHAT
                    </button>
                  </div>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFF9FB]">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === me.id ? "justify-end" : "justify-start"}`}>
                  <div className="group relative max-w-[85%] md:max-w-[70%]">
                    <div className={`p-3 rounded-2xl shadow-sm ${
                      m.sender_id === me.id ? "bg-pink-500 text-white" : "bg-white border border-pink-100"
                    }`}>
                      {m.content.includes("⤵️") && (
                        <div className="mb-1 p-2 bg-black/5 rounded text-[10px] italic truncate">
                          {m.content.split("\n")[0]}
                        </div>
                      )}

                      {m.content.startsWith("[GIFT]:") ? (
                        <div className="text-center p-2">
                          <img src={m.content.split("|")[0].replace("[GIFT]:", "")} className="w-16 h-16 mx-auto" />
                          <p className="text-[9px] font-bold uppercase opacity-60">Magic Gift</p>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">
                          {m.content.includes("⤵️") ? m.content.split("\n").slice(1).join("\n") : m.content}
                        </p>
                      )}
                    </div>

                    <div className={`absolute top-0 ${m.sender_id === me.id ? "-left-12 flex-row-reverse" : "-right-12"} hidden group-hover:flex gap-1`}>
                      <button onClick={() => setReplyTo(m)} className="p-1.5 bg-white shadow-sm rounded-full text-pink-500">
                        <Reply size={12} />
                      </button>
                      <button onClick={() => deleteMessage(m.id)} className="p-1.5 bg-white shadow-sm rounded-full text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div ref={scrollRef} className="h-2" />
            </div>

            <footer className="p-3 md:p-4 bg-white border-t border-pink-50">
              {replyTo && (
                <div className="mb-2 p-2 bg-pink-50 rounded-xl flex items-center justify-between">
                  <p className="text-[10px] text-pink-600 truncate flex-1 pr-2">
                    Reply to: {replyTo.content.substring(0, 30)}...
                  </p>
                  <button onClick={() => setReplyTo(null)} className="text-pink-400">
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                {quickEmojis.map(e => (
                  <button key={e} onClick={() => handleSend(e)} className="text-xl hover:scale-125">
                    {e}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowGiftModal(true); fetchGiftTypes(); }}
                  className="p-3 bg-yellow-400 text-white rounded-xl"
                >
                  <Gift size={20} />
                </button>

                <div className="flex-1">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Message..."
                    className="w-full bg-pink-50/50 rounded-xl py-3 px-4 text-sm outline-none"
                  />
                </div>

                <button onClick={() => handleSend()} className="p-3 bg-pink-500 text-white rounded-xl">
                  <Send size={20} />
                </button>
              </div>
            </footer>

            <AnimatePresence>
              {showGiftModal && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25 }}
                  className="absolute inset-0 bg-white z-50 flex flex-col"
                >
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-black text-pink-600">SELECT GIFT 🎁</h2>
                    <button onClick={() => setShowGiftModal(false)} className="p-2 bg-pink-50 rounded-full">
                      <X size={20} />
                    </button>
                  </div>

                  {giftError && (
                    <div className="p-3 bg-red-50 text-center">
                      <p className="text-red-500 text-[10px] font-black uppercase">
                        Not enough coins!
                      </p>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {isLoadingGifts ? (
                      <Loader2 className="animate-spin text-pink-500 mx-auto col-span-full" />
                    ) : (
                      giftTypes.map(gt => (
                        <button
                          key={gt.id}
                          onClick={() => sendGift(gt)}
                          className="p-4 border border-pink-50 rounded-3xl flex flex-col items-center"
                        >
                          <img src={gt.image_url} className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                          <span className="text-[10px] font-bold mt-2">{gt.coin_price} 🪙</span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-pink-200 p-10 text-center italic opacity-60">
            <MessageSquare size={48} className="mb-4" />
            <p className="text-sm">Select a contact to start messaging</p>
          </div>
        )}
      </main>
    </div>
  );
}