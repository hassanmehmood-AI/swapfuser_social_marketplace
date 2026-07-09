"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { StatTile } from "@/components/admin/StatTile";
import { ActivityChart } from "@/components/admin/ActivityChart";
import { QuickSettings } from "@/components/admin/QuickSettings";
import { UserTable } from "@/components/admin/UserTable";
import { PostModerationList } from "@/components/admin/PostModerationList";
import { ContactRequestsPanel } from "@/components/admin/ContactRequestsPanel";
import { RecentSignups } from "@/components/admin/RecentSignups";

interface DashboardStats {
  total_users: number;
  active_users_7d: number;
  total_posts: number;
  open_contact_requests: number;
}

function ShowMore({ href }: { href: string }) {
  return (
    <Link href={href} className="font-label-caps text-label-caps text-primary hover:underline shrink-0">
      Show more
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.rpc("admin_dashboard_stats").then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data || data.length === 0) return;
      setStats(data[0]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Stat tiles */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatTile icon="group" label="Total Users" value={stats?.total_users ?? null} />
        <StatTile icon="bolt" label="Active Users (7d)" value={stats?.active_users_7d ?? null} />
        <StatTile icon="description" label="Total Posts" value={stats?.total_posts ?? null} />
        <StatTile icon="mail" label="Contact Requests" value={stats?.open_contact_requests ?? null} />
      </section>

      {/* Activity + Quick Settings */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        <QuickSettings />
      </section>

      {/* Users + Post Moderation */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2">
          <UserTable limit={5} headerRight={<ShowMore href="/admin/users" />} />
        </div>
        <PostModerationList limit={2} headerRight={<ShowMore href="/admin/posts" />} />
      </section>

      {/* Contact Requests + Recent Signups */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <ContactRequestsPanel limit={3} headerRight={<ShowMore href="/admin/contact-requests" />} />
        <RecentSignups limit={5} />
      </section>
    </div>
  );
}
