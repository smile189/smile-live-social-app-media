"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, UserPlus, ChevronLeft, Bell, ChevronDown } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const ITEMS_PER_PAGE = 15;
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchNotifications = async (pageNumber = 0, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Calculăm range-ul pentru paginare
    const from = pageNumber * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data: rawNotifs, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Eroare fetching:", error);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (rawNotifs.length < ITEMS_PER_PAGE) {
      setHasMore(false);
    }

    // Îmbogățim datele manual
    const enriched = await Promise.all(
      (rawNotifs || []).map(async (notif) => {
        const [{ data: profile }, { data: post }] = await Promise.all([
          supabase.from("profiles").select("username, avatar_url").eq("id", notif.sender_id).single(),
          notif.post_id ? supabase.from("posts").select("content").eq("id", notif.post_id).single() : Promise.resolve({ data: null })
        ]);
        
        return { ...notif, sender: profile, post: post };
      })
    );

    if (isInitial) {
      setNotifications(enriched);
    } else {
      setNotifications(prev => [...prev, ...enriched]);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchNotifications(0, true);

    const channel = supabase
      .channel('notifications_live')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        () => fetchNotifications(0, true) // Refresh la prima pagina pe insert nou
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage);
  };

  const handleNotifClick = (notif: any) => {
    if (notif.type === 'follow') {
      router.push(`/app/profile/${notif.sender_id}`);
    } else if (notif.post_id) {
      router.push(`/app/post/${notif.post_id}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={14} className="fill-red-500 text-red-500" />;
      case 'comment': return <MessageSquare size={14} className="text-blue-400" />;
      case 'follow': return <UserPlus size={14} className="text-yellow-400" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans">
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/10 p-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-black uppercase tracking-widest text-yellow-400">Activity</h1>
      </div>

      <div className="flex flex-col max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-32 text-zinc-600 text-center">
            <Bell size={64} className="mb-6 opacity-10" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Notifications</p>
          </div>
        ) : (
          <>
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => handleNotifClick(notif)}
                className="flex items-start gap-4 p-5 border-b border-white/[0.03] active:bg-white/[0.1] transition-all cursor-pointer group"
              >
                <div className="relative shrink-0">
                  <img 
                    src={notif.sender?.avatar_url || `https://dicebear.com{notif.sender_id}`} 
                    className="w-12 h-12 rounded-2xl object-cover ring-1 ring-white/10 group-hover:ring-yellow-400/50 bg-zinc-900"
                    alt="user"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-black ring-1 ring-white/20 rounded-lg p-1.5 shadow-xl">
                    {getIcon(notif.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0 py-0.5">
                  <p className="text-[13px] leading-relaxed">
                    <span className="font-black text-white mr-1.5 tracking-tight group-hover:text-yellow-400 transition-colors uppercase">
                      {notif.sender?.username || "SMILE_USER"}
                    </span>
                    <span className="text-zinc-400 font-medium"> 
                      {notif.type === 'like' && 'liked your smile.'}
                      {notif.type === 'comment' && 'left a comment.'}
                      {notif.type === 'follow' && 'started following you.'}
                    </span>
                  </p>
                  <span className="text-[9px] text-zinc-600 font-bold uppercase mt-2 tracking-widest inline-block">
                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {notif.post && (
                  <div className="w-12 h-12 bg-zinc-900 rounded-xl overflow-hidden border border-white/5 shrink-0 flex items-center justify-center">
                     <p className="text-[8px] p-2 text-zinc-700 font-mono italic truncate">{notif.post.content || "VIEW"}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Buton Load More */}
            {hasMore && (
              <button 
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center justify-center gap-2 p-8 text-zinc-500 hover:text-yellow-400 transition-all uppercase text-[10px] font-black tracking-[0.3em] disabled:opacity-50"
              >
                {loadingMore ? (
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Load More</span>
                    <ChevronDown size={14} />
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
