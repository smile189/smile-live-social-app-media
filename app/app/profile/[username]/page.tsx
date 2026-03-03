"use client";

import { useEffect, useState, useRef, memo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Zap, Heart, MessageCircle, X, Loader2, Play, UserPlus, UserCheck } from "lucide-react";
import Link from "next/link";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- COMPONENTA PREVIEW VIDEO (FIXED PLAYBACK PENTRU PROFIL) ---
const VideoPreview = memo(({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const forcePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.muted = true; // Browser-ul cere MUTED pentru auto-play
      video.setAttribute('playsinline', ''); // Pentru iOS
      video.setAttribute('muted', '');
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (err) {
      console.log("Playback interaction required or blocked:", err);
    }
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
      className="relative w-full h-full group cursor-pointer overflow-hidden" 
      onMouseEnter={forcePlay} 
      onMouseLeave={stopVideo}
      onClick={forcePlay} // Backup pentru click/tap
    >
      <video 
        ref={videoRef} 
        src={src} 
        muted 
        loop 
        playsInline 
        autoPlay={false}
        preload="metadata"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none" 
      />
      {/* Overlay vizual care dispare la hover */}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />
      
      {/* Iconiță Play discretă care apare doar dacă nu rulează */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-0 transition-opacity">
         <Play size={24} className="text-white/50" />
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

  useEffect(() => {
    async function fetchPublicData() {
      if (!username) return;
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        
        // Fetch Postări cu relații pentru likes/comments count
        const { data: postsData } = await supabase
          .from("posts")
          .select(`*, likes:likes(count), comments:comments(count)`) 
          .eq("user_id", profileData.id)
          .order("created_at", { ascending: false });

        if (postsData) setPosts(postsData);

        if (session?.user) {
          const { data: followData } = await supabase
            .from("follows")
            .select("*")
            .eq("follower_id", session.user.id)
            .eq("following_id", profileData.id)
            .maybeSingle();
          setIsFollowing(!!followData);
        }
      }
      setLoading(false);
    }
    fetchPublicData();
  }, [username]);

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

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400">SMILE SYNC</span>
    </div>
  );

  if (!profile) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-6">
      <X size={40} className="text-zinc-700 mb-6" />
      <h1 className="text-xl font-black uppercase tracking-[0.3em]">User Not Found</h1>
      <button onClick={() => router.push('/')} className="mt-10 px-10 py-4 bg-white text-black font-black uppercase text-[10px] rounded-full">Home</button>
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
             <p className="text-zinc-300 text-sm font-medium italic italic">"{profile.bio || "Protocol SMILE active."}"</p>
          </div>

          <div className="mt-8 flex gap-4 w-full max-w-xs">
             <button 
                onClick={handleFollow}
                className={`flex-1 py-4 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isFollowing ? "bg-zinc-900 border border-white/10 text-white" : "bg-white text-black"
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
            <div 
                key={post.id} 
                className="group relative aspect-[9/16] bg-zinc-900 rounded-lg md:rounded-[2.5rem] overflow-hidden border border-white/5 active:scale-[0.98] transition-all"
            >
              <VideoPreview src={post.video_url} />
              
              {/* Stats Overlay - Se vede mereu pe mobile, la hover pe desktop */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 pointer-events-none">
                 <div className="flex items-center gap-4 text-[10px] font-black text-white italic drop-shadow-md">
                   <div className="flex items-center gap-1">
                    <Heart size={14} className="text-red-500 fill-red-500" /> 
                    {post.likes?.[0]?.count || 0}
                   </div>
                   <div className="flex items-center gap-1">
                    <MessageCircle size={14} /> 
                    {post.comments?.[0]?.count || 0}
                   </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
        
        {posts.length === 0 && (
          <div className="py-20 text-center opacity-20 italic">
             <span className="text-[10px] font-black uppercase tracking-[0.5em]">Sector empty... No viral signal detected</span>
          </div>
        )}
      </div>
    </div>
  );
}
