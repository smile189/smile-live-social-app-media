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

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchFeed = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, profiles(username, avatar_url, full_name), likes(count), comments(count)`)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPosts(data);
        setActivePost(data[0]); // Prima postare e activă default
      }
      setLoading(false);
    };
    fetchFeed();
  }, [supabase]);

  // Logica de detectare postare activă la scroll (Intersection Observer)
  const sectionRefs = useRef<any>({});
  useEffect(() => {
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
      { threshold: 0.7 }
    );

    Object.values(sectionRefs.current).forEach((section: any) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [posts]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-yellow-400 font-black animate-pulse uppercase tracking-[0.5em]">Smile Live</div>;

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative font-sans">
      <TopNav />

      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-[#050505]">
        {posts.map((post) => (
          <section 
            key={post.id} 
            data-id={post.id}
            ref={(el) => (sectionRefs.current[post.id] = el)}
            className="h-screen w-full snap-start relative flex flex-col justify-end"
          >
            {/* MEDIA LAYER */}
            <div className="absolute inset-0 z-0 bg-zinc-950">
               <img src={post.thumbnail_url} className="w-full h-full object-cover opacity-90 transition-opacity duration-1000" alt="" />
               <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
            </div>

            {/* CONTENT LAYER */}
            <div className="z-10 p-8 pb-40 max-w-xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 text-black text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                 <div className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" /> Smile Broadcast
              </div>
              <h2 className="text-white text-3xl font-black uppercase tracking-tighter leading-tight drop-shadow-2xl">
                {post.caption}
              </h2>
              <div className="mt-4 flex items-center gap-2 opacity-50">
                <div className="h-[1px] w-8 bg-white" />
                <span className="text-[10px] text-white font-bold uppercase tracking-widest italic">Live in Pipeline</span>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* CORELARE REALĂ: Trimitem postarea activă către sidebar */}
      <SidebarActions post={activePost} />

      <BottomNav />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
