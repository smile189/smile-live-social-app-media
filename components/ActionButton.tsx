/*
first version of action buttons for posts (like, comment, share) + message panel with reply functionality.
*/
"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Adăugat pentru interacțiune profil
import { 
  Heart, MessageSquare, Bookmark, Share2, MoreHorizontal, 
  X, Send, Zap, Loader2, Reply as ReplyIcon 
} from "lucide-react";

/* --- COMPONENTA MESAJE (PRO STUDIO CU REPLY) - WHITE THEME --- */
function MessagePanel({ post, onClose }: { post: any; onClose: () => void }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null); 
  
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
        parent_id: replyTo?.id || null 
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      
      {/* WHITE THEME: bg-white + border-zinc-200 */}
      <div className="relative w-full max-w-xl bg-white border-t sm:border border-zinc-200 rounded-t-[3rem] sm:rounded-[3rem] h-[75vh] sm:h-[80vh] mb-[80px] sm:mb-0 flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-700 ease-out">
        
        {/* Header cu fundal alb subtil */}
        <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
          <div className="flex items-center gap-3">
          
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-600">comments</span>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-700 transition-colors">
            <X size={20}/>
          </button>
        </div>

        {/* Lista de comentarii pe fundal alb */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32 bg-white">
          {comments.map((c) => (
            <div key={c.id} className={`flex gap-3 animate-in fade-in duration-500 ${c.parent_id ? 'ml-8 border-l-2 border-zinc-200 pl-4' : ''}`}>
              <Link href={`/app/profile/${c.profiles?.username}`}>
                <img src={c.profiles?.avatar_url || `https://api.dicebear.com{c.profiles?.username}`} className="w-8 h-8 rounded-full border-2 border-zinc-200 bg-zinc-100 shrink-0 cursor-pointer hover:border-yellow-400 transition-colors" />
              </Link>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[9px] font-black uppercase text-zinc-500">@{c.profiles?.username}</p>
                  <button 
                    onClick={() => setReplyTo(c)}
                    className="text-[8px] font-black uppercase text-yellow-600 hover:text-yellow-500 transition-colors"
                  >
                    Reply
                  </button>
                </div>
                {/* Bubble comentariu pe fundal gri deschis */}
                <div className="text-sm text-zinc-800 bg-zinc-100 p-3 rounded-2xl rounded-tl-none border border-zinc-200 inline-block max-w-full">
                  {c.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input section cu gradient alb */}
        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent pt-10">
          {replyTo && (
            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 p-2 px-4 rounded-t-xl mb-0 animate-in slide-in-from-bottom-2">
              <span className="text-[9px] font-black text-yellow-700 uppercase tracking-widest flex items-center gap-2">
                <ReplyIcon size={12}/> replying to @{replyTo.profiles?.username}
              </span>
              <button onClick={() => setReplyTo(null)}>
                <X size={14} className="text-yellow-700"/>
              </button>
            </div>
          )}

          {/* Input cu stil alb */}
          <div className="flex items-center gap-3 bg-zinc-50 border-2 border-zinc-200 p-2.5 rounded-2xl shadow-lg">
            <input 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              placeholder="Contribution..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-zinc-900 placeholder:text-zinc-400 px-3 h-10" 
            />
            <button 
              onClick={handleSend} 
              disabled={isSending || !newComment.trim()} 
              className="h-10 w-10 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-black flex items-center justify-center active:scale-90 transition-all shadow-lg disabled:opacity-50"
            >
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- SIDEBAR ACTIONS REPARAT (FĂRĂ ERORI 406) --- */
export default function SidebarActions({ post }: { post: any }) {
  const [showMessages, setShowMessages] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchStats = async () => {
      if (!post) return;

      // 1. Fetch Counts (Paralel pentru viteză)
      const [lRes, cRes] = await Promise.all([
        supabase.from("likes").select("*", { count: 'exact', head: true }).eq("post_id", post.id),
        supabase.from("comments").select("*", { count: 'exact', head: true }).eq("post_id", post.id)
      ]);
      
      setLikeCount(lRes.count || 0);
      setCommentCount(cRes.count || 0);

      // 2. FIX EROARE 406: Nu mai folosim .single()
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", user.id)
          .limit(1); // MODIFICARE: limit(1) în loc de single()
        
        setLiked(data && data.length > 0 ? true : false);
      }
    };

    fetchStats();
    setShowMessages(false);
  }, [post, supabase]);

  const handleLike = async () => {
    if (isLiking || !post) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Log in to like!");

    setIsLiking(true);
    const wasLiked = liked;
    
    // Optimistic Update (Viteza SMILE)
    setLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    if (!wasLiked) {
      await supabase.from("likes").insert({ post_id: post.id, user_id: user.id });
    } else {
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    }
    setIsLiking(false);
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/app/post/${post.id}` : '';
    if (navigator.share) {
      try { await navigator.share({ title: `Smile - @${post.profiles?.username}`, url: shareUrl }); } 
      catch (err) { console.log("Share cancelled"); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copiat!");
    }
  };

  if (!post) return null;

  return (
    <>
      <div className="absolute right-4 bottom-[18vh] flex flex-col items-center gap-6 z-40 animate-in fade-in slide-in-from-right-4 duration-500">
        
        {/* FIX DICEBEAR URL & LINK PROFILE */}
        <Link href={`/app/profile/${post.profiles?.username}`} className="relative mb-4 group cursor-pointer active:scale-90 transition-transform">
          <div className="w-14 h-14 rounded-full border-2 border-yellow-400 p-0.5 backdrop-blur-3xl bg-white/10 overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <img 
              src={post.profiles?.avatar_url || `https://api.dicebear.com{post.profiles?.username || 'smile'}`} 
              className="w-full h-full rounded-full object-cover bg-zinc-900" 
              alt="avatar"
            />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black text-[12px] font-black border-2 border-black">
            +
          </div>
        </Link>

        {/* LIKE */}
        <button onClick={handleLike} className="group flex flex-col items-center gap-1 active:scale-75 transition-all text-white">
          <div className={`p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 transition-all ${liked ? 'text-red-500 border-red-500/50' : 'group-hover:bg-white/10'}`}>
            <Heart size={28} className={liked ? "fill-red-500 text-red-500" : ""} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest drop-shadow-md">
            {likeCount}
          </span>
        </button>

        {/* MESSAGES */}
        <button onClick={() => setShowMessages(true)} className="group flex flex-col items-center gap-1 active:scale-75 transition-all text-white">
          <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 group-hover:bg-white/10 transition-all">
            <MessageSquare size={28} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest drop-shadow-md">{commentCount}</span>
        </button>

        {/* SHARE */}
        <button onClick={handleShare} className="group flex flex-col items-center gap-1 active:scale-75 transition-all text-white">
          <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 group-hover:bg-white/10 transition-all">
            <Share2 size={28} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest drop-shadow-md">Share</span>
        </button>
      </div>

      {showMessages && <MessagePanel post={post} onClose={() => setShowMessages(false)} />} 
    </>
  );
}