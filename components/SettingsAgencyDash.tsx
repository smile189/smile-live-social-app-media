"use client";

import React, { useState } from "react";
import { 
  Settings, ShieldCheck, Copy, Check, Save, 
  Trash2, BellRing, Globe, Fingerprint, Info
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface SettingsProps {
  agency: any;
  refresh: () => void;
}

export const SettingsTab = ({ agency, refresh }: SettingsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // State pentru formulare - populează cu datele din obiectul 'agency'
  const [formData, setFormData] = useState({
    name: agency?.name || "",
    // Adaugă aici și alte câmpuri după ce verifici DB-ul (ex: description, commission)
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleCopyId = () => {
    navigator.clipboard.writeText(agency.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("agencies")
        .update({ 
          name: formData.name,
          // Actualizează aici coloanele din DB
        })
        .eq("id", agency.id);

      if (error) throw error;
      
      alert("Setări salvate cu succes!");
      refresh(); // Reîmprospătează datele în componenta părinte
    } catch (err: any) {
      alert("Eroare la salvare: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* SECTION 1: IDENTITY */}
      <section className="bg-white dark:bg-[#121214] border border-[#E3E8EE] dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E3E8EE] dark:border-zinc-800 bg-[#F8FAFC] dark:bg-zinc-900/50">
          <h4 className="text-sm font-black uppercase italic dark:text-white flex items-center gap-2">
            <Fingerprint size={18} className="text-[#635BFF]" /> Agency Identity
          </h4>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest italic flex items-center gap-1">
                Agency Name <Info size={10} />
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#F6F9FC] dark:bg-zinc-900 border border-[#E3E8EE] dark:border-zinc-800 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-[#635BFF]/20 transition-all dark:text-white font-bold italic"
                placeholder="Ex: Elite Talents Agency"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest italic">Agency ID</label>
              <div className="flex gap-2">
                <code className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-[#E3E8EE] dark:border-zinc-800 p-3 rounded-xl text-[10px] text-[#635BFF] font-mono flex items-center truncate">
                  {agency.id}
                </code>
                <button 
                  onClick={handleCopyId}
                  className="p-3 bg-white dark:bg-zinc-900 border border-[#E3E8EE] dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-[#697386]" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PREFERENCES (Placeholder pentru alte date din DB) */}
      <section className="bg-white dark:bg-[#121214] border border-[#E3E8EE] dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600">
              <BellRing size={20} />
            </div>
            <div>
              <h5 className="text-sm font-bold dark:text-white uppercase italic">Activity Alerts</h5>
              <p className="text-xs text-[#697386]">Receive alerts when a talent goes live or makes a large withdrawal.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#635BFF]"></div>
          </label>
        </div>
      </section>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-end gap-4 items-center">
        <p className="text-[10px] text-[#697386] italic uppercase font-bold tracking-tighter">Changes are applied instantly</p>
        <button 
          onClick={handleUpdate}
          disabled={isUpdating}
          className="flex items-center gap-2 bg-[#635BFF] text-white px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#5851E0] shadow-lg shadow-[#635BFF]/20 disabled:opacity-50 transition-all active:scale-95"
        >
          {isUpdating ? <><Save size={14} className="animate-spin" /> Updating...</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>


    </div>
  );
};
