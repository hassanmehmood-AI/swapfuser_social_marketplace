import Link from "next/link";

const OPENINGS = [
  {
    title: "Senior Full-Stack Engineer",
    team: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Help us scale SwapFuser's real-time feed and map features to millions of users. You'll own backend services, contribute to the Next.js frontend, and shape our infrastructure.",
  },
  {
    title: "Product Designer",
    team: "Design",
    location: "Remote",
    type: "Full-time",
    description: "Design intuitive, delightful experiences that make local trading feel social. You'll collaborate closely with engineering and own end-to-end feature design.",
  },
  {
    title: "Community Manager",
    team: "Community",
    location: "Remote / Hybrid",
    type: "Full-time",
    description: "Build and nurture SwapFuser communities in new cities. You'll onboard local traders, run events, and be the voice of our users inside the company.",
  },
  {
    title: "Growth Marketing Lead",
    team: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Drive user acquisition and retention across channels. You'll run experiments, own paid and organic campaigns, and turn data into growth strategies.",
  },
  {
    title: "Trust & Safety Specialist",
    team: "Operations",
    location: "Remote",
    type: "Full-time",
    description: "Keep SwapFuser safe for everyone. You'll review reports, refine our policies, and build automated systems to detect bad actors before they cause harm.",
  },
];

export default function CareersPage() {
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
        <h1 className="font-bold text-4xl text-on-surface mb-4">Careers at SwapFuser</h1>
        <p className="text-on-surface-variant mb-12 text-lg leading-relaxed">
          Join a small team with a big mission. We're rethinking local commerce — and we want people who care about community, craft, and impact.
        </p>

        <section className="mb-12">
          <h2 className="font-bold text-2xl text-on-surface mb-6">Why SwapFuser?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "home_work", label: "Fully Remote", desc: "Work from anywhere in the world. We care about output, not office hours." },
              { icon: "health_and_safety", label: "Health Benefits", desc: "Comprehensive health, dental, and vision coverage for you and your family." },
              { icon: "trending_up", label: "Equity", desc: "Everyone owns a piece of what we're building. Your success is our success." },
              { icon: "school", label: "Learning Budget", desc: "$1,500/year for courses, books, conferences — anything that helps you grow." },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex gap-4 p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl">
                <span className="material-symbols-outlined text-primary text-[24px] mt-0.5 flex-shrink-0">{icon}</span>
                <div>
                  <p className="font-bold text-on-surface mb-1">{label}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-bold text-2xl text-on-surface mb-6">Open Roles</h2>
          <div className="flex flex-col gap-4">
            {OPENINGS.map((role) => (
              <div key={role.title} className="border border-outline-variant/30 rounded-2xl p-6 hover:border-primary/40 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <h3 className="font-bold text-on-surface text-lg">{role.title}</h3>
                  <div className="flex gap-2 flex-wrap">
                    <span className="font-body-sm text-body-sm px-3 py-0.5 rounded-full bg-primary/10 text-primary">{role.team}</span>
                    <span className="font-body-sm text-body-sm px-3 py-0.5 rounded-full bg-surface-container text-on-surface-variant">{role.location}</span>
                    <span className="font-body-sm text-body-sm px-3 py-0.5 rounded-full bg-surface-container text-on-surface-variant">{role.type}</span>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">{role.description}</p>
                <button className="font-username-sm text-username-sm text-primary hover:underline">Apply Now →</button>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 text-center">
          <h2 className="font-bold text-xl text-on-surface mb-2">Don't see the right role?</h2>
          <p className="text-on-surface-variant mb-4 font-body-sm text-body-sm">We're always looking for exceptional people. Send us your story.</p>
          <a href="mailto:careers@swapfuser.com" className="inline-block border border-primary text-primary font-username-sm text-username-sm px-6 py-2.5 rounded-full hover:bg-primary/5 transition-colors">
            careers@swapfuser.com
          </a>
        </div>
      </main>

      <footer className="border-t border-outline-variant/30 py-8 text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 SwapFuser. All rights reserved.</p>
      </footer>
    </div>
  );
}
