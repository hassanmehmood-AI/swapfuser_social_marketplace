"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Range = "today" | "week" | "month";

interface Bucket {
  label: string;
  value: number;
}

function niceCeil(value: number): number {
  if (value <= 0) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return niceNormalized * magnitude;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildBuckets(range: Range, rows: { created_at: string; kind: string }[]): { since: Date; buckets: Bucket[] } {
  const todayStart = startOfToday();

  if (range === "today") {
    const since = todayStart;
    const buckets: Bucket[] = Array.from({ length: 24 }, (_, h) => ({
      label: `${String(h).padStart(2, "0")}:00`,
      value: 0,
    }));
    for (const row of rows) {
      const hour = Math.floor((new Date(row.created_at).getTime() - since.getTime()) / 3_600_000);
      if (hour >= 0 && hour < 24) buckets[hour].value += 1;
    }
    return { since, buckets };
  }

  const days = range === "week" ? 7 : 30;
  const since = new Date(todayStart.getTime() - (days - 1) * 86_400_000);
  const buckets: Bucket[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(since.getTime() + i * 86_400_000);
    return {
      label:
        range === "week"
          ? d.toLocaleDateString("en-US", { weekday: "short" })
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: 0,
    };
  });
  for (const row of rows) {
    const dayIndex = Math.floor((new Date(row.created_at).getTime() - since.getTime()) / 86_400_000);
    if (dayIndex >= 0 && dayIndex < days) buckets[dayIndex].value += 1;
  }
  return { since, buckets };
}

function pickLabelIndices(count: number, target: number): Set<number> {
  if (count <= target) return new Set(Array.from({ length: count }, (_, i) => i));
  const indices = new Set<number>();
  for (let i = 0; i < target; i++) {
    indices.add(Math.round((i * (count - 1)) / (target - 1)));
  }
  return indices;
}

const RANGES: { key: Range; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

export function ActivityChart() {
  const [range, setRange] = useState<Range>("today");
  const [buckets, setBuckets] = useState<Bucket[] | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBuckets(null);
    setActiveIndex(null);

    async function load() {
      const { since } = buildBuckets(range, []);
      const { data, error } = await supabase.rpc("admin_activity_since", { since: since.toISOString() });
      if (cancelled) return;
      if (error || !data) {
        setBuckets([]);
        return;
      }
      setBuckets(buildBuckets(range, data).buckets);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [range]);

  const maxValue = useMemo(() => Math.max(0, ...(buckets ?? []).map((b) => b.value)), [buckets]);
  const niceMax = useMemo(() => niceCeil(maxValue), [maxValue]);
  const total = useMemo(() => (buckets ?? []).reduce((sum, b) => sum + b.value, 0), [buckets]);
  const peakIndex = useMemo(() => {
    if (!buckets || buckets.length === 0) return -1;
    let idx = 0;
    for (let i = 1; i < buckets.length; i++) if (buckets[i].value > buckets[idx].value) idx = i;
    return buckets[idx].value > 0 ? idx : -1;
  }, [buckets]);

  const desktopLabels = useMemo(() => pickLabelIndices(buckets?.length ?? 0, 6), [buckets]);
  const mobileLabels = useMemo(() => {
    const arr = Array.from(desktopLabels).sort((a, b) => a - b);
    return new Set(arr.filter((_, i) => i % 2 === 0));
  }, [desktopLabels]);

  const displayIndex = activeIndex ?? peakIndex;
  const loading = buckets === null;
  const isEmpty = !loading && total === 0;

  return (
    <div className="bg-surface-container-lowest p-4 lg:p-6 rounded-xl shadow-sm border border-outline-variant/20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Activity Overview</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Posts, comments &amp; signups over time</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full">
            Total: <span className="font-bold text-on-surface">{loading ? "—" : total}</span>
          </span>
          <div className="flex bg-surface-container-low p-1 rounded-lg">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  "px-3 py-1.5 font-label-caps text-label-caps rounded-md transition-colors",
                  range === r.key
                    ? "text-primary bg-surface-container-lowest shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="h-56 flex items-center justify-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">No activity in this period</p>
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="flex flex-col justify-between h-56 pb-6 text-[10px] font-bold text-on-surface-variant/70 text-right">
            <span>{loading ? "" : niceMax}</span>
            <span>{loading ? "" : Math.round(niceMax / 2)}</span>
            <span>0</span>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-x-0 top-0 h-56 flex flex-col justify-between pb-6 -z-0">
              <div className="border-t border-outline-variant/20" />
              <div className="border-t border-outline-variant/20" />
              <div className="border-t border-outline-variant/20" />
            </div>
            <div className="relative h-56 flex items-end justify-center gap-1.5 md:gap-2 pb-6">
              {(buckets ?? []).map((b, i) => {
                const pct = niceMax > 0 ? Math.max((b.value / niceMax) * 100, b.value > 0 ? 3 : 1) : 1;
                const isPeak = i === peakIndex;
                const isActive = i === displayIndex;
                return (
                  <div
                    key={i}
                    tabIndex={0}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onFocus={() => setActiveIndex(i)}
                    onBlur={() => setActiveIndex(null)}
                    className="relative flex-1 max-w-[28px] min-w-[3px] h-full flex flex-col items-center justify-end outline-none group"
                  >
                    {isActive && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-label-caps text-label-caps text-on-surface bg-surface-container-high px-2 py-0.5 rounded-md shadow-sm">
                        {b.value}
                      </div>
                    )}
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-colors",
                        isPeak || isActive ? "bg-primary" : "bg-primary/15 group-hover:bg-primary/30"
                      )}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-1.5 md:gap-2 mt-2">
              {(buckets ?? []).map((b, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex-1 max-w-[28px] min-w-[3px] text-center text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wide truncate",
                    mobileLabels.has(i) ? "block" : desktopLabels.has(i) ? "hidden md:block" : "hidden"
                  )}
                >
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
