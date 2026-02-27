"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Send, ChevronLeft, Shield, MoreHorizontal, CheckCheck, 
  Search, MessageSquare, Loader2, User, Menu, X, Home, ArrowLeft, Trash2, Reply, Gift, Sparkles, Coins
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function DirectChatPage() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  ));

  const [me, setMe] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [activePartner, setActivePartner] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
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
      const { data: profiles } = await supabase.from("profiles").select("*").in("id", Array.from(partnerIds)).limit(15);
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
      fetchRecentChats(me.id);
    }
  };

  const fetchGiftTypes = async () => {
    setIsLoadingGifts(true);
    const { data } = await supabase.from("gift_types").select("*").order("coin_price", { ascending: true });
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
      if (searchQuery.length < 2) { setSearchResults([]); return; }
      setIsSearching(true);
      const { data } = await supabase.from("profiles").select("*").ilike("username", `%${searchQuery}%`).neq("id", me?.id).limit(5);
      if (data) setSearchResults(data);
      setIsSearching(false);
    };
    const debounce = setTimeout(searchUsers, 400);
    return () => clearTimeout(debounce);
  }, [searchQuery, me]);

  useEffect(() => {
    if (!me) return;
    const globalChannel = supabase.channel('global-notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        if (payload.new.room_id.includes(me.id) && payload.new.sender_id !== me.id) {
          fetchRecentChats(me.id);
        }
    }).subscribe();

    if (!activePartner) return;
    const roomId = getRoomId(me.id, activePartner.id);
    supabase.from("direct_messages").select("*").eq("room_id", roomId).order("created_at", { ascending: true }).then(({ data }) => data && setMessages(data));

    const roomChannel = supabase.channel(`room:${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `room_id=eq.${roomId}` }, 
      (payload) => { 
        setMessages(prev => [...prev, payload.new]); 
        if (payload.new.content.startsWith("[GIFT]:")) {
           const [url, name] = payload.new.content.replace("[GIFT]:", "").split("|");
           setActiveGiftAnim({ url, name });
           setTimeout(() => setActiveGiftAnim(null), 4000);
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'direct_messages', filter: `room_id=eq.${roomId}` }, 
      (payload) => setMessages(prev => prev.filter(m => m.id !== payload.old.id)))
      .subscribe();

    return () => { supabase.removeChannel(globalChannel); supabase.removeChannel(roomChannel); };
  }, [activePartner, me]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (emojiContent?: string) => {
    const text = emojiContent || input;
    if (!text.trim() || !me || !activePartner) return;
    const finalContent = replyTo ? `⤵️ Replying to: "${replyTo.content.substring(0, 20)}..."\n${text}` : text;
    setInput(""); setReplyTo(null);
    await supabase.from("direct_messages").insert({ room_id: getRoomId(me.id, activePartner.id), sender_id: me.id, content: finalContent });
  };

  return (
    <div className="flex h-[100dvh] bg-[#FFF0F6] text-zinc-900 font-sans overflow-hidden relative">
      
      <AnimatePresence>
        {activeGiftAnim && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none bg-pink-500/10 backdrop-blur-[2px]">
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: [0, 1.2, 1], rotate: 0 }} transition={{ duration: 0.8, type: "spring" }} className="relative">
              <div className="absolute inset-0 bg-pink-400 blur-3xl opacity-30 animate-pulse" />
              <img src={activeGiftAnim.url} className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl" />
              <div className="mt-6 text-center">
                <h2 className="text-2xl md:text-4xl font-black text-pink-600 uppercase tracking-tighter">New Gift!</h2>
                <p className="text-lg md:text-xl font-bold text-pink-400">{activeGiftAnim.name}</p>
              </div>
            </motion.div>
            <Sparkles className="text-yellow-400 absolute animate-ping" size={80} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR - Responsive */}
      <aside className={`${activePartner ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] lg:w-[400px] border-r border-pink-100 bg-white flex-col z-20 transition-all`}>
        <div className="p-4 md:p-6 border-b border-pink-50 bg-white">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <Link href="/app" className="flex items-center gap-2 group">
                <div className="p-2 bg-pink-500 rounded-xl text-white group-hover:bg-pink-600 transition-all"><ArrowLeft size={18} /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">Back</span>
            </Link>
            <div className="p-2 bg-yellow-400 rounded-full text-white shadow-lg shadow-yellow-100"><Shield size={16} /></div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-200" size={16} />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search people..." className="w-full bg-pink-50/50 border border-pink-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/10 transition-all" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 md:p-4 space-y-2">
          {recentChats.map(u => (
            <button key={u.id} onClick={() => setActivePartner(u)} className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${activePartner?.id === u.id ? 'bg-pink-50 border-pink-100' : 'hover:bg-pink-50/50 border-transparent'} border`}>
              <img src={u.avatar_url} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-sm" />
              <div className="text-left font-bold text-sm truncate">{u.username}</div>
            </button>
          ))}
        </div>
      </aside>

      {/* CHAT MAIN - Responsive */}
      <main className={`flex-1 flex flex-col bg-white ${!activePartner ? 'hidden md:flex' : 'flex'}`}>
        {activePartner ? (
          <>
            <header className="p-3 md:p-4 border-b border-pink-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setActivePartner(null)} className="md:hidden text-pink-500 p-1"><ChevronLeft size={24} /></button>
                <img src={activePartner.avatar_url} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-pink-100" />
                <div>
                  <h3 className="font-bold text-sm md:text-base leading-none">{activePartner.username}</h3>
                  <span className="text-[9px] text-green-500 font-bold uppercase">Online</span>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setShowOptions(!showOptions)} className="p-2 text-zinc-400 hover:text-pink-500 transition-colors"><MoreHorizontal size={20} /></button>
                {showOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-pink-100 rounded-2xl shadow-xl z-50 overflow-hidden text-xs">
                    <button onClick={deleteFullChat} className="w-full flex items-center gap-2 p-4 text-red-500 hover:bg-red-50 transition-colors font-bold"><Trash2 size={16} /> Delete Chat History</button>
                  </div>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#FFF9FB] no-scrollbar">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === me.id ? "justify-end" : "justify-start"}`}>
                  <div className="group relative max-w-[85%] md:max-w-[70%]">
                    <div className={`p-3 md:p-4 rounded-2xl shadow-sm ${m.sender_id === me.id ? "bg-pink-500 text-white" : "bg-white border border-pink-100 text-zinc-800"}`}>
                      {m.content.includes("⤵️ Replying to:") && (
                        <div className="mb-2 p-2 bg-black/5 rounded-lg text-[10px] italic border-l-2 border-pink-300 truncate">
                          {m.content.split('\n')[0]}
                        </div>
                      )}
                      {m.content.startsWith("[GIFT]:") ? (
                        <div className="text-center py-2">
                          <img src={m.content.split("|")[0].replace("[GIFT]:", "")} className="w-20 h-20 mx-auto" />
                          <p className="text-[10px] font-black uppercase opacity-60 mt-1">Gift: {m.content.split("|")[1]}</p>
                        </div>
                      ) : <p className="text-sm whitespace-pre-wrap">{m.content.includes("⤵️") ? m.content.split('\n')[1] : m.content}</p>}
                    </div>
                    {/* Message Actions (Reply/Delete) */}
                    <div className={`absolute top-0 ${m.sender_id === me.id ? "-left-14 flex-row-reverse" : "-right-14"} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white p-1 rounded-full shadow-md`}>
                      <button onClick={() => setReplyTo(m)} className="p-1.5 text-pink-500 hover:bg-pink-50 rounded-full"><Reply size={14} /></button>
                      <button onClick={() => deleteMessage(m.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-full"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* GIFT MODAL - Responsive */}
            <AnimatePresence>
              {showGiftModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 backdrop-blur-md z-40 p-4 md:p-8 flex flex-col items-center justify-center">
                  <button onClick={() => setShowGiftModal(false)} className="absolute top-4 right-4 p-2 bg-pink-50 rounded-full text-pink-600"><X /></button>
                  <h2 className="text-xl md:text-2xl font-black text-pink-600 mb-2">Select a Gift 🎁</h2>
                  
                  {giftError && (
                    <motion.div initial={{ y: -10 }} animate={{ y: 0 }} className="mb-4 text-center">
                      <p className="text-red-500 text-xs font-bold mb-1 tracking-tight uppercase">Not enough coins!</p>
                      <Link href="/buy-coins" target="_blank" className="text-pink-500 text-[10px] font-black underline uppercase tracking-widest hover:text-pink-700">Buy Coins Now</Link>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full max-w-2xl overflow-y-auto no-scrollbar py-4 px-2">
                    {isLoadingGifts ? <Loader2 className="animate-spin text-pink-500 mx-auto" /> : 
                      giftTypes.map(gt => (
                        <button key={gt.id} onClick={() => sendGift(gt)} className="bg-white p-3 rounded-[24px] border border-pink-50 hover:border-pink-300 hover:shadow-xl transition-all flex flex-col items-center group">
                          <img src={gt.image_url} className="w-12 h-12 md:w-16 md:h-16 object-contain group-hover:scale-110 transition-transform" />
                          <p className="font-bold text-[10px] mt-2 uppercase tracking-tighter truncate w-full text-center">{gt.name}</p>
                          <div className="mt-1 px-2 py-0.5 bg-yellow-400 text-white text-[9px] font-black rounded-full shadow-sm">{gt.coin_price} 🪙</div>
                        </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <footer className="p-3 md:p-4 bg-white border-t border-pink-50">
              {/* REPLY BAR */}
              {replyTo && (
                <div className="mb-2 p-2 bg-pink-50 rounded-xl flex items-center justify-between border-l-4 border-pink-400 animate-in slide-in-from-bottom-2">
                  <div className="flex-1 truncate pr-2">
                    <p className="text-[10px] font-bold text-pink-500 uppercase leading-none mb-1 tracking-tighter">Replying to</p>
                    <p className="text-[11px] text-zinc-600 truncate">{replyTo.content}</p>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="p-1 bg-pink-100 rounded-full text-pink-500"><X size={12}/></button>
                </div>
              )}
              <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar py-1">
                {quickEmojis.map(e => <button key={e} onClick={() => handleSend(e)} className="text-xl md:text-2xl hover:scale-125 transition-transform shrink-0">{e}</button>)}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setShowGiftModal(true); fetchGiftTypes(); }} className="p-3 md:p-4 bg-yellow-400 text-white rounded-xl shadow-lg active:scale-90 transition-all"><Gift size={20}/></button>
                <div className="flex-1 relative">
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Type something..." className="w-full bg-pink-50/50 border border-pink-100 rounded-xl py-3 px-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-pink-500/10 transition-all" />
                </div>
                <button onClick={() => handleSend()} className="p-3 md:p-4 bg-pink-500 text-white rounded-xl shadow-lg active:scale-95 transition-all"><Send size={20}/></button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-pink-200 p-8 text-center">
            <MessageSquare size={54} className="mb-4 opacity-20" />
            <p className="italic opacity-60 text-sm">Select someone to start chatting</p>
          </div>
        )}
      </main>
    </div>
  );
}
