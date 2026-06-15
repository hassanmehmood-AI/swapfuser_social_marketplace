"use client";

import { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface ProfileSnapshot {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  video_url: string | null;
}

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: ProfileSnapshot;
  onSaved: (updated: Partial<ProfileSnapshot>) => void;
}

export function EditProfileModal({ open, onClose, profile, onSaved }: EditProfileModalProps) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [videoUrl, setVideoUrl] = useState(profile.video_url ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [avatarCleared, setAvatarCleared] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.cover_url);
  const [coverCleared, setCoverCleared] = useState(false);
  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFullName(profile.full_name ?? "");
      setBio(profile.bio ?? "");
      setLocation(profile.location ?? "");
      setAvatarPreview(profile.avatar_url);
      setAvatarFile(null);
      setAvatarCleared(false);
      setCoverPreview(profile.cover_url);
      setCoverFile(null);
      setCoverCleared(false);
      setVideoUrl(profile.video_url ?? "");
    }
  }, [open, profile]);

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File) => void,
    setPreview: (url: string) => void,
    setCleared: (v: boolean) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setCleared(false);
    e.target.value = "";
  }

  function removeAvatar(e: React.MouseEvent) {
    e.stopPropagation();
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarCleared(true);
  }

  function removeCover(e: React.MouseEvent) {
    e.stopPropagation();
    setCoverPreview(null);
    setCoverFile(null);
    setCoverCleared(true);
  }

  async function uploadToStorage(bucket: string, path: string, file: File): Promise<string | null> {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      return null;
    }
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async function handleSave() {
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: Record<string, any> = {
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        video_url: videoUrl.trim() || null,
      };

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop() ?? "jpg";
        const url = await uploadToStorage("avatars", `${profile.id}/avatar.${ext}`, avatarFile);
        if (!url) return;
        updates.avatar_url = url;
      } else if (avatarCleared) {
        updates.avatar_url = null;
      }

      if (coverFile) {
        const ext = coverFile.name.split(".").pop() ?? "jpg";
        const url = await uploadToStorage("covers", `${profile.id}/cover.${ext}`, coverFile);
        if (!url) return;
        updates.cover_url = url;
      } else if (coverCleared) {
        updates.cover_url = null;
      }

      // Save core fields (guaranteed columns)
      const coreUpdates: Record<string, unknown> = {
        full_name: updates.full_name,
        bio: updates.bio,
        location: updates.location,
        video_url: updates.video_url,
        ...("avatar_url" in updates ? { avatar_url: updates.avatar_url } : {}),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: coreError } = await (supabase.from("profiles") as any).update(coreUpdates).eq("id", profile.id);
      if (coreError) {
        toast.error("Failed to save profile.");
        return;
      }

      // Save cover_url separately (column added via: ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url TEXT)
      if ("cover_url" in updates) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("profiles") as any).update({ cover_url: updates.cover_url }).eq("id", profile.id);
      }

      const changedPhoto = coverFile || coverCleared ? "cover" : avatarFile || avatarCleared ? "avatar" : null;
      const successMsg = changedPhoto === "cover"
        ? "Cover photo updated!"
        : changedPhoto === "avatar"
        ? "Profile photo updated!"
        : "Profile updated!";
      toast.success(successMsg);
      onSaved(updates as Partial<ProfileSnapshot>);
      onClose();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const initials = (profile.full_name || profile.username).charAt(0).toUpperCase();

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile" className="sm:max-w-xl">
      {/* Cover photo picker */}
      <div className="relative -mx-6 -mt-6 mb-14">
        <button
          type="button"
          className="w-full h-36 relative overflow-hidden cursor-pointer group block focus:outline-none"
          onClick={() => coverInputRef.current?.click()}
          aria-label="Change cover photo"
        >
          <div
            className="w-full h-full"
            style={{ background: "linear-gradient(135deg, #d8e2ff 0%, #f0dbff 50%, #ffdcc6 100%)" }}
          >
            {coverPreview && (
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 flex items-center justify-center transition-all duration-200">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1.5">
              <span className="material-symbols-outlined text-white text-[32px] drop-shadow-md">add_a_photo</span>
              <span className="text-white text-xs font-medium drop-shadow">Change cover</span>
            </div>
          </div>
        </button>

        {/* Remove cover button */}
        {coverPreview && (
          <button
            type="button"
            onClick={removeCover}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors z-10"
            aria-label="Remove cover photo"
          >
            <span className="material-symbols-outlined text-white text-[16px]">delete</span>
          </button>
        )}

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, setCoverFile, setCoverPreview, setCoverCleared)}
        />

        {/* Avatar picker — overlaps the bottom of the cover */}
        <div className="absolute bottom-0 left-6 translate-y-1/2">
          <div className="relative">
            <button
              type="button"
              className="relative w-20 h-20 rounded-full border-4 border-surface-container-lowest overflow-hidden cursor-pointer group/av bg-surface-container focus:outline-none"
              onClick={() => avatarInputRef.current?.click()}
              aria-label="Change profile photo"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-headline-md text-headline-md text-on-surface-variant bg-primary-container/30">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover/av:bg-black/45 flex items-center justify-center transition-all duration-200">
                <span className="material-symbols-outlined text-white text-[18px] opacity-0 group-hover/av:opacity-100 transition-opacity drop-shadow">
                  photo_camera
                </span>
              </div>
            </button>

            {/* Remove avatar button */}
            {avatarPreview && (
              <button
                type="button"
                onClick={removeAvatar}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error hover:bg-error/80 flex items-center justify-center transition-colors z-10 shadow"
                aria-label="Remove profile photo"
              >
                <span className="material-symbols-outlined text-white text-[12px]">delete</span>
              </button>
            )}
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, setAvatarFile, setAvatarPreview, setAvatarCleared)}
          />
        </div>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-4">
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your display name"
          maxLength={60}
        />
        <Textarea
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell people a bit about yourself…"
          rows={3}
          maxLength={200}
        />
        <Input
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, Country"
          icon="location_on"
          maxLength={80}
        />
        <div>
          <Input
            label="About Me Video (YouTube URL)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            icon="play_circle"
          />
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 pl-1">
            Paste a YouTube link — it will be embedded on your profile.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/20">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-5 py-2 rounded-full font-username-sm text-username-sm border border-outline-variant/60 text-on-surface hover:bg-surface-container transition-colors active:scale-95 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-full font-username-sm text-username-sm bg-primary text-on-primary hover:opacity-90 transition-all active:scale-95 shadow-sm disabled:opacity-60 flex items-center gap-2"
        >
          {saving && (
            <span className="w-3.5 h-3.5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
          )}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </Modal>
  );
}
