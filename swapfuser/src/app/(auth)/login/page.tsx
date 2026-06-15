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

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/feed` },
    });
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
          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container transition-colors font-username-sm text-username-sm text-on-surface mb-5 shadow-sm active:scale-[0.98]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-outline-variant/40" />
            <span className="font-body-sm text-body-sm text-on-surface-variant">or</span>
            <div className="flex-1 h-px bg-outline-variant/40" />
          </div>

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

