"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function CreatePage() {
  const [postType, setPostType] = useState<"sell" | "swap">("sell");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [swapFor, setSwapFor] = useState("");
  const [location, setLocation] = useState("");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [condition, setCondition] = useState<"New" | "Like New" | "Good" | "Fair">("Good");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFiles(selected: FileList | null) {
    if (!selected) return;
    const arr = Array.from(selected).slice(0, 5);
    setFiles((prev) => [...prev, ...arr].slice(0, 5));
    arr.forEach((f) => setPreviews((prev) => [...prev, URL.createObjectURL(f)].slice(0, 5)));
  }

  function removeImage(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    if (!title.trim()) { toast("Please add a title"); return; }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast("You must be signed in to post"); setLoading(false); return; }

      // Upload images
      const imageUrls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `posts/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("post-images").upload(path, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("post-images").getPublicUrl(path);
        imageUrls.push(publicUrl);
      }

      // Insert post
      const { error: insertError } = await supabase.from("posts").insert({
        user_id: user.id,
        type: postType,
        title: title.trim(),
        description: description.trim() || null,
        images: imageUrls,
        price: postType === "sell" && price ? parseFloat(price) : null,
        swap_for: postType === "swap" && swapFor ? swapFor.trim() : null,
        location: location.trim() || null,
        lat: gpsCoords?.lat ?? null,
        lng: gpsCoords?.lng ?? null,
        condition,
        is_active: true,
      });

      if (insertError) throw insertError;

      toast("Post created! Your item is now live.");
      router.push("/feed");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast(`Error: ${msg}`);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-on-background font-body-md text-body-md flex flex-col" style={{ backgroundColor: "#f7f9fb" }}>
      <TopBar />
      <Sidebar />

      <main className="flex-grow flex items-center justify-center p-4 md:p-6 pb-24 lg:pb-6 lg:ml-64">
        <div className="w-full max-w-[600px] rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(226,232,240,0.8)" }}>
          {/* Header */}
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/50">
            <h1 className="font-headline-md text-headline-md text-on-surface">Create Post</h1>
            <button onClick={() => router.back()} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container/20">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Sell / Swap toggle */}
            <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant/50 relative overflow-hidden">
              <div className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-primary rounded-md transition-transform duration-300 ease-in-out shadow-sm"
                style={{ transform: postType === "swap" ? "translateX(100%)" : "translateX(0)" }} />
              {(["sell", "swap"] as const).map((t) => (
                <button key={t} onClick={() => setPostType(t)}
                  className={`flex-1 relative z-10 py-2 font-username-sm text-username-sm text-center transition-colors duration-300 ${postType === t ? "text-on-primary" : "text-on-surface-variant"}`}>
                  {t === "sell" ? "Sell" : "Swap"}
                </button>
              ))}
            </div>

            {/* Image Uploader */}
            <div>
              {previews.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-outline-variant/60 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-surface-bright/50 hover:bg-primary-container/5 hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-2xl">add_photo_alternate</span>
                  </div>
                  <p className="font-username-sm text-username-sm text-on-surface mb-1">Drag and drop photos</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">or click to browse · up to 5 photos</p>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {previews.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-outline-variant/30">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-[10px]">✕</button>
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <button onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  )}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => handleFiles(e.target.files)} />
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">Item Name *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you offering?"
                  className="w-full bg-surface-bright border border-outline-variant/60 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>

              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">Description</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the condition, features, etc."
                  className="w-full bg-surface-bright border border-outline-variant/60 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none" />
              </div>

              {/* Condition */}
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-wider">Condition</label>
                <div className="flex gap-2 flex-wrap">
                  {(["New", "Like New", "Good", "Fair"] as const).map((c) => (
                    <button key={c} onClick={() => setCondition(c)}
                      className={`px-3 py-1.5 rounded-full font-label-caps text-label-caps border transition-colors ${condition === c ? "bg-primary text-on-primary border-primary" : "border-outline-variant/60 text-on-surface-variant hover:border-primary hover:text-primary"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">Location</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">location_on</span>
                    <input type="text" value={location} onChange={(e) => { setLocation(e.target.value); setGpsCoords(null); }} placeholder="City or ZIP"
                      className="w-full bg-surface-bright border border-outline-variant/60 rounded-lg pl-10 pr-28 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                    <button
                      type="button"
                      disabled={locating}
                      onClick={() => {
                        if (!navigator.geolocation) return;
                        setLocating(true);
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                            setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
                            setLocating(false);
                          },
                          () => setLocating(false),
                          { enableHighAccuracy: true, timeout: 8000 }
                        );
                      }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-full font-label-caps text-label-caps transition-colors text-[11px] ${gpsCoords ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant hover:bg-primary/10 hover:text-primary"} disabled:opacity-50`}
                    >
                      <span className="material-symbols-outlined text-[14px]" style={gpsCoords ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                        {locating ? "progress_activity" : "my_location"}
                      </span>
                      {gpsCoords ? "GPS" : "Locate"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block font-label-caps text-label-caps mb-1 uppercase tracking-wider ${postType === "sell" ? "text-primary" : "text-secondary"}`}>
                    {postType === "sell" ? "Price" : "Looking For"}
                  </label>
                  <div className="relative">
                    <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${postType === "sell" ? "text-primary" : "text-secondary"}`}>
                      {postType === "sell" ? "attach_money" : "sync_alt"}
                    </span>
                    {postType === "sell" ? (
                      <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00"
                        className="w-full rounded-lg pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none transition-colors bg-primary-container/5 border border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary" />
                    ) : (
                      <input type="text" value={swapFor} onChange={(e) => setSwapFor(e.target.value)} placeholder="What would you trade for?"
                        className="w-full rounded-lg pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none transition-colors bg-secondary-container/5 border border-secondary/30 focus:border-secondary focus:ring-1 focus:ring-secondary" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-outline-variant/30 bg-surface-container-lowest/50 flex justify-end gap-3">
            <button onClick={() => router.back()} className="px-6 py-2.5 rounded-full font-username-sm text-username-sm text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="px-8 py-2.5 rounded-full font-username-sm text-username-sm bg-primary text-on-primary hover:bg-surface-tint shadow-sm hover:shadow transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 disabled:opacity-60">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />Posting…</>
              ) : (
                <><span className="material-symbols-outlined text-sm">send</span>Post Item</>
              )}
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

