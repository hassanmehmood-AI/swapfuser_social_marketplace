"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { MockPost } from "@/lib/mockData";

interface PostCardProps {
  post: MockPost;
  index?: number;
  initialLiked?: boolean;
  initialSaved?: boolean;
}

const CONDITION_STYLES: Record<string, string> = {
  "New": "bg-success-green/10 text-success-green",
  "Like New": "bg-sky-blue/30 text-primary",
  "Good": "bg-surface-container-high text-on-surface-variant",
  "Fair": "bg-tertiary-container/20 text-tertiary",
};

function AuthorAvatar({ name, avatar, size = "md" }: { name: string; avatar: string; size?: "sm" | "md" }) {
  const cls = size === "sm"
    ? "w-8 h-8 text-[12px]"
    : "w-10 h-10 text-[14px]";

  if (avatar) {
    return <img alt={name} className={`${cls} rounded-full object-cover`} src={avatar} />;
  }
  return (
    <div className={`${cls} rounded-full bg-primary-container/40 text-primary flex items-center justify-center font-bold flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function PostCard({ post, index = 0, initialLiked = false, initialSaved = false }: PostCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saved, setSaved] = useState(initialSaved);
  const [imgIndex, setImgIndex] = useState(0);
  const [startingConvo, setStartingConvo] = useState(false);
  const touchStartX = useRef(0);

  const images = post.images;
  const hasMany = images.length > 1;

  async function toggleLike() {
    if (!user) { router.push("/login"); return; }
    const next = !liked;
    setLiked(next);
    setLikeCount(c => next ? c + 1 : c - 1);
    const { error } = next
      ? await supabase.from("likes").insert({ user_id: user.id, post_id: post.id })
      : await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", post.id);
    if (error) {
      setLiked(!next);
      setLikeCount(c => next ? c - 1 : c + 1);
      toast("Something went wrong, try again.", { duration: 2000 });
    }
  }

  async function toggleSave() {
    if (!user) { router.push("/login"); return; }
    const next = !saved;
    setSaved(next);
    const { error } = next
      ? await supabase.from("saves").insert({ user_id: user.id, post_id: post.id })
      : await supabase.from("saves").delete().eq("user_id", user.id).eq("post_id", post.id);
    if (error) {
      setSaved(!next);
      toast("Something went wrong, try again.", { duration: 2000 });
    } else {
      toast(next ? "Saved" : "Removed from saved", { duration: 1500 });
    }
  }

  function prevImg(e: React.MouseEvent) {
    e.stopPropagation();
    setImgIndex(i => (i - 1 + images.length) % images.length);
  }
  function nextImg(e: React.MouseEvent) {
    e.stopPropagation();
    setImgIndex(i => (i + 1) % images.length);
  }
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) setImgIndex(i => (i + 1) % images.length);
    else if (diff < -50) setImgIndex(i => (i - 1 + images.length) % images.length);
  }

  async function handleMessage(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push("/login"); return; }
    if (user.id === post.author.id) { toast("You cannot message yourself."); return; }

    setStartingConvo(true);
    try {
      let convId: string | null = null;
      const { data: myRows } = await supabase.from("participants").select("conversation_id").eq("user_id", user.id);
      
      if (myRows && myRows.length > 0) {
        const myConvIds = myRows.map(r => r.conversation_id as string);
        const { data: shared } = await supabase.from("participants").select("conversation_id").eq("user_id", post.author.id).in("conversation_id", myConvIds).limit(1);
        if (shared && shared.length > 0) convId = shared[0].conversation_id as string;
      }

      if (!convId) {
        const { data: newConvo, error: convoErr } = await supabase.from("conversations").insert({}).select("id").single();
        if (convoErr || !newConvo) { toast("Couldn't create conversation."); return; }
        convId = newConvo.id as string;

        const { error: partErr } = await supabase.from("participants").insert([
          { conversation_id: convId, user_id: user.id },
          { conversation_id: convId, user_id: post.author.id },
        ]);
        if (partErr) { toast("Couldn't add participants."); return; }
      }

      router.push(`/messages/${convId}`);
    } catch {
      toast("Something went wrong.");
    } finally {
      setStartingConvo(false);
    }
  }

  const delay = `${index * 80}ms`;

  return (
    <>
      {/* ── Desktop card ──────────────────────────────────────────────── */}
      <article
        className="hidden lg:block p-4 border-b border-outline-variant/30 bg-surface hover:bg-surface-container-lowest transition-colors cursor-pointer group animate-fade-in-up"
        style={{ animationDelay: delay, opacity: 0 }}
        aria-label={`Post by ${post.author.name}`}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <Link href={`/profile/${post.author.username}`} className="flex-shrink-0">
            <AuthorAvatar name={post.author.name} avatar={post.author.avatar} />
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Link href={`/profile/${post.author.username}`}>
                <h3 className="font-username-sm text-username-sm text-on-surface hover:text-primary transition-colors">{post.author.name}</h3>
              </Link>
              {post.author.verified && (
                <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-label="Verified">verified</span>
              )}
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {post.time}
              </span>
              {post.condition && (
                <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full ${CONDITION_STYLES[post.condition] ?? ""}`}>
                  {post.condition}
                </span>
              )}
            </div>

            {/* Caption */}
            <p className="font-body-md text-body-md text-on-surface mb-3">{post.caption}</p>

            {/* Type badge */}
            <div className="mb-3 flex gap-2 flex-wrap">
              {post.type === "sell" && post.price && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-caps text-label-caps bg-primary/10 text-primary border border-primary/20">
                  <span className="material-symbols-outlined text-[14px]">sell</span>
                  {post.price}
                </span>
              )}
              {post.type === "swap" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-caps text-label-caps bg-secondary/10 text-secondary border border-secondary/20">
                  <span className="material-symbols-outlined text-[14px]">sync_alt</span>
                  {post.lookingFor ? `Looking for: ${post.lookingFor}` : "Open to swap"}
                </span>
              )}
            </div>

            {/* Image carousel */}
            {images.length > 0 && (
              <div
                className="rounded-xl overflow-hidden border border-outline-variant/20 mb-3 max-h-[320px] bg-surface-container relative group/img"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <img
                  key={imgIndex}
                  alt="Post media"
                  className="w-full h-full object-cover animate-fade-in"
                  src={images[imgIndex]}
                  style={{ maxHeight: "320px" }}
                />
                {hasMany && (
                  <>
                    <button onClick={prevImg} aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity focus-visible:opacity-100 hover:bg-black/70">
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <button onClick={nextImg} aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity focus-visible:opacity-100 hover:bg-black/70">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button key={i} onClick={e => { e.stopPropagation(); setImgIndex(i); }} aria-label={`Image ${i + 1}`}
                          className={`rounded-full transition-all ${i === imgIndex ? "bg-white w-3 h-1.5" : "bg-white/60 w-1.5 h-1.5"}`} />
                      ))}
                    </div>
                    <span className="absolute top-2 right-2 bg-black/50 text-white font-label-caps text-label-caps px-2 py-0.5 rounded-full text-[10px]">
                      {imgIndex + 1}/{images.length}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Interaction bar */}
            <div className="flex items-center gap-4 text-on-surface-variant">
              <button
                onClick={toggleLike} aria-label={liked ? "Unlike" : "Like"} aria-pressed={liked}
                className={`flex items-center gap-1.5 transition-colors group/btn rounded-full focus-visible:ring-2 focus-visible:ring-success-green ${liked ? "text-success-green" : "hover:text-success-green"}`}
              >
                <span className="p-1.5 rounded-full group-hover/btn:bg-success-green/10 transition-colors flex">
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover/btn:scale-110" style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
                </span>
                <span className="font-body-sm text-body-sm">{likeCount}</span>
              </button>

              <button
                onClick={toggleSave} aria-label={saved ? "Remove bookmark" : "Save"} aria-pressed={saved}
                className={`flex items-center gap-1.5 transition-colors group/btn rounded-full focus-visible:ring-2 focus-visible:ring-primary ${saved ? "text-primary" : "hover:text-primary"}`}
              >
                <span className="p-1.5 rounded-full group-hover/btn:bg-primary/10 transition-colors flex">
                  <span className="material-symbols-outlined text-[20px]" style={saved ? { fontVariationSettings: "'FILL' 1" } : undefined}>bookmark</span>
                </span>
              </button>

              <button
                onClick={handleMessage} disabled={startingConvo} aria-label="Message"
                className="flex items-center gap-1.5 transition-colors group/btn rounded-full focus-visible:ring-2 focus-visible:ring-primary text-on-surface-variant hover:text-primary disabled:opacity-60 ml-auto"
              >
                <span className="p-1.5 rounded-full group-hover/btn:bg-primary/10 transition-colors flex">
                  {startingConvo ? (
                    <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                  )}
                </span>
                <span className="font-body-sm text-body-sm">Message</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* ── Mobile card ───────────────────────────────────────────────── */}
      <article
        className="lg:hidden bg-surface-container-lowest border-b border-outline-variant/20 animate-fade-in-up"
        style={{ animationDelay: delay, opacity: 0 }}
        aria-label={`Post by ${post.author.name}`}
      >
        {/* Header */}
        <div className="flex items-center px-4 py-3">
          <Link href={`/profile/${post.author.username}`} className="mr-3 flex-shrink-0">
            <AuthorAvatar name={post.author.name} avatar={post.author.avatar} size="sm" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Link href={`/profile/${post.author.username}`}>
                <span className="font-username-sm text-username-sm text-on-surface truncate hover:text-primary transition-colors">{post.author.name}</span>
              </Link>
              {post.author.verified && (
                <span className="material-symbols-outlined text-primary text-[14px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              )}
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {post.time} · {post.type === "swap" ? `Swap${post.lookingFor ? ` for ${post.lookingFor}` : ""}` : (post.price ?? "For Sale")}
            </span>
          </div>
          <button aria-label="More options" className="ml-2 p-2 rounded-full hover:bg-surface-variant/50 text-on-surface-variant flex-shrink-0">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </div>

        {/* Caption + condition */}
        <div className="px-4 pb-2">
          <p className="font-body-md text-body-md text-on-surface">{post.caption}</p>
        </div>
        {post.condition && (
          <div className="px-4 pb-2">
            <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full ${CONDITION_STYLES[post.condition] ?? ""}`}>
              {post.condition}
            </span>
          </div>
        )}

        {/* Media */}
        {images.length > 0 && (
          <div className="w-full relative aspect-[4/3] bg-surface-variant overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <img key={imgIndex} alt="Post media" className="w-full h-full object-cover animate-fade-in" src={images[imgIndex]} />
            {hasMany && (
              <>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <span key={i} className={`block rounded-full transition-all ${i === imgIndex ? "w-3 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60"}`} />
                  ))}
                </div>
                <span className="absolute top-2 right-2 bg-black/50 text-white font-label-caps text-label-caps px-2 py-0.5 rounded-full text-[10px]">
                  {imgIndex + 1}/{images.length}
                </span>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={toggleLike} aria-label={liked ? "Unlike" : "Like"} aria-pressed={liked}
            className={`flex items-center gap-1 transition-colors group ${liked ? "text-error" : "text-on-surface-variant hover:text-error"}`}>
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
            <span className="font-body-sm text-body-sm">{likeCount}</span>
          </button>

          <button onClick={toggleSave} aria-label={saved ? "Remove bookmark" : "Save"} aria-pressed={saved}
            className={`p-1.5 transition-colors ${saved ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}>
            <span className="material-symbols-outlined" style={saved ? { fontVariationSettings: "'FILL' 1" } : undefined}>bookmark</span>
          </button>

          <button onClick={handleMessage} disabled={startingConvo} aria-label="Message"
            className="flex items-center gap-1 p-1.5 transition-colors text-on-surface-variant hover:text-primary disabled:opacity-60 ml-auto">
            {startingConvo ? (
              <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
            )}
          </button>
        </div>
      </article>
    </>
  );
}

