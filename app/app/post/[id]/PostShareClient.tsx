"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import {
  Heart, MessageSquare, Share2, Volume2, VolumeX,
  ChevronLeft, X, Send, Loader2, Check, Play,
  Eye, UserPlus, UserCheck, Link2, MessageCircle
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ShareModal from "./ShareModal";

function useSupabase() {
  return useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ─── COMMENT ITEM ─────────────────────────────────────────────────────────────
function CommentItem({ comm }: { comm: any }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-9 h-9 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/5 flex items-center justify-center text-[10px] font-black text-zinc-500 uppercase">
        {!imgErr && comm.profiles?.avatar_url
          ? <img src={comm.profiles.avatar_url} className="w-full h-full object-cover" onError={() => setImgErr(true)} alt="" />
          : comm.profiles?.username?.[0] || "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-yellow-400 mb-0.5 uppercase tracking-tight italic">
          @{comm.profiles?.username || "anon"}
        </p>
        <p className="text-sm font-medium leading-snug text-zinc-200 break-words">{comm.content}</p>
      </div>
    </div>
  );
}

// ─── SHARE MENU ───────────────────────────────────────────────────────────────
function ShareMenu({ onCopyLink, onSendToChat, onClose }: {
  onCopyLink: () => void;
  onSendToChat: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
        className="w-full max-w-md rounded-t-[2.5rem] px-6 pt-4 pb-10"
        style={{ background: "#111114" }}
      >
        <div className="w-10 h-1 rounded-full bg-white/10 mx-auto mb-6" />
        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-4">Distribuie</p>

        <div className="space-y-3">
          {/* Trimite în Chat */}
          <button
            onClick={() => { onClose(); onSendToChat(); }}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all"
            style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.12), rgba(168,85,247,0.12))", border: "1.5px solid rgba(236,72,153,0.2)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}>
              <MessageCircle size={18} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-black text-sm text-white tracking-tight">Trimite în Chat</p>
              <p className="text-[9px] font-bold text-white/30 mt-0.5">Alege un utilizator din lista ta</p>
            </div>
          </button>

          {/* Copiază Link */}
          <button
            onClick={() => { onCopyLink(); onClose(); }}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/10">
              <Link2 size={18} className="text-white/60" />
            </div>
            <div className="text-left">
              <p className="font-black text-sm text-white tracking-tight">Copiază Link</p>
              <p className="text-[9px] font-bold text-white/30 mt-0.5">Distribuie oriunde</p>
            </div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── SIDEBAR ACTIONS ──────────────────────────────────────────────────────────
function SidebarActions({
  post, currentUser, likeCount, liked, onLike,
  onOpenComments, commentCount, viewCount,
  onOpenShareMenu, supabase
}: {
  post: any; currentUser: any; likeCount: number; liked: boolean;
  onLike: () => void; onOpenComments: () => void;
  commentCount: number; viewCount: number;
  onOpenShareMenu: () => void; supabase: any;
}) {
  const [following, setFollowing]         = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || !post?.user_id) return;
    supabase.from("follows")
      .select("follower_id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", post.user_id)
      .maybeSingle()
      .then(({ data }: any) => setFollowing(!!data));
  }, [currentUser, post, supabase]);

  const handleFollow = async () => {
    if (!currentUser || followLoading) return;
    setFollowLoading(true);
    if (following) {
      await supabase.from("follows").delete().eq("follower_id", currentUser.id).eq("following_id", post.user_id);
      setFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: currentUser.id, following_id: post.user_id });
      setFollowing(true);
    }
    setFollowLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-5 pr-4">

      {/* Like */}
      <button onClick={onLike} className="flex flex-col items-center gap-1 text-white group">
        <div className={`p-3.5 rounded-full bg-black/40 backdrop-blur-xl border transition-all duration-300 ${liked ? "border-red-500/50 bg-red-500/20 scale-110" : "border-white/10 group-hover:border-red-500/30 group-hover:bg-red-500/10"}`}>
          <Heart size={26} className={`transition-all duration-300 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
        </div>
        <span className="text-[10px] font-black tabular-nums">{formatNum(likeCount)}</span>
      </button>

      {/* Comments */}
      <button onClick={onOpenComments} className="flex flex-col items-center gap-1 text-white group">
        <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 group-hover:border-white/30 transition-all">
          <MessageSquare size={26} />
        </div>
        <span className="text-[10px] font-black tabular-nums">{formatNum(commentCount)}</span>
      </button>

      {/* Views */}
      <div className="flex flex-col items-center gap-1 text-white">
        <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
          <Eye size={26} className="text-yellow-400" />
        </div>
        <span className="text-[10px] font-black tabular-nums text-yellow-400">{formatNum(viewCount)}</span>
      </div>

      {/* Share → deschide ShareMenu */}
      <button onClick={onOpenShareMenu} className="flex flex-col items-center gap-1 text-white group">
        <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 group-hover:bg-pink-500/10 group-hover:border-pink-500/30 transition-all duration-300">
          <Share2 size={26} />
        </div>
        <span className="text-[10px] font-black italic uppercase">Share</span>
      </button>

      {/* Follow */}
      {currentUser && currentUser.id !== post.user_id && (
        <button onClick={handleFollow} disabled={followLoading} className="flex flex-col items-center gap-1 text-white group">
          <div className={`p-3.5 rounded-full backdrop-blur-xl border transition-all ${following ? "bg-white/10 border-white/20" : "bg-black/40 border-white/10 group-hover:border-white/30"}`}>
            {followLoading ? <Loader2 size={22} className="animate-spin" /> : following ? <UserCheck size={22} className="text-emerald-400" /> : <UserPlus size={22} />}
          </div>
          <span className="text-[9px] font-black uppercase tracking-tight">{following ? "Following" : "Follow"}</span>
        </button>
      )}

      {/* Branding */}
      <div className="flex flex-col items-center mt-1 pointer-events-none select-none">
        <img src="/smile_rebrand-app.png" alt="Smile" className="w-7 h-7 object-contain mb-1" />
        <span className="bg-gradient-to-br from-[#8B5CF6] to-[#FACC15] bg-clip-text text-transparent font-black italic tracking-tighter text-[10px] uppercase">smile</span>
      </div>
    </div>
  );
}

// ─── COMMENTS PANEL ───────────────────────────────────────────────────────────
function CommentsPanel({ post, currentUser, onClose, supabase }: {
  post: any; currentUser: any; onClose: () => void; supabase: any;
}) {
  const [comments, setComments]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending]       = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(username, avatar_url)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    if (data) setComments(data);
    setLoading(false);
  }, [post.id, supabase]);

  useEffect(() => { fetchComments(); }, [fetchComments]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);

  const handleSend = async () => {
    if (!newComment.trim() || !currentUser || sending) return;
    setSending(true);
    const { data, error } = await supabase
      .from("comments")
      .insert([{ post_id: post.id, user_id: currentUser.id, content: newComment.trim() }])
      .select("*, profiles(username, avatar_url)")
      .single();
    if (!error && data) { setComments(prev => [...prev, data]); setNewComment(""); }
    setSending(false);
  };

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-[#0a0a0a]/95 backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
        <div className="text-[11px] font-black uppercase tracking-widest text-zinc-400">{formatNum(comments.length)} Comments</div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-all"><X size={18} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {loading
          ? <div className="flex items-center justify-center py-10"><Loader2 size={22} className="animate-spin text-yellow-400" /></div>
          : comments.length === 0
          ? <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-2 py-16"><MessageSquare size={32} strokeWidth={1} /><span className="text-[10px] font-black uppercase tracking-widest">No comments yet</span></div>
          : comments.map(c => <CommentItem key={c.id} comm={c} />)}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 py-3 border-t border-white/5 shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {currentUser ? (
          <div className="relative">
            <input value={newComment} onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Add a comment..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-5 pr-14 text-sm font-medium outline-none focus:border-yellow-400/60 transition-all placeholder:text-zinc-700 text-white" />
            <button onClick={handleSend} disabled={sending || !newComment.trim()}
              className="absolute right-2 top-2 p-2.5 bg-yellow-400 text-black rounded-xl active:scale-90 transition-all disabled:opacity-30 shadow-lg">
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        ) : (
          <Link href="/app/login" className="block w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-center text-[11px] font-black uppercase tracking-widest text-zinc-500">
            Login to comment
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PostShareClient({ id }: { id: string }) {
  const supabase = useSupabase();

  const [post, setPost]               = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [muted, setMuted]             = useState(true);
  const [playing, setPlaying]         = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [liked, setLiked]             = useState(false);
  const [likeCount, setLikeCount]     = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [viewCount, setViewCount]     = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);  // menu cu optiuni
  const [showShareModal, setShowShareModal] = useState(false); // picker useri chat
  const [copied, setCopied]           = useState(false);
  const [avatarErr, setAvatarErr]     = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: postData }, { data: { user } }] = await Promise.all([
        supabase.from("posts").select("*, profiles(id, username, avatar_url)").eq("id", id).single(),
        supabase.auth.getUser(),
      ]);
      if (postData) {
        setPost(postData);
        setViewCount(postData.views_count || 0);
        try { await supabase.rpc("increment_post_views", { post_id: id }); setViewCount(v => v + 1); } catch {}
        const { count: cCount } = await supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", id);
        setCommentCount(cCount || 0);
        const { count: lCount } = await supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", id);
        setLikeCount(lCount || 0);
        if (user) {
          const { data: likeData } = await supabase.from("likes").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle();
          setLiked(!!likeData);
        }
      }
      setCurrentUser(user);
      setLoading(false);
    };
    load();
  }, [id, supabase]);

  useEffect(() => {
    if (!post) return;
    const ch = supabase.channel(`post-likes-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "likes", filter: `post_id=eq.${id}` }, async () => {
        const { count } = await supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", id);
        setLikeCount(count || 0);
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [post, id, supabase]);

  const handleLike = async () => {
    if (!currentUser) { window.location.href = "/app/login"; return; }
    if (likeLoading) return;
    setLikeLoading(true);
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    if (liked) await supabase.from("likes").delete().eq("post_id", id).eq("user_id", currentUser.id);
    else await supabase.from("likes").insert({ post_id: id, user_id: currentUser.id });
    setLikeLoading(false);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/app/post/${id}`;
    try { await navigator.clipboard.writeText(url); }
    catch {
      const el = document.createElement("input");
      el.value = url; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShowComments(false); setShowShareMenu(false); setShowShareModal(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400 font-mono italic">smileliveapp.com</span>
    </div>
  );

  if (!post) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
      <X size={36} className="text-zinc-700" />
      <span className="font-black uppercase tracking-widest text-sm">Post not found</span>
      <Link href="/app" className="px-6 py-3 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest mt-2">Go Home</Link>
    </div>
  );

  return (
    <>
      <div className="relative h-[100dvh] w-full bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 blur-[80px] scale-150 pointer-events-none">
          <video src={post.video_url || post.media_url} muted loop autoPlay playsInline className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 w-full max-w-[430px] h-full sm:h-[93vh] bg-black sm:rounded-[28px] overflow-hidden border border-white/5 shadow-2xl flex flex-col">

          {/* Top controls */}
          <div className="absolute top-5 left-5 right-5 z-50 flex justify-between items-center">
            <Link href="/app" className="p-3 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-white/10 transition-all active:scale-90">
              <ChevronLeft size={20} />
            </Link>
            <button onClick={() => setMuted(m => !m)} className="p-3 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-white/10 transition-all active:scale-90">
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          {/* Video */}
          <div className="relative flex-1 overflow-hidden" onClick={togglePlay}>
            <video ref={videoRef} src={post.video_url || post.media_url} poster={post.thumbnail_url || undefined}
              className="w-full h-full object-cover" autoPlay loop playsInline muted={muted} />
            {!playing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                  <Play size={28} className="text-white ml-1" fill="white" />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="absolute right-0 bottom-[22%] z-50">
            <SidebarActions
              post={post} currentUser={currentUser}
              likeCount={likeCount} liked={liked} onLike={handleLike}
              onOpenComments={() => setShowComments(true)}
              commentCount={commentCount} viewCount={viewCount}
              onOpenShareMenu={() => setShowShareMenu(true)}
              supabase={supabase}
            />
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 w-full px-5 pb-8 pt-16 bg-gradient-to-t from-black via-black/60 to-transparent z-40 pointer-events-none">
            <Link href={`/app/profile/${post.profiles?.username}`} className="flex items-center gap-3 mb-2 pointer-events-auto w-fit">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400 bg-zinc-900 flex items-center justify-center text-xs font-black text-zinc-500 uppercase">
                {!avatarErr && post.profiles?.avatar_url
                  ? <img src={post.profiles.avatar_url} className="w-full h-full object-cover" onError={() => setAvatarErr(true)} alt="" />
                  : post.profiles?.username?.[0]}
              </div>
              <p className="text-base font-black text-white hover:text-yellow-400 transition-colors">@{post.profiles?.username}</p>
            </Link>
            {post.caption && <p className="text-white/70 text-sm leading-relaxed line-clamp-2 pr-20">{post.caption}</p>}
          </div>

          {/* Comments panel */}
          {showComments && (
            <CommentsPanel post={post} currentUser={currentUser} supabase={supabase} onClose={() => setShowComments(false)} />
          )}
        </div>
      </div>

      {/* ── SHARE MENU (copy / chat) ── */}
      <AnimatePresence>
        {showShareMenu && (
          <ShareMenu
            onCopyLink={handleCopyLink}
            onSendToChat={() => {
              if (!currentUser) { window.location.href = "/app/login"; return; }
              setShowShareModal(true);
            }}
            onClose={() => setShowShareMenu(false)}
          />
        )}
      </AnimatePresence>

      {/* ── SHARE MODAL (picker useri) ── */}
      <AnimatePresence>
        {showShareModal && currentUser && (
          <ShareModal
            post={post}
            currentUser={currentUser}
            supabase={supabase}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Copied toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2 px-5 py-3 rounded-full font-black text-xs text-white uppercase tracking-wide"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <Check size={14} strokeWidth={3} /> Link copiat!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}