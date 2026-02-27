"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Send, ChevronLeft, Shield, MoreHorizontal, CheckCheck, 
  Search, MessageSquare, Loader2, User, Menu, X, Home, ArrowLeft
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const getRoomId = (id1: string, id2: string) => [id1, id2].sort().join("_");

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

    // Abonare la TOATE mesajele care implică user-ul meu pentru notificări de fundal
    const globalChannel = supabase.channel('global-notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'direct_messages' 
      }, (payload) => {
        const isForMe = payload.new.room_id.includes(me.id);
        const isNotFromMe = payload.new.sender_id !== me.id;
        const isNotCurrentRoom = activePartner ? !payload.new.room_id.includes(activePartner.id) : true;

        // Trimitem notificare dacă tab-ul e ascuns SAU dacă nu suntem în camera respectivă
        if (isForMe && isNotFromMe && (document.hidden || isNotCurrentRoom)) {
          if (Notification.permission === "granted") {
            new Notification("Smile Live Message", {
              body: payload.new.content,
              icon: "/logo.png" // Asigură-te că ai un logo în public/logo.png
            });
          }
          fetchRecentChats(me.id); // Refresh inbox-ul să apară sus
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `room_id=eq.${roomId}` }, 
      (payload) => { setMessages(prev => [...prev, payload.new]); })
      .subscribe();

    return () => { 
      supabase.removeChannel(globalChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [activePartner, me, supabase]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !me || !activePartner) return;
    const content = input;
    setInput("");
    await supabase.from("direct_messages").insert({
      room_id: getRoomId(me.id, activePartner.id),
      sender_id: me.id,
      content: content
    });
    fetchRecentChats(me.id);
  };

  return (
    <div className="flex h-screen bg-[#FFF0F6] text-zinc-900 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
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
                className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${activePartner?.id === chat.id ? 'bg-pink-500 text-white shadow-xl shadow-pink-200/50' : 'hover:bg-pink-50 bg-white/50 border border-pink-50'}`}
              >
                <div className="relative">
                   <img src={chat.avatar_url} className={`w-12 h-12 rounded-2xl object-cover border-2 ${activePartner?.id === chat.id ? 'border-pink-300' : 'border-white'}`} alt="" />
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <div className="text-left flex-1">
                  <p className={`text-xs font-black uppercase tracking-wider ${activePartner?.id === chat.id ? 'text-white' : 'text-zinc-800'}`}>@{chat.username}</p>
                  <p className={`text-[10px] ${activePartner?.id === chat.id ? 'text-pink-100' : 'text-pink-300'} font-bold`}>Link Secured</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* CHAT AREA */}
      <main className={`
        ${!activePartner ? 'hidden md:flex' : 'flex'} 
        flex-1 flex-col relative bg-[#FFF9FB]
      `}>
        {activePartner ? (
          <>
            <header className="h-20 px-4 md:px-10 border-b border-pink-100 flex items-center justify-between bg-white/90 backdrop-blur-xl z-30">
              <div className="flex items-center gap-4">
                <button onClick={() => setActivePartner(null)} className="md:hidden p-2 text-pink-400 transition-transform active:scale-90"><ChevronLeft size={24}/></button>
                <div className="relative">
                    <img src={activePartner.avatar_url} className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-100 shadow-sm" alt="" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-widest text-zinc-800">@{activePartner.username}</h2>
                  <span className="text-[8px] font-black text-pink-400 uppercase tracking-[0.2em] animate-pulse">Encrypted Uplink</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button className="p-2.5 text-pink-300 hover:bg-pink-50 rounded-xl transition"><MoreHorizontal size={20} /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 no-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender_id === me?.id ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] md:max-w-[60%] px-6 py-4 rounded-[22px] text-sm leading-relaxed shadow-sm ${
                    msg.sender_id === me?.id 
                    ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-tr-none' 
                    : 'bg-white text-zinc-700 border border-pink-50 rounded-tl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[8px] font-black text-pink-200 uppercase mt-2 px-1 tracking-widest">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <footer className="p-4 md:p-8 bg-white border-t border-pink-50">
              <div className="relative max-w-5xl mx-auto flex items-center gap-3">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type secure transmission..."
                  className="flex-1 bg-pink-50/20 border border-pink-100 rounded-[20px] py-4 px-8 text-sm outline-none focus:bg-white focus:border-pink-500 transition-all"
                />
                <button 
                  onClick={handleSend}
                  className="p-4 bg-yellow-400 rounded-2xl text-white hover:bg-yellow-500 active:scale-95 transition-all shadow-xl shadow-yellow-200"
                >
                  <Send size={20} />
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-pink-200">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-pink-100/50 border border-pink-50">
              <MessageSquare size={40} className="text-pink-300" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-pink-400">Select Connection Studio</p>
          </div>
        )}
      </main>
    </div>
  );
}
