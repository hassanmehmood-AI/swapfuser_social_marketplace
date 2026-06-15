"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function BottomNav() {
  const { profile } = useAuth();

  const profileHref = profile?.username ? `/profile/${profile.username}` : "/login";

  const NAV_ITEMS = [
    { href: "/feed", label: "Feed", icon: "dynamic_feed" },
    { href: "/map", label: "Map", icon: "explore" },
    { href: "/create", label: "Swap", icon: "add_circle", big: true },
    { href: "/messages", label: "Inbox", icon: "mail" },
    { href: profileHref, label: "Profile", icon: "person" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 lg:hidden border-t border-outline-variant/30 bg-surface/90 backdrop-blur-xl shadow-lg pb-safe">
      <div className="flex justify-around items-center h-16 px-margin-mobile">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center active:scale-90 transition-transform p-2 ${item.big ? "text-primary -mt-1" : "text-on-surface-variant hover:text-primary"}`}
          >
            <span className={`material-symbols-outlined${item.big ? " text-[32px]" : ""}`}>{item.icon}</span>
            <span className={`font-label-caps text-label-caps ${item.big ? "mt-0.5" : "mt-1"}`}>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

