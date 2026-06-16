"use client";

import Link from "next/link";
import { MOCK_POSTS } from "@/lib/mockData";

export default function LandingFeed() {
  return (
    <div className="flex flex-col gap-4">
      {MOCK_POSTS.map((post, i) => {
        const displayName = post.author.name || post.author.username;
        const initials = displayName.charAt(0).toUpperCase();

        return (
          <div
            key={post.id}
            className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 animate-fade-in-up"
            style={{ animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}
          >
            {/* Author row */}
            <div className="flex items-center gap-3 mb-3">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-container/40 flex items-center justify-center font-username-sm text-username-sm text-primary flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-username-sm text-username-sm text-on-surface font-bold">
                  {displayName}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {post.time}
                  {post.author.location && ` · ${post.author.location}`}
                </p>
              </div>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 font-label-caps text-label-caps text-[10px] px-2 py-0.5 rounded-full ${
                  post.type === "swap"
                    ? "bg-secondary/10 text-secondary"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {post.type === "swap" ? "sync_alt" : "sell"}
                </span>
                {post.type === "swap" ? "Swap" : "For Sale"}
              </span>
              {post.price && post.type === "sell" && (
                <span className="font-username-sm text-username-sm text-on-surface text-sm">
                  {post.price}
                </span>
              )}
              {post.type === "swap" && post.lookingFor && (
                <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                  Looking for: {post.lookingFor}
                </span>
              )}
              {post.condition && (
                <span className="font-label-caps text-label-caps text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                  {post.condition}
                </span>
              )}
            </div>

            {/* Title + description */}
            <p className="font-body-md text-body-md text-on-surface mb-3 whitespace-pre-wrap">
              {post.caption}
            </p>

            {/* Image */}
            {post.images && post.images.length > 0 && (
              <div className="relative rounded-xl overflow-hidden border border-outline-variant/20 mb-3">
                <img
                  src={post.images[0]}
                  alt="Post image"
                  className="w-full max-h-80 object-cover"
                />
                {post.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                    +{post.images.length - 1}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-5 pt-3 border-t border-outline-variant/20 text-on-surface-variant">
              <Link
                href="/login"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
                title="Sign in to swap"
              >
                <span className="material-symbols-outlined text-[18px]">sync_alt</span>
                <span className="font-body-sm text-body-sm">Swap</span>
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1.5 hover:text-secondary transition-colors"
                title="Sign in to comment"
              >
                <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                <span className="font-body-sm text-body-sm">{post.comments}</span>
              </Link>
            </div>
          </div>
        );
      })}

    </div>
  );
}
