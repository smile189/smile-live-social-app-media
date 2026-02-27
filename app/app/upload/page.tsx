/**
 * app/app/upload/page.tsx - Official Production Module
 * SMILE LIVE - High Priority Transmission (Mobile Optimized)
 * Fully Responsive | Corporate UX | Supabase SSR Integrated
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { 
  X, ChevronLeft, Upload, Shield, Send, Loader2, Globe, Zap, 
  Sparkles
} from "lucide-react";

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Inițializare client Supabase stabilă
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

  // Verificare sesiune utilizator
  useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push("/app/login");
      } else {
        setUser(currentUser);
      }
    };
    getUser();
  }, [supabase, router]);

  const handlePost = async () => {
    if (!file || !user) return;
    setLoading(true);
    
    try {
      // 1. Simulare progres vizual
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 5 : prev));
      }, 150);

      // 2. Pregătire fișier (Nume unic pentru a evita conflictele de cache)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 3. Upload în bucket-ul 'posts'
      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(filePath, file, { 
          cacheControl: '3600', 
          upsert: false 
        });

      if (uploadError) throw uploadError;

      // 4. GENERARE URL PUBLIC (CRITIC: Aceasta face poza vizibilă în feed)
      const { data: urlData } = supabase.storage
        .from("posts")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 5. Inserare metadate în Tabelul public.posts
      const { error: dbError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          caption: caption,
          thumbnail_url: publicUrl, // Salvăm URL-ul complet, nu doar calea
        });

      if (dbError) throw dbError;

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Navigare către feed după succes
      setTimeout(() => {
        router.push("/app");
        router.refresh();
      }, 1000);
      
    } catch (err: any) {
      console.error("Transmission failed", err);
      alert("Error: " + err.message);
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col font-sans text-white overflow-hidden">
      
      {/* HEADER: EXECUTIVE BLUR */}
      <header className="flex justify-between items-center px-4 py-5 border-b border-white/[0.05] bg-black/80 backdrop-blur-2xl z-50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-zinc-400 active:scale-90 transition">
          <ChevronLeft size={28} />
        </button>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_#eab308]" />
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-zinc-200">Production Studio</span>
          </div>
          <span className="text-[8px] text-zinc-500 font-mono tracking-widest mt-1 uppercase">Transmission Unit</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
           <Globe size={10} className="text-zinc-500" />
           <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Global</span>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col md:flex-row bg-[#030303]">
        
        {/* MEDIA PREVIEW: 9:16 ASPECT */}
        <section className="w-full md:flex-1 p-6 md:p-12 flex items-center justify-center">
          <div className="relative w-full aspect-[9/16] max-w-[340px] md:max-w-[380px] shadow-[0_0_80px_rgba(0,0,0,1)]">
            {preview ? (
              <div className="w-full h-full rounded-[2.5rem] border border-white/10 overflow-hidden relative group animate-in fade-in zoom-in-95 duration-700">
                <img src={preview} className="w-full h-full object-cover" alt="Visual Asset" />
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
                <div className="p-6 rounded-[2rem] bg-zinc-900 border border-white/5 group-hover:border-yellow-500/50 transition-colors shadow-2xl">
                  <Upload size={32} className="text-zinc-600 group-hover:text-yellow-500 transition-colors" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Attach Media</p>
                  <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest italic">Signal Quality: High</p>
                </div>
              </button>
            )}
            <input 
              type="file" 
              hidden 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={(e) => {
                const f = e.target.files?.[0];
                if(f) { 
                  setFile(f); 
                  setPreview(URL.createObjectURL(f)); 
                }
              }} 
            />
          </div>
        </section>

        {/* INPUT CONTROLS SECTION */}
        <section className="w-full md:w-[420px] bg-black p-8 md:p-12 space-y-12 border-t md:border-l border-white/[0.05]">
          
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-2">
              <Sparkles size={12} className="text-yellow-500" /> Narrative Caption
            </label>
            <textarea 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's your story today?"
              className="w-full bg-transparent border-none focus:ring-0 text-xl md:text-2xl font-medium text-white placeholder-zinc-800 resize-none min-h-[140px] p-0 leading-snug"
            />
          </div>

          {/* TECH BADGES */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-[1.8rem] bg-zinc-900/30 border border-white/[0.03] space-y-3">
              <Zap size={16} className="text-yellow-500" />
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Processing</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Instant Sync</p>
              </div>
            </div>
            <div className="p-5 rounded-[1.8rem] bg-zinc-900/30 border border-white/[0.03] space-y-3">
              <Shield size={16} className="text-zinc-500" />
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Encryption</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase">End-to-End</p>
              </div>
            </div>
          </div>

          {/* ACTION: BROADCAST */}
          <div className="pt-6">
            <button 
              onClick={handlePost}
              disabled={loading || !file}
              className={`
                w-full relative overflow-hidden py-5 md:py-6 rounded-3xl transition-all active:scale-[0.97]
                ${loading ? 'bg-zinc-900 cursor-not-allowed' : 'bg-white hover:bg-zinc-100 group shadow-[0_20px_50px_rgba(255,255,255,0.05)]'}
              `}
            >
              {/* Progress Overlay */}
              {loading && (
                <div 
                  className="absolute inset-0 bg-yellow-500/20 transition-all duration-300 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                />
              )}

              <div className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin text-yellow-500" />
                    <span className="text-yellow-500 font-black text-xs uppercase tracking-[0.3em]">
                      {uploadProgress < 95 ? `Uploading ${uploadProgress}%` : 'Finalizing...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-black font-black text-xs uppercase tracking-[0.4em]">Broadcast Now</span>
                    <Send size={16} className="text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
            
            <p className="text-center mt-8 text-[8px] font-black uppercase tracking-[0.6em] text-zinc-700">
              Smile Live Network Protocol V.2.6
            </p>
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
