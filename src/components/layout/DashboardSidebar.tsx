"use client";

import Link from "next/link";
import {
  Heart,
  HelpCircle,
  Menu,
  Scale,
  Sparkles,
  UserRound,
  WalletCards,
  UserCircle
} from "lucide-react";
import { useSiteLanguage } from "@/lib/site-language";

const topLinks = [
  { href: "/", labelKey: "discover", icon: Sparkles, active: true },
  { href: "/create", labelKey: "createCharacter", icon: UserRound },
  { href: "/coins", labelKey: "buyEverCoin", icon: WalletCards },
  { href: "/my-bond", labelKey: "myBond", icon: UserCircle }
] as const;

const infoLinks = [
  { href: "/why-everbond", labelKey: "whyEverBond", icon: Heart },
  { href: "/pricing", labelKey: "pricing", icon: WalletCards },
  { href: "/legal", labelKey: "legal", icon: Scale },
  { href: "/contact", labelKey: "helpCenter", icon: HelpCircle }
] as const;

function BrandName({ className = "" }: { className?: string }) {
  return (
    <span className={`v51-brand-name ${className}`}>
      <span className="v21-brand-ever">Ever</span><span className="v21-brand-bond">Bond</span>
    </span>
  );
}

function LinkRow({ href, label, icon: Icon, active }: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  active?: boolean;
}) {
  return (
    <Link href={href} className={`v18-sidebar-row ${active ? "active" : ""}`} title={label}>
      <span className="flex items-center gap-3">
        <Icon size={18} />
        <span className="v51-sidebar-label">{label}</span>
      </span>
    </Link>
  );
}

export function DashboardSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { t } = useSiteLanguage();

  return (
    <aside className="v18-sidebar">
      <div className="v51-sidebar-brand-row">
        <Link href="/" className="v51-sidebar-brand">
          <span className="v18-infinity h-10 w-10 text-[43px]" />
          <BrandName className="font-display text-2xl font-bold" />
        </Link>

        <button
          type="button"
          onClick={onToggle}
          className="v51-sidebar-toggle"
          aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        >
          <Menu size={22} />
        </button>
      </div>

      <nav className="space-y-1">{topLinks.map((item) => <LinkRow key={item.href} href={item.href} icon={item.icon} active={"active" in item ? item.active : undefined} label={t(item.labelKey)} />)}</nav>

      <div className="my-6 h-px bg-white/10" />

      <nav className="space-y-1">{infoLinks.map((item) => <LinkRow key={item.href} href={item.href} icon={item.icon} label={t(item.labelKey)} />)}</nav>

      <div className="mt-auto pt-6 v51-sidebar-footer">
        <div className="flex justify-center gap-3 text-bond-muted">
          <span className="v21-social-circle"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor"><path d="M20.32 4.37A19.8 19.8 0 0 0 15.36 2.8a13.7 13.7 0 0 0-.64 1.31 18.4 18.4 0 0 0-5.44 0 13.7 13.7 0 0 0-.65-1.31 19.7 19.7 0 0 0-4.95 1.58C.54 9.02-.32 13.55.1 18.02a20 20 0 0 0 6.08 3.08c.49-.67.93-1.37 1.3-2.11-.72-.27-1.4-.6-2.05-.99.17-.13.34-.26.5-.4a14.15 14.15 0 0 0 12.14 0c.16.14.33.27.5.4-.65.39-1.33.72-2.05.99.37.74.8 1.44 1.3 2.11a20 20 0 0 0 6.08-3.08c.5-5.18-.84-9.67-3.58-13.65ZM8.02 15.27c-1.18 0-2.15-1.08-2.15-2.41s.95-2.42 2.15-2.42c1.2 0 2.17 1.09 2.15 2.42 0 1.33-.95 2.41-2.15 2.41Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.41s.95-2.42 2.15-2.42c1.2 0 2.17 1.09 2.15 2.42 0 1.33-.95 2.41-2.15 2.41Z"/></svg></span>
          <span className="v21-social-circle"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 0 1-5.2 1.74 2.9 2.9 0 0 1 2.31-4.64c.3 0 .59.04.86.13V9.4a6.33 6.33 0 0 0-.86-.06A6.35 6.35 0 0 0 5 20.18a6.35 6.35 0 0 0 10.86-4.5V8.75a8.23 8.23 0 0 0 4.81 1.54V6.86c-.36 0-.72-.06-1.08-.17Z"/></svg></span>
          <span className="v21-social-circle"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor"><path d="M22 12.14a2.52 2.52 0 0 0-4.28-1.79 12.3 12.3 0 0 0-5.02-1.2l.85-4.02 2.8.6a1.92 1.92 0 1 0 .18-.84l-3.22-.68a.43.43 0 0 0-.51.33l-.98 4.6a12.4 12.4 0 0 0-5.55 1.2A2.52 2.52 0 1 0 3.5 14.5c-.04.25-.06.5-.06.76 0 3.38 3.83 6.12 8.56 6.12s8.56-2.74 8.56-6.12c0-.26-.02-.51-.06-.76A2.52 2.52 0 0 0 22 12.14ZM7.52 14.3a1.45 1.45 0 1 1 2.9 0 1.45 1.45 0 0 1-2.9 0Zm7.93 3.67c-1 .99-2.9 1.06-3.45 1.06-.55 0-2.46-.07-3.45-1.06a.43.43 0 0 1 .6-.61c.63.62 1.97.82 2.85.82.88 0 2.22-.2 2.85-.82a.43.43 0 1 1 .6.61Zm-.42-2.22a1.45 1.45 0 1 1 0-2.9 1.45 1.45 0 0 1 0 2.9Z"/></svg></span>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-bond-muted">
          {t("copyright")}<br />{t("allRightsReserved")}
        </p>
      </div>
    </aside>
  );
}
