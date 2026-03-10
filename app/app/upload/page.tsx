/**
 * author@ BM 
 * project@ smile live upload story page 
 * description@ This is the upload page for the Smile Live app, where users can record or upload videos, apply filters,
 *  add captions with @tags, and share their stories. It features a TikTok-style recording interface with an audio visualizer,
 *  real-time tag search, and a confirmation modal before posting. The page is designed to be mobile-first and visually engaging, 
 * with smooth animations and a focus on user experience.
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { 
  X, ChevronLeft, Upload, Loader2, Play, Pause,
  Music, Type, Trash2, Hash, AtSign, Sliders, Plus, 
  Volume2, VolumeX, Check, ShieldAlert, Globe, Lock, Users,
  Smile, AlertCircle, Camera, Image as ImageIcon, Circle, RefreshCw,
  Mic, MicOff
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
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
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
  const [searchLoading, setSearchLoading] = useState(false);

  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  const [isEditingText, setIsEditingText] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [privacy, setPrivacy] = useState<"public" | "followers" | "private">("public");

  // Record States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null);
  const [recordTime, setRecordTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  // Audio Visualizer Logic
  useEffect(() => {
    let animationId: number;
    if (isRecording && analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const update = () => {
        analyserRef.current?.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        animationId = requestAnimationFrame(update);
      };
      update();
    }
    return () => cancelAnimationFrame(animationId);
  }, [isRecording]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordTime((prev) => {
          if (prev >= 120) { stopRecording(); return 120; }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) router.push("/app/login");
      else setUser(currentUser);
    };
    checkUser();
  }, [supabase, router]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setRecordingStream(stream);
      if (liveVideoRef.current) liveVideoRef.current.srcObject = stream;

      // Audio setup for visualizer
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/mp4" });
        const videoFile = new File([blob], "recorded.mp4", { type: "video/mp4" });
        setFile(videoFile);
        setFileType("video");
        setPreview(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        setRecordingStream(null);
        if (audioContextRef.current) audioContextRef.current.close();
      };
      recorder.start();
      setIsRecording(true);
      setRecordTime(0);
    } catch (err) { setErrorToast("Permite accesul la cameră și microfon."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCaptionChange = async (val: string) => {
    setCaption(val);
    const words = val.split(/\s/);
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith("@") && lastWord.length > 1) {
      const query = lastWord.slice(1);
      setShowTagSearch(true);
      setSearchLoading(true);
      const { data } = await supabase.from("profiles").select("id, username, avatar_url").ilike("username", `${query}%`).limit(5);
      setSearchResults(data || []);
      setSearchLoading(false);
    } else {
      setShowTagSearch(false);
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
    try {
      const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
      const filePath = `${user.id}/${fileName}`;
      await supabase.storage.from("posts").upload(filePath, file);
      const { data: urlData } = supabase.storage.from("posts").getPublicUrl(filePath);
      await supabase.from("posts").insert({
        user_id: user.id, caption, type: fileType,
        video_url: fileType === "video" ? urlData.publicUrl : null,
        thumbnail_url: fileType === "image" ? urlData.publicUrl : null,
      });
      router.push("/app");
    } catch (err: any) {
      setErrorToast(err.message);
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center font-sans overflow-hidden">
      
      {/* ProgressBar */}
      {isRecording && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 z-50 overflow-hidden">
          <div className="h-full bg-red-600 transition-all duration-1000 ease-linear" style={{ width: `${(recordTime / 120) * 100}%` }} />
        </div>
      )}

      <div className="relative w-full h-full lg:max-w-[400px] lg:h-[85vh] lg:rounded-[2.5rem] lg:border-[8px] lg:border-zinc-900 bg-black overflow-hidden shadow-2xl flex flex-col">
        
        {/* VIEWPORT */}
        <div className="absolute inset-0 z-0 bg-black">
          {!preview ? (
            <div className="relative w-full h-full flex items-center justify-center bg-[#111]">
              <video 
                ref={liveVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover scale-x-[-1] ${recordingStream ? 'opacity-100' : 'opacity-0'}`} 
              />
              {!recordingStream && (
                <div className="absolute flex flex-col items-center gap-4 text-center opacity-40">
                  <Camera size={48} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Camera Off</p>
                </div>
              )}

              {/* Audio Visualizer Bubbles */}
              {isRecording && (
                <div className="absolute bottom-32 flex items-end gap-1 h-12">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-red-500 rounded-full transition-all duration-75" 
                      style={{ height: `${Math.max(10, audioLevel * (0.5 + Math.random()))}%` }} 
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full relative" style={{ filter: activeFilter.class }}>
              {fileType === "video" ? (
                <video ref={videoRef} src={preview} poster={preview} className="w-full h-full object-cover" autoPlay loop muted={isMuted} playsInline />
              ) : ( <img src={preview} className="w-full h-full object-cover" alt="preview" /> )}
            </div>
          )}
        </div>

        {/* UI OVERLAY */}
        <div className="absolute inset-0 z-20 flex flex-col p-6 pointer-events-none justify-between">
          <header className="flex items-center justify-between pointer-events-auto">
            <button onClick={() => router.back()} className="p-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10"><X size={24} /></button>
            {isRecording && <div className="bg-red-600 px-3 py-1 rounded-full text-[10px] font-black animate-pulse uppercase">Recording {recordTime}s</div>}
            {preview && <button onClick={() => setShowConfirmModal(true)} className="px-6 py-2 bg-yellow-500 text-black rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">Next</button>}
          </header>

          {/* Record Button START/STOP (TikTok Style) */}
          {!preview && (
            <div className="flex flex-col items-center gap-6 mb-8 pointer-events-auto w-full">
              <div className="flex justify-around items-center w-full">
                 <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 opacity-80">
                    <div className="w-10 h-10 rounded-lg border-2 border-white/40 bg-black/40 flex items-center justify-center"><ImageIcon size={20} /></div>
                    <span className="text-[9px] font-bold">Import</span>
                    <input type="file" ref={fileInputRef} onChange={(e) => {
                      const f = e.target.files?.[0];
                      if(f) { setFile(f); setFileType(f.type.startsWith("video") ? "video" : "image"); setPreview(URL.createObjectURL(f)); }
                    }} hidden accept="video/*,image/*" />
                 </button>

                 <div className="relative flex items-center justify-center">
                    <button 
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-20 h-20 rounded-full border-[6px] flex items-center justify-center transition-all duration-300 ${isRecording ? 'border-white' : 'border-white/50'}`}
                    >
                      <div className={`transition-all duration-300 ${isRecording ? 'w-8 h-8 rounded-sm bg-red-600' : 'w-14 h-14 rounded-full bg-red-600'}`} />
                    </button>
                 </div>

                 <button className="flex flex-col items-center gap-1 opacity-80">
                    <div className="w-10 h-10 flex items-center justify-center"><RefreshCw size={24} /></div>
                    <span className="text-[9px] font-bold">Flip</span>
                 </button>
              </div>
            </div>
          )}

          {preview && (
            <div className="flex flex-col gap-4 items-end pointer-events-auto">
              <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
              <button onClick={() => setShowFilters(!showFilters)} className={`p-3 backdrop-blur-md rounded-2xl border border-white/10 ${showFilters ? 'bg-yellow-500 text-black' : 'bg-black/40'}`}><Sliders size={20} /></button>
              <button onClick={() => {setPreview(null); setFile(null);}} className="p-3 bg-red-500/20 backdrop-blur-md rounded-2xl border border-red-500/20 text-red-500"><Trash2 size={20} /></button>
            </div>
          )}
        </div>

        {/* MODAL POSTARE */}
        {showConfirmModal && (
          <div className="absolute inset-0 z-50 animate-in slide-in-from-bottom duration-500 flex flex-col pointer-events-auto bg-black">
             <div className="absolute inset-0 -z-10">
                {preview && <div className="absolute inset-0 opacity-40 blur-3xl scale-150" style={{ backgroundImage: `url(${preview})`, backgroundSize: 'cover' }} />}
             </div>
             <header className="p-6 flex items-center justify-between">
                <button onClick={() => setShowConfirmModal(false)} className="p-2 bg-white/10 rounded-full border border-white/10"><ChevronLeft size={24} /></button>
                <h2 className="text-[10px] font-black uppercase tracking-widest">Details</h2>
                <div className="w-10" />
             </header>
             <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar relative">
                <div className="flex flex-col gap-4 bg-white/[0.03] p-4 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl">
                  <div className="flex gap-4">
                    <div className="w-24 h-32 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-2xl">
                       <div className="w-full h-full" style={{ filter: activeFilter.class, backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    </div>
                    <textarea 
                      ref={captionRef}
                      placeholder="Add caption... use @tag" 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm h-32 resize-none text-white pt-2"
                      value={caption}
                      onChange={(e) => handleCaptionChange(e.target.value)}
                    />
                  </div>
                  {showTagSearch && (
                    <div className="w-full bg-zinc-900 border border-white/10 rounded-3xl mt-2 overflow-hidden shadow-2xl animate-in slide-in-from-top-2">
                      {searchResults.map((u) => (
                        <button key={u.id} onClick={() => applyTag(u.username)} className="w-full flex items-center gap-3 p-4 hover:bg-white/10 border-b border-white/5 last:border-0 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden">{u.avatar_url && <img src={u.avatar_url} className="w-full h-full object-cover" />}</div>
                          <p className="text-sm font-bold text-white">@{u.username}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <label className="flex items-start gap-4 p-3 cursor-pointer">
                  <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${agreedToTerms ? 'bg-yellow-500 border-yellow-500 text-black' : 'border-white/20'}`}>
                    {agreedToTerms && <Check size={14} strokeWidth={4} />}
                    <input type="checkbox" className="hidden" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight">Accept Community Rules.</p>
                </label>
             </div>
             <div className="p-8 mt-auto"><button onClick={handlePost} disabled={!agreedToTerms || loading} className={`w-full py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all transform active:scale-[0.97] ${agreedToTerms ? 'bg-yellow-500 text-black shadow-2xl shadow-yellow-500/20' : 'bg-white/5 text-zinc-600 border border-white/5'}`}>Share Story</button></div>
          </div>
        )}

        {/* Loader Upload */}
        {loading && (
          <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center">
             <Loader2 className="animate-spin text-yellow-500 mb-4" size={48} />
             <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-500">{uploadProgress}%</p>
          </div>
        )}
      </div>
      
      {/* Toast Notification */}
      {errorToast && (
        <div className="absolute top-10 z-[110] animate-in slide-in-from-top duration-500 w-[90%] max-w-[400px] pointer-events-none text-center">
          <div className="bg-black/80 backdrop-blur-2xl border border-white/10 p-4 rounded-[2rem] flex items-center gap-3 shadow-2xl">
            <AlertCircle className="text-yellow-500 shrink-0" size={20} />
            <p className="text-sm font-bold text-zinc-200">{errorToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
