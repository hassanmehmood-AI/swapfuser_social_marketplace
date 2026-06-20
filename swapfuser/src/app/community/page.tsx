import Link from "next/link";

const GUIDELINES = [
  { icon: "handshake", title: "Be Honest", body: "Describe your items accurately. Include clear photos, honest condition ratings, and fair pricing. What you post is what someone expects to receive." },
  { icon: "favorite", title: "Be Kind", body: "Treat every member with respect. Harassment, hate speech, and personal attacks are never tolerated — online or in person during a swap." },
  { icon: "verified_user", title: "Be Safe", body: "Meet in public places, bring a friend if you're unsure, and use SwapFuser's in-app messaging to keep all communication on-platform." },
  { icon: "schedule", title: "Be Reliable", body: "If you commit to a swap, follow through. Cancelling at the last minute lets down real people. If something comes up, communicate early." },
  { icon: "flag", title: "Report Problems", body: "If you see something wrong — fake listings, suspicious users, or harmful content — use the report button. You're helping protect everyone." },
  { icon: "group", title: "Support Locals", body: "Prioritise your local community. SwapFuser works best when items stay in the neighbourhood and people build real, lasting relationships." },
];

export default function CommunityPage() {
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
        <h1 className="font-bold text-4xl text-on-surface mb-4">Community Guidelines</h1>
        <p className="text-on-surface-variant mb-12 text-lg leading-relaxed">
          SwapFuser is built on trust. These guidelines keep our marketplace safe, fair, and genuinely enjoyable for everyone — buyers, sellers, and swappers alike.
        </p>

        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GUIDELINES.map(({ icon, title, body }) => (
              <div key={title} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
                <span className="material-symbols-outlined text-primary text-[28px] mb-3 block">{icon}</span>
                <h3 className="font-bold text-on-surface mb-2">{title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-bold text-2xl text-on-surface mb-4">Prohibited Items</h2>
          <p className="text-on-surface-variant leading-relaxed mb-4">
            The following items may not be listed on SwapFuser under any circumstances:
          </p>
          <ul className="space-y-2 text-on-surface-variant font-body-sm text-body-sm">
            {[
              "Weapons, firearms, or ammunition",
              "Illegal drugs or controlled substances",
              "Counterfeit or stolen goods",
              "Alcohol or tobacco products",
              "Live animals",
              "Hazardous materials",
              "Adult or explicit content",
              "Personal data or account credentials",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[16px]">cancel</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-bold text-2xl text-on-surface mb-4">Enforcement</h2>
          <p className="text-on-surface-variant leading-relaxed mb-4">
            Violations of these guidelines may result in content removal, temporary suspension, or a permanent ban — depending on severity. We review every report and aim to respond within 24 hours.
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            If you believe your account was actioned in error, you can appeal by contacting our Trust & Safety team at <a href="mailto:safety@swapfuser.com" className="text-primary hover:underline">safety@swapfuser.com</a>.
          </p>
        </section>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="font-bold text-xl text-on-surface mb-2">Ready to start swapping?</h2>
          <p className="text-on-surface-variant mb-6 font-body-sm text-body-sm">Join a community that plays fair.</p>
          <Link href="/signup" className="inline-block bg-primary text-on-primary font-username-sm text-username-sm px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-sm">
            Join SwapFuser
          </Link>
        </div>
      </main>

      <footer className="border-t border-outline-variant/30 py-8 text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 SwapFuser. All rights reserved.</p>
      </footer>
    </div>
  );
}
