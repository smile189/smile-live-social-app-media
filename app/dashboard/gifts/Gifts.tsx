"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Coins, Sparkles, Edit3, Trash2, 
  X, Save, Image as ImageIcon, Loader2, Search, Upload, AlertTriangle, AlignLeft
} from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GiftsTab() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeGift, setActiveGift] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGifts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gift_types")
      .select("*")
      .order("coin_price", { ascending: true });
    if (!error) setGifts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchGifts(); }, [fetchGifts]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `gifts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gift-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gift-assets')
        .getPublicUrl(filePath);

      setActiveGift({ ...activeGift, image_url: publicUrl });
    } catch (error: any) {
      alert("Upload failed: " + error.message);
    } finally {
      setIsUploading(true); // Small delay to let Supabase process
      setTimeout(() => setIsUploading(false), 500);
    }
  };

  const handleSave = async () => {
    if (!activeGift?.name || isSaving) return;
    setIsSaving(true);
    
    const payload = {
      name: activeGift.name,
      description: activeGift.description || "",
      coin_price: activeGift.coin_price,
      image_url: activeGift.image_url
    };

    const { error } = isCreating ? 
      await supabase.from("gift_types").insert([payload]) : 
      await supabase.from("gift_types").update(payload).eq("id", activeGift.id);

    if (!error) {
      fetchGifts();
      setIsEditing(false);
      setIsCreating(false);
    } else {
      alert("Save failed: " + error.message);
    }
    setIsSaving(false);
  };

  const confirmDelete = async (id: string) => {
    const { error } = await supabase.from("gift_types").delete().eq("id", id);
    if (!error) {
      setGifts(gifts.filter(g => g.id !== id));
      setShowDeleteConfirm(null);
    }
  };

  const filteredGifts = gifts.filter(g => 
    g.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 space-y-10 pb-20">
        
        {/* HEADER */}
        <header className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">

            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter by name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              <button 
                  onClick={() => { setActiveGift({ name: "", coin_price: 0, image_url: "", description: "" }); setIsCreating(true); setIsEditing(true); }}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all active:scale-95"
              >
                  <Plus size={16} className="inline mr-2" strokeWidth={3} /> Add Asset
              </button>
            </div>
        </header>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
            {loading ? (
                [...Array(4)].map((_, i) => <div key={i} className="h-80 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-[2.5rem]" />)
            ) : (
                filteredGifts.map(gift => (
                    <motion.div 
                      layoutId={gift.id}
                      key={gift.id} 
                      className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-zinc-800 relative group hover:shadow-2xl transition-all"
                    >
                        <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-zinc-800/90 px-3 py-1 rounded-full border border-slate-100 flex items-center gap-1 shadow-sm">
                            <div className="h-3 w-3 rounded-full bg-amber-400" />
                            <span className="text-[11px] font-black text-slate-800 dark:text-zinc-100 font-mono leading-none">{gift.coin_price}</span>
                        </div>

                        <div className="aspect-square bg-slate-50 dark:bg-zinc-950 rounded-3xl mb-4 overflow-hidden flex items-center justify-center border border-slate-100 dark:border-zinc-800 group-hover:bg-indigo-50/30 transition-colors">
                            <img src={gift.image_url} alt="" className="w-full h-full object-contain p-6 transition-transform group-hover:scale-110" />
                        </div>
                        
                        <div className="text-center space-y-1 mb-6">
                          <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{gift.name}</h4>
                          <p className="text-[10px] text-slate-400 line-clamp-1 italic">{gift.description || "No description provided."}</p>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => { setIsCreating(false); setActiveGift(gift); setIsEditing(true); }} className="flex-1 py-3 bg-slate-50 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all">Edit</button>
                          <button onClick={() => setShowDeleteConfirm(gift.id)} className="p-3 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                        </div>

                        {/* DELETE OVERLAY */}
                        <AnimatePresence>
                          {showDeleteConfirm === gift.id && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white dark:bg-zinc-900 z-30 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center space-y-4">
                                <AlertTriangle size={32} className="text-rose-500" />
                                <p className="text-xs font-black uppercase text-slate-900 dark:text-white">Confirm Delete?</p>
                                <div className="flex gap-2 w-full">
                                  <button onClick={() => confirmDelete(gift.id)} className="flex-1 py-2 bg-rose-500 text-white rounded-lg text-[10px] font-bold">YES</button>
                                  <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-500 rounded-lg text-[10px] font-bold">NO</button>
                                </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                    </motion.div>
                ))
            )}
            </AnimatePresence>
        </div>
      </div>

      {/* --- DRAWER EDITOR --- */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="relative w-full max-w-[450px] bg-white dark:bg-[#0a0a0b] shadow-2xl h-full p-10 flex flex-col border-l border-zinc-800">
              
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center border border-amber-200 shadow-lg shadow-amber-500/20">
                      <Coins size={20} className="text-amber-900" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Golden Asset</h3>
                 </div>
                 <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full text-slate-400"><X size={28}/></button>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                {/* UPLOAD SECTION */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Asset Visual (PNG/SVG)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group aspect-video rounded-3xl border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-indigo-500 bg-slate-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-indigo-600" />
                        <span className="text-[8px] font-bold text-indigo-600">Uploading to Bucket...</span>
                      </div>
                    ) : activeGift?.image_url ? (
                      <>
                        <img src={activeGift.image_url} className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="text-white" size={24} />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Upload size={32} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Select Store Asset</span>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                  </div>
                </div>

                {/* NAME & DESCRIPTION */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Asset Name</label>
                    <input type="text" value={activeGift?.name} onChange={(e) => setActiveGift({...activeGift, name: e.target.value})} className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl py-4 px-6 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Description / Notes</label>
                    <div className="relative">
                      <AlignLeft className="absolute left-4 top-4 text-slate-300" size={16} />
                      <textarea 
                        rows={3}
                        value={activeGift?.description} 
                        onChange={(e) => setActiveGift({...activeGift, description: e.target.value})} 
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                        placeholder="Explain the gift effect or rarity..."
                      />
                    </div>
                  </div>
                </div>

                {/* PRICE */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block ml-1 text-center">Golden Coin Price</label>
                  <div className="relative group">
                    <Coins className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500 transition-transform group-focus-within:scale-125" size={24} />
                    <input type="number" value={activeGift?.coin_price} onChange={(e) => setActiveGift({...activeGift, coin_price: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-zinc-900 border-2 border-amber-200 rounded-3xl py-6 pl-14 text-center text-4xl font-black text-slate-900 dark:text-white shadow-inner" />
                  </div>
                </div>
              </div>

              {/* SAVE FOOTER */}
              <div className="flex gap-4 pt-10 mt-auto border-t border-zinc-800">
                <button onClick={() => setIsEditing(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Discard</button>
                <button onClick={handleSave} disabled={isSaving || isUploading} className="flex-[1.8] py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                  {isSaving ? "Finalizing Ledger..." : "Commit Asset"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
