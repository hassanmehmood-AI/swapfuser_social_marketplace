"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import PostCard from "@/components/feed/PostCard";
import { PostSkeleton } from "@/components/ui/Skeleton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { MockPost } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";

type Filter = "all" | "swap" | "sell";

interface FeedPost extends MockPost {
  isLiked: boolean;
  isSaved: boolean;
}

function buildPost(
  raw: Record<string, unknown>,
  profileMap: Record<string, { username: string; full_name: string | null; avatar_url: string | null }>,
  likeCountMap: Record<string, number>,
  likedSet: Set<string>,
  savedSet: Set<string>,
): FeedPost {
  const prof = profileMap[raw.user_id as string];
  return {
    id: raw.id as string,
    author: {
      id: raw.user_id as string,
      name: prof?.full_name || prof?.username || "Unknown User",
      username: prof?.username || "unknown",
      avatar: prof?.avatar_url || "",
      verified: false,
      online: false,
    },
    caption: raw.description
      ? `${raw.title} — ${raw.description}`
      : (raw.title as string),
    images: (raw.images as string[]) ?? [],
    type: raw.type as "sell" | "swap",
    price: raw.price ? `$${raw.price}` : undefined,
    lookingFor: (raw.swap_for as string) ?? undefined,
    time: raw.created_at ? formatDate(raw.created_at as string) : "Just now",
    likes: likeCountMap[raw.id as string] ?? 0,
    comments: 0,
    swapCount: 0,
    condition: raw.condition as MockPost["condition"],
    isLiked: likedSet.has(raw.id as string),
    isSaved: savedSet.has(raw.id as string),
  };
}

function FeedPageInner() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQ = searchParams.get("q") ?? "";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [allPosts, setAllPosts] = useState<FeedPost[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshAt, setRefreshAt] = useState(0);

  // Re-fetch when the user navigates back to this tab (e.g. after creating a post)
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") setRefreshAt(Date.now());
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      setLoading(true);
      setFetchError(null);

      // Fetch posts — no join, avoids foreign-key dependency
      const { data: postsData, error } = await supabase
        .from("posts")
        .select("id, user_id, type, title, description, images, price, swap_for, condition, location, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (cancelled) return;

      if (error) {
        setFetchError(error.message);
        setLoading(false);
        return;
      }

      if (!postsData || postsData.length === 0) {
        setAllPosts([]);
        setLoading(false);
        return;
      }

      const postIds = postsData.map(p => p.id);
      const userIds = [...new Set(postsData.map(p => p.user_id))];

      // Fetch profiles, like counts, and user interactions in parallel
      const [profilesRes, likesRes, userLikesRes, userSavesRes] = await Promise.all([
        supabase.from("profiles").select("id, username, full_name, avatar_url").in("id", userIds),
        supabase.from("likes").select("post_id").in("post_id", postIds),
        user
          ? supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds)
          : Promise.resolve({ data: [] as { post_id: string }[] }),
        user
          ? supabase.from("saves").select("post_id").eq("user_id", user.id).in("post_id", postIds)
          : Promise.resolve({ data: [] as { post_id: string }[] }),
      ]);

      if (cancelled) return;

      const profileMap: Record<string, { username: string; full_name: string | null; avatar_url: string | null }> = {};
      profilesRes.data?.forEach(p => { profileMap[p.id] = p; });

      const likeCountMap: Record<string, number> = {};
      likesRes.data?.forEach(l => { likeCountMap[l.post_id] = (likeCountMap[l.post_id] ?? 0) + 1; });

      const likedSet = new Set<string>(userLikesRes.data?.map(l => l.post_id) ?? []);
      const savedSet = new Set<string>(userSavesRes.data?.map(s => s.post_id) ?? []);

      setAllPosts(
        postsData.map(raw =>
          buildPost(raw as Record<string, unknown>, profileMap, likeCountMap, likedSet, savedSet)
        )
      );
      setLoading(false);
    }

    fetchPosts();
    return () => { cancelled = true; };
  }, [user, refreshAt]); // Re-fetch on login/logout and on tab focus

  // Real-time: prepend new posts without a full reload
  useEffect(() => {
    const channel = supabase
      .channel("feed-new-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        async (payload) => {
          const raw = payload.new as Record<string, unknown>;
          if (!raw.is_active) return;

          const { data: prof } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", raw.user_id as string)
            .single();

          const profMap: Record<string, { username: string; full_name: string | null; avatar_url: string | null }> = {};
          if (prof) profMap[prof.id] = prof;

          setAllPosts(prev => [
            buildPost(raw, profMap, {}, new Set(), new Set()),
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const q = searchQ.toLowerCase();
  const searched = q ? allPosts.filter(p => p.caption.toLowerCase().includes(q)) : allPosts;
  const filtered = filter === "all" ? searched : searched.filter(p => p.type === filter);
  const swapCount = allPosts.filter(p => p.type === "swap").length;
  const sellCount = allPosts.filter(p => p.type === "sell").length;

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md text-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      <TopBar />

      <div className="w-full max-w-container-max mx-auto flex justify-center min-h-screen">
        <Sidebar />

        <main className="w-full lg:ml-64 flex-1 max-w-feed-width pb-24 md:pb-8">
          {/* Mobile slogan */}
          <div className="lg:hidden p-4 border-b border-outline-variant/30 bg-surface-container-lowest">
            <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary mb-2">Buy, Sell, Swap Socially.</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Discover items and connect with your local community.</p>
          </div>

          {/* Composer */}
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0 overflow-hidden">
              {profile?.avatar_url ? (
                <img alt="Your avatar" className="w-full h-full object-cover" src={profile.avatar_url} />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-username-sm text-username-sm text-on-surface-variant bg-primary-container/30">
                  {(profile?.full_name ?? profile?.username ?? user?.email ?? "?").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center h-10">
                <div className="flex gap-2 text-primary">
                  <Link href="/create" className="p-2 rounded-full hover:bg-primary-container/20 transition-colors flex items-center gap-1 font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[20px]">image</span>
                    <span className="hidden sm:block">Photo</span>
                  </Link>
                </div>
                <Link href="/create" className="bg-primary text-on-primary font-username-sm text-username-sm px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity active:scale-95">
                  Post
                </Link>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-outline-variant/30 bg-surface-container-lowest sticky top-16 z-10">
            {([
              { id: "all" as Filter,  label: "All",      count: allPosts.length },
              { id: "swap" as Filter, label: "Swaps",    count: swapCount },
            ]).map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                aria-pressed={filter === id}
                className={`flex-1 py-3 font-username-sm text-username-sm transition-colors relative flex items-center justify-center gap-1.5 ${filter === id ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                {label}
                {!loading && count > 0 && (
                  <></>
                )}
                {filter === id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>

          {/* Search results banner */}
          {searchQ && !loading && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30 bg-primary/5">
              <p className="font-body-sm text-body-sm text-on-surface">
                <span className="font-semibold">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""} for &quot;<span className="text-primary">{searchQ}</span>&quot;
              </p>
              <button onClick={() => router.push("/feed")} className="font-body-sm text-body-sm text-primary hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">close</span>
                Clear
              </button>
            </div>
          )}

          {/* Posts */}
          <div className="flex flex-col">
            {loading ? (
              <><PostSkeleton /><PostSkeleton /><PostSkeleton /></>
            ) : fetchError ? (
              <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant animate-fade-in gap-3">
                <span className="material-symbols-outlined text-[56px] opacity-30">wifi_off</span>
                <p className="font-headline-md-mobile text-headline-md-mobile text-on-surface">Couldn&apos;t load posts</p>
                <p className="font-body-sm text-body-sm text-center max-w-xs text-on-surface-variant">{fetchError}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant animate-fade-in gap-3">
                <span className="material-symbols-outlined text-[56px] opacity-30">
                  {searchQ ? "search_off" : filter === "swap" ? "sync_alt" : filter === "sell" ? "sell" : "dynamic_feed"}
                </span>
                <p className="font-headline-md-mobile text-headline-md-mobile text-on-surface">
                  {searchQ ? `No results for "${searchQ}"` : filter === "all" ? "No posts yet" : filter === "swap" ? "No swap posts yet" : "No items for sale yet"}
                </p>
                <p className="font-body-sm text-body-sm text-center max-w-xs">
                  {searchQ
                    ? "Try a different search term."
                    : filter === "all"
                    ? "Be the first to post something in the community!"
                    : filter === "swap"
                    ? "No one has listed a swap yet. Create the first one!"
                    : "No one is selling yet. List your first item!"}
                </p>
                <Link href="/create" className="mt-2 bg-primary text-on-primary font-username-sm text-username-sm px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity active:scale-95 shadow-sm">
                  Create a Post
                </Link>
              </div>
            ) : (
              filtered.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={i}
                  initialLiked={post.isLiked}
                  initialSaved={post.isSaved}
                />
              ))
            )}
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="hidden xl:block w-80 ml-6 pl-6 pt-24 min-h-screen">
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant/30 p-4 mb-6">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Trending Swaps</h2>
            <div className="flex flex-col gap-4">
              {[
                { category: "Technology · Trending", tag: "#MechanicalKeyboards", count: "1,204 swaps" },
                { category: "Fashion · Trending", tag: "Vintage Denim", count: "856 swaps" },
                { category: "Local · Portland", tag: "House Plant Cuttings", count: "420 swaps" },
              ].map((item) => (
                <div key={item.tag} className="cursor-pointer group">
                  <p className="font-label-caps text-label-caps text-on-surface-variant mb-0.5">{item.category}</p>
                  <p className="font-username-sm text-username-sm text-on-surface group-hover:text-primary transition-colors">{item.tag}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{item.count}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 px-2 font-body-sm text-body-sm text-on-surface-variant/70">
            <a className="hover:underline" href="#">Terms</a>
            <a className="hover:underline" href="#">Privacy Policy</a>
            <a className="hover:underline" href="#">Cookie Policy</a>
            <span>© 2024 SwapFuser.</span>
          </div>
        </aside>
      </div>

      <BottomNav />
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense>
      <FeedPageInner />
    </Suspense>
  );
}

