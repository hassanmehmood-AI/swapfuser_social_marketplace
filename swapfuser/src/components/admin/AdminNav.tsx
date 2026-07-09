"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const SUB_NAV_ITEMS = [
  { href: "/admin/users", label: "Users", icon: "group" },
  { href: "/admin/posts", label: "Posts", icon: "article" },
  { href: "/admin/traffic", label: "Traffic", icon: "leaderboard" },
  { href: "/admin/contact-requests", label: "Contact Requests", icon: "contact_mail" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    onNavigate?.();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col h-full">
      <Link href="/feed" onClick={onNavigate} className="flex items-center gap-2 px-2 mb-8">
        <span className="font-display-lg text-[1.25rem] font-bold tracking-tight">
          <span className="text-[#3B82F6]">Swap</span><span className="text-[#A855F7]">Fuser</span>
        </span>
      </Link>

      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        <Link
          href="/feed"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-body-sm text-body-sm text-on-surface-variant hover:bg-primary-container/10 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          Home
        </Link>

        <Link
          href="/admin"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg font-body-sm text-body-sm transition-colors",
            isActive(pathname, "/admin", true)
              ? "font-bold text-primary bg-primary/10"
              : "text-on-surface-variant hover:bg-primary-container/10 hover:text-primary"
          )}
        >
          <span className={cn("material-symbols-outlined text-[20px]", isActive(pathname, "/admin", true) && "material-symbols-fill")}>
            shield_person
          </span>
          Admin Console
        </Link>

        <div className="flex flex-col gap-1 mt-1 pl-4 border-l border-outline-variant/30 ml-5">
          {SUB_NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg font-body-sm text-body-sm transition-colors",
                  active
                    ? "font-bold text-primary bg-primary/10"
                    : "text-on-surface-variant hover:bg-primary-container/10 hover:text-primary"
                )}
              >
                <span className={cn("material-symbols-outlined text-[18px]", active && "material-symbols-fill")}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto pt-4 border-t border-outline-variant/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body-sm text-body-sm text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>
      </div>
    </div>
  );
}
