"use client";

import { useEffect, useState, useRef, memo, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import {
  Camera, LogOut, ChevronLeft, Loader2, X, Play,
  Trash2, MessageCircle, Heart, AlertTriangle, Edit3,
  Send, Wallet, Eye, Check, UserCheck, Users,
  Grid3x3, Shield, Building2, Settings, Volume2, Share2,
} from "lucide-react";
import Link from "next/link";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatNum(n: number | null | undefined): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toString();
}

function getCount(val: any): number {
  if (Array.isArray(val)) return val[0]?.count ?? 0;
  if (typeof val === "object" && val !== null) return val.count ?? 0;
  return 0;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest border animate-in slide-in-from-top-3 duration-300 ${
      type === "success"
        ? "bg-zinc-950 border-emerald-500/40 text-emerald-400"
        : "bg-zinc-950 border-red-500/40 text-red-400"
    }`}>
      {type === "success" ? <Check size={12} /> : <AlertTriangle size={12} />}
      {msg}
    </div>
  );
}

// ─── VIDEO PREVIEW ────────────────────────────────────────────────────────────

const VideoPreview = memo(({ src, thumbnail, views, likesCount, commentsCount, onClick }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = async () => {
    const v = videoRef.current;
    if (!v) return;
    try { v.muted = true; v.setAttribute("playsinline", ""); await v.play(); setPlaying(true); } catch {}
  };

  const handleStop = () => {
    const v = videoRef.current;
    if (v) { v.pause(); v.currentTime = 0; setPlaying(false); }
  };

  return (
    <div
      className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-zinc-900 group border border-white/5 shadow-xl cursor-pointer"
      onMouseEnter={handlePlay}
      onMouseLeave={handleStop}
      onTouchStart={handlePlay}
      onClick={onClick}
    >
      {/* Thumbnail fallback */}
      {thumbnail && !playing && (
        <img src={thumbnail} className="absolute inset-0 w-full h-full object-cover" alt="" />
      )}

      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
        muted loop playsInline preload="metadata"
      />

      {/* Play icon */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
            <Play size={16} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity pointer-events-none" />

      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Heart size={10} className="text-white fill-white" />
            <span className="text-[9px] font-black font-mono text-white">{likesCount}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <MessageCircle size={10} className="text-white fill-white" />
            <span className="text-[9px] font-black font-mono text-white">{commentsCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10">
          <Eye size={9} className="text-yellow-400" />
          <span className="text-[9px] font-black font-mono text-white">{views}</span>
        </div>
      </div>
    </div>
  );
});
VideoPreview.displayName = "VideoPreview";

// ─── COMMENT ITEM ─────────────────────────────────────────────────────────────

function CommentItem({ comm, isOwner, onDelete }: { comm: any; isOwner: boolean; onDelete: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="flex gap-3 group/c animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-9 h-9 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/5 flex items-center justify-center text-[10px] font-black text-zinc-500 uppercase">
        {!imgErr && comm.profiles?.avatar_url
          ? <img src={comm.profiles.avatar_url} className="w-full h-full object-cover" onError={() => setImgErr(true)} alt="" />
          : comm.profiles?.username?.[0] || "?"
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-yellow-400 mb-0.5 uppercase tracking-tight italic">
          @{comm.profiles?.username || "anon"}
        </p>
        <p className="text-sm font-medium leading-snug text-zinc-200 break-words">{comm.content}</p>
      </div>
      {isOwner && (
        <button
          onClick={onDelete}
          className="opacity-0 group-hover/c:opacity-100 transition-opacity p-1.5 text-zinc-700 hover:text-red-500 shrink-0"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

// ─── STAT ITEM ────────────────────────────────────────────────────────────────

function StatItem({ label, value, border }: { label: string; value: number; border?: boolean }) {
  return (
    <div className={`px-5 py-4 text-center ${border ? "border-l border-white/5" : ""}`}>
      <div className="text-lg font-black text-white leading-none">{formatNum(value)}</div>
      <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 mt-0.5">{label}</div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile]           = useState<any>(null);
  const [posts, setPosts]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [isEditing, setIsEditing]       = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [isUploading, setIsUploading]   = useState(false);
  const [balance, setBalance]           = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [editData, setEditData] = useState({ full_name: "", bio: "", username: "" });
  const [usernameError, setUsernameError] = useState("");

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Modal
  const [selectedPost, setSelectedPost]     = useState<any>(null);
  const [postComments, setPostComments]     = useState<any[]>([]);
  const [newComment, setNewComment]         = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting]         = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

const handleShareProfile = async () => {
  if (!profile?.username) return;

  const profileUrl = `${window.location.origin}/app/profile/${profile.username}`;
  const shareData: ShareData = {
    title: `${profile.full_name || profile.username}'s Profile`,
    text: `Check out ${profile.full_name || profile.username}'s profile!`,
    url: profileUrl,
  };

  try {
    // 1. Încercăm să procesăm poza de profil dacă există
    if (profile.avatar_url) {
      try {
        const response = await fetch(profile.avatar_url);
        const blob = await response.blob();
        const file = new File([blob], "profile-pic.jpg", { type: blob.type });
        
        // Adăugăm fișierul în shareData
        const dataWithFile = { ...shareData, files: [file] };

        // Verificăm dacă browserul permite share-ul cu acest fișier
        if (navigator.canShare && navigator.canShare(dataWithFile)) {
          await navigator.share(dataWithFile);
          showToast("Profile shared with photo ✓");
          return; // Ieșim dacă share-ul a reușit
        }
      } catch (fileErr) {
        console.error("Could not process image for share", fileErr);
        // Dacă e eroare de CORS sau fetch, mergem mai departe la share fără poză
      }
    }

    // 2. Fallback la Share API standard (fără poză) dacă fișierul nu e suportat
    if (navigator.share) {
      await navigator.share(shareData);
      showToast("Profile shared ✓");
    } else {
      throw new Error("Web Share not supported");
    }
    

  } catch (err: any) {
    if (err.name !== "AbortError") {
      // 3. Fallback final: Copy to clipboard
      try {
        await navigator.clipboard.writeText(profileUrl);
        showToast("Link copiat ✓");
      } catch {
        showToast("Failed to copy link", "error");
      }
    }
  }
};


  // ── Fetch posts only (non-destructive) ──
  const fetchPosts = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("posts")
      .select("*, likes:likes(count), comments:comments(count), views_count")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setPosts(data);
  }, []);

  // ── Full init ──
  const init = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/app/login"); return; }

    const [pRes, wRes, followers, following] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", session.user.id).single(),
      supabase.from("wallets").select("coins_balance").eq("user_id", session.user.id).maybeSingle(),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", session.user.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", session.user.id),
    ]);

    if (pRes.data) {
      setProfile(pRes.data);
      setEditData({
        full_name: pRes.data.full_name || "",
        bio: pRes.data.bio || "",
        username: pRes.data.username || "",
      });
    }
    setFollowerCount(followers.count || 0);
    setFollowingCount(following.count || 0);
    if (wRes.data) setBalance(wRes.data.coins_balance);

    if (pRes.data) await fetchPosts(pRes.data.id);
    setLoading(false);
  }, [router, fetchPosts]);

  useEffect(() => { init(); }, [init]);

  // Realtime follows
  useEffect(() => {
    if (!profile?.id) return;
    const ch = supabase.channel("profile-follows-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "follows" }, async () => {
        const [fwers, fwing] = await Promise.all([
          supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
          supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
        ]);
        setFollowerCount(fwers.count || 0);
        setFollowingCount(fwing.count || 0);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profile?.id]);

  // Escape closes modal
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { setSelectedPost(null); setDeleteConfirmId(null); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Scroll comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [postComments]);

  // ── Avatar upload ──
  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setIsUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${profile.id}-${Date.now()}.${ext}`;
    try {
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: updErr } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", profile.id);
      if (updErr) throw updErr;
      setProfile((p: any) => ({ ...p, avatar_url: publicUrl }));
      showToast("Avatar actualizat ✓");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  // ── Save profile ──
  const handleUpdateProfile = async () => {
    if (isSaving) return;
    setUsernameError("");
    const cleanUsername = editData.username.toLowerCase().trim().replace(/\s+/g, "");

    if (!cleanUsername) return setUsernameError("Username could not be empty");
    if (!/^[a-z0-9_]+$/.test(cleanUsername)) return setUsernameError("Only letters, numbers and _ are allowed");

    // Check uniqueness (only if changed)
    if (cleanUsername !== profile.username) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .maybeSingle();
      if (existing) return setUsernameError("Username already taken");
    }

    setIsSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: editData.full_name.trim(),
      bio: editData.bio.trim(),
      username: cleanUsername,
    }).eq("id", profile.id);

    if (!error) {
      setProfile((p: any) => ({ ...p, full_name: editData.full_name.trim(), bio: editData.bio.trim(), username: cleanUsername }));
      setIsEditing(false);
      showToast("Profile saved ✓");
    } else {
      showToast(error.message, "error");
    }
    setIsSaving(false);
  };

  // ── Open post ──
  const openPost = async (post: any) => {
    setSelectedPost(post);
    setPostComments([]);
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(username, avatar_url)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    if (data) setPostComments(data);
  };

  // ── Add comment ──
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost || !profile || sendingComment) return;
    setSendingComment(true);
    const { data, error } = await supabase
      .from("comments")
      .insert([{ post_id: selectedPost.id, user_id: profile.id, content: newComment.trim() }])
      .select("*, profiles(username, avatar_url)")
      .single();

    if (!error && data) {
      setPostComments((prev) => [...prev, data]);
      setNewComment("");
      // Optimistic update — no full re-fetch
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id
            ? { ...p, comments: [{ count: getCount(p.comments) + 1 }] }
            : p
        )
      );
      setSelectedPost((p: any) => ({ ...p, comments: [{ count: getCount(p.comments) + 1 }] }));
    }
    setSendingComment(false);
  };

  // ── Delete comment ──
  const handleDeleteComment = async (commentId: string) => {
    await supabase.from("comments").delete().eq("id", commentId);
    setPostComments((prev) => prev.filter((c) => c.id !== commentId));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === selectedPost?.id
          ? { ...p, comments: [{ count: Math.max(0, getCount(p.comments) - 1) }] }
          : p
      )
    );
  };

  // ── Delete post ──
  const confirmDelete = async () => {
    if (!deleteConfirmId || isDeleting) return;
    setIsDeleting(true);
    const { error } = await supabase.from("posts").delete().eq("id", deleteConfirmId);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setSelectedPost(null);
      showToast("Post șters ✓");
    } else {
      showToast("Eroare la ștergere", "error");
    }
    setIsDeleting(false);
  };

  // ── Total stats ──
  const totalLikes = posts.reduce((a, p) => a + getCount(p.likes), 0);
  const totalViews = posts.reduce((a, p) => a + (p.views_count || 0), 0);

  // ─── LOADING ──────────────────────────────────────────────────────────────

  if (loading && !profile) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400 font-mono italic">Loading Profile...</span>
    </div>
  );

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 font-sans selection:bg-yellow-400/20">

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 px-5 py-4 flex items-center justify-between bg-black/80 backdrop-blur-xl border-b border-white/5">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90">
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-black italic text-lg tracking-tighter text-yellow-400 uppercase">My Profile</h1>
        <button
          onClick={() => supabase.auth.signOut().then(() => router.push("/"))}
          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
          title="Sign out"
        >
          <LogOut size={20} />
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-10">

        {/* ── PROFILE SECTION ── */}
        <div className="flex flex-col items-center gap-6 text-center">

          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.15)]">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-3xl font-black text-zinc-600 uppercase">
                  {profile?.username?.[0] || "?"}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 p-3 bg-yellow-400 text-black rounded-full shadow-xl hover:scale-110 transition-transform disabled:opacity-50 active:scale-95"
            >
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleUploadAvatar} className="hidden" accept="image/*" />
          </div>

          {/* Info / Edit */}
          {!isEditing ? (
            <div className="w-full space-y-3">
              <div>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-tight">
                  {profile?.full_name || "User"}
                </h2>
                <p className="text-yellow-400 font-mono text-sm mt-0.5">@{profile?.username}</p>
                {profile?.agency_id && (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
                    <Building2 size={9} className="text-violet-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-violet-400">Agency Creator</span>
                  </div>
                )}
              </div>
              {profile?.bio && (
                <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
                  {profile.bio}
                </p>
              )}
              <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 transition-all active:scale-95"
                >
                  <Edit3 size={15} /> Edit Profile
                </button>
                
                <button
                  onClick={handleShareProfile}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 transition-all active:scale-95"
                >
                  <Share2 size={15} /> Share Profile
                </button>

                <Link href="/app/wallet">
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-black rounded-full text-sm font-black shadow-lg shadow-yellow-400/20 hover:scale-105 transition-transform cursor-pointer">
                    <Wallet size={15} />
                    {formatNum(balance)} coins
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4 bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
              {[
                { key: "full_name", label: "Full Name", type: "input" },
                { key: "username",  label: "Username",  type: "input" },
                { key: "bio",       label: "Bio",       type: "textarea" },
              ].map(({ key, label, type }) => (
                <div key={key} className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">{label}</label>
                  {type === "textarea" ? (
                    <textarea
                      className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm focus:border-yellow-400 outline-none transition-all h-24 resize-none text-white"
                      value={(editData as any)[key]}
                      onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                    />
                  ) : (
                    <input
                      className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm focus:border-yellow-400 outline-none transition-all text-white"
                      value={(editData as any)[key]}
                      onChange={(e) => {
                        setEditData({ ...editData, [key]: e.target.value });
                        if (key === "username") setUsernameError("");
                      }}
                    />
                  )}
                  {key === "username" && usernameError && (
                    <p className="text-[10px] text-red-400 font-bold ml-1 flex items-center gap-1">
                      <AlertTriangle size={10} /> {usernameError}
                    </p>
                  )}
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                  className="flex-1 bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save
                </button>
                <button
                  onClick={() => { setIsEditing(false); setUsernameError(""); }}
                  className="px-6 py-4 bg-zinc-800 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-700 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── STATS ROW ── */}
        <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
          <StatItem label="Posts"     value={posts.length} />
          <StatItem label="Followers" value={followerCount} border />
          <StatItem label="Following" value={followingCount} border />
          <StatItem label="Likes"     value={totalLikes} border />
          <StatItem label="Views"     value={totalViews} border />
        </div>

        {/* ── POSTS GRID ── */}
        {posts.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-zinc-700">
            <Grid3x3 size={36} strokeWidth={1} />
            <span className="text-[10px] font-black uppercase tracking-widest">No posts yet</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {posts.map((post) => (
              <VideoPreview
                key={post.id}
                src={post.video_url || post.media_url}
                thumbnail={post.thumbnail_url}
                views={formatNum(post.views_count || 0)}
                likesCount={formatNum(getCount(post.likes))}
                commentsCount={formatNum(getCount(post.comments))}
                onClick={() => openPost(post)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── POST MODAL ── */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-200">

          {/* Video */}
          <div className="relative flex-1 bg-black flex items-center justify-center h-[55vh] md:h-full">
            <video
              src={selectedPost.video_url || selectedPost.media_url}
              className="h-full w-full object-contain"
              autoPlay loop playsInline controls
            />

            {/* Close */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-5 left-5 p-3 bg-black/50 backdrop-blur-xl rounded-full text-white z-10 hover:bg-white/10 transition-all active:scale-90"
            >
              <X size={20} />
            </button>

            {/* Delete post button */}
            <button
              onClick={() => setDeleteConfirmId(selectedPost.id)}
              className="absolute top-5 right-5 p-3 bg-red-600/80 backdrop-blur-xl rounded-full text-white z-10 hover:bg-red-600 transition-all active:scale-90"
              title="Șterge post"
            >
              <Trash2 size={18} />
            </button>

            {/* Stats overlay */}
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
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

          {/* Comments */}
          <div className="w-full md:w-[380px] bg-[#080808] border-t md:border-t-0 md:border-l border-white/5 flex flex-col h-[45vh] md:h-full">

            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 bg-zinc-900/30 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-zinc-800 border border-white/5 flex items-center justify-center text-[10px] font-black text-zinc-500 uppercase">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                    : profile?.username?.[0]
                  }
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-tight italic text-yellow-400">
                    @{profile?.username}
                  </p>
                  {selectedPost.caption && (
                    <p className="text-[10px] text-zinc-500 line-clamp-1">{selectedPost.caption}</p>
                  )}
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">
                {getCount(selectedPost.comments)} replies
              </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {postComments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-2">
                  <MessageCircle size={28} strokeWidth={1} />
                  <span className="text-[9px] font-black uppercase tracking-widest">No comments yet</span>
                </div>
              ) : (
                postComments.map((comm) => (
                  <CommentItem
                    key={comm.id}
                    comm={comm}
                    isOwner={true}
                    onDelete={() => handleDeleteComment(comm.id)}
                  />
                ))
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-zinc-900/10 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4">
              <div className="relative">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                  placeholder="Add a comment..."
                  className="w-full bg-white/5 border border-white/10 rounded-[18px] py-3.5 pl-5 pr-14 text-sm font-medium outline-none focus:border-yellow-400/60 transition-all placeholder:text-zinc-700"
                />
                <button
                  onClick={handleAddComment}
                  disabled={sendingComment || !newComment.trim()}
                  className="absolute right-2 top-2 p-2.5 bg-yellow-400 text-black rounded-xl active:scale-90 transition-all disabled:opacity-30 shadow-lg"
                >
                  {sendingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE POST CONFIRM ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={26} className="text-red-500" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight italic mb-2">Delete the post?</h3>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3.5 rounded-2xl border border-zinc-800 hover:bg-zinc-900 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}