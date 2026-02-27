"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Heart, MessageSquare, Bookmark, Share2, MoreHorizontal, 
  X, Send, Zap, Loader2, Reply as ReplyIcon 
} from "lucide-react";

/* --- COMPONENTA MESAJE (PRO STUDIO CU REPLY) --- */
function MessagePanel({ post, onClose }: { post: any; onClose: () => void }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null); // State pentru Reply
  
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from("comments")
        .select(`*, profiles(username, avatar_url)`)
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });
      if (data) setComments(data);
    };
    fetchComments();
  }, [post.id, supabase]);

  const handleSend = async () => {
    if (!newComment.trim()) return;
    setIsSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("comments")
      .insert({ 
        post_id: post.id, 
        user_id: user?.id, 
        content: newComment,
        parent_id: replyTo?.id || null // Legăm reply-ul dacă există
      })
      .select(`*, profiles(username, avatar_url)`)
      .single();

    if (!error && data) { 
      setComments([...comments, data]); 
      setNewComment(""); 
      setReplyTo(null); 
    }
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      
      {/* RIDICARE 3CM PE MOBILE: mb-24 sau h-[75vh] cu padding jos */}
      <div className="relative w-full max-w-xl bg-[#0A0A0A] border-t border-white/10 rounded-t-[3rem] h-[75vh] mb-[80px] sm:mb-0 flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-700 ease-out">
        
        {/* HEADER */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">comments</span>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400"><X size={20}/></button>
        </div>

        {/* COMMENTS LIST */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
          {comments.map((c) => (
            <div key={c.id} className={`flex gap-3 animate-in fade-in duration-500 ${c.parent_id ? 'ml-8 border-l border-white/5 pl-4' : ''}`}>
              <img src={c.profiles?.avatar_url} className="w-8 h-8 rounded-full border border-white/10 bg-zinc-900 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[9px] font-black uppercase text-zinc-500">@{c.profiles?.username}</p>
                  <button 
                    onClick={() => setReplyTo(c)}
                    className="text-[8px] font-black uppercase text-yellow-500/50 hover:text-yellow-500 transition-colors"
                  >
                    Reply
                  </button>
                </div>
                <div className="text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-2xl rounded-tl-none border border-white/5 inline-block max-w-full">
                  {c.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT AREA - RIDICATĂ PENTRU TASTATURĂ */}
        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black via-black to-transparent pt-10">
          
          {/* INDICATOR REPLY */}
          {replyTo && (
            <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 p-2 px-4 rounded-t-xl mb-0 animate-in slide-in-from-bottom-2">
              <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                <ReplyIcon size={12}/> replying to @{replyTo.profiles?.username}
              </span>
              <button onClick={() => setReplyTo(null)}><X size={14} className="text-yellow-500"/></button>
            </div>
          )}

          <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 p-2.5 rounded-2xl shadow-2xl">
            <input 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              placeholder="Contribution..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white px-3 h-10" 
            />
            <button 
              onClick={handleSend} 
              disabled={isSending || !newComment.trim()} 
              className="h-10 w-10 bg-yellow-400 rounded-xl text-black flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-yellow-500/10"
            >
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- SIDEBAR ACTIONS (FĂRĂ TĂIETURI) --- */
export default function SidebarActions({ post }: { post: any }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (post) {
      setCount(post.likes?.[0]?.count || 0);
      setLiked(false);
      setShowMessages(false);
    }
  }, [post]);

  const handleLike = () => {
    if (!liked) { setCount(prev => prev + 1); setLiked(true); }
  };

  if (!post) return null;

  return (
    <>
      <div className="absolute right-4 bottom-[18vh] flex flex-col items-center gap-6 z-40 animate-in fade-in slide-in-from-right-4 duration-500">
        
        {/* AVATAR */}
        <div className="relative mb-4 group cursor-pointer">
          <div className="w-14 h-14 rounded-full border-2 border-yellow-400 p-0.5 backdrop-blur-3xl bg-white/10 overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <img 
              src={post.profiles?.avatar_url || `https://api.dicebear.com{post.profiles?.username}`} 
              className="w-full h-full rounded-full object-cover bg-zinc-900" 
            />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black text-[14px] font-black border-2 border-black">+</div>
        </div>

        {/* LIKE */}
        <button onClick={handleLike} className="group flex flex-col items-center gap-1 active:scale-75 transition-all">
          <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 group-hover:bg-white/10 transition-all text-white">
            <Heart size={28} className={liked ? "fill-red-500 text-red-500" : ""} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{count > 999 ? (count / 1000).toFixed(1) + "K" : count}</span>
        </button>

        {/* MESSAGES */}
        <button onClick={() => setShowMessages(true)} className="group flex flex-col items-center gap-1 active:scale-75 transition-all text-white">
          <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 group-hover:bg-white/10 transition-all">
            <MessageSquare size={28} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">{post?.comments?.[0]?.count || 0}</span>
        </button>

        {/* SAVE & SHARE */}
        <button className="group flex flex-col items-center gap-1 active:scale-75 transition-all text-white">
          <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 group-hover:bg-white/10 transition-all">
            <Bookmark size={28} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">SAVE</span>
        </button>

        <button className="group flex flex-col items-center gap-1 active:scale-75 transition-all text-white">
          <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 group-hover:bg-white/10 transition-all">
            <Share2 size={28} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">SEND</span>
        </button>

        {/* MORE */}
        <button onClick={() => setShowMenu(!showMenu)} className="p-3.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white">
           {showMenu ? <X size={24} /> : <MoreHorizontal size={24} />}
        </button>

        {showMenu && (
          <div className="absolute bottom-0 right-20 w-48 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 animate-in fade-in zoom-in-95 shadow-2xl">
            <button className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase text-zinc-400 hover:text-yellow-400 transition-all">
              <Zap size={16}/> Protocol
            </button>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-xl text-[10px] font-black uppercase text-red-500 transition-all">
              <X size={16}/> Report
            </button>
          </div>
        )}
      </div>

      {showMessages && (
        <MessagePanel post={post} onClose={() => setShowMessages(false)} />
      )}
    </>
  );
}
