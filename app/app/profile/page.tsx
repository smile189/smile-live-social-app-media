"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Camera, LogOut, Grid3X3, Bookmark, ChevronLeft, Loader2, X, Play, MessageCircle, Heart, Send, Reply as ReplyIcon, Wallet } from "lucide-react";
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
  const [balance, setBalance] = useState<number>(0);
  // MODIFICAT: editData include acum si username
  const [editData, setEditData] = useState({ full_name: "", bio: "", username: "" });

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
    // FETCH DATE PARALEL: Profil + Balanta Wallet
    const [pRes, wRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("wallets").select("coins_balance").eq("id", userId).maybeSingle()
    ]);
    
    // FETCH DATE REALE CU COUNT
    const { data: postsData } = await supabase
      .from("posts")
      .select(`*, likes(count), comments(count)`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (pRes.data) { 
      setProfile(pRes.data); 
      setEditData({ 
        full_name: pRes.data.full_name || "", 
        bio: pRes.data.bio || "",
        username: pRes.data.username || "" 
      }); 
    }
    if (wRes.data) setBalance(wRes.data.coins_balance);
    if (postsData) setPosts(postsData);
    setLoading(false);
  }

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
    const commentPayload = {
      post_id: selectedPost.id,
      user_id: profile.id,
      content: newComment,
      parent_id: replyTo ? replyTo.id : null
    };
    const { data, error } = await supabase.from("comments").insert([commentPayload]).select(`*, profiles(username, avatar_url)`).single();
    if (!error && data) {
      setPostComments([...postComments, data]);
      setNewComment("");
      setReplyTo(null);
      // UPDATE COUNT LOCAL IN GRID (Fixat accesarea count-ului)
      setPosts(posts.map(p => p.id === selectedPost.id ? { ...p, comments: [{ count: (p.comments?.[0]?.count || 0) + 1 }] } : p));
    }
    setSendingComment(false);
  };

  const handleUpdateInfo = async () => {
    if (!profile?.id) return;
    setLoading(true);
    // Curatare username (fara spatii, litere mici)
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
      alert("Username deja luat!");
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
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      
      {/* PREMIUM TOP NAV */}
      <div className="fixed top-0 w-full z-[60] bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-5 flex justify-between items-center">
        <Link href="/app"><ChevronLeft size={28} className="text-white hover:text-yellow-400 transition" /></Link>
        <span className="font-black text-[10px] tracking-[0.5em] uppercase text-zinc-500 italic">Smile Official</span>
        <button onClick={handleSignOut} className="text-zinc-500 hover:text-red-500 transition-all active:scale-90"><LogOut size={22}/></button>
      </div>

      <div className="pt-28 pb-32 max-w-4xl mx-auto px-4">
        
        {/* DESIGN WOW: HEADER */}
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
              className="absolute bottom-2 right-2 bg-yellow-400 p-3 rounded-full border-4 border-black text-black hover:scale-110 active:rotate-12 transition-all shadow-2xl"
            >
              <Camera size={20} strokeWidth={3} />
            </button>
            <input type="file" ref={fileInputRef} onChange={uploadAvatar} className="hidden" accept="image/*" />
            {uploading && <Loader2 className="absolute inset-0 m-auto animate-spin text-yellow-400 w-10 h-10" />}
          </div>

          <div className="mt-6 text-center w-full max-w-lg">
            {!isEditing ? (
              <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">
                <h1 className="text-4xl font-black uppercase tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent italic">@{profile?.username}</h1>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="h-[1px] w-4 bg-yellow-400"></div>
                  <p className="text-yellow-400 font-black text-[11px] tracking-[0.2em] uppercase">{profile?.full_name || 'Smile Member'}</p>
                  <div className="h-[1px] w-4 bg-yellow-400"></div>
                </div>

                {/* ADAUGAT: BUTON WALLET PREMIUM RESPONSIVE */}
                <Link href="/app/wallet" className="mt-6 flex items-center gap-4 bg-zinc-900/50 border border-white/10 px-6 py-4 rounded-3xl hover:border-yellow-400/50 transition-all group">
                    <div className="p-2 bg-yellow-400 rounded-xl text-black shadow-[0_0_15px_rgba(234,179,8,0.3)] group-hover:rotate-12 transition-transform">
                      <Wallet size={22} strokeWidth={2.5} />
                    </div>
                    <div className="text-left leading-none">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Balance</p>
                      <p className="text-xl font-mono font-bold text-white italic">{balance.toLocaleString()} 🪙</p>
                    </div>
                </Link>

                <p className="mt-6 text-zinc-400 text-sm md:text-base font-medium leading-relaxed italic px-8">
                  "{profile?.bio || "Digital creator in the Smile universe."}"
                </p>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="mt-8 px-10 py-3 bg-white text-black font-black uppercase italic rounded-xl hover:bg-yellow-400 transition-all active:scale-95 text-xs"
                >
                  Edit Profile Settings
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                {/* ADAUGAT: INPUT USERNAME DEDICAT */}
                <div className="text-left">
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Username (@)</label>
                  <input 
                    className="w-full bg-zinc-900 border border-white/10 p-4 rounded-2xl focus:border-yellow-400 outline-none mt-1 font-bold text-yellow-400"
                    value={editData.username}
                    onChange={e => setEditData({...editData, username: e.target.value})}
                  />
                </div>
                <div className="text-left">
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Full Name</label>
                  <input 
                    className="w-full bg-zinc-900 border border-white/10 p-4 rounded-2xl focus:border-yellow-400 outline-none mt-1"
                    value={editData.full_name}
                    onChange={e => setEditData({...editData, full_name: e.target.value})}
                  />
                </div>
                <div className="text-left">
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Bio</label>
                  <textarea 
                    className="w-full bg-zinc-900 border border-white/10 p-4 rounded-2xl h-28 focus:border-yellow-400 outline-none mt-1 resize-none"
                    value={editData.bio}
                    onChange={e => setEditData({...editData, bio: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleUpdateInfo} className="flex-1 bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase italic hover:bg-white transition-colors">Save Changes</button>
                  <button onClick={() => setIsEditing(false)} className="px-6 bg-zinc-800 text-white py-4 rounded-2xl hover:bg-red-500 transition-colors"><X size={24}/></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* POSTS LOGIC - PASTRATA SI REPARATA PENTRU COUNT */}
        <div className="mt-16 flex items-center justify-center gap-12 border-t border-white/5 pt-6">
          <button className="flex items-center gap-2 text-white border-t-2 border-white -mt-[26px] pt-4">
            <Grid3X3 size={20} /> <span className="text-[11px] font-black uppercase tracking-widest italic">Posts ({posts.length})</span>
          </button>
          <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition pt-4 -mt-[26px]">
            <Bookmark size={20} /> <span className="text-[11px] font-black uppercase tracking-widest italic">Saved</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 md:gap-4 mt-8">
          {posts.map((post) => (
            <div 
              key={post.id} 
              onClick={() => openPost(post)}
              className="relative aspect-square bg-zinc-900 cursor-pointer group overflow-hidden rounded-sm md:rounded-xl"
            >
              <img src={post.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 md:gap-8">
                <div className="flex items-center gap-1.5 font-black text-[10px] md:text-base"><Heart size={18} fill="white" /> {post.likes?.[0]?.count || 0}</div>
                <div className="flex items-center gap-1.5 font-black text-[10px] md:text-base"><MessageCircle size={18} fill="white" /> {post.comments?.[0]?.count || 0}</div>
              </div>
              {post.type === 'video' && <div className="absolute top-2 right-2"><Play size={16} fill="white" /></div>}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL POST - REPARAT PENTRU MOBILE CU BUTON X DEDICAT */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setSelectedPost(null)} />
          
          {/* BUTON X PENTRU MOBILE (In afara containerului principal pentru vizibilitate) */}
          <button 
            onClick={() => setSelectedPost(null)} 
            className="absolute top-6 right-6 z-[110] p-3 bg-white/10 hover:bg-white/20 rounded-full md:hidden border border-white/10 transition-all"
          >
            <X size={24} className="text-white" />
          </button>

          <div className="relative bg-zinc-950 w-full max-w-6xl h-full md:h-[80vh] rounded-none md:rounded-3xl overflow-hidden flex flex-col md:flex-row border-white/10 md:border shadow-2xl">
            
            <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden h-[45vh] md:h-full">
              <img src={selectedPost.media_url} className="w-full h-full object-contain" alt="" />
              <button onClick={() => setSelectedPost(null)} className="absolute top-4 left-4 p-3 bg-black/40 rounded-full md:hidden border border-white/10 shadow-lg"><ChevronLeft size={24}/></button>
            </div>

            <div className="w-full md:w-[400px] flex flex-col bg-zinc-950 border-l border-white/10 h-[55vh] md:h-full">
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-yellow-400/30 p-0.5">
                    <img src={profile?.avatar_url} className="w-full h-full rounded-full object-cover shadow-lg" alt="" />
                  </div>
                  <span className="font-black text-sm tracking-tight italic">@{profile?.username}</span>
                </div>
                <button onClick={() => setSelectedPost(null)} className="hidden md:block text-zinc-500 hover:text-white transition-all hover:rotate-90"><X size={24}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                {postComments.map((comment) => (
                  <div key={comment.id} className="group flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
                    <img src={comment.profiles?.avatar_url} className="w-8 h-8 rounded-full object-cover shadow-md" alt="" />
                    <div className="flex-1">
                      <p className="text-[13px] leading-relaxed">
                        <span className="font-black mr-2 italic text-yellow-400/90">@{comment.profiles?.username}</span>
                        <span className="text-zinc-300">{comment.content}</span>
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{new Date(comment.created_at).toLocaleDateString()}</span>
                        <button 
                          onClick={() => {
                            setReplyTo(comment);
                            setNewComment(`@${comment.profiles?.username} `);
                          }}
                          className="text-[9px] font-black text-yellow-400 uppercase tracking-widest hover:text-white transition flex items-center gap-1"
                        >
                          <ReplyIcon size={10} /> Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-white/5 bg-black/30 backdrop-blur-sm">
                {replyTo && (
                  <div className="flex items-center justify-between bg-yellow-400/10 p-3 rounded-xl mb-4 border border-yellow-400/20 animate-in slide-in-from-top-2">
                    <p className="text-[9px] font-black uppercase text-yellow-400 tracking-widest flex items-center gap-2">
                      Replying to <span className="underline italic">@{replyTo.profiles?.username}</span>
                    </p>
                    <button onClick={() => {setReplyTo(null); setNewComment("");}} className="text-yellow-400 hover:rotate-90 transition-all"><X size={14}/></button>
                  </div>
                )}
                <div className="relative">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Drop a vibe..."
                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-6 pr-14 text-sm focus:border-yellow-400 outline-none transition-all placeholder:text-zinc-600"
                  />
                  <button 
                    onClick={handleAddComment}
                    disabled={sendingComment || !newComment.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-yellow-400 hover:scale-110 disabled:opacity-0 transition-all"
                  >
                    {sendingComment ? <Loader2 size={18} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
