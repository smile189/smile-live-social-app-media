"use client";

import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ActionItem = {
  icon: LucideIcon;
  count: string;
  active: string;
};

const actions: ActionItem[] = [
  { icon: Heart, count: "1.2M", active: "group-hover:text-red-500" },
  { icon: MessageSquare, count: "45K", active: "group-hover:text-blue-400" },
  { icon: Bookmark, count: "89K", active: "group-hover:text-yellow-400" },
  { icon: Share2, count: "Share", active: "group-hover:text-green-400" },
];

export default function SidebarActions() {
  return (
    <div className="absolute right-4 bottom-[18vh] flex flex-col items-center gap-6 z-40">
      {/* PROFIL */}
      <div className="relative mb-4 group">
        <div className="w-14 h-14 rounded-full border-2 border-white p-0.5 overflow-hidden">
          <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center">
            <span className="text-[10px] font-black text-white">USER</span>
          </div>
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black text-lg font-black border-2 border-black">
          +
        </div>
      </div>

      {/* ACTIONS */}
      {actions.map((item, idx) => (
        <button
          key={idx}
          className="group flex flex-col items-center gap-1.5"
        >
          <div className="relative">
            <div className="absolute inset-0 blur-md bg-black/40 rounded-full -z-10" />
            <item.icon
              size={32}
              strokeWidth={2}
              className={`text-white transition-all duration-300 ${item.active} group-active:scale-90`}
            />
          </div>
          <span className="text-[11px] font-black text-white uppercase">
            {item.count}
          </span>
        </button>
      ))}

      <button className="mt-2 opacity-50 hover:opacity-100">
        <MoreHorizontal size={28} className="text-white" />
      </button>
    </div>
  );
}
