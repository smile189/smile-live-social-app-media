"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, User, Trash2, Loader2, Users, AlertCircle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export const AgencyTeam = ({ agencyId, refresh }: { agencyId: string; refresh: () => void }) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadMembers = useCallback(async () => {
    if (!agencyId) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("agency_id", agencyId);
    
    if (error) console.error("EROARE DB:", error.message);
    setMembers(data || []);
  }, [agencyId, supabase]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleAdd = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const { data: p, error: fE } = await supabase.from("profiles").select("id").ilike("username", username.trim()).single();
      if (fE || !p) throw new Error("Utilizatorul nu a fost găsit.");

      const { error: uE } = await supabase.from("profiles").update({ agency_id: agencyId }).eq("id", p.id);
      if (uE) throw uE;

      setMsg({ type: "success", text: "Adăugat cu succes!" });
      setUsername("");
      await loadMembers();
      refresh();
    } catch (e: any) { setMsg({ type: "error", text: e.message }); }
    finally { setLoading(false); }
  };

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from("profiles").update({ agency_id: null }).eq("id", id);
    if (!error) { loadMembers(); refresh(); }
  };

  if (!agencyId) return <div className="p-4 bg-yellow-100 text-yellow-800 rounded-xl flex gap-2"><AlertCircle /> Lipsă ID Agenție!</div>;

  return (
    <div className="bg-white dark:bg-[#121214] border border-[#E3E8EE] dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mt-6">
      <div className="p-6 border-b border-[#E3E8EE] dark:border-zinc-800 bg-[#F8FAFC] dark:bg-zinc-900/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-[#635BFF]" />
          <h3 className="font-bold text-sm uppercase italic tracking-tight dark:text-white">Echipă ({members.length})</h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex gap-2">
          <input 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Introdu username exact..." 
            className="flex-1 bg-[#F6F9FC] dark:bg-zinc-900 border border-[#E3E8EE] dark:border-zinc-800 p-3 rounded-xl text-sm outline-none dark:text-white"
          />
          <button onClick={handleAdd} disabled={loading} className="bg-[#635BFF] text-white px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#5851E0] disabled:opacity-50 transition-all">
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Adaugă"}
          </button>
        </div>

        {msg.text && <p className={`text-[10px] font-bold uppercase italic ${msg.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{msg.text}</p>}

        <div className="divide-y divide-[#E3E8EE] dark:divide-zinc-800">
          {members.map((m) => (
            <div key={m.id} className="py-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#635BFF] text-white flex items-center justify-center text-[10px] font-black">{m.username?.substring(0,2).toUpperCase()}</div>
                <span className="text-sm font-bold dark:text-white uppercase italic">{m.username}</span>
              </div>
              <button onClick={() => handleRemove(m.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
            </div>
          ))}
          {members.length === 0 && <p className="text-xs text-gray-500 italic py-4 text-center">Niciun membru în această agenție.</p>}
        </div>
      </div>
    </div>
  );
};
