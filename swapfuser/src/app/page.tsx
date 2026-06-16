"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LandingFeed from "./landing/LandingFeed";

const FEATURES = [
  {
    icon: "dynamic_feed",
    label: "Social Feed",
    description:
      "Scroll through a vibrant, real-time feed of local items. Like, comment, and engage with your community just like your favorite social network.",
    iconClass: "text-primary",
    badgeClass: "",
  },
  {
    icon: "explore",
    label: "Interactive Map",
    description:
      "Discover what's trading nearby. Our minimal map interface highlights activity hotspots so you can find local deals instantly.",
    iconClass: "text-white",
    badgeClass: "bg-secondary",
  },
  {
    icon: "verified_user",
    label: "Secure Swaps",
    description:
      "Trade with confidence. Our platform ensures genuine connections and safe exchanges between verified local users.",
    iconClass: "text-white",
    badgeClass: "bg-success-green",
  },
];

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Feed", href: "/feed" },
      { label: "Map", href: "/map" },
      { label: "Explore", href: "/feed" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Community", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Help Center", href: "#" },
    ],
  },
];

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users straight to feed
  useEffect(() => {
    if (!loading && user) router.replace("/feed");
  }, [loading, user, router]);

  // While checking auth, show nothing (avoids flash)
  if (loading) return null;
  // After redirect is triggered, keep showing nothing
  if (user) return null;

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md text-body-md">
      {/* ── Top navigation ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background border-b border-outline-variant/30">
        <div className="max-w-container-max mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="font-display-lg text-display-lg font-bold" style={{ fontSize: "1.5rem" }}>
            <span className="text-[#3B82F6]">Swap</span><span className="text-[#A855F7]">Fuser</span>
          </Link>



          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="font-username-sm text-username-sm text-primary px-4 py-2 rounded-full border border-outline-variant/50 hover:bg-primary/5 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-primary text-on-primary font-username-sm text-username-sm px-4 py-2 rounded-full hover:opacity-90 transition-opacity shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="max-w-container-max mx-auto px-4 md:px-6 pt-20 pb-16 text-center">
        <h1
          className="font-display-lg text-display-lg text-on-surface font-extrabold leading-tight mb-6 animate-fade-in-up"
          style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
        >
          Buy, Sell, Swap Socially
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-2xl mx-auto mb-8 animate-fade-in-up animation-delay-100">
          Experience the next generation of local exchange. Connect with your community,
          discover hidden gems on the map, and swap items seamlessly in a dynamic social feed.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up animation-delay-200">
          <Link
            id="landing-signup-btn"
            href="/signup"
            className="bg-primary text-on-primary font-username-sm text-username-sm px-8 py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-md hover:shadow-lg hover:shadow-primary/20"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* ── Why SwapFuser? ──────────────────────────────────────── */}
      <section className="max-w-container-max mx-auto px-4 md:px-6 pb-16">
        <h2 className="font-headline-md-mobile text-headline-md-mobile text-on-surface font-bold text-center mb-10">
          Why SwapFuser?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, label, description, iconClass, badgeClass }) => (
            <div
              key={label}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6"
            >
              {badgeClass ? (
                <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${badgeClass}`}>
                  <span className={`material-symbols-outlined text-[22px] ${iconClass}`}>{icon}</span>
                </div>
              ) : (
                <span className={`material-symbols-outlined text-[36px] mb-4 inline-block ${iconClass}`}>{icon}</span>
              )}
              <h3 className="font-username-sm text-username-sm text-on-surface font-bold text-lg mb-2">
                {label}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Nearby Swaps ────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 md:px-6 pb-16">
        <h2 className="font-headline-md-mobile text-headline-md-mobile text-on-surface font-bold mb-4">
          Nearby Swaps
        </h2>
        <LandingFeed />
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="bg-primary-fixed/40 py-20 text-center px-4">
        <h2 className="font-display-lg text-display-lg text-on-surface font-extrabold mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
          Ready to start swapping?
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto mb-8">
          Join thousands of locals already trading unique finds. Your next favorite item is just a swap away.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-primary text-on-primary font-username-sm text-username-sm px-8 py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
        >
          Sign Up Now
        </Link>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-surface-container px-4 md:px-6 pt-14 pb-8">
        <div className="max-w-container-max mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            <div>
              <Link href="/" className="font-username-sm text-username-sm font-bold text-xl">
                <span className="text-[#3B82F6]">Swap</span><span className="text-[#A855F7]">Fuser</span>
              </Link>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 max-w-xs">
                The social marketplace for local exchanges. Connect, discover, and swap with your community.
              </p>
            </div>
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="font-username-sm text-username-sm text-on-surface font-bold mb-3">
                  {col.title}
                </h4>
                <div className="flex flex-col gap-2">
                  {col.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-outline-variant/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              © 2024 SwapFuser. All rights reserved.
            </p>
            <a
              href="https://neutrontech.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body-sm text-body-sm text-on-surface-variant hover:underline"
            >
              Neutron Tech Swap Fuser
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
