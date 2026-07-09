"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AdminUserRow {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  is_super_admin: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

function isActive(lastSignInAt: string | null) {
  if (!lastSignInAt) return false;
  return Date.now() - new Date(lastSignInAt).getTime() < 30 * 86_400_000;
}

function formatJoined(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function UserTable({ limit, headerRight }: { limit?: number; headerRight?: React.ReactNode }) {
  const { profile: viewer } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    supabase.rpc("admin_list_users").then(({ data, error }) => {
      if (cancelled) return;
      setUsers(error || !data ? [] : data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleAdmin(user: AdminUserRow) {
    setBusyId(user.id);
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: !user.is_admin })
      .eq("id", user.id);
    if (!error) {
      setUsers((prev) => prev?.map((u) => (u.id === user.id ? { ...u, is_admin: !u.is_admin } : u)) ?? prev);
    }
    setBusyId(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    const { error } = await supabase.from("profiles").delete().eq("id", deleteTarget.id);
    if (!error) {
      setUsers((prev) => prev?.filter((u) => u.id !== deleteTarget.id) ?? prev);
    }
    setBusyId(null);
    setDeleteTarget(null);
  }

  const loading = users === null;
  const query = search.trim().toLowerCase();
  const filtered = query
    ? (users ?? []).filter(
        (u) => (u.full_name ?? "").toLowerCase().includes(query) || u.username.toLowerCase().includes(query)
      )
    : (users ?? []);
  const rows = filtered.slice(0, limit);
  const showSearch = !limit;

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">User Management</h3>
        {showSearch && (
          <div className="relative w-full md:flex-1 md:max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name…"
              className="w-full bg-surface-container-low rounded-full pl-10 pr-9 py-2 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/60 border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        )}
        {headerRight}
      </div>
      {loading ? (
        <div className="p-8 text-center font-body-sm text-body-sm text-on-surface-variant">Loading users…</div>
      ) : rows.length === 0 ? (
        <div className="p-8 text-center font-body-sm text-body-sm text-on-surface-variant">
          {query ? `No users match "${search.trim()}"` : "No users found"}
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="md:hidden divide-y divide-outline-variant/20">
            {rows.map((u, i) => (
              <UserCard
                key={u.id}
                index={i}
                user={u}
                viewer={viewer}
                busy={busyId === u.id}
                onToggleAdmin={() => toggleAdmin(u)}
                onDelete={() => setDeleteTarget(u)}
              />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="p-4 font-label-caps text-label-caps text-on-surface-variant w-10">Sr</th>
                  <th className="p-4 font-label-caps text-label-caps text-on-surface-variant">User</th>
                  <th className="p-4 font-label-caps text-label-caps text-on-surface-variant">Status</th>
                  <th className="p-4 font-label-caps text-label-caps text-on-surface-variant">Role</th>
                  <th className="p-4 font-label-caps text-label-caps text-on-surface-variant">Joined</th>
                  <th className="p-4 font-label-caps text-label-caps text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {rows.map((u, i) => (
                  <UserRow
                    key={u.id}
                    index={i}
                    user={u}
                    viewer={viewer}
                    busy={busyId === u.id}
                    onToggleAdmin={() => toggleAdmin(u)}
                    onDelete={() => setDeleteTarget(u)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete user?">
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
          This will permanently remove <span className="font-bold text-on-surface">@{deleteTarget?.username}</span>{" "}
          from SwapFuser. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            disabled={busyId === deleteTarget?.id}
            className="bg-error text-on-error hover:opacity-90"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

interface RowProps {
  index: number;
  user: AdminUserRow;
  viewer: { id: string; is_super_admin: boolean } | null;
  busy: boolean;
  onToggleAdmin: () => void;
  onDelete: () => void;
}

function canAct(user: AdminUserRow, viewer: RowProps["viewer"]) {
  if (!viewer?.is_super_admin) return false;
  if (user.id === viewer.id) return false;
  if (user.is_super_admin) return false;
  return true;
}

function ActionButtons({ user, viewer, busy, onToggleAdmin, onDelete }: RowProps) {
  if (user.is_super_admin) {
    return <span className="font-label-caps text-label-caps text-on-surface-variant">Protected</span>;
  }
  if (!canAct(user, viewer)) return null;
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleAdmin}
        disabled={busy}
        className="font-label-caps text-label-caps text-primary hover:underline disabled:opacity-50"
      >
        {user.is_admin ? "Revoke Admin" : "Make Admin"}
      </button>
      <button
        onClick={onDelete}
        disabled={busy}
        className="p-1.5 rounded-full text-error hover:bg-error-container/20 transition-colors disabled:opacity-50"
        aria-label="Delete user"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </div>
  );
}

function UserRow(props: RowProps) {
  const { index, user } = props;
  const active = isActive(user.last_sign_in_at);
  return (
    <tr className="hover:bg-surface-container-low transition-colors">
      <td className="p-4 font-body-sm text-body-sm text-on-surface-variant">{index + 1}</td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Avatar src={user.avatar_url} name={user.full_name ?? user.username} size="sm" />
          <div>
            <p className="font-body-sm text-body-sm font-bold text-on-surface">{user.full_name ?? user.username}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">@{user.username}</p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full font-label-caps text-label-caps",
            active ? "bg-success-green/10 text-success-green" : "bg-surface-container-high text-on-surface-variant"
          )}
        >
          {active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="p-4 font-body-sm text-body-sm text-on-surface">{user.is_admin ? "Admin" : "User"}</td>
      <td className="p-4 font-body-sm text-body-sm text-on-surface">{formatJoined(user.created_at)}</td>
      <td className="p-4">
        <ActionButtons {...props} />
      </td>
    </tr>
  );
}

function UserCard(props: RowProps) {
  const { user } = props;
  const active = isActive(user.last_sign_in_at);
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={user.avatar_url} name={user.full_name ?? user.username} size="sm" />
          <div className="min-w-0">
            <p className="font-body-sm text-body-sm font-bold text-on-surface truncate">{user.full_name ?? user.username}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant truncate">@{user.username}</p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full font-label-caps text-label-caps",
            active ? "bg-success-green/10 text-success-green" : "bg-surface-container-high text-on-surface-variant"
          )}
        >
          {active ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant">
        <span>{user.is_admin ? "Admin" : "User"}</span>
        <span>Joined {formatJoined(user.created_at)}</span>
      </div>
      <ActionButtons {...props} />
    </div>
  );
}
