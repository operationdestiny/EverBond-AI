"use client";

import Link from "next/link";
import {
  Heart,
  HelpCircle,
  Menu,
  Scale,
  ShoppingBag,
  Sparkles,
  UserRound,
  WalletCards,
  UserCircle
} from "lucide-react";
import { useSiteLanguage } from "@/lib/site-language";
import { EVERSHOP_COPY } from "@/lib/evershop-language";

const topLinks = [
  { href: "/", labelKey: "discover", icon: Sparkles, active: true },
  { href: "/create", labelKey: "createCharacter", icon: UserRound },
  { href: "/coins", labelKey: "buyEverCoin", icon: WalletCards },
  { href: "/shop", customLabel: "evershop", icon: ShoppingBag },
  { href: "/my-bond", labelKey: "myBond", icon: UserCircle }
] as const;

const infoLinks = [
  { href: "/why-everbond", labelKey: "whyEverBond", icon: Heart },
  { href: "/legal", labelKey: "legal", icon: Scale },
  { href: "/contact", labelKey: "helpCenter", icon: HelpCircle }
] as const;

const socialLinks = [
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/EverBondOfficial/_profile/",
    path: "M12.017 0C5.396 0 .002 5.394.002 12.017c0 4.99 3.055 9.263 7.402 11.063-.102-.846-.195-2.146.041-3.071.212-.834 1.394-5.899 1.394-5.899s-.356-.712-.356-1.767c0-1.655.959-2.891 2.153-2.891 1.015 0 1.504.762 1.504 1.676 0 1.021-.65 2.547-.985 3.963-.281 1.187.596 2.155 1.765 2.155 2.118 0 3.743-2.234 3.743-5.46 0-2.855-2.052-4.85-4.982-4.85-3.394 0-5.385 2.545-5.385 5.177 0 1.025.394 2.125.888 2.724a.357.357 0 0 1 .083.343c-.091.378-.293 1.187-.333 1.353-.053.218-.174.264-.402.159-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.608 7.464-6.227 7.464-1.216 0-2.357-.631-2.748-1.378 0 0-.601 2.288-.746 2.849-.27 1.04-1.002 2.344-1.492 3.138 1.124.347 2.317.535 3.554.535 6.624 0 12-5.376 12-12S18.641.001 12.017.001Z"
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/everbondofficial/",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.803.24 2.225.403a4.807 4.807 0 0 1 1.738 1.738c.164.422.35 1.055.404 2.225.058 1.266.069 1.646.069 4.849s-.012 3.584-.07 4.85c-.054 1.17-.24 1.803-.403 2.225a4.807 4.807 0 0 1-1.738 1.738c-.422.164-1.055.35-2.225.404-1.266.058-1.646.069-4.849.069s-3.584-.012-4.85-.07c-1.17-.054-1.803-.24-2.225-.403a4.807 4.807 0 0 1-1.738-1.738c-.164-.422-.35-1.055-.404-2.225-.058-1.266-.069-1.646-.069-4.849s.012-3.584.07-4.85c.054-1.17.24-1.803.403-2.225A4.807 4.807 0 0 1 5.475 2.63c.422-.164 1.055-.35 2.225-.404 1.266-.058 1.646-.069 4.849-.069Zm0 2.162c-3.149 0-3.521.012-4.765.068-1.15.053-1.775.245-2.19.406-.55.214-.943.47-1.357.884-.413.413-.67.806-.883 1.356-.161.415-.353 1.04-.406 2.19-.057 1.244-.069 1.616-.069 4.765s.012 3.521.069 4.765c.053 1.15.245 1.775.406 2.19.214.55.47.943.883 1.357.414.413.807.67 1.357.883.415.161 1.04.353 2.19.406 1.244.057 1.616.069 4.765.069s3.521-.012 4.765-.069c1.15-.053 1.775-.245 2.19-.406.55-.214.943-.47 1.357-.883.413-.414.67-.807.883-1.357.161-.415.353-1.04.406-2.19.057-1.244.069-1.616.069-4.765s-.012-3.521-.069-4.765c-.053-1.15-.245-1.775-.406-2.19a2.645 2.645 0 0 0-.883-1.356 2.645 2.645 0 0 0-1.357-.884c-.415-.161-1.04-.353-2.19-.406-1.244-.057-1.616-.069-4.765-.069Zm0 3.683a5.992 5.992 0 1 1 0 11.984 5.992 5.992 0 0 1 0-11.984Zm0 9.82a3.828 3.828 0 1 0 0-7.656 3.828 3.828 0 0 0 0 7.656Zm7.676-10.068a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0Z"
  },
  {
    label: "Tumblr",
    href: "https://www.tumblr.com/everbondofficial",
    path: "M14.563 24c-5.093 0-7.031-3.756-7.031-6.411v-7.146H5.116V7.37c3.63-1.313 4.512-4.436 4.719-6.22h3.099v5.716h4.831v3.577h-4.831v6.215c0 1.822.91 2.451 2.36 2.451.581 0 1.353-.257 1.765-.438l.882 3.272c-.918.468-2.508 1.057-4.378 1.057Z"
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@everbondofficial",
    path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 0 1-5.2 1.74 2.9 2.9 0 0 1 2.31-4.64c.3 0 .59.04.86.13V9.4a6.33 6.33 0 0 0-.86-.06A6.35 6.35 0 0 0 5 20.18a6.35 6.35 0 0 0 10.86-4.5V8.75a8.23 8.23 0 0 0 4.81 1.54V6.86c-.36 0-.72-.06-1.08-.17Z"
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@EverBondOfficial",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.87.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"
  },
  {
    label: "Discord",
    href: "https://discord.gg/SFWDr8DDT",
    path: "M20.32 4.37A19.8 19.8 0 0 0 15.36 2.8a13.7 13.7 0 0 0-.64 1.31 18.4 18.4 0 0 0-5.44 0 13.7 13.7 0 0 0-.65-1.31 19.7 19.7 0 0 0-4.95 1.58C.54 9.02-.32 13.55.1 18.02a20 20 0 0 0 6.08 3.08c.49-.67.93-1.37 1.3-2.11-.72-.27-1.4-.6-2.05-.99.17-.13.34-.26.5-.4a14.15 14.15 0 0 0 12.14 0c.16.14.33.27.5.4-.65.39-1.33.72-2.05.99.37.74.8 1.44 1.3 2.11a20 20 0 0 0 6.08-3.08c.5-5.18-.84-9.67-3.58-13.65ZM8.02 15.27c-1.18 0-2.15-1.08-2.15-2.41s.95-2.42 2.15-2.42c1.2 0 2.17 1.09 2.15 2.42 0 1.33-.95 2.41-2.15 2.41Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.41s.95-2.42 2.15-2.42c1.2 0 2.17 1.09 2.15 2.42 0 1.33-.95 2.41-2.15 2.41Z"
  },
  {
    label: "Reddit",
    href: "https://www.reddit.com/user/RealEverBond/",
    path: "M22 12.14a2.52 2.52 0 0 0-4.28-1.79 12.3 12.3 0 0 0-5.02-1.2l.85-4.02 2.8.6a1.92 1.92 0 1 0 .18-.84l-3.22-.68a.43.43 0 0 0-.51.33l-.98 4.6a12.4 12.4 0 0 0-5.55 1.2A2.52 2.52 0 1 0 3.5 14.5c-.04.25-.06.5-.06.76 0 3.38 3.83 6.12 8.56 6.12s8.56-2.74 8.56-6.12c0-.26-.02-.51-.06-.76A2.52 2.52 0 0 0 22 12.14ZM7.52 14.3a1.45 1.45 0 1 1 2.9 0 1.45 1.45 0 0 1-2.9 0Zm7.93 3.67c-1 .99-2.9 1.06-3.45 1.06-.55 0-2.46-.07-3.45-1.06a.43.43 0 0 1 .6-.61c.63.62 1.97.82 2.85.82.88 0 2.22-.2 2.85-.82a.43.43 0 1 1 .6.61Zm-.42-2.22a1.45 1.45 0 1 1 0-2.9 1.45 1.45 0 0 1 0 2.9Z"
  }
] as const;

function BrandName({ className = "" }: { className?: string }) {
  return (
    <span className={`v51-brand-name ${className}`}>
      <span className="v21-brand-ever">Ever</span>
      <span className="v21-brand-bond">Bond</span>
    </span>
  );
}

function LinkRow({
  href,
  label,
  icon: Icon,
  active,
  collapsed
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  active?: boolean;
  collapsed?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`v18-sidebar-row ${
        collapsed ? "!h-[55px]" : "!h-[52px]"
      } ${active ? "active" : ""}`}
      title={label}
    >
      <span className="flex items-center gap-3">
        <Icon size={18} />
        <span className="v51-sidebar-label">{label}</span>
      </span>
    </Link>
  );
}

export function DashboardSidebar({
  collapsed,
  onToggle
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { t, language } = useSiteLanguage();
  const shopCopy = EVERSHOP_COPY[language] ?? EVERSHOP_COPY.EN;

  return (
    <aside className="v18-sidebar !overflow-y-hidden">
      <div className="v51-sidebar-brand-row !mb-2 !min-h-[44px]">
        <Link href="/" className="v51-sidebar-brand">
          <span className="v18-infinity h-10 w-10 text-[43px]" />
          <BrandName className="font-display text-2xl font-bold" />
        </Link>

        <button
          type="button"
          onClick={onToggle}
          className="v51-sidebar-toggle"
          aria-label={
            collapsed ? t("expandSidebar") : t("collapseSidebar")
          }
        >
          <Menu size={22} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <nav
          className={
            collapsed
              ? "space-y-1"
              : "flex min-h-0 flex-[5] flex-col justify-evenly"
          }
        >
          {topLinks.map((item) => (
            <LinkRow
              key={item.href}
              href={item.href}
              icon={item.icon}
              active={"active" in item ? item.active : undefined}
              collapsed={collapsed}
              label={
                "customLabel" in item
                  ? shopCopy.sidebarLabel
                  : t(item.labelKey)
              }
            />
          ))}
        </nav>

        <div
          className={`h-px bg-white/10 ${
            collapsed ? "my-6" : "my-1"
          }`}
        />

        <nav
          className={
            collapsed
              ? "space-y-1"
              : "flex min-h-0 flex-[3] flex-col justify-evenly"
          }
        >
          {infoLinks.map((item) => (
            <LinkRow
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={t(item.labelKey)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div
          className={
            collapsed
              ? "hidden"
              : "v51-sidebar-footer pt-3"
          }
        >
          <div className="mx-auto flex max-w-[152px] flex-wrap justify-center gap-2 text-bond-muted">
            {socialLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`EverBond on ${item.label}`}
              title={`EverBond on ${item.label}`}
              className="v21-social-circle !h-8 !w-8 transition duration-200 hover:border-bond-rose/70 hover:bg-bond-rose/15 hover:text-bond-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bond-rose/70"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="!h-[17px] !w-[17px]"
                fill="currentColor"
              >
                <path d={item.path} />
              </svg>
            </a>
            ))}
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-bond-muted">
            {t("copyright")}
            <br />
            {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </aside>
  );
}
