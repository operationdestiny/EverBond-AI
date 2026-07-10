import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "EverBond — AI companions that will remember you",
  description: "Start chatting instantly with AI companions built around Living Memory, story continuity, and emotional roleplay.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://everbond.ai"),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png"
  },
  openGraph: {
    title: "EverBond",
    description: "AI companions that will remember you.",
    url: "https://everbond.ai",
    siteName: "EverBond",
    images: ["/everbond-logo.png"],
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable}`}>
      <body>{children}</body>
    </html>
  );
}
