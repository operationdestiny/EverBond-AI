import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { PwaRuntime } from "@/components/pwa/PwaRuntime";
import "./globals.css";
import "./standalone-app.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

const EVERBOND_SLOGAN = "Bond forever with truly unrestricted AI companions";

export const metadata: Metadata = {
  title: `EverBond — ${EVERBOND_SLOGAN}`,
  description: "Start chatting instantly with truly unrestricted AI companions built around Living Memory, story continuity, and emotional roleplay.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://everbond.ai"),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/everbond-logo.png",
    shortcut: "/everbond-logo.png",
    apple: "/pwa/everbond-icon-192.png"
  },
  appleWebApp: {
    capable: true,
    title: "EverBond",
    statusBarStyle: "black-translucent"
  },
  openGraph: {
    title: "EverBond",
    description: EVERBOND_SLOGAN,
    url: "https://everbond.ai",
    siteName: "EverBond",
    images: ["/everbond-logo.png"],
    type: "website"
  }
};

const INITIAL_LANGUAGE_SCRIPT = `
try {
  var code = localStorage.getItem("everbond-language") || "EN";
  var languages = { EN: "en", ES: "es", FR: "fr", DE: "de", JA: "ja", KO: "ko" };
  document.documentElement.lang = languages[code] || "en";
} catch (_) {}
`;

const INITIAL_STANDALONE_SCRIPT = `
try {
  var isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    document.documentElement.classList.add("everbond-standalone");
  }
} catch (_) {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INITIAL_LANGUAGE_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: INITIAL_STANDALONE_SCRIPT }} />
      </head>
      <body>
        <PwaRuntime />
        {children}
      </body>
    </html>
  );
}
