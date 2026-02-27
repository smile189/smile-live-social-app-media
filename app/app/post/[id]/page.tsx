"use client";

import { useEffect, useState, use } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { 
  Heart, MessageSquare, Bookmark, Share2, X, Send, Loader2, Reply as ReplyIcon 
} from "lucide-react";

/* --- SIDEBAR ACTIONS --- */
function SidebarActions({ post }: { post: any }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!post) return;
    const fetchStats = async () => {
      // Fetch Like Count
      const { count } = await supabase
        .from("likes")
        .select("*", { count: 'exact', head: true })
        .eq("post_id", post.id);
      setLikeCount(count || 0);

      // Check if current user liked/saved
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: likeData } = await supabase.from("likes").select("id").eq("post_id", post.id).eq("user_id", user.id).single();
        setLiked(!!likeData);
        const { data: saveData } = await supabase.from("bookmarks").select("id").eq("post_id", post.id).eq("user_id", user.id).single();
        setSaved(!!saveData);
      }
    };
    fetchStats();
  }, [post, supabase]);

  const handleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Loghează-te pentru a da like!");

    if (liked) {
      setLiked(false);
      setLikeCount(prev => prev - 1);
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      setLiked(true);
      setLikeCount(prev => prev + 1);
      await supabase.from("likes").insert({ post_id: post.id, user_id: user.id });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Postare de la @${post.profiles?.username}`,
          url: window.location.href,
        });
      } catch (err) { console.log(err); }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setIsSharing(true);
      setTimeout(() => setIsSharing(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 pr-4">
      {/* LIKE */}
      <button onClick={handleLike} className="flex flex-col items-center gap-1 text-white group">
        <div className={`p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 transition-all ${liked ? 'text-red-500 scale-110' : ''}`}>
          <Heart size={28} className={liked ? "fill-red-500" : "group-hover:scale-110"} />
        </div>
        <span className="text-[10px] font-black">{likeCount}</span>
      </button>

      {/* CHAT/COMMENTS */}
      <button className="flex flex-col items-center gap-1 text-white group">
        <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 group-hover:bg-black/60">
          <MessageSquare size={28} />
        </div>
        <span className="text-[10px] font-black">Chat</span>
      </button>

      {/* SAVE */}
      <button onClick={() => setSaved(!saved)} className="flex flex-col items-center gap-1 text-white group">
        <div className={`p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 transition-all ${saved ? 'text-yellow-400' : ''}`}>
          <Bookmark size={28} className={saved ? "fill-yellow-400" : ""} />
        </div>
        <span className="text-[10px] font-black">Save</span>
      </button>

      {/* SHARE */}
      <button onClick={handleShare} className="flex flex-col items-center gap-1 text-white relative">
        <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 hover:bg-black/60">
          <Share2 size={28} />
        </div>
        <span className="text-[10px] font-black">Share</span>
        {isSharing && (
          <span className="absolute -top-10 right-0 bg-white text-black text-[10px] px-2 py-1 rounded font-bold">COPIAT!</span>
        )}
      </button>
    </div>
  );
}

/* --- PAGINA PRINCIPALĂ --- */
export default function PostSharePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params); 
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getPostData = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, profiles(username, avatar_url)`)
        .eq("id", resolvedParams.id)
        .single();

      if (data) setPost(data);
      setLoading(false);
    };
    getPostData();
  }, [resolvedParams.id, supabase]);

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center text-yellow-400 font-black tracking-widest animate-pulse">
      SMILE LIVE...
    </div>
  );

  if (!post) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
      <h1 className="text-4xl font-black mb-4 tracking-tighter">404</h1>
      <Link href="/" className="px-6 py-3 bg-yellow-400 text-black font-black rounded-full text-xs">BACK HOME</Link>
    </div>
  );

  return (
    <div className="relative h-screen w-full bg-black flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-30 blur-3xl scale-110">
         <video src={post.video_url} muted loop autoPlay playsInline className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 w-full max-w-[450px] aspect-[9/16] bg-zinc-950 shadow-2xl sm:rounded-3xl overflow-hidden border border-white/5">
        <video 
          src={post.video_url} 
          className="w-full h-full object-cover"
          autoPlay 
          loop 
          playsInline
        />
        
        <div className="absolute right-0 bottom-[15%] z-50">
          <SidebarActions post={post} />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/40 to-transparent z-40">
          <p className="font-black text-white text-lg drop-shadow-md">@{post.profiles?.username}</p>
          <p className="text-white/80 text-sm mt-1 line-clamp-2">{post.caption || "Fără descriere"}</p>
        </div>
      </div>
    </div>
  );
}
