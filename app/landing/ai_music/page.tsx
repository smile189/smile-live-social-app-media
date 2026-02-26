"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowRight, CheckCircle, Music, Zap, FileText, Send, ArrowLeft } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";

const BASE_PRICE = 50;

export default function SunoServicePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

  const [form, setForm] = useState({
    nume_piesa: "",
    email_client: "",
    genre: "Pop",
    mood: "Happy",
    vocal_gender: "Female",
    sursa_text: "ai",
    continut_text: "",
    urgent: false,   // +20€
    extended: false, // +15€
  });

  // Calculator Real-time
  const total = useMemo(() => {
    return BASE_PRICE + (form.urgent ? 20 : 0) + (form.extended ? 15 : 0);
  }, [form.urgent, form.extended]);

  const handleSubmit = async () => {
    if (!form.email_client.includes("@")) return alert("Please enter a valid email!");
    
    setLoading(true);
    const { error } = await supabase.from("cereri_muzica").insert([
      { 
        ...form,
        pret_total: total,
        status: "primita"
      }
    ]);

    if (!error) {
      setShowThanks(true);
      setTimeout(() => {
        window.open('https://revolut.me/smile89', '_blank');
      }, 3000);
    } else {
      console.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060608] text-white overflow-hidden font-sans">
      
      {/* --- SUNO DYNAMIC BACKGROUND (FULL PAGE) --- */}
      <div className="fixed inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-orange-600 rounded-full blur-[160px]" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-yellow-500 rounded-full blur-[140px]" 
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* --- CONTENT --- */}
      <div className="relative z-10 container mx-auto px-6 py-20 min-h-screen flex flex-col items-center">
        
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none mb-4">
            neuromusic <span className="text-orange-500"></span>
          </h1>
          <p className="text-zinc-500 font-bold tracking-[0.4em] uppercase text-sm">SmileLive AI Music Studio</p>
        </motion.div>

        {!showThanks ? (
          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* LEFT: PROGRESS & DETAILS (4 COLS) */}
            <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
                <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-6">Order Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Base Production</span>
                    <span className="font-bold">50€</span>
                  </div>
                  {form.urgent && (
                    <div className="flex justify-between text-sm text-orange-400">
                      <span>Urgent Delivery</span>
                      <span className="font-bold">+20€</span>
                    </div>
                  )}
                  {form.extended && (
                    <div className="flex justify-between text-sm text-orange-400">
                      <span>Extended Duration</span>
                      <span className="font-bold">+15€</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="text-lg font-bold italic tracking-tighter uppercase">Total</span>
                    <span className="text-4xl font-black text-white">{total}€</span>
                  </div>
                </div>
              </div>

              <div className="px-4 text-zinc-500 text-xs leading-relaxed italic">
                * Our AI models  generate high-fidelity tracks based on your unique sound. Delivery via email.
              </div>
            </div>

            {/* RIGHT: THE FORM (8 COLS) */}
            <div className="lg:col-span-8 order-1 lg:order-2">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-black font-black italic">01</div>
                      <h2 className="text-3xl font-bold uppercase italic tracking-tighter">The Identity</h2>
                    </div>
                    <input 
                      placeholder="SONG TITLE..." 
                      className="w-full bg-white/5 border border-white/10 p-8 rounded-[1.5rem] outline-none focus:border-orange-500 transition-all text-2xl font-bold uppercase tracking-tighter"
                      onChange={(e) => setForm({...form, nume_piesa: e.target.value})} 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl outline-none font-bold uppercase text-xs" onChange={(e) => setForm({...form, genre: e.target.value})}>
                        {['Pop', 'Rock', 'Techno', 'Phonk', 'Jazz', 'Phonk', 'Trapanele', 'Deep', 'Manele', 'Afro', 'other'].map(g => <option key={g} className="bg-zinc-900">{g}</option>)}
                      </select>
                      <select className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl outline-none font-bold uppercase text-xs" onChange={(e) => setForm({...form, vocal_gender: e.target.value})}>
                        {['Female', 'Male', 'Duo', 'Cyber'].map(v => <option key={v} className="bg-zinc-900">{v}</option>)}
                      </select>
                    </div>
                    <button onClick={() => setStep(2)} className="w-full py-6 bg-white text-black font-black rounded-2xl hover:bg-orange-500 transition-all active:scale-[0.98] uppercase tracking-widest italic text-sm">Continue Construction</button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-black font-black italic">02</div>
                      <h2 className="text-3xl font-bold uppercase italic tracking-tighter">Sound delivery</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className={`flex items-center justify-between p-6 rounded-2xl border cursor-pointer transition-all ${form.urgent ? "bg-orange-500 border-orange-500 text-black" : "bg-white/5 border-white/10"}`}>
                        <span className="font-bold uppercase text-xs tracking-widest">Urgent (2h)</span>
                        <input type="checkbox" className="hidden" onChange={(e) => setForm({...form, urgent: e.target.checked})} />
                        <Zap size={20} fill={form.urgent ? "black" : "none"} />
                      </label>
                      <label className={`flex items-center justify-between p-6 rounded-2xl border cursor-pointer transition-all ${form.extended ? "bg-orange-500 border-orange-500 text-black" : "bg-white/5 border-white/10"}`}>
                        <span className="font-bold uppercase text-xs tracking-widest">Extended (4m+)</span>
                        <input type="checkbox" className="hidden" onChange={(e) => setForm({...form, extended: e.target.checked})} />
                        <Music size={20} fill={form.extended ? "black" : "none"} />
                      </label>
                    </div>

                    <div className="flex bg-white/5 p-2 rounded-2xl">
                      <button onClick={() => setForm({...form, sursa_text: 'ai'})} className={`flex-1 py-4 rounded-xl text-xs font-bold transition ${form.sursa_text === 'ai' ? 'bg-orange-500 text-black' : 'text-zinc-500'}`}>AI WRITER</button>
                      <button onClick={() => setForm({...form, sursa_text: 'client'})} className={`flex-1 py-4 rounded-xl text-xs font-bold transition ${form.sursa_text === 'client' ? 'bg-orange-500 text-black' : 'text-zinc-500'}`}>MY TEXT</button>
                    </div>

                    <textarea 
                      placeholder="Theme, story or full lyrics..." 
                      className="w-full bg-white/5 border border-white/10 p-8 rounded-[1.5rem] h-48 focus:border-orange-500 outline-none transition-all resize-none font-mono text-sm uppercase placeholder:opacity-20"
                      onChange={(e) => setForm({...form, continut_text: e.target.value})}
                    />
                    
                    <div className="flex gap-4">
                      <button onClick={() => setStep(1)} className="flex-1 py-6 bg-white/5 rounded-2xl font-bold uppercase text-xs border border-white/10 hover:bg-white/10 transition">Back</button>
                      <button onClick={() => setStep(3)} className="flex-1 py-6 bg-white text-black font-black rounded-2xl uppercase text-xs tracking-widest">To Delivery</button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-black font-black italic">03</div>
                      <h2 className="text-3xl font-bold uppercase italic tracking-tighter">Deployment</h2>
                    </div>

                    <input 
                      type="email" 
                      placeholder="YOUR@EMAIL.COM" 
                      className="w-full bg-white/5 border border-white/10 p-8 rounded-[1.5rem] text-center font-black text-2xl uppercase tracking-widest focus:border-orange-500 outline-none transition-all"
                      onChange={(e) => setForm({...form, email_client: e.target.value})}
                    />

                    <div className="flex gap-4">
                      <button onClick={() => setStep(2)} className="flex-1 py-6 bg-white/5 rounded-2xl font-bold uppercase text-xs border border-white/10">Back</button>
                      <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="flex-1 py-6 bg-[#0075eb] text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
                      >
                        {loading ? "PROCESING..." : <>Forge & Pay via Revolut <ArrowRight size={18} /></>}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
                <ChatWidget user={{ id: 'anonim', email: 'vizitator@smile.live' }} />
            </div>
          </div>
        ) : (
          /* THANKS VIEW (FULL PAGE) */
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center max-w-xl">
            <div className="w-32 h-32 bg-orange-500/20 border border-orange-500 text-orange-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(234,88,12,0.3)]">
              <CheckCircle size={60} strokeWidth={1.5} />
            </div>
            <h2 className="text-6xl font-black italic uppercase mb-4 tracking-tighter leading-none">Order <br/> <span className="text-orange-500 text-7xl">Forged!</span></h2>
            <p className="text-zinc-500 font-bold mb-12 uppercase text-xs tracking-[0.3em] leading-relaxed">
              We've saved your request. <br /> Redirecting to Revolut for secure payment...
            </p>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-12">
               <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3 }} className="h-full bg-orange-500" />
            </div>
            <button onClick={() => window.location.reload()} className="text-zinc-500 hover:text-white transition uppercase text-[10px] font-black tracking-widest underline decoration-orange-500/30">Start another production</button>
          </motion.div>
        )}


<Link href="/landing">
  <motion.div 
    whileHover={{ x: -5 }}
    className="fixed top-8 left-8 z-50 flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl hover:bg-orange-500 hover:text-black transition-all group cursor-pointer shadow-2xl"
  >
    <ArrowLeft size={18} className="text-orange-500 group-hover:text-black transition-colors" />
    <span className="text-[10px] font-black uppercase italic tracking-[0.2em]">
      Return Home
    </span>
  </motion.div>
</Link>

      </div>
    </div>
  );
}
