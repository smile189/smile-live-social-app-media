"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Camera, LogOut, Grid3X3, Bookmark, ChevronLeft, Loader2, Check, X, Play, MessageCircle, Heart, Send, Reply as ReplyIcon } from "lucide-react";
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
    
    // FETCH DATE REALE CU COUNT
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
      // UPDATE COUNT LOCAL IN GRID
      setPosts(posts.map(p => p.id === selectedPost.id ? { ...p, comments: [{ count: (p.comments[0]?.count || 0) + 1 }] } : p));
    }
    setSendingComment(false);
  };

  const handleUpdateInfo = async () => {
    if (!profile?.id) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ full_name: editData.full_name, bio: editData.bio }).eq("id", profile.id);
    if (!error) { setProfile({ ...profile, ...editData }); setIsEditing(false); }
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
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <h1 className="text-4xl font-black uppercase tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">@{profile?.username}</h1>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="h-[1px] w-4 bg-yellow-400"></div>
                  <p className="text-yellow-400 font-black text-[11px] tracking-[0.2em] uppercase">{profile?.full_name || 'Smile Live Member'}</p>
                  <div className="h-[1px] w-4 bg-yellow-400"></div>
                </div>
                <p className="mt-4 text-zinc-400 text-sm md:text-base font-medium leading-relaxed italic">
                  "{profile?.bio || "Digital creator in the Smile universe."}"
                </p>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="mt-8 px-10 py-3 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-yellow-400 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
                >
                  Edit My Space
                </button>
              </div>
            ) : (
              <div className="space-y-4 bg-zinc-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
                <input value={editData.full_name} onChange={(e) => setEditData({...editData, full_name: e.target.value})} placeholder="Full Name" className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-sm focus:border-yellow-400 outline-none transition" />
                <textarea value={editData.bio} onChange={(e) => setEditData({...editData, bio: e.target.value})} placeholder="Bio" className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-sm h-28 focus:border-yellow-400 outline-none transition resize-none" />
                <div className="flex gap-3">
                  <button onClick={handleUpdateInfo} className="flex-1 bg-yellow-400 text-black font-black py-3 rounded-xl text-xs uppercase flex items-center justify-center gap-2"><Check size={18}/> Update</button>
                  <button onClick={() => setIsEditing(false)} className="px-5 bg-zinc-800 text-white rounded-xl"><X size={18}/></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* WOW STATS BAR */}
        <div className="grid grid-cols-3 bg-zinc-900/30 rounded-3xl border border-white/5 py-8 mb-16 backdrop-blur-sm">
          <div className="text-center border-r border-white/5">
            <p className="text-3xl font-black text-white">{posts.length}</p>
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-1">Creations</p>
          </div>
          <div className="text-center border-r border-white/5">
            <p className="text-3xl font-black text-white">0</p>
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-1">Network</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-yellow-400">{posts.reduce((acc, p) => acc + (p.likes?.[0]?.count || 0), 0)}</p>
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-1">Impact</p>
          </div>
        </div>

        {/* GRID DESIGN WOW */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-2">
             <div className="p-3 bg-yellow-400 text-black rounded-2xl shadow-lg shadow-yellow-400/20"><Grid3X3 size={20} strokeWidth={3}/></div>
             <h2 className="font-black text-xs uppercase tracking-[0.3em]">Latest Content</h2>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {posts.map((post) => (
              <div 
                key={post.id} 
                onClick={() => openPost(post)} 
                className="aspect-[3/4] bg-zinc-900 rounded-2xl relative group overflow-hidden cursor-pointer border border-white/5"
              >
                <img 
                  src={post.thumbnail_url || `https://placehold.co`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt="Post" 
                />
                
                {/* PREVIEW STATS IN GRID - FIXED */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                   <div className="flex items-center gap-4 mb-2 animate-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-1.5">
                        <Heart size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] font-black">{post.likes?.[0]?.count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle size={14} className="fill-white text-white" />
                        <span className="text-[10px] font-black">{post.comments?.[0]?.count || 0}</span>
                      </div>
                   </div>
                </div>
                <div className="absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                  <Play size={12} className="fill-current" />
                </div>
              </div>
            ))}
          </div>
          {posts.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl">
               <p className="text-zinc-600 font-black text-xs uppercase tracking-widest">Awaiting first upload...</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL DESIGN WOW (GLASSMORPHISM) --- */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => {setSelectedPost(null); setReplyTo(null);}}></div>
          
          <div className="relative bg-[#0a0a0a] w-full h-full md:max-w-6xl md:h-[90vh] flex flex-col md:flex-row overflow-hidden md:rounded-[40px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)]">
            
            {/* CONTENT VIEW */}
            <div className="flex-[1.5] bg-black flex items-center justify-center relative group">
               <img src={selectedPost.thumbnail_url} className="h-full w-full object-contain" alt="Preview" />
               <button onClick={() => setSelectedPost(null)} className="absolute top-6 left-6 p-4 bg-white/5 backdrop-blur-xl rounded-full md:hidden text-white border border-white/10"><ChevronLeft size={24}/></button>
            </div>
            
            {/* SIDEBAR PANEL */}
            <div className="flex-1 flex flex-col bg-[#0d0d0d] border-l border-white/5">
               <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                     <span className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-500">Engagement</span>
                  </div>
                  <button onClick={() => setSelectedPost(null)} className="hidden md:block p-2 hover:bg-white/5 rounded-full transition text-zinc-500 hover:text-white"><X size={20}/></button>
               </div>
               
               <div className="p-6 bg-yellow-400/5">
                  <p className="text-[10px] font-black text-yellow-400 uppercase mb-2 tracking-widest opacity-60">Creative Caption</p>
                  <p className="text-base font-bold text-white leading-relaxed">{selectedPost.caption || "No description provided for this creation."}</p>
               </div>

               {/* SCROLLABLE COMMENTS */}
               <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
                  {postComments.filter(c => !c.parent_id).map((com) => (
                    <div key={com.id} className="space-y-4">
                       <div className="flex gap-4 group/item">
                          <img src={com.profiles?.avatar_url || `https://api.dicebear.com{com.profiles?.username}`} className="w-10 h-10 rounded-2xl border border-white/10 shadow-lg" alt="User" />
                          <div className="flex-1">
                             <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] font-black text-yellow-400 uppercase tracking-tighter">@{com.profiles?.username}</p>
                                <button onClick={() => {setReplyTo(com); setNewComment(`@${com.profiles?.username} `);}} className="opacity-0 group-hover/item:opacity-100 text-[9px] uppercase font-black text-zinc-600 hover:text-white transition-all flex items-center gap-1"><ReplyIcon size={12}/> Reply</button>
                             </div>
                             <p className="text-sm text-zinc-300 leading-snug font-medium">{com.content}</p>
                          </div>
                       </div>
                       
                       {/* REPLY THREAD */}
                       {postComments.filter(r => r.parent_id === com.id).map(reply => (
                         <div key={reply.id} className="flex gap-3 ml-12 border-l-2 border-white/5 pl-5 py-1">
                            <img src={reply.profiles?.avatar_url || `https://api.dicebear.com{reply.profiles?.username}`} className="w-7 h-7 rounded-xl border border-white/10" alt="Reply" />
                            <div className="flex-1">
                               <p className="text-[9px] font-black text-zinc-500 uppercase">@{reply.profiles?.username}</p>
                               <p className="text-xs text-zinc-400 mt-0.5 font-medium">{reply.content}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  ))}
               </div>

               {/* SMART INPUT BOX */}
               <div className="p-6 bg-zinc-900/40 backdrop-blur-2xl border-t border-white/5">
                  {replyTo && (
                    <div className="flex justify-between items-center mb-3 px-4 py-2 bg-yellow-400 text-black rounded-xl animate-in slide-in-from-bottom-2">
                       <p className="text-[10px] font-black uppercase tracking-tighter">Replying to @{replyTo.profiles?.username}</p>
                       <button onClick={() => {setReplyTo(null); setNewComment("");}} className="hover:rotate-90 transition-transform"><X size={14}/></button>
                    </div>
                  )}
                  <div className="flex gap-3 items-center bg-black/60 p-2 rounded-2xl border border-white/10 focus-within:border-yellow-400/50 transition-all shadow-inner">
                    <input 
                      placeholder={replyTo ? "Compose reply..." : "Share a thought..."} 
                      className="flex-1 bg-transparent border-none text-sm px-3 py-2 outline-none text-white placeholder:text-zinc-600" 
                      value={newComment} 
                      onChange={(e) => setNewComment(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} 
                    />
                    <button 
                      onClick={handleAddComment} 
                      disabled={sendingComment} 
                      className="bg-yellow-400 text-black p-3 rounded-xl hover:scale-105 active:scale-95 transition disabled:opacity-30 disabled:grayscale shadow-lg shadow-yellow-400/10"
                    >
                      {sendingComment ? <Loader2 className="animate-spin" size={20}/> : <Send size={20} strokeWidth={2.5}/>}
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(250,204,21,0.2); }
      `}</style>
    </div>
  );
}
