"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate, cn } from "@/lib/utils";

interface AdminPost {
  id: string;
  title: string;
  is_active: boolean;
  created_at: string;
  authorName: string;
}

export function PostModerationList({ limit, headerRight }: { limit?: number; headerRight?: React.ReactNode }) {
  const [posts, setPosts] = useState<AdminPost[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let query = supabase
        .from("posts")
        .select("id, title, is_active, created_at, user_id")
        .order("created_at", { ascending: false });
      if (limit) query = query.limit(limit);
      const { data: posts, error } = await query;
      if (cancelled) return;
      if (error || !posts) {
        setPosts([]);
        return;
      }

      const userIds = Array.from(new Set(posts.map((p) => p.user_id)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
      const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name || p.username]));

      if (cancelled) return;
      setPosts(
        posts.map((p) => ({
          id: p.id,
          title: p.title,
          is_active: p.is_active,
          created_at: p.created_at,
          authorName: nameById.get(p.user_id) ?? "Unknown",
        }))
      );
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  async function toggleStatus(post: AdminPost) {
    setBusyId(post.id);
    const next = !post.is_active;
    const { error } = await supabase.from("posts").update({ is_active: next }).eq("id", post.id);
    if (!error) {
      setPosts((prev) => prev?.map((p) => (p.id === post.id ? { ...p, is_active: next } : p)) ?? prev);
    }
    setBusyId(null);
  }

  const loading = posts === null;

  return (
    <div className="bg-surface-container-lowest p-4 lg:p-6 rounded-xl shadow-sm border border-outline-variant/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Post Moderation</h3>
        {headerRight}
      </div>
      {loading ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant py-4 text-center">Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant py-4 text-center">No posts yet</p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-3 rounded-lg border border-outline-variant/20 hover:bg-surface-container-low transition-colors"
            >
              <div className="flex items-start gap-3 mb-1">
                <p className="flex-1 min-w-0 font-body-sm text-body-sm font-bold text-on-surface truncate">
                  {post.title}
                </p>
                <span
                  className={cn(
                    "shrink-0 font-label-caps text-label-caps px-2 py-0.5 rounded uppercase",
                    post.is_active
                      ? "bg-success-green/10 text-success-green"
                      : "bg-secondary-fixed-dim text-on-secondary-fixed-variant"
                  )}
                >
                  {post.is_active ? "Published" : "Pending"}
                </span>
              </div>
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-3">
                By <span className="text-on-surface font-medium">{post.authorName}</span> · {formatDate(post.created_at)}
              </p>
              <button
                onClick={() => toggleStatus(post)}
                disabled={busyId === post.id}
                className={cn(
                  "w-full py-1.5 rounded-md font-label-caps text-label-caps transition-opacity disabled:opacity-50",
                  post.is_active
                    ? "border border-outline-variant text-on-surface hover:bg-surface-container-high"
                    : "bg-primary text-on-primary hover:opacity-90"
                )}
              >
                {post.is_active ? "Unpublish" : "Approve"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
