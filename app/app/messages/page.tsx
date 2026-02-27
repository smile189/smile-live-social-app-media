"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Send, ChevronLeft, Shield, MoreHorizontal, CheckCheck, 
  Search, MessageSquare, Loader2, User, Menu, X, Home, ArrowLeft, Trash2, Reply
} from "lucide-react";
import Link from "next/link";

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

  const getRoomId = (id1: string, id2: string) => [id1, id2].sort().join("_");
  const quickEmojis = ["❤️", "🔥", "😂", "😮", "🙌", "✨"];

  // --- SOLICITARE PERMISIUNI NOTIFICĂRI ---
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

  // --- ISTORIC: FETCH CONVERSAȚII RECENTE (INBOX) ---
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

  // --- ȘTERGERE MESAJ INDIVIDUAL ---
  const deleteMessage = async (msgId: string) => {
    const { error } = await supabase.from("direct_messages").delete().eq("id", msgId);
    if (!error) {
      setMessages(prev => prev.filter(m => m.id !== msgId));
    }
  };

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) { setSearchResults([]); return; }
      setIsSearching(true);
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", me?.id)
        .limit(5);
      if (data) setSearchResults(data);
      setIsSearching(false);
    };
    const debounce = setTimeout(searchUsers, 400);
    return () => clearTimeout(debounce);
  }, [searchQuery, me]);

  // --- REALTIME + NOTIFICĂRI ---
  useEffect(() => {
    if (!me) return;

    const globalChannel = supabase.channel('global-notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'direct_messages' 
      }, (payload) => {
        const isForMe = payload.new.room_id.includes(me.id);
        const isNotFromMe = payload.new.sender_id !== me.id;
        const isNotCurrentRoom = activePartner ? !payload.new.room_id.includes(activePartner.id) : true;

        if (isForMe && isNotFromMe && (document.hidden || isNotCurrentRoom)) {
          if (Notification.permission === "granted") {
            new Notification("Smile Live Message", {
              body: payload.new.content,
              icon: "/logo.png"
            });
          }
          fetchRecentChats(me.id);
        }
      })
      .subscribe();

    if (!activePartner) return;
    
    const roomId = getRoomId(me.id, activePartner.id);
    const fetchMessages = async () => {
      const { data } = await supabase.from("direct_messages").select("*").eq("room_id", roomId).order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    const roomChannel = supabase.channel(`room:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'direct_messages', filter: `room_id=eq.${roomId}` }, 
      (payload) => { 
        if (payload.eventType === 'INSERT') setMessages(prev => [...prev, payload.new]); 
        if (payload.eventType === 'DELETE') setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(globalChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [activePartner, me, supabase]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

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
    fetchRecentChats(me.id);
  };

  return (
    <div className="flex h-screen bg-[#FFF0F6] text-zinc-900 font-sans overflow-hidden">
      
      {/* SIDEBAR - Responsive: ascuns pe mobil când chat-ul e activ */}
      <aside className={`
        ${activePartner ? 'hidden md:flex' : 'flex'} 
        w-full md:w-[380px] border-r border-pink-100 bg-white flex-col z-20 transition-all duration-300
      `}>
        <div className="p-6 border-b border-pink-50 bg-white/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <Link href="/app" className="flex items-center gap-2 group">
                <div className="p-2 bg-pink-500 rounded-xl text-white group-hover:bg-pink-600 transition-all shadow-lg shadow-pink-200">
                    <ArrowLeft size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">App Home</span>
            </Link>
            <div className="p-2 bg-yellow-400 rounded-full text-white shadow-lg shadow-yellow-200"><Shield size={16} /></div>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-200 group-focus-within:text-pink-500 transition-colors" size={16} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people..."
              className="w-full bg-pink-50/50 border border-pink-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/5 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
          {searchQuery.length >= 2 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-pink-300 uppercase tracking-widest px-2 italic">Global Signal</p>
              {isSearching ? <Loader2 className="animate-spin text-pink-200 mx-auto" /> : 
                searchResults.map(u => (
                  <button key={u.id} onClick={() => { setActivePartner(u); setSearchQuery(""); }} className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-pink-50 transition group">
                    <img src={u.avatar_url} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                    <div className="text-left font-black text-[11px] uppercase tracking-wider text-zinc-600">@{u.username}</div>
                  </button>
                ))
              }
            </div>
          )}

          <div className="space-y-2">
            <p className="text-[10px] font-black text-pink-300 uppercase tracking-[0.2em] px-2 mb-4">Saved History</p>
            {recentChats.map(chat => (
              <button 
                key={chat.id} 
                onClick={() => setActivePartner(chat)}
                className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${activePartner?.id === chat.id ? 'bg-pink-50 shadow-inner' : 'hover:bg-pink-50/50'}`}
              >
                <img src={chat.avatar_url} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                <div className="text-left font-black text-[11px] uppercase tracking-wider text-zinc-600">@{chat.username}</div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* CHAT AREA - Responsive: ocupă tot ecranul pe mobil */}
      <main className={`flex-1 flex flex-col bg-white relative ${!activePartner ? 'hidden md:flex' : 'flex'}`}>
        {activePartner ? (
          <>
            {/* HEADER STICKY - Fixat sus */}
            <div className="sticky top-0 z-30 p-4 border-b border-pink-50 flex items-center justify-between bg-white/95 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActivePartner(null)} 
                  className="p-2 -ml-2 text-pink-500 hover:bg-pink-50 rounded-full transition-colors active:scale-90"
                >
                  <ChevronLeft size={28} />
                </button>
                <div className="relative">
                  <img src={activePartner.avatar_url} className="w-10 h-10 rounded-full object-cover border border-pink-100 shadow-sm" alt="" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-[12px] uppercase tracking-widest leading-none mb-1">{activePartner.username}</span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Secure Connection</span>
                </div>
              </div>
              <button className="p-2 text-zinc-300 hover:text-pink-500 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* MESSAGE LIST - Zona de scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FFF0F6]/10 no-scrollbar">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === me?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className="group relative max-w-[85%] md:max-w-[75%] transition-all">
                    <div className={`px-5 py-3 rounded-[2rem] text-sm shadow-sm whitespace-pre-wrap ${m.sender_id === me?.id ? 'bg-pink-500 text-white rounded-tr-none' : 'bg-white text-zinc-700 rounded-tl-none border border-pink-50'}`}>
                      {m.content}
                    </div>
                    {/* ACTIUNI LA HOVER (SAU TAP PE MOBIL) */}
                    <div className={`absolute top-0 ${m.sender_id === me?.id ? '-left-14' : '-right-14'} flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-full shadow-sm border border-pink-50`}>
                        <button onClick={() => setReplyTo(m)} className="p-1.5 text-pink-400 hover:text-pink-600 transition-colors"><Reply size={14} /></button>
                        <button onClick={() => deleteMessage(m.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* INPUT AREA - Fixată jos */}
            <div className="p-4 md:p-6 bg-white border-t border-pink-50">
              {replyTo && (
                <div className="mb-3 p-3 bg-pink-50 rounded-2xl flex items-center justify-between border border-pink-100 animate-in slide-in-from-bottom-2">
                  <div className="text-[10px] truncate text-zinc-600 italic px-2">
                    <span className="font-black text-pink-500 uppercase mr-2 italic tracking-tighter">Replying:</span>
                    {replyTo.content}
                  </div>
                  <button onClick={() => setReplyTo(null)} className="p-1 text-pink-400 hover:bg-white rounded-full"><X size={16} /></button>
                </div>
              )}

              <div className="flex gap-3 mb-4 px-2 overflow-x-auto no-scrollbar pb-1">
                {quickEmojis.map(emoji => (
                  <button key={emoji} onClick={() => handleSend(emoji)} className="text-xl hover:scale-125 transition-transform active:scale-90">{emoji}</button>
                ))}
              </div>

              <div className="flex gap-3 items-center bg-pink-50/50 p-2 rounded-[2.5rem] border border-pink-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-pink-500/5 transition-all shadow-inner">
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Express yourself..."
                  className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-pink-200"
                />
                <button onClick={() => handleSend()} className="bg-pink-500 text-white p-3 rounded-full hover:bg-pink-600 transition-all shadow-lg shadow-pink-200 active:scale-95">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#FFF0F6]/10 text-pink-200">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="font-black uppercase tracking-[0.3em] text-[10px]">Select a Connection</p>
          </div>
        )}
      </main>
    </div>
  );
}
