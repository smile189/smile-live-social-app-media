"use client";
import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function NotificationHandler() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const startService = async () => {
      // 1. Cerem voie să trimitem notificări
      if ("Notification" in window && Notification.permission !== "granted") {
        await Notification.requestPermission();
      }

      // 2. Înregistrăm "motorul" sw.js
      const reg = await navigator.serviceWorker.register('/sw.js');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 3. Ascultăm tabela notifications în timp real
      supabase
        .channel('notif-channel')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `receiver_id=eq.${user.id}` },
          (payload) => {
            // Trimitem comanda către Service Worker să arate notificarea
            if (reg.active) {
              reg.active.postMessage({
                type: 'SHOW_NOTIF',
                title: 'Smile Live',
                body: `Ai un nou ${payload.new.type}!`,
                url: '/app/notifications'
              });
            }

            // Punem cifra pe iconița aplicației (dacă e instalată ca PWA)
            if ('setAppBadge' in navigator) {
              navigator.setAppBadge(); 
            }
          }
        )
        .subscribe();
    };

    startService();
  }, []);

  return null;
}
