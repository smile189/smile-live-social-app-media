'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { 
  Trash2, Search, RefreshCw, Plus, CheckCircle2, 
  AlertCircle, Loader2, ShieldAlert, X, Send, ChevronLeft, ChevronRight, 
  Edit3, Check, RotateCcw, ChevronDown, ChevronUp, MessageSquare, Lock, AlertTriangle
} from 'lucide-react';

export default function ModerateSmile() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]); 
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'comments'>('posts');
  
  // --- SECURITY VAULT STATE ---
  const [bannedWords, setBannedWords] = useState<string[]>(['spam', 'scam', 'toxic']);
  const [newWord, setNewWord] = useState('');
  const [showVault, setShowVault] = useState(false);

  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{show: boolean, id: string, table: string} | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [manualData, setManualData] = useState({ caption: '', content: '', userId: '', postId: '' });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // --- HELPERS ---
  const addNotify = (msg: string, type: 'success' | 'error') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  const applyCensor = (text: string) => {
    let sanitized = text;
    bannedWords.forEach(word => {
      if (!word.trim()) return;
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '***');
    });
    return sanitized;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pData, uData, cData] = await Promise.all([
        supabase.from('posts').select('*, profiles(username)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('username', { ascending: true }),
        supabase.from('comments').select('*, profiles(username)').order('created_at', { ascending: false })
      ]);
      if (pData.data) setPosts(pData.data);
      if (uData.data) setUsers(uData.data);
      if (cData.data) setComments(cData.data);
    } catch (e) { addNotify("Sync Error", "error"); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- ACTIONS ---
  const saveEdit = async (id: string, table: string) => {
    setLoading(true);
    const sanitizedText = applyCensor(editValue);
    const column = table === 'posts' ? 'caption' : 'content';
    try {
      const { error } = await supabase.from(table).update({ [column]: sanitizedText }).eq('id', id);
      if (error) throw error;
      addNotify("Update executed", "success");
      setEditingId(null);
      fetchData();
    } catch (err: any) { addNotify(err.message, "error"); }
    setLoading(false);
  };

  const executeDelete = async () => {
    if (!confirmModal) return;
    setLoading(true);
    const { error } = await supabase.from(confirmModal.table).delete().eq('id', confirmModal.id);
    if (!error) { addNotify("Entry purged", "success"); fetchData(); }
    setConfirmModal(null);
    setLoading(false);
  };

  const handleManualSubmit = async () => {
    if (!manualData.userId) return addNotify("Select Identity!", "error");
    setLoading(true);
    const finalContent = applyCensor(activeTab === 'posts' ? manualData.caption : manualData.content);
    try {
      if (activeTab === 'posts') {
        await supabase.from('posts').insert([{ user_id: manualData.userId, caption: finalContent, thumbnail_url: "https://images.unsplash.com" }]);
      } else {
        if (!manualData.postId) throw new Error("Select Parent Post");
        await supabase.from('comments').insert([{ post_id: manualData.postId, user_id: manualData.userId, content: finalContent }]);
      }
      addNotify("Published", "success");
      setShowModal(false);
      fetchData();
    } catch (err: any) { addNotify(err.message, "error"); }
    setLoading(false);
  };

  const filteredData = useMemo(() => {
    const s = filter.toLowerCase();
    if (activeTab === 'users') return users.filter(u => u.username?.toLowerCase().includes(s));
    if (activeTab === 'comments') return comments.filter(c => c.content?.toLowerCase().includes(s) || c.profiles?.username?.toLowerCase().includes(s));
    return posts.filter(p => p.caption?.toLowerCase().includes(s) || p.profiles?.username?.toLowerCase().includes(s));
  }, [filter, users, posts, comments, activeTab]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050506] text-zinc-800 dark:text-zinc-200 font-sans pb-10">
      
      {/* NOTIFICATIONS */}
      {notif && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[250] px-6 py-3 rounded-full border shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${
          notif.type === 'success' ? 'bg-zinc-900 border-emerald-500 text-emerald-500' : 'bg-zinc-900 border-rose-500 text-rose-500'
        }`}>
          {notif.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span className="text-[10px] font-black uppercase tracking-widest">{notif.msg}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-[#050506]/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-black text-indigo-500 italic text-xl uppercase tracking-tighter">
            <ShieldAlert size={20} /> SMILE_OPS
          </div>
          <nav className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 border border-zinc-200 dark:border-zinc-800">
            <TabItem active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} label="Posts" count={posts.length} />
            <TabItem active={activeTab === 'comments'} onClick={() => setActiveTab('comments')} label="Comments" count={comments.length} />
            <TabItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Users" count={users.length} />
          </nav>
        </div>

        <div className="flex gap-2 items-center">
            <button 
              onClick={() => setShowVault(!showVault)} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${showVault ? 'bg-amber-500 border-amber-600 text-black' : 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10'}`}
            >
              <Lock size={12} /> Security Vault
            </button>
            <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-indigo-600/20">New Entry</button>
            <button onClick={fetchData} className="p-2 dark:bg-zinc-900 rounded-lg"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        
        {/* SECURITY VAULT (BANNED WORDS HUB) */}
        {showVault && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-300 shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-amber-500">
              <AlertTriangle size={18} />
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 underline decoration-2 underline-offset-4">Banned Keywords Filter</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {bannedWords.map(word => (
                <span key={word} className="flex items-center gap-2 bg-amber-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  {word}
                  <X size={12} className="cursor-pointer hover:scale-125" onClick={() => setBannedWords(bannedWords.filter(w => w !== word))} />
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Add restricted word..." 
                className="bg-zinc-100 dark:bg-black/40 border border-amber-500/30 rounded-xl px-4 py-2 text-xs outline-none focus:border-amber-500 w-64"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (setBannedWords([...bannedWords, newWord.toLowerCase()]), setNewWord(''))}
              />
              <button onClick={() => { if(newWord) {setBannedWords([...bannedWords, newWord.toLowerCase()]); setNewWord(''); addNotify("Keyword Added", "success");} }} className="bg-amber-500 text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase">Add Word</button>
            </div>
          </div>
        )}

        {/* DATA GRID WITH INTERACTION TREE */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-zinc-50 dark:bg-black/40 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-black uppercase text-[9px] tracking-widest">
              <tr>
                <th className="px-6 py-4 w-10 text-center">Tree</th>
                <th className="px-6 py-4">Identity Profile</th>
                <th className="px-6 py-4">Payload (Edit in place)</th>
                <th className="px-6 py-4 text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {paginatedData.map(item => (
                <React.Fragment key={item.id}>
                  <tr className={`group transition-colors ${expandedPosts[item.id] ? 'bg-indigo-50/40 dark:bg-indigo-500/5' : 'hover:bg-zinc-50 dark:hover:bg-white/[0.01]'}`}>
                    <td className="px-4 text-center">
                      {activeTab === 'posts' && (
                        <button onClick={() => setExpandedPosts({...expandedPosts, [item.id]: !expandedPosts[item.id]})} className="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-all">
                          {expandedPosts[item.id] ? <ChevronUp size={14} className="text-indigo-600"/> : <ChevronDown size={14}/>}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-indigo-600 italic tracking-tight text-sm">@{item.username || item.profiles?.username}</div>
                      <div className="text-[8px] font-mono text-zinc-400 uppercase">{new Date(item.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 font-sans italic text-zinc-600 dark:text-zinc-300">
                      {editingId === item.id ? (
                        <div className="flex gap-2 items-center animate-in zoom-in-95 duration-200">
                          <input autoFocus className="bg-white dark:bg-zinc-900 border border-indigo-500 rounded-lg px-3 py-1.5 outline-none w-full shadow-lg" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                          <button onClick={() => saveEdit(item.id, activeTab)} className="text-emerald-500 hover:scale-110"><Check size={18}/></button>
                          <button onClick={() => setEditingId(null)} className="text-zinc-400 hover:scale-110"><RotateCcw size={18}/></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 cursor-text group/text" onClick={() => {setEditingId(item.id); setEditValue(item.caption || item.content || '')}}>
                           <span className="truncate max-w-lg">"{item.caption || item.content || item.role}"</span>
                           <Edit3 size={12} className="opacity-0 group-hover/text:opacity-100 text-indigo-400 transition-opacity" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => setConfirmModal({show: true, id: item.id, table: activeTab})} className="text-rose-500 opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-all"><Trash2 size={16}/></button>
                    </td>
                  </tr>

                  {/* VISUAL TREE - INTERACTION THREAD */}
                  {activeTab === 'posts' && expandedPosts[item.id] && (
                    <tr className="animate-in slide-in-from-top-2 duration-300">
                      <td colSpan={4} className="bg-zinc-50/50 dark:bg-black/20 px-12 py-5 border-l-4 border-indigo-500/30">
                        <div className="space-y-4">
                           <div className="text-[9px] font-black uppercase text-zinc-400 flex items-center gap-2 mb-2">
                             <MessageSquare size={10} /> Active Interaction Thread
                           </div>
                           {comments.filter(c => c.post_id === item.id).length > 0 ? (
                             comments.filter(c => c.post_id === item.id).map(comm => (
                               <div key={comm.id} className="flex justify-between items-center bg-white dark:bg-zinc-950/40 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm group/comm">
                                  <div className="text-[11px] font-sans">
                                    <span className="font-bold text-indigo-500 italic">@{comm.profiles?.username}</span>: 
                                    <span className="ml-2 text-zinc-600 dark:text-zinc-300 italic">"{comm.content}"</span>
                                  </div>
                                  <button onClick={() => setConfirmModal({show: true, id: comm.id, table: 'comments'})} className="text-rose-500 opacity-0 group-hover/comm:opacity-100 p-1.5 hover:bg-rose-50 rounded-lg"><Trash2 size={14}/></button>
                               </div>
                             ))
                           ) : <p className="text-[10px] text-zinc-400 italic">No communication signals detected on this node.</p>}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* CUSTOM CONFIRM MODAL (CORPORATE STYLE) */}
      {confirmModal?.show && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95">
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
                    <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Security Breach</h3>
                <p className="text-zinc-500 text-sm mb-8 leading-relaxed italic font-sans font-medium">Node ID: {confirmModal.id.slice(0,8)}... will be permanently purged from {confirmModal.table}. Proceed?</p>
                <div className="flex gap-4">
                    <button onClick={() => setConfirmModal(null)} className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">Abort</button>
                    <button onClick={executeDelete} className="flex-1 py-4 rounded-2xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all text-center">Execute Purge</button>
                </div>
            </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-black/50">
              <h3 className="font-bold text-indigo-600 uppercase tracking-tighter text-sm italic">New Broadcast Signal</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-all"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 italic">Identity Clearance</label>
                <select className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl outline-none text-sm font-bold appearance-none" onChange={(e) => setManualData({...manualData, userId: e.target.value})}>
                  <option value="">-- Choose Identity --</option>
                  {users.map(u => <option key={u.id} value={u.id}>@{u.username}</option>)}
                </select>
              </div>
              {activeTab === 'posts' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 italic">Transmission Payload</label>
                  <textarea className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl outline-none text-sm font-medium resize-none italic" placeholder="Initiate broadcast content..." onChange={(e) => setManualData({...manualData, caption: e.target.value})} />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 italic">Target Sequence (Post)</label>
                    <select className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl outline-none text-sm font-bold appearance-none" onChange={(e) => setManualData({...manualData, postId: e.target.value})}>
                      <option value="">-- Select Target --</option>
                      {posts.map(p => <option key={p.id} value={p.id}>{p.caption?.slice(0, 40) || 'Data Node'}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 italic">Signal Input</label>
                    <textarea className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl outline-none text-sm font-medium resize-none italic" placeholder="Secure signal message..." onChange={(e) => setManualData({...manualData, content: e.target.value})} />
                  </div>
                </>
              )}
              <button onClick={handleManualSubmit} disabled={loading} className="w-full bg-indigo-600 py-4 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/30 transition-transform active:scale-95">
                {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Initiate Global Broadcast"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabItem({ active, onClick, label, count }: any) {
  return (
    <button onClick={onClick} className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all flex items-center gap-3 whitespace-nowrap ${
      active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'
    }`}>
      {label} <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-zinc-200 dark:bg-zinc-800'}`}>{count}</span>
    </button>
  );
}
