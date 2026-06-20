import Link from "next/link";

export default function AboutPage() {
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
        <h1 className="font-bold text-4xl text-on-surface mb-4">About SwapFuser</h1>
        <p className="text-on-surface-variant mb-12 text-lg leading-relaxed">
          We're building the future of local commerce — where buying, selling, and swapping feels as natural as scrolling your social feed.
        </p>

        <section className="mb-12">
          <h2 className="font-bold text-2xl text-on-surface mb-4">Our Mission</h2>
          <p className="text-on-surface-variant leading-relaxed">
            SwapFuser exists to turn unused items into opportunities. We believe every neighborhood is full of hidden value — a guitar gathering dust in one home is exactly what someone two streets away has been searching for. Our platform makes those connections effortless, trustworthy, and even enjoyable.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-bold text-2xl text-on-surface mb-4">Our Story</h2>
          <p className="text-on-surface-variant leading-relaxed mb-4">
            SwapFuser was founded in 2024 with a simple idea: what if local trading felt like a social network? We were frustrated by clunky classified ads and impersonal marketplace apps that treated every transaction like a sterile exchange.
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            We built SwapFuser to bring warmth, community, and trust back to local commerce. Today, thousands of people use SwapFuser every day to discover items nearby, connect with neighbours, and swap goods in a safe and social environment.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-bold text-2xl text-on-surface mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "handshake", title: "Community First", body: "Every feature we build strengthens the bonds between neighbours and local traders." },
              { icon: "verified_user", title: "Trust & Safety", body: "We verify users and provide secure messaging so every swap feels confident." },
              { icon: "eco", title: "Sustainability", body: "Giving items a second life reduces waste and keeps goods circulating locally." },
            ].map(({ icon, title, body }) => (
              <div key={title} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
                <span className="material-symbols-outlined text-primary text-[32px] mb-3 block">{icon}</span>
                <h3 className="font-bold text-on-surface mb-2">{title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-bold text-2xl text-on-surface mb-4">The Team</h2>
          <p className="text-on-surface-variant leading-relaxed">
            We're a small, passionate team of designers, engineers, and community builders spread across the globe. We share one obsession: making local exchange so seamless that it becomes a habit. We're backed by a community of early adopters who believe in the power of neighbourhood-level commerce.
          </p>
        </section>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="font-bold text-2xl text-on-surface mb-3">Ready to join?</h2>
          <p className="text-on-surface-variant mb-6">Thousands of locals are already swapping. Your community is waiting.</p>
          <Link href="/signup" className="inline-block bg-primary text-on-primary font-username-sm text-username-sm px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-sm">
            Get Started Free
          </Link>
        </div>
      </main>

      <footer className="border-t border-outline-variant/30 py-8 text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 SwapFuser. All rights reserved.</p>
      </footer>
    </div>
  );
}
