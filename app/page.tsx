"use client";

import { useState } from "react";
import Image from "next/image";

type Post = {
  id: number;
  user: string;
  video: string;
  likes: number;
  comments: number;
  shares: number;
  description: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      user: "SmileLiveOfficial",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      likes: 123,
      comments: 45,
      shares: 12,
      description: "Welcome to Smile Live App! Connect, share moments, and enjoy 4K cinematic experience! 😎✨"
    },
    {
      id: 2,
      user: "ioana",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      likes: 98,
      comments: 30,
      shares: 7,
      description: "Sunset vibes 🌇✨"
    },
    {
      id: 3,
      user: "marius",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      likes: 200,
      comments: 55,
      shares: 20,
      description: "Coding and chill 😎💻"
    },
  ]);

  const [muted, setMuted] = useState(true);
  const [floatingHearts, setFloatingHearts] = useState<number[]>([]);

  const likePost = (id: number) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    setFloatingHearts((prev) => [...prev, Date.now()]);
    setTimeout(() => setFloatingHearts((prev) => prev.slice(1)), 1200);
  };

  return (
    <div className="w-full h-screen font-sans overflow-hidden bg-yellow-50 relative">

      {/* Vertical scroll feed */}
      <div className="h-screen w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth">
        {posts.map((post) => (
          <div key={post.id} className="relative w-full h-screen snap-start flex items-center justify-center">

            {/* Video 4K external */}
            <video
              className="absolute top-0 left-0 w-full h-full object-cover"
              src={post.video}
              autoPlay
              loop
              muted={muted}
              playsInline
            />

            {/* Dark tint overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/20" />

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full w-full px-6 pb-12 text-white">

              {/* Description / Demo Text */}
              <div className="max-w-md sm:max-w-lg lg:max-w-xl space-y-2 animate-fadein">
                <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl">@{post.user}</h2>
                <p className="text-md sm:text-lg lg:text-xl">{post.description}</p>
              </div>

              {/* Floating hearts */}
              {floatingHearts.map((time) => (
                <span
                  key={time}
                  className="absolute right-16 bottom-32 text-4xl animate-floatHeart"
                >
                  ❤️
                </span>
              ))}

              {/* Actions Sidebar */}
              <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
                {/* Like */}
                <button
                  className="flex flex-col items-center text-white hover:scale-125 transition transform glow-yellow"
                  onClick={() => likePost(post.id)}
                >
                  <span className="text-2xl sm:text-3xl">❤️</span>
                  <span className="text-sm sm:text-base">{post.likes}</span>
                </button>

                {/* Comment */}
                <button className="flex flex-col items-center text-white hover:scale-125 transition transform glow-yellow">
                  <span className="text-2xl sm:text-3xl">💬</span>
                  <span className="text-sm sm:text-base">{post.comments}</span>
                </button>

                {/* Share */}
                <button className="flex flex-col items-center text-white hover:scale-125 transition transform glow-yellow">
                  <span className="text-2xl sm:text-3xl">🔗</span>
                  <span className="text-sm sm:text-base">{post.shares}</span>
                </button>
              </div>

              {/* Bottom Follow CTA */}
              <div className="absolute bottom-6 left-6 flex items-center gap-4">
                <Image src="/logo.svg" alt="Smile Live Logo" width={48} height={48} className="rounded-full border-2 border-white" />
                <button className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-500 transition transform hover:scale-105 sm:px-6 sm:py-3 sm:text-lg glow-yellow">
                  Follow
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Mute/Unmute */}
      <button
        className="absolute top-6 right-6 bg-black/50 px-4 py-2 rounded-full text-white hover:bg-black/70 transition z-20"
        onClick={() => setMuted(!muted)}
      >
        {muted ? "Unmute 🔊" : "Mute 🔇"}
      </button>

      {/* Extra Tailwind animations */}
      <style jsx>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein {
          animation: fadein 1s ease forwards;
        }

        @keyframes floatHeart {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-80px) scale(1.3); opacity: 1; }
          100% { transform: translateY(-150px) scale(1); opacity: 0; }
        }
        .animate-floatHeart {
          animation: floatHeart 1.2s ease forwards;
          pointer-events: none;
        }

        .glow-yellow {
          text-shadow: 0 0 8px #facc15, 0 0 12px #fbbf24;
        }
      `}</style>
    </div>
  );
}
