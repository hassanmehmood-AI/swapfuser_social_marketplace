"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const UnreadCountContext = createContext(0);

export function UnreadCountProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const myConvIds = useRef<Set<string>>(new Set());

  // Clear badge when the user opens messages
  useEffect(() => {
    if (pathname === "/messages" || pathname?.startsWith("/messages/")) {
      setCount(0);
      localStorage.setItem("messages_last_checked", new Date().toISOString());
    }
  }, [pathname]);

  useEffect(() => {
    if (!user) { setCount(0); return; }

    const userId = user.id;

    async function fetchUnread() {
      let lastChecked = localStorage.getItem("messages_last_checked");
      if (!lastChecked) {
        lastChecked = new Date().toISOString();
        localStorage.setItem("messages_last_checked", lastChecked);
      }

      const { data: participantRows } = await supabase
        .from("participants")
        .select("conversation_id")
        .eq("user_id", userId);

      if (!participantRows || participantRows.length === 0) { setCount(0); return; }

      myConvIds.current = new Set(participantRows.map(r => r.conversation_id as string));

      const { count: unread } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", [...myConvIds.current])
        .neq("sender_id", userId)
        .gt("created_at", lastChecked);

      setCount(unread ?? 0);
    }

    fetchUnread();

    // Single realtime channel — runs once per session, not per component
    const channel = supabase
      .channel(`unread-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as { sender_id: string; conversation_id: string };
        if (msg.sender_id !== userId && myConvIds.current.has(msg.conversation_id)) {
          setCount(c => c + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <UnreadCountContext.Provider value={count}>
      {children}
    </UnreadCountContext.Provider>
  );
}

export function useUnreadCount() {
  return useContext(UnreadCountContext);
}
