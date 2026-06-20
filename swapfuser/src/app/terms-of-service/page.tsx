import Link from "next/link";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using SwapFuser, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the platform.\n\nWe reserve the right to update these terms at any time. Continued use of SwapFuser after changes are posted constitutes your acceptance of the revised terms.`,
  },
  {
    title: "2. Eligibility",
    body: `You must be at least 13 years of age to use SwapFuser. By creating an account, you represent and warrant that you meet this requirement. Users between 13 and 18 years of age must have parental or guardian consent.`,
  },
  {
    title: "3. Your Account",
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorised use of your account.\n\nYou may not create more than one account per person, impersonate any other person, or create an account on behalf of someone else without their permission.`,
  },
  {
    title: "4. Listings and Transactions",
    body: `SwapFuser is a platform that connects buyers, sellers, and swappers. We are not a party to any transaction between users.\n\nYou are solely responsible for the accuracy and legality of your listings. All items listed must comply with our Community Guidelines and applicable laws. SwapFuser does not guarantee the quality, safety, legality, or availability of any listed item.\n\nTransactions conducted through SwapFuser are between users. We are not responsible for the outcome of any transaction, including disputes, non-delivery, or misrepresentation.`,
  },
  {
    title: "5. Prohibited Conduct",
    body: `You agree not to:\n\n• Post false, misleading, or fraudulent listings\n• Harass, threaten, or abuse other users\n• Circumvent or attempt to circumvent our safety features\n• Use SwapFuser to conduct illegal activities\n• Scrape, crawl, or otherwise extract data from SwapFuser without our written consent\n• Introduce malware, viruses, or harmful code into the platform\n• Resell access to SwapFuser or use the platform for commercial spam`,
  },
  {
    title: "6. Intellectual Property",
    body: `SwapFuser and its original content, features, and functionality are owned by SwapFuser and are protected by applicable intellectual property laws.\n\nBy posting content on SwapFuser, you grant us a non-exclusive, royalty-free, worldwide licence to use, display, reproduce, and distribute that content on the platform and in promotional materials related to SwapFuser.`,
  },
  {
    title: "7. Disclaimer of Warranties",
    body: `SwapFuser is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that the platform will be uninterrupted, error-free, or free from viruses or other harmful components.`,
  },
  {
    title: "8. Limitation of Liability",
    body: `To the fullest extent permitted by law, SwapFuser shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the platform — including but not limited to damages for lost profits, lost data, or loss of goodwill.`,
  },
  {
    title: "9. Termination",
    body: `We reserve the right to suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms of Service or our Community Guidelines.\n\nYou may delete your account at any time from your profile settings. Upon deletion, your public listings will be removed and your personal data will be handled in accordance with our Privacy Policy.`,
  },
  {
    title: "10. Governing Law",
    body: `These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which SwapFuser operates, without regard to its conflict of law provisions.`,
  },
  {
    title: "11. Contact",
    body: `For questions about these Terms of Service, please contact us at:\n\nlegal@swapfuser.com`,
  },
];

export default function TermsOfServicePage() {
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
        <h1 className="font-bold text-4xl text-on-surface mb-2">Terms of Service</h1>
        <p className="text-on-surface-variant mb-12">Effective date: January 1, 2026</p>

        <p className="text-on-surface-variant leading-relaxed mb-10">
          Welcome to SwapFuser. Please read these Terms of Service carefully before using our platform. These terms govern your use of SwapFuser and form a legal agreement between you and SwapFuser.
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
