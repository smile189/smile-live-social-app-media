"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import {
  Trash2, Search, LayoutGrid, List, Eye, Film,
  ChevronLeft, ChevronRight, Loader2, X, Check,
  Filter, ArrowUpDown, RefreshCw, TrendingUp,
  Image as ImageIcon, AlertTriangle, Copy, Heart,
  Radio, Users, Star
} from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ITEMS_PER_PAGE = 12;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getMediaInfo(post: any) {
  const isVideo = post.type === 'video' || !!post.bunny_video_id || !!post.video_url;
  const thumbnailUrl = post.thumbnail_url || post.media_url || null;
  const videoUrl = post.video_url || post.media_url || null;
  const imageUrl = post.media_url || post.thumbnail_url || null;
  return { isVideo, thumbnailUrl, videoUrl, imageUrl };
}

function getLikesCount(post: any): number {
  if (Array.isArray(post.likes)) {
    // Supabase aggregate: [{ count: N }]
    if (post.likes.length > 0 && typeof post.likes[0]?.count === 'number') {
      return post.likes[0].count;
    }
    return post.likes.length;
  }
  return 0;
}

function formatNum(n: number | null | undefined): string {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function Toast({ toast }: { toast: { msg: string; type: 'success' | 'error' } | null }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl backdrop-blur-sm ${
            toast.type === 'success'
              ? 'bg-emerald-500/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}
        >
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── STATS BAR ────────────────────────────────────────────────────────────────

function StatsBar({ posts }: { posts: any[] }) {
  const videos = posts.filter(p => p.type === 'video' || p.bunny_video_id || p.video_url).length;
  const images = posts.length - videos;
  const promoted = posts.filter(p => p.is_promoted).length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views_count || 0), 0);
  const totalLikes = posts.reduce((acc, p) => acc + getLikesCount(p), 0);
  const liveUsers = posts.filter(p => p.profiles?.is_live).length;

  const stats = [
    { label: 'Total Posts', value: posts.length, icon: <ImageIcon size={14} />, accent: '' },
    { label: 'Videos', value: videos, icon: <Film size={14} />, accent: '' },
    { label: 'Images', value: images, icon: <ImageIcon size={14} />, accent: '' },
    { label: 'Total Views', value: formatNum(totalViews), icon: <Eye size={14} />, accent: '' },
    { label: 'Total Likes', value: formatNum(totalLikes), icon: <Heart size={14} />, accent: 'pink' },
    { label: 'Promoted', value: promoted, icon: <Star size={14} />, accent: 'amber' },
    { label: 'Live Now', value: liveUsers, icon: <Radio size={14} />, accent: liveUsers > 0 ? 'red' : '' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {stats.map(s => (
        <div
          key={s.label}
          className={`rounded-2xl p-4 border transition-all ${
            s.accent === 'amber' ? 'bg-amber-500/10 border-amber-500/30' :
            s.accent === 'pink'  ? 'bg-pink-500/10 border-pink-500/30' :
            s.accent === 'red'   ? 'bg-red-500/10 border-red-500/30' :
            'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <div className={`flex items-center gap-1.5 mb-1 ${
            s.accent === 'amber' ? 'text-amber-500' :
            s.accent === 'pink'  ? 'text-pink-400' :
            s.accent === 'red'   ? 'text-red-400' :
            'text-zinc-500'
          }`}>
            {s.icon}
          </div>
          <div className={`text-xl font-black ${
            s.accent === 'amber' ? 'text-amber-500' :
            s.accent === 'pink'  ? 'text-pink-400' :
            s.accent === 'red'   ? 'text-red-400' :
            'dark:text-white text-zinc-900'
          }`}>
            {s.value}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-0.5 leading-tight">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────

function Avatar({ profile }: { profile: any }) {
  const [err, setErr] = useState(false);
  if (!profile) return (
    <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
      <Users size={10} className="text-zinc-400" />
    </div>
  );
  return (
    <div className="relative">
      {!err && profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          className="w-6 h-6 rounded-full object-cover border border-zinc-700"
          onError={() => setErr(true)}
          alt=""
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] font-black text-zinc-300 uppercase">
          {profile.username?.[0] || '?'}
        </div>
      )}
      {profile.is_live && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border border-zinc-900 animate-pulse" />
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function ContentSmile() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'video' | 'image'>('all');
  const [filterPromoted, setFilterPromoted] = useState(false);
  const [filterLive, setFilterLive] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'likes'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchContent = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const ascending = sortBy === 'oldest';
    const orderField = sortBy === 'views' ? 'views_count'
      : sortBy === 'likes' ? 'views_count' // fallback, sorted client-side
      : 'created_at';

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles(id, username, full_name, avatar_url, role, is_live, viewer_count, live_color, agency_id),
        likes(count)
      `)
      .order(orderField, { ascending: sortBy === 'views' ? false : ascending });

    if (!error && data) {
      let result = data;
      // Sort by likes client-side (aggregate count)
      if (sortBy === 'likes') {
        result = [...data].sort((a, b) => getLikesCount(b) - getLikesCount(a));
      }
      setPosts(result);
    }
    if (error) showToast('Eroare la încărcare', 'error');

    setLoading(false);
    setRefreshing(false);
  }, [sortBy]);

  useEffect(() => {
    fetchContent();
    const channel = supabase
      .channel('posts-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchContent(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => fetchContent(true))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchContent]);

  const executeDelete = async (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) { showToast('Eroare la ștergere', 'error'); fetchContent(true); }
    else showToast('Post șters cu succes ✓');
    setDeleteConfirmId(null);
  };

  const executeBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    setPosts(prev => prev.filter(p => !ids.includes(p.id)));
    await supabase.from('posts').delete().in('id', ids);
    setSelectedIds(new Set());
    setBulkDeleteConfirm(false);
    showToast(`${ids.length} posturi șterse ✓`);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchesSearch = !search
        || p.caption?.toLowerCase().includes(search.toLowerCase())
        || p.profiles?.username?.toLowerCase().includes(search.toLowerCase())
        || p.profiles?.full_name?.toLowerCase().includes(search.toLowerCase());

      const { isVideo } = getMediaInfo(p);
      const matchesType = filterType === 'all' ? true
        : filterType === 'video' ? isVideo : !isVideo;

      const matchesPromoted = !filterPromoted || p.is_promoted;
      const matchesLive = !filterLive || p.profiles?.is_live;

      return matchesSearch && matchesType && matchesPromoted && matchesLive;
    });
  }, [posts, search, filterType, filterPromoted, filterLive]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const activeFiltersCount = [
    filterType !== 'all',
    filterPromoted,
    filterLive,
    sortBy !== 'newest',
  ].filter(Boolean).length;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen font-sans">
      <Toast toast={toast} />

      {/* ── HEADER ── */}
      <div className="flex flex-col space-y-6 border-b dark:border-zinc-900 pb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter dark:text-white leading-none">
              Content <span className="text-amber-500 italic">Smile</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">
              {filtered.length} matching entries
              {selectedIds.size > 0 && (
                <span className="text-amber-500 ml-3">· {selectedIds.size} selected</span>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-80 group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors"
                size={16}
              />
              <input
                placeholder="Caută după text, user, nume..."
                className="w-full pl-12 pr-9 py-3 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl outline-none focus:border-amber-500 transition-all text-xs font-bold shadow-sm dark:text-white"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Bulk delete */}
            {selectedIds.size > 0 && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setBulkDeleteConfirm(true)}
                className="px-4 py-3 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg"
              >
                <Trash2 size={14} /> Delete {selectedIds.size}
              </motion.button>
            )}

            {/* Refresh */}
            <button
              onClick={() => fetchContent(true)}
              className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 text-zinc-500 hover:text-amber-500 hover:border-amber-500 transition-all"
              title="Refresh"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest relative ${
                showFilters
                  ? 'bg-amber-500 border-amber-600 text-black'
                  : 'bg-white dark:bg-zinc-900 dark:border-zinc-800 text-zinc-500'
              }`}
            >
              <Filter size={16} /> Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View */}
            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border dark:border-zinc-800 shadow-inner">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-amber-500 shadow-xl' : 'text-zinc-500'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-zinc-800 text-amber-500 shadow-xl' : 'text-zinc-500'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ── FILTRE ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 overflow-hidden"
            >
              {/* Media Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                  <Film size={12} /> Media Type
                </label>
                <div className="flex gap-2">
                  {(['all', 'video', 'image'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => { setFilterType(t); setCurrentPage(1); }}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                        filterType === t
                          ? 'bg-zinc-900 text-white border-zinc-800 dark:bg-white dark:text-black'
                          : 'bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-500 hover:border-zinc-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                  <ArrowUpDown size={12} /> Sort
                </label>
                <div className="flex gap-1">
                  {([
                    { val: 'newest', label: 'Nou' },
                    { val: 'oldest', label: 'Vechi' },
                    { val: 'views',  label: 'Views' },
                    { val: 'likes',  label: 'Likes' },
                  ] as const).map(s => (
                    <button
                      key={s.val}
                      onClick={() => setSortBy(s.val)}
                      className={`flex-1 py-2 rounded-xl text-[9px] font-bold uppercase border transition-all ${
                        sortBy === s.val
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                          : 'bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-500 hover:border-zinc-600'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Promoted */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                  <Star size={12} /> Promoted
                </label>
                <button
                  onClick={() => { setFilterPromoted(p => !p); setCurrentPage(1); }}
                  className={`w-full py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                    filterPromoted
                      ? 'bg-amber-500 text-black border-amber-600'
                      : 'bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-500 hover:border-zinc-600'
                  }`}
                >
                  {filterPromoted ? '★ Only Promoted' : 'Show All'}
                </button>
              </div>

              {/* Live */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                  <Radio size={12} /> Live Users
                </label>
                <button
                  onClick={() => { setFilterLive(p => !p); setCurrentPage(1); }}
                  className={`w-full py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                    filterLive
                      ? 'bg-red-500 text-white border-red-600'
                      : 'bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-500 hover:border-zinc-600'
                  }`}
                >
                  {filterLive ? '● Live Only' : 'Show All'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── STATS ── */}
      {!loading && <StatsBar posts={posts} />}

      {/* ── BULK DELETE MODAL ── */}
      <AnimatePresence>
        {bulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl mx-4"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <h3 className="text-white font-black text-lg mb-2">Ești sigur?</h3>
              <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
                Vei șterge permanent{' '}
                <span className="text-red-400 font-bold">{selectedIds.size} posturi</span>.{' '}
                Acțiunea este ireversibilă.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setBulkDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-2xl bg-zinc-800 text-white text-xs font-bold hover:bg-zinc-700 transition-all"
                >
                  Anulează
                </button>
                <button
                  onClick={executeBulkDelete}
                  className="flex-1 py-3 rounded-2xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all"
                >
                  Șterge tot
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTENT ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-40 flex flex-col items-center gap-4"
          >
            <Loader2 className="animate-spin text-amber-500" size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Processing Cloud Assets...
            </span>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-40 flex flex-col items-center gap-4 text-center"
          >
            <ImageIcon size={48} className="text-zinc-700" />
            <span className="text-zinc-500 font-bold text-sm">Niciun rezultat găsit</span>
            <button
              onClick={() => {
                setSearch('');
                setFilterType('all');
                setFilterPromoted(false);
                setFilterLive(false);
              }}
              className="text-amber-500 text-xs font-black uppercase tracking-widest hover:underline"
            >
              Resetează filtrele
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10"
          >
            {viewMode === 'grid' ? (
              <>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (selectedIds.size === paginatedData.length) setSelectedIds(new Set());
                      else setSelectedIds(new Set(paginatedData.map(p => p.id)));
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors"
                  >
                    {selectedIds.size === paginatedData.length && paginatedData.length > 0
                      ? 'Deselectează tot'
                      : 'Selectează tot'}
                  </button>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase">
                    {paginatedData.length} / {filtered.length} posturi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {paginatedData.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <ContentCard
                        post={post}
                        deleteConfirmId={deleteConfirmId}
                        executeDelete={executeDelete}
                        setDeleteConfirmId={setDeleteConfirmId}
                        selected={selectedIds.has(post.id)}
                        onSelect={() => toggleSelect(post.id)}
                        showToast={showToast}
                      />
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <TableView
                data={paginatedData}
                selectedIds={selectedIds}
                toggleSelect={toggleSelect}
                selectAll={() => {
                  if (selectedIds.size === paginatedData.length) setSelectedIds(new Set());
                  else setSelectedIds(new Set(paginatedData.map(p => p.id)));
                }}
                deleteConfirmId={deleteConfirmId}
                setDeleteConfirmId={setDeleteConfirmId}
                executeDelete={executeDelete}
                showToast={showToast}
              />
            )}

            {/* ── PAGINARE ── */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 py-10">
                <button
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0); }}
                  className="p-4 rounded-[1.5rem] bg-white dark:bg-zinc-900 border dark:border-zinc-800 disabled:opacity-20 hover:border-amber-500 transition-all shadow-xl dark:text-white"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1.5">
                  {(() => {
                    const pages: number[] = [];
                    const delta = 2;
                    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
                      pages.push(i);
                    }
                    return pages.map(page => (
                      <button
                        key={page}
                        onClick={() => { setCurrentPage(page); window.scrollTo(0, 0); }}
                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                          currentPage === page
                            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                            : 'bg-white dark:bg-zinc-900 border dark:border-zinc-800 text-zinc-500 hover:border-amber-500'
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0); }}
                  className="p-4 rounded-[1.5rem] bg-white dark:bg-zinc-900 border dark:border-zinc-800 disabled:opacity-20 hover:border-amber-500 transition-all shadow-xl dark:text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TABLE VIEW ───────────────────────────────────────────────────────────────

function TableView({ data, selectedIds, toggleSelect, selectAll, deleteConfirmId, setDeleteConfirmId, executeDelete, showToast }: any) {
  return (
    <div className="overflow-x-auto bg-white dark:bg-zinc-950 border dark:border-zinc-900 rounded-[2.5rem] shadow-2xl">
      <table className="w-full text-left min-w-[1000px]">
        <thead className="text-[10px] font-black uppercase text-zinc-400 border-b dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
          <tr>
            <th className="px-6 py-5">
              <input
                type="checkbox"
                checked={selectedIds.size === data.length && data.length > 0}
                onChange={selectAll}
                className="accent-amber-500 w-4 h-4"
              />
            </th>
            <th className="px-6 py-5 italic text-amber-500">Asset</th>
            <th className="px-6 py-5">User</th>
            <th className="px-6 py-5 italic">Caption</th>
            <th className="px-6 py-5">
              <span className="flex items-center gap-1"><Eye size={10}/> Views</span>
            </th>
            <th className="px-6 py-5">
              <span className="flex items-center gap-1"><Heart size={10}/> Likes</span>
            </th>
            <th className="px-6 py-5">Tip</th>
            <th className="px-6 py-5">Dată</th>
            <th className="px-6 py-5 text-right">Acțiuni</th>
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-zinc-900/50">
          {data.map((post: any) => {
            const { isVideo, thumbnailUrl, videoUrl, imageUrl } = getMediaInfo(post);
            const likesCount = getLikesCount(post);
            const profile = post.profiles;

            return (
              <tr
                key={post.id}
                className={`hover:bg-amber-500/[0.02] transition-colors group ${
                  selectedIds.has(post.id) ? 'bg-amber-500/5' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(post.id)}
                    onChange={() => toggleSelect(post.id)}
                    className="accent-amber-500 w-4 h-4"
                  />
                </td>

                {/* Thumbnail */}
                <td className="px-6 py-4">
                  <div className="w-12 h-14 rounded-2xl overflow-hidden bg-zinc-900 shadow-md relative">
                    {isVideo ? (
                      <>
                        {thumbnailUrl && (
                          <img
                            src={thumbnailUrl}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt=""
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <video
                          src={videoUrl ? `${videoUrl}#t=0.1` : undefined}
                          poster={thumbnailUrl || undefined}
                          className="absolute inset-0 w-full h-full object-cover"
                          muted
                          preload="none"
                        />
                      </>
                    ) : (
                      <img
                        src={imageUrl || ''}
                        className="w-full h-full object-cover"
                        alt=""
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    {deleteConfirmId === post.id && (
                      <div className="absolute inset-0 bg-red-600/90 flex items-center justify-center">
                        <button onClick={() => executeDelete(post.id)}>
                          <Check className="text-white" size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </td>

                {/* User */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Avatar profile={profile} />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-amber-500 uppercase italic">
                        @{profile?.username || '—'}
                      </span>
                      {profile?.full_name && (
                        <span className="text-[9px] text-zinc-500 font-medium">{profile.full_name}</span>
                      )}
                      {profile?.is_live && (
                        <span className="text-[8px] font-black text-red-400 uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                          LIVE · {formatNum(profile.viewer_count)} viewers
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Caption */}
                <td className="px-6 py-4 text-[11px] font-bold dark:text-zinc-300 italic truncate max-w-[200px]">
                  {post.caption || <span className="text-zinc-600 not-italic font-normal">Fără descriere</span>}
                </td>

                {/* Views */}
                <td className="px-6 py-4">
                  <span className="text-[11px] font-black text-zinc-400">
                    {formatNum(post.views_count)}
                  </span>
                </td>

                {/* Likes */}
                <td className="px-6 py-4">
                  <span className={`text-[11px] font-black flex items-center gap-1 ${
                    likesCount > 0 ? 'text-pink-400' : 'text-zinc-600'
                  }`}>
                    <Heart size={10} className={likesCount > 0 ? 'fill-pink-400' : ''} />
                    {formatNum(likesCount)}
                  </span>
                </td>

                {/* Type */}
                <td className="px-6 py-4">
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full whitespace-nowrap ${
                    isVideo
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {isVideo ? '▶ Video' : '◆ Image'}
                  </span>
                  {post.is_promoted && (
                    <span className="ml-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                      ★
                    </span>
                  )}
                </td>

                {/* Date */}
                <td className="px-6 py-4 text-[10px] text-zinc-500 font-bold whitespace-nowrap">
                  {formatDate(post.created_at)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 text-zinc-500">
                    <button
                      onClick={() => {
                        const url = isVideo ? videoUrl : imageUrl;
                        if (url) window.open(url);
                      }}
                      className="p-2 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-500/10"
                      title="Preview"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => {
                        const url = isVideo ? videoUrl : imageUrl;
                        if (url) {
                          navigator.clipboard.writeText(url);
                          showToast('URL copiat!');
                        }
                      }}
                      className="p-2 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-500/10"
                      title="Copiază URL"
                    >
                      <Copy size={15} />
                    </button>
                    {deleteConfirmId === post.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => executeDelete(post.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-zinc-800 text-white rounded-lg text-[9px] font-black uppercase"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(post.id)}
                        className="p-2 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                        title="Șterge"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────

function ContentCard({ post, deleteConfirmId, executeDelete, setDeleteConfirmId, selected, onSelect, showToast }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isVideo, thumbnailUrl, videoUrl, imageUrl } = getMediaInfo(post);
  const likesCount = getLikesCount(post);
  const profile = post.profiles;

  const handleMouseEnter = () => {
    if (isVideo && videoRef.current) videoRef.current.play().catch(() => {});
  };
  const handleMouseLeave = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group bg-white dark:bg-[#0A0A0B] border rounded-[2rem] overflow-hidden shadow-sm hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-500 relative ${
        selected
          ? 'border-amber-500 ring-2 ring-amber-500/20'
          : 'border-zinc-200 dark:border-zinc-900'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className={`absolute top-3 left-3 z-30 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-md ${
          selected
            ? 'bg-amber-500 border-amber-500 opacity-100'
            : 'bg-black/50 border-white/30 opacity-0 group-hover:opacity-100'
        }`}
      >
        {selected && <Check size={11} className="text-black font-black" />}
      </button>

      {/* Badges top-right */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1 items-end">
        {post.is_promoted && (
          <span className="bg-amber-500 text-black text-[7px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest shadow">
            ★ Promo
          </span>
        )}
        {profile?.is_live && (
          <span className="bg-red-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest flex items-center gap-1 shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      {/* Media */}
      <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden">
        {isVideo ? (
          <>
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                className="absolute inset-0 w-full h-full object-cover"
                alt=""
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <video
              ref={videoRef}
              src={videoUrl ? `${videoUrl}#t=0.1` : undefined}
              poster={thumbnailUrl || undefined}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              preload="none"
              muted
              loop
              playsInline
            />
          </>
        ) : (
          <img
            src={imageUrl || ''}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            alt={post.caption || ''}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center z-10">
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => { const url = isVideo ? videoUrl : imageUrl; if (url) window.open(url); }}
              className="p-3 bg-white text-black rounded-full hover:bg-amber-500 transition-all shadow-xl"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => {
                const url = isVideo ? videoUrl : imageUrl;
                if (url) { navigator.clipboard.writeText(url); showToast('URL copiat!'); }
              }}
              className="p-3 bg-white/20 backdrop-blur text-white rounded-full hover:bg-white/30 transition-all shadow-xl"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() => setDeleteConfirmId(post.id)}
              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-xl"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Delete confirm */}
        <AnimatePresence>
          {deleteConfirmId === post.id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-20 bg-zinc-950/97 flex flex-col items-center justify-center p-6 text-center"
            >
              <AlertTriangle className="text-red-500 mb-3" size={28} />
              <span className="text-[10px] font-black uppercase text-red-400 mb-4 tracking-[0.2em]">
                Șterge permanent?
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => executeDelete(post.id)}
                  className="p-3.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition-all"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="p-3.5 bg-zinc-800 rounded-full text-white hover:bg-zinc-700 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Type badge */}
        <span className={`absolute top-3 left-3 backdrop-blur-md p-1.5 rounded-xl border border-white/10 z-10 transition-opacity ${
          selected ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
        } ${isVideo ? 'bg-black/50 text-amber-400' : 'bg-black/50 text-blue-400'}`}>
          {isVideo ? <Film size={11} /> : <ImageIcon size={11} />}
        </span>

        {/* Stats bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          {(post.views_count || 0) > 0 && (
            <span className="bg-black/60 backdrop-blur text-white text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1">
              <Eye size={9} /> {formatNum(post.views_count)}
            </span>
          )}
          {likesCount > 0 && (
            <span className="bg-black/60 backdrop-blur text-pink-300 text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1">
              <Heart size={9} className="fill-pink-300" /> {formatNum(likesCount)}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Avatar profile={profile} />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase text-amber-500 italic tracking-tight truncate">
              @{profile?.username || 'user'}
            </span>
            {profile?.role && profile.role !== 'user' && (
              <span className="text-[8px] font-bold uppercase text-zinc-600 tracking-widest">
                {profile.role}
              </span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2 text-[9px] font-black text-zinc-600 shrink-0">
            {(post.views_count || 0) > 0 && (
              <span className="flex items-center gap-0.5">
                <Eye size={9} /> {formatNum(post.views_count)}
              </span>
            )}
            {likesCount > 0 && (
              <span className="flex items-center gap-0.5 text-pink-400">
                <Heart size={9} className="fill-pink-400" /> {formatNum(likesCount)}
              </span>
            )}
          </div>
        </div>

        <p className="text-[10px] font-medium dark:text-zinc-500 line-clamp-2 leading-relaxed italic">
          {post.caption ? `"${post.caption}"` : <span className="not-italic text-zinc-700">Fără descriere</span>}
        </p>

        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[8px] text-zinc-700 font-bold">{formatDate(post.created_at)}</span>
          {post.promo_amount > 0 && (
            <span className="text-[8px] font-black uppercase text-amber-500">
              ${post.promo_amount} promo
            </span>
          )}
        </div>
      </div>
    </div>
  );
}