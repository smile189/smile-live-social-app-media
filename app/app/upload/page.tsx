/**
 * author@ BM 
 * project@ smile live upload story page 
 * watermark@ SM-LIVE-APP-2026-PROD-FULL-CODE-FINAL
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
      const { data } = await supabase.from("profiles").select("id, username, avatar_url").ilike("username", `${query}%`).limit(5);
      setSearchResults(data || []);
    } else {
      setShowTagSearch(false);
    }
  };

  const applyTag = (username: string) => {
    const words = caption.split(/\s/);
    words.pop();
    setCaption([...words, `@${username} `].join(" "));
    setShowTagSearch(false);
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

    // 👇 ADAUGĂ ASTA - generează thumbnail din video
    let thumbnailUrl = null;
    if (fileType === "video") {
      thumbnailUrl = await new Promise<string | null>((resolve) => {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.currentTime = 1;
        video.muted = true;
        video.onloadeddata = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext("2d")?.drawImage(video, 0, 0);
          canvas.toBlob(async (blob) => {
            if (!blob) return resolve(null);
            const thumbName = `${user.id}/thumb_${crypto.randomUUID()}.jpg`;
            await supabase.storage.from("posts").upload(thumbName, blob, { contentType: "image/jpeg" });
            const { data: thumbUrl } = supabase.storage.from("posts").getPublicUrl(thumbName);
            resolve(thumbUrl.publicUrl);
          }, "image/jpeg", 0.85);
        };
        video.onerror = () => resolve(null);
        video.load();
      });
    }

    await supabase.from("posts").insert({
      user_id: user.id, caption, type: fileType,
      video_url: fileType === "video" ? urlData.publicUrl : null,
      thumbnail_url: fileType === "image" ? urlData.publicUrl : thumbnailUrl, // 👈 modificat
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
    <div className="fixed inset-0 bg-black text-white flex flex-col font-sans overflow-hidden">
      
      {/* Uploading Animation */}
      {loading && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-md">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="10" fill="transparent" 
                strokeDasharray={502} strokeDashoffset={502 - (502 * uploadProgress) / 100}
                className="text-yellow-400 transition-all duration-300 stroke-round" />
            </svg>
            <div className="absolute flex flex-col items-center animate-pulse">
              <CloudUpload className="w-10 h-10 mb-2 text-yellow-400" />
              <span className="text-3xl font-black italic">{uploadProgress}%</span>
            </div>
          </div>
          <p className="mt-8 font-black tracking-widest text-xs uppercase text-yellow-400/60 italic">SMILE IS POSTING...</p>
        </div>
      )}

      {/* Top Header */}
      <div className="absolute top-0 w-full z-50">
        {isRecording && (
          <div className="h-1.5 bg-white/10 w-full overflow-hidden">
            <div className="h-full bg-red-600 transition-all duration-100" style={{ width: `${(recordTime / 60) * 100}%` }} />
          </div>
        )}
        <div className="flex justify-between items-center p-6">
          <button onClick={() => router.back()} className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 active:scale-90 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-3">
            {preview && (
              <>
                <button onClick={() => setShowFilters(!showFilters)} className={`p-3 rounded-full border border-white/10 transition-all ${showFilters ? 'bg-yellow-400 text-black' : 'bg-black/40 backdrop-blur-md'}`}>
                  <Sliders className="w-6 h-6" />
                </button>
                <button onClick={() => { setPreview(null); setFile(null); }} className="p-3 bg-red-500/20 text-red-500 rounded-full border border-red-500/30 active:scale-90 transition-all">
                  <Trash2 className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex items-center justify-center bg-zinc-950">
        {!preview ? (
          <video ref={liveVideoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror transform scale-x-[-1]" />
        ) : (
          <div className="w-full h-full relative">
            {fileType === "video" ? (
              <video src={preview} autoPlay loop playsInline muted={isMuted} className="w-full h-full object-cover" style={{ filter: activeFilter.class }} />
            ) : (
              <img src={preview} className="w-full h-full object-cover" style={{ filter: activeFilter.class }} />
            )}
            <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-44 right-6 p-4 bg-black/40 backdrop-blur-md rounded-full border border-white/10 z-50 active:scale-90 transition-all">
              {isMuted ? <VolumeX className="w-6 h-6 text-yellow-400" /> : <Volume2 className="w-6 h-6 text-yellow-400" />}
            </button>
          </div>
        )}
      </div>

      {/* Reorganized Bottom UI */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent p-6 pb-12 space-y-6">
        
        {/* Caption & Post Section (Deasupra butoanelor) */}
        <div className="relative">
          <textarea
            ref={captionRef}
            value={caption}
            onChange={(e) => handleCaptionChange(e.target.value)}
            placeholder="Add a caption... Use @ to tag friends!"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 ring-yellow-400/40 min-h-[90px] resize-none backdrop-blur-md transition-all"
          />
          {showTagSearch && searchResults.length > 0 && (
            <div className="absolute bottom-full left-0 w-full mb-3 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
              {searchResults.map(u => (
                <button key={u.id} onClick={() => applyTag(u.username)} className="w-full p-4 flex items-center gap-3 hover:bg-white/5 border-b border-white/5 last:border-none text-left">
                  <div className="w-9 h-9 bg-zinc-800 rounded-full border border-white/10 overflow-hidden" />
                  <span className="text-sm font-bold text-white">@{u.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls Section (La bază) */}
        <div className="flex items-center justify-between gap-6 px-2">
          {/* Galerie Button */}
          <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 group">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 active:scale-90 transition-all hover:bg-white/20">
              <ImageIcon className="w-7 h-7 text-white" />
            </div>
          </button>

          {/* Record / Publish Button */}
          {!preview ? (
            <button 
              onClick={isRecording ? stopRecording : startRecording} 
              className={`relative w-22 h-22 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${isRecording ? 'border-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'border-white hover:scale-105 active:scale-95'}`}
            >
              <div className={`transition-all duration-300 ${isRecording ? 'w-10 h-10 bg-red-500 rounded-lg shadow-inner' : 'w-16 h-16 bg-red-500 rounded-full'}`} />
            </button>
          ) : (
            <button 
              onClick={() => setShowConfirmModal(true)}
              className="flex-1 h-16 bg-yellow-400 text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-yellow-400/20"
            >
              Publish <Send className="w-5 h-5" />
            </button>
          )}

          {/* VU Metru Galben Minimalist */}
          <div className="w-8 h-12 flex flex-col-reverse gap-[2px] items-center justify-center group">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((seg) => (
              <div 
                key={seg}
                className={`w-full h-1 rounded-full transition-all duration-150 ${
                  audioLevel > (seg * 12.5) ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)] opacity-100' : 'bg-white/10 opacity-30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hidden File Input with 60s Validation */}
      <input 
        type="file" 
        ref={fileInputRef} 
        hidden 
        accept="video/*,image/*" 
        onChange={(e) => {
          const f = e.target.files?.[0];
          if(!f) return;
          if(f.type.startsWith("video")) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
              window.URL.revokeObjectURL(video.src);
              if (video.duration > 61) { setErrorToast("The video is too long (max 60s)"); return; }
              setFile(f); setFileType("video"); setPreview(URL.createObjectURL(f));
            };
            video.src = URL.createObjectURL(f);
          } else { setFile(f); setFileType("image"); setPreview(URL.createObjectURL(f)); }
        }} 
      />

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/98 z-[110] flex items-center justify-center p-8 backdrop-blur-xl">
          <div className="bg-zinc-900 border border-white/10 rounded-[40px] p-10 w-full max-w-sm text-center shadow-3xl">
            <ShieldAlert className="w-14 h-14 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]" />
            <h2 className="text-2xl font-black mb-4 uppercase italic tracking-tight text-white">Are you ready?</h2>
            <p className="text-white/40 text-[10px] mb-8 leading-relaxed uppercase font-bold tracking-widest px-4">Your post will be visible on Smile Live Stories.</p>
            <label className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 mb-8 cursor-pointer active:scale-95 transition-all">
              <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-6 h-6 rounded-lg accent-yellow-400" />
              <span className="text-[10px] font-black text-left text-white/60 uppercase tracking-tighter">I am the author and accept the community smileliveapp.com guidelines.</span>
            </label>
            <div className="flex flex-col gap-3">
              <button onClick={() => {setShowConfirmModal(false); handlePost();}} disabled={!agreedToTerms || loading} className="w-full py-4.5 bg-yellow-400 text-black rounded-2xl font-black uppercase text-xs shadow-lg shadow-yellow-400/20 active:scale-95 transition-all">Confirm & Publish</button>
              <button onClick={() => setShowConfirmModal(false)} className="w-full py-4 text-white/20 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">Edit </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Sheet */}
      {showFilters && preview && (
        <div className="fixed inset-0 z-[120] bg-black/60 flex items-end">
          <div className="w-full bg-zinc-950 rounded-t-[40px] p-8 border-t border-white/10 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 italic">Smile Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5 text-white" /></button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
              {FILTERS.map(f => (
                <button key={f.name} onClick={() => setActiveFilter(f)} className="flex flex-col items-center gap-3 min-w-[85px] group">
                  <div className={`w-18 h-18 rounded-2xl border-2 transition-all ${activeFilter.name === f.name ? 'border-yellow-400 scale-110 shadow-lg shadow-yellow-400/20' : 'border-transparent opacity-60 group-hover:opacity-100'}`} style={{ filter: f.class, background: '#111' }} />
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${activeFilter.name === f.name ? 'text-yellow-400' : 'text-zinc-600'}`}>{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Error */}
      {errorToast && (
        <div className="fixed top-24 left-8 right-8 bg-red-600 text-white p-4 rounded-2xl flex items-center gap-4 z-[130] animate-bounce shadow-2xl">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="text-xs font-black uppercase tracking-[0.1em]">{errorToast}</p>
        </div>
      )}
    </div>
  );
}
