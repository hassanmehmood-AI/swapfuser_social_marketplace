"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AdminNav } from "@/components/admin/AdminNav";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Admin Dashboard",
  "/admin/users": "User Management",
  "/admin/posts": "Post Moderation",
  "/admin/traffic": "Traffic Overview",
  "/admin/contact-requests": "Contact Requests",
};

function pageTitle(pathname: string) {
  return PAGE_TITLES[pathname] ?? "Admin Dashboard";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!profile?.is_admin) {
      router.replace("/feed");
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (loading || !user || !profile?.is_admin) return null;

  const displayName = profile.full_name ?? profile.username;
  const roleLabel = profile.is_super_admin ? "Super Admin" : "Admin";

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-outline-variant/30 bg-surface p-6 z-40">
        <AdminNav />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!drawerOpen}
      >
        <div
          className="absolute inset-0 bg-ink-black/50 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-[280px] bg-surface p-6 shadow-xl transition-transform duration-300 ease-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={() => setDrawerOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <AdminNav onNavigate={() => setDrawerOpen(false)} />
        </div>
      </div>

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/30 flex items-center justify-between h-16 px-4 lg:px-16 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-md-mobile lg:font-headline-md text-headline-md-mobile lg:text-headline-md text-on-surface">
              {pageTitle(pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-username-sm text-username-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="font-body-sm text-body-sm font-bold text-on-surface leading-tight">{displayName}</p>
              <p className="font-label-caps text-label-caps text-on-surface-variant">{roleLabel}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-16 py-6">{children}</main>
      </div>
    </div>
  );
}
