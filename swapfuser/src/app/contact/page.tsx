"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { supabase } from "@/lib/supabase";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: submitError } = await supabase.from("contact_requests").insert({
      name: form.name,
      email: form.email,
      message: form.message,
    });

    if (submitError) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // Notify the support inbox; the message is already saved, so a failure here is ignored.
    fetch("/api/contact-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => {});
    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md text-body-md antialiased">
      <TopBar hideSearch />

      <div className="w-full max-w-container-max mx-auto flex justify-center min-h-screen">
        <Sidebar />

        <main className="w-full lg:ml-64 flex-1 max-w-feed-width pb-24 md:pb-8">
          <div className="p-4 md:p-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-[28px]">mail</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Contact Us</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Have a question, partnership idea, or feedback? Send us a message and we&apos;ll get back to you.
            </p>

            {success ? (
              <div className="p-6 lg:p-8 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                <span className="material-symbols-outlined text-primary text-[40px] mb-2 inline-block">check_circle</span>
                <p className="font-body-md text-body-md text-on-surface font-bold">Message sent</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Thanks for reaching out — we&apos;ll reply to {form.email} soon.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl p-6 lg:p-8 shadow-sm border border-outline-variant/20 bg-surface-container-lowest">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Input
                    label="Name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Your name"
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                  <Textarea
                    label="Message"
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="How can we help?"
                    rows={5}
                    required
                  />
                  {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
                  <Button type="submit" size="lg" disabled={loading}>
                    {loading ? "Sending…" : "Send Message"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
