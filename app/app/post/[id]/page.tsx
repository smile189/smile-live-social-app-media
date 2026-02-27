"use client";

import { useEffect, useState, use } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { 
  Heart, MessageSquare, Bookmark, Share2, X, Send, Loader2, Reply as ReplyIcon 
} from "lucide-react";

/* --- SIDEBAR ACTIONS INTEGRAT (CA SĂ NU MAI DEA EROARE DE IMPORT) --- */
function SidebarActions({ post }: { post: any }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => {
    if (!post) return;
    const fetchStats = async () => {
      const { count } = await supabase.from("likes").select("*", { count: 'exact', head: true }).eq("post_id", post.id);
      setLikeCount(count || 0);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("likes").select("id").eq("post_id", post.id).eq("user_id", user.id).single();
        setLiked(!!data);
      }
    };
    fetchStats();
  }, [post]);

  return (
    <div className="flex flex-col items-center gap-6 pr-4">
      <button className="flex flex-col items-center gap-1 text-white">
        <div className={`p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 ${liked ? 'text-red-500' : ''}`}>
          <Heart size={28} className={liked ? "fill-red-500" : ""} />
        </div>
        <span className="text-[10px] font-black">{likeCount}</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-white">
        <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5">
          <MessageSquare size={28} />
        </div>
        <span className="text-[10px] font-black">Chat</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-white">
        <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5">
          <Share2 size={28} />
        </div>
        <span className="text-[10px] font-black">Share</span>
      </button>
    </div>
  );
}

/* --- PAGINA PRINCIPALĂ --- */
export default function PostSharePage({ params }: { params: Promise<{ id: string }> }) {
  // REPARĂ params: În Next.js App Router, params trebuie desfăcut cu 'use'
  const resolvedParams = use(params); 
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getPostData = async () => {
      // Fetch postarea + profilul autorului folosind ID-ul corect
      const { data, error } = await supabase
        .from("posts")
        .select(`*, profiles(username, avatar_url)`)
        .eq("id", resolvedParams.id)
        .single();

      if (data) {
        setPost(data);
      } else {
        console.error("Post not found:", error);
      }
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
      <p className="opacity-50 uppercase text-xs tracking-[0.2em]">Postarea nu a fost găsită</p>
      <Link href="/" className="mt-8 px-6 py-3 bg-yellow-400 text-black font-black rounded-full text-xs">BACK HOME</Link>
    </div>
  );

  return (
    <div className="relative h-screen w-full bg-black flex items-center justify-center overflow-hidden">
      {/* BACKGROUND BLURRED VIDEO */}
      <div className="absolute inset-0 opacity-30 blur-3xl scale-110">
         <video src={post.video_url} muted loop autoPlay playsInline className="w-full h-full object-cover" />
      </div>

      {/* MAIN VIDEO PLAYER */}
      <div className="relative z-10 w-full max-w-[450px] aspect-[9/16] bg-zinc-950 shadow-2xl sm:rounded-3xl overflow-hidden border border-white/5">
        <video 
          src={post.video_url} 
          className="w-full h-full object-cover"
          autoPlay 
          loop 
          playsInline
          controls={false}
        />
        
        {/* SIDEBAR */}
        <div className="absolute right-0 bottom-[15%] z-50">
          <SidebarActions post={post} />
        </div>

        {/* INFO OVERLAY */}
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/40 to-transparent z-40">
          <p className="font-black text-white text-lg drop-shadow-md">@{post.profiles?.username}</p>
          <p className="text-white/80 text-sm mt-1 line-clamp-2">{post.caption || "Fără descriere"}</p>
        </div>
      </div>
    </div>
  );
}
