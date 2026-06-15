"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!authLoading && user) router.replace("/feed");
  }, [authLoading, user, router]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/feed");
    router.refresh();
  }



  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-margin-mobile font-body-md text-body-md">
      {/* Top nav */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 md:px-6 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 z-50">
        <Link href="/feed" className="flex items-center gap-2">
          <div className="overflow-hidden" style={{height: '40px', width: '128px'}}>
            <img src="/swapfuser-logo.png" alt="SwapFuser" style={{height: '128px', width: '128px', marginTop: '-45px'}} />
          </div>
        </Link>
        <Link href="/signup" className="font-username-sm text-username-sm text-primary hover:bg-primary/10 px-4 py-2 rounded-full transition-colors">
          Sign Up
        </Link>
      </header>

      {/* Card */}
      <div className="w-full max-w-md mt-8">
        <div className="text-center mb-8">
          <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Welcome back</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Sign in to continue swapping</p>
        </div>

        <div className="rounded-2xl p-6 lg:p-8 shadow-sm" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(194,198,214,0.5)" }}>


          {/* Error banner */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-error-container/40 border border-error/30 text-error font-body-sm text-body-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-surface-bright border border-outline-variant/60 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Password</label>
                <a href="#" className="font-body-sm text-body-sm text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface-bright border border-outline-variant/60 rounded-lg px-4 py-3 pr-12 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1">
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary font-username-sm text-username-sm py-3 rounded-full hover:opacity-90 transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />Signing in…</>
              ) : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

