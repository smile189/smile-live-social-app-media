"use client";

import Link from "next/link";
import { Play } from "lucide-react";

/**
 * Folosit în componenta de chat pentru a randa mesajele de tip "post_share".
 *
 * Exemplu de utilizare în chat:
 *
 *   let content = msg.content;
 *   try {
 *     const parsed = JSON.parse(msg.content);
 *     if (parsed.type === "post_share") {
 *       return <SharedPostCard payload={parsed} isMine={isMine} />;
 *     }
 *   } catch {}
 *   // fallback — mesaj text normal
 */

interface SharedPostPayload {
  type:            "post_share";
  post_id:         string;
  caption:         string;
  thumbnail_url:   string;
  author_username: string;
  post_url:        string;
}

interface SharedPostCardProps {
  payload: SharedPostPayload;
  isMine?: boolean;          // true dacă mesajul îi aparține userului curent
}

export default function SharedPostCard({ payload, isMine = false }: SharedPostCardProps) {
  const isVideo = payload.thumbnail_url?.match(/\.(mp4|mov|webm)/i);

  return (
    <Link href={payload.post_url}
      className="block rounded-[1.4rem] overflow-hidden max-w-[240px] transition-all active:scale-95"
      style={{
        background:  isMine ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.05)",
        border:      `1.5px solid ${isMine ? "rgba(236,72,153,0.25)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[9/14] bg-zinc-900 overflow-hidden">
        {payload.thumbnail_url ? (
          isVideo
            ? <video src={payload.thumbnail_url} className="w-full h-full object-cover" muted playsInline />
            : <img src={payload.thumbnail_url} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <Play size={28} className="text-white/30" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }}>
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/10">
            <Play size={16} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-[9px] font-black text-pink-400 uppercase tracking-widest mb-0.5">
          @{payload.author_username}
        </p>
        {payload.caption && (
          <p className="text-[11px] font-bold text-white/80 leading-snug line-clamp-2">
            {payload.caption}
          </p>
        )}
        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1.5">
          Smile Live · Tap to watch
        </p>
      </div>
    </Link>
  );
}

