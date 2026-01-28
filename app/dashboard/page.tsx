"use client";

import React, { useState } from "react";

type Stat = {
  label: string;
  value: number;
  icon: string;
};

type Post = {
  id: number;
  user: string;
  content: string;
};

export default function DashboardPage() {
  const [stats] = useState<Stat[]>([
    { label: "Users", value: 1245, icon: "👥" },
    { label: "Posts", value: 567, icon: "📝" },
    { label: "Likes", value: 3421, icon: "❤️" },
    { label: "Comments", value: 876, icon: "💬" },
  ]);

  const [feed] = useState<Post[]>([
    { id: 1, user: "SmileLiveOfficial", content: "Welcome to Smile Live App! 🎬✨" },
    { id: 2, user: "Alexandra", content: "Golden hour vibes 🌇✨ #SmileLive" },
    { id: 3, user: "BM", content: "Late night coding sessions 😎💻 #DevLife" },
  ]);

  const sidebarItems = [
    { label: "Landing", icon: "🏠", href: "/landing" },
    { label: "Social App", icon: "⚡", href: "/smile_social" },
    { label: "Dashboard", icon: "📊", href: "/dashboard" },
  ];

  return (
    <div className="flex min-h-screen bg-yellow-50 font-sans">

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-24 bg-yellow-400 flex flex-col items-center py-8 gap-6 shadow-lg z-50">
        {sidebarItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-1 text-black hover:scale-110 transition-transform"
            title={item.label}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </a>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-24 p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-8">📊 Smile Live Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-transform relative overflow-hidden group"
            >
              <span className="text-4xl font-extrabold text-yellow-400">{stat.value}</span>
              <span className="text-sm font-semibold text-gray-700 mt-2">{stat.label}</span>
              <span className="absolute -top-2 -right-2 text-2xl opacity-20 group-hover:opacity-40 transition-opacity">{stat.icon}</span>
            </div>
          ))}
        </div>

        {/* Feed Live Demo */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-black mb-4">🔥 Live Feed Demo</h2>
          <div className="space-y-4">
            {feed.map((post) => (
              <div key={post.id} className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow flex flex-col gap-2">
                <span className="font-bold text-yellow-400">{post.user}</span>
                <p className="text-gray-700">{post.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="mt-12 bg-white p-6 rounded-2xl shadow-lg h-64 flex items-center justify-center text-gray-400 font-semibold">
          📊 Charts Placeholder (Connect Chart.js or Recharts)
        </div>
      </main>
    </div>
  );
}
