"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Trash2, Search, LayoutGrid, List, Eye, Film, 
  ChevronLeft, ChevronRight, Loader2, X, Check,
  Filter, ArrowUpDown, RefreshCw, Download, 
  TrendingUp, Image as ImageIcon, AlertTriangle,
  Copy, ExternalLink, MoreHorizontal
} from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ITEMS_PER_PAGE = 12;

// ─── HELPERS ────────────────────────────────────────────────────────────────
function getMediaInfo(post: any) {
  const isVideo = post.type === 'video' || !!post.bunny_video_id || !!post.video_url;
  const isBunny = !!post.bunny_video_id && !!post.bunny_library_id;

  // Thumbnail: preferă thumbnail_url explicit, fallback la media_url pentru imagini
  const thumbnailUrl = post.thumbnail_url
    || (isBunny ? `https://vz-xxxxxxxx.b-cdn.net/${post.bunny_video_id}/thumbnail.jpg` : null)
    || post.media_url
    || null;

  // Video src
  const videoUrl = post.video_url || post.media_url || null;

  // Display pentru imagini
  const imageUrl = post.media_url || post.thumbnail_url || null;

  return { isVideo, isBunny, thumbnailUrl, videoUrl, imageUrl };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatViews(n: number) {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

// ─── STATS BAR ───────────────────────────────────────────────────────────────
function StatsBar({ posts }: { posts: any[] }) {
  const videos = posts.filter(p => p.type === 'video' || p.bunny_video_id || p.video_url).length;
  const images = posts.length - videos;
  const promoted = posts.filter(p => p.is_promoted).length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views_count || 0), 0);

  const stats = [
    { label: 'Total Posts', value: posts.length, accent: false },
    { label: 'Videos', value: videos, accent: false },
    { label: 'Images', value: images, accent: false },
    { label: 'Promoted', value: promoted, accent: true },
    { label: 'Total Views', value: formatViews(totalViews), accent: false },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stats.map(s => (
        <div key={s.label} className={`rounded-2xl p-4 border ${s.accent ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}>
          <div className={`text-2xl font-black ${s.accent ? 'text-amber-500' : 'dark:text-white'}`}>{s.value}</div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ContentSmile() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'video' | 'image'>('all');
  const [filterPromoted, setFilterPromoted] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views'>('newest');
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
    const orderField = sortBy === 'views' ? 'views_count' : 'created_at';

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url)')
      .order(orderField, { ascending: sortBy === 'views' ? false : ascending });

    if (!error && data) setPosts(data);
    if (error) showToast('Eroare la încărcare', 'error');

    setLoading(false);
    setRefreshing(false);
  }, [sortBy]);

  useEffect(() => {
    fetchContent();
    const channel = supabase.channel('posts-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchContent(true))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchContent]);

  const executeDelete = async (id: string) => {
    // Optimistic UI
    setPosts(prev => prev.filter(p => p.id !== id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) { showToast('Eroare la ștergere', 'error'); fetchContent(true); }
    else showToast('Post șters cu succes');
    setDeleteConfirmId(null);
  };

  const executeBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    setPosts(prev => prev.filter(p => !ids.includes(p.id)));
    await supabase.from('posts').delete().in('id', ids);
    setSelectedIds(new Set());
    setBulkDeleteConfirm(false);
    showToast(`${ids.length} posturi șterse`);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === paginatedData.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginatedData.map(p => p.id)));
  };

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchesSearch = !search
        || p.caption?.toLowerCase().includes(search.toLowerCase())
        || p.profiles?.username?.toLowerCase().includes(search.toLowerCase());

      const { isVideo } = getMediaInfo(p);
      const matchesType = filterType === 'all' ? true
        : filterType === 'video' ? isVideo : !isVideo;

      const matchesPromoted = !filterPromoted || p.is_promoted;

      return matchesSearch && matchesType && matchesPromoted;
    });
  }, [posts, search, filterType, filterPromoted]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen font-sans">

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl ${
              toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-col space-y-6 border-b dark:border-zinc-900 pb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter dark:text-white leading-none">
              Content <span className="text-amber-500 italic">Smile</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">
              {filtered.length} matching entries
              {selectedIds.size > 0 && <span className="text-amber-500 ml-3">· {selectedIds.size} selected</span>}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors" size={16} />
              <input
                placeholder="Caută după text sau user..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl outline-none focus:border-amber-500 transition-all text-xs font-bold shadow-sm"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Bulk delete */}
            {selectedIds.size > 0 && (
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                className="px-4 py-3 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-700 transition-all"
              >
                <Trash2 size={14} /> Delete {selectedIds.size}
              </button>
            )}

            {/* Refresh */}
            <button
              onClick={() => fetchContent(true)}
              className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 text-zinc-500 hover:text-amber-500 transition-all"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                showFilters ? 'bg-amber-500 border-amber-600 text-black' : 'bg-white dark:bg-zinc-900 dark:border-zinc-800 text-zinc-500'
              }`}
            >
              <Filter size={16} /> Filters
              {(filterType !== 'all' || filterPromoted) && (
                <span className="w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>

            {/* View toggle */}
            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border dark:border-zinc-800 shadow-inner">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-amber-500 shadow-xl' : 'text-zinc-500'}`}>
                <LayoutGrid size={18} />
              </button>
              <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-zinc-800 text-amber-500 shadow-xl' : 'text-zinc-500'}`}>
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* FILTRE AVANSATE */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 overflow-hidden"
            >
              {/* Media Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                  <Film size={12} /> Media Type
                </label>
                <div className="flex gap-2">
                  {(['all', 'video', 'image'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setFilterType(t); setCurrentPage(1); }}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                        filterType === t
                          ? 'bg-zinc-900 text-white border-zinc-800 dark:bg-white dark:text-black'
                          : 'bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                  <ArrowUpDown size={12} /> Sort
                </label>
                <div className="flex gap-2">
                  {([
                    { val: 'newest', label: 'Newest' },
                    { val: 'oldest', label: 'Oldest' },
                    { val: 'views', label: 'Views' },
                  ] as const).map(s => (
                    <button
                      key={s.val}
                      onClick={() => setSortBy(s.val)}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                        sortBy === s.val
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                          : 'bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Promoted Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                  <TrendingUp size={12} /> Promoted
                </label>
                <button
                  onClick={() => setFilterPromoted(p => !p)}
                  className={`w-full py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                    filterPromoted
                      ? 'bg-amber-500 text-black border-amber-600'
                      : 'bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  {filterPromoted ? '★ Only Promoted' : 'Show All'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* STATS */}
      {!loading && <StatsBar posts={posts} />}

      {/* BULK DELETE CONFIRM */}
      <AnimatePresence>
        {bulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
              <AlertTriangle className="text-red-500 mx-auto mb-4" size={32} />
              <h3 className="text-white font-black text-lg mb-2">Ești sigur?</h3>
              <p className="text-zinc-400 text-xs mb-6">
                Vei șterge permanent <span className="text-red-400 font-bold">{selectedIds.size} posturi</span>. Acțiunea este ireversibilă.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setBulkDeleteConfirm(false)} className="flex-1 py-3 rounded-2xl bg-zinc-800 text-white text-xs font-bold">Anulează</button>
                <button onClick={executeBulkDelete} className="flex-1 py-3 rounded-2xl bg-red-600 text-white text-xs font-bold">Șterge</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="py-40 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-amber-500" size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Processing Cloud Assets...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-40 flex flex-col items-center gap-4 text-center">
            <ImageIcon size={40} className="text-zinc-700" />
            <span className="text-zinc-500 font-bold text-sm">Niciun rezultat găsit</span>
            <button onClick={() => { setSearch(''); setFilterType('all'); setFilterPromoted(false); }} className="text-amber-500 text-xs font-black uppercase tracking-widest">
              Resetează filtrele
            </button>
          </div>
        ) : (
          <div className="space-y-10">

            {viewMode === 'grid' ? (
              <>
                {/* Select all bar */}
                <div className="flex items-center justify-between">
                  <button onClick={selectAll} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors">
                    {selectedIds.size === paginatedData.length ? 'Deselectează tot' : 'Selectează tot'}
                  </button>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase">{paginatedData.length} posturi pe pagină</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                  {paginatedData.map(post => (
                    <ContentCard
                      key={post.id}
                      post={post}
                      deleteConfirmId={deleteConfirmId}
                      executeDelete={executeDelete}
                      setDeleteConfirmId={setDeleteConfirmId}
                      selected={selectedIds.has(post.id)}
                      onSelect={() => toggleSelect(post.id)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="overflow-x-auto bg-white dark:bg-zinc-950 border dark:border-zinc-900 rounded-[2.5rem] shadow-2xl">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="text-[10px] font-black uppercase text-zinc-400 border-b dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <tr>
                      <th className="px-6 py-6">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === paginatedData.length && paginatedData.length > 0}
                          onChange={selectAll}
                          className="accent-amber-500"
                        />
                      </th>
                      <th className="px-6 py-6 italic text-amber-500">Asset</th>
                      <th className="px-6 py-6">User</th>
                      <th className="px-6 py-6 italic">Caption</th>
                      <th className="px-6 py-6">Views</th>
                      <th className="px-6 py-6">Dată</th>
                      <th className="px-6 py-6">Tip</th>
                      <th className="px-6 py-6 text-right">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-zinc-900/50">
                    {paginatedData.map(post => {
                      const { isVideo, thumbnailUrl, videoUrl, imageUrl } = getMediaInfo(post);
                      return (
                        <tr key={post.id} className={`hover:bg-amber-500/[0.02] transition-colors group ${selectedIds.has(post.id) ? 'bg-amber-500/5' : ''}`}>
                          <td className="px-6 py-4">
                            <input type="checkbox" checked={selectedIds.has(post.id)} onChange={() => toggleSelect(post.id)} className="accent-amber-500" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-12 h-14 rounded-2xl overflow-hidden bg-zinc-900 shadow-lg relative">
                              {isVideo ? (
                                <video
                                  src={videoUrl ? `${videoUrl}#t=0.1` : undefined}
                                  poster={thumbnailUrl || undefined}
                                  className="w-full h-full object-cover"
                                  muted
                                  preload="none"
                                />
                              ) : (
                                <img
                                  src={imageUrl || '/placeholder.png'}
                                  className="w-full h-full object-cover"
                                  alt=""
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[11px] font-black text-amber-500 uppercase italic">@{post.profiles?.username || '—'}</span>
                          </td>
                          <td className="px-6 py-4 text-[11px] font-bold dark:text-zinc-300 italic truncate max-w-xs">
                            {post.caption || 'Fără descriere'}
                          </td>
                          <td className="px-6 py-4 text-[11px] font-black text-zinc-400">
                            {formatViews(post.views_count)}
                          </td>
                          <td className="px-6 py-4 text-[10px] text-zinc-500 font-bold">
                            {formatDate(post.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                              isVideo ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {isVideo ? '▶ Video' : '◆ Image'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 text-zinc-500">
                              <button
                                onClick={() => { const url = isVideo ? videoUrl : imageUrl; if (url) window.open(url); }}
                                className="p-2 hover:text-amber-500 transition-colors"
                                title="Preview"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => { const url = isVideo ? videoUrl : imageUrl; if (url) navigator.clipboard.writeText(url); showToast('URL copiat!'); }}
                                className="p-2 hover:text-amber-500 transition-colors"
                                title="Copiază URL"
                              >
                                <Copy size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(post.id)}
                                className="p-2 hover:text-red-500 transition-colors"
                                title="Șterge"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            {deleteConfirmId === post.id && (
                              <div className="flex justify-end gap-2 mt-1">
                                <button onClick={() => executeDelete(post.id)} className="px-2 py-1 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase">Confirm</button>
                                <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 bg-zinc-800 text-white rounded-lg text-[9px] font-black uppercase">Anulează</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINARE */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-10">
                <button
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0); }}
                  className="p-4 rounded-[1.5rem] bg-white dark:bg-zinc-900 border dark:border-zinc-800 disabled:opacity-20 hover:border-amber-500 transition-all shadow-xl dark:text-white"
                >
                  <ChevronLeft size={22} />
                </button>

                {/* Page numbers */}
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page = i + 1;
                    if (totalPages > 5 && currentPage > 3) page = currentPage - 2 + i;
                    if (page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => { setCurrentPage(page); window.scrollTo(0, 0); }}
                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                          currentPage === page
                            ? 'bg-amber-500 text-black'
                            : 'bg-white dark:bg-zinc-900 border dark:border-zinc-800 text-zinc-500 hover:border-amber-500'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0); }}
                  className="p-4 rounded-[1.5rem] bg-white dark:bg-zinc-900 border dark:border-zinc-800 disabled:opacity-20 hover:border-amber-500 transition-all shadow-xl dark:text-white"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CARD COMPONENT ───────────────────────────────────────────────────────────
function ContentCard({ post, deleteConfirmId, executeDelete, setDeleteConfirmId, selected, onSelect }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isVideo, thumbnailUrl, videoUrl, imageUrl } = getMediaInfo(post);

  const handleMouseEnter = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      layout
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group bg-white dark:bg-[#0A0A0B] border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 relative ${
        selected ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-zinc-200 dark:border-zinc-900'
      }`}
    >
      {/* Select checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className={`absolute top-4 left-4 z-30 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          selected ? 'bg-amber-500 border-amber-500' : 'bg-black/40 border-white/30 opacity-0 group-hover:opacity-100'
        }`}
      >
        {selected && <Check size={12} className="text-black" />}
      </button>

      {/* Promoted badge */}
      {post.is_promoted && (
        <div className="absolute top-4 right-4 z-30 bg-amber-500 text-black text-[8px] font-black uppercase px-2 py-1 rounded-full tracking-widest">
          Promoted
        </div>
      )}

      <div className="relative aspect-[3/4] bg-zinc-900 flex items-center justify-center overflow-hidden">
        {isVideo ? (
          <>
            {/* Poster/thumbnail afișat întotdeauna ca fallback */}
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                className="absolute inset-0 w-full h-full object-cover"
                alt=""
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            {/* Video-ul se suprapune pe hover */}
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
            src={imageUrl || '/placeholder.png'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            alt={post.caption || ''}
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px] z-10">
          <button
            onClick={() => { const url = isVideo ? videoUrl : imageUrl; if (url) window.open(url); }}
            className="p-4 bg-white text-black rounded-full hover:bg-amber-500 transition-all shadow-xl"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => setDeleteConfirmId(post.id)}
            className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-xl"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Delete confirm overlay */}
        <AnimatePresence>
          {deleteConfirmId === post.id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-20 bg-zinc-950/95 flex flex-col items-center justify-center p-6 text-center"
            >
              <span className="text-[10px] font-black uppercase text-red-500 mb-4 tracking-[0.2em]">Șterge permanent?</span>
              <div className="flex gap-4">
                <button onClick={() => executeDelete(post.id)} className="p-4 bg-red-600 rounded-full text-white hover:bg-red-700">
                  <Check size={22} />
                </button>
                <button onClick={() => setDeleteConfirmId(null)} className="p-4 bg-zinc-800 rounded-full text-white">
                  <X size={22} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Type badge */}
        <span className={`absolute top-4 left-4 backdrop-blur-md p-2 rounded-xl border border-white/10 z-10 ${
          isVideo ? 'bg-black/40 text-amber-500' : 'bg-black/40 text-blue-400'
        } ${selected ? 'opacity-0' : 'group-hover:opacity-0'} transition-opacity`}>
          {isVideo ? <Film size={12} /> : <ImageIcon size={12} />}
        </span>

        {/* Views */}
        {post.views_count > 0 && (
          <span className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-full">
            {formatViews(post.views_count)} views
          </span>
        )}
      </div>

      <div className="p-5">
        <span className="text-[10px] font-black uppercase text-amber-600 italic tracking-tighter">
          @{post.profiles?.username || 'user'}
        </span>
        <p className="text-[11px] font-bold dark:text-zinc-400 mt-1.5 line-clamp-2 italic leading-relaxed">
          "{post.caption || 'Fără descriere'}"
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[9px] text-zinc-600 font-bold">{formatDate(post.created_at)}</span>
          {post.is_promoted && (
            <span className="text-[8px] font-black uppercase text-amber-500 tracking-widest">★ Promoted</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}