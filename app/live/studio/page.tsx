/**
 * path: app/live/studio/page.tsx
 * about: Streamer Studio — all-in-one: auth, pre-live, LiveKit, gifts, chat realtime, viewers
 * author: AI / BM
 */

"use client";

import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  LiveKitRoom,
  useParticipants,
  VideoTrack,
  RoomAudioRenderer,
  useTracks,
  useRoomContext,
} from "@livekit/components-react";
import { RoomEvent, Track } from "livekit-client";
import type { RemoteParticipant, Room } from "livekit-client";
import Image from "next/image";
// Înlocuiește CameraRotate cu SwitchCamera
import {
  Radio, AlertCircle, ShieldAlert, Users, ArrowLeft, Video,
  Wifi, Smartphone, BadgeCheck, Lightbulb, TrendingUp, Coins,
  Phone, Mic, MicOff, Camera, CameraOff, SwitchCamera,
  ScreenShare, Eye, UserPlus, Send, StopCircle, Loader2,
} from "lucide-react";


/* ═══════════════════════════════════════════
   TYPES
═══════════════════════════════════════════ */
interface UserProfile {
  id: string;
  username: string;
  is_live: boolean;
  live_room_id: string | null;
  coins: number;
}

interface GiftType {
  id: string;
  name: string;
  image_url: string;
  coin_price: number;
  description: string;
}

interface Viewer {
  identity: string;
  displayName: string;
  initials: string;
  color: string;
  joinedAt: number;
}

interface LiveChatMessage {
  id: string;
  sender_id: string;
  type: "text" | "message" | "gift" | "heart";
  content: string | null;
  created_at: string;
  sender?: { id: string; username: string; avatar_url: string | null };
  gift?: GiftType | null;
}

interface GiftToastData {
  senderName: string;
  senderColor: string;
  senderInitials: string;
  giftName: string;
  giftImageUrl: string;
}

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const MIN_FOLLOWERS = 0;
const AVATAR_COLORS = [
  "#FE2C55","#25F4EE","#7F77DD","#EF9F27",
  "#1D9E75","#D4537E","#378ADD","#FF6B81",
];

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initialsFrom(name: string) {
  return name.replace("@", "").slice(0, 2).toUpperCase();
}
function toViewer(p: RemoteParticipant): Viewer {
  const identity = p.identity;
  return {
    identity,
    displayName: p.name || `@${identity}`,
    initials: initialsFrom(p.name || identity),
    color: colorFor(identity),
    joinedAt: Date.now(),
  };
}

/* ═══════════════════════════════════════════
   SHARED UI HELPERS
═══════════════════════════════════════════ */
function Progress({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-[5px] w-full rounded-full bg-white/[0.08] overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ReqCard({ icon: Icon, label, value, ok }: {
  icon: React.ElementType; label: string; value: string; ok: boolean;
}) {
  return (
    <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-3.5">
      <Icon className={`h-5 w-5 mb-2 ${ok ? "text-[#25F4EE]" : "text-amber-400"}`} />
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/35 mb-1">{label}</p>
      <p className={`text-xl font-black tracking-tight ${ok ? "text-[#25F4EE]" : "text-amber-400"}`}>{value}</p>
    </div>
  );
}

function Tip({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 bg-[#111] border border-white/[0.05] rounded-[14px] px-3.5 py-3">
      <Icon className="h-4 w-4 text-[#FE2C55] flex-shrink-0 mt-0.5" />
      <p className="text-[13px] text-white/50 leading-relaxed">{children}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LIVE SCREEN INNER  (needs LiveKitRoom ctx)
═══════════════════════════════════════════ */
interface LiveScreenInnerProps {
  streamerId: string;
  senderId: string;
  senderCoins: number;
  onStop: () => void;
  supabase: ReturnType<typeof createBrowserClient>;
}

function LiveScreenInner({
  streamerId, senderId, senderCoins, onStop, supabase,
}: LiveScreenInnerProps) {
  const room = useRoomContext() as Room;
  const participants = useParticipants();
  const localTracks = useTracks([Track.Source.Camera], { onlySubscribed: false });

  /* ── LiveKit viewers ── */
  const [viewers, setViewers] = useState<Viewer[]>([]);

  useEffect(() => {
    const remotes = participants.filter((p) => !p.isLocal) as RemoteParticipant[];
    setViewers((prev) => {
      const ids = new Set(remotes.map((p) => p.identity));
      const kept = prev.filter((v) => ids.has(v.identity));
      const existing = new Set(kept.map((v) => v.identity));
      const added = remotes.filter((p) => !existing.has(p.identity)).map(toViewer);
      return [...kept, ...added];
    });
  }, [participants]);

  useEffect(() => {
    function onJoin(p: RemoteParticipant) { setViewers((prev) => [...prev, toViewer(p)]); }
    function onLeave(p: RemoteParticipant) {
      setViewers((prev) => prev.filter((v) => v.identity !== p.identity));
    }
    room.on(RoomEvent.ParticipantConnected, onJoin);
    room.on(RoomEvent.ParticipantDisconnected, onLeave);
    return () => {
      room.off(RoomEvent.ParticipantConnected, onJoin);
      room.off(RoomEvent.ParticipantDisconnected, onLeave);
    };
  }, [room]);

  /* ── Gift types ── */
  const [giftTypes, setGiftTypes] = useState<GiftType[]>([]);
  useEffect(() => {
    supabase
      .from("gift_types")
      .select("id, name, image_url, coin_price, description")
      .order("coin_price", { ascending: true })
      .then(({ data }: { data: any }) => { if (data) setGiftTypes(data as GiftType[]); });

  }, [supabase]);

  /* ── Coins (optimistic) ── */
  const [localCoins, setLocalCoins] = useState(senderCoins);
  const [sendingGiftId, setSendingGiftId] = useState<string | null>(null);
  const [giftError, setGiftError] = useState<string | null>(null);

  /* ── Chat realtime ── */
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load recent
    supabase
      .from("live_chat")
      .select(`
        id, sender_id, type, content, created_at,
        sender:profiles!live_chat_sender_id_fkey(id, username, avatar_url),
        gift:gift_types(id, name, image_url, coin_price, description)
      `)
      .eq("streamer_id", streamerId)
      .order("created_at", { ascending: false })
      .limit(40)
   .then(({ data }: { data: any }) => {
  if (data) setMessages((data as LiveChatMessage[]).reverse());
});

    // Realtime subscription
    const channel = supabase
      .channel(`live_chat:${streamerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_chat", filter: `streamer_id=eq.${streamerId}` },
    async (payload: any) => {
          const { data } = await supabase
            .from("live_chat")
            .select(`
              id, sender_id, type, content, created_at,
              sender:profiles!live_chat_sender_id_fkey(id, username, avatar_url),
              gift:gift_types(id, name, image_url, coin_price, description)
            `)
            .eq("id", payload.new.id)
            .single();
          if (data) setMessages((prev) => [...prev.slice(-60), data as LiveChatMessage]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [streamerId, supabase]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  /* ── Send gift ── */
  async function handleGift(g: GiftType) {
    if (sendingGiftId) return;
    if (localCoins < g.coin_price) {
      setGiftError("Coins insuficienți.");
      setTimeout(() => setGiftError(null), 3000);
      return;
    }
    setSendingGiftId(g.id);
    setGiftError(null);
    const prev = localCoins;
    setLocalCoins((c) => c - g.coin_price); // optimistic

    // 1. INSERT gift_transaction → triggerul process_gift_transaction deduce coins
    const { error: txError } = await supabase
      .from("gift_transactions")
      .insert({
        sender_id: senderId,
        receiver_id: streamerId,
        gift_type_id: g.id,
        coins_amount: g.coin_price,
      });

    if (txError) {
      setLocalCoins(prev); // rollback
      setGiftError(
        txError.message.toLowerCase().includes("insufficient")
          ? "Coins insuficienți."
          : "Tranzacția a eșuat."
      );
      setTimeout(() => setGiftError(null), 3000);
      setSendingGiftId(null);
      return;
    }

    // 2. INSERT live_chat type='gift' → apare în feed realtime
    await supabase.from("live_chat").insert({
      streamer_id: streamerId,
      sender_id: senderId,
      gift_id: g.id,
      type: "gift",
      content: null,
    });

    // Toast local
    showGiftToast({
      senderName: "Tu",
      senderColor: "#FE2C55",
      senderInitials: "TU",
      giftName: g.name,
      giftImageUrl: g.image_url,
    });

    setSendingGiftId(null);
  }

  /* ── Gift toast ── */
  const [giftToast, setGiftToast] = useState<GiftToastData | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function showGiftToast(data: GiftToastData) {
    setGiftToast(data);
    clearTimeout(toastTimer.current ?? undefined);
    toastTimer.current = setTimeout(() => setGiftToast(null), 2800);
  }

  /* ── Chat send ── */
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  async function sendChat() {
    const text = chatInput.trim();
    if (!text || sendingChat) return;
    setSendingChat(true);
    await supabase.from("live_chat").insert({
      streamer_id: streamerId,
      sender_id: senderId,
      type: "text",
      content: text,
    });
    setChatInput("");
    setSendingChat(false);
  }

  /* ── LiveKit controls ── */
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [shareOn, setShareOn] = useState(false);
  const [showMuteHint, setShowMuteHint] = useState(false);
  const muteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function toggleMic() {
    try {
      await room.localParticipant.setMicrophoneEnabled(!micOn);
      if (micOn) {
        setShowMuteHint(true);
        clearTimeout(muteTimer.current ?? undefined);
        muteTimer.current = setTimeout(() => setShowMuteHint(false), 2000);
      }
      setMicOn((v) => !v);
    } catch (e) { console.error(e); }
  }
  async function toggleCam() {
    try { await room.localParticipant.setCameraEnabled(!camOn); setCamOn((v) => !v); }
    catch (e) { console.error(e); }
  }
  async function toggleShare() {
    try { await room.localParticipant.setScreenShareEnabled(!shareOn); setShareOn((v) => !v); }
    catch (e) { console.error(e); }
  }

  /* ── Viewers panel ── */
  const [showViewers, setShowViewers] = useState(false);

  /* ── Render ── */
  const localCameraTrack = localTracks.find((t) => t.source === Track.Source.Camera);
  const visibleAvatars = viewers.slice(-5);
  const extraCount = Math.max(0, viewers.length - visibleAvatars.length);

  const sideActions = [
    { label: "Mic",   icon: micOn  ? Mic       : MicOff,    on: !micOn,  action: toggleMic   },
    { label: "Cam",   icon: camOn  ? Camera    : CameraOff, on: !camOn,  action: toggleCam   },
    { label: "Flip",  icon: SwitchCamera,                   on: false,   action: () => {}    },
    { label: "Share", icon: ScreenShare,                    on: shareOn, action: toggleShare },
  ] as const;

  return (
    <div className="relative min-h-screen bg-black flex flex-col overflow-hidden">

      {/* Camera bg */}
      <div className="absolute inset-0 z-0 bg-[#0d0d0d] flex items-center justify-center">
        {localCameraTrack
          ? <VideoTrack trackRef={localCameraTrack} className="w-full h-full object-cover" />
          : <Video className="h-16 w-16 text-white/10" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25" />
      </div>

      {/* UI overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Topbar */}
        <div className="flex items-center justify-between px-4 pt-4 gap-3">
          <div className="flex items-center gap-1.5 bg-[#FE2C55] text-white text-[11px] font-black px-3 py-1.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
          <button
            onClick={() => setShowViewers(true)}
            className="flex items-center gap-1.5 bg-black/50 border border-white/10 text-white/85 text-[12px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm hover:border-white/30 transition-colors"
          >
            <Eye className="h-3.5 w-3.5 text-[#25F4EE]" />
            {viewers.length}
          </button>
        </div>

        {/* Gift toast */}
        {giftToast && (
          <div className="absolute top-16 left-4 z-30 flex items-center gap-2.5 bg-black/70 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm pointer-events-none">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
              style={{ background: giftToast.senderColor, color: "#000" }}
            >
              {giftToast.senderInitials}
            </div>
            <span className="text-[13px] font-bold text-white">{giftToast.senderName}</span>
            <span className="text-[12px] text-white/50">trimis</span>
            <div className="relative w-5 h-5 flex-shrink-0">
              <Image src={giftToast.giftImageUrl} alt={giftToast.giftName} fill className="object-contain" unoptimized />
            </div>
            <span className="text-[13px] font-bold text-[#EF9F27]">{giftToast.giftName}</span>
          </div>
        )}

        {/* Mute hint */}
        {showMuteHint && (
          <div className="absolute top-16 left-4 z-30 flex items-center gap-2 bg-black/60 border border-[#FE2C55]/30 rounded-full px-3 py-1.5 pointer-events-none">
            <MicOff className="h-3.5 w-3.5 text-[#FE2C55]" />
            <span className="text-[12px] font-bold text-[#FE2C55]">Microfon oprit</span>
          </div>
        )}

        {/* Side controls */}
        <div className="absolute right-3 top-16 flex flex-col gap-3 items-center z-20">
          {sideActions.map(({ label, icon: Icon, on, action }) => (
            <button
              key={label}
              aria-label={label}
              onClick={action}
              className={`w-11 h-11 rounded-full border flex flex-col items-center justify-center gap-0.5 backdrop-blur-sm transition-all
                ${on
                  ? "bg-[#FE2C55]/20 border-[#FE2C55]/40"
                  : "bg-black/50 border-white/10 hover:bg-white/10 hover:border-white/25"
                }`}
            >
              <Icon className={`h-5 w-5 ${on ? "text-[#FE2C55]" : "text-white"}`} />
              <span className="text-[9px] text-white/45 font-semibold">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Coins balance */}
        <div className="flex items-center gap-1.5 px-4 pb-1">
          <Coins className="h-3.5 w-3.5 text-[#EF9F27]" />
          <span className="text-[12px] font-bold text-[#EF9F27]">
            {localCoins.toLocaleString()} coins
          </span>
        </div>

        {/* Gift error */}
        {giftError && (
          <div className="mx-3 mb-1.5 flex items-center gap-2 bg-red-950/30 border border-red-900/40 rounded-xl px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
            <span className="text-[12px] text-red-400 font-medium">{giftError}</span>
          </div>
        )}

        {/* Gift bar */}
        {giftTypes.length > 0 && (
          <div
            className="flex items-center gap-2 px-3 pb-2 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {giftTypes.map((g) => {
              const canAfford = localCoins >= g.coin_price;
              const isSending = sendingGiftId === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => handleGift(g)}
                  disabled={!canAfford || !!sendingGiftId}
                  title={`${g.name} — ${g.coin_price} coins`}
                  className={`flex-shrink-0 flex flex-col items-center gap-1.5 rounded-[14px] px-3 py-2 border transition-all min-w-[56px]
                    ${canAfford && !sendingGiftId
                      ? "bg-black/50 border-white/[0.08] hover:border-white/25 hover:bg-white/[0.06]"
                      : "bg-black/20 border-white/[0.04] opacity-40 cursor-not-allowed"
                    }
                    ${isSending ? "border-[#EF9F27]/40 bg-[#EF9F27]/10" : ""}
                  `}
                >
                  {isSending ? (
                    <Loader2 className="h-7 w-7 text-[#EF9F27] animate-spin" />
                  ) : (
                    <div className="relative w-7 h-7">
                      <Image
                        src={g.image_url}
                        alt={g.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  <span className="text-[10px] text-white/50 font-semibold">{g.coin_price}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Viewer avatar stack */}
        {viewers.length > 0 && (
          <div className="flex items-center gap-2 px-4 pb-1.5">
            <div className="flex items-center">
              {visibleAvatars.map((v, i) => (
                <div
                  key={v.identity}
                  className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-black"
                  style={{
                    background: v.color,
                    color: "#000",
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: visibleAvatars.length - i,
                    position: "relative",
                  }}
                >
                  {v.initials}
                </div>
              ))}
            </div>
            <span className="text-[12px] text-white/45 font-medium">
              {extraCount > 0 ? `+${extraCount} vizionează` : `${viewers.length} vizionează`}
            </span>
          </div>
        )}

        {/* Chat feed */}
        <div
          ref={chatRef}
          className="px-3 pb-2 flex flex-col gap-1.5 max-h-44 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {messages.map((msg) => {
            const color = colorFor(msg.sender_id);
            const name = msg.sender?.username ? `@${msg.sender.username}` : `@${msg.sender_id.slice(0, 6)}`;
            const inits = initialsFrom(name);

            if (msg.type === "gift" && msg.gift) {
              return (
                <div key={msg.id} className="flex items-center gap-2 py-0.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black flex-shrink-0"
                    style={{ background: color, color: "#000" }}
                  >
                    {inits}
                  </div>
                  <span className="text-[12px]">
                    <span className="font-bold" style={{ color }}>{name}</span>
                    <span className="text-white/40"> a trimis </span>
                    <span className="font-bold text-[#EF9F27]">{msg.gift.name}</span>
                  </span>
                  <div className="relative w-4 h-4 flex-shrink-0">
                    <Image src={msg.gift.image_url} alt={msg.gift.name} fill className="object-contain" unoptimized />
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex items-start gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5"
                  style={{ background: color, color: "#000" }}
                >
                  {inits}
                </div>
                <div
                  className="rounded-[0_10px_10px_10px] px-2.5 py-1.5 max-w-[220px]"
                  style={{ background: "rgba(0,0,0,0.52)" }}
                >
                  <p className="text-[11px] font-bold mb-0.5" style={{ color }}>{name}</p>
                  <p className="text-[13px] text-white/88 leading-snug">{msg.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat input */}
        <div className="flex items-center gap-2 px-3 pb-3">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
            placeholder="Scrie un comentariu..."
            className="flex-1 bg-white/[0.07] border border-white/10 rounded-full px-4 py-2.5 text-[13px] text-white placeholder:text-white/30 outline-none"
          />
          <button
            onClick={sendChat}
            disabled={sendingChat || !chatInput.trim()}
            className="w-10 h-10 rounded-full bg-[#FE2C55] flex items-center justify-center flex-shrink-0 disabled:opacity-40"
            aria-label="Trimite"
          >
            {sendingChat
              ? <Loader2 className="h-4 w-4 text-white animate-spin" />
              : <Send className="h-4 w-4 text-white" />
            }
          </button>
        </div>

        {/* Stop */}
        <div className="px-3 pb-5">
          <button
            onClick={onStop}
            className="w-full py-3.5 rounded-2xl bg-[#FE2C55]/10 border border-[#FE2C55]/30 text-[#FE2C55] text-[13px] font-black flex items-center justify-center gap-2"
          >
            <StopCircle className="h-4 w-4" />
            Oprește live-ul
          </button>
        </div>
      </div>

      {/* Viewers panel */}
      {showViewers && (
        <div
          className="absolute inset-0 z-40 bg-black/75 flex flex-col justify-end"
          onClick={(e) => { if (e.target === e.currentTarget) setShowViewers(false); }}
        >
          <div className="bg-[#111] rounded-t-[20px] max-h-[70%] flex flex-col">
            <div className="w-9 h-1 bg-white/15 rounded-full mx-auto mt-3 mb-4" />
            <div className="flex items-center justify-between px-4 pb-3">
              <span className="text-[14px] font-black text-white">
                Vizionează acum ({viewers.length})
              </span>
              <button
                onClick={() => setShowViewers(false)}
                className="text-white/40 text-xl leading-none hover:text-white transition-colors"
                aria-label="Închide"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-4 pb-6">
              {viewers.length === 0 ? (
                <p className="text-[13px] text-white/30 text-center py-8">Niciun viewer momentan</p>
              ) : (
                [...viewers].reverse().map((v) => {
                  const mins = Math.floor((Date.now() - v.joinedAt) / 60000);
                  return (
                    <div
                      key={v.identity}
                      className="flex items-center gap-3 py-2.5 border-b border-white/[0.05] last:border-0"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black flex-shrink-0"
                        style={{ background: v.color, color: "#000" }}
                      >
                        {v.initials}
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-bold text-white">{v.displayName}</p>
                        <p className="text-[12px] text-white/35">
                          {mins < 1 ? "acum" : `acum ${mins} min`}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <RoomAudioRenderer />
    </div>
  );
}

/* ═══════════════════════════════════════════
   LIVE SCREEN WRAPPER  (provides LiveKitRoom ctx)
═══════════════════════════════════════════ */
function LiveScreen({
  token, streamerId, senderId, senderCoins, onStop, supabase,
}: {
  token: string;
  streamerId: string;
  senderId: string;
  senderCoins: number;
  onStop: () => void;
  supabase: ReturnType<typeof createBrowserClient>;
}) {
  return (
<LiveKitRoom
  token={token}
  serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
  video={false} 
  audio={false} 
  connect={true}
  onDisconnected={onStop}
  style={{ display: "contents" }}
  // Folosim evenimentul nativ de conectare pe cameră (fără argumente în paranteze)
  onConnected={() => {
    // Cerem browserului să deschidă camera și microfonul în mod direct
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(() => console.log("Permisiune acordată cu succes!"))
      .catch((err) => console.error("Eroare de permisiune:", err));
  }}
>
  <LiveScreenInner
    streamerId={streamerId}
    senderId={senderId}
    senderCoins={senderCoins}
    onStop={onStop}
    supabase={supabase}
  />
</LiveKitRoom>

  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function LiveStudioPage() {
  const router = useRouter();

  const supabase = useMemo(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [lkToken, setLkToken] = useState("");
  const [error, setError] = useState("");
  const [loadingStream, setLoadingStream] = useState(false);

  
//** user profileload  */
  useEffect(() => {
  async function checkStreamerStatus() {
    try {
      // 1. Preluăm userul în condiții de siguranță prin getUser()
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError("Trebuie să fii autentificat pentru a accesa studioul live.");
        setLoadingCheck(false);
        return;
      }

      // 2. Selectăm DOAR coloanele care există cu adevărat în DB-ul tău
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, is_live, live_room_id") 
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.error("Supabase Error:", profileError);
        setError("Nu s-a găsit profilul de utilizator.");
        setLoadingCheck(false);
        return;
      }

      // 3. Injectăm monedele (0) manual în obiectul de stare pentru TypeScript
      setUserProfile({
        ...profile,
        coins: 0
      } as UserProfile);
      
      // 4. Setezi 0 urmăritori pentru testul tău curent
      setFollowerCount(0);

    } catch (err) {
      setError("Eroare tehnică la verificare.");
    } finally {
      setLoadingCheck(false);
    }
  }
  
  checkStreamerStatus();
}, [supabase]);


  async function handleStartStream() {
     if (followerCount < 0 || !userProfile) return; 
    setLoadingStream(true);
    setError("");
    const targetRoomId = `room_${userProfile.username}`;
    try {
      const res = await fetch(
        `/api/token?room=${encodeURIComponent(targetRoomId)}&username=${encodeURIComponent(userProfile.username)}`
      );
      const data = await res.json();
      if (!res.ok || !data.token) {
        setError(data.error || "Generarea token-ului a eșuat.");
        setLoadingStream(false);
        return;
      }
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ is_live: true, live_room_id: targetRoomId })
        .eq("id", userProfile.id);
      if (dbError) {
        setError("Nu s-a putut actualiza starea în baza de date.");
        setLoadingStream(false);
        return;
      }
      setLkToken(data.token);
      setIsLive(true);
    } catch {
      setError("Eroare la conectarea cu serverul LiveKit.");
    } finally {
      setLoadingStream(false);
    }
  }

  async function handleStopStream() {
    if (userProfile) {
      await supabase
        .from("profiles")
        .update({ is_live: false, live_room_id: null })
        .eq("id", userProfile.id);
    }
    setIsLive(false);
    setLkToken("");
    router.refresh();
  }

  /* ── Loading ── */
  if (loadingCheck) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#FE2C55]/20 flex items-center justify-center">
            <Radio className="h-6 w-6 text-[#FE2C55] animate-pulse" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 animate-pulse">
            Smile Live Studio...
          </p>
        </div>
      </div>
    );
  }

  /* ── Live screen ── */
  if (isLive && lkToken && userProfile) {
    return (
      <LiveScreen
        token={lkToken}
        streamerId={userProfile.id}
        senderId={userProfile.id}
        senderCoins={userProfile.coins ?? 0}
        onStop={handleStopStream}
        supabase={supabase}
      />
    );
  }

  /* ── Pre-live ── */
  const canGoLive = followerCount >= MIN_FOLLOWERS;

  return (
    <div className="min-h-screen bg-black text-white antialiased pb-10">

      {/* Topbar */}
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          onClick={() => router.push("/live")}
          className="flex items-center gap-1.5 bg-white/[0.08] hover:bg-white/[0.14] text-white/60 hover:text-white text-[13px] font-medium px-3.5 py-2 rounded-full transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </button>
        <span className="text-[15px] font-black tracking-tight">
          Smile<span className="text-[#FE2C55]">Live</span>
        </span>
        <div className="flex items-center gap-1.5 bg-[#FE2C55]/10 border border-[#FE2C55]/25 text-[#FE2C55] text-[11px] font-bold px-2.5 py-1.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FE2C55] animate-pulse" />
          STUDIO
        </div>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-4 pt-10 pb-6">
        <div className="h-[72px] w-[72px] rounded-[20px] bg-gradient-to-br from-[#FE2C55] to-[#ff6b81] flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(254,44,85,0.35)]">
          <Video className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2">Live Creator Studio</h1>
        <p className="text-sm text-white/50 max-w-[280px] leading-relaxed">
          Transmite live, conectează-te cu audiența ta și monetizează fiecare moment.
        </p>
      </div>

      {/* Follower gate alert */}
      {!canGoLive && (
        <div className="mx-4 mb-5 flex items-start gap-2.5 bg-amber-400/[0.07] border border-amber-400/20 rounded-[14px] px-3.5 py-3">
          <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-amber-300/80 leading-relaxed">
            Ai nevoie de <span className="font-bold text-amber-300">1,000 urmăritori</span> pentru a debloca live-ul.
          </p>
        </div>
      )}

      {/* Follower progress */}
      <div className="mx-4 mb-5 bg-[#111] border border-white/[0.07] rounded-[20px] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/35">Urmăritori</span>
          <span className={`text-[13px] font-bold ${canGoLive ? "text-[#25F4EE]" : "text-amber-400"}`}>
            {followerCount.toLocaleString()} / {MIN_FOLLOWERS.toLocaleString()}
          </span>
        </div>
        <Progress value={followerCount} max={MIN_FOLLOWERS} />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[12px] text-white/25">0</span>
          <span className="text-[12px] text-white/25">
            {canGoLive ? "Deblocat" : `${MIN_FOLLOWERS.toLocaleString()} — obiectiv`}
          </span>
        </div>
      </div>

      {/* Req cards */}
      <div className="mx-4 mb-5 grid grid-cols-2 gap-2.5">
        <ReqCard icon={Users} label="Urmăritori" value={followerCount.toLocaleString()} ok={canGoLive} />
        <ReqCard icon={BadgeCheck} label="Status cont" value="Activ" ok={true} />
        <ReqCard icon={Smartphone} label="Cameră" value="Ready" ok={true} />
        <ReqCard icon={Wifi} label="Conexiune" value="Stabil" ok={true} />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-4 flex items-start gap-2.5 bg-red-950/30 border border-red-900/40 rounded-[14px] px-3.5 py-3">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-red-400 font-medium">{error}</p>
        </div>
      )}

      {/* CTA */}
      <div className="mx-4 flex flex-col gap-2.5 mb-6">
        <button
          onClick={handleStartStream}
          disabled={loadingStream || !canGoLive}
          className="w-full py-[18px] rounded-2xl flex items-center justify-center gap-2.5 text-[15px] font-black tracking-tight transition-all
            bg-gradient-to-r from-[#FE2C55] to-[#ff6b81] shadow-[0_8px_30px_rgba(254,44,85,0.35)]
            hover:shadow-[0_12px_40px_rgba(254,44,85,0.45)] hover:-translate-y-0.5
            disabled:bg-none disabled:bg-[#222] disabled:text-white/20 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
        >
          {loadingStream
            ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <>
                <Radio className="h-5 w-5" />
                {canGoLive ? "Pornește Transmisiunea" : "Transmisiune Restricționată"}
              </>
          }
        </button>

        <a
          href="https://wa.me/40729411747"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-2xl border border-white/[0.08] flex items-center justify-center gap-2.5 text-[13px] font-semibold text-white/50 hover:text-white hover:border-white/20 transition-all"
        >
          <Phone className="h-4 w-4" />
          Support & Parteneriate
        </a>
      </div>

      {/* Tips */}
      <div className="mx-4 flex flex-col gap-2">
        <Tip icon={Lightbulb}>
          <strong className="text-white/80 font-semibold">Sfat:</strong>{" "}
          Transmisiunile de 30+ min generează de 4× mai multe Smiles.
        </Tip>
        <Tip icon={TrendingUp}>
          <strong className="text-white/80 font-semibold">Peak hours:</strong>{" "}
          Cel mai bun moment să transmiți este între 19:00 – 23:00.
        </Tip>
        <Tip icon={Coins}>
          <strong className="text-white/80 font-semibold">Monetizare:</strong>{" "}
          Activează campanii de brand direct din setările streamului.
        </Tip>
      </div>
    </div>
  );
}