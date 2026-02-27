/**
 * app/profile/[username]/page.tsx
 * Public Profile View - SMILE LIVE Protocol
 */

"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Zap, Heart, MessageCircle, X, Loader2 } from "lucide-react";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchPublicData() {
      if (!username) return;
      setLoading(true);
      
      try {
        // 1. Fetch Profil după username
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profileData) {
          setProfile(profileData);
          
          // 2. Fetch Postări (Asigură-te că tabela 'posts' are coloana 'user_id')
          const { data: postsData, error: postsError } = await supabase
            .from("posts")
            .select("*") 
            .eq("user_id", profileData.id)
            .order("created_at", { ascending: false });

          if (!postsError && postsData) {
            setPosts(postsData);
          }
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicData();
  }, [username]);

  // LOADING STATE
  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-1 bg-yellow-400/20 rounded-full overflow-hidden">
        <div className="w-full h-full bg-yellow-400 animate-[progress_1s_infinite_linear]" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-400 animate-pulse italic">
        Loading...
      </span>
      <style jsx>{`
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );

  // NOT FOUND STATE
  if (!profile) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-6">
      <div className="w-20 h-20 border border-white/5 bg-zinc-900/30 rounded-full flex items-center justify-center mb-6">
        <X size={40} className="text-zinc-700" />
      </div>
      <h1 className="text-xl font-black uppercase tracking-[0.3em] mb-2">User Not Found</h1>
      <p className="text-zinc-500 text-[10px] uppercase mb-10 tracking-widest">Sector @{username} is empty</p>
      <button 
        onClick={() => router.push('/')} 
        className="px-10 py-4 bg-white text-black font-black uppercase text-[10px] rounded-full active:scale-95 transition"
      >
        Return to Feed
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      {/* NAV */}
      <div className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-5 flex items-center justify-between">
        <button onClick={() => router.back()} className="active:scale-75 transition-transform">
          <ChevronLeft size={28} />
        </button>
        <span className="font-black text-[10px] tracking-[0.5em] uppercase text-zinc-500 italic">User Profile</span>
        <div className="w-7" />
      </div>

      <div className="pt-32 max-w-4xl mx-auto px-4">
        {/* PROFILE CARD */}
        <div className="flex flex-col items-center mb-16">
          <div className="relative mb-8">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-[2px] border-yellow-400/30 p-1.5 bg-zinc-900/50">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-black">
                <img 
                  src={profile?.avatar_url || `https://api.dicebear.com{username}`} 
                  className="w-full h-full object-cover" 
                  alt="Avatar" 
                />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-1">@{profile.username}</h1>
          <p className="text-yellow-400 font-black text-[11px] tracking-[0.3em] uppercase">{profile.full_name || 'Smile Member'}</p>
          
          <div className="mt-8 px-6 py-4 bg-zinc-900/30 border border-white/5 rounded-3xl max-w-md w-full text-center">
             <p className="text-zinc-400 text-sm font-medium italic leading-relaxed">
               "{profile.bio || "Acest membru Smile Live nu a publicat încă un bio oficial."}"
             </p>
          </div>

          <div className="mt-8 flex gap-4 w-full max-w-xs px-4">
             <button className="flex-1 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-yellow-400 transition-colors active:scale-95">
               Follow
             </button>
             <button className="px-6 bg-zinc-900 border border-white/10 rounded-2xl text-yellow-400 active:scale-90 transition-all">
               <Zap size={20}/>
             </button>
          </div>
        </div>

        {/* PUBLICATIONS GRID */}
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {posts.map((post) => (
            <div key={post.id} className="group relative aspect-square bg-zinc-900 rounded-sm md:rounded-[2rem] overflow-hidden border border-white/5">
              <img 
                src={post.image_url || post.thumbnail_url} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt="" 
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                 <div className="flex items-center gap-1 text-[10px] font-black">
                   <Heart size={14} className="fill-yellow-400 text-yellow-400" /> {post.likes_count || 0}
                 </div>
                 <div className="flex items-center gap-1 text-[10px] font-black">
                   <MessageCircle size={14} /> {post.comments_count || 0}
                 </div>
              </div>
            </div>
          ))}
        </div>
        
        {posts.length === 0 && (
          <div className="py-20 text-center opacity-20">
             <span className="text-[10px] font-black uppercase tracking-[0.5em]">No transmissions from this sector</span>
          </div>
        )}
      </div>
    </div>
  );
}
