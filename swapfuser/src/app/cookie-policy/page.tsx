import { SUPPORT_EMAIL } from "@/lib/site";
import Link from "next/link";

const SECTIONS = [
  {
    title: "1. What Are Cookies",
    body: `Cookies are small text files placed on your device when you visit a website. They allow a site to recognise your browser, remember your preferences, and keep you signed in between visits. SwapFuser also uses similar technologies such as local storage to support core features like theme preference and session handling.`,
  },
  {
    title: "2. How SwapFuser Uses Cookies",
    body: `We use cookies and local storage for:\n\n• Essential functions — keeping you signed in, remembering your login session, and securing your account\n• Preferences — remembering settings such as light/dark theme\n• Performance — understanding how the platform is used so we can fix bugs and improve features\n• Analytics — aggregated, anonymised usage statistics via Google Analytics`,
  },
  {
    title: "3. Types of Cookies We Use",
    body: `Strictly Necessary: Required for SwapFuser to function, such as authentication cookies that keep you logged in. These cannot be disabled without breaking core functionality.\n\nPreference Cookies: Remember choices you've made, like dark mode, so you don't have to set them again on every visit.\n\nAnalytics Cookies: Help us understand aggregated traffic and behaviour patterns (e.g. via Google Analytics) so we can improve the platform. These do not identify you personally.`,
  },
  {
    title: "4. Third-Party Cookies",
    body: `Some cookies are placed by third-party services we rely on, including Google Analytics for usage insights and Supabase for authentication and session management. These providers may set their own cookies subject to their respective privacy policies.`,
  },
  {
    title: "5. Managing Cookies",
    body: `Most browsers let you control cookies through their settings, including blocking or deleting them. You can also use your device settings to limit tracking. Please note that disabling essential cookies will prevent you from signing in or using core SwapFuser features.`,
  },
  {
    title: "6. Changes to This Policy",
    body: `We may update this Cookie Policy from time to time to reflect changes in the technologies we use or for legal reasons. We will post the updated policy on this page with a revised effective date.`,
  },
  {
    title: "7. Contact Us",
    body: `If you have questions about this Cookie Policy, please contact us at:\n\n${SUPPORT_EMAIL}`,
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background text-on-background font-body-md text-body-md">
      <header className="sticky top-0 z-50 bg-background border-b border-outline-variant/30">
        <div className="max-w-container-max mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display-lg font-bold" style={{ fontSize: "1.5rem" }}>
            <span className="text-[#3B82F6]">Swap</span><span className="text-[#A855F7]">Fuser</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="font-username-sm text-username-sm text-primary px-4 py-2 rounded-full border border-outline-variant/50 hover:bg-primary/5 transition-colors">Login</Link>
            <Link href="/signup" className="bg-primary text-on-primary font-username-sm text-username-sm px-4 py-2 rounded-full hover:opacity-90 transition-opacity shadow-sm">Sign Up</Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-16">
        <h1 className="font-bold text-4xl text-on-surface mb-2">Cookie Policy</h1>
        <p className="text-on-surface-variant mb-12">Effective date: January 1, 2026</p>

        <p className="text-on-surface-variant leading-relaxed mb-10">
          This Cookie Policy explains how SwapFuser uses cookies and similar technologies to recognise you when you visit our platform, what these technologies are, and why we use them.
        </p>

        <div className="flex flex-col gap-10">
          {SECTIONS.map(({ title, body }) => (
            <section key={title}>
              <h2 className="font-bold text-xl text-on-surface mb-3">{title}</h2>
              {body.split("\n\n").map((para, i) => (
                <p key={i} className="text-on-surface-variant leading-relaxed mb-3 whitespace-pre-line">{para}</p>
              ))}
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-outline-variant/30 py-8 text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 SwapFuser. All rights reserved.</p>
      </footer>
    </div>
  );
}
