"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar() {
  const router = useRouter();
  const { profile } = useAuth();

  const profileHref = profile?.username ? `/profile/${profile.username}` : "/login";

  const NAV_ITEMS = [
    { href: "/feed", label: "Feed", icon: "dynamic_feed" },
    { href: "/map", label: "Map", icon: "explore" },
    { href: "/messages", label: "Inbox", icon: "mail" },
    { href: profileHref, label: "Profile", icon: "person" },
  ];

  return (
    <nav className="h-screen w-64 hidden lg:flex flex-col border-r border-outline-variant/30 fixed left-0 top-0 p-6 pt-24 bg-surface z-40">
      <div className="flex flex-col gap-2 mt-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out text-on-surface-variant hover:bg-primary-container/10 hover:text-primary"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-username-sm text-username-sm">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Create Post CTA */}
      <button
        onClick={() => router.push("/create")}
        className="mt-8 bg-primary text-on-primary font-username-sm text-username-sm py-3 rounded-full hover:opacity-90 transition-all active:scale-95 shadow-md flex justify-center items-center gap-2 w-full"
      >
        <span className="material-symbols-outlined">add</span>
        Create Post
      </button>

      {/* Mission Slogan Widget */}
      <div className="mt-auto mb-8 p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
        <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Our Mission</p>
        <p className="font-username-sm text-username-sm text-primary">Buy, Sell, Swap Socially.</p>
      </div>
    </nav>
  );
}

