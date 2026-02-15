"use client";

import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";


const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Chat() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");

  // 1. Fetch inițial al conversațiilor deschise
  useEffect(() => {
    const fetchConversations = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });
      if (data) setConversations(data);
    };

    fetchConversations();

    // Abonare la schimbări în conversații (pentru a vedea când apare una nouă sau un mesaj nou)
    const convChannel = supabase
      .channel("public:conversations")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(convChannel); };
  }, []);

  // 2. Fetch mesaje când selectăm o conversație
  useEffect(() => {
    if (!selectedConv) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConv.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    // Realtime pentru mesaje noi în conversația selectată
    const msgChannel = supabase
      .channel(`msg:${selectedConv.id}`)
      .on("postgres_changes", 
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedConv.id}` }, 
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(msgChannel); };
  }, [selectedConv]);

  // 3. Trimite răspuns (Agent)
  const handleSend = async () => {
    if (!reply.trim() || !selectedConv) return;

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("messages").insert([{
      conversation_id: selectedConv.id,
      sender_id: user?.id,
      sender_type: "agent",
      text: reply
    }]);

    // Update last preview
    await supabase.from("conversations")
      .update({ last_message_preview: reply, updated_at: new Date() })
      .eq("id", selectedConv.id);

    setReply("");
  };

  return (
    <div className="flex h-[70vh] bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-2xl">
      {/* Sidebar Conversații */}
      <div className="w-1/3 border-r border-slate-200 dark:border-zinc-800 overflow-y-auto">
        <div className="p-4 font-black uppercase tracking-widest text-xs border-b border-slate-100 dark:border-zinc-800">
          Active Chats
        </div>
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedConv(c)}
            className={`p-4 cursor-pointer transition-colors ${selectedConv?.id === c.id ? 'bg-yellow-400 text-black' : 'hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
          >
            <p className="font-bold text-sm truncate">{c.user_email || 'Utilizator Anonim'}</p>
            <p className="text-xs opacity-70 truncate">{c.last_message_preview}</p>
          </div>
        ))}
      </div>

      {/* Fereastră Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender_type === 'agent' ? 'bg-yellow-400 text-black font-medium' : 'bg-slate-100 dark:bg-zinc-800'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex gap-2">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-slate-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 ring-yellow-400 outline-none"
                placeholder="Scrie un răspuns..."
              />
              <button onClick={handleSend} className="bg-black dark:bg-white dark:text-black text-white px-6 py-2 rounded-xl font-bold text-sm">
                Trimite
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 italic">
            Selectează o conversație pentru a răspunde
          </div>
        )}
      </div>
    </div>
  );
}
