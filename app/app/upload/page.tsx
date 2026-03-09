"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { 
  X, ChevronLeft, Upload, Loader2, Play, Pause,
  Music, Type, Trash2, Hash, AtSign, Sliders, Plus, 
  Volume2, VolumeX, Check, ShieldAlert, Globe, Lock, Users,
  Smile
} from "lucide-react";

const FILTERS = [
  { name: "Original", class: "" },
  { name: "Retro", class: "sepia(0.5) contrast(1.1) brightness(0.9)" },
  { name: "Vivid", class: "saturate(1.8) contrast(1.1)" },
  { name: "Noir", class: "grayscale(1) contrast(1.2)" },
  { name: "Warm", class: "sepia(0.2) saturate(1.3)" },
];

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [user, setUser] = useState<any>(null);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  const [isEditingText, setIsEditingText] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [privacy, setPrivacy] = useState<"public" | "followers" | "private">("public");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) router.push("/app/login");
      else setUser(currentUser);
    };
    checkUser();
  }, [supabase, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type.startsWith("video")) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 120) {
          alert("⚠️ Error: Video is too long (" + Math.round(video.duration) + "s). Max 120s.");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        setFile(selected);
        setFileType("video");
        setPreview(URL.createObjectURL(selected));
      };
      video.src = URL.createObjectURL(selected);
    } else {
      setFile(selected);
      setFileType("image");
      setPreview(URL.createObjectURL(selected));
    }
  };

  const applyTag = (username: string) => {
    const words = caption.split(/\s/);
    words.pop();
    setCaption([...words, `@${username} `].join(" "));
    setShowTagSearch(false);
    captionRef.current?.focus();
  };

  const handlePost = async () => {
    if (!file || !user || !agreedToTerms) return;
    setLoading(true);
    setShowConfirmModal(false);
    try {
      const progressInterval = setInterval(() => setUploadProgress(prev => (prev < 95 ? prev + 2 : prev)), 100);
      const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
      const filePath = `${user.id}/${fileName}`;
      const { error: upErr } = await supabase.storage.from("posts").upload(filePath, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("posts").getPublicUrl(filePath);
      const { error: dbErr } = await supabase.from("posts").insert({
        user_id: user.id, caption, type: fileType,
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
    <div className="fixed inset-0 bg-[#050506] text-zinc-100 flex flex-col items-center justify-center font-sans overflow-hidden">
      
      {/* DESKTOP BACKGROUND: INDIGO GRADIENT + NOISE TEXTURE */}
      <div className="absolute inset-0 bg-[#050506] hidden lg:block overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app')]" />
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-900/25 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-indigo-950/35 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(67,56,202,0.12)_0%,transparent_75%)]" />
      </div>

      {/* PC AMBIENT BLUR */}
      {preview && <div className="absolute inset-0 opacity-10 blur-[140px] scale-150 hidden lg:block pointer-events-none transition-all duration-1000" style={{ backgroundImage: `url(${preview})`, backgroundSize: 'cover' }} />}

      <div className="relative w-full h-full lg:max-w-[400px] lg:h-[85vh] lg:rounded-[2.5rem] lg:border-[8px] lg:border-zinc-900 bg-black overflow-hidden shadow-2xl flex flex-col">
        
        {/* PREVIEW ENGINE */}
        <div className="absolute inset-0 z-0 bg-black" onClick={() => videoRef.current && (isPlaying ? videoRef.current.pause() : videoRef.current.play())}>
          {!preview ? (
            <div onClick={() => fileInputRef.current?.click()} className="relative w-full h-full flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-white/5 transition-all">
              
              {/* STATIC WATERMARK (FARA PULSATIE) */}
              <div className="flex flex-col items-center opacity-20 pointer-events-none translate-y-[-20px]">
                <Smile size={42} strokeWidth={1.2} className="text-indigo-400" />
                <span className="text-[9px] font-black tracking-[0.6em] uppercase mt-3 text-indigo-200">Smile your story </span>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 shadow-2xl active:scale-95 transition-transform">
                <Plus size={28} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Import Media</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="video/*,image/*" />
            </div>
          ) : (
            <div className="w-full h-full relative" style={{ filter: activeFilter.class }}>
              {fileType === "video" ? (
                <video ref={videoRef} src={preview} className="w-full h-full object-cover" autoPlay loop muted={isMuted} playsInline onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
              ) : ( <img src={preview} className="w-full h-full object-cover" alt="preview" /> )}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in"><Play size={60} fill="white" className="opacity-40" /></div>
              )}
            </div>
          )}
        </div>

        {/* INTERFACE OVERLAY */}
        <div className="absolute inset-0 z-20 flex flex-col pointer-events-none">
          <header className="h-16 flex items-center justify-between px-5 pointer-events-auto bg-gradient-to-b from-black/90 to-transparent">
            <button onClick={() => router.back()} className="p-2 bg-zinc-900/50 backdrop-blur-xl rounded-xl border border-white/10 transition-transform active:scale-75"><X size={20} /></button>
            <button 
              onClick={() => preview ? setShowConfirmModal(true) : fileInputRef.current?.click()} 
              disabled={loading} 
              className={`px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg
                ${preview ? 'bg-red-600 text-white shadow-red-600/30' : 'bg-zinc-800 text-zinc-400'}`}
            >
                {loading ? <Loader2 className="animate-spin" size={14} /> : preview ? "Post" : "Select"}
            </button>
          </header>

          <div className="absolute right-4 top-[40%] -translate-y-1/2 flex flex-col gap-6 pointer-events-auto">
            <ToolBtn icon={<Type size={20} />} label="Text" onClick={() => preview ? setIsEditingText(true) : fileInputRef.current?.click()} />
            <ToolBtn icon={<Sliders size={20} />} label="Grade" onClick={() => preview ? setShowFilters(true) : fileInputRef.current?.click()} />
            <ToolBtn icon={isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />} label="Audio" onClick={(e) => { e.stopPropagation(); preview ? setIsMuted(!isMuted) : fileInputRef.current?.click(); }} />
            {preview && <button onClick={() => {setFile(null); setPreview(null); setOverlayText("");}} className="w-10 h-10 bg-red-600/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-red-600 border border-red-600/20 transition-all active:scale-75"><Trash2 size={18} /></button>}
          </div>

          {preview && (
            <div className="mt-auto p-5 pointer-events-auto bg-gradient-to-t from-black via-black/40 to-transparent pb-8">
              {overlayText && <div className="absolute inset-x-0 top-[40%] pointer-events-none flex justify-center px-10"><p className="text-3xl font-black text-center drop-shadow-[0_4px_20px_black] uppercase italic tracking-tighter">{overlayText}</p></div>}
              <div className="bg-zinc-900/60 backdrop-blur-3xl rounded-2xl border border-white/5 p-4 shadow-2xl">
                  <textarea
                    ref={captionRef}
                    value={caption}
                    onChange={(e) => {
                      setCaption(e.target.value);
                      const last = e.target.value.split(/\s/).pop();
                      if(last?.startsWith("@") && last.length > 1) {
                        supabase.from("profiles").select("username").ilike("username", `${last.substring(1)}%`).limit(5).then(({data}) => setSearchResults(data || []));
                        setShowTagSearch(true);
                      } else setShowTagSearch(false);
                    }}
                    placeholder="Describe your creation... #studio"
                    className="w-full bg-transparent border-none focus:ring-0 text-[13px] p-0 resize-none max-h-20 leading-relaxed placeholder:text-zinc-600 no-scrollbar font-medium"
                    rows={2}
                  />
                  {showTagSearch && searchResults.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden mb-2 shadow-2xl">
                    {searchResults.map(res => (
                      <button key={res.username} onClick={() => applyTag(res.username)} className="w-full p-4 text-left text-xs font-bold border-b border-white/5 active:bg-zinc-800 transition-colors">@{res.username}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CONFIRM MODAL */}
        {showConfirmModal && (
          <div className="absolute inset-0 z-50 bg-[#050506]/95 backdrop-blur-2xl p-8 flex flex-col justify-center animate-in fade-in duration-300">
            <div className="w-full space-y-8">
              <div className="space-y-2 text-center">
                <ShieldAlert className="mx-auto text-red-600 mb-2" size={32} />
                <h2 className="text-lg font-black uppercase tracking-[0.2em]">Publishing</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Final review</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                  <PrivacyBtn active={privacy === "public"} onClick={() => setPrivacy("public")} icon={<Globe size={14}/>} label="Public" />
                  <PrivacyBtn active={privacy === "followers"} onClick={() => setPrivacy("followers")} icon={<Users size={14}/>} label="Friends" />
                  <PrivacyBtn active={privacy === "private"} onClick={() => setPrivacy("private")} icon={<Lock size={14}/>} label="Private" />
              </div>

              <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5 space-y-4">
                <button onClick={() => setAgreedToTerms(!agreedToTerms)} className="flex items-center gap-4 w-full text-left">
                  <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center flex-shrink-0 ${agreedToTerms ? 'bg-red-600 border-red-600' : 'border-zinc-700 bg-black'}`}>
                    {agreedToTerms && <Check size={14} className="text-white" />}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-300 uppercase leading-tight tracking-tighter">
                    I own this content and respect platform rules.
                  </span>
                </button>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button onClick={handlePost} disabled={!agreedToTerms || loading} className="w-full py-4 rounded-2xl bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.3em] disabled:opacity-10 active:scale-95 transition-all shadow-[0_15px_30px_rgba(220,38,38,0.2)]">
                  {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Publish Now"}
                </button>
                <button onClick={() => setShowConfirmModal(false)} className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Back</button>
              </div>
            </div>
          </div>
        )}

        {loading && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 z-50 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
        )}
      </div>

      {/* TEXT EDITOR */}
      {isEditingText && (
        <div className="fixed inset-0 z-50 bg-black/98 backdrop-blur-3xl p-10 flex flex-col items-center justify-center animate-in zoom-in-95">
            <button onClick={() => setIsEditingText(false)} className="absolute top-10 right-10 p-3 bg-zinc-900 rounded-full border border-white/5"><X size={24}/></button>
            <textarea autoFocus value={overlayText} onChange={(e) => setOverlayText(e.target.value)} placeholder="ENTER HEADLINE" className="w-full bg-transparent border-none focus:ring-0 text-5xl font-black text-center uppercase italic tracking-tighter" />
            <button onClick={() => setIsEditingText(false)} className="mt-12 bg-white text-black px-12 py-3 rounded-full font-black text-[11px] uppercase tracking-widest transition-all active:scale-95">Apply</button>
        </div>
      )}

      {/* FILTER DRAWER */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
           <div className="absolute inset-0 bg-black/60" onClick={() => setShowFilters(false)} />
           <div className="relative w-full lg:max-w-[400px] bg-[#0c0c0d] rounded-t-[2.5rem] p-8 pt-4 border-t border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-400">
              <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto mb-8 opacity-40" />
              <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar snap-x px-2">
                  {FILTERS.map((f) => (
                      <button key={f.name} onClick={() => {setActiveFilter(f); setShowFilters(false);}} className="flex-shrink-0 flex flex-col items-center gap-3 snap-center group">
                          <div className={`w-20 h-20 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${activeFilter.name === f.name ? 'border-red-600 scale-110 shadow-xl shadow-red-600/10' : 'border-transparent opacity-30 group-hover:opacity-100'}`}>
                              {preview && <img src={preview} className="w-full h-full object-cover rounded-xl" style={{ filter: f.class }} />}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${activeFilter.name === f.name ? 'text-red-600' : 'text-zinc-600'}`}>{f.name}</span>
                      </button>
                  ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function ToolBtn({ icon, label, onClick }: { icon: any, label: string, onClick?: (e: any) => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 active:scale-75 transition-all group">
      <div className="w-12 h-12 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-center shadow-2xl group-hover:bg-red-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <span className="text-[8px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 text-zinc-400 group-hover:text-white transition-opacity">{label}</span>
    </button>
  );
}

function PrivacyBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${active ? 'bg-white text-black border-white' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}>
      {icon}
      <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  )
}
