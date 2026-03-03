"use client";

import { useEffect, useState, useRef, memo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { 
  Camera, LogOut, ChevronLeft, Loader2, X, Play, 
  Trash2, MessageCircle, Heart, AlertTriangle, Share2, Edit3, Send, Reply as ReplyIcon, Wallet, Users 
} from "lucide-react";
import Link from "next/link";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- COMPONENTA PREVIEW VIDEO (REPARATĂ SĂ MEARGĂ PLAY) ---
const VideoPreview = memo(({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = async () => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      try {
        await videoRef.current.play();
      } catch (err) {
        console.log("Autoplay blocked");
      }
    }
  };

  const handleStop = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div 
      className="relative w-full h-full group"
      onMouseEnter={handlePlay}
      onMouseLeave={handleStop}
      onTouchStart={handlePlay}
    >
      <video 
        ref={videoRef}
        src={src} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        muted 
        loop 
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
    </div>
  );
});

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [editData, setEditData] = useState({ full_name: "", bio: "", username: "" });
  
  // STATS FOLLOWERS
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/app/login"); return; }
      
      const [pRes, wRes, followers, following] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", session.user.id).single(),
        supabase.from("wallets").select("coins_balance").eq("id", session.user.id).maybeSingle(),
        supabase.from("follows").select("*", { count: 'exact', head: true }).eq("following_id", session.user.id),
        supabase.from("follows").select("*", { count: 'exact', head: true }).eq("follower_id", session.user.id)
      ]);

      const { data: postsData } = await supabase
        .from("posts")
        .select(`*, profiles(*), likes(count), comments(count)`)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (pRes.data) {
        setProfile(pRes.data);
        setEditData({ 
          full_name: pRes.data.full_name || "", 
          bio: pRes.data.bio || "", 
          username: pRes.data.username || "" 
        });
      }
      setFollowerCount(followers.count || 0);
      setFollowingCount(following.count || 0);
      if (wRes.data) setBalance(wRes.data.coins_balance);
      if (postsData) setPosts(postsData);
      setLoading(false);
    };
    init();
  }, [router]);

  const openPost = async (post: any) => {
    setSelectedPost(post);
    const { data } = await supabase
      .from("comments")
      .select(`*, profiles(username, avatar_url)`)
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    if (data) setPostComments(data);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost || !profile) return;
    setSendingComment(true);
    const { data, error } = await supabase.from("comments").insert([{
      post_id: selectedPost.id,
      user_id: profile.id,
      content: newComment,
      parent_id: replyTo ? replyTo.id : null
    }]).select(`*, profiles(username, avatar_url)`).single();

    if (!error && data) {
      setPostComments([...postComments, data]);
      setNewComment("");
      setReplyTo(null);
      setPosts(posts.map(p => p.id === selectedPost.id ? { ...p, comments: [{ count: (p.comments?.[0]?.count || 0) + 1 }] } : p));
    }
    setSendingComment(false);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const cleanUsername = editData.username.toLowerCase().trim().replace(/\s/g, "");
    const { error } = await supabase.from("profiles").update({
      full_name: editData.full_name,
      bio: editData.bio,
      username: cleanUsername
    }).eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, ...editData, username: cleanUsername });
      setIsEditing(false);
    } else {
      alert("Username invalid sau deja luat!");
    }
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    const { error } = await supabase.from("posts").delete().eq("id", postToDelete);
    if (!error) {
      setPosts(posts.filter(p => p.id !== postToDelete));
      setPostToDelete(null);
      setSelectedPost(null);
    }
    setIsDeleting(false);
  };

  if (loading && !profile) return (
    <div className="h-screen bg-black flex items-center justify-center text-yellow-400 font-black animate-pulse uppercase tracking-[0.2em]">Smile Syncing...</div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 font-sans">
      
      {/* NAV */}
      <nav className="fixed top-0 w-full z-[70] bg-black/40 backdrop-blur-2xl border-b border-white/5 px-6 py-5 flex justify-between items-center italic">
        <Link href="/app" className="p-2 bg-white/5 rounded-2xl hover:bg-white/10 transition"><ChevronLeft size={24} /></Link>
        <div className="flex items-center gap-2 bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
          <Wallet size={14} className="text-yellow-400" />
          <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">{balance} Coins</span>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => router.push("/app/login"))} className="p-2 text-zinc-500 hover:text-red-500 transition-all active:scale-75"><LogOut size={22} /></button>
      </nav>

      <div className="pt-32 px-6 flex flex-col items-center max-w-4xl mx-auto">
        {/* HEADER PROFIL */}
        <div className="relative group mb-8">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-600 shadow-[0_0_40px_rgba(234,179,8,0.15)]">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-black bg-zinc-900">
              <img src={profile?.avatar_url || `https://api.dicebear.com{profile?.username}`} className="w-full h-full object-cover" />
            </div>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 bg-yellow-400 p-3 rounded-full border-4 border-black text-black hover:scale-110 active:rotate-12 transition shadow-xl"><Camera size={18} strokeWidth={3} /></button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
        </div>

        {!isEditing ? (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">@{profile?.username}</h1>
            <p className="text-white font-bold mt-1 uppercase text-[10px] tracking-[0.3em] opacity-40">{profile?.full_name}</p>
            
            {/* STATS BAR: FOLLOWERS / FOLLOWING */}
            <div className="flex gap-8 mt-6 bg-white/5 px-8 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
              <div className="flex flex-col items-center">
                <span className="text-xl font-black italic">{posts.length}</span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Posts</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-xl font-black italic">{followerCount}</span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Followers</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-xl font-black italic">{followingCount}</span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Following</span>
              </div>
            </div>

            <p className="text-zinc-500 text-sm mt-6 font-medium max-w-sm italic leading-relaxed">"{profile?.bio || "Smile Live Protocol Active."}"</p>
            
            <button onClick={() => setIsEditing(true)} className="mt-8 flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">
              <Edit3 size={12} /> Edit Profile
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md bg-zinc-900/50 p-8 rounded-[32px] border border-white/10 animate-in zoom-in-95 backdrop-blur-3xl shadow-2xl">
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-4 mb-2 block">Username</label>
                <input value={editData.username} onChange={e => setEditData({...editData, username: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm outline-none focus:border-yellow-400 transition-all italic font-bold" />
              </div>
              <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-4 mb-2 block">Full Name</label>
                <input value={editData.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm outline-none focus:border-yellow-400 transition-all font-medium" />
              </div>
              <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-4 mb-2 block">Bio</label>
                <textarea value={editData.bio} onChange={e => setEditData({...editData, bio: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm h-28 outline-none resize-none focus:border-yellow-400 transition-all italic" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleUpdateProfile} className="flex-1 bg-yellow-400 text-black font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-lg shadow-yellow-400/20">Save Changes</button>
                <button onClick={() => setIsEditing(false)} className="px-8 bg-white/5 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GRID POSTĂRI (LOOP PREVIEW ENGINE) */}
      <div className="mt-16 px-1 grid grid-cols-3 gap-1 md:gap-4 md:px-8 max-w-6xl mx-auto animate-in fade-in duration-700">
        {posts.map((post) => (
          <div key={post.id} onClick={() => openPost(post)} className="group relative aspect-[9/16] bg-zinc-900 rounded-lg md:rounded-2xl overflow-hidden cursor-pointer border border-white/5 shadow-2xl transition-all active:scale-95">
            <VideoPreview src={post.video_url} />
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Heart size={12} className="text-white fill-white" />
              <span className="text-[10px] font-black text-white">{post.likes?.count || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL VIZUALIZARE (REPLY & COMMENTS SYSTEM) */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-[100px] p-4 md:p-10 animate-in fade-in duration-300">
          <button onClick={() => setSelectedPost(null)} className="absolute top-6 right-6 p-4 text-white/20 hover:text-white transition-all active:scale-90"><X size={32} /></button>
          <div className="relative flex flex-col md:flex-row w-full max-w-5xl h-[85vh] bg-zinc-950 rounded-[40px] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <div className="relative flex-1 bg-black flex items-center justify-center border-r border-white/5">
              <video src={selectedPost.video_url} controls autoPlay loop className="h-full w-auto max-w-full object-contain" />
            </div>
            <div className="w-full md:w-[400px] flex flex-col bg-zinc-900/30">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={profile.avatar_url} className="w-12 h-12 rounded-full border-2 border-yellow-500/20 object-cover" />
                  <span className="font-black text-sm italic uppercase tracking-tighter">@{profile.username}</span>
                </div>
                <button onClick={() => setPostToDelete(selectedPost.id)} className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"><Trash2 size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                <p className="text-sm text-white/60 italic pb-6 border-b border-white/5 leading-relaxed">"{selectedPost.caption}"</p>
                {postComments.map((comment) => (
                  <div key={comment.id} className={`flex gap-4 animate-in slide-in-from-left-2 ${comment.parent_id ? 'ml-10 scale-95' : ''}`}>
                    <img src={comment.profiles.avatar_url} className="w-9 h-9 rounded-full object-cover ring-2 ring-white/5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-black italic text-zinc-300">@{comment.profiles.username}</p>
                        <span className="text-[9px] text-zinc-600 font-bold">2h</span>
                      </div>
                      <p className="text-xs text-white/80 mt-1 leading-snug">{comment.content}</p>
                      <button onClick={() => {setReplyTo(comment); document.getElementById('commentInput')?.focus();}} className="text-[9px] text-zinc-500 font-black mt-2 hover:text-yellow-400 flex items-center gap-2 transition-colors uppercase tracking-widest"><ReplyIcon size={10} /> Reply</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-black/40 border-t border-white/5 backdrop-blur-2xl">
                {replyTo && <div className="flex items-center justify-between mb-3 px-4 py-2 bg-yellow-400/5 border border-yellow-400/10 rounded-xl animate-in slide-in-from-bottom-2"><span className="text-[9px] text-yellow-400 font-black uppercase tracking-widest">Replying to @{replyTo.profiles.username}</span><button onClick={() => setReplyTo(null)} className="text-yellow-400"><X size={12}/></button></div>}
                <div className="relative">
                  <input id="commentInput" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Say something viral..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-xs outline-none focus:border-white/20 transition-all font-medium" />
                  <button onClick={handleAddComment} disabled={sendingComment} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-yellow-400 hover:scale-110 transition-all disabled:opacity-50">{sendingComment ? <Loader2 size={18} className="animate-spin" /> : <Send size={20} />}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RECONFIRMARE ȘTERGERE */}
      {postToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in zoom-in-95">
          <div className="bg-zinc-900 border border-white/10 p-10 rounded-[40px] max-w-sm w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.1)]">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 ring-4 ring-red-500/5 animate-pulse"><AlertTriangle size={40} /></div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Delete Post?</h3>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Protocol SMILE: This action is permanent.</p>
            <div className="mt-10 space-y-4">
              <button onClick={confirmDelete} disabled={isDeleting} className="w-full bg-red-600 hover:bg-red-700 py-5 rounded-[22px] font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 shadow-xl shadow-red-600/20">
                {isDeleting ? <Loader2 className="animate-spin mx-auto" /> : "Delete Definitively"}
              </button>
              <button onClick={() => setPostToDelete(null)} className="w-full bg-white/5 hover:bg-white/10 py-5 rounded-[22px] font-black text-[10px] uppercase tracking-[0.3em] transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
