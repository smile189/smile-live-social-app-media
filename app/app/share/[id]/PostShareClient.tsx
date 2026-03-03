"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import {
  Heart,
  MessageSquare,
  Share2,
  Volume2,
  VolumeX,
  ChevronLeft,
} from "lucide-react";

/* ---------------- SIDEBAR ACTIONS ---------------- */

function SidebarActions({ post }: { post: any }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!post) return;

    const fetchStats = async () => {
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id);

      setLikeCount(count || 0);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: likeData } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", user.id)
          .maybeSingle();

        setLiked(!!likeData);
      }
    };

    fetchStats();
  }, [post]);

  const handleShare = async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/share/${post.id}`
        : "";

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Smile Live | @${post.profiles?.username}`,
          text: post.caption,
          url: shareUrl,
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setIsSharing(true);
      setTimeout(() => setIsSharing(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 pr-4">
      <button
        onClick={() => setLiked(!liked)}
        className="flex flex-col items-center gap-1 text-white"
      >
        <div
          className={`p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 transition-all ${
            liked ? "text-red-500 scale-110" : ""
          }`}
        >
          <Heart size={28} className={liked ? "fill-red-500" : ""} />
        </div>
        <span className="text-[10px] font-black">{likeCount}</span>
      </button>

      <button className="flex flex-col items-center gap-1 text-white">
        <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
          <MessageSquare size={28} />
        </div>
        <span className="text-[10px] font-black italic uppercase">Chat</span>
      </button>

      <button
        onClick={handleShare}
        className="flex flex-col items-center gap-1 text-white relative"
      >
        <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-yellow-400 hover:text-black transition-all">
          <Share2 size={28} />
        </div>
        <span className="text-[10px] font-black italic uppercase">Share</span>

        {isSharing && (
          <span className="absolute -top-10 right-0 bg-yellow-400 text-black text-[10px] px-2 py-1 rounded font-black uppercase">
            Copiat!
          </span>
        )}
      </button>
    </div>
  );
}

/* ---------------- PAGE ---------------- */

export default function PostShareClient({ id }: { id: string }) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getPostData = async () => {
      const { data } = await supabase
        .from("posts")
        .select(`*, profiles(username, avatar_url)`)
        .eq("id", id)
        .single();

      if (data) setPost(data);
      setLoading(false);
    };

    getPostData();
  }, [id]);

  if (loading)
    return (
      <div className="h-screen bg-black flex items-center justify-center text-yellow-400 font-black uppercase">
        Smile Loading...
      </div>
    );

  if (!post)
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white uppercase font-black">
        Post not found
      </div>
    );

  return (
    <div className="relative h-[100dvh] w-full bg-black flex items-center justify-center overflow-hidden">
      {/* Background blur */}
      <div className="absolute inset-0 opacity-30 blur-[100px] scale-150 pointer-events-none">
        <video
          src={post.video_url}
          muted
          loop
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[450px] h-full sm:h-[92vh] bg-black sm:rounded-[32px] overflow-hidden border border-white/5 flex flex-col shadow-2xl">
        {/* Top controls */}
        <div className="absolute top-6 left-6 right-6 z-50 flex justify-between">
          <Link
            href="/app"
            className="p-3 bg-black/30 backdrop-blur-xl rounded-full text-white border border-white/10"
          >
            <ChevronLeft size={20} />
          </Link>

          <button
            onClick={() => setMuted(!muted)}
            className="p-3 bg-black/30 backdrop-blur-xl rounded-full text-white border border-white/10"
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          src={post.video_url}
          className="w-full h-full object-cover"
          autoPlay
          loop
          playsInline
          muted={muted}
          onClick={() =>
            videoRef.current?.paused
              ? videoRef.current.play()
              : videoRef.current?.pause()
          }
        />

        {/* Sidebar */}
        <div className="absolute right-0 bottom-[18%] z-50">
          <SidebarActions post={post} />
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/70 to-transparent z-40">
          <div className="flex items-center gap-3 mb-2 text-white">
            <img
              src={post.profiles?.avatar_url}
              className="w-10 h-10 rounded-full border border-yellow-400 object-cover"
              alt="avatar"
            />
            <p className="text-lg font-black">
              @{post.profiles?.username}
            </p>
          </div>

          <p className="text-white/80 text-sm mt-1 line-clamp-2 pr-10">
            {post.caption || "Redefine entertainment with Smile Live."}
          </p>
        </div>
      </div>
    </div>
  );
}