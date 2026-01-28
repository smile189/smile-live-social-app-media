"use client";

import React from "react";

export default function DashboardPage() {
  const stats = [
    { label: "Users", value: 1245 },
    { label: "Posts", value: 567 },
    { label: "Likes", value: 3421 },
    { label: "Comments", value: 876 },
  ];

  return (
    <div className="min-h-screen bg-yellow-50 font-sans p-8">
      <h1 className="text-3xl font-bold text-black mb-8">📊 Dashboard Test</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-transform"
          >
            <span className="text-4xl font-extrabold text-yellow-400">{stat.value}</span>
            <span className="text-sm font-semibold text-gray-700 mt-2">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Sidebar demo */}
      <aside className="fixed top-0 left-0 h-full w-24 bg-yellow-400 flex flex-col items-center py-8 gap-6 shadow-lg">
        <button className="text-black text-2xl hover:scale-110 transition">🏠</button>
        <button className="text-black text-2xl hover:scale-110 transition">📈</button>
        <button className="text-black text-2xl hover:scale-110 transition">⚙️</button>
      </aside>
    </div>
  );
}
