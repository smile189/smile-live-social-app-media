/**
 * app/app/upload/page.tsx - Official Production Module
 * SMILE LIVE - High Priority Transmission (Mobile Optimized)
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { 
  X, ChevronLeft, Image as ImageIcon, 
  Upload, Shield, Send, Loader2, Globe, Zap, 
  Sparkles, Info, CheckCircle2
} from "lucide-react";

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [user, setUser] = useState<any>(null);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/app/login");
      else setUser(user);
    };
    getUser();
  }, [supabase, router]);

  const handlePost = async () => {
    if (!file || !user) return;
    setLoading(true);
    
    try {
      // 1. Simulare progres pentru feedback vizual corporate
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 100);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("posts").getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("posts").insert({
        user_id: user.id,
        caption: caption,
        thumbnail_url: publicUrl,
      });

      if (dbError) throw dbError;

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Delay scurt pentru a vedea succesul pe mobil
      setTimeout(() => {
        router.push("/app");
        router.refresh();
      }, 800);
      
    } catch (err: any) {
      alert("Transmission failed: " + err.message);
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col font-sans text-white overflow-hidden">
      
      {/* HEADER: ADAPTIVE BLUR */}
      <header className="flex justify-between items-center px-4 py-5 border-b border-white/[0.05] bg-black/80 backdrop-blur-2xl z-50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-zinc-400 active:scale-90 transition">
          <ChevronLeft size={28} />
        </button>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-zinc-200">Production Studio</span>
          </div>
          <span className="text-[8px] text-zinc-500 font-mono tracking-widest mt-1">SMILE-SYS-V2</span>
        </div>

        <div className="p-2 -mr-2 opacity-0 pointer-events-none">
          <ChevronLeft size={28} />
        </div>
      </header>

      {/* BODY: SCROLLABLE WITH HIDDEN SCROLLBAR */}
      <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col md:flex-row bg-[#030303]">
        
        {/* PREVIEW: DYNAMIC SIZING */}
        <section className="w-full md:flex-1 p-4 md:p-10 flex items-center justify-center">
          <div className="relative w-full aspect-[9/16] max-w-[360px] md:max-w-[400px] shadow-[0_0_100px_rgba(0,0,0,1)]">
            {preview ? (
              <div className="w-full h-full rounded-[2.5rem] border border-white/10 overflow-hidden relative group">
                <img src={preview} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" alt="Preview" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <button 
                  onClick={() => {setFile(null); setPreview(null); setUploadProgress(0);}} 
                  className="absolute top-5 right-5 p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/20 active:scale-75 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="w-full h-full rounded-[2.5rem] border-2 border-dashed border-white/5 bg-zinc-900/10 flex flex-col items-center justify-center gap-6 hover:bg-zinc-900/20 active:bg-zinc-900/40 transition-all group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full group-hover:bg-yellow-500/40 transition" />
                  <div className="relative p-6 rounded-[2rem] bg-zinc-900 border border-white/10">
                    <Upload size={32} className="text-zinc-500 group-hover:text-yellow-500 transition-colors" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Import Asset</p>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic">High Fidelity Only</p>
                </div>
              </button>
            )}
            <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0];
              if(f) { setFile(f); setPreview(URL.createObjectURL(f)); }
            }} />
          </div>
        </section>

        {/* CONTROLS: FIXED ON MOBILE IF NEEDED, BUT HERE SCROLLABLE */}
        <section className="w-full md:w-[420px] bg-black p-6 md:p-12 space-y-10 border-t md:border-l border-white/[0.05]">
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-2">
                <Sparkles size={12} className="text-yellow-500" /> Narrative
              </label>
              <span className="text-[9px] font-mono text-zinc-700">{caption.length}/500</span>
            </div>
            <textarea 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's the story behind this transmission?"
              className="w-full bg-transparent border-none focus:ring-0 text-xl md:text-2xl font-medium text-white placeholder-zinc-800 resize-none min-h-[120px] p-0"
              maxLength={500}
            />
          </div>

          {/* REAL-TIME DATA CARDS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-3xl bg-zinc-900/20 border border-white/[0.03] flex flex-col gap-3">
              <Globe size={16} className="text-zinc-500" />
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Visibility</p>
                <p className="text-[10px] font-bold text-zinc-300">Global Stream</p>
              </div>
            </div>
            <div className="p-4 rounded-3xl bg-zinc-900/20 border border-white/[0.03] flex flex-col gap-3">
              <Shield size={16} className="text-zinc-500" />
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Security</p>
                <p className="text-[10px] font-bold text-zinc-300">Encrypted</p>
              </div>
            </div>
          </div>

          {/* BROADCAST BUTTON */}
          <div className="pt-4">
            <button 
              onClick={handlePost}
              disabled={loading || !file}
              className={`
                w-full relative overflow-hidden py-5 md:py-6 rounded-[1.5rem] transition-all active:scale-[0.98]
                ${loading ? 'bg-zinc-900' : 'bg-white hover:bg-yellow-400 group'}
                disabled:opacity-20 disabled:grayscale
              `}
            >
              {/* Progress Bar Background */}
              {loading && (
                <div 
                  className="absolute inset-0 bg-yellow-500/20 transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              )}

              <div className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin text-yellow-500" />
                    <span className="text-yellow-500 font-black text-xs uppercase tracking-[0.3em]">
                      {uploadProgress < 100 ? `Transmitting ${uploadProgress}%` : 'Finalizing...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-black font-black text-xs uppercase tracking-[0.4em]">Broadcast Transmission</span>
                    <Send size={18} className="text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
            

          </div>
        </section>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
