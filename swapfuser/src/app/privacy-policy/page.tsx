import Link from "next/link";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly to us when you create an account, post a listing, or communicate with other users. This includes your name, email address, username, profile photo, and any content you post.\n\nWhen you use our interactive map feature, we collect approximate location data to show you nearby listings. You may disable location access in your device settings at any time.\n\nWe automatically collect certain technical information when you use SwapFuser, including your IP address, browser type, operating system, referring URLs, and pages visited. We use this data to operate, maintain, and improve the platform.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use the information we collect to:\n\n• Provide, operate, and improve SwapFuser\n• Create and maintain your account\n• Facilitate connections and transactions between users\n• Send you service-related notifications and updates\n• Respond to your comments and questions\n• Monitor and analyse usage patterns to improve the platform\n• Detect, investigate, and prevent fraudulent or illegal activity\n• Comply with legal obligations`,
  },
  {
    title: "3. Sharing of Information",
    body: `We do not sell your personal information to third parties.\n\nYour public profile information — including your username, profile photo, and public listings — is visible to other SwapFuser users and, depending on your settings, to the general public.\n\nWe may share your information with third-party service providers who help us operate the platform (e.g., cloud hosting, analytics, customer support). These providers are contractually required to protect your data and may not use it for any other purpose.\n\nWe may disclose your information if required by law or if we believe disclosure is necessary to protect the rights, property, or safety of SwapFuser, our users, or others.`,
  },
  {
    title: "4. Data Retention",
    body: `We retain your personal information for as long as your account is active or as needed to provide our services. If you delete your account, we will delete or anonymise your personal data within 30 days, except where we are required by law to retain it longer.`,
  },
  {
    title: "5. Cookies",
    body: `SwapFuser uses cookies and similar tracking technologies to maintain your session, remember your preferences, and analyse platform usage. You can control cookies through your browser settings. Disabling cookies may affect the functionality of SwapFuser.`,
  },
  {
    title: "6. Security",
    body: `We take reasonable technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "7. Children's Privacy",
    body: `SwapFuser is not intended for use by anyone under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.`,
  },
  {
    title: "8. Your Rights",
    body: `Depending on your location, you may have the right to access, correct, or delete your personal information, object to or restrict certain processing, and request a copy of your data in a portable format.\n\nTo exercise these rights, contact us at privacy@swapfuser.com. We will respond to your request within 30 days.`,
  },
  {
    title: "9. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and, where appropriate, by email. Your continued use of SwapFuser after the effective date of any changes constitutes your acceptance of the updated policy.`,
  },
  {
    title: "10. Contact Us",
    body: `If you have any questions about this Privacy Policy, please contact us at:\n\nSwapFuser Privacy Team\nprivacy@swapfuser.com`,
  },
];

export default function PrivacyPolicyPage() {
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
        <h1 className="font-bold text-4xl text-on-surface mb-2">Privacy Policy</h1>
        <p className="text-on-surface-variant mb-12">Effective date: January 1, 2026</p>

        <p className="text-on-surface-variant leading-relaxed mb-10">
          At SwapFuser, your privacy matters to us. This Privacy Policy explains what information we collect, how we use it, and the choices you have. By using SwapFuser, you agree to the practices described in this policy.
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
