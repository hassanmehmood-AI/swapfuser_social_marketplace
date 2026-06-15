"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadCount } from "@/hooks/useUnreadCount";

export default function BottomNav() {
  const { profile } = useAuth();
  const unreadCount = useUnreadCount();

  const profileHref = profile?.username ? `/profile/${profile.username}` : "/login";

  const NAV_ITEMS = [
    { href: "/feed",      label: "Feed",    icon: "dynamic_feed" },
    { href: "/map",       label: "Map",     icon: "explore" },
    { href: "/create",    label: "Swap",    icon: "add_circle", big: true },
    { href: "/messages",  label: "Inbox",   icon: "mail" },
    { href: profileHref,  label: "Profile", icon: "person" },
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
            <div className="relative">
              <span className={`material-symbols-outlined${item.big ? " text-[32px]" : ""}`}>{item.icon}</span>
              {item.label === "Inbox" && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className={`font-label-caps text-label-caps ${item.big ? "mt-0.5" : "mt-1"}`}>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
