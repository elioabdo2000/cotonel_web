import type { Metadata, Viewport } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Cotonel — Where comfort meets elegance",
  description:
    "Cotonel by Samar — 100% pure cotton lingerie, sleepwear, bedding, baby wear and sportswear. Zahlé, Lebanon.",
};

// viewportFit: "cover" lets iPhones with a notch/home indicator draw behind
// them properly, which is what makes `env(safe-area-inset-*)` below
// actually mean something instead of always being 0.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
