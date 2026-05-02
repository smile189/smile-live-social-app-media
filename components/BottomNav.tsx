"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

import { Home, Flame, MessageSquare, Plus, User, Coins } from "lucide-react";


// --- FIX: Am adăugat interfața pentru Props ---
interface BottomNavProps {
  activePostId?: string | null;
  progress?: number;
}

export default function BottomNav({ activePostId, progress = 0 }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("feed");
  const [user, setUser] = useState<any>(null);
  const [hasUnread, setHasUnread] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (pathname?.includes("messages")) setActive("chat");
    else if (pathname?.includes("profile")) setActive("connect");
    else if (pathname?.includes("upload")) setActive("add");
    else setActive("feed");
  }, [pathname]);

  const checkUnread = async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from("direct_messages")
        .select("*", { count: 'exact', head: true })
        .neq("sender_id", userId)
        .filter('room_id', 'ilike', `%${userId}%`);

      if (!error) setHasUnread((count || 0) > 0);
    } catch (err) {
      console.log("Eroare badge:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) checkUnread(currentUser.id);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const curr = session?.user ?? null;
      setUser(curr);
      if (curr) checkUnread(curr.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('nav-realtime-dot')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        if (payload.new.room_id.includes(user.id) && payload.new.sender_id !== user.id) {
          setHasUnread(true);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

const navItems = [
  { id: "feed", label: "Home", icon: Home, path: "/app" },
  { id: "buy", label: "Buy", icon: Coins, path: "/app/coins" },
  { id: "add", label: "Create", icon: Plus, isSpecial: true, path: "/app/upload" },
  { id: "chat", label: "Chat", icon: MessageSquare, path: "/app/messages" },
  { id: "connect", label: "Profile", icon: User, path: "/app/profile" },
];


  return (
    <div className="fixed bottom-0 left-0 w-full z-[999] pointer-events-none flex flex-col items-center">
      
      {/* --- ADAUGAT: BARA DE PROGRES PENTRU VIDEO --- */}
      {progress > 0 && (
        <div className="w-full h-[2px] bg-white/10 mb-1 overflow-hidden">
          <div 
            className="h-full bg-yellow-400 shadow-[0_0_8px_#facc15] transition-all duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* GLASS NAV BAR */}
      <nav className="w-full md:max-w-[420px] h-[65px] md:h-16 bg-black/40 backdrop-blur-2xl border-t md:border border-white/20 md:rounded-[30px] md:mb-6 flex items-center justify-around px-2 shadow-2xl pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          if (item.isSpecial) {
            return (
              <button 
                key={item.id} 
                onClick={() => router.push(item.path)} 
                className="relative -translate-y-2 md:-translate-y-4 group active:scale-90 transition-transform"
              >
                <div className="absolute inset-0 bg-yellow-400 rounded-xl translate-x-[3px]" />
                <div className="absolute inset-0 bg-white rounded-xl -translate-x-[3px]" />
                <div className="relative w-12 h-9 bg-black rounded-xl flex items-center justify-center text-white border border-zinc-800">
                  <Plus size={24} strokeWidth={3} className="text-yellow-400" />
                </div>
              </button>
            );
          }

          return (
            <button key={item.id} onClick={() => router.push(item.path)} className="flex flex-col items-center justify-center flex-1 h-full relative group">
              <div className="relative p-1">
                <Icon size={22} className={`transition-all duration-300 ${isActive ? "text-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "text-white/40 group-hover:text-white/60"}`} />
                
                {item.id === "chat" && hasUnread && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-black shadow-[0_0_10px_rgba(220,38,38,0.8)] z-50" />
                )}

                {isActive && (
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]" />
                )}
              </div>
              <span className={`text-[8px] font-bold uppercase mt-1 tracking-tighter ${isActive ? "text-white opacity-100" : "opacity-0"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="md:hidden h-[env(safe-area-inset-bottom)] bg-black/40 backdrop-blur-2xl w-full border-t border-white/5" />
    </div>
  );
}
