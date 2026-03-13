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
      className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-zinc-900 group border border-white/5 shadow-2xl"
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
      
      {/* STATS OVERLAY PE PREVIEW - REPARAT */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Heart size={12} className="text-white fill-white" />
            <span className="text-[10px] font-black font-mono text-white leading-none">{likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={12} className="text-white fill-white" />
            <span className="text-[10px] font-black font-mono text-white leading-none">{commentsCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
          <Eye size={10} className="text-yellow-400" />
          <span className="text-[10px] font-black font-mono text-white leading-none">{views}</span>
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
      .select(`*, likes(count), comments(count), views_count`)
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
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      if (updateError) throw updateError;
      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
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
      alert("Error: " + error.message);
    }
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
      post_id: selectedPost.id,
      user_id: profile.id,
      content: newComment
    }]).select(`*, profiles(username, avatar_url)`).single();

    if (!error && data) {
      setPostComments(prev => [...prev, data]);
      setNewComment("");
      init(); // Refresh counts
    }
    setSendingComment(false);
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
    <div className="h-screen bg-black flex items-center justify-center text-yellow-400 font-black animate-pulse uppercase tracking-[0.2em] font-mono italic">
      Smile Syncing...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 font-sans selection:bg-yellow-400">
      
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-yellow-400/20 px-4 md:px-8 py-4 flex justify-between items-center italic">
        <Link href="/app" className="p-2 bg-white/5 rounded-2xl border border-white/5"><ChevronLeft size={24} /></Link>
        <div className="flex items-center gap-2 bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/30">
          <Wallet size={14} className="text-yellow-400" />
          <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">{balance?.toLocaleString() || 0} Coins</span>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => router.push("/app/login"))} className="p-2 bg-white/5 rounded-2xl border border-white/5"><LogOut size={22} /></button>
      </nav>

      <div className="pt-32 px-6 flex flex-col items-center max-w-5xl mx-auto">
        
        {/* AVATAR */}
        <div className="relative group mb-8">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-600 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-black bg-zinc-900 relative">
              {isUploading && <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center"><Loader2 className="animate-spin text-yellow-400" /></div>}
              <img src={profile?.avatar_url || `https://api.dicebear.com{profile?.username}`} className="w-full h-full object-cover" />
            </div>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 bg-yellow-400 p-3 rounded-full border-4 border-black text-black shadow-xl"><Camera size={18} /></button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadAvatar} />
        </div>

        {!isEditing ? (
          <div className="text-center w-full flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter mb-1 uppercase">{profile?.full_name}</h1>
            <p className="text-yellow-400 font-mono text-sm font-bold mb-6">@{profile?.username}</p>
            
            <div className="flex justify-center gap-12 mb-8 font-mono border-y border-white/5 py-4 w-full max-w-sm">
              <div className="text-center"><p className="text-xl font-black italic">{followerCount}</p><p className="text-[9px] uppercase text-zinc-500 font-black tracking-widest">Followers</p></div>
              <div className="text-center"><p className="text-xl font-black italic">{followingCount}</p><p className="text-[9px] uppercase text-zinc-500 font-black tracking-widest">Following</p></div>
            </div>

            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-10 leading-relaxed italic">{profile?.bio || "No bio yet."}</p>
            <button onClick={() => setIsEditing(true)} className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase italic text-[11px] tracking-widest hover:bg-yellow-400 transition-all active:scale-95 flex items-center gap-2"><Edit3 size={14} /> Edit Profile</button>
          </div>
        ) : (
          <div className="w-full max-w-md bg-white/5 p-8 rounded-[32px] border border-yellow-400/20 backdrop-blur-xl animate-in zoom-in-95 duration-300">
            <div className="space-y-6 text-left">
              <div><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block italic">Username</label>
              <input value={editData.username} onChange={(e) => setEditData({...editData, username: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-yellow-400 font-mono text-sm transition-all text-white" /></div>
              <div><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block italic">Full Name</label>
              <input value={editData.full_name} onChange={(e) => setEditData({...editData, full_name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-yellow-400 font-bold text-sm transition-all text-white" /></div>
              <div><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block italic">Bio (150 chars)</label>
              <textarea value={editData.bio} onChange={(e) => setEditData({...editData, bio: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-yellow-400 text-sm italic transition-all text-white h-24 resize-none" maxLength={150} /></div>
              <div className="flex gap-3 pt-4"><button onClick={() => setIsEditing(false)} className="flex-1 py-4 text-[11px] font-black uppercase italic tracking-widest text-zinc-500 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleUpdateProfile} className="flex-1 py-4 bg-yellow-400 text-black rounded-2xl text-[11px] font-black uppercase italic tracking-widest hover:bg-yellow-500 active:scale-95 transition-all font-black">Save Changes</button></div>
            </div>
          </div>
        )}

        {/* VAULT GRID - FIX STATS ACCESSED HERE */}
        <div className="w-full border-t border-white/5 mt-16 pt-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {posts.map((post) => (
              <div key={post.id} className="cursor-pointer" onClick={() => openPost(post)}>
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

      {/* POST DETAILS OVERLAY */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-0 md:p-6">
           <button onClick={() => setSelectedPost(null)} className="absolute top-8 right-8 z-[110] p-4 bg-white/10 hover:bg-red-500 text-white rounded-full transition-all border border-white/10"><X size={24} /></button>
           <div className="flex flex-col md:flex-row w-full h-full md:h-[85vh] md:max-w-6xl md:rounded-[40px] overflow-hidden bg-black md:border md:border-yellow-400/10">
              <div className="flex-1 bg-zinc-950 relative h-[50vh] md:h-auto border-b md:border-b-0 md:border-r border-white/5">
                <video src={selectedPost.video_url} className="w-full h-full object-contain" autoPlay loop muted playsInline controls />
              </div>
              <div className="w-full md:w-[400px] bg-zinc-900 flex flex-col h-[50vh] md:h-auto">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-yellow-400"><img src={profile.avatar_url} className="w-full h-full object-cover" /></div>
                      <p className="font-black italic tracking-tighter uppercase text-sm">@{profile.username}</p>
                   </div>
                   <button onClick={() => setPostToDelete(selectedPost.id)} className="text-zinc-600 hover:text-red-500 transition-colors p-2"><Trash2 size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                   <p className="text-sm text-zinc-300 italic leading-relaxed font-medium">{selectedPost.caption || "Official Smile Sequence."}</p>
                   <div className="space-y-5">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic flex items-center gap-2"><div className="w-1 h-1 bg-yellow-400 rounded-full" /> Audit Logs</h4>
                      {postComments.map((c, i) => (
                        <div key={i} className="flex gap-3"><img src={c.profiles.avatar_url} className="w-8 h-8 rounded-full object-cover border border-white/10" /><div className="bg-white/5 p-3 rounded-2xl rounded-tl-none flex-1 border border-white/5"><p className="text-[10px] font-black text-yellow-400 font-mono">@{c.profiles.username}</p><p className="text-[11px] text-zinc-300 italic">{c.content}</p></div></div>
                      ))}
                   </div>
                </div>
                <div className="p-5 bg-black/40 border-t border-white/5">
                   <div className="relative flex items-center gap-2">
                      <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Log message..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none focus:border-yellow-400 transition-all italic text-white" />
                      <button onClick={handleAddComment} disabled={sendingComment} className="p-2 text-yellow-400 hover:text-white transition-colors disabled:opacity-30">{sendingComment ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}</button>
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {postToDelete && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-yellow-400/20 p-10 rounded-[40px] max-w-xs w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div>
            <h4 className="text-xl font-black italic tracking-tighter mb-2 uppercase text-white">Permanent Burn</h4>
            <p className="text-zinc-500 text-[10px] italic mb-8 uppercase font-black">Erase this asset?</p>
            <div className="flex flex-col gap-2">
              <button onClick={confirmDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase italic text-[11px] tracking-widest hover:bg-red-600 active:scale-95 transition-all">{isDeleting ? "Burning..." : "Confirm Destruction"}</button>
              <button onClick={() => setPostToDelete(null)} className="w-full py-4 text-zinc-500 font-black uppercase italic text-[11px] tracking-widest hover:text-white">Abort</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
