/**
 * app/app/upload/page.tsx - Official Production Module
 * Features: Video Sound Control, Play/Pause, Real-Time @User Search
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { 
  X, ChevronLeft, Upload, Shield, Send, Loader2, Globe, Zap, 
  Sparkles, Play, Pause, Volume2, VolumeX, AtSign, Search
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
  
  // Video States
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  
  // Tagging States
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) router.push("/app/login");
      else setUser(currentUser);
    };
    getUser();
  }, [supabase, router]);

  // Logică căutare utilizatori pentru etichetare
  const handleCaptionChange = async (val: string) => {
    setCaption(val);
    const lastWord = val.split(" ").pop();
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
        setUploadProgress(prev => (prev < 90 ? prev + 5 : prev));
      }, 150);

      const fileName = `${Date.now()}.${file.name.split('.').pop()}`;
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
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col font-sans text-white overflow-hidden">
      
      <header className="flex justify-between items-center px-4 py-5 border-b border-white/[0.05] bg-black/80 backdrop-blur-2xl z-50">
        <button onClick={() => router.back()} className="p-2 text-zinc-400 active:scale-90"><ChevronLeft size={28} /></button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-zinc-200">Production Studio</span>
            <span className="text-[8px] text-yellow-500 font-bold uppercase tracking-widest mt-1 italic">V2 Protocol // Active</span>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 flex items-center gap-2">
           <Globe size={10} className="text-zinc-500" />
           <span className="text-[8px] font-bold uppercase text-zinc-400 tracking-tighter">Global Hub</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col md:flex-row bg-[#030303]">
        
        {/* PREVIEW AREA WITH SOUND & PLAY CONTROLS */}
        <section className="w-full md:flex-1 p-6 md:p-12 flex items-center justify-center">
          <div className="relative w-full aspect-[9/16] max-w-[340px] md:max-w-[380px] shadow-[0_0_80px_rgba(0,0,0,1)]">
            {preview ? (
              <div className="w-full h-full rounded-[2.5rem] border border-white/10 overflow-hidden relative group animate-in fade-in zoom-in-95 duration-700">
                {fileType === "video" ? (
                  <div className="w-full h-full relative cursor-pointer" onClick={() => {
                    if(isPlaying) videoRef.current?.pause(); else videoRef.current?.play();
                    setIsPlaying(!isPlaying);
                  }}>
                    <video ref={videoRef} src={preview} className="w-full h-full object-cover" autoPlay loop muted={isMuted} playsInline />
                    
                    {/* VIDEO CONTROLS */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isPlaying && <Play size={48} className="fill-white" />}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="absolute bottom-6 left-6 p-3 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 z-20">
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  </div>
                ) : (
                  <img src={preview} className="w-full h-full object-cover shadow-2xl" alt="Preview" />
                )}
                <button onClick={() => {setFile(null); setPreview(null); setUploadProgress(0);}} className="absolute top-5 right-5 p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/20 active:scale-75"><X size={20} /></button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="w-full h-full rounded-[2.5rem] border-2 border-dashed border-white/5 bg-zinc-900/10 flex flex-col items-center justify-center gap-6 hover:bg-zinc-900/20 transition-all group">
                <div className="p-6 rounded-[2rem] bg-zinc-900 border border-white/5 group-hover:border-yellow-500/50 shadow-2xl"><Upload size={32} className="text-zinc-600 group-hover:text-yellow-500" /></div>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Capture Media Signal</p>
              </button>
            )}
            <input type="file" hidden ref={fileInputRef} accept="image/*,video/*" onChange={handleFileChange} />
          </div>
        </section>

        {/* INPUTS & @USER SEARCH */}
        <section className="w-full md:w-[420px] bg-black p-8 md:p-12 space-y-12 border-t md:border-l border-white/[0.05] relative">
          
          <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-2">
                <Sparkles size={12} className="text-yellow-500" /> Signal Narrative
                </label>
                <div className="flex items-center gap-1.5 text-yellow-500/50 text-[9px] font-bold uppercase"><AtSign size={10} /> Tag Enabled</div>
            </div>
            
            <textarea 
              value={caption}
              onChange={(e) => handleCaptionChange(e.target.value)}
              placeholder="What is the story? Use @ to tag..."
              className="w-full bg-transparent border-none focus:ring-0 text-xl md:text-2xl font-medium text-white placeholder-zinc-800 resize-none min-h-[140px] p-0 leading-snug"
            />

            {/* REAL-TIME USER SEARCH POPUP */}
            {showTagSearch && (
                <div className="absolute top-full left-0 w-full bg-zinc-950 border border-white/10 rounded-2xl p-2 z-50 shadow-2xl animate-in slide-in-from-top-2">
                    {searchLoading && <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-zinc-600" size={20} /></div>}
                    {!searchLoading && searchResults.length === 0 && <div className="p-4 text-[10px] uppercase text-zinc-600 text-center">No operator found</div>}
                    {searchResults.map((u) => (
                        <button key={u.username} onClick={() => applyTag(u.username)} className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all">
                            <img src={u.avatar_url} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                            <div className="text-left">
                                <p className="text-[11px] font-bold text-white">@{u.username}</p>
                                <p className="text-[9px] text-zinc-500">{u.full_name}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-[1.8rem] bg-zinc-900/30 border border-white/[0.03] space-y-3">
              <Zap size={16} className="text-yellow-500" />
              <div><p className="text-[8px] font-black uppercase text-zinc-600 tracking-tighter">Bitrate</p><p className="text-[10px] font-bold text-zinc-300 italic uppercase tracking-widest">Optimized</p></div>
            </div>
            <div className="p-5 rounded-[1.8rem] bg-zinc-900/30 border border-white/[0.03] space-y-3">
              <Shield size={16} className="text-yellow-500" />
              <div><p className="text-[8px] font-black uppercase text-zinc-600 tracking-tighter">Security</p><p className="text-[10px] font-bold text-zinc-300 italic uppercase tracking-widest">Protocol_E2</p></div>
            </div>
          </div>

          <button onClick={handlePost} disabled={loading || !file} className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.6em] flex items-center justify-center gap-4 hover:bg-yellow-500 transition-all active:scale-95 disabled:opacity-20 shadow-[0_40px_100px_-20px_rgba(255,255,255,0.15)]">
            {loading ? <><Loader2 size={20} className="animate-spin" /><span>DEPLOYING {uploadProgress}%</span></> : <><Send size={18} /><span>Deploy Stream</span></>}
          </button>
        </section>
     

      </main>
    </div>

    
  );
}
