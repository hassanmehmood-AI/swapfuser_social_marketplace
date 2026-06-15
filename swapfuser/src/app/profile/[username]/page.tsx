"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import EmptyState from "@/components/ui/EmptyState";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Tab = "listings" | "sold" | "saved";

interface ProfileData {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  video_url: string | null;
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}?rel=0`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1).split("?")[0];
      if (id) return `https://www.youtube.com/embed/${id}?rel=0`;
    }
    return null;
  } catch {
    return null;
  }
}

interface PostItem {
  id: string;
  title: string;
  images: string[];
  type: "sell" | "swap";
  price: number | null;
  likes: number;
  condition: string | null;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("listings");
  const [editOpen, setEditOpen] = useState(false);
  const [startingConvo, setStartingConvo] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [listings, setListings] = useState<PostItem[]>([]);
  const [soldListings, setSoldListings] = useState<PostItem[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [savedPosts, setSavedPosts] = useState<PostItem[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const isOwnProfile = !!(authUser && profile && authUser.id === profile.id);

  useEffect(() => {
    async function load() {
      let resolvedUsername = username;
      if (username === "me") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: myProf } = await supabase
            .from("profiles").select("username").eq("id", user.id).single();
          if (myProf?.username) resolvedUsername = myProf.username;
        }
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", resolvedUsername)
        .single();

      if (prof) {
        setProfile({
          id: prof.id,
          username: prof.username,
          full_name: prof.full_name,
          avatar_url: prof.avatar_url,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cover_url: (prof as any).cover_url ?? null,
          bio: prof.bio,
          location: prof.location,
          video_url: (prof as any).video_url ?? null,
        });

        const [{ data: activePosts }, { data: soldPosts }] = await Promise.all([
          supabase
            .from("posts")
            .select("id, title, images, type, price, condition")
            .eq("user_id", prof.id)
            .eq("is_active", true)
            .order("created_at", { ascending: false }),
          supabase
            .from("posts")
            .select("id, title, images, type, price, condition")
            .eq("user_id", prof.id)
            .eq("is_active", false)
            .order("created_at", { ascending: false }),
        ]);

        const mapPost = (p: { id: string; title: string; images: string[] | null; type: string; price: number | null; condition: string | null }) => ({
          id: p.id,
          title: p.title,
          images: p.images ?? [],
          type: p.type as "sell" | "swap",
          price: p.price,
          likes: 0,
          condition: p.condition,
        });

        setListings((activePosts ?? []).map(mapPost));
        setSoldListings((soldPosts ?? []).map(mapPost));

        const [{ count: fc }, { count: fgc }] = await Promise.all([
          supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", prof.id),
          supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", prof.id),
        ]);
        setFollowerCount(fc ?? 0);
        setFollowingCount(fgc ?? 0);
      } else {
        setProfile(null);
      }
      setLoadingProfile(false);
    }
    load();
  }, [username]);

  useEffect(() => {
    if (!authUser || !profile || authUser.id !== profile.id) return;
    setLoadingSaved(true);

    async function fetchSaved() {
      const { data: saveRows } = await supabase
        .from("saves")
        .select("post_id")
        .eq("user_id", authUser!.id)
        .order("created_at", { ascending: false });

      if (!saveRows || saveRows.length === 0) { setSavedPosts([]); setLoadingSaved(false); return; }

      const postIds = saveRows.map(r => r.post_id as string);
      const { data: posts } = await supabase
        .from("posts")
        .select("id, title, images, type, price, condition")
        .in("id", postIds);

      setSavedPosts(
        (posts ?? []).map(p => ({
          id: p.id,
          title: p.title,
          images: (p.images as string[]) ?? [],
          type: p.type as "sell" | "swap",
          price: p.price,
          likes: 0,
          condition: p.condition,
        }))
      );
      setLoadingSaved(false);
    }

    fetchSaved();
  }, [authUser, profile]);

  async function handleDelete(postId: string) {
    const { error } = await supabase.from("posts").delete().eq("id", postId).eq("user_id", authUser!.id);
    if (error) { console.error("Delete error:", error); toast("Couldn't delete post. Try again."); return; }
    setListings(prev => prev.filter(p => p.id !== postId));
    setOpenMenuId(null);
    toast("Post deleted.");
  }

  async function handleMarkSold(postId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Session token present:", !!session?.access_token);
    if (!session) { toast("Session expired — please sign in again."); router.push("/login"); return; }
    const { error } = await supabase.from("posts").update({ is_active: false }).eq("id", postId).eq("user_id", authUser!.id);
    if (error) { console.error("Mark sold error:", error); toast("Couldn't update post. Try again."); return; }
    const post = listings.find(p => p.id === postId);
    if (post) setSoldListings(prev => [post, ...prev]);
    setListings(prev => prev.filter(p => p.id !== postId));
    setOpenMenuId(null);
    toast("Marked as sold!");
  }

  async function handleMessage() {
    if (!authUser) { router.push("/login"); return; }
    if (!profile) { toast("Profile not loaded yet, try again."); return; }
    setStartingConvo(true);
    try {
      let convId: string | null = null;

      const { data: myRows, error: myRowsErr } = await supabase
        .from("participants")
        .select("conversation_id")
        .eq("user_id", authUser.id);

      if (myRowsErr) { toast("Couldn't load conversations. Please try again."); return; }

      if (myRows && myRows.length > 0) {
        const myConvIds = myRows.map((r) => r.conversation_id as string);
        const { data: shared, error: sharedErr } = await supabase
          .from("participants")
          .select("conversation_id")
          .eq("user_id", profile.id)
          .in("conversation_id", myConvIds)
          .limit(1);
        if (sharedErr) { toast("Couldn't check existing conversations. Please try again."); return; }
        if (shared && shared.length > 0) convId = shared[0].conversation_id as string;
      }

      if (!convId) {
        const { data: newConvo, error: convoErr } = await supabase
          .from("conversations")
          .insert({})
          .select("id")
          .single();
        if (convoErr || !newConvo) { toast("Couldn't create conversation. Please try again."); return; }
        convId = newConvo.id as string;

        const { error: partErr } = await supabase.from("participants").insert([
          { conversation_id: convId, user_id: authUser.id },
          { conversation_id: convId, user_id: profile.id },
        ]);
        if (partErr) { toast("Couldn't add participants. Please try again."); return; }
      }

      router.push(`/messages/${convId}`);
    } catch {
      toast("Something went wrong. Please try again.");
    } finally {
      setStartingConvo(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "listings", label: "Active Listings" },
    { id: "sold", label: "Sold" },
    ...(isOwnProfile ? [{ id: "saved" as Tab, label: "Saved" }] : []),
  ];

  const displayName = profile?.full_name || profile?.username || username;

  if (!loadingProfile && !profile) {
    return (
      <div className="min-h-screen bg-surface text-on-surface font-body-md text-body-md antialiased">
        <TopBar hideSearch={true} />
        <div className="w-full max-w-container-max mx-auto flex min-h-screen">
          <Sidebar />
          <main className="w-full lg:ml-64 flex-1 flex items-center justify-center pb-24">
            <div className="text-center p-8">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30">person_off</span>
              <h2 className="font-headline-md-mobile text-headline-md-mobile text-on-surface mt-4">Profile not found</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">@{username} doesn&apos;t exist.</p>
            </div>
          </main>
        </div>
        <BottomNav />
      </div>
    );
  }

  function PostGrid({ posts, isSold = false }: { posts: PostItem[]; isSold?: boolean }) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
        {posts.map((post) => (
          <article key={post.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group relative">
            <div className="aspect-square overflow-hidden bg-surface-container relative">
              {post.images[0] ? (
                <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                  <span className="material-symbols-outlined text-[48px]">image</span>
                </div>
              )}
              {isSold && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-black font-label-caps text-label-caps px-3 py-1 rounded-full text-[11px] tracking-widest">SOLD</span>
                </div>
              )}
              {/* 3-dot menu button — only own profile, only active listings */}
              {isOwnProfile && !isSold && (
                <div className="absolute top-2 right-2 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === post.id ? null : post.id); }}
                    className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:bg-black/70 active:scale-95"
                    aria-label="Post options"
                  >
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>

                  {openMenuId === post.id && (
                    <>
                      {/* Backdrop to close menu */}
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute top-10 right-0 z-20 w-44 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkSold(post.id); }}
                          className="flex items-center gap-2.5 px-4 py-3 w-full hover:bg-surface-container transition-colors text-left"
                        >
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">sell</span>
                          <span className="font-body-sm text-body-sm text-on-surface">Mark as Sold</span>
                        </button>
                        <div className="border-t border-outline-variant/20" />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                          className="flex items-center gap-2.5 px-4 py-3 w-full hover:bg-error-container/30 transition-colors text-left"
                        >
                          <span className="material-symbols-outlined text-[18px] text-error">delete</span>
                          <span className="font-body-sm text-body-sm text-error">Delete Post</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="font-body-sm text-body-sm text-on-surface line-clamp-2 mb-2">{post.title}</p>
              <div className="flex items-center justify-between">
                <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full ${post.type === "sell" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                  {post.type === "sell" ? (post.price ? `$${post.price}` : "For Sale") : "Swap"}
                </span>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">favorite</span>
                  <span className="font-body-sm text-body-sm">{post.likes}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md text-body-md antialiased">
      <TopBar hideSearch={true} />
      <div className="w-full max-w-container-max mx-auto flex min-h-screen">
        <Sidebar />
        <main className="w-full lg:ml-64 flex-1 pb-24 lg:pb-8">
          {/* Cover */}
          <div className="w-full h-40 lg:h-52 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #d8e2ff 0%, #f0dbff 50%, #ffdcc6 100%)" }}>
            {profile?.cover_url && (
              <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
          </div>

          {/* Profile Info */}
          <div className="bg-surface-container-lowest border-b border-outline-variant/30 px-4 lg:px-6 pb-0">
            <div className="flex items-end justify-between -mt-12 mb-3">
              <div className="relative">
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 border-surface-container-lowest overflow-hidden bg-surface-container">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-headline-md text-headline-md text-on-surface-variant bg-primary-container/30">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 flex-wrap justify-end">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setEditOpen(true)}
                      className="px-5 py-2 rounded-full font-username-sm text-username-sm border border-outline-variant/60 text-on-surface hover:bg-surface-container transition-colors active:scale-95 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Edit Profile
                    </button>
                    <Link href="/create"
                      className="px-5 py-2 rounded-full font-username-sm text-username-sm bg-primary text-on-primary hover:opacity-90 transition-all active:scale-95 shadow-sm flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      New Post
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleMessage}
                    disabled={startingConvo}
                    className="px-5 py-2 rounded-full font-username-sm text-username-sm border border-outline-variant/60 text-on-surface hover:bg-surface-container transition-colors active:scale-95 flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {startingConvo ? (
                      <span className="w-3.5 h-3.5 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />
                    ) : null}
                    Message
                  </button>
                )}
              </div>
            </div>

            <div className="mb-2">
              <div className="flex items-center gap-2">
                <h1 className="font-headline-md-mobile text-headline-md-mobile text-on-surface">{displayName}</h1>
              </div>
            </div>

            {profile?.bio && <p className="font-body-md text-body-md text-on-surface mb-3 max-w-xl">{profile.bio}</p>}
            {profile?.location && (
              <div className="flex items-center gap-1 text-on-surface-variant mb-3">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span className="font-body-sm text-body-sm">{profile.location}</span>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-6 pb-4">
              {[{ label: "Listings", value: listings.length }].map((s) => (
                <div key={s.label} className="flex flex-col items-center">
                  <span className="font-username-sm text-username-sm text-on-surface">{s.value.toLocaleString()}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar border-b border-outline-variant/30 -mb-px">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-username-sm text-username-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60"}`}>
                  {tab.label}
                  {tab.id === "sold" && soldListings.length > 0 && (
                    <span className="ml-1.5 text-[11px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full font-label-caps">{soldListings.length}</span>
                  )}
                  {tab.id === "saved" && savedPosts.length > 0 && (
                    <span className="ml-1.5 text-[11px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-label-caps">{savedPosts.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* About Me Video */}
          {(profile?.video_url || isOwnProfile) && (
            <div className="px-4 lg:px-6 mt-4">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden max-w-sm lg:max-w-lg">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 lg:px-5 border-b border-outline-variant/20">
                  <h3 className="font-username-sm text-username-sm text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px] lg:text-[20px]">play_circle</span>
                    About Me
                  </h3>
                  {isOwnProfile && (
                    <button
                      onClick={() => setEditOpen(true)}
                      className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container"
                      aria-label={profile?.video_url ? "Edit video" : "Add video"}
                    >
                      <span className="material-symbols-outlined text-[20px]">{profile?.video_url ? "edit" : "add"}</span>
                    </button>
                  )}
                </div>

                {/* Video or placeholder */}
                {profile?.video_url && getEmbedUrl(profile.video_url) ? (
                  <div className="relative w-full aspect-video bg-black">
                    <iframe
                      src={getEmbedUrl(profile.video_url)!}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      title="About Me"
                    />
                  </div>
                ) : isOwnProfile ? (
                  <button
                    onClick={() => setEditOpen(true)}
                    className="w-full flex flex-col items-center justify-center gap-3 text-on-surface-variant hover:bg-surface-container transition-colors py-10 lg:py-16"
                  >
                    <span className="material-symbols-outlined text-[40px] lg:text-[56px] opacity-40">video_call</span>
                    <div className="text-center">
                      <p className="font-username-sm text-username-sm">Add an intro video</p>
                      <p className="font-body-sm text-body-sm opacity-70 mt-0.5">Paste a YouTube link in Edit Profile</p>
                    </div>
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="p-4 lg:p-6">
            {activeTab === "listings" && (
              loadingProfile ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl bg-surface-container-high animate-pulse aspect-square" />
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <EmptyState icon="sell" title="No listings yet" body="Items posted by this user will appear here." />
              ) : (
                <PostGrid posts={listings} />
              )
            )}

            {activeTab === "sold" && (
              loadingProfile ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="rounded-xl bg-surface-container-high animate-pulse aspect-square" />
                  ))}
                </div>
              ) : soldListings.length === 0 ? (
                <EmptyState icon="sell" title="No sold items yet" body="Items you've sold will appear here." />
              ) : (
                <PostGrid posts={soldListings} isSold />
              )
            )}

            {activeTab === "saved" && (
              loadingSaved ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl bg-surface-container-high animate-pulse aspect-square" />
                  ))}
                </div>
              ) : savedPosts.length === 0 ? (
                <EmptyState icon="bookmark" title="No saved posts yet" body="Tap the bookmark icon on any post to save it here." />
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
                  {savedPosts.map((post) => (
                    <article key={post.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="aspect-square overflow-hidden bg-surface-container">
                        {post.images[0] ? (
                          <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                            <span className="material-symbols-outlined text-[48px]">image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-body-sm text-body-sm text-on-surface line-clamp-2 mb-2">{post.title}</p>
                        <div className="flex items-center justify-between">
                          <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full ${post.type === "sell" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                            {post.type === "sell" ? (post.price ? `$${post.price}` : "For Sale") : "Swap"}
                          </span>
                          <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )
            )}
          </div>
        </main>
      </div>
      <BottomNav />

      {profile && (
        <EditProfileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profile={{ ...profile, cover_url: profile.cover_url ?? null, video_url: profile.video_url ?? null }}
          onSaved={(updates) => setProfile((prev) => (prev ? { ...prev, ...updates } : prev))}
        />
      )}
    </div>
  );
}
