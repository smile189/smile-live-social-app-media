"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Home, Compass, MessageSquare, Plus, User } from "lucide-react";

export default function BottomNav() {
  const router = useRouter();
  const [active, setActive] = useState("feed");
  const [user, setUser] = useState<any>(null);

  // Inițializăm clientul Supabase pentru verificare sesiune
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Verificăm starea userului la încărcare și la schimbări de auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleAction = async (id: string) => {
    setActive(id);

    // 1. Logica pentru HOME (Refresh/Scroll)
    if (id === "feed") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Verificăm dacă userul este logat pentru restul funcțiilor
    if (!user) {
      // Dacă NU e logat, orice buton (Hot, Create, Chat, Connect) îl duce la login
      router.push("app/login");
      return;
    }

    // 3. Dacă ESTE logat, deblocăm rutele specifice
    switch (id) {
      case "connect":
        router.push("/profile"); // Pagina lui de profil
        break;
      case "add":
        router.push("/upload"); // Pagina de urcare clipuri
        break;
      case "chat":
        router.push("/messages"); // Mesageria
        break;
      case "hot":
        console.log("Loading trending content...");
        break;
      default:
        break;
    }
  };

  const navItems = [
    { id: "feed", label: "Home", icon: Home },
    { id: "hot", label: "Hot", icon: Compass },
    { id: "add", label: "Create", icon: Plus, isSpecial: true },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "connect", label: "Connect", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full px-4 pb-8 pt-4 z-50 pointer-events-none">
      <nav className="max-w-md mx-auto h-20 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[32px] flex items-center justify-around px-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          if (item.isSpecial) {
            return (
              <div key={item.id} className="relative group -translate-y-4">
                <div className="absolute inset-0 bg-yellow-400/40 blur-2xl rounded-full scale-150 animate-[pulse_4s_ease-in-out_infinite]" />
                <button 
                  onClick={() => handleAction(item.id)}
                  className="relative w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center text-black shadow-[0_10px_30px_rgba(250,204,21,0.4)] hover:scale-110 active:scale-90 transition-all duration-300"
                >
                  <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleAction(item.id)}
              className="flex flex-col items-center gap-1 min-w-[60px] group transition-all"
            >
              <div className="relative">
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 1.8} 
                  className={`transition-all duration-500 ${
                    isActive ? "text-white scale-110 shadow-white" : "text-white/30 group-hover:text-white/60"
                  }`} 
                />
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]" />
                )}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                isActive ? "text-white opacity-100" : "text-white/20 opacity-0 group-hover:opacity-100"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <style jsx global>{`
        @keyframes pulse-custom {
          0%, 100% { opacity: 0.2; transform: scale(1.2); }
          50% { opacity: 0.6; transform: scale(1.8); }
        }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
