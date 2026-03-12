'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { 
  Trash2, Search, RefreshCw, Plus, CheckCircle2, 
  AlertCircle, Loader2, ShieldAlert, X, Send, ChevronLeft, ChevronRight, 
  Edit3, Check, RotateCcw, ChevronDown, ChevronUp, MessageSquare, Lock, AlertTriangle,
  Clock, User, ShieldCheck, AlignLeft
} from 'lucide-react';

// TabItem Helper
const TabItem = ({ active, onClick, label, count }: any) => (
  <button 
    onClick={onClick}
    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
      active ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-500' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800/50'
    }`}
  >
    {label} <span className="opacity-40">{count}</span>
  </button>
);

export default function ModerateSmile() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]); 
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'comments'>('posts');
  
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

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
  useEffect(() => { setCurrentPage(1); }, [filter, activeTab]);

  const saveEdit = async (id: string, table: string) => {
    setLoading(true);
    const sanitizedText = applyCensor(editValue);
    const column = table === 'posts' ? 'caption' : table === 'comments' ? 'content' : 'username';
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
    const s = filter.toLowerCase().trim();
    if (activeTab === 'users') return users.filter(u => u.username?.toLowerCase().includes(s) || u.full_name?.toLowerCase().includes(s));
    if (activeTab === 'comments') return comments.filter(c => c.content?.toLowerCase().includes(s) || c.profiles?.username?.toLowerCase().includes(s));
    return posts.filter(p => p.caption?.toLowerCase().includes(s) || p.profiles?.username?.toLowerCase().includes(s));
  }, [filter, users, posts, comments, activeTab]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050506] text-zinc-800 dark:text-zinc-200 font-sans pb-10">
      
      {/* NOTIFICATIONS */}
      {notif && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z- px-6 py-3 rounded-full border shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${
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
            <button onClick={() => setShowVault(!showVault)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${showVault ? 'bg-amber-500 border-amber-600 text-black' : 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10'}`}>
              <Lock size={12} /> Security Vault
            </button>
            <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg">New Entry</button>
            <button onClick={fetchData} className="p-2 dark:bg-zinc-900 rounded-lg"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        
        {/* SECURITY VAULT */}
        {showVault && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 shadow-xl animate-in slide-in-from-top-4">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-amber-500" />
                  <h2 className="font-black text-xs uppercase text-amber-500">Auto-Censor Lexicon</h2>
                </div>
                <button onClick={() => setShowVault(false)}><X size={16} /></button>
             </div>
             <div className="flex gap-2 mb-4">
                <input type="text" value={newWord} onChange={(e) => setNewWord(e.target.value)} placeholder="ADD TERM..." className="bg-black/20 border border-amber-500/20 rounded-lg px-4 py-2 text-[10px] w-full" />
                <button onClick={() => { if(newWord) { setBannedWords([...bannedWords, newWord]); setNewWord(''); }}} className="bg-amber-500 text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase">Add</button>
             </div>
             <div className="flex flex-wrap gap-2">
                {bannedWords.map(word => (
                  <span key={word} className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1 rounded-md text-[10px] flex items-center gap-2 font-bold uppercase">
                    {word} <button onClick={() => setBannedWords(bannedWords.filter(w => w !== word))}><X size={10}/></button>
                  </span>
                ))}
             </div>
          </div>
        )}

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input type="text" placeholder={`Scrutinize ${activeTab}...`} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>

        {/* DATA LIST */}
        <div className="grid gap-3">
          {paginatedData.map((item) => (
            <div key={item.id} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-indigo-500/50 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-xs uppercase border border-indigo-500/20 shrink-0">
                    {(activeTab === 'users' ? item.username : item.profiles?.username)?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black uppercase tracking-tight">
                        {activeTab === 'users' ? item.username : (item.profiles?.username || 'ANON')}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">ID: {item.id.slice(0,8)}</span>
                      {/* Updated Date Field for Profiles schema */}
                      <span className="flex items-center gap-1 text-[9px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-bold">
                        <Clock size={8} /> {formatDate(activeTab === 'users' ? item.updated_at : item.created_at)}
                      </span>
                    </div>

                    <div className="mt-1">
                      {editingId === item.id ? (
                        <div className="flex gap-2">
                          <input autoFocus className="bg-zinc-100 dark:bg-zinc-800 border border-indigo-500 rounded px-2 py-1 text-xs outline-none w-full" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                          <button onClick={() => saveEdit(item.id, activeTab === 'posts' ? 'posts' : activeTab === 'comments' ? 'comments' : 'profiles')} className="text-emerald-500"><Check size={16}/></button>
                          <button onClick={() => setEditingId(null)} className="text-rose-500"><X size={16}/></button>
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          {activeTab === 'users' ? (
                            <div className="space-y-1">
                              <p className="flex items-center gap-1 font-bold text-zinc-800 dark:text-zinc-200">
                                <User size={10} className="text-indigo-500" /> {item.full_name || 'No Full Name'} 
                                <span className="ml-2 text-[9px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <ShieldCheck size={8}/> {item.role || 'user'}
                                </span>
                              </p>
                              {item.bio && (
                                <p className="flex items-start gap-1 opacity-70 italic leading-tight">
                                  <AlignLeft size={10} className="mt-0.5" /> {item.bio}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="leading-relaxed">{activeTab === 'posts' ? item.caption : item.content}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  <button onClick={() => { setEditingId(item.id); setEditValue(activeTab === 'posts' ? item.caption : activeTab === 'comments' ? item.content : item.username); }} className="p-2 text-zinc-400 hover:text-indigo-500"><Edit3 size={14} /></button>
                  <button onClick={() => setConfirmModal({ show: true, id: item.id, table: activeTab === 'posts' ? 'posts' : activeTab === 'comments' ? 'comments' : 'profiles' })} className="p-2 text-zinc-400 hover:text-rose-500"><Trash2 size={14} /></button>
                </div>
              </div>

              {activeTab === 'posts' && (
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button 
                    onClick={() => setExpandedPosts(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 hover:text-indigo-500"
                  >
                    <MessageSquare size={12} />
                    {comments.filter(c => c.post_id === item.id).length} Comments
                    {expandedPosts[item.id] ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                  </button>
                  
                  {expandedPosts[item.id] && (
                    <div className="mt-3 space-y-3 pl-4 border-l-2 border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-left-2">
                      {comments.filter(c => c.post_id === item.id).map(com => (
                        <div key={com.id} className="flex justify-between items-start group/com">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-indigo-400">{com.profiles?.username}:</span>
                              <span className="text-[8px] text-zinc-400 font-mono">{formatDate(com.created_at)}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500">{com.content}</span>
                          </div>
                          <button onClick={() => setConfirmModal({show: true, id: com.id, table: 'comments'})} className="opacity-0 group-hover/com:opacity-100 text-rose-500 p-1"><Trash2 size={10}/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl disabled:opacity-30 hover:bg-zinc-100 transition-all"><ChevronLeft size={18} /></button>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Page <span className="text-indigo-500">{currentPage}</span> of <span className="text-indigo-500">{totalPages}</span></div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl disabled:opacity-30 hover:bg-zinc-100 transition-all"><ChevronRight size={18} /></button>
          </div>
        )}
      </main>

      {/* CONFIRM MODAL */}
      {confirmModal?.show && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center">
            <AlertTriangle className="mx-auto text-rose-500 mb-4" size={32} />
            <h3 className="font-black text-xl uppercase mb-2 tracking-tighter">Purge Entry?</h3>
            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-8">This will be removed from the SMILE database forever.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 text-[10px] font-black uppercase hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl">Abort</button>
              <button onClick={executeDelete} className="flex-1 py-3 text-[10px] font-black uppercase bg-rose-500 text-white rounded-xl">Execute</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW ENTRY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-xs uppercase text-indigo-500">Inject New Data</h2>
              <button onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <select className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-xs outline-none border border-transparent focus:border-indigo-500 transition-all" value={manualData.userId} onChange={(e) => setManualData({...manualData, userId: e.target.value})}>
                <option value="">Select Identity...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
              {activeTab === 'comments' && (
                 <select className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-xs outline-none" value={manualData.postId} onChange={(e) => setManualData({...manualData, postId: e.target.value})}>
                  <option value="">Select Post...</option>
                  {posts.map(p => <option key={p.id} value={p.id}>{p.caption?.slice(0, 30)}...</option>)}
                </select>
              )}
              <textarea rows={4} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-xs outline-none border border-transparent focus:border-indigo-500 transition-all" value={activeTab === 'posts' ? manualData.caption : manualData.content} onChange={(e) => setManualData(activeTab === 'posts' ? {...manualData, caption: e.target.value} : {...manualData, content: e.target.value})} />
              <button onClick={handleManualSubmit} className="w-full bg-indigo-600 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Push to Production</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
