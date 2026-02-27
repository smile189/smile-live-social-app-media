"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Camera, LogOut, Grid3X3, Bookmark, ChevronLeft, Loader2, Check, X, Play, MessageCircle, Heart, Send, Reply as ReplyIcon, Edit3 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  ));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ full_name: "", bio: "" });

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/app/login"); return; }
      await fetchProfileAndPosts(session.user.id);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.push("/app/login");
    });
    return () => subscription.unsubscribe();
  }, [router, supabase]);

  async function fetchProfileAndPosts(userId: string) {
    setLoading(true);
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userId).single();
    
    const { data: postsData } = await supabase
      .from("posts")
      .select(`*, likes(count), comments(count)`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (profileData) { 
      setProfile(profileData); 
      setEditData({ full_name: profileData.full_name || "", bio: profileData.bio || "" }); 
    }
    if (postsData) setPosts(postsData);
    setLoading(false);
  }

  const handleUpdateInfo = async () => {
    if (!profile?.id) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: editData.full_name, bio: editData.bio })
      .eq("id", profile.id);
    
    if (!error) { 
      setProfile({ ...profile, ...editData }); 
      setIsEditing(false); 
    }
    setLoading(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!profile?.id) return;
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;
      const filePath = `${profile.id}/${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err) { console.error(err); } finally { setUploading(false); }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/app/login");
  };

  if (loading && !profile) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-yellow-400 font-black text-4xl animate-bounce tracking-tighter uppercase">SMILE LIVE</div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-yellow-400 selection:text-black">
      
      {/* PREMIUM TOP NAV */}
      <div className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-5 flex justify-between items-center">
        <Link href="/app"><ChevronLeft size={28} className="text-white hover:text-yellow-400 transition" /></Link>
        <span className="font-black text-[10px] tracking-[0.5em] uppercase text-zinc-500">Official Profile</span>
        <button onClick={handleSignOut} className="text-zinc-500 hover:text-red-500 transition-all active:scale-90"><LogOut size={22}/></button>
      </div>

      <div className="pt-28 pb-32 max-w-4xl mx-auto px-4">
        
        {/* HEADER PROFILE */}
        <div className="relative group flex flex-col items-center mb-12">
          <div className="relative">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-[3px] border-yellow-400/20 p-1.5 bg-gradient-to-tr from-yellow-400 to-yellow-600 shadow-[0_0_50px_rgba(234,179,8,0.15)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 border-4 border-black">
                <img 
                  src={profile?.avatar_url || `https://api.dicebear.com{profile?.username}`} 
                  className={`w-full h-full object-cover transition-all duration-700 ${uploading ? 'scale-110 blur-sm opacity-50' : 'scale-100'}`} 
                  alt="Avatar" 
                />
              </div>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="absolute bottom-2 right-2 bg-yellow-400 p-3 rounded-full border-4 border-black text-black hover:scale-110 active:rotate-12 transition-all shadow-2xl z-10"
            >
              <Camera size={20} strokeWidth={3} />
            </button>
            <input type="file" ref={fileInputRef} onChange={uploadAvatar} className="hidden" accept="image/*" />
            {uploading && <Loader2 className="absolute inset-0 m-auto animate-spin text-yellow-400 w-10 h-10 z-20" />}
          </div>

          <div className="mt-6 text-center w-full max-w-md">
            {!isEditing ? (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <h1 className="text-4xl font-black uppercase tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">@{profile?.username}</h1>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="h-[1px] w-4 bg-yellow-400"></div>
                  <p className="text-yellow-400 font-black text-[11px] tracking-[0.2em] uppercase">{profile?.full_name || 'Smile Live Member'}</p>
                  <div className="h-[1px] w-4 bg-yellow-400"></div>
                </div>
                <p className="mt-4 text-zinc-400 text-sm md:text-base font-medium leading-relaxed italic px-6">
                  "{profile?.bio || "Digital creator in the Smile universe."}"
                </p>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="mt-6 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all duration-300 active:scale-95"
                >
                  Edit Profile Information
                </button>
              </div>
            ) : (
              /* SECȚIUNE EDITARE ACTIVĂ */
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4 bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-black uppercase tracking-widest text-yellow-400 ml-4">Full Name</label>
                  <input 
                    value={editData.full_name}
                    onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                    placeholder="Numele tău complet..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-black uppercase tracking-widest text-yellow-400 ml-4">Bio / Description</label>
                  <textarea 
                    value={editData.bio}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    placeholder="Spune ceva despre tine..."
                    rows={3}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-yellow-400 outline-none transition-all resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={handleUpdateInfo}
                    disabled={loading}
                    className="flex-1 bg-yellow-400 text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16}/> : <><Check size={16}/> Save Changes</>}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-6 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all flex items-center justify-center"
                  >
                    <X size={18}/>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STATS AREA */}
        <div className="grid grid-cols-3 gap-4 mb-12 border-y border-white/5 py-8">
          <div className="text-center group cursor-default">
            <p className="text-2xl font-black text-white group-hover:text-yellow-400 transition-colors">{posts.length}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Moments</p>
          </div>
          <div className="text-center group cursor-default">
            <p className="text-2xl font-black text-white group-hover:text-yellow-400 transition-colors">0</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Connections</p>
          </div>
          <div className="text-center group cursor-default">
            <p className="text-2xl font-black text-white group-hover:text-yellow-400 transition-colors">0</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Followers</p>
          </div>
        </div>

        {/* FEED GRID */}
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {posts.map((post) => (
            <div 
              key={post.id} 
              onClick={() => setSelectedPost(post)}
              className="relative aspect-square bg-zinc-900 group cursor-pointer overflow-hidden rounded-md md:rounded-2xl border border-white/5"
            >
              <img src={post.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Post" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                <div className="flex items-center gap-1 font-black text-sm">
                  <Heart size={18} fill="white" /> {post.likes[0]?.count || 0}
                </div>
                <div className="flex items-center gap-1 font-black text-sm">
                  <MessageCircle size={18} fill="white" /> {post.comments[0]?.count || 0}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
