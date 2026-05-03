"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, UserPlus, ChevronLeft, Bell } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Luăm notificările brute
    const { data: rawNotifs, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Eroare fetching:", error);
      setLoading(false);
      return;
    }

    // 2. Îmbogățim datele manual (Join manual ca să fim siguri că apar pozele/numele)
    const enriched = await Promise.all(
      (rawNotifs || []).map(async (notif) => {
        // Căutăm profilul celui care a trimis
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", notif.sender_id)
          .single();
        
        // Căutăm și postarea dacă există post_id
        let postData = null;
        if (notif.post_id) {
          const { data: post } = await supabase
            .from("posts")
            .select("content")
            .eq("id", notif.post_id)
            .single();
          postData = post;
        }

        return { 
          ...notif, 
          sender: profile,
          post: postData 
        };
      })
    );

    setNotifications(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    // Realtime listener
    const channel = supabase
      .channel('notifications_live')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        () => fetchNotifications()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

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
      {/* Header */}
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
          <div className="flex flex-col items-center justify-center p-32 text-zinc-600">
            <Bell size={64} className="mb-6 opacity-10" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Notifications</p>
            {/* Buton de test (Apare doar dacă e gol) */}
            <button 
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                await supabase.from("notifications").insert([{ 
                  receiver_id: user?.id, 
                  sender_id: user?.id, 
                  type: 'like' 
                }]);
                fetchNotifications();
              }}
              className="mt-8 text-yellow-400 border border-yellow-400/20 px-4 py-2 rounded-full text-[8px] uppercase font-bold tracking-widest hover:bg-yellow-400 hover:text-black transition-all"
            >
              Generate Test Notification
            </button>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => handleNotifClick(notif)}
              className="flex items-start gap-4 p-5 border-b border-white/[0.03] active:bg-white/[0.1] transition-all cursor-pointer group"
            >
              {/* Avatar cu Badge */}
              <div className="relative shrink-0">
                <img 
                  src={notif.sender?.avatar_url || `https://dicebear.com{notif.sender_id}`} 
                  className="w-12 h-12 rounded-2xl object-cover ring-1 ring-white/10 group-hover:ring-yellow-400/50"
                  alt="user"
                />
                <div className="absolute -bottom-1 -right-1 bg-black ring-1 ring-white/20 rounded-lg p-1.5 shadow-xl">
                  {getIcon(notif.type)}
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 py-0.5">
                <p className="text-[13px] leading-relaxed">
                  <span className="font-black text-white mr-1.5 tracking-tight group-hover:text-yellow-400 transition-colors">
                    {notif.sender?.username || "SMILE_USER"}
                  </span>
                  <span className="text-zinc-400 font-medium"> 
                    {notif.type === 'like' && 'liked your smile.'}
                    {notif.type === 'comment' && 'left a comment on your post.'}
                    {notif.type === 'follow' && 'started following you.'}
                  </span>
                </p>
                <span className="text-[9px] text-zinc-600 font-bold uppercase mt-2 tracking-widest inline-block">
                  {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Post Thumbnail */}
              {notif.post && (
                <div className="w-12 h-12 bg-zinc-900 rounded-xl overflow-hidden border border-white/5 shrink-0 flex items-center justify-center group-hover:border-yellow-400/30">
                   <p className="text-[8px] p-2 text-zinc-700 font-mono italic truncate">
                     {notif.post.content || "VIEW"}
                   </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
