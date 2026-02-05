"use client";

import { useState } from "react";
import SidebarActions from "@/components/ActionButton";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav"; //



export default function AppPage() {
  const [items] = useState(Array.from({ length: 5 }, (_, i) => ({ id: i })));

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative font-sans">
      
      {/* STRATUL 1: HEADER (TOP NAV) */}
      <TopNav />

      {/* STRATUL 2: PIPELINE SCROLL */}
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
        {items.map((item) => (
          <section key={item.id} className="h-screen w-full snap-start relative flex flex-col justify-end p-8 pb-32">

            {/* Metadata Placeholder */}
            <div className="z-10">
              <div className="w-32 h-5 bg-yellow-400/20 border border-yellow-400/30 rounded mb-2" />
              <div className="w-64 h-3 bg-zinc-900 rounded" />
            </div>
          </section>
        ))}
      </div>
         
       <SidebarActions />


      {/* STRATUL 3: FOOTER (BOTTOM NAV) */}
      <BottomNav />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
