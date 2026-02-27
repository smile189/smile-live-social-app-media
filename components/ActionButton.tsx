"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Heart, MessageSquare, Bookmark, Share2, MoreHorizontal, 
  X, Send, Zap, Loader2, Reply as ReplyIcon 
} from "lucide-react";

/* --- COMPONENTA MESAJE (PRO STUDIO CU REPLY) --- */
function MessagePanel({ post, onClose }: { post: any; onClose: () => void }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null); 
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-[#0A0A0A] border-t border-white/10 rounded-t-[3rem] h-[75vh] mb-[80px] sm:mb-0 flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-700 ease-out">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">comments</span>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
          {comments.map((c) => (
            <div key={c.id} className={`flex gap-3 animate-in fade-in duration-500 ${c.parent_id ? 'ml-8 border-l border-white/5 pl-4' : ''}`}>
              <Link href={`/app/profile/${c.profiles?.username}`}>
                <img src={c.profiles?.avatar_url || `https://api.dicebear.com{c.profiles?.username}`} className="w-8 h-8 rounded-full border border-white/10 bg-zinc-900 shrink-0 cursor-pointer" />
              </Link>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[9px] font-black uppercase text-zinc-500">@{c.profiles?.username}</p>
                  <button onClick={() => setReplyTo(c)} className="text-[8px] font-black uppercase text-yellow-500/50 hover:text-yellow-500 transition-colors">Reply</button>
                </div>
                <div className="text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-2xl rounded-tl-none border border-white/5 inline-block max-w-full">{c.content}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black via-black to-transparent pt-10">
          {replyTo && (
            <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 p-2 px-4 rounded-t-xl mb-0 animate-in slide-in-from-bottom-2">
              <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2"><ReplyIcon size={12}/> replying to @{replyTo.profiles?.username}</span>
              <button onClick={() => setReplyTo(null)}><X size={14} className="text-yellow-500"/></button>
            </div>
          )}
          <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 p-2.5 rounded-2xl shadow-2xl">
            <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Contribution..." className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white px-3 h-10" />
            <button onClick={handleSend} disabled={isSending || !newComment.trim()} className="h-10 w-10 bg-yellow-400 rounded-xl text-black flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-yellow-500/10">
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- SIDEBAR ACTIONS --- */
export default function SidebarActions({ post }: { post: any }) {
  const [showMessages, setShowMessages] = useState(false);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchPostStats = async () => {
      if (!post) return;

      // Fetch like count
      const { count: totalLikes } = await supabase
        .from("likes")
        .select("*", { count: 'exact', head: true })
        .eq("post_id", post.id);
      setCount(totalLikes || 0);

      // Check user like status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", user.id)
          .single();
        setLiked(!!data);
      }
    };

    fetchPostStats();
    setShowMessages(false);
  }, [post, supabase]);

  const handleLike = async () => {
    if (isProcessing) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Log in to like!");

    setIsProcessing(true);
    const wasLiked = liked;
    
    // Optimistic Update
    setLiked(!wasLiked);
    setCount(prev => wasLiked ? prev - 1 : prev + 1);

    if (!wasLiked) {
      const { error } = await supabase.from("likes").insert({ post_id: post.id, user_id: user.id });
      if (error) { setLiked(false); setCount(prev => prev - 1); }
    } else {
      const { error } = await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id);
      if (error) { setLiked(true); setCount(prev => prev + 1); }
    }
    setIsProcessing(false);
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${post.id}` : '';
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Check this out!', url: shareUrl });
      } catch (err) { console.log(err); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied!");
    }
  };

  if (!post) return null;

  return (
    <>
      <div className="absolute right-4 bottom-[18vh] flex flex-col items-center gap-6 z-40 animate-in fade-in slide-in-from-right-4 duration-500">
        
        {/* AVATAR */}
        <Link href={`/app/profile/${post.profiles?.username}`} className="relative mb-4 group cursor-pointer active:scale-90 transition-transform">
          <div className="w-14 h-14 rounded-full border-2 border-yellow-400 p-0.5 backdrop-blur-3xl bg-white/10 overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <img src={post.profiles?.avatar_url || `https://api.dicebear.com{post.profiles?.username}`} className="w-full h-full rounded-full object-cover bg-zinc-900" alt="profile" />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black text-[12px] font-black border-2 border-black">+</div>
        </Link>

        {/* LIKE */}
        <button onClick={handleLike} className="group flex flex-col items-center gap-1 active:scale-75 transition-all text-white">
          <div className={`p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 transition-all ${liked ? 'text-red-500' : 'group-hover:bg-white/10'}`}>
            <Heart size={28} className={liked ? "fill-red-500" : ""} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">{count > 999 ? (count / 1000).toFixed(1) + "K" : count}</span>
        </button>

        {/* MESSAGES */}
        <button onClick={() => setShowMessages(true)} className="group flex flex-col items-center gap-1 active:scale-75 transition-all text-white">
          <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 group-hover:bg-white/10 transition-all">
            <MessageSquare size={28} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest"></span>
        </button>

        {/* SHARE */}
        <button onClick={handleShare} className="group flex flex-col items-center gap-1 active:scale-75 transition-all text-white">
          <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 group-hover:bg-white/10 transition-all">
            <Share2 size={28} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
        </button>

        {/* MORE (ZAP) */}
        <button className="group flex flex-col items-center gap-1 active:scale-75 transition-all text-white/40 hover:text-white">
          <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 group-hover:bg-white/10 transition-all">
            <Bookmark size={28} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Save</span>
        </button>
      </div>

      {showMessages && <MessagePanel post={post} onClose={() => setShowMessages(false)} />}
    </>
  );
}
