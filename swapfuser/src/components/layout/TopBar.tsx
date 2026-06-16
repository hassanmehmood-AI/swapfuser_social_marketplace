"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function TopBar({ hideSearch }: { hideSearch?: boolean } = {}) {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [dark, setDark] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; images: string[]; type: string; price: number | null }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("light", !isDark);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.toggle("light", !next);
  }

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const { data } = await supabase
        .from("posts")
        .select("id, title, images, type, price")
        .ilike("title", `%${searchQuery}%`)
        .eq("is_active", true)
        .limit(6);
      setSearchResults(data ?? []);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/feed?q=${encodeURIComponent(searchQuery.trim())}`);
    setShowResults(false);
  }

  function handleResultClick(title: string) {
    setSearchQuery(title);
    router.push(`/feed?q=${encodeURIComponent(title)}`);
    setShowResults(false);
  }

  function clearSearch() {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  }

  function openMobileSearch() {
    setMobileSearchOpen(true);
    setTimeout(() => mobileInputRef.current?.focus(), 50);
  }

  function closeMobileSearch() {
    setMobileSearchOpen(false);
    clearSearch();
  }

  function handleMobileResultClick(title: string) {
    setSearchQuery(title);
    router.push(`/feed?q=${encodeURIComponent(title)}`);
    closeMobileSearch();
  }

  async function handleSignOut() {
    await signOut();
    setShowUserMenu(false);
    router.push("/login");
    router.refresh();
  }

  const displayName = profile?.full_name ?? profile?.username ?? user?.email?.split("@")[0] ?? "";
  const avatarUrl = profile?.avatar_url;
  const username = profile?.username ?? "";

  return (
    <header className="bg-surface/90 backdrop-blur-xl sticky top-0 z-50 border-b border-outline-variant/30 flex justify-between items-center w-full px-4 md:px-6 h-16 max-w-container-max mx-auto">
      {/* Logo */}
      <Link href="/feed" className="flex items-center gap-2 pr-4">
        <img src="/logo.png" alt="SwapFuser Logo" className="object-contain" style={{ width: "80px", height: "80px" }} />
        <span className="font-display-lg text-[1.25rem] font-bold hidden sm:block tracking-tight">
          <span className="text-[#3B82F6]">Swap</span><span className="text-[#A855F7]">Fuser</span>
        </span>
      </Link>

      {/* Search (desktop) */}
      {!hideSearch && (
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">
              {isSearching ? "progress_activity" : "search"}
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              placeholder="Search SwapFuser"
              className="w-full bg-surface-container-low rounded-full pl-10 pr-9 py-2 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/60 border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            {searchQuery && (
              <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </form>

          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-lg overflow-hidden z-50">
              {searchResults.map((post) => (
                <button key={post.id} onClick={() => handleResultClick(post.title)}
                  className="flex items-center gap-3 px-4 py-3 w-full hover:bg-surface-container transition-colors text-left">
                  {post.images?.[0] ? (
                    <img src={post.images[0]} alt={post.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">image</span>
                    </div>
                  )}
                  <p className="flex-1 font-body-sm text-body-sm text-on-surface line-clamp-1">{post.title}</p>
                  <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full text-[10px] flex-shrink-0 ${post.type === "swap" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
                    {post.type === "sell" ? (post.price ? `$${post.price}` : "Sale") : "Swap"}
                  </span>
                </button>
              ))}
              <button onClick={() => { router.push(`/feed?q=${encodeURIComponent(searchQuery.trim())}`); setShowResults(false); }}
                className="flex items-center gap-3 px-4 py-3 w-full hover:bg-surface-container transition-colors text-left border-t border-outline-variant/20">
                <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0">search</span>
                <span className="font-body-sm text-body-sm text-primary">See all results for &quot;{searchQuery}&quot;</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-2">
        {!hideSearch && (
          <button onClick={openMobileSearch} className="md:hidden p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors" aria-label="Search">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
        )}
        <button onClick={toggleDark} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors" aria-label="Toggle dark mode">
          <span className="material-symbols-outlined text-[20px]">{dark ? "light_mode" : "dark_mode"}</span>
        </button>

        {!loading && (
          <>
            {user ? (
              /* Logged-in user menu */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-surface-container transition-colors"
                  aria-label="Account menu"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-username-sm text-username-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:block font-body-sm text-body-sm text-on-surface max-w-[100px] truncate">
                    {username ? `@${username}` : displayName}
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-12 z-20 w-48 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-lg overflow-hidden animate-scale-in">
                      <Link
                        href={`/profile/${username}`}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors font-body-sm text-body-sm text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[20px]">person</span>
                        View Profile
                      </Link>
                      <Link
                        href="/create"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors font-body-sm text-body-sm text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Create Post
                      </Link>
                      <div className="border-t border-outline-variant/20 my-1" />
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-error-container/30 transition-colors font-body-sm text-body-sm text-error"
                      >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Guest buttons */
              <>
                <Link href="/login" className="font-username-sm text-username-sm font-semibold text-primary px-4 py-2 hover:bg-primary/10 rounded-full transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="bg-primary text-on-primary font-username-sm text-username-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity shadow-sm">
                  Sign Up
                </Link>
              </>
            )}
          </>
        )}
      </div>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-surface z-[60] flex flex-col md:hidden">
          {/* Search header */}
          <div className="flex items-center gap-3 px-4 h-16 border-b border-outline-variant/30 flex-shrink-0">
            <button onClick={closeMobileSearch} className="p-2 -ml-2 text-on-surface-variant active:scale-95 transition-transform">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <form onSubmit={(e) => { handleSearchSubmit(e); closeMobileSearch(); }} className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                {isSearching ? "progress_activity" : "search"}
              </span>
              <input
                ref={mobileInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SwapFuser"
                className="w-full bg-surface-container-low rounded-full pl-10 pr-9 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </form>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 ? (
              <>
                {searchResults.map((post) => (
                  <button key={post.id} onClick={() => handleMobileResultClick(post.title)}
                    className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-surface-container active:bg-surface-container transition-colors text-left border-b border-outline-variant/10">
                    {post.images?.[0] ? (
                      <img src={post.images[0]} alt={post.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">image</span>
                      </div>
                    )}
                    <p className="flex-1 font-body-md text-body-md text-on-surface line-clamp-2">{post.title}</p>
                    <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full text-[10px] flex-shrink-0 ${post.type === "swap" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
                      {post.type === "sell" ? (post.price ? `$${post.price}` : "Sale") : "Swap"}
                    </span>
                  </button>
                ))}
                <button onClick={() => { router.push(`/feed?q=${encodeURIComponent(searchQuery.trim())}`); closeMobileSearch(); }}
                  className="flex items-center gap-3 px-4 py-4 w-full hover:bg-surface-container transition-colors text-left">
                  <span className="material-symbols-outlined text-[20px] text-primary flex-shrink-0">search</span>
                  <span className="font-body-md text-body-md text-primary">See all results for &quot;{searchQuery}&quot;</span>
                </button>
              </>
            ) : searchQuery.length >= 2 && !isSearching ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] opacity-30">search_off</span>
                <p className="font-body-md text-body-md">No results for &quot;{searchQuery}&quot;</p>
              </div>
            ) : searchQuery.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] opacity-30">search</span>
                <p className="font-body-md text-body-md">Search for listings</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}

