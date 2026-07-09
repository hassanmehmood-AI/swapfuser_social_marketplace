"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/utils";

interface SignupRow {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export function RecentSignups({ limit = 5, headerRight }: { limit?: number; headerRight?: React.ReactNode }) {
  const [users, setUsers] = useState<SignupRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, created_at")
      .order("created_at", { ascending: false })
      .limit(limit)
      .then(({ data, error }) => {
        if (cancelled) return;
        setUsers(error || !data ? [] : data);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  const loading = users === null;

  return (
    <div className="bg-surface-container-lowest p-4 lg:p-6 rounded-xl shadow-sm border border-outline-variant/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Recent Signups</h3>
        {headerRight}
      </div>
      {loading ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant py-4 text-center">Loading…</p>
      ) : users.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant py-4 text-center">No signups yet</p>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3">
              <Avatar src={u.avatar_url} name={u.full_name ?? u.username} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-body-sm text-body-sm font-bold text-on-surface truncate">{u.full_name ?? u.username}</p>
                <p className="font-label-caps text-label-caps text-on-surface-variant truncate">@{u.username}</p>
              </div>
              <span className="shrink-0 font-label-caps text-label-caps text-on-surface-variant">
                {formatDate(u.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
