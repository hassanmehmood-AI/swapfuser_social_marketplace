"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { formatDate } from "@/lib/utils";

interface ConvoItem {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  online: boolean;
  lastMessage: string;
  time: string;
}

async function fetchConversations(userId: string): Promise<ConvoItem[]> {
  const { data: myRows } = await supabase
    .from("participants")
    .select("conversation_id")
    .eq("user_id", userId);

  if (!myRows || myRows.length === 0) return [];

  const convIds = myRows.map((r) => r.conversation_id as string);

  const [othersRes, msgsRes] = await Promise.all([
    supabase
      .from("participants")
      .select("conversation_id, user_id")
      .in("conversation_id", convIds)
      .neq("user_id", userId),
    supabase
      .from("messages")
      .select("conversation_id, body, created_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false }),
  ]);

  const otherUserIds = [...new Set((othersRes.data ?? []).map((r) => r.user_id as string))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", otherUserIds);

  const profMap: Record<string, { username: string; full_name: string | null; avatar_url: string | null }> = {};
  profiles?.forEach((p) => { profMap[p.id] = p; });

  const otherUserMap: Record<string, string> = {};
  (othersRes.data ?? []).forEach((r) => {
    otherUserMap[r.conversation_id as string] = r.user_id as string;
  });

  const latestMsgMap: Record<string, { body: string; created_at: string }> = {};
  (msgsRes.data ?? []).forEach((m) => {
    const cid = m.conversation_id as string;
    if (!latestMsgMap[cid]) latestMsgMap[cid] = { body: m.body as string, created_at: m.created_at as string };
  });

  return convIds
    .map((convId) => {
      const otherId = otherUserMap[convId];
      const prof = otherId ? profMap[otherId] : null;
      const msg = latestMsgMap[convId];
      return {
        id: convId,
        name: prof?.full_name || prof?.username || "Unknown",
        username: prof?.username || "",
        avatar: prof?.avatar_url || null,
        online: false,
        lastMessage: msg?.body ?? "",
        time: msg?.created_at ? formatDate(msg.created_at) : "",
      };
    })
    .sort((a, b) => (b.time > a.time ? 1 : -1));
}


export default function MessagesPage() {
  const [convos, setConvos] = useState<ConvoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      const items = await fetchConversations(user.id);
      setConvos(items);
      setLoading(false);
    }
    init();
  }, []);

  // Re-fetch conversation list whenever a new message arrives
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("messages-list-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async () => {
        const items = await fetchConversations(userId);
        setConvos(items);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return (
    <div className="bg-background text-on-surface h-screen overflow-hidden flex flex-col font-body-md text-body-md antialiased">
      <TopBar hideSearch={true} />
      <Sidebar />

      <div className="flex flex-1 overflow-hidden lg:ml-64">
      <main className="flex-1 flex w-full max-w-container-max mx-auto h-full">
        <section className="w-full lg:w-80 lg:border-r border-outline-variant/30 flex flex-col h-full bg-surface-container-lowest">
          <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/30 bg-surface/80 backdrop-blur-xl sticky top-0 z-10">
            <h2 className="font-headline-md-mobile text-headline-md-mobile text-on-surface">Messages</h2>
            <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95">
              <span className="material-symbols-outlined text-[20px]">edit_square</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse border-b border-outline-variant/10">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-surface-container-high rounded w-2/3" />
                    <div className="h-2.5 bg-surface-container-high rounded w-full" />
                  </div>
                </div>
              ))
            ) : convos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-on-surface-variant p-8">
                <span className="material-symbols-outlined text-[48px] opacity-30">chat_bubble</span>
                <p className="font-body-sm text-body-sm text-center">
                  {!userId
                    ? "Sign in to see your messages."
                    : "No conversations yet. Message a seller from their profile!"}
                </p>
                {!userId && (
                  <Link href="/login" className="mt-2 bg-primary text-on-primary font-username-sm text-username-sm px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity">
                    Sign In
                  </Link>
                )}
              </div>
            ) : (
              convos.map((c) => (
                <Link key={c.id} href={`/messages/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors cursor-pointer border-b border-outline-variant/10">
                  <div className="relative shrink-0">
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-username-sm text-username-sm">
                        {c.name.charAt(0)}
                      </div>
                    )}
                    {c.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-success-green border-2 border-surface-container-lowest rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-username-sm text-username-sm text-on-surface truncate">{c.name}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px] shrink-0 ml-2">{c.time}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate text-[12px]">{c.lastMessage}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="hidden lg:flex flex-1 flex-col items-center justify-center bg-surface gap-4 text-center p-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[40px]">chat_bubble</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">Your Messages</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">Select a conversation from the list to start chatting.</p>
        </section>
      </main>
      </div>

      <BottomNav />
    </div>
  );
}

