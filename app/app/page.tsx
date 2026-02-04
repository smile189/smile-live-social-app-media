"use client";

import { useRef, useEffect, useState } from "react";
import SidebarActions from "@/components/ActionButton";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";

export default function AppPage() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // 🔥 CLIPURI HD reale (nu blur)
  const [items] = useState([
    {
      id: 1,
      src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
    {
      id: 2,
      src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    },
    {
      id: 3,
      src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    },
    {
      id: 4,
      src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    },
    {
      id: 5,
      src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    },
  ]);

  // 🔥 AUTOPLAY TikTok-style (play doar când e pe ecran)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;

          if (entry.isIntersecting) {
            video.currentTime = 0;
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.7,
      }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative font-sans">
      
      {/* HEADER */}
      <TopNav />

      {/* FEED VIDEO */}
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
        {items.map((item, index) => (
          <section
            key={item.id}
            className="h-screen w-full snap-start relative flex flex-col justify-end pb-32"
          >
            
            {/* 🎬 VIDEO HD */}
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={item.src}
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              className="absolute inset-0 w-full h-full object-cover scale-[1.01]"
              style={{ imageRendering: "auto" }}
            />

            {/* gradient cinematic */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* metadata placeholder */}
            <div className="relative z-10 p-8">
              <div className="w-32 h-5 bg-yellow-400/20 border border-yellow-400/30 rounded mb-2" />
              <div className="w-64 h-3 bg-zinc-900 rounded" />
            </div>

          </section>
        ))}
      </div>

      {/* SIDEBAR */}
      <SidebarActions />

      {/* FOOTER */}
      <BottomNav />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
