"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { 
  X, ChevronLeft, Upload, Send, Loader2, Globe, Zap, 
  Sparkles, Play, Pause, Volume2, VolumeX, CheckCircle2
} from "lucide-react";

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [user, setUser] = useState<any>(null);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push("/app/login");
      } else {
        setUser(currentUser);
      }
    };
    checkUser();
  }, [supabase, router]);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleCaptionChange = async (val: string) => {
    setCaption(val);
    const words = val.split(/\s/);
    const lastWord = words[words.length - 1];
    
    if (lastWord?.startsWith("@") && lastWord.length > 1) {
      const query = lastWord.substring(1);
      setShowTagSearch(true);
      setSearchLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url, full_name")
        .ilike("username", `${query}%`)
        .limit(5);
      setSearchResults(data || []);
      setSearchLoading(false);
    } else {
      setShowTagSearch(false);
    }
  };

  const applyTag = (username: string) => {
    const words = caption.split(" ");
    words.pop();
    setCaption([...words, `@${username} `].join(" "));
    setShowTagSearch(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setFileType(f.type.startsWith("video") ? "video" : "image");
      setIsPlaying(true);
      setIsMuted(true);
    }
  };

  const handlePost = async () => {
    if (!file || !user) return;
    setLoading(true);
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => (prev < 95 ? prev + 2 : prev));
      }, 100);

      const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: upErr } = await supabase.storage.from("posts").upload(filePath, file);
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from("posts").getPublicUrl(filePath);

      const { error: dbErr } = await supabase.from("posts").insert({
        user_id: user.id,
        caption: caption,
        type: fileType,
        video_url: fileType === "video" ? urlData.publicUrl : null,
        thumbnail_url: fileType === "image" ? urlData.publicUrl : null,
      });

      if (dbErr) throw dbErr;
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => { router.push("/app"); router.refresh(); }, 800);
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col font-sans text-white overflow-hidden selection:bg-yellow-500/30">
      
      <header className="flex justify-between items-center px-6 py-4 border-b border-white/[0.03] bg-black/40 backdrop-blur-3xl z-50">
        <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all active:scale-90 border border-white/5">
          <ChevronLeft size={22} />
        </button>
        
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-300">Creator Hub</span>
            </div>
            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Neural Uplink v2</span>
        </div>

        <button 
          onClick={handlePost}
          disabled={loading || !file}
          className="group relative px-6 py-2 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest overflow-hidden transition-all hover:pr-10 disabled:opacity-30"
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={14} /> : "Publish"}
          </span>
          <Send size={14} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col lg:flex-row items-center justify-center p-4 lg:p-12 gap-12">
        
        <section className="w-full max-w-[400px] aspect-[9/16] relative group">
          <div className="absolute -inset-4 bg-yellow-500/5 rounded-[3rem] blur-3xl group-hover:bg-yellow-500/10 transition-all duration-700" />
          
          {preview ? (
            <div className="relative w-full h-full rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl bg-zinc-900 animate-in fade-in zoom-in-95 duration-500">
              {fileType === "video" ? (
                <div className="w-full h-full relative group/video cursor-pointer" onClick={() => {
                  if(isPlaying) videoRef.current?.pause(); else videoRef.current?.play();
                  setIsPlaying(!isPlaying);
                }}>
                  <video ref={videoRef} src={preview} className="w-full h-full object-cover" autoPlay loop muted={isMuted} playsInline />
                  <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                      <Play size={64} className="fill-white text-white drop-shadow-2xl" />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="absolute bottom-8 left-8 p-4 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 hover:scale-110 transition-all">
                      {isMuted ? <VolumeX size={20} className="text-yellow-500" /> : <Volume2 size={20} />}
                  </button>
                </div>
              ) : (
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
              )}
              <button onClick={() => {setFile(null); setPreview(null); setUploadProgress(0);}} className="absolute top-6 right-6 p-3 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-xl rounded-full border border-red-500/20 transition-colors">
                <X size={20} className="text-red-500" />
              </button>
              {loading && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                  <div className="h-full bg-yellow-500 transition-all duration-300 shadow-[0_0_15px_#eab308]" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} className="w-full h-full rounded-[2.5rem] border border-white/5 bg-zinc-900/20 flex flex-col items-center justify-center gap-8 hover:border-yellow-500/30 transition-all group relative overflow-hidden">
              <div className="p-8 rounded-[2rem] bg-zinc-900 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-2xl relative">
                <Upload size={40} className="text-zinc-500 group-hover:text-yellow-500 transition-colors" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-400 group-hover:text-zinc-200">Select Media</p>
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Ready for Uplink</p>
              </div>
            </button>
          )}
          <input type="file" hidden ref={fileInputRef} accept="image/*,video/*" onChange={handleFileChange} />
        </section>

        <section className="w-full lg:w-[460px] space-y-8">
          <div className="relative group">
            <div className="flex items-center gap-3 mb-4">
               <Sparkles size={16} className="text-yellow-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Captions & Tags</span>
            </div>
            <div className="relative">
              <textarea 
                value={caption}
                onChange={(e) => handleCaptionChange(e.target.value)}
                placeholder="What's happening? Type @ to tag..."
                className="w-full bg-zinc-900/50 border border-white/5 rounded-3xl p-6 min-h-[160px] focus:outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all resize-none text-[15px] leading-relaxed"
              />
              {showTagSearch && (
                <div className="absolute bottom-full mb-4 left-0 right-0 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-2 duration-300 z-50">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Targeting Users...</span>
                  </div>
                  {searchResults.map((u) => (
                    <button key={u.username} onClick={() => applyTag(u.username)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/[0.02] last:border-0 text-left">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                        <img src={u.avatar_url || `https://ui-avatars.com{u.username}`} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-200">@{u.username}</p>
                        <p className="text-[10px] text-zinc-500 font-medium">{u.full_name}</p>
                      </div>
                      <CheckCircle2 size={14} className="ml-auto text-yellow-500/40" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-zinc-900/30 border border-white/5 rounded-2xl flex flex-col gap-3">
               <Globe size={18} className="text-zinc-500" />
               <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase text-zinc-500">Network</p>
                 <p className="text-xs font-bold text-zinc-200 uppercase tracking-tighter">Public CDN</p>
               </div>
            </div>
            <div className="p-5 bg-zinc-900/30 border border-white/5 rounded-2xl flex flex-col gap-3">
               <Zap size={18} className="text-yellow-500" />
               <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase text-zinc-500">Latency</p>
                 <p className="text-xs font-bold text-zinc-200 uppercase tracking-tighter">Accelerated</p>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
