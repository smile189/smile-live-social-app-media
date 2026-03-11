/**
 * author@ BM 
 * project@ smile live upload story page 
 * watermark@ SM-LIVE-APP-2026-PROD-FULL-CODE-RESPONSIVE
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
  Mic, MicOff, Send, CloudUpload
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
          if (prev >= 60) { stopRecording(); return 60; }
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
        const videoFile = new File([blob], "smilestory.mp4", { type: "video/mp4" });
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
    } catch (err) { setErrorToast("Allow access to camera and microphone."); }
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
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => (prev < 95 ? prev + 2 : prev));
    }, 200);

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
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => router.push("/app"), 600);
    } catch (err: any) {
      clearInterval(progressInterval);
      setErrorToast(err.message);
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center font-sans overflow-hidden">
      
      {/* Upload Progress Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-md px-6">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="10" fill="transparent" 
                strokeDasharray={502} strokeDashoffset={502 - (502 * uploadProgress) / 100}
                className="text-white transition-all duration-300 stroke-round" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <CloudUpload className="w-10 h-10 mb-2 animate-bounce" />
              <span className="text-3xl font-black italic tracking-tighter">{uploadProgress}%</span>
            </div>
          </div>
          <p className="mt-8 font-bold tracking-[0.4em] text-xs uppercase animate-pulse">SMILE IS POSTING...</p>
        </div>
      )}

      {/* ProgressBar (Recording) */}
      {isRecording && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 z-50">
          <div className="h-full bg-red-600 transition-all duration-100" style={{ width: `${(recordTime / 60) * 100}%` }} />
        </div>
      )}

      {/* Main Container - Optimized Responsive */}
      <div className="w-full h-full max-w-lg mx-auto flex flex-col relative bg-zinc-950 sm:border-x border-white/5 shadow-2xl">
        
        {/* Header Navigation */}
        <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 sm:px-6 z-50">
          <button onClick={() => router.back()} className="p-2.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 active:scale-90 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex gap-2">
            {preview && (
              <>
                <button onClick={() => setShowFilters(!showFilters)} className={`p-2.5 rounded-full border border-white/10 transition-all ${showFilters ? 'bg-white text-black' : 'bg-black/40 backdrop-blur-xl'}`}>
                  <Sliders className="w-6 h-6" />
                </button>
                <button onClick={() => { setPreview(null); setFile(null); }} className="p-2.5 bg-red-500/20 text-red-500 rounded-full border border-red-500/30">
                  <Trash2 className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Viewport Area */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
          {!preview ? (
            <div className="w-full h-full relative">
              <video ref={liveVideoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror transform scale-x-[-1]" />
              
              <div className="absolute bottom-24 sm:bottom-28 w-full flex flex-col items-center gap-6 sm:gap-8 px-6">
                <div className="flex items-center gap-8 sm:gap-12">
                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 group">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 group-active:scale-90 transition-all">
                      <ImageIcon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Galery</span>
                  </button>

                  <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`relative w-24 h-24 rounded-full border-[6px] flex items-center justify-center transition-all duration-300 ${isRecording ? 'border-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-white hover:scale-105 active:scale-95'}`}
                  >
                    <div className={`transition-all duration-300 ${isRecording ? 'w-10 h-10 bg-red-500 rounded-lg' : 'w-18 h-18 bg-white rounded-full'}`} />
                  </button>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center overflow-hidden">
                      <div className="w-full bg-white transition-all duration-75" style={{ height: `${audioLevel}%` }} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Audio</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative group">
              {fileType === "video" ? (
                <video 
                  src={preview} 
                  autoPlay 
                  loop 
                  playsInline 
                  muted={isMuted} 
                  className="w-full h-full object-cover transition-all duration-500" 
                  style={{ filter: activeFilter.class }} 
                />
              ) : (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover transition-all duration-500" 
                  style={{ filter: activeFilter.class }} 
                />
              )}
              
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className="absolute bottom-8 right-6 p-4 bg-black/50 backdrop-blur-md rounded-full border border-white/10 shadow-xl active:scale-90 transition-all"
              >
                {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
              </button>
            </div>
          )}
        </div>

        {/* Caption & Publish Area */}
        <div className="bg-zinc-950 p-6 pb-8 sm:pb-12 border-t border-white/5">
          <div className="relative mb-6">
            <textarea
              ref={captionRef}
              value={caption}
              onChange={(e) => handleCaptionChange(e.target.value)}
              placeholder="Write a caption... Use @ to tag friends!"
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 ring-white/10 min-h-[100px] resize-none"
            />
            
            {showTagSearch && searchResults.length > 0 && (
              <div className="absolute bottom-full left-0 w-full mb-3 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                {searchResults.map((res) => (
                  <button 
                    key={res.id} 
                    onClick={() => applyTag(res.username)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-white/5 border-b border-white/5 last:border-none transition-colors text-left"
                  >
                    <div className="w-9 h-9 bg-zinc-800 rounded-full border border-white/10 overflow-hidden">
                       {res.avatar_url && <img src={res.avatar_url} className="w-full h-full object-cover" />}
                    </div>
                    <span className="font-bold text-sm text-white">@{res.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            disabled={!file || loading}
            onClick={() => setShowConfirmModal(true)}
            className="w-full py-4 sm:py-5 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 disabled:opacity-20 active:scale-[0.98] transition-all shadow-xl shadow-white/5"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Post smile now <Send className="w-4 h-4" /></>}
          </button>
        </div>
      </div>

      {/* Hidden File Input with 60s Validation */}
      <input 
        type="file" 
        ref={fileInputRef} 
        hidden 
        accept="video/*,image/*" 
        onChange={(e) => {
          const f = e.target.files?.[0]; // FIXED: Access index 0
          if(!f) return;

          if (f.type.startsWith("video")) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
              window.URL.revokeObjectURL(video.src);
              if (video.duration > 61) {
                setErrorToast("The video is too long (max 60s)");
                return;
              }
              setFile(f); 
              setFileType("video"); 
              setPreview(URL.createObjectURL(f));
            };
            video.src = URL.createObjectURL(f);
          } else {
            setFile(f); 
            setFileType("image"); 
            setPreview(URL.createObjectURL(f));
          }
        }} 
      />

      {/* Filter Overlay */}
      {showFilters && preview && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-end">
          <div className="w-full bg-zinc-900 rounded-t-[40px] p-8 border-t border-white/10 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 italic">Artistic Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {FILTERS.map((f) => (
                <button 
                  key={f.name} 
                  onClick={() => setActiveFilter(f)}
                  className="flex flex-col items-center gap-3 min-w-[80px]"
                >
                  <div className={`w-16 h-16 rounded-2xl border-2 transition-all ${activeFilter.name === f.name ? 'border-white scale-110 shadow-lg shadow-white/10' : 'border-transparent'}`} style={{ filter: f.class, background: '#222' }} />
                  <span className={`text-[10px] font-bold ${activeFilter.name === f.name ? 'text-white' : 'text-zinc-500'}`}>{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-zinc-900 border border-white/10 rounded-[40px] p-8 sm:p-10 w-full max-w-sm text-center shadow-3xl">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20 animate-pulse">
              <ShieldAlert className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-black mb-2 uppercase italic tracking-tighter text-white">Are you sure?</h2>
            <p className="text-white/40 text-[11px] mb-8 leading-relaxed px-4 uppercase font-bold tracking-widest">Your post will be visible on Smile Live</p>
            
            <label className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 mb-8 cursor-pointer active:scale-95 transition-all text-left">
              <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-6 h-6 rounded-lg accent-white" />
              <span className="text-[10px] font-black uppercase text-white/60 leading-tight">I agree to the terms and conditions of smileliveapp.com platform</span>
            </label>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setShowConfirmModal(false); handlePost(); }} 
                disabled={!agreedToTerms || loading} 
                className="w-full py-4.5 bg-yellow-500 text-black rounded-2xl font-black uppercase text-xs shadow-xl shadow-white/10 active:scale-95 transition-all"
              >
               Confirm and Post
              </button>
              <button onClick={() => setShowConfirmModal(false)} className="w-full py-4 text-white/30 font-bold text-xs uppercase tracking-[0.2em]">Edit again</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorToast && (
        <div className="fixed top-24 left-6 right-6 bg-red-600 text-white p-4 rounded-2xl flex items-center gap-4 z-[110] shadow-2xl animate-bounce">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="text-xs font-black uppercase tracking-widest">{errorToast}</p>
        </div>
      )}

    </div>
  );
}
