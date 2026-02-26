"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowRight, CheckCircle, Music, Zap, ArrowLeft } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";

const BASE_PRICE = 50;

export default function SunoServicePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const initialForm = {
    nume_piesa: "",
    email_client: "",
    genre: "Pop",
    mood: "Happy",
    vocal_gender: "Female",
    sursa_text: "ai",
    continut_text: "",
    urgent: false,
    extended: false,
  };

  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

  const total = useMemo(() => {
    return BASE_PRICE + (form.urgent ? 20 : 0) + (form.extended ? 15 : 0);
  }, [form]);

  const resetProcess = () => {
    setForm(initialForm);
    setStep(1);
    setShowThanks(false);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.email_client.includes("@"))
      return alert("Please enter a valid email!");

    setLoading(true);

    const { error } = await supabase.from("cereri_muzica").insert([
      {
        ...form,
        pret_total: total,
        status: "primita",
      },
    ]);

    if (!error) {
      setShowThanks(true);
      setTimeout(() => {
        window.open("https://revolut.me/smile89", "_blank");
      }, 2500);
    } else {
      console.error(error.message);
      setLoading(false);
    }
  };

  return (
<div className="min-h-screen bg-[#09080d] text-white relative overflow-hidden">
  <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0c0420] to-[#020249]" />


      <div className="max-w-6xl mx-auto px-5 py-14">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tight">
            neuromusic
          </h1>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.3em] mt-3">
            SmileLive AI Music Studio
          </p>
        </div>

        {!showThanks ? (
          <div className="flex flex-col lg:flex-row gap-10">

            {/* FORM */}
            <div className="flex-1 space-y-8">

              <AnimatePresence mode="wait">

                {step === 1 && (
                  <motion.div
                    key="s1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold uppercase">
                      01 — The Identity
                    </h2>

                    <input
                      placeholder="SONG TITLE..."
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-xl text-lg outline-none focus:border-orange-500"
                      value={form.nume_piesa}
                      onChange={(e) =>
                        setForm({ ...form, nume_piesa: e.target.value })
                      }
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <select
                        className="bg-white/5 border border-white/10 p-4 rounded-xl"
                        value={form.genre}
                        onChange={(e) =>
                          setForm({ ...form, genre: e.target.value })
                        }
                      >
                        {["Pop","Rock","Techno","Phonk","Jazz","Trap","Deep","Afro","Other"].map((g) => (
                          <option key={g} className="bg-black">{g}</option>
                        ))}
                      </select>

                      <select
                        className="bg-white/5 border border-white/10 p-4 rounded-xl"
                        value={form.vocal_gender}
                        onChange={(e) =>
                          setForm({ ...form, vocal_gender: e.target.value })
                        }
                      >
                        {["Female","Male","Duo","Cyber"].map((v) => (
                          <option key={v} className="bg-black">{v}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      className="w-full py-4 bg-yellow-500 text-black font-bold rounded-xl active:scale-95 transition"
                    >
                      Continue
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="s2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold uppercase">
                      02 — Sound Delivery
                    </h2>

                    {/* Add-ons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className={`p-4 rounded-xl border cursor-pointer flex justify-between ${form.urgent ? "bg-red-500 text-black border-orange-500" : "bg-white/5 border-white/10"}`}>
                        Urgent (2h)
                        <input type="checkbox" hidden checked={form.urgent}
                          onChange={(e)=>setForm({...form, urgent:e.target.checked})}/>
                        <Zap size={18}/>
                      </label>

                      <label className={`p-4 rounded-xl border cursor-pointer flex justify-between ${form.extended ? "bg-orange-500 text-black border-orange-500" : "bg-white/5 border-white/10"}`}>
                        Extended (4m+)
                        <input type="checkbox" hidden checked={form.extended}
                          onChange={(e)=>setForm({...form, extended:e.target.checked})}/>
                        <Music size={18}/>
                      </label>
                    </div>

                    {/* AI vs Custom Lyrics */}
                    <div className="flex bg-white/5 p-1 rounded-xl">
                      <button
                        onClick={() => setForm({...form, sursa_text: "ai"})}
                        className={`flex-1 py-3 text-xs font-bold rounded-lg transition ${form.sursa_text === "ai" ? "bg-violet-500 text-black" : "text-zinc-400"}`}
                      >
                        AI WRITER
                      </button>

                      <button
                        onClick={() => setForm({...form, sursa_text: "client"})}
                        className={`flex-1 py-3 text-xs font-bold rounded-lg transition ${form.sursa_text === "client" ? "bg-yellow-500 text-black" : "text-zinc-400"}`}
                      >
                        MY TEXT
                      </button>
                    </div>

                    <textarea
                      placeholder={form.sursa_text === "ai" 
                        ? "Describe theme, story, vibe..."
                        : "Paste your full lyrics here..."}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl h-40 resize-none"
                      value={form.continut_text}
                      onChange={(e)=>
                        setForm({...form, continut_text:e.target.value})
                      }
                    />

                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-4 bg-white/5 rounded-xl"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 py-4 bg-yellow-500 text-black font-bold rounded-xl"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="s3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold uppercase">
                      03 — Deployment
                    </h2>

                    <input
                      type="email"
                      placeholder="youremail@mail.com"
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-xl text-center text-lg"
                      value={form.email_client}
                      onChange={(e)=>
                        setForm({...form, email_client:e.target.value})
                      }
                    />

                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(2)}
                        className="flex-1 py-4 bg-white/5 rounded-xl"
                      >
                        Back
                      </button>

                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-4 bg-pink-500 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition"
                      >
                        {loading ? "Processing..." : <>Place order & Pay <ArrowRight size={18}/></>}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              <ChatWidget user={{ id: "anonim", email: "vizitator@smile.live" }} />
            </div>

            {/* SUMMARY */}
            <div className="lg:w-80">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl lg:sticky lg:top-20">
                <h3 className="text-xs uppercase text-yellow-500 mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Base Production</span>
                    <span>50€</span>
                  </div>

                  {form.urgent && (
                    <div className="flex justify-between text-yellow-400">
                      <span>Urgent</span>
                      <span>+20€</span>
                    </div>
                  )}

                  {form.extended && (
                    <div className="flex justify-between text-yellow-400">
                      <span>Extended</span>
                      <span>+15€</span>
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{total}€</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-20 space-y-8">
            <CheckCircle size={60} className="mx-auto text-yellow-500"/>
            <h2 className="text-4xl font-black uppercase">
              Order !
            </h2>
            <p className="text-zinc-400">
              Redirecting to Revolut for secure payment...
            </p>

            <button
              onClick={resetProcess}
              className="mt-6 px-6 py-3 bg-white text-black rounded-xl font-bold active:scale-95 transition"
            >
              Start Another Production
            </button>
          </div>
        )}

        <Link href="/landing">
          <div className="fixed top-5 left-5 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs flex items-center gap-2">
            <ArrowLeft size={16}/> Back Home
          </div>
        </Link>

      </div>
    </div>
  );
}