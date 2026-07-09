"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type Settings = Database["public"]["Tables"]["app_settings"]["Row"];
type ToggleKey = "allow_signups" | "post_approval_required" | "public_profiles" | "contact_form_enabled";

const TOGGLES: { key: ToggleKey; label: string; description: string }[] = [
  { key: "allow_signups", label: "Allow Signups", description: "New user registrations" },
  { key: "post_approval_required", label: "Post Approval", description: "Manual review required" },
  { key: "public_profiles", label: "Public Profiles", description: "Visible to non-members" },
  { key: "contact_form_enabled", label: "Contact Form", description: "Enable site-wide inquiry" },
];

export function QuickSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [savingKey, setSavingKey] = useState<ToggleKey | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("app_settings")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) return;
        setSettings(data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle(key: ToggleKey) {
    if (!settings) return;
    const next = !settings[key];
    setSettings({ ...settings, [key]: next });
    setSavingKey(key);
    const update = { [key]: next } as Database["public"]["Tables"]["app_settings"]["Update"];
    const { error } = await supabase.from("app_settings").update(update).eq("id", 1);
    if (error) setSettings((s) => (s ? { ...s, [key]: !next } : s));
    setSavingKey(null);
  }

  return (
    <div className="bg-surface-container-lowest p-4 lg:p-6 rounded-xl shadow-sm border border-outline-variant/20 h-full">
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-4">Quick Settings</h3>
      <div className="flex flex-col justify-between h-[calc(100%-2.5rem)] gap-4">
        {TOGGLES.map((t) => {
          const checked = settings?.[t.key] ?? false;
          return (
            <div key={t.key} className="flex items-center justify-between">
              <div>
                <p className="font-body-sm text-body-sm font-bold text-on-surface">{t.label}</p>
                <p className="font-label-caps text-label-caps text-on-surface-variant">{t.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!settings || savingKey === t.key}
                  onChange={() => toggle(t.key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:ring-2 peer-focus:ring-primary-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-60" />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
