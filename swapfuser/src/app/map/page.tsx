"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { supabase } from "@/lib/supabase";
import type { MapItem } from "@/components/map/MapClient";

const MapClient = dynamic(() => import("@/components/map/MapClient"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-surface-container-low animate-pulse" />
  ),
});

const CATEGORIES = ["All", "Electronics", "Clothing", "Furniture", "Books", "Sports"];
const TYPES = ["All", "Swap", "Sell"];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export default function MapPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapPosts, setMapPosts] = useState<MapItem[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMapPosts() {
      const { data: posts } = await supabase
        .from("posts")
        .select("id, user_id, type, title, images, price, location, lat, lng")
        .eq("is_active", true)
        .not("lat", "is", null)
        .not("lng", "is", null)
        .order("created_at", { ascending: false })
        .limit(200);

      if (!posts || posts.length === 0) {
        setLoadingMap(false);
        return;
      }

      const userIds = [...new Set(posts.map((p) => p.user_id as string))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", userIds);

      const profMap: Record<string, { username: string; full_name: string | null; avatar_url: string | null }> = {};
      profiles?.forEach((p) => { profMap[p.id] = p; });

      setMapPosts(
        posts.map((p) => ({
          id: p.id as string,
          title: p.title as string,
          type: p.type as "sell" | "swap",
          price: p.price ? `$${p.price}` : undefined,
          location: (p.location as string) ?? "",
          distance: "",
          image: (p.images as string[])?.[0] ?? "",
          seller: {
            id: p.user_id as string,
            name: profMap[p.user_id as string]?.full_name || profMap[p.user_id as string]?.username || "Unknown",
            username: profMap[p.user_id as string]?.username || "unknown",
            avatar: profMap[p.user_id as string]?.avatar_url || "",
          },
          lat: p.lat as number,
          lng: p.lng as number,
        }))
      );
      setLoadingMap(false);
    }

    fetchMapPosts();
  }, []);

  function handleLocate() {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Debounced place search via Nominatim
  useEffect(() => {
    if (searchQuery.trim().length < 3) { setPlaceResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setPlaceResults(data);
      } catch { setPlaceResults([]); }
      finally { setIsSearching(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handlePlaceSelect(place: { display_name: string; lat: string; lon: string }) {
    const coords: [number, number] = [parseFloat(place.lat), parseFloat(place.lon)];
    setSearchCenter(coords);
    setSearchQuery(place.display_name.split(",")[0]);
    setShowDropdown(false);
  }

  function handleItemSelect(item: { id: string; lat: number; lng: number }) {
    setSelectedItem(item.id);
    setSearchCenter([item.lat, item.lng]);
    setShowDropdown(false);
  }

  function clearSearch() {
    setSearchQuery("");
    setPlaceResults([]);
    setSearchCenter(null);
    setShowDropdown(false);
  }

  const filtered = mapPosts.filter((item) => {
    const typeMatch =
      activeType === "All" ||
      (activeType === "Swap" && item.type === "swap") ||
      (activeType === "Sell" && item.type === "sell");
    return typeMatch;
  });

  const distCenter = userLocation ?? searchCenter;
  const itemsWithDistance = filtered.map((item) => ({
    ...item,
    computedKm: distCenter
      ? haversineKm(distCenter[0], distCenter[1], item.lat, item.lng)
      : null,
  }));

  const sortedItems = distCenter
    ? [...itemsWithDistance].sort((a, b) => (a.computedKm ?? 0) - (b.computedKm ?? 0))
    : itemsWithDistance;

  const q = searchQuery.trim().toLowerCase();
  const itemMatches = q.length >= 2
    ? mapPosts.filter((item) =>
        item.title.toLowerCase().includes(q) || item.location.toLowerCase().includes(q)
      )
    : [];

  const displayItems = q.length >= 2
    ? sortedItems.filter((item) =>
        item.title.toLowerCase().includes(q) || item.location.toLowerCase().includes(q)
      )
    : sortedItems;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background text-on-surface font-body-md text-body-md antialiased">
      <TopBar hideSearch={true} />
      <Sidebar />

      <div className="flex flex-1 overflow-hidden lg:ml-64">
        {/* Map + sidebar content */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Map area */}
          <div className="flex-1 relative overflow-hidden">
            {/* Leaflet map */}
            <div className="absolute inset-0 z-0">
              <MapClient
                items={displayItems}
                selectedItem={selectedItem}
                onSelectItem={setSelectedItem}
                userLocation={userLocation}
                searchCenter={searchCenter}
              />
            </div>

            {/* Search bar overlay */}
            <div ref={searchRef} className="absolute top-4 left-4 right-4 lg:right-auto lg:w-96 z-20">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-full shadow-lg"
                style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)" }}
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                  {isSearching ? "progress_activity" : "search"}
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search places or items..."
                  className="flex-1 bg-transparent border-none outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:ring-0 p-0"
                />
                {searchQuery ? (
                  <button onClick={clearSearch} className="p-1">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
                  </button>
                ) : (
                  <button onClick={handleLocate} disabled={isLocating} className="p-1 transition-colors disabled:opacity-50">
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={userLocation ? { fontVariationSettings: "'FILL' 1", color: "#0058be" } : { color: "#424754" }}
                    >
                      {isLocating ? "progress_activity" : "my_location"}
                    </span>
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && (placeResults.length > 0 || itemMatches.length > 0) && (
                <div className="mt-2 rounded-2xl shadow-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}>
                  {placeResults.length > 0 && (
                    <>
                      <div className="px-4 py-2 font-label-caps text-label-caps text-on-surface-variant text-[10px] uppercase tracking-wider border-b border-outline-variant/20">Places</div>
                      {placeResults.slice(0, 4).map((place, i) => (
                        <button key={i} onClick={() => handlePlaceSelect(place)}
                          className="flex items-center gap-3 px-4 py-3 w-full hover:bg-surface-container transition-colors text-left">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant flex-shrink-0">location_on</span>
                          <span className="font-body-sm text-body-sm text-on-surface line-clamp-1">{place.display_name}</span>
                        </button>
                      ))}
                    </>
                  )}
                  {itemMatches.length > 0 && (
                    <>
                      <div className="px-4 py-2 font-label-caps text-label-caps text-on-surface-variant text-[10px] uppercase tracking-wider border-b border-outline-variant/20 border-t border-outline-variant/10">Nearby Items</div>
                      {itemMatches.slice(0, 4).map((item) => (
                        <button key={item.id} onClick={() => handleItemSelect(item)}
                          className="flex items-center gap-3 px-4 py-3 w-full hover:bg-surface-container transition-colors text-left">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant flex-shrink-0">sell</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-body-sm text-body-sm text-on-surface line-clamp-1">{item.title}</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">{item.location}</p>
                          </div>
                          <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full text-[10px] flex-shrink-0 ${item.type === "swap" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
                            {item.type === "sell" ? (item.price ?? "Sale") : "Swap"}
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Filter chips */}
            <div className="absolute bottom-20 lg:bottom-4 left-4 right-4 lg:right-[22rem] z-20 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full font-username-sm text-username-sm shadow-md transition-colors ${
                    activeType === t ? "bg-primary text-on-primary" : "text-on-surface"
                  }`}
                  style={activeType !== t ? { background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)" } : undefined}
                >
                  {t}
                </button>
              ))}
              {CATEGORIES.slice(1).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? "All" : cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full font-username-sm text-username-sm shadow-md transition-colors ${
                    activeCategory === cat ? "bg-secondary text-on-secondary" : "text-on-surface"
                  }`}
                  style={activeCategory !== cat ? { background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)" } : undefined}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right sidebar: nearby items list */}
          <aside className="hidden lg:flex flex-col w-80 border-l border-outline-variant/30 bg-surface-container-lowest h-full overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b border-outline-variant/30 bg-surface/80 sticky top-0 backdrop-blur-xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-md-mobile text-headline-md-mobile text-on-surface">
                    Nearby Items
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {loadingMap ? "Loading…" : `${displayItems.length} results${distCenter ? " · sorted by distance" : ""}${q ? ` for "${searchQuery.split(",")[0]}"` : ""}`}
                  </p>
                </div>
                <button
                  onClick={handleLocate}
                  disabled={isLocating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-primary bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50 font-username-sm text-username-sm"
                >
                  <span className="material-symbols-outlined text-[16px]" style={userLocation ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    {isLocating ? "progress_activity" : "my_location"}
                  </span>
                  {userLocation ? "Located" : "Near me"}
                </button>
              </div>
            </div>
            <div className="flex flex-col divide-y divide-outline-variant/20">
              {loadingMap ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 p-4 animate-pulse">
                    <div className="w-16 h-16 rounded-xl bg-surface-container-high flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 bg-surface-container-high rounded w-3/4" />
                      <div className="h-3 bg-surface-container-high rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : displayItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-on-surface-variant gap-3">
                  <span className="material-symbols-outlined text-[48px] opacity-30">{q ? "search_off" : "location_off"}</span>
                  <p className="font-username-sm text-username-sm text-on-surface">{q ? `No items matching "${searchQuery.split(",")[0]}"` : "No posts with location yet"}</p>
                  <p className="font-body-sm text-body-sm">{q ? "Try a different search term." : "Create a post and tap \"Locate\" to pin it on the map."}</p>
                </div>
              ) : displayItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id === selectedItem ? null : item.id)}
                  className={`flex gap-3 p-4 hover:bg-surface-container transition-colors text-left w-full ${
                    selectedItem === item.id ? "bg-primary/5" : ""
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-username-sm text-username-sm text-on-surface truncate">{item.title}</p>
                    <div className="flex items-center gap-1 text-on-surface-variant mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span className="font-body-sm text-body-sm">{item.location}</span>
                      {(item.computedKm != null || item.distance) && (
                        <>
                          <span className="font-body-sm text-body-sm text-on-surface-variant/60">·</span>
                          <span className="font-body-sm text-body-sm">
                            {item.computedKm != null ? formatDistance(item.computedKm) : item.distance}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full ${
                          item.type === "swap"
                            ? "bg-secondary/10 text-secondary"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {item.type === "sell" ? (item.price ?? "For Sale") : "Swap"}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.seller.avatar && (
                          <img
                            src={item.seller.avatar}
                            alt={item.seller.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <span className="font-body-sm text-body-sm text-on-surface-variant truncate max-w-[80px]">
                          {item.seller.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

