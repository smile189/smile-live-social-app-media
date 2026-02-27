"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation"; // Importă router-ul pentru redirecționare
import { Camera, LogOut, Grid3X3, Bookmark, ChevronLeft, Loader2, Check, X } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ full_name: "", bio: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    
    // REDIRECTIONARE: Dacă nu există user, trimite-l la login
    if (!user) {
      router.push("app/login");
      return;
    }

    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) {
      setProfile(data);
      setEditData({ full_name: data.full_name || "", bio: data.bio || "" });
    }
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

      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      
      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading && !profile) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-yellow-400 font-black text-3xl animate-pulse tracking-tighter">SMILE LIVE</div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans selection:bg-yellow-400 selection:text-black">
      
      {/* TOP NAV BAR */}
      <div className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex justify-between items-center">
        <Link href="/"><ChevronLeft size={28} className="text-white active:scale-90 transition" /></Link>
        <span className="font-black text-xs tracking-[0.3em] uppercase">My Profile</span>
        <button onClick={handleSignOut} className="text-zinc-600 hover:text-red-500 transition"><LogOut size={20}/></button>
      </div>

      <div className="pt-24 pb-32 max-w-2xl mx-auto">
        
        {/* AVATAR & STATS SECTION */}
        <div className="px-6 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[4px] border-yellow-400 p-1 bg-zinc-900 overflow-hidden shadow-[0_0_30px_rgba(250,204,21,0.1)]">
              <img 
                src={profile?.avatar_url || `https://api.dicebear.com{profile?.username}`} 
                className={`w-full h-full rounded-full object-cover transition-opacity ${uploading ? 'opacity-30' : 'opacity-100'}`}
                alt="Avatar"
              />
              {uploading && <Loader2 className="absolute inset-0 m-auto animate-spin text-yellow-400" />}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-yellow-400 p-2.5 rounded-full border-[3px] border-black text-black hover:scale-110 active:scale-95 transition-all shadow-xl"
            >
              <Camera size={18} strokeWidth={3} />
            </button>
            <input type="file" ref={fileInputRef} onChange={uploadAvatar} className="hidden" accept="image/*" />
          </div>

          <div className="flex-1 text-center md:text-left pt-2">
            {!isEditing ? (
              <>
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">@{profile?.username}</h1>
                <p className="text-yellow-400 font-bold text-[10px] tracking-widest mt-1 uppercase">{profile?.full_name || 'Smile Member'}</p>
                <p className="mt-4 text-zinc-400 text-sm md:text-base leading-relaxed max-w-xs mx-auto md:mx-0">
                  {profile?.bio || "Add a cool bio here..."}
                </p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="mt-6 px-8 py-2.5 border-2 border-yellow-400 text-yellow-400 font-black text-xs uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <input 
                  value={editData.full_name}
                  onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                  placeholder="Full Name"
                  className="w-full bg-zinc-900 border-l-4 border-yellow-400 p-3 text-sm focus:outline-none focus:bg-zinc-800 transition text-white"
                />
                <textarea 
                  value={editData.bio}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  placeholder="Bio (description)"
                  className="w-full bg-zinc-900 border-l-4 border-yellow-400 p-3 text-sm h-24 focus:outline-none focus:bg-zinc-800 transition text-white"
                />
                <div className="flex gap-4">
                  <button onClick={handleUpdateInfo} className="flex-1 bg-yellow-400 text-black font-black py-2 text-xs uppercase flex items-center justify-center gap-2"><Check size={16}/> Save Changes</button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-zinc-800 text-zinc-500 font-black text-xs uppercase"><X size={16}/></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STATS BAR */}
        <div className="mt-12 grid grid-cols-3 border-y border-zinc-900 py-6">
          <div className="text-center border-r border-zinc-900">
            <p className="text-2xl font-black">0</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Videos</p>
          </div>
          <div className="text-center border-r border-zinc-900">
            <p className="text-2xl font-black">0</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Fans</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black">0</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Likes</p>
          </div>
        </div>

        {/* CONTENT TABS */}
        <div className="mt-0">
          <div className="flex bg-black sticky top-14 z-20 border-b border-zinc-900">
            <button className="flex-1 flex justify-center py-4 border-b-2 border-yellow-400 text-yellow-400">
              <Grid3X3 size={24} strokeWidth={2.5}/>
            </button>
            <button className="flex-1 flex justify-center py-4 text-zinc-800 hover:text-white transition">
              <Bookmark size={24} strokeWidth={2}/>
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/4] bg-zinc-900 animate-pulse border border-black/50"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
