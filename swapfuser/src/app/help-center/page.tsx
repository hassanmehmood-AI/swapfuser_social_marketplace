import Link from "next/link";

const FAQS = [
  {
    category: "Getting Started",
    items: [
      {
        q: "How do I create an account?",
        a: "Click Sign Up on the landing page, enter your email and a password, then complete your profile with a username and photo. It takes less than two minutes.",
      },
      {
        q: "Is SwapFuser free to use?",
        a: "Yes — SwapFuser is completely free. Creating an account, posting listings, and messaging other users costs nothing.",
      },
      {
        q: "What areas does SwapFuser cover?",
        a: "SwapFuser is available anywhere. Our interactive map helps you find listings near your current location, wherever you are.",
      },
    ],
  },
  {
    category: "Listings",
    items: [
      {
        q: "How do I post a listing?",
        a: "Tap the Post button in the feed or the + icon in the bottom navigation. Add photos, a title, description, condition, and choose whether you're selling or swapping. Hit publish and your listing goes live instantly.",
      },
      {
        q: "How many photos can I add?",
        a: "You can add up to 10 photos per listing. We recommend including clear images from multiple angles to attract more interest.",
      },
      {
        q: "Can I edit or delete a listing?",
        a: "Yes. Open your listing, tap the three-dot menu, and choose Edit or Delete. Changes appear immediately.",
      },
      {
        q: "What items can I list?",
        a: "Almost anything legal and in reasonable condition — electronics, clothing, furniture, books, sports gear, collectibles, and more. See our Community Guidelines for a list of prohibited items.",
      },
    ],
  },
  {
    category: "Swapping & Buying",
    items: [
      {
        q: "How does a swap work?",
        a: "Find an item you want, tap Message, and propose a swap. You and the other user agree on what to exchange, then arrange a safe meeting point to complete the swap in person.",
      },
      {
        q: "Does SwapFuser handle payments?",
        a: "For sell listings, payment is arranged directly between users. SwapFuser does not process payments or hold funds. We recommend meeting in person and using a secure, traceable payment method.",
      },
      {
        q: "Where should I meet to swap items?",
        a: "Always meet in a public place — a café, shopping centre, or police station parking lot. Bring a friend if you feel unsure. Never invite a stranger to your home.",
      },
    ],
  },
  {
    category: "Account & Safety",
    items: [
      {
        q: "How do I report a suspicious listing or user?",
        a: "Tap the three-dot menu on any listing or profile and select Report. Our Trust & Safety team reviews every report and aims to respond within 24 hours.",
      },
      {
        q: "How do I reset my password?",
        a: "On the login page, tap Forgot Password and enter your email address. You'll receive a reset link within a few minutes. Check your spam folder if it doesn't arrive.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to your Profile → Settings → Delete Account. Your listings will be removed and your personal data will be deleted within 30 days in accordance with our Privacy Policy.",
      },
    ],
  },
];

export default function HelpCenterPage() {
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
        <h1 className="font-bold text-4xl text-on-surface mb-4">Help Center</h1>
        <p className="text-on-surface-variant mb-12 text-lg leading-relaxed">
          Got a question? We've got answers. Browse the topics below or contact our support team.
        </p>

        <div className="flex flex-col gap-12">
          {FAQS.map(({ category, items }) => (
            <section key={category}>
              <h2 className="font-bold text-2xl text-on-surface mb-6">{category}</h2>
              <div className="flex flex-col gap-4">
                {items.map(({ q, a }) => (
                  <div key={q} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
                    <h3 className="font-bold text-on-surface mb-2">{q}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="font-bold text-xl text-on-surface mb-2">Still need help?</h2>
          <p className="text-on-surface-variant mb-6 font-body-sm text-body-sm">Our support team is here Monday – Friday, 9am – 6pm.</p>
          <a href="mailto:support@swapfuser.com" className="inline-block bg-primary text-on-primary font-username-sm text-username-sm px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-sm">
            Contact Support
          </a>
        </div>
      </main>

      <footer className="border-t border-outline-variant/30 py-8 text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 SwapFuser. All rights reserved.</p>
      </footer>
    </div>
  );
}
