"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { 
  Plus, Search, Loader2, CheckCircle2, 
  X, ExternalLink, ArrowUpRight
} from "lucide-react";



export default function AgencyStripeCommand() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  
  const [newName, setNewName] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadData = async () => {
    setFetching(true);
    const { data } = await supabase
      .from("agencies")
      .select("*")
      .order("created_at", { ascending: false });
    
    setAgencies(data || []);
    setFetching(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleUserSearch = async (term: string) => {
    setUserSearch(term);
    if (term.length < 2) { setFoundUsers([]); return; }
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", `%${term}%`)
      .limit(5);
    setFoundUsers(data || []);
  };

  const handleDeploy = async () => {
    if (newName.length < 3 || !selectedUser) return;
    setLoading(true);
    
    // RPC-ul returnează UUID-ul generat de baza de date
    const { data: newId, error } = await supabase.rpc('forge_agency_node', { 
      p_agency_name: newName,
      p_owner_id: selectedUser.id 
    });

    if (!error && newId) {
      setNewName("");
      setSelectedUser(null);
      
      // Închidem modalul
      const modal = document.getElementById('deploy_modal') as any;
      if (modal) modal.close();
      
      // REDIRECT către calea corectă: /dashboard/agency/ID
      router.push(`/dashboard/agency/${newId}`); 
    } else {
      alert("Eroare Deployment: " + (error?.message || "ID-ul nu a putut fi generat"));
      setLoading(false);
    }
  };

  const filteredAgencies = useMemo(() => {
    return agencies.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, agencies]);

  return (
    <div className="min-h-screen bg-[#F6F9FC] text-[#1A1F36] font-sans antialiased">
      {/* HEADER */}
      <div className="bg-white border-b border-[#E3E8EE] px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="text-lg font-bold italic tracking-tighter uppercase text-[#635BFF]">Agency Management</h1>
        <button 
          onClick={() => (document.getElementById('deploy_modal') as any).showModal()}
          className="bg-[#635BFF] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#5851E0] transition-all flex items-center gap-2"
        >
          <Plus size={16} /> New agency
        </button>
      </div>

      <div className="max-w-[1200px] mx-auto p-8">
        <div className="bg-white rounded-xl border border-[#E3E8EE] shadow-sm overflow-hidden">
          {/* SEARCH BAR */}
          <div className="p-4 border-b border-[#E3E8EE] bg-[#F8FAFC]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-[#697386]" size={16} />
              <input 
                type="text"
                placeholder="Search nodes by name..."
                className="w-full bg-white border border-[#E3E8EE] rounded-md py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#635BFF]/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE */}
          <table className="w-full text-left">
            <thead className="text-[10px] font-bold text-[#697386] uppercase bg-[#F8FAFC] border-b border-[#E3E8EE]">
              <tr>
                <th className="px-6 py-4">Agency Designation</th>
                <th className="px-6 py-4">Control URL</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]">
              {fetching ? (
                <tr><td colSpan={3} className="px-6 py-12 text-center"><Loader2 className="animate-spin mx-auto text-[#635BFF]" /></td></tr>
              ) : filteredAgencies.map((a) => (
                <tr key={a.id} className="hover:bg-[#F6F9FC] group">
                  <td className="px-6 py-4 font-bold text-sm tracking-tight uppercase italic">{a.name}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => router.push(`/dashboard/agency/${a.id}`)}
                      className="text-[11px] font-mono text-[#697386] hover:text-[#635BFF] flex items-center gap-1"
                    >
                      /dashboard/agency/{a.id.substring(0,8)}... <ExternalLink size={12} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => router.push(`/dashboard/agency/${a.id}`)}
                      className="text-[#635BFF] font-black text-[10px] uppercase flex items-center justify-end gap-1 ml-auto hover:underline"
                    >
                      Terminal <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DEPLOY */}
      <dialog id="deploy_modal" className="modal bg-transparent p-0">
        <div className="fixed inset-0 bg-[#1A1F36]/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative">
            <button onClick={() => (document.getElementById('deploy_modal') as any).close()} className="absolute top-6 right-6 text-zinc-400 hover:text-black transition-colors">
              <X size={20}/>
            </button>
            
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6">Forge Agency Node</h3>
            
            <div className="space-y-6">
              {/* ASSIGN OWNER */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Assign Target Owner</label>
                {!selectedUser ? (
                  <div className="relative">
                    <input 
                      type="text"
                      className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#635BFF]/10"
                      placeholder="Search talent..."
                      value={userSearch}
                      onChange={(e) => handleUserSearch(e.target.value)}
                    />
                    {foundUsers.length > 0 && (
                      <div className="absolute z-50 w-full bg-white border border-zinc-100 shadow-xl rounded-2xl mt-2 overflow-hidden">
                        {foundUsers.map(u => (
                          <div 
                            key={u.id}
                            onClick={() => { setSelectedUser(u); setFoundUsers([]); }}
                            className="p-4 hover:bg-zinc-50 cursor-pointer flex items-center gap-3 border-b last:border-0"
                          >
                            <img src={u.avatar_url || "https://avatar.vercel.sh"} className="w-7 h-7 rounded-full" />
                            <span className="font-bold text-sm">{u.username}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-500" size={20} />
                      <span className="font-bold text-emerald-900 uppercase italic text-sm">{selectedUser.username}</span>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="text-emerald-400 hover:text-emerald-600">
                      <X size={16}/>
                    </button>
                  </div>
                )}
              </div>

              {/* NODE NAME */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Node Name</label>
                <input 
                  type="text"
                  className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-2xl text-sm outline-none"
                  placeholder="Ex: SMILE_AGENCY_01"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <button 
                onClick={handleDeploy}
                disabled={loading || !selectedUser || newName.length < 3}
                className="w-full bg-[#635BFF] text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all active:scale-95 flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : "Deploy & Open Terminal"}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
