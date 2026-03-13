"use client";

import { useEffect, useState, useRef, memo, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Zap, Heart, MessageCircle, X, Loader2, Play, UserPlus, UserCheck, Eye, Send } from "lucide-react";
import Link from "next/link";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- COMPONENTA PREVIEW VIDEO (PĂSTRATĂ INTEGRAL + STATS) ---
const VideoPreview = memo(({ src, views, likesCount, commentsCount }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const forcePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      video.muted = true;
      video.setAttribute('playsinline', '');
      const playPromise = video.play();
      if (playPromise !== undefined) await playPromise;
    } catch (err) {}
  };

  const stopVideo = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <div 
      className="relative w-full h-full group cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 shadow-2xl" 
      onMouseEnter={forcePlay} 
      onMouseLeave={stopVideo}
      onTouchStart={forcePlay}
    >
      <video 
        ref={videoRef} 
        src={src} 
        muted loop playsInline preload="metadata"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none" 
      />
      
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors pointer-events-none" />

      {/* STATS OVERLAY - RESPONSIVE */}
      <div className="absolute bottom-3 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Heart size={10} className="text-white fill-white" />
            <span className="text-[9px] font-black font-mono text-white leading-none">{likesCount}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <MessageCircle size={10} className="text-white fill-white" />
            <span className="text-[9px] font-black font-mono text-white leading-none">{commentsCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10">
          <Eye size={10} className="text-yellow-400" />
          <span className="text-[9px] font-black font-mono text-white leading-none">{views}</span>
        </div>
      </div>
    </div>
  );
});

VideoPreview.displayName = "VideoPreview";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // --- STATS PENTRU PLAYER/COMENTARII/REPLY ---
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const fetchProfilePosts = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("posts")
      .select(`*, likes:likes(count), comments:comments(count), views_count`) 
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setPosts(data);
  }, []);

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

      if (profileData) {
        if (user && user.id === profileData.id) {
          router.replace("/app/profile");
          return;
        }
        setProfile(profileData);
        await fetchProfilePosts(profileData.id);
        if (user) {
          const { data: fData } = await supabase
            .from("follows")
            .select("*")
            .eq("follower_id", user.id)
            .eq("following_id", profileData.id)
            .maybeSingle();
          setIsFollowing(!!fData);
        }
      }
      setLoading(false);
    }
    fetchPublicData();
  }, [username, router, fetchProfilePosts]);

  const handleFollow = async () => {
    if (!currentUser) return router.push("/app/login");
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", currentUser.id).eq("following_id", profile.id);
      setIsFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: currentUser.id, following_id: profile.id });
      setIsFollowing(true);
    }
  };

  const openPost = async (post: any) => {
    setSelectedPost(post);
    await supabase.rpc('increment_post_views', { post_id: post.id });
    const { data } = await supabase
        .from("comments")
        .select(`*, profiles(username, avatar_url)`)
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });
    if (data) setPostComments(data);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost || !currentUser) return;
    setSendingComment(true);
    const { data, error } = await supabase
        .from("comments")
        .insert([{ post_id: selectedPost.id, user_id: currentUser.id, content: newComment }])
        .select(`*, profiles(username, avatar_url)`)
        .single();
    
    if (!error && data) {
      setPostComments(prev => [...prev, data]);
      setNewComment("");
      fetchProfilePosts(profile.id); // Update grid stats instant
    }
    setSendingComment(false);
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 font-mono italic">SMILE SYNCING</span>
    </div>
  );

  if (!profile) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-6">
      <X size={40} className="text-zinc-700 mb-6" />
      <h1 className="text-xl font-black uppercase tracking-[0.3em] italic">User Protocol 404</h1>
      <button onClick={() => router.push('/app')} className="mt-10 px-10 py-4 bg-white text-black font-black uppercase text-[10px] rounded-full">Back to Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      {/* NAVBAR */}
      <div className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5 px-6 py-5 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 bg-white/5 rounded-2xl active:scale-75 transition-all"><ChevronLeft size={24} /></button>
        <span className="font-black text-[10px] tracking-[0.5em] uppercase text-zinc-500 italic">User Protocol</span>
        <div className="w-10" />
      </div>

      <div className="pt-32 max-w-4xl mx-auto px-4">
        {/* PROFILE HEADER */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="relative mb-6">
            <div className={`w-32 h-32 md:w-44 md:h-44 rounded-full p-1 shadow-2xl ${profile.is_live ? 'bg-gradient-to-tr from-yellow-400 to-red-600 animate-pulse' : 'bg-white/5'}`}>
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-black">
                <img src={profile?.avatar_url || `https://api.dicebear.com{username}`} className="w-full h-full object-cover" />
              </div>
            </div>
            {profile.is_live && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 px-3 py-1 rounded-full text-[8px] font-black italic">LIVE</div>}
          </div>

          <h1 className="text-4xl font-black uppercase tracking-tighter italic">@{profile.username}</h1>
          <p className="text-zinc-500 font-bold text-[11px] tracking-widest mt-1 uppercase italic">{profile.full_name || 'Smile Member'}</p>
          
          <div className="mt-8 px-8 py-5 bg-white/[0.03] border border-white/5 rounded-[32px] max-w-md w-full">
             <p className="text-zinc-300 text-sm font-medium italic">"{profile.bio || "Protocol SMILE active."}"</p>
          </div>

          <div className="mt-8 flex gap-4 w-full max-w-xs">
             <button 
                onClick={handleFollow}
                className={`flex-1 py-4 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isFollowing ? "bg-zinc-900 border border-white/10 text-white" : "bg-white text-black shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
                }`}
             >
               {isFollowing ? <><UserCheck size={14}/> Following</> : <><UserPlus size={14}/> Follow</>}
             </button>
             <button className="px-6 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl text-yellow-400 active:rotate-12 transition-all">
               <Zap size={20} fill="currentColor"/>
             </button>
          </div>
        </div>

        {/* GRID PUBLICATIONS */}
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {posts.map((post) => (
            <div key={post.id} className="relative aspect-[9/16]" onClick={() => openPost(post)}>
              <VideoPreview 
                src={post.video_url} 
                views={post.views_count || 0}
                likesCount={post.likes?.count || 0}
                commentsCount={post.comments?.count || 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- RESPONSIVE MODAL PLAYER + REPLY SYSTEM --- */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-300">
          {/* VIDEO AREA */}
          <div className="relative flex-1 bg-black flex items-center justify-center h-[50vh] md:h-full">
             <video src={selectedPost.video_url} className="h-full w-full object-contain" autoPlay loop playsInline controls />
             <button onClick={() => setSelectedPost(null)} className="absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-xl rounded-full text-white z-[110] hover:bg-white/10 transition-all shadow-2xl">
               <X size={24} />
             </button>
          </div>
          
          {/* COMMENTS & REPLY AREA */}
          <div className="w-full md:w-[400px] bg-[#050505] border-l border-white/5 flex flex-col h-[50vh] md:h-full">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/20">
               <div className="flex items-center gap-3">
                  <Heart size={20} className="text-red-500 fill-red-500" />
                  <span className="font-black font-mono text-sm">{selectedPost.likes?.count || 0}</span>
               </div>
               <div className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] italic">Post Protocol</div>
            </div>

            {/* LISTA COMENTARII */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
               {postComments.length > 0 ? postComments.map((comm) => (
                 <div key={comm.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden bg-zinc-800 shrink-0 border border-white/5">
                      {comm.profiles?.avatar_url && <img src={comm.profiles.avatar_url} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-yellow-400 mb-1 uppercase tracking-tighter italic">@{comm.profiles?.username}</p>
                      <p className="text-sm font-medium leading-snug text-zinc-200">{comm.content}</p>
                    </div>
                 </div>
               )) : (
                 <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2 opacity-50">
                    <MessageCircle size={32} strokeWidth={1} />
                    <span className="text-[10px] font-black uppercase tracking-widest">No signals yet</span>
                 </div>
               )}
            </div>

            {/* INPUT REPLY */}
            <div className="p-6 border-t border-white/5 bg-zinc-900/10 mb-[env(safe-area-inset-bottom)] md:mb-0">
               <div className="relative">
                  <input 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    placeholder="Type protocol message..." 
                    className="w-full bg-white/5 border border-white/10 rounded-[20px] py-4 pl-5 pr-14 font-bold outline-none focus:border-yellow-400 transition-all text-sm" 
                  />
                  <button 
                    onClick={handleAddComment} 
                    disabled={sendingComment || !newComment.trim()} 
                    className="absolute right-2 top-2 p-2 bg-yellow-400 text-black rounded-2xl active:scale-90 transition-transform disabled:opacity-30 shadow-lg"
                  >
                    {sendingComment ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
