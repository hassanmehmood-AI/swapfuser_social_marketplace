import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { UnreadCountProvider } from "@/contexts/UnreadCountContext";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SwapFuser — Social Exchange",
  description: "Discover, swap, and sell items in your community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`light ${geist.variable} ${inter.variable}`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-on-background antialiased">
        <UnreadCountProvider>
          {children}
        </UnreadCountProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#2d3133",
              color: "#eff1f3",
              border: "1px solid rgba(114,119,133,0.3)",
              borderRadius: "0.75rem",
              fontFamily: "var(--font-inter, Inter, sans-serif)",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}

