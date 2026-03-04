"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Trash2, Search, LayoutGrid, List, Eye, Film, 
  ChevronLeft, ChevronRight, Loader2, Image as ImageIcon, X, Check,
  Filter, Calendar, User, Video, Camera, ArrowUpDown
} from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ITEMS_PER_PAGE = 12;

export default function ContentSmile() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // --- STATE-URI CĂUTARE AVANSATĂ ---
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'video' | 'image'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url)')
      .order('created_at', { ascending: sortBy === 'newest' ? false : true });
    if (!error && data) setPosts(data);
    setLoading(false);
  }, [sortBy]);

  useEffect(() => {
    fetchContent();
    const channel = supabase.channel('posts-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchContent())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchContent]);

  const executeDelete = async (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    await supabase.from('posts').delete().eq('id', id);
    setDeleteConfirmId(null);
  };

  // --- LOGICA DE FILTRARE AVANSATĂ ---
  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchesSearch = p.caption?.toLowerCase().includes(search.toLowerCase()) || 
                           p.profiles?.username?.toLowerCase().includes(search.toLowerCase());
      
      const isVideo = p.type === 'video' || p.video_url || p.bunny_video_id;
      const matchesType = filterType === 'all' ? true : 
                         filterType === 'video' ? isVideo : !isVideo;

      return matchesSearch && matchesType;
    });
  }, [posts, search, filterType]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen font-sans">
      
      {/* HEADER & SEARCH ENGINE */}
      <div className="flex flex-col space-y-6 border-b dark:border-zinc-900 pb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter dark:text-white leading-none tracking-tight">
              Content <span className="text-amber-500 italic">Smile</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">
              {filtered.length} matching entries
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search Bar Principal */}
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors" size={16} />
              <input 
                placeholder="Search by text or user..." 
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl outline-none focus:border-amber-500 transition-all text-xs font-bold shadow-sm"
                value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest ${showFilters ? 'bg-amber-500 border-amber-600 text-black' : 'bg-white dark:bg-zinc-900 dark:border-zinc-800 text-zinc-500'}`}
            >
              <Filter size={16} /> Filters
            </button>

            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border dark:border-zinc-800 shadow-inner">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-amber-500 shadow-xl' : 'text-zinc-500'}`}><LayoutGrid size={18}/></button>
              <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-zinc-800 text-amber-500 shadow-xl' : 'text-zinc-500'}`}><List size={18}/></button>
            </div>
          </div>
        </div>

        {/* PANOU FILTRE AVANSATE */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 overflow-hidden"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Film size={12}/> Media Type</label>
                <div className="flex gap-2">
                  {['all', 'video', 'image'].map((t) => (
                    <button 
                      key={t} onClick={() => { setFilterType(t as any); setCurrentPage(1); }}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${filterType === t ? 'bg-zinc-900 text-white border-zinc-800 dark:bg-white dark:text-black' : 'bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-500'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><ArrowUpDown size={12}/> Sort Order</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSortBy('newest')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${sortBy === 'newest' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-500'}`}
                  >
                    Newest First
                  </button>
                  <button 
                    onClick={() => setSortBy('oldest')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${sortBy === 'oldest' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-500'}`}
                  >
                    Oldest
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="py-40 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-amber-500" size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Processing Cloud Assets...</span>
          </div>
        ) : (
          <div className="space-y-10">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                {paginatedData.map(post => (
                  <ContentCard 
                    key={post.id} post={post} 
                    deleteConfirmId={deleteConfirmId} 
                    executeDelete={executeDelete} 
                    setDeleteConfirmId={setDeleteConfirmId} 
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto bg-white dark:bg-zinc-950 border dark:border-zinc-900 rounded-[2.5rem] shadow-2xl">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="text-[10px] font-black uppercase text-zinc-400 border-b dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <tr>
                      <th className="px-10 py-6 italic text-amber-500">Asset</th>
                      <th className="px-10 py-6">Identity</th>
                      <th className="px-10 py-6 italic">Descriptor</th>
                      <th className="px-10 py-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-zinc-900/50">
                    {paginatedData.map(post => (
                      <tr key={post.id} className="hover:bg-amber-500/[0.02] transition-colors group">
                        <td className="px-10 py-5">
                          <div className="w-14 h-16 rounded-2xl overflow-hidden bg-zinc-900 shadow-lg relative">
                             {post.type === 'video' ? (
                               <video src={`${post.media_url || post.video_url}#t=0.1`} className="w-full h-full object-cover" muted />
                             ) : (
                               <img src={post.media_url || post.thumbnail_url} className="w-full h-full object-cover" />
                             )}
                             {deleteConfirmId === post.id && (
                               <div className="absolute inset-0 bg-red-600/90 flex items-center justify-center">
                                 <Check onClick={() => executeDelete(post.id)} className="text-white cursor-pointer" size={16}/>
                               </div>
                             )}
                          </div>
                        </td>
                        <td className="px-10 py-5 flex flex-col">
                           <span className="text-[11px] font-black text-amber-500 uppercase italic">@{post.profiles?.username}</span>
                           <span className="text-[9px] text-zinc-500 font-bold uppercase">{new Date(post.created_at).toLocaleDateString()}</span>
                        </td>
                        <td className="px-10 py-5 text-[11px] font-bold dark:text-zinc-300 italic truncate max-w-md">{post.caption || 'Untitled Entry'}</td>
                        <td className="px-10 py-5 text-right">
                          <div className="flex justify-end gap-2 text-zinc-500">
                             <Eye size={18} className="cursor-pointer hover:text-amber-500" onClick={() => window.open(post.media_url || post.video_url)} />
                             <Trash2 size={18} className="cursor-pointer hover:text-red-500" onClick={() => setDeleteConfirmId(post.id)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINARE (TOTAL PAGES FIXED) */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-8 py-10">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0,0); }} 
                  className="p-4 rounded-[1.5rem] bg-white dark:bg-zinc-900 border dark:border-zinc-800 disabled:opacity-20 hover:border-amber-500 transition-all shadow-xl dark:text-white"
                >
                  <ChevronLeft size={22} />
                </button>
                <div className="text-center font-black uppercase text-amber-500 tracking-widest text-xs italic">
                  Page {currentPage} / {totalPages}
                </div>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0,0); }} 
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

// --- CARD COMPONENT CU VIDEO HOVER ---
function ContentCard({ post, deleteConfirmId, executeDelete, setDeleteConfirmId }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = post.type === 'video' || post.video_url || post.bunny_video_id;
  const displayUrl = post.media_url || post.thumbnail_url || post.video_url;

  return (
    <motion.div 
      layout 
      onMouseEnter={() => isVideo && videoRef.current?.play().catch(()=>{})} 
      onMouseLeave={() => isVideo && videoRef.current?.pause()}
      className="group bg-white dark:bg-[#0A0A0B] border dark:border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 relative border-zinc-200"
    >
      <div className="relative aspect-[3/4] bg-zinc-900 flex items-center justify-center overflow-hidden">
        {isVideo ? (
          <video 
            ref={videoRef}
            src={`${displayUrl}#t=0.1`} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            preload="metadata"
            muted
            loop
          />
        ) : (
          <img 
            src={displayUrl || "https://images.unsplash.com"} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
            alt="Thumbnail"
          />
        )}

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
          <button onClick={() => window.open(displayUrl)} className="p-4 bg-white text-black rounded-full hover:bg-amber-500 transition-all shadow-xl"><Eye size={20}/></button>
          <button onClick={() => setDeleteConfirmId(post.id)} className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-xl"><Trash2 size={20}/></button>
        </div>

        <AnimatePresence>
          {deleteConfirmId === post.id && (
            <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className="absolute inset-0 z-20 bg-zinc-950/95 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-[10px] font-black uppercase text-red-500 mb-4 tracking-[0.2em]">Delete Permanently?</span>
              <div className="flex gap-4">
                <button onClick={() => executeDelete(post.id)} className="p-4 bg-red-600 rounded-full text-white"><Check size={24}/></button>
                <button onClick={() => setDeleteConfirmId(null)} className="p-4 bg-zinc-800 rounded-full text-white"><X size={24}/></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isVideo && <span className="absolute top-6 left-6 bg-black/40 backdrop-blur-md p-2 rounded-xl text-amber-500 border border-white/10"><Film size={12}/></span>}
      </div>

      <div className="p-6">
        <span className="text-[10px] font-black uppercase text-amber-600 italic tracking-tighter">@{post.profiles?.username || 'user'}</span>
        <p className="text-[11px] font-bold dark:text-zinc-400 mt-2 line-clamp-2 italic leading-relaxed">"{post.caption || 'No descriptor'}"</p>
      </div>
    </motion.div>
  );
}
