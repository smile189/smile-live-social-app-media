"use client";

import { useEffect, useState, useRef, memo, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft, Zap, Heart, MessageCircle, X, Loader2,
  UserPlus, UserCheck, Eye, Send, Shield, Ban,
  Users, Grid3x3, Play, AlertTriangle
} from "lucide-react";
import Link from "next/link";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function getCount(val: any): number {
  if (Array.isArray(val)) return val[0]?.count ?? 0;
  if (typeof val === "object" && val !== null) return val.count ?? 0;
  return 0;
}

// ─── VIDEO PREVIEW ────────────────────────────────────────────────────────────

const VideoPreview = memo(({ src, thumbnail, views, likesCount, commentsCount }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const forcePlay = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.muted = true;
      v.setAttribute("playsinline", "");
      await v.play();
      setPlaying(true);
    } catch {}
  };

  const stopVideo = () => {
    const v = videoRef.current;
    if (v) { v.pause(); v.currentTime = 0; setPlaying(false); }
  };

  return (
    <div
      className="relative w-full h-full group cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 shadow-xl"
      onMouseEnter={forcePlay}
      onMouseLeave={stopVideo}
      onTouchStart={forcePlay}
    >
      {/* Thumbnail fallback */}
      {thumbnail && !playing && (
        <img src={thumbnail} className="absolute inset-0 w-full h-full object-cover" alt="" />
      )}

      <video
        ref={videoRef}
        src={src}
        muted loop playsInline preload="metadata"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
      />

      {/* Play icon when idle */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
            <Play size={16} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Stats */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Heart size={10} className="text-white fill-white" />
            <span className="text-[9px] font-black font-mono text-white">{formatNum(likesCount)}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <MessageCircle size={10} className="text-white fill-white" />
            <span className="text-[9px] font-black font-mono text-white">{formatNum(commentsCount)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10">
          <Eye size={9} className="text-yellow-400" />
          <span className="text-[9px] font-black font-mono text-white">{formatNum(views)}</span>
        </div>
      </div>
    </div>
  );
});
VideoPreview.displayName = "VideoPreview";

// ─── BANNED STATE ─────────────────────────────────────────────────────────────

function BannedPage({ username }: { username: string }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-8 text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <Ban size={36} className="text-red-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
          <AlertTriangle size={12} className="text-white" />
        </div>
      </div>

      <h1 className="text-2xl font-black uppercase tracking-tighter italic mb-2">
        Cont suspended
      </h1>
      <p className="text-zinc-500 text-sm font-medium max-w-xs leading-relaxed mb-2">
        The account <span className="text-zinc-300 font-bold">@{username}</span> has been suspended for violating the community guidelines.
      </p>
      <p className="text-zinc-700 text-[10px] uppercase tracking-widest font-bold mb-10">
       Suspended Account
      </p>

      <button
        onClick={() => router.back()}
        className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
      >
        Back
      </button>
    </div>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────

function ProfileAvatar({ profile }: { profile: any }) {
  const [err, setErr] = useState(false);
  const liveColor = profile.live_color || "#ff4d4d";
  const isLive = profile.is_live;

  return (
    <div className="relative">
      <div
        className={`w-32 h-32 md:w-44 md:h-44 rounded-full p-[3px] shadow-2xl transition-all ${isLive ? "animate-pulse" : ""}`}
        style={isLive ? { background: `linear-gradient(135deg, ${liveColor}, ${liveColor}88)` } : { background: "rgba(255,255,255,0.08)" }}
      >
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-black bg-zinc-900">
          {!err && profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              className="w-full h-full object-cover"
              onError={() => setErr(true)}
              alt={profile.username}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-black text-zinc-500 uppercase">
              {profile.username?.[0]}
            </div>
          )}
        </div>
      </div>

      {isLive && (
        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase flex items-center gap-1.5 shadow-lg"
          style={{ backgroundColor: liveColor }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          LIVE · {formatNum(profile.viewer_count || 0)}
        </div>
      )}
    </div>
  );
}

// ─── COMMENT ITEM ─────────────────────────────────────────────────────────────

function CommentItem({ comm }: { comm: any }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-9 h-9 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/5">
        {!imgErr && comm.profiles?.avatar_url ? (
          <img
            src={comm.profiles.avatar_url}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)}
            alt=""
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-zinc-500 uppercase">
            {comm.profiles?.username?.[0] || "?"}
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-yellow-400 mb-0.5 uppercase tracking-tight italic">
          @{comm.profiles?.username || "anon"}
        </p>
        <p className="text-sm font-medium leading-snug text-zinc-200">{comm.content}</p>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function PublicProfilePage() {
  const params  = useParams();
  const router  = useRouter();
  const username = params?.username as string;

  const [profile, setProfile]         = useState<any>(null);
  const [posts, setPosts]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [isBanned, setIsBanned]       = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Counts
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Modal
  const [selectedPost, setSelectedPost]   = useState<any>(null);
  const [postComments, setPostComments]   = useState<any[]>([]);
  const [newComment, setNewComment]       = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // ── Fetch posts ──
  const fetchProfilePosts = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("posts")
      .select("*, likes:likes(count), comments:comments(count), views_count")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setPosts(data);
  }, []);

  // ── Fetch follow counts ──
  const fetchFollowCounts = useCallback(async (userId: string) => {
    const [fwers, fwing] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
    ]);
    setFollowersCount(fwers.count || 0);
    setFollowingCount(fwing.count || 0);
  }, []);

  // ── Main fetch ──
  useEffect(() => {
    async function fetchPublicData() {
      if (!username) return;
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      setCurrentUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (!profileData) { setLoading(false); return; }

      // Redirect own profile
      if (user && user.id === profileData.id) {
        router.replace("/app/profile");
        return;
      }

      // Banned check
      if (profileData.role === "banned") {
        setIsBanned(true);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      await Promise.all([
        fetchProfilePosts(profileData.id),
        fetchFollowCounts(profileData.id),
      ]);

      // Check follow status
      if (user) {
        const { data: fData } = await supabase
          .from("follows")
          .select("follower_id")
          .eq("follower_id", user.id)
          .eq("following_id", profileData.id)
          .maybeSingle();
        setIsFollowing(!!fData);
      }

      setLoading(false);
    }
    fetchPublicData();
  }, [username, router, fetchProfilePosts, fetchFollowCounts]);

  // ── Scroll comments to bottom ──
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [postComments]);

  // ── Follow / Unfollow ──
  const handleFollow = async () => {
    if (!currentUser) return router.push("/app/login");
    if (followLoading) return;
    setFollowLoading(true);

    if (isFollowing) {
      await supabase.from("follows").delete()
        .eq("follower_id", currentUser.id)
        .eq("following_id", profile.id);
      setIsFollowing(false);
      setFollowersCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("follows").insert({
        follower_id: currentUser.id,
        following_id: profile.id,
      });
      setIsFollowing(true);
      setFollowersCount((c) => c + 1);
    }
    setFollowLoading(false);
  };

  // ── Open post modal ──
  const openPost = async (post: any) => {
    setSelectedPost(post);
    setPostComments([]);

    // Increment views
await supabase.rpc("increment_post_views", { post_id: post.id }).then(null, () => {});

    const { data } = await supabase
      .from("comments")
      .select("*, profiles(username, avatar_url)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    if (data) setPostComments(data);
  };

  // ── Add comment ──
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost || !currentUser) return;
    if (sendingComment) return;
    setSendingComment(true);

    const { data, error } = await supabase
      .from("comments")
      .insert([{ post_id: selectedPost.id, user_id: currentUser.id, content: newComment.trim() }])
      .select("*, profiles(username, avatar_url)")
      .single();

    if (!error && data) {
      setPostComments((prev) => [...prev, data]);
      setNewComment("");
      fetchProfilePosts(profile.id);
      // Optimistic update comment count on selected post
      setSelectedPost((p: any) => ({
        ...p,
        comments: [{ count: getCount(p.comments) + 1 }],
      }));
    }
    setSendingComment(false);
  };

  // ── Close modal on Escape ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedPost(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── LOADING ──
  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400 font-mono italic">
        SMILE...
      </span>
    </div>
  );

  // ── BANNED ──
  if (isBanned) return <BannedPage username={username} />;

  // ── NOT FOUND ──
  if (!profile) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-6">
        <X size={32} className="text-zinc-700" />
      </div>
      <h1 className="text-xl font-black uppercase tracking-[0.3em] italic mb-2">User Protocol 404</h1>
      <p className="text-zinc-600 text-sm mb-10">This user profile doesn't exist.</p>
      <button
        onClick={() => router.push("/app")}
        className="px-10 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-zinc-100 transition-all active:scale-95"
      >
        Back to Home
      </button>
    </div>
  );

  const liveColor = profile.live_color || "#ff4d4d";
  const totalLikes = posts.reduce((a, p) => a + getCount(p.likes), 0);
  const totalViews = posts.reduce((a, p) => a + (p.views_count || 0), 0);

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">

      {/* ── NAVBAR ── */}
      <div className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2.5 bg-white/5 rounded-2xl hover:bg-white/10 active:scale-90 transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex flex-col items-center flex-1">
          <span className="font-black text-[9px] tracking-[0.5em] uppercase text-zinc-600 italic leading-none">
            User smile  profile
          </span>

        </div>

        {/* LOGO REBRAND DREAPTA */}
        <div className="flex flex-col items-end gap-1">
          <img 
            src="/smile_rebrand-app.png" 
            alt="Smile Logo" 
            className="h-7 w-auto object-contain brightness-110 active:scale-95 transition-transform"
          />
          <span className="font-black text-[8px] tracking-[0.2em] uppercase text-zinc-600 italic">
            www.smileliveapp.com
          </span>
        </div>
      </div>


      <div className="pt-28 max-w-4xl mx-auto px-4">

        {/* ── PROFILE HEADER ── */}
        <div className="flex flex-col items-center mb-14 text-center">
          <ProfileAvatar profile={profile} />

          <div className="mt-8 space-y-1">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
              @{profile.username}
            </h1>
            {profile.full_name && (
              <p className="text-zinc-500 font-bold text-[11px] tracking-widest uppercase italic">
                {profile.full_name}
              </p>
            )}
            {/* Agency badge */}
            {profile.agency_id && (
              <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
                <Shield size={10} className="text-violet-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-violet-400">
                  Agency Creator
                </span>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6 px-8 py-4 bg-white/[0.03] border border-white/5 rounded-3xl max-w-md w-full">
              <p className="text-zinc-300 text-sm font-medium italic leading-relaxed">
                "{profile.bio}"
              </p>
            </div>
          )}

          {/* Stats row — Ultra modern & fluid */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-6">
            {[
              { label: "Posts", value: posts.length },
              { label: "Followers", value: followersCount },
              { label: "Following", value: followingCount },
              { label: "Likes", value: totalLikes },
              { label: "Views", value: totalViews },
            ].map((s) => (
              <div 
                key={s.label} 
                className="flex flex-col items-center px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md transition-all hover:bg-white/[0.06] hover:scale-105"
              >
                <div className="text-xl font-black italic tracking-tighter text-white leading-none">
                  {formatNum(s.value)}
                </div>
                <div className="text-[7px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-1">
                  {s.label}
                </div>
                
                {/* Un punct discret sub statistica activă sau importantă */}
                {s.label === "Likes" && (
                  <div className="w-1 h-1 bg-yellow-400 rounded-full mt-1 shadow-[0_0_8px_#facc15]" />
                )}
              </div>
            ))}
          </div>


          {/* Action buttons */}
          <div className="mt-6 flex gap-3 w-full max-w-xs">
            <button
              onClick={handleFollow}
              disabled={followLoading || !currentUser}
              className={`flex-1 py-4 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 ${
                isFollowing
                  ? "bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800"
                  : "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.12)] hover:bg-zinc-100"
              }`}
            >
              {followLoading
                ? <Loader2 size={14} className="animate-spin" />
                : isFollowing
                ? <><UserCheck size={14} /> Following</>
                : <><UserPlus size={14} /> Follow</>
              }
            </button>

                <button
                  onClick={() => {
                    const roomId = [currentUser.id, profile.id].sort().join("_");
                    // Adăugăm un flag "autoSend=true" ca să știe chat-ul să-l trimită singur
                    const msg = encodeURIComponent("Salut! ✨ Ți-am văzut profilul și am vrut să te salut!");
                    router.push(`/app/messages?room=${roomId}&text=${msg}&autoSend=true`);
                  }}
                  className="px-5 py-3 rounded-2xl border border-pink-500/20 bg-pink-500/5 text-pink-500 hover:bg-pink-500/10 active:scale-95 transition-all flex items-center gap-2"
                >
                  <MessageCircle size={20} fill="currentColor" />
                  <span className="font-black italic uppercase text-[10px] tracking-tighter">Say Hi</span>
                </button>


          </div>

          {/* Not logged in hint */}
          {!currentUser && (
            <p className="mt-3 text-[10px] text-zinc-700 font-medium">
              <Link href="/app/login" className="text-yellow-400 hover:underline">Signup for view</Link> and follow
            </p>
          )}
        </div>

        {/* ── POSTS GRID ── */}
        {posts.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-zinc-700">
            <Grid3x3 size={36} strokeWidth={1} />
            <span className="text-[10px] font-black uppercase tracking-widest">No posts yet</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-[9/16] cursor-pointer"
                onClick={() => openPost(post)}
              >
                <VideoPreview
                  src={post.video_url || post.media_url}
                  thumbnail={post.thumbnail_url}
                  views={post.views_count || 0}
                  likesCount={getCount(post.likes)}
                  commentsCount={getCount(post.comments)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── POST MODAL ── */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-200">

          {/* Video side */}
          <div className="relative flex-1 bg-black flex items-center justify-center h-[55vh] md:h-full">
            <video
              src={selectedPost.video_url || selectedPost.media_url}
              className="h-full w-full object-contain"
              autoPlay loop playsInline controls
            />
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-5 left-5 p-3 bg-black/50 backdrop-blur-xl rounded-full text-white z-10 hover:bg-white/10 transition-all active:scale-90"
            >
              <X size={20} />
            </button>

            {/* Post stats overlay */}
            <div className="absolute bottom-6 left-6 flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full">
                <Heart size={13} className="text-red-400 fill-red-400" />
                <span className="text-xs font-black">{formatNum(getCount(selectedPost.likes))}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full">
                <Eye size={13} className="text-yellow-400" />
                <span className="text-xs font-black">{formatNum(selectedPost.views_count || 0)}</span>
              </div>
            </div>
          </div>

          {/* Comments side */}
          <div className="w-full md:w-[380px] bg-[#080808] border-t md:border-t-0 md:border-l border-white/5 flex flex-col h-[45vh] md:h-full">

            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-zinc-900/30 shrink-0">
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-zinc-800 border border-white/5">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-zinc-500 uppercase">{profile.username[0]}</div>
                }
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-tight italic text-yellow-400">
                  @{profile.username}
                </p>
                {selectedPost.caption && (
                  <p className="text-[10px] text-zinc-500 font-medium leading-tight mt-0.5 line-clamp-1">
                    {selectedPost.caption}
                  </p>
                )}
              </div>
              <div className="ml-auto text-[9px] font-black uppercase tracking-widest text-zinc-700 italic">
                {getCount(selectedPost.comments)} replies
              </div>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {postComments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-2">
                  <MessageCircle size={28} strokeWidth={1} />
                  <span className="text-[9px] font-black uppercase tracking-widest">No signals yet</span>
                </div>
              ) : (
                postComments.map((comm) => <CommentItem key={comm.id} comm={comm} />)
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Comment input */}
            <div className="p-4 border-t border-white/5 bg-zinc-900/10 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4">
              {currentUser ? (
                <div className="relative">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                    placeholder="Type a message..."
                    className="w-full bg-white/5 border border-white/10 rounded-[18px] py-3.5 pl-5 pr-14 text-sm font-medium outline-none focus:border-yellow-400/60 transition-all placeholder:text-zinc-700"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={sendingComment || !newComment.trim()}
                    className="absolute right-2 top-2 p-2.5 bg-yellow-400 text-black rounded-xl active:scale-90 transition-all disabled:opacity-30 shadow-lg"
                  >
                    {sendingComment
                      ? <Loader2 size={16} className="animate-spin" />
                      : <Send size={16} />}
                  </button>
                </div>
              ) : (
                <Link
                  href="/app/login"
                  className="block w-full py-3.5 rounded-[18px] bg-white/5 border border-white/10 text-center text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:bg-white/10 transition-all"
                >
                  Login to comment
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}