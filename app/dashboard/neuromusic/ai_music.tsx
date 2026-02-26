/**
 * author: BM 2026
 * about: ai_music.tsx dashboard notifications
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Music,
  X,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Link as LinkIcon,
  Sparkles,
  Trash2,
  ExternalLink,
  Mail,
  Euro
} from "lucide-react";

// Initializare Supabase
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ITEMS_PER_PAGE = 10;

export default function MusicRequestsDashboard() {
  // --- STATE-URI ---
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newCount, setNewCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- FUNCTIE FETCH DATE ---
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cereri_muzica")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- REAL-TIME NOTIFICATIONS & UPDATES ---
  useEffect(() => {
    // Luăm datele la început
    fetchRequests();

    const channel = supabase
      .channel('music-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cereri_muzica' },
        (payload) => {
          console.log("🔔 Date primite live:", payload);
          if (payload.eventType === 'INSERT') {
            setRequests((prev) => [payload.new, ...prev]);
            setNewCount((c) => c + 1);
          }
          if (payload.eventType === 'UPDATE') {
            setRequests((prev) =>
              prev.map((item) => (item.id === payload.new.id ? payload.new : item))
            );
          }
          if (payload.eventType === 'DELETE') {
            setRequests((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Status Realtime:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // <--- OBLIGATORIU GOL ca să nu mai dea eroarea de "size"


  // --- LOGICA FILTRARE SI PAGINARE ---
  const filtered = useMemo(() => {
    return requests.filter((r) =>
      r.nume_piesa?.toLowerCase().includes(search.toLowerCase()) ||
      r.email_client?.toLowerCase().includes(search.toLowerCase())
    );
  }, [requests, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- FUNCTIE SALVARE (FIX PENTRU CHECK CONSTRAINT) ---
  const handleSave = async () => {
    if (!active || saving) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("cereri_muzica")
        .update({
          status: active.status, // Valoarea trebuie sa fie permisa in SQL Constraint
          link_rezultat: active.link_rezultat || "",
          genre: active.genre || "",
          mood: active.mood || "",
          vocal_gender: active.vocal_gender || "",
          continut_text: active.continut_text || "",
          pret_total: parseFloat(active.pret_total) || 0,
          ultima_actualizare: new Date().toISOString()
        })
        .eq("id", active.id);

      if (error) {
        alert(`Eroare SQL: ${error.message}\nVerifica daca statusul "${active.status}" este permis.`);
        throw error;
      }

      setIsEditing(false);
      setNewCount(0);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  // --- FUNCTIE STERGERE ---
  const handleRemove = async () => {
    if (!active || saving) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("cereri_muzica")
        .delete()
        .eq("id", active.id);
      
      if (error) throw error;
      
      setIsEditing(false);
      setIsDeleting(false);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] text-[#1a1f36] font-sans antialiased selection:bg-indigo-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-12">
        
        {/* HEADER STRIPE STYLE */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-[#635bff] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Music className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Music Requests</h1>
              <div className="flex items-center gap-2">

              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#635bff]" size={16} />
              <input
                placeholder="Search by song or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2.5 bg-white border border-[#e3e8ee] rounded-lg text-sm shadow-sm outline-none w-80 focus:ring-4 focus:ring-[#635bff]/10 focus:border-[#635bff] transition-all"
              />
            </div>
            {newCount > 0 && (
              <motion.button 
                initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                onClick={() => { fetchRequests(); setNewCount(0); }}
                className="bg-indigo-50 text-red-500  px-4 py-2.5 rounded-lg text-xs font-bold border border-indigo-100 flex items-center gap-2 hover:bg-indigo-100 transition-colors shadow-sm"
              >
                <Sparkles size={14} className="animate-pulse" /> {newCount} NEW
              </motion.button>
            )}
          </div>
        </header>

        {/* TABLE COMPONENT */}
        <div className="bg-white rounded-xl shadow-[0_2px_5px_rgba(0,0,0,0.05)] border border-[#e3e8ee] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fcfdfe] border-b border-[#e3e8ee] text-[#697386] text-[11px] font-bold uppercase tracking-[0.15em]">
                  <th className="px-8 py-5">Song & Client</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5">Production Details</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e8ee]">
                {loading ? (
                  <tr><td colSpan={5} className="py-32 text-center"><Loader2 className="animate-spin inline text-slate-200" size={40}/></td></tr>
                ) : paginatedData.length === 0 ? (
                  <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium">No results found</td></tr>
                ) : (
                  paginatedData.map((req) => (
                    <tr key={req.id} className="hover:bg-[#f9fafb] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-bold text-[#3c4257] truncate max-w-[220px]">{req.nume_piesa}</div>
                        <div className="text-xs text-[#697386] flex items-center gap-1"><Mail size={10}/> {req.email_client}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          <StatusBadge status={req.status} />
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-1">
                          {req.genre && <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-black uppercase">{req.genre}</span>}
                          {req.vocal_gender && <span className="text-[9px] bg-indigo-50 px-2 py-0.5 rounded text-indigo-500 font-black uppercase">{req.vocal_gender}</span>}
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-sm font-bold text-[#3c4257] italic">€{req.pret_total}</td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => { setActive({...req}); setIsEditing(true); setIsDeleting(false); }} 
                          className="text-[#635bff] hover:text-[#0a2540] font-black text-xs uppercase tracking-wider transition-colors px-4 py-2 hover:bg-indigo-50 rounded-lg"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION STRIPE STYLE */}
          <div className="px-8 py-5 flex items-center justify-between border-t border-[#e3e8ee] bg-[#fcfdfe]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)} 
                className="px-4 py-2 rounded-lg border border-[#e3e8ee] bg-white text-xs font-bold shadow-sm hover:bg-[#f6f9fc] disabled:opacity-30 flex items-center gap-1 transition-all"
              >
                <ChevronLeft size={14}/> Previous
              </button>
              <button 
                disabled={currentPage >= totalPages} 
                onClick={() => setCurrentPage(p => p + 1)} 
                className="px-4 py-2 rounded-lg border border-[#e3e8ee] bg-white text-xs font-bold shadow-sm hover:bg-[#f6f9fc] disabled:opacity-30 flex items-center gap-1 transition-all"
              >
                Next <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DRAWER / SIDEBAR EDIT */}
      <AnimatePresence>
        {isEditing && active && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => !saving && setIsEditing(false)} 
              className="absolute inset-0 bg-[#0a2540]/20 backdrop-blur-[2px]" 
            />
            {/* Panel */}
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              className="relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col"
            >
              <div className="p-8 border-b border-[#e3e8ee] flex justify-between items-center sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-xl font-bold text-[#1a1f36]">Edit Request Details</h2>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-widest">{active.id}</p>
                </div>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <X size={24}/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                
                {/* SECTION: STATUS & PRICE */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Status</label>
                    <select 
                      value={active.status || ""} 
                      onChange={(e) => setActive({...active, status: e.target.value})} 
                      className="w-full border-2 border-[#e3e8ee] rounded-xl p-3 bg-[#fcfdfe] outline-none focus:border-[#635bff] transition-all font-bold text-sm"
                    >
                      {/* STATUSURILE RO PENTRU CHECK CONSTRAINT */}
                      <option value="primita">primita</option>
                      <option value="in_lucru">in_lucru</option>
                      <option value="finalizata">finalizata</option>
                      <option value="anulata">anulata</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price (€)</label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-3.5 text-slate-300" size={16} />
                      <input 
                        type="number" 
                        value={active.pret_total || 0} 
                        onChange={(e) => setActive({...active, pret_total: e.target.value})} 
                        className="w-full pl-10 pr-4 py-3 border-2 border-[#e3e8ee] rounded-xl bg-[#fcfdfe] font-mono font-bold outline-none focus:border-[#635bff]" 
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION: ARTISTIC INFO */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-[#635bff] uppercase tracking-[0.2em] border-b border-indigo-50 pb-2">Production Metadata</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Genre</label>
                      <input value={active.genre || ""} onChange={(e) => setActive({...active, genre: e.target.value})} className="w-full border border-[#e3e8ee] rounded-lg p-3 text-sm focus:border-[#635bff] outline-none font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Mood</label>
                      <input value={active.mood || ""} onChange={(e) => setActive({...active, mood: e.target.value})} className="w-full border border-[#e3e8ee] rounded-lg p-3 text-sm focus:border-[#635bff] outline-none font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Vocal Gender</label>
                    <select value={active.vocal_gender || ""} onChange={(e) => setActive({...active, vocal_gender: e.target.value})} className="w-full border border-[#e3e8ee] rounded-lg p-3 text-sm outline-none focus:border-[#635bff] font-medium">
                      <option value="Male">Male Artist</option>
                      <option value="Female">Female Artist</option>
                      <option value="Duet">Duet (Male + Female)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Lyrics / Description</label>
                    <textarea 
                      rows={6} 
                      value={active.continut_text || ""} 
                      onChange={(e) => setActive({...active, continut_text: e.target.value})} 
                      className="w-full border border-[#e3e8ee] rounded-xl p-4 bg-[#fcfdfe] resize-none outline-none focus:border-[#635bff] text-sm leading-relaxed" 
                    />
                  </div>
                </div>

                {/* SECTION: DELIVERY */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#635bff] uppercase tracking-widest">Final Result Link</label>
                  <div className="relative group">
                    <LinkIcon className="absolute left-3 top-3.5 text-slate-300 group-focus-within:text-[#635bff]" size={16} />
                    <input 
                      value={active.link_rezultat || ""} 
                      onChange={(e) => setActive({...active, link_rezultat: e.target.value})} 
                      className="w-full pl-10 pr-4 py-3 border-2 border-indigo-50 rounded-xl outline-none focus:border-[#635bff] text-sm font-bold" 
                      placeholder="https://" 
                    />
                    {active.link_rezultat && (
                      <a href={active.link_rezultat} target="_blank" className="absolute right-3 top-3 p-1 text-indigo-400 hover:text-indigo-600">
                        <ExternalLink size={16}/>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="p-8 border-t border-[#e3e8ee] bg-[#fcfdfe] space-y-4">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full py-4 bg-[#635bff] hover:bg-[#544af0] text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  {saving && !isDeleting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18}/>}
                  Save Changes
                </button>

                {!isDeleting ? (
                  <button 
                    onClick={() => setIsDeleting(true)} 
                    className="w-full py-2 text-red-400 hover:bg-red-50 rounded-lg font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
                  >
                    Delete Permanently
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                    <button onClick={handleRemove} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200">Yes, Delete</button>
                    <button onClick={() => setIsDeleting(false)} className="flex-1 py-3 bg-white text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest border border-slate-200">Cancel</button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e3e8ee; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #635bff; }
      `}</style>
    </div>
  );
}

// --- HELPER COMPONENT: STATUS BADGE ---
function StatusBadge({ status }: { status: string }) {
  const config: any = {  
    primita: { label: "primita", color: "bg-[#f4f7fa] text-[#697386] border-[#e3e8ee]" },
    in_lucru: { label: "in_lucru", color: "bg-[#fff9e6] text-[#946c00] border-[#ffebad]" },
      finalizata: { label: "finalizata", color: "bg-[#e3fcf1] text-[#008d51] border-[#c0f2dc]" },
    anulata: { label: "anulata", color: "bg-[#ffe3e3] text-[#d00000] border-[#ffb3b3]" }
  };
  const current = config[status] || config.primita;

  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-sm ${current.color}`}>
      {current.label}
    </span>
  );
}
