"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { formatDate } from "@/lib/utils";

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: "sent" | "received";
}

interface ConvoMeta {
  name: string;
  avatar: string | null;
  online: boolean;
}

interface ConvoItem {
  id: string;
  name: string;
  avatar: string | null;
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
    supabase.from("participants").select("conversation_id, user_id").in("conversation_id", convIds).neq("user_id", userId),
    supabase.from("messages").select("conversation_id, body, created_at").in("conversation_id", convIds).order("created_at", { ascending: false }),
  ]);

  const otherUserIds = [...new Set((othersRes.data ?? []).map((r) => r.user_id as string))];
  const { data: profiles } = await supabase
    .from("profiles").select("id, username, full_name, avatar_url").in("id", otherUserIds);

  const profMap: Record<string, { username: string; full_name: string | null; avatar_url: string | null }> = {};
  profiles?.forEach((p) => { profMap[p.id] = p; });

  const otherUserMap: Record<string, string> = {};
  (othersRes.data ?? []).forEach((r) => { otherUserMap[r.conversation_id as string] = r.user_id as string; });

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
        avatar: prof?.avatar_url || null,
        lastMessage: msg?.body ?? "",
        time: msg?.created_at ? formatDate(msg.created_at) : "",
      };
    })
    .sort((a, b) => (b.time > a.time ? 1 : -1));
}


export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [convoMeta, setConvoMeta] = useState<ConvoMeta>({ name: "…", avatar: null, online: false });
  const [sidebarConvos, setSidebarConvos] = useState<ConvoItem[]>([]);
  const [input, setInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const uid = user.id;
      setCurrentUserId(uid);

      // Load other participant's profile
      const { data: otherRows } = await supabase
        .from("participants")
        .select("user_id")
        .eq("conversation_id", id)
        .neq("user_id", uid)
        .limit(1);

      if (otherRows && otherRows[0]) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, username, avatar_url")
          .eq("id", otherRows[0].user_id as string)
          .single();

        if (prof) {
          setConvoMeta({
            name: prof.full_name || prof.username || "User",
            avatar: prof.avatar_url ?? null,
            online: false,
          });
        }
      }

      // Load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_id, body, created_at")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      setMessages(
        (msgs ?? []).map((m) => ({
          id: m.id as string,
          senderId: m.sender_id as string,
          text: m.body as string,
          timestamp: new Date(m.created_at as string).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: m.sender_id === uid ? "sent" : "received",
        }))
      );
      setLoadingMessages(false);

      // Mark received messages as read
      if (msgs && msgs.length > 0) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("conversation_id", id)
          .neq("sender_id", uid)
          .is("read_at", null);
      }

      // Load sidebar conversations
      const convos = await fetchConversations(uid);
      setSidebarConvos(convos);
    }
    load();
  }, [id, router]);

  // Real-time: new messages in this conversation
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel(`chat:${id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${id}`,
      }, (payload) => {
        const m = payload.new as Record<string, unknown>;
        setMessages((prev) => [...prev, {
          id: m.id as string,
          senderId: m.sender_id as string,
          text: m.body as string,
          timestamp: new Date(m.created_at as string).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: m.sender_id === currentUserId ? "sent" : "received",
        }]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, currentUserId]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || !currentUserId) return;
    setInput("");
    await supabase.from("messages").insert({
      conversation_id: id,
      sender_id: currentUserId,
      body: text,
    });
    // Realtime will append it
  }

  return (
    <div className="bg-background text-on-surface h-screen overflow-hidden flex flex-col font-body-md text-body-md antialiased">
      <TopBar hideSearch={true} />
      <Sidebar />

      <div className="flex flex-1 overflow-hidden lg:ml-64">
      <main className="flex-1 flex w-full max-w-container-max mx-auto h-full">
        {/* Desktop conversation list */}
        <section className="hidden lg:flex w-80 border-r border-outline-variant/30 flex-col h-full bg-surface-container-lowest flex-shrink-0">
          <div className="h-16 px-4 flex items-center border-b border-outline-variant/30 bg-surface/80">
            <h2 className="font-headline-md-mobile text-headline-md-mobile text-on-surface">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sidebarConvos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-on-surface-variant p-6">
                <span className="material-symbols-outlined text-[40px] opacity-30">chat_bubble</span>
                <p className="font-body-sm text-body-sm text-center">No conversations yet.</p>
              </div>
            ) : (
              sidebarConvos.map((c) => (
                <Link key={c.id} href={`/messages/${c.id}`}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer border-b border-outline-variant/10 ${c.id === id ? "bg-primary/10" : "hover:bg-surface-container"}`}>
                  <div className="relative shrink-0">
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-username-sm text-username-sm">{c.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-username-sm text-username-sm text-on-surface truncate block">{c.name}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px] shrink-0 ml-1">{c.time}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate text-[12px]">{c.lastMessage}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Chat window */}
        <section className="flex-1 flex flex-col h-full bg-surface-container-lowest relative">
          {/* Mobile chat header */}
          <div className="lg:hidden flex items-center px-4 h-16 gap-3 border-b border-outline-variant/30 bg-surface/90 backdrop-blur-xl flex-shrink-0">
            <button onClick={() => router.push("/messages")} className="p-2 -ml-2 text-on-surface-variant active:scale-95 transition-transform">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="relative">
              {convoMeta.avatar ? (
                <img src={convoMeta.avatar} alt={convoMeta.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-[12px]">{convoMeta.name.charAt(0)}</div>
              )}
              {convoMeta.online && <span className="absolute bottom-0 right-0 w-2 h-2 bg-success-green border border-surface rounded-full" />}
            </div>
            <div>
              <p className="font-username-sm text-username-sm text-on-surface">{convoMeta.name}</p>
              {convoMeta.online && <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">Online</p>}
            </div>
          </div>
          {/* Desktop chat header */}
          <div className="hidden lg:flex h-20 px-6 items-center justify-between border-b border-outline-variant/30 bg-surface/80 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                {convoMeta.avatar ? (
                  <img src={convoMeta.avatar} alt={convoMeta.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold">{convoMeta.name.charAt(0)}</div>
                )}
                {convoMeta.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success-green border border-surface rounded-full" />}
              </div>
              <div>
                <h2 className="font-username-sm text-username-sm text-on-surface">{convoMeta.name}</h2>
                {convoMeta.online && <p className="font-body-sm text-body-sm text-on-surface-variant text-[12px]">Online</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-primary hover:bg-primary-fixed rounded-full transition-colors"><span className="material-symbols-outlined">call</span></button>
              <button className="p-2 text-primary hover:bg-primary-fixed rounded-full transition-colors"><span className="material-symbols-outlined">videocam</span></button>
              <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4">
            {loadingMessages ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "self-start" : "self-end flex-row-reverse"} gap-2 max-w-[60%] animate-pulse`}>
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex-shrink-0" />
                  <div className={`h-10 rounded-2xl bg-surface-container-high ${i % 2 === 0 ? "w-48" : "w-36"}`} />
                </div>
              ))
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant gap-2">
                <span className="material-symbols-outlined text-[48px] opacity-30">chat_bubble</span>
                <p className="font-body-sm text-body-sm">No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isFirst = i === 0 || messages[i - 1].type !== msg.type;
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.type === "sent" ? "self-end flex-row-reverse" : "self-start"} max-w-[85%] sm:max-w-[70%]`}>
                    {msg.type === "received" && isFirst && convoMeta.avatar && (
                      <img src={convoMeta.avatar} alt={convoMeta.name} className="w-8 h-8 rounded-full object-cover hidden sm:block flex-shrink-0" />
                    )}
                    {msg.type === "received" && (!isFirst || !convoMeta.avatar) && <div className="w-8 hidden sm:block flex-shrink-0" />}
                    <div className="flex flex-col gap-1">
                      <div className={`px-4 py-3 rounded-2xl font-body-md text-body-md shadow-sm ${msg.type === "sent" ? "bg-primary text-on-primary rounded-br-sm" : "bg-surface-container text-on-surface rounded-bl-sm"}`}>
                        {msg.text}
                      </div>
                      <span className={`font-body-sm text-body-sm text-on-surface-variant text-[11px] ${msg.type === "sent" ? "text-right" : ""}`}>{msg.timestamp}</span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-surface/80 backdrop-blur-xl border-t border-outline-variant/30 mb-16 lg:mb-0 pb-safe">
            <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/50 rounded-full px-2 py-1 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full shrink-0">
                <span className="material-symbols-outlined">add_circle</span>
              </button>
              <input
                type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message…"
                className="flex-1 bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant py-2 px-2 outline-none"
              />
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full shrink-0">
                <span className="material-symbols-outlined">sentiment_satisfied</span>
              </button>
              <button onClick={sendMessage}
                className="p-2 bg-primary text-on-primary hover:bg-primary/90 transition-colors rounded-full shrink-0 h-10 w-10 flex items-center justify-center shadow-md active:scale-95 ml-1">
                <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
              </button>
            </div>
          </div>
        </section>
      </main>
      </div>

      <BottomNav />
    </div>
  );
}
