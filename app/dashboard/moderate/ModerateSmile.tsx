'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import {
  Trash2, Search, RefreshCw, Plus, CheckCircle2,
  AlertCircle, Loader2, ShieldAlert, X, Send, ChevronLeft, ChevronRight,
  Edit3, Check, ChevronDown, ChevronUp, MessageSquare, Lock, AlertTriangle,
  Clock, User, ShieldCheck, AlignLeft, Ban, Eye, EyeOff,
  ZapOff, Zap, BarChart2, Flag, Users, FileText, Hash,
  Filter, Layers, Activity, Radio
} from 'lucide-react';

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 20;
const VAULT_KEY = 'smile_banned_words';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatDate = (d: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('ro-RO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const loadVault = (): string[] => {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    return raw ? JSON.parse(raw) : ['spam', 'scam', 'toxic'];
  } catch { return ['spam', 'scam', 'toxic']; }
};

const saveVault = (words: string[]) => {
  try { localStorage.setItem(VAULT_KEY, JSON.stringify(words)); } catch {}
};

function applyCensor(text: string, words: string[]): string {
  let s = text;
  words.forEach(w => {
    if (!w.trim()) return;
    const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    s = s.replace(re, '***');
  });
  return s;
}

function hasBannedWord(text: string, words: string[]): boolean {
  if (!text) return false;
  return words.some(w => {
    if (!w.trim()) return false;
    const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    return re.test(text);
  });
}

function highlightBanned(text: string, words: string[]): React.ReactNode {
  if (!text || !words.length) return text;
  const pattern = words.filter(w => w.trim()).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  if (!pattern) return text;
  const parts = text.split(new RegExp(`(${pattern})`, 'gi'));
  return parts.map((part, i) =>
    words.some(w => w && part.toLowerCase() === w.toLowerCase())
      ? <mark key={i} className="bg-red-500/20 text-red-400 rounded px-0.5 font-bold not-italic">{part}</mark>
      : part
  );
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

const TabItem = ({ active, onClick, label, count, flagged }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 relative ${
      active
        ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-500'
        : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800/50'
    }`}
  >
    {label}
    <span className="opacity-40 font-mono">{count}</span>
    {flagged > 0 && (
      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[7px] font-black flex items-center justify-center">
        {flagged > 9 ? '9+' : flagged}
      </span>
    )}
  </button>
);

function Toast({ notif }: { notif: { msg: string; type: 'success' | 'error' } | null }) {
  if (!notif) return null;
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full border shadow-2xl flex items-center gap-3 transition-all ${
      notif.type === 'success'
        ? 'bg-zinc-900 border-emerald-500 text-emerald-400'
        : 'bg-zinc-900 border-rose-500 text-rose-400'
    }`}>
      {notif.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
      <span className="text-[10px] font-black uppercase tracking-widest">{notif.msg}</span>
    </div>
  );
}

// Stats Card
function StatCard({ icon, label, value, sub, color }: any) {
  return (
    <div className={`rounded-2xl p-4 border bg-white dark:bg-zinc-900 ${color || 'border-zinc-200 dark:border-zinc-800'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-500">{icon}</span>
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
      </div>
      <div className="text-2xl font-black dark:text-white">{value}</div>
      {sub && <div className="text-[9px] text-zinc-500 mt-0.5">{sub}</div>}
    </div>
  );
}

// User Avatar with live dot
function UserAvatar({ username, avatarUrl, isLive, role }: any) {
  const [err, setErr] = useState(false);
  const initial = username?.[0]?.toUpperCase() || '?';
  const roleColor = role === 'admin' ? 'border-amber-500' : role === 'banned' ? 'border-red-500' : 'border-indigo-500/20';

  return (
    <div className="relative shrink-0">
      <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${roleColor} bg-indigo-500/10 flex items-center justify-center`}>
        {!err && avatarUrl ? (
          <img src={avatarUrl} className="w-full h-full object-cover" onError={() => setErr(true)} alt="" />
        ) : (
          <span className="text-indigo-500 font-black text-xs">{initial}</span>
        )}
      </div>
      {isLive && (
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-zinc-900 animate-pulse" />
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function ModerateSmile() {
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'comments'>('posts');

  const [bannedWords, setBannedWords] = useState<string[]>(loadVault);
  const [newWord, setNewWord] = useState('');
  const [showVault, setShowVault] = useState(false);
  const [showStats, setShowStats] = useState(true);

  const [filter, setFilter] = useState('');
  const [filterFlagged, setFilterFlagged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; id: string; table: string } | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const [manualData, setManualData] = useState({ caption: '', content: '', userId: '', postId: '' });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Bulk select
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [realtimeActive, setRealtimeActive] = useState(false);

  // ── Notify ──
  const addNotify = useCallback((msg: string, type: 'success' | 'error') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  }, []);

  // ── Vault persistence ──
  useEffect(() => { saveVault(bannedWords); }, [bannedWords]);

  // ── Fetch ──
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [pData, uData, cData] = await Promise.all([
        supabase.from('posts')
          .select('*, profiles(id, username, avatar_url, role, is_live)')
          .order('created_at', { ascending: false }),
        supabase.from('profiles')
          .select('*')
          .order('username', { ascending: true }),
        supabase.from('comments')
          .select('*, profiles(username, avatar_url, role)')
          .order('created_at', { ascending: false })
      ]);
      if (pData.data) setPosts(pData.data);
      if (uData.data) setUsers(uData.data);
      if (cData.data) setComments(cData.data);
    } catch { addNotify('Sync Error', 'error'); }
    setLoading(false);
  }, [addNotify]);

  // ── Realtime ──
  useEffect(() => {
    fetchData();
    const ch = supabase.channel('moderate-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData(true))
      .subscribe((status) => setRealtimeActive(status === 'SUBSCRIBED'));
    return () => { supabase.removeChannel(ch); };
  }, [fetchData]);

  useEffect(() => { setCurrentPage(1); setSelectedIds(new Set()); }, [filter, activeTab, filterFlagged]);

  // ── Stats ──
  const stats = useMemo(() => {
    const flaggedPosts = posts.filter(p => hasBannedWord(p.caption, bannedWords)).length;
    const flaggedComments = comments.filter(c => hasBannedWord(c.content, bannedWords)).length;
    const bannedUsers = users.filter(u => u.role === 'banned').length;
    const liveUsers = users.filter(u => u.is_live).length;
    return { flaggedPosts, flaggedComments, bannedUsers, liveUsers };
  }, [posts, comments, users, bannedWords]);

  // ── Filtered data ──
  const filteredData = useMemo(() => {
    const s = filter.toLowerCase().trim();
    let data: any[] = [];
    if (activeTab === 'users') {
      data = users.filter(u =>
        u.username?.toLowerCase().includes(s) || u.full_name?.toLowerCase().includes(s)
      );
      if (filterFlagged) data = data.filter(u => u.role === 'banned');
    } else if (activeTab === 'comments') {
      data = comments.filter(c =>
        c.content?.toLowerCase().includes(s) || c.profiles?.username?.toLowerCase().includes(s)
      );
      if (filterFlagged) data = data.filter(c => hasBannedWord(c.content, bannedWords));
    } else {
      data = posts.filter(p =>
        p.caption?.toLowerCase().includes(s) || p.profiles?.username?.toLowerCase().includes(s)
      );
      if (filterFlagged) data = data.filter(p => hasBannedWord(p.caption, bannedWords));
    }
    return data;
  }, [filter, users, posts, comments, activeTab, filterFlagged, bannedWords]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // ── Actions ──
  const saveEdit = async (id: string, table: string) => {
    setLoading(true);
    const sanitized = applyCensor(editValue, bannedWords);
    const col = table === 'posts' ? 'caption' : table === 'comments' ? 'content' : 'username';
    const { error } = await supabase.from(table).update({ [col]: sanitized }).eq('id', id);
    if (error) addNotify(error.message, 'error');
    else { addNotify('Update saved ✓', 'success'); setEditingId(null); fetchData(true); }
    setLoading(false);
  };

  const executeDelete = async () => {
    if (!confirmModal) return;
    setLoading(true);
    const { error } = await supabase.from(confirmModal.table).delete().eq('id', confirmModal.id);
    if (!error) { addNotify('Entry purged ✓', 'success'); fetchData(true); }
    else addNotify('Delete failed', 'error');
    setConfirmModal(null);
    setLoading(false);
  };

  const executeBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    const table = activeTab === 'users' ? 'profiles' : activeTab === 'comments' ? 'comments' : 'posts';
    setLoading(true);
    const { error } = await supabase.from(table).delete().in('id', ids);
    if (!error) {
      addNotify(`${ids.length} entries purged ✓`, 'success');
      setSelectedIds(new Set());
      setBulkConfirm(false);
      fetchData(true);
    } else addNotify('Bulk delete failed', 'error');
    setLoading(false);
  };

  const toggleBan = async (user: any) => {
    const newRole = user.role === 'banned' ? 'user' : 'banned';
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
    if (!error) {
      addNotify(newRole === 'banned' ? `@${user.username} banned ✓` : `@${user.username} unbanned ✓`, 'success');
      fetchData(true);
    } else addNotify('Action failed', 'error');
  };

  const sanitizeAll = async () => {
    setLoading(true);
    const table = activeTab === 'posts' ? 'posts' : 'comments';
    const col = activeTab === 'posts' ? 'caption' : 'content';
    const data = activeTab === 'posts' ? posts : comments;
    const flagged = data.filter(item => hasBannedWord(item[col], bannedWords));
    let count = 0;
    for (const item of flagged) {
      const clean = applyCensor(item[col] || '', bannedWords);
      const { error } = await supabase.from(table).update({ [col]: clean }).eq('id', item.id);
      if (!error) count++;
    }
    addNotify(`${count} entries sanitized ✓`, 'success');
    fetchData(true);
    setLoading(false);
  };

  const handleManualSubmit = async () => {
    if (!manualData.userId) return addNotify('Select Identity!', 'error');
    setLoading(true);
    const finalContent = applyCensor(
      activeTab === 'posts' ? manualData.caption : manualData.content,
      bannedWords
    );
    try {
      if (activeTab === 'posts') {
        await supabase.from('posts').insert([{
          user_id: manualData.userId,
          caption: finalContent,
          thumbnail_url: 'https://images.unsplash.com'
        }]);
      } else if (activeTab === 'comments') {
        if (!manualData.postId) throw new Error('Select Parent Post');
        await supabase.from('comments').insert([{
          post_id: manualData.postId,
          user_id: manualData.userId,
          content: finalContent
        }]);
      }
      addNotify('Published ✓', 'success');
      setShowModal(false);
      fetchData(true);
    } catch (err: any) { addNotify(err.message, 'error'); }
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginatedData.map((i: any) => i.id)));
  };

  const getTable = () =>
    activeTab === 'users' ? 'profiles' : activeTab === 'comments' ? 'comments' : 'posts';

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050506] text-zinc-800 dark:text-zinc-200 font-sans pb-16">
      <Toast notif={notif} />

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-[#050506]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 font-black text-indigo-500 italic text-lg uppercase tracking-tighter shrink-0">
              <ShieldAlert size={18} /> SMILE_OPS
              {/* Realtime indicator */}
              <span className={`w-2 h-2 rounded-full ml-1 ${realtimeActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} title={realtimeActive ? 'Realtime ON' : 'Connecting...'} />
            </div>

            <nav className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 border border-zinc-200 dark:border-zinc-800">
              <TabItem
                active={activeTab === 'posts'} onClick={() => setActiveTab('posts')}
                label="Posts" count={posts.length} flagged={stats.flaggedPosts}
              />
              <TabItem
                active={activeTab === 'comments'} onClick={() => setActiveTab('comments')}
                label="Comments" count={comments.length} flagged={stats.flaggedComments}
              />
              <TabItem
                active={activeTab === 'users'} onClick={() => setActiveTab('users')}
                label="Users" count={users.length} flagged={stats.bannedUsers}
              />
            </nav>
          </div>

          <div className="flex gap-2 items-center">
            {/* Realtime badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase border ${
              realtimeActive
                ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
                : 'border-zinc-700 text-zinc-600'
            }`}>
              <Radio size={10} className={realtimeActive ? 'animate-pulse' : ''} />
              {realtimeActive ? 'Live' : 'Offline'}
            </div>

            <button
              onClick={() => setShowStats(s => !s)}
              className="p-2 dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-indigo-500 transition-colors"
              title="Toggle Stats"
            >
              <BarChart2 size={14} />
            </button>

            <button
              onClick={() => setShowVault(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${
                showVault
                  ? 'bg-amber-500 border-amber-600 text-black'
                  : 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10'
              }`}
            >
              <Lock size={11} /> Vault
              {bannedWords.length > 0 && (
                <span className="bg-amber-500/20 text-amber-600 rounded-full px-1.5 text-[8px]">
                  {bannedWords.length}
                </span>
              )}
            </button>

            {activeTab !== 'users' && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <Plus size={12} /> New
              </button>
            )}

            <button
              onClick={() => fetchData()}
              className="p-2 dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-indigo-500 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 space-y-5">

        {/* ── STATS ── */}
        {showStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <StatCard icon={<FileText size={14}/>} label="Posts" value={posts.length} color="border-zinc-200 dark:border-zinc-800" />
            <StatCard icon={<MessageSquare size={14}/>} label="Comments" value={comments.length} color="border-zinc-200 dark:border-zinc-800" />
            <StatCard icon={<Users size={14}/>} label="Users" value={users.length} color="border-zinc-200 dark:border-zinc-800" />
            <StatCard icon={<Flag size={14} className="text-red-400"/>} label="Flagged Posts" value={stats.flaggedPosts} color="border-red-500/20 dark:border-red-500/20" />
            <StatCard icon={<Ban size={14} className="text-red-500"/>} label="Banned" value={stats.bannedUsers} color="border-red-500/20 dark:border-red-500/20" />
            <StatCard icon={<Radio size={14} className="text-emerald-400"/>} label="Live Now" value={stats.liveUsers} color={stats.liveUsers > 0 ? "border-emerald-500/30 dark:border-emerald-500/30" : "border-zinc-200 dark:border-zinc-800"} />
          </div>
        )}

        {/* ── VAULT ── */}
        {showVault && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-amber-500" size={16} />
                <h2 className="font-black text-xs uppercase text-amber-500 tracking-widest">
                  Auto-Censor Lexicon
                </h2>
                <span className="text-[9px] text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold">
                  Persistent · {bannedWords.length} terms
                </span>
              </div>
              <div className="flex gap-2">
                {(activeTab === 'posts' || activeTab === 'comments') && (
                  <button
                    onClick={sanitizeAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-[9px] font-black uppercase hover:bg-red-500/20 transition-all"
                  >
                    <Zap size={10} /> Sanitize All
                  </button>
                )}
                <button onClick={() => setShowVault(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newWord.trim()) {
                    setBannedWords(w => [...w, newWord.trim().toLowerCase()]);
                    setNewWord('');
                  }
                }}
                placeholder="Add term... (Enter)"
                className="bg-black/20 border border-amber-500/20 rounded-xl px-4 py-2 text-[11px] w-full outline-none focus:border-amber-500 transition-colors dark:text-white"
              />
              <button
                onClick={() => {
                  if (newWord.trim()) {
                    setBannedWords(w => [...w, newWord.trim().toLowerCase()]);
                    setNewWord('');
                  }
                }}
                className="bg-amber-500 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-amber-400 transition-colors shrink-0"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {bannedWords.map(word => (
                <span
                  key={word}
                  className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1 rounded-lg text-[10px] flex items-center gap-2 font-bold uppercase"
                >
                  {word}
                  <button
                    onClick={() => setBannedWords(bannedWords.filter(w => w !== word))}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X size={9} />
                  </button>
                </span>
              ))}
              {bannedWords.length === 0 && (
                <span className="text-zinc-600 text-[10px] italic">No terms added yet</span>
              )}
            </div>
          </div>
        )}

        {/* ── SEARCH + FILTERS ── */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all dark:text-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {filter && (
              <button onClick={() => setFilter('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Flagged filter */}
          <button
            onClick={() => setFilterFlagged(f => !f)}
            className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border text-[10px] font-black uppercase transition-all whitespace-nowrap ${
              filterFlagged
                ? 'bg-red-500/10 border-red-500/40 text-red-400'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-red-500/30'
            }`}
          >
            <Flag size={12} />
            {filterFlagged ? 'Flagged Only' : 'All'}
          </button>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <button
              onClick={() => setBulkConfirm(true)}
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase hover:bg-red-700 transition-all whitespace-nowrap"
            >
              <Trash2 size={12} /> Delete {selectedIds.size}
            </button>
          )}
        </div>

        {/* ── SELECT ALL BAR ── */}
        {paginatedData.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <button
              onClick={toggleSelectAll}
              className="text-[10px] font-black uppercase text-zinc-500 hover:text-indigo-500 transition-colors flex items-center gap-2"
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                selectedIds.size === paginatedData.length && paginatedData.length > 0
                  ? 'bg-indigo-500 border-indigo-500'
                  : 'border-zinc-600'
              }`}>
                {selectedIds.size === paginatedData.length && paginatedData.length > 0 && <Check size={10} className="text-white" />}
              </div>
              {selectedIds.size === paginatedData.length && paginatedData.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-[10px] text-zinc-600 font-bold">
              {filteredData.length} {activeTab}
              {filterFlagged && <span className="text-red-400 ml-1">· filtered flagged</span>}
            </span>
          </div>
        )}

        {/* ── LIST ── */}
        {loading && !posts.length ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-indigo-500" size={28} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Loading...</span>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <ShieldAlert size={36} className="text-zinc-700" />
            <span className="text-zinc-500 font-bold text-sm">No entries found</span>
            {filterFlagged && (
              <button onClick={() => setFilterFlagged(false)} className="text-indigo-500 text-xs font-black uppercase tracking-widest hover:underline">
                Show all
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-2.5">
            {paginatedData.map((item: any) => {
              const isBanned = item.role === 'banned';
              const isLive = item.is_live || item.profiles?.is_live;
              const text = activeTab === 'posts' ? item.caption : activeTab === 'comments' ? item.content : item.username;
              const flagged = activeTab !== 'users' && hasBannedWord(text, bannedWords);
              const profileData = activeTab === 'users' ? item : item.profiles;
              const username = activeTab === 'users' ? item.username : item.profiles?.username;
              const avatar = profileData?.avatar_url;
              const role = activeTab === 'users' ? item.role : item.profiles?.role;

              return (
                <div
                  key={item.id}
                  className={`group bg-white dark:bg-zinc-900 border rounded-2xl p-4 shadow-sm transition-all ${
                    selectedIds.has(item.id)
                      ? 'border-indigo-500/50 ring-1 ring-indigo-500/20'
                      : flagged
                      ? 'border-red-500/30 hover:border-red-500/50'
                      : isBanned
                      ? 'border-red-900/40 hover:border-red-500/40'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        selectedIds.has(item.id)
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'border-zinc-600 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {selectedIds.has(item.id) && <Check size={9} className="text-white" />}
                    </button>

                    <UserAvatar username={username} avatarUrl={avatar} isLive={isLive} role={role} />

                    <div className="flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-black uppercase tracking-tight dark:text-white">
                          {username || 'ANON'}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                          {item.id.slice(0, 8)}
                        </span>
                        {flagged && (
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                            <Flag size={8} /> Flagged
                          </span>
                        )}
                        {isBanned && (
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-500/20">
                            ⊘ Banned
                          </span>
                        )}
                        {isLive && (
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                          </span>
                        )}
                        <span className="text-[9px] text-zinc-500 flex items-center gap-1 ml-auto">
                          <Clock size={8} />
                          {formatDate(activeTab === 'users' ? item.updated_at : item.created_at)}
                        </span>
                      </div>

                      {/* Content */}
                      {editingId === item.id ? (
                        <div className="flex gap-2 mt-2">
                          <input
                            autoFocus
                            className="bg-zinc-100 dark:bg-zinc-800 border border-indigo-500 rounded-lg px-3 py-1.5 text-xs outline-none w-full dark:text-white"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(item.id, getTable());
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <button onClick={() => saveEdit(item.id, getTable())} className="text-emerald-500 hover:text-emerald-400 p-1.5"><Check size={15} /></button>
                          <button onClick={() => setEditingId(null)} className="text-rose-500 hover:text-rose-400 p-1.5"><X size={15} /></button>
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                          {activeTab === 'users' ? (
                            <div className="space-y-1">
                              <p className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                                <User size={10} className="text-indigo-400 shrink-0" />
                                {item.full_name || <span className="italic text-zinc-500">No full name</span>}
                                <span className="ml-1 text-[9px] bg-zinc-100 dark:bg-zinc-800 border dark:border-zinc-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <ShieldCheck size={8} className="text-indigo-400" /> {item.role || 'user'}
                                </span>
                                {item.agency_id && (
                                  <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded">Agency</span>
                                )}
                              </p>
                              {item.bio && (
                                <p className="flex items-start gap-1.5 text-zinc-500 italic leading-relaxed">
                                  <AlignLeft size={10} className="mt-0.5 shrink-0" /> {item.bio}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="leading-relaxed">
                              {flagged
                                ? highlightBanned(text || '', bannedWords)
                                : (text || <span className="italic text-zinc-600">No content</span>)
                              }
                            </p>
                          )}
                        </div>
                      )}

                      {/* User expanded posts */}
                      {activeTab === 'users' && (
                        <div className="mt-3">
                          <button
                            onClick={() => setExpandedUsers(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                            className="flex items-center gap-1.5 text-[9px] font-black uppercase text-zinc-500 hover:text-indigo-400 transition-colors"
                          >
                            <FileText size={10} />
                            {posts.filter(p => p.user_id === item.id).length} Posts ·{' '}
                            {comments.filter(c => c.user_id === item.id).length} Comments
                            {expandedUsers[item.id] ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>

                          {expandedUsers[item.id] && (
                            <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-zinc-100 dark:border-zinc-800">
                              {posts.filter(p => p.user_id === item.id).slice(0, 5).map(p => (
                                <div key={p.id} className="flex items-center justify-between group/up">
                                  <span className="text-[10px] text-zinc-500 truncate max-w-xs">
                                    {hasBannedWord(p.caption, bannedWords)
                                      ? highlightBanned(p.caption || '', bannedWords)
                                      : (p.caption || <span className="italic">No caption</span>)
                                    }
                                  </span>
                                  <button
                                    onClick={() => setConfirmModal({ show: true, id: p.id, table: 'posts' })}
                                    className="opacity-0 group-hover/up:opacity-100 text-rose-500 p-1 ml-2 shrink-0"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              ))}
                              {posts.filter(p => p.user_id === item.id).length > 5 && (
                                <span className="text-[9px] text-zinc-600 italic">
                                  +{posts.filter(p => p.user_id === item.id).length - 5} more posts
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Post comments expand */}
                      {activeTab === 'posts' && (
                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                          <button
                            onClick={() => setExpandedPosts(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                            className="flex items-center gap-1.5 text-[9px] font-black uppercase text-zinc-500 hover:text-indigo-400 transition-colors"
                          >
                            <MessageSquare size={10} />
                            {comments.filter(c => c.post_id === item.id).length} Comments
                            {expandedPosts[item.id] ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>

                          {expandedPosts[item.id] && (
                            <div className="mt-2 space-y-2 pl-3 border-l-2 border-zinc-100 dark:border-zinc-800">
                              {comments.filter(c => c.post_id === item.id).length === 0 ? (
                                <span className="text-[10px] text-zinc-600 italic">No comments</span>
                              ) : comments.filter(c => c.post_id === item.id).map(com => (
                                <div key={com.id} className="flex justify-between items-start group/com">
                                  <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-[10px] font-bold text-indigo-400">@{com.profiles?.username}</span>
                                      <span className="text-[8px] text-zinc-500 font-mono">{formatDate(com.created_at)}</span>
                                      {hasBannedWord(com.content, bannedWords) && (
                                        <span className="text-[8px] text-red-400 font-bold uppercase flex items-center gap-0.5">
                                          <Flag size={7} /> flagged
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-zinc-500">
                                      {hasBannedWord(com.content, bannedWords)
                                        ? highlightBanned(com.content, bannedWords)
                                        : com.content
                                      }
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => setConfirmModal({ show: true, id: com.id, table: 'comments' })}
                                    className="opacity-0 group-hover/com:opacity-100 text-rose-500 p-1 ml-2 shrink-0"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditValue(
                            activeTab === 'posts' ? (item.caption || '') :
                            activeTab === 'comments' ? (item.content || '') :
                            item.username
                          );
                        }}
                        className="p-2 text-zinc-400 hover:text-indigo-400 transition-colors rounded-lg hover:bg-indigo-500/10"
                        title="Edit"
                      >
                        <Edit3 size={13} />
                      </button>

                      {activeTab === 'users' && (
                        <button
                          onClick={() => toggleBan(item)}
                          className={`p-2 transition-colors rounded-lg ${
                            isBanned
                              ? 'text-emerald-400 hover:bg-emerald-500/10'
                              : 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
                          }`}
                          title={isBanned ? 'Unban user' : 'Ban user'}
                        >
                          <Ban size={13} />
                        </button>
                      )}

                      <button
                        onClick={() => setConfirmModal({ show: true, id: item.id, table: getTable() })}
                        className="p-2 text-zinc-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl disabled:opacity-30 hover:border-indigo-500/40 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const page = Math.max(1, currentPage - 3) + i;
                if (page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${
                      currentPage === page
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-indigo-500/40'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl disabled:opacity-30 hover:border-indigo-500/40 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>

      {/* ── CONFIRM DELETE MODAL ── */}
      {confirmModal?.show && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-rose-500" size={28} />
            </div>
            <h3 className="font-black text-lg uppercase mb-2 tracking-tighter dark:text-white">Purge Entry?</h3>
            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-8 leading-relaxed">
              This will be removed from the SMILE database forever. Action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3 text-[10px] font-black uppercase rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Abort
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-3 text-[10px] font-black uppercase bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BULK DELETE CONFIRM ── */}
      {bulkConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-rose-500" size={28} />
            </div>
            <h3 className="font-black text-lg uppercase mb-2 tracking-tighter dark:text-white">Bulk Purge?</h3>
            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-8">
              Delete <span className="text-rose-400">{selectedIds.size} entries</span> permanently?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setBulkConfirm(false)} className="flex-1 py-3 text-[10px] font-black uppercase rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">Abort</button>
              <button onClick={executeBulkDelete} className="flex-1 py-3 text-[10px] font-black uppercase bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all">Execute</button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW ENTRY MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-sm uppercase text-indigo-500 tracking-widest">Inject New Data</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <select
                className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-xs outline-none border border-transparent focus:border-indigo-500 transition-all dark:text-white"
                value={manualData.userId}
                onChange={(e) => setManualData({ ...manualData, userId: e.target.value })}
              >
                <option value="">Select Identity...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>@{u.username}{u.full_name ? ` — ${u.full_name}` : ''}</option>
                ))}
              </select>

              {activeTab === 'comments' && (
                <select
                  className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-xs outline-none border border-transparent focus:border-indigo-500 transition-all dark:text-white"
                  value={manualData.postId}
                  onChange={(e) => setManualData({ ...manualData, postId: e.target.value })}
                >
                  <option value="">Select Parent Post...</option>
                  {posts.map(p => (
                    <option key={p.id} value={p.id}>{p.caption?.slice(0, 50) || 'Untitled'}</option>
                  ))}
                </select>
              )}

              <textarea
                rows={4}
                className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-xs outline-none border border-transparent focus:border-indigo-500 transition-all resize-none dark:text-white"
                placeholder={activeTab === 'posts' ? 'Caption...' : 'Comment content...'}
                value={activeTab === 'posts' ? manualData.caption : manualData.content}
                onChange={(e) => setManualData(
                  activeTab === 'posts'
                    ? { ...manualData, caption: e.target.value }
                    : { ...manualData, content: e.target.value }
                )}
              />

              {bannedWords.some(w => hasBannedWord(
                activeTab === 'posts' ? manualData.caption : manualData.content,
                bannedWords
              )) && (
                <div className="flex items-center gap-2 text-amber-500 text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                  <AlertTriangle size={12} /> Banned words detected — will be auto-censored on publish
                </div>
              )}

              <button
                onClick={handleManualSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Push to Production
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}