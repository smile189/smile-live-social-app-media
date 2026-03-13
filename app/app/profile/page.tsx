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
      await supabase.storage.from('avatars').upload(filePath, file);
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err: any) { alert(err.message); } finally { setIsUploading(false); }
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
        <h1 className="font-black italic text-xl tracking-tighter text-yellow-400 uppercase">My Profile</h1>
        <button onClick={async () => { await supabase.auth.signOut(); router.push("/app/login"); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-all"><LogOut size={22} /></button>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-8">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative group mb-6">
            <div className="w-28 h-28 rounded-[32px] overflow-hidden border-4 border-yellow-400/20 p-1 group-hover:border-yellow-400 transition-all duration-500">
              {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover rounded-[24px]" /> : <div className="w-full h-full bg-zinc-800 flex items-center justify-center rounded-[24px]"><Camera size={32} className="text-zinc-500" /></div>}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-yellow-400 text-black p-2 rounded-2xl shadow-xl hover:scale-110 transition-transform"><Camera size={18} /></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadAvatar} />
          </div>
          <h2 className="text-2xl font-black mb-1 italic">@{profile.username}</h2>
          <p className="text-white/40 text-sm font-medium mb-4">{profile.full_name}</p>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl mb-8"><p className="text-sm italic font-medium">{profile.bio || "No bio yet..."}</p></div>
          
          <div className="flex gap-10 mb-10">
            <div className="text-center"><span className="block font-black text-xl text-yellow-400">{posts.length}</span><span className="text-[10px] uppercase font-black tracking-widest opacity-40">Posts</span></div>
            <div className="text-center"><span className="block font-black text-xl text-yellow-400">{followerCount}</span><span className="text-[10px] uppercase font-black tracking-widest opacity-40">Followers</span></div>
            <div className="text-center"><span className="block font-black text-xl text-yellow-400">{followingCount}</span><span className="text-[10px] uppercase font-black tracking-widest opacity-40">Following</span></div>
          </div>

          <div className="flex gap-3 w-full">
            <button onClick={() => setIsEditing(true)} className="flex-1 bg-white text-black font-black py-4 rounded-[22px] flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all">Edit Profile</button>
            <Link href="/wallet" className="px-6 bg-zinc-900 border border-white/10 rounded-[22px] flex items-center justify-center hover:bg-white/5 transition-all"><Wallet size={20} className="text-yellow-400" /></Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {posts.map((post) => (
            <div key={post.id} onClick={() => openPost(post)} className="cursor-pointer">
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

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8">
            <div className="flex justify-between items-center mb-8"><h3 className="font-black text-2xl text-yellow-400 uppercase">Settings</h3><button onClick={() => setIsEditing(false)}><X size={24}/></button></div>
            <div className="space-y-6">
              <input value={editData.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})} placeholder="Name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none" />
              <textarea value={editData.bio} onChange={e => setEditData({...editData, bio: e.target.value})} placeholder="Bio" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-24 outline-none" />
              <button onClick={handleUpdateProfile} className="w-full bg-yellow-400 text-black font-black py-5 rounded-[22px] shadow-2xl transition-transform active:scale-95">{loading ? <Loader2 className="animate-spin mx-auto" /> : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {selectedPost && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row">
          <div className="relative flex-1 bg-zinc-900 flex items-center justify-center overflow-hidden">
             <video src={selectedPost.video_url} className="h-full w-full object-contain" autoPlay loop playsInline controls />
             <button onClick={() => setSelectedPost(null)} className="absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-xl rounded-full z-10"><X size={24} /></button>
          </div>
          <div className="w-full md:w-[400px] bg-black border-l border-white/5 flex flex-col h-[50vh] md:h-full">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
               <div className="flex items-center gap-3"><Heart size={20} className="text-red-500 fill-red-500" /><span className="font-black font-mono">{selectedPost.likes?.[0]?.count || 0}</span></div>
               <button onClick={() => setPostToDelete(selectedPost.id)} className="p-3 text-white/40 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               {postComments.map((comm) => (
                 <div key={comm.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden bg-zinc-800">{comm.profiles?.avatar_url && <img src={comm.profiles.avatar_url} className="w-full h-full object-cover" />}</div>
                    <div className="flex-1"><p className="text-xs font-black text-yellow-400 mb-1">@{comm.profiles?.username}</p><p className="text-sm font-medium">{comm.content}</p></div>
                 </div>
               ))}
            </div>
            <div className="p-6 border-t border-white/5 bg-zinc-900/30">
               <div className="relative">
                  <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="w-full bg-white/5 border border-white/10 rounded-[20px] py-4 pl-5 pr-14 font-bold outline-none" />
                  <button onClick={handleAddComment} className="absolute right-2 top-2 p-2 bg-yellow-400 text-black rounded-2xl">{sendingComment ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {postToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
           <div className="w-full max-w-xs bg-[#0a0a0a] border border-red-500/20 rounded-[32px] p-8 text-center">
              <AlertTriangle size={32} className="mx-auto text-red-500 mb-6" />
              <h3 className="font-black text-xl mb-2 italic">Delete Post?</h3>
              <p className="text-white/40 text-sm mb-8">This action cannot be undone.</p>
              <div className="space-y-3">
                 <button onClick={confirmDelete} className="w-full bg-red-500 text-white font-black py-4 rounded-[22px] transition-all">{isDeleting ? <Loader2 className="animate-spin mx-auto" /> : "Delete Now"}</button>
                 <button onClick={() => setPostToDelete(null)} className="w-full text-white/40 font-bold py-2">Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
