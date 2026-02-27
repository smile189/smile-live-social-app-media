"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import SidebarActions from "@/components/ActionButton";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";

export default function AppPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [activePost, setActivePost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )).current;

  useEffect(() => {
    const fetchFeed = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, profiles(username, avatar_url, full_name), likes(count), comments(count)`)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPosts(data);
        if (data.length > 0) setActivePost(data[0]);
      }
      setLoading(false);
    };
    fetchFeed();
  }, [supabase]);

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    if (posts.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = entry.target.getAttribute("data-id");
            const post = posts.find((p) => p.id === postId);
            if (post) setActivePost(post);
          }
        });
      },
      { threshold: 0.6 } // Ajustat pentru o detecție mai rapidă la scroll
    );

    Object.values(sectionRefs.current).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [posts]);

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-yellow-400 font-black text-3xl animate-pulse uppercase tracking-[0.5em] italic">Smile Live</div>
    </div>
  );

  return (
    // Folosim touch-none pe containerul părinte dacă vrei control total, 
    // dar e mai bine să lăsăm browserul să gestioneze snap-ul.
    <div className="fixed inset-0 bg-black overflow-hidden font-sans">
      <TopNav />

      {/* PIPELINE CONTAINER - MODIFICĂRI AICI PENTRU SNAP SMOOTH */}
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar bg-[#050505]">
        {posts.map((post) => (
          <section 
            key={post.id} 
            data-id={post.id}
            ref={(el) => { sectionRefs.current[post.id] = el; }}
            // snap-start forțează oprirea la începutul secțiunii
            className="h-full w-full snap-start snap-always relative flex flex-col justify-end"
          >
            {/* MEDIA LAYER */}
            <div className="absolute inset-0 z-0 bg-zinc-950">
               {post.thumbnail_url && (
                 <img 
                   src={post.thumbnail_url} 
                   className="w-full h-full object-cover opacity-100 transition-opacity duration-700" 
                   alt="Broadcast Stream" 
                 />
               )}
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
            </div>

            {/* OVERLAY METADATA */}
            <div className="z-10 p-8 pb-44 max-w-xl animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 text-black text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                 <div className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" /> Live Transmission
              </div>
              
              <h2 className="text-white text-3xl font-black uppercase tracking-tighter leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                {post.caption}
              </h2>
              
              <div className="mt-4 flex items-center gap-3">
                <div className="h-[1px] w-8 bg-yellow-400/50" />
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest italic">
                  Ref: SMILE-SYS-{post.id.substring(0, 4)}
                </span>
              </div>
            </div>
          </section>
        ))}

        {posts.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <span className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.4em]">No active signals</span>
          </div>
        )}
      </div>

      <SidebarActions post={activePost} />
      <BottomNav />

      <style jsx global>{`
        /* Ascunde scrollbar dar păstrează snap-ul funcțional */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { 
          -ms-overflow-style: none; 
          scrollbar-width: none;
          /* Optimizează scroll-ul pentru mobil */
          -webkit-overflow-scrolling: touch; 
        }
      `}</style>
    </div>
  );
}
