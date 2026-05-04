"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Search, Send, Check, Loader2, Gem } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareModalProps {
  post: {
    id: string;
    caption?: string;
    thumbnail_url?: string;
    video_url?: string;
    media_url?: string;
    profiles?: { username?: string; avatar_url?: string };
  };
  currentUser: { id: string };
  supabase: any;
  onClose: () => void;
}

/**
 * Payload stocat în direct_messages.content (JSON string):
 * {
 *   type: "post_share",
 *   post_id: string,
 *   caption: string,
 *   thumbnail_url: string,
 *   author_username: string,
 *   post_url: string
 * }
 */

export default function ShareModal({ post, currentUser, supabase, onClose }: ShareModalProps) {
  const [users, setUsers]       = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [query, setQuery]       = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);

  // ── Fetch followings (persoane pe care le urmărești) ──────────────────────
  useEffect(() => {
    const fetchFollowing = async () => {
      const { data } = await supabase
        .from("follows")
        .select("following_id, profiles:following_id(id, username, avatar_url)")
        .eq("follower_id", currentUser.id);

      const list = (data || []).map((f: any) => f.profiles).filter(Boolean);
      setUsers(list);
      setFiltered(list);
    };
    fetchFollowing();
  }, [currentUser.id, supabase]);

  // ── Search filter ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!query.trim()) { setFiltered(users); return; }
    setFiltered(users.filter(u => u.username?.toLowerCase().includes(query.toLowerCase())));
  }, [query, users]);

  const toggleUser = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (selected.size === 0 || sending) return;
    setSending(true);

    const postUrl = `${typeof window !== "undefined" ? window.location.origin : "https://smileliveapp.com"}/app/post/${post.id}`;

    const payload = JSON.stringify({
      type:            "post_share",
      post_id:         post.id,
      caption:         post.caption || "",
      thumbnail_url:   post.thumbnail_url || post.video_url || post.media_url || "",
      author_username: post.profiles?.username || "",
      post_url:        postUrl,
    });

    // Trimitem câte un mesaj per user selectat
    const inserts = Array.from(selected).map(recipientId => {
      // room_id = combinație sortată a celor două user_id (același room pentru ambii)
      const roomId = [currentUser.id, recipientId].sort().join("_");
      return {
        room_id:   roomId,
        sender_id: currentUser.id,
        content:   payload,
      };
    });

    await supabase.from("direct_messages").insert(inserts);

    setSending(false);
    setSent(true);
    setTimeout(onClose, 1400);
  };

  const thumbnail = post.thumbnail_url || post.video_url || post.media_url || "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(14px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
        className="w-full max-w-md rounded-t-[2.5rem] flex flex-col"
        style={{ background: "#111114", maxHeight: "85dvh" }}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-white/10 mx-auto mt-4 mb-2 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <div>
            <h3 className="font-black text-white text-base tracking-tighter">Trimite în Chat</h3>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
              {selected.size > 0 ? `${selected.size} selectat${selected.size > 1 ? "i" : ""}` : "Alege destinatari"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 text-white/40 hover:bg-white/10 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Post preview card */}
        <div className="mx-6 mb-4 rounded-2xl overflow-hidden flex shrink-0"
          style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.06)" }}>
          {thumbnail && (
            <div className="w-16 h-16 shrink-0 bg-zinc-900">
              {thumbnail.match(/\.(mp4|mov|webm)/i)
                ? <video src={thumbnail} className="w-full h-full object-cover" muted playsInline />
                : <img src={thumbnail} className="w-full h-full object-cover" alt="" />
              }
            </div>
          )}
          <div className="flex-1 px-4 py-3 min-w-0 flex flex-col justify-center">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5">
              @{post.profiles?.username || "smile"}
            </p>
            <p className="text-[11px] font-bold text-white leading-snug line-clamp-2">
              {post.caption || "Clip de pe Smile Live"}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 mb-3 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Caută..."
              className="w-full pl-9 pr-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-white/20 outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)" }}
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-1.5 min-h-0">
          {filtered.length === 0 && (
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-white/20 py-10">
              {users.length === 0 ? "Nu urmărești pe nimeni încă" : "Niciun rezultat"}
            </p>
          )}
          {filtered.map(u => {
            const isSelected = selected.has(u.id);
            return (
              <button key={u.id} onClick={() => toggleUser(u.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                style={{ background: isSelected ? "rgba(236,72,153,0.12)" : "rgba(255,255,255,0.03)", border: `1.5px solid ${isSelected ? "rgba(236,72,153,0.3)" : "transparent"}` }}>
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                  {u.avatar_url
                    ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-zinc-500 uppercase">{u.username?.[0]}</div>}
                </div>
                <span className="flex-1 text-left text-[12px] font-black text-white tracking-tight">@{u.username}</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 ${isSelected ? "bg-pink-500" : "bg-white/10"}`}>
                  {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Send button */}
        <div className="px-6 pb-10 pt-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            onClick={handleSend}
            disabled={selected.size === 0 || sending || sent}
            className="w-full py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-tight transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2"
            style={{ background: sent ? "#10b981" : selected.size > 0 ? "linear-gradient(90deg,#ec4899,#a855f7)" : "rgba(255,255,255,0.08)" }}
          >
            {sent
              ? <><Check size={16} strokeWidth={3} /> Trimis!</>
              : sending
              ? <><Loader2 size={16} className="animate-spin" /> Se trimite...</>
              : <><Send size={15} /> Trimite{selected.size > 1 ? ` (${selected.size})` : ""}</>
            }
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}