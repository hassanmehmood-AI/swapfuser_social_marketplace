"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/supabase";

type ContactRequest = Database["public"]["Tables"]["contact_requests"]["Row"];

export function ContactRequestsPanel({ limit, headerRight }: { limit?: number; headerRight?: React.ReactNode }) {
  const [requests, setRequests] = useState<ContactRequest[] | null>(null);
  const [selected, setSelected] = useState<ContactRequest | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let query = supabase.from("contact_requests").select("*").order("created_at", { ascending: false });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (cancelled) return;
      setRequests(error || !data ? [] : data);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  async function openRequest(req: ContactRequest) {
    setSelected(req);
    if (req.status === "new") {
      setRequests((prev) => prev?.map((r) => (r.id === req.id ? { ...r, status: "resolved" } : r)) ?? prev);
      setSelected((prev) => (prev && prev.id === req.id ? { ...prev, status: "resolved" } : prev));
      const { error } = await supabase.from("contact_requests").update({ status: "resolved" }).eq("id", req.id);
      if (error) {
        setRequests((prev) => prev?.map((r) => (r.id === req.id ? { ...r, status: "new" } : r)) ?? prev);
      }
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setDeleting(true);
    const { error } = await supabase.from("contact_requests").delete().eq("id", selected.id);
    setDeleting(false);
    if (!error) {
      setRequests((prev) => prev?.filter((r) => r.id !== selected.id) ?? prev);
      setConfirmDelete(false);
      setSelected(null);
    }
  }

  const loading = requests === null;

  return (
    <div className="bg-surface-container-lowest p-4 lg:p-6 rounded-xl shadow-sm border border-outline-variant/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Contact Requests</h3>
        {headerRight}
      </div>
      {loading ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant py-4 text-center">Loading…</p>
      ) : requests.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant py-4 text-center">No contact requests</p>
      ) : (
        <div className="flex flex-col gap-2">
          {requests.map((req) => (
            <button
              key={req.id}
              onClick={() => openRequest(req)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                req.status === "new" ? "bg-primary/5 border border-primary/10" : "hover:bg-surface-container-low"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                {req.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-body-sm text-body-sm font-bold text-on-surface truncate">{req.name}</p>
                  {req.status === "new" && (
                    <span className="shrink-0 font-label-caps text-label-caps text-primary">New</span>
                  )}
                </div>
                <p className="font-label-caps text-label-caps text-on-surface-variant truncate">{req.message}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">Email</p>
              <p className="font-body-sm text-body-sm text-on-surface">{selected.email}</p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">Message</p>
              <p className="font-body-sm text-body-sm text-on-surface whitespace-pre-wrap">{selected.message}</p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">Submitted</p>
              <p className="font-body-sm text-body-sm text-on-surface">
                {new Date(selected.created_at).toLocaleString("en-US")}
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setConfirmDelete(true)}
                className="bg-error text-on-error hover:opacity-90"
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this request?">
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
          This will permanently remove this contact request. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} disabled={deleting} className="bg-error text-on-error hover:opacity-90">
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
