/**
 * SMILE LIVE - PROFILE MANAGEMENT (YELLOW EDITION)
 * FULL INTEGRAL - FIX STATS (LIKES/COMMENTS/VIEWS)
 */

"use client";

import { useEffect, useState, useRef, memo, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { 
  Camera, LogOut, ChevronLeft, Loader2, X, Play, 
  Trash2, MessageCircle, Heart, AlertTriangle, Share2, Edit3, Send, Wallet, Eye 
} from "lucide-react";
import Link from "next/link";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- VIDEO PREVIEW CU STATS FIXATE ---
const VideoPreview = memo(({ src, views, likesCount, commentsCount }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = async () => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      try { await videoRef.current.play(); } catch (err) {}
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
      className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-zinc-900 group border border-white/5 shadow-2xl cursor-pointer"
      onMouseEnter={handlePlay}
      onMouseLeave={handleStop}
      onTouchStart={handlePlay}
    >
      <video 
        ref={videoRef}
        src={src} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        muted loop playsInline preload="metadata"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
      
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Heart size={12} className="text-white fill-white" />
            <span className="text-[10px] font-black font-mono text-white leading-none">
              {likesCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={12} className="text-white fill-white" />
            <span className="text-[10px] font-black font-mono text-white leading-none">
              {commentsCount}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
          <Eye size={10} className="text-yellow-400" />
          <span className="text-[10px] font-black font-mono text-white leading-none">
            {views}
          </span>
        </div>
      </div>
    </div>
  );
});

VideoPreview.displayName = "VideoPreview";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [editData, setEditData] = useState({ full_name: "", bio: "", username: "" });
  
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const init = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/app/login"); return; }
    
    const [pRes, wRes, followers, following] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", session.user.id).single(),
      supabase.from("wallets").select("coins_balance").eq("user_id", session.user.id).maybeSingle(),
      supabase.from("follows").select("*", { count: 'exact', head: true }).eq("following_id", session.user.id),
      supabase.from("follows").select("*", { count: 'exact', head: true }).eq("follower_id", session.user.id)
    ]);

    const { data: postsData } = await supabase
      .from("posts")
      .select(`*, likes(count), comments(count)`)
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
  }, [router]);

  useEffect(() => { init(); }, [init]);

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setIsUploading(false); 
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const cleanUsername = editData.username.toLowerCase().trim().replace(/\s/g, "");
    const { error } = await supabase.from("profiles").update({
      full_name: editData.full_name, bio: editData.bio, username: cleanUsername
    }).eq("id", profile.id);
    if (!error) { setProfile({ ...profile, ...editData, username: cleanUsername }); setIsEditing(false); }
    setLoading(false);
  };

  const openPost = async (post: any) => {
    setSelectedPost(post);
    const { data } = await supabase.from("comments").select(`*, profiles(username, avatar_url)`).eq("post_id", post.id).order("created_at", { ascending: true });
    if (data) setPostComments(data);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost || !profile) return;
    setSendingComment(true);
    const { data, error } = await supabase.from("comments").insert([{
      post_id: selectedPost.id, user_id: profile.id, content: newComment
    }]).select(`*, profiles(username, avatar_url)`).single();
    if (!error && data) { setPostComments(prev => [...prev, data]); setNewComment(""); init(); }
    setSendingComment(false);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    const { error } = await supabase.from("posts").delete().eq("id", postToDelete);
    if (!error) { setPosts(posts.filter(p => p.id !== postToDelete)); setPostToDelete(null); setSelectedPost(null); }
    setIsDeleting(false);
  };

  if (loading && !profile) return (
    <div className="h-screen bg-black flex items-center justify-center text-yellow-400 font-black animate-pulse uppercase tracking-tighter italic">Smile Syncing...</div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 font-sans selection:bg-yellow-400">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-xl z-50 border-b border-white/5">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-all"><ChevronLeft size={24} /></button>
        <h1 className="font-black italic text-xl tracking-tighter text-yellow-400 uppercase">Profile</h1>
        <button onClick={() => supabase.auth.signOut().then(() => router.push("/"))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-all">
          <LogOut size={22} />
        </button>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="flex flex-col items-center gap-6 mb-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><Camera size={40} className="text-zinc-600" /></div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 p-3 bg-yellow-400 text-black rounded-full shadow-2xl hover:scale-110 transition-transform disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleUploadAvatar} className="hidden" accept="image/*" />
          </div>

          {!isEditing ? (
            <div className="text-center w-full">
              <h2 className="text-3xl font-black italic tracking-tighter uppercase">{profile?.full_name || "User"}</h2>
              <p className="text-yellow-400 font-mono text-sm mb-4">@{profile?.username}</p>
              <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-6 leading-relaxed">{profile?.bio || "No bio yet."}</p>
              
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all">
                  <Edit3 size={16} /> Edit Profile
                </button>
                <div className="flex items-center gap-2 px-6 py-2 bg-yellow-400 text-black rounded-full font-bold">
                  <Wallet size={16} /> {balance}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4 bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 backdrop-blur-sm">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Full Name</label>
                <input 
                  className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm focus:border-yellow-400 outline-none transition-all"
                  value={editData.full_name}
                  onChange={e => setEditData({...editData, full_name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Username</label>
                <input 
                  className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm focus:border-yellow-400 outline-none transition-all"
                  value={editData.username}
                  onChange={e => setEditData({...editData, username: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Bio</label>
                <textarea 
                  className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm focus:border-yellow-400 outline-none transition-all h-28 resize-none"
                  value={editData.bio}
                  onChange={e => setEditData({...editData, bio: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleUpdateProfile} className="flex-1 bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110">Save</button>
                <button onClick={() => setIsEditing(false)} className="px-8 py-4 bg-zinc-800 rounded-2xl font-black uppercase text-xs tracking-widest">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {posts.map((post) => (
            <div key={post.id} onClick={() => openPost(post)}>
              <VideoPreview 
                src={post.video_url} 
                views={post.views_count || 0}
                likesCount={post.likes?.[0]?.count || 0}
                commentsCount={post.comments?.[0]?.count || 0}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
