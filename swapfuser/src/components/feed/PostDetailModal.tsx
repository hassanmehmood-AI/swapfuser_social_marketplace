"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";

interface PostDetail {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  images: string[];
  price: number | null;
  swap_for: string | null;
  condition: "New" | "Like New" | "Good" | "Fair" | null;
  location: string | null;
  type: "sell" | "swap";
  created_at: string;
}

interface AuthorInfo {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

const CONDITION_STYLES: Record<string, string> = {
  "New": "bg-success-green/10 text-success-green",
  "Like New": "bg-sky-blue/30 text-primary",
  "Good": "bg-surface-container-high text-on-surface-variant",
  "Fair": "bg-tertiary-container/20 text-tertiary",
};

export function PostDetailModal({ postId, onClose }: { postId: string; onClose: () => void }) {
  const { user } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [author, setAuthor] = useState<AuthorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [startingConvo, setStartingConvo] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setNotFound(false);
      const { data: p, error } = await supabase.from("posts").select("*").eq("id", postId).single();
      if (cancelled) return;
      if (error || !p) { setNotFound(true); setLoading(false); return; }
      setPost(p as PostDetail);
      setImgIndex(0);

      const [{ data: prof }, { data: likesData }, likedRes, savedRes] = await Promise.all([
        supabase.from("profiles").select("username, full_name, avatar_url").eq("id", p.user_id).single(),
        supabase.from("likes").select("id").eq("post_id", postId),
        user
          ? supabase.from("likes").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle()
          : Promise.resolve({ data: null }),
        user
          ? supabase.from("saves").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      if (cancelled) return;
      setAuthor(prof ?? null);
      setLikeCount(likesData?.length ?? 0);
      setLiked(!!likedRes.data);
      setSaved(!!savedRes.data);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [postId, user]);

  async function toggleLike() {
    if (!user) { router.push("/login"); return; }
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => (next ? c + 1 : c - 1));
    const { error } = next
      ? await supabase.from("likes").insert({ user_id: user.id, post_id: postId })
      : await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", postId);
    if (error) {
      setLiked(!next);
      setLikeCount((c) => (next ? c - 1 : c + 1));
      toast("Something went wrong, try again.");
    }
  }

  async function toggleSave() {
    if (!user) { router.push("/login"); return; }
    const next = !saved;
    setSaved(next);
    const { error } = next
      ? await supabase.from("saves").insert({ user_id: user.id, post_id: postId })
      : await supabase.from("saves").delete().eq("user_id", user.id).eq("post_id", postId);
    if (error) {
      setSaved(!next);
      toast("Something went wrong, try again.");
    } else {
      toast(next ? "Saved" : "Removed from saved", { duration: 1500 });
    }
  }

  async function handleMessage() {
    if (!user) { router.push("/login"); return; }
    if (!post) return;
    if (user.id === post.user_id) { toast("You cannot message yourself."); return; }

    setStartingConvo(true);
    try {
      let convId: string | null = null;
      const { data: myRows } = await supabase.from("participants").select("conversation_id").eq("user_id", user.id);

      if (myRows && myRows.length > 0) {
        const myConvIds = myRows.map((r) => r.conversation_id as string);
        const { data: shared } = await supabase
          .from("participants")
          .select("conversation_id")
          .eq("user_id", post.user_id)
          .in("conversation_id", myConvIds)
          .limit(1);
        if (shared && shared.length > 0) convId = shared[0].conversation_id as string;
      }

      if (!convId) {
        const { data: newConvo, error: convoErr } = await supabase.from("conversations").insert({}).select("id").single();
        if (convoErr || !newConvo) { toast("Couldn't create conversation."); return; }
        convId = newConvo.id as string;

        const { error: partErr } = await supabase.from("participants").insert([
          { conversation_id: convId, user_id: user.id },
          { conversation_id: convId, user_id: post.user_id },
        ]);
        if (partErr) { toast("Couldn't add participants."); return; }
      }

      onClose();
      router.push(`/messages/${convId}`);
    } catch {
      toast("Something went wrong.");
    } finally {
      setStartingConvo(false);
    }
  }

  const images = post?.images ?? [];
  const hasMany = images.length > 1;

  function prevImg(e: React.MouseEvent) {
    e.stopPropagation();
    setImgIndex((i) => (i - 1 + images.length) % images.length);
  }
  function nextImg(e: React.MouseEvent) {
    e.stopPropagation();
    setImgIndex((i) => (i + 1) % images.length);
  }

  const displayName = author?.full_name || author?.username || "Unknown user";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-ink-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] bg-surface-container-lowest sm:rounded-2xl shadow-xl border border-outline-variant/20 overflow-y-auto animate-scale-in">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {loading ? (
          <div className="animate-pulse flex flex-col gap-4 p-6">
            <div className="w-full aspect-[4/3] rounded-2xl bg-surface-container-high" />
            <div className="h-6 w-2/3 rounded bg-surface-container-high" />
            <div className="h-4 w-1/3 rounded bg-surface-container-high" />
          </div>
        ) : notFound || !post ? (
          <div className="text-center py-20 px-6">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30">search_off</span>
            <h2 className="font-headline-md-mobile text-headline-md-mobile text-on-surface mt-4">Post not found</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">This listing may have been removed.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Large image */}
            {images.length > 0 && (
              <div className="w-full relative bg-surface-container">
                <img
                  key={imgIndex}
                  alt={post.title}
                  src={images[imgIndex]}
                  className="w-full max-h-[60vh] object-cover animate-fade-in"
                />
                {hasMany && (
                  <>
                    <button onClick={prevImg} aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70">
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <button onClick={nextImg} aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70">
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button key={i} onClick={(e) => { e.stopPropagation(); setImgIndex(i); }} aria-label={`Image ${i + 1}`}
                          className={`rounded-full transition-all ${i === imgIndex ? "bg-white w-3 h-1.5" : "bg-white/60 w-1.5 h-1.5"}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="p-4 sm:p-6 flex flex-col gap-4">
              {/* Author */}
              <Link href={`/profile/${author?.username ?? ""}`} onClick={onClose} className="flex items-center gap-3 group w-fit">
                {author?.avatar_url ? (
                  <img alt={displayName} src={author.avatar_url} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-container/40 text-primary flex items-center justify-center font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-username-sm text-username-sm text-on-surface group-hover:text-primary transition-colors">{displayName}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{formatDate(post.created_at)}</p>
                </div>
              </Link>

              {/* Title + badges */}
              <div>
                <h1 className="font-headline-md text-headline-md text-on-surface mb-2">{post.title}</h1>
                <div className="flex gap-2 flex-wrap">
                  {post.type === "sell" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-caps text-label-caps bg-primary/10 text-primary border border-primary/20">
                      <span className="material-symbols-outlined text-[14px]">sell</span>
                      {post.price ? `$${post.price}` : "For Sale"}
                    </span>
                  )}
                  {post.type === "swap" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-caps text-label-caps bg-secondary/10 text-secondary border border-secondary/20">
                      <span className="material-symbols-outlined text-[14px]">sync_alt</span>
                      {post.swap_for ? `Looking for: ${post.swap_for}` : "Open to swap"}
                    </span>
                  )}
                  {post.condition && (
                    <span className={`font-label-caps text-label-caps px-3 py-1 rounded-full ${CONDITION_STYLES[post.condition] ?? ""}`}>
                      {post.condition}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {post.description && (
                <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap leading-relaxed">{post.description}</p>
              )}

              {/* Location */}
              {post.location && (
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span className="font-body-sm text-body-sm">{post.location}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/20">
                <button
                  onClick={toggleLike} aria-label={liked ? "Unlike" : "Like"} aria-pressed={liked}
                  className={`flex items-center gap-1.5 transition-colors ${liked ? "text-success-green" : "text-on-surface-variant hover:text-success-green"}`}
                >
                  <span className="material-symbols-outlined text-[22px]" style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
                  <span className="font-body-sm text-body-sm">{likeCount}</span>
                </button>

                <button
                  onClick={toggleSave} aria-label={saved ? "Remove bookmark" : "Save"} aria-pressed={saved}
                  className={`flex items-center gap-1.5 transition-colors ${saved ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
                >
                  <span className="material-symbols-outlined text-[22px]" style={saved ? { fontVariationSettings: "'FILL' 1" } : undefined}>bookmark</span>
                </button>

                <button
                  onClick={handleMessage} disabled={startingConvo} aria-label="Message"
                  className="flex items-center gap-1.5 transition-colors text-on-surface-variant hover:text-primary disabled:opacity-60 ml-auto"
                >
                  {startingConvo ? (
                    <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
                  )}
                  <span className="font-body-sm text-body-sm">Message</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
