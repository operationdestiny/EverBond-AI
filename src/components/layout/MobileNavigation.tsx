"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  HelpCircle,
  Scale,
  ShoppingBag,
  Sparkles,
  UserCircle,
  UserRound,
  WalletCards,
  X
} from "lucide-react";
import { useSiteLanguage } from "@/lib/site-language";
import { EVERSHOP_COPY } from "@/lib/evershop-language";

const topLinks = [
  { href: "/", labelKey: "discover", icon: Sparkles },
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

const MOBILE_COPY = {
  EN: { menu: "Menu", close: "Close menu" },
  ES: { menu: "Menú", close: "Cerrar menú" },
  FR: { menu: "Menu", close: "Fermer le menu" },
  DE: { menu: "Menü", close: "Menü schließen" },
  JA: { menu: "メニュー", close: "メニューを閉じる" },
  KO: { menu: "메뉴", close: "메뉴 닫기" }
} as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNavigation({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { t, language } = useSiteLanguage();
  const shopCopy = EVERSHOP_COPY[language] ?? EVERSHOP_COPY.EN;
  const copy = MOBILE_COPY[language] ?? MOBILE_COPY.EN;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[130] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={copy.menu}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label={copy.close}
      />

      <aside className="relative flex h-full w-[min(86vw,330px)] flex-col overflow-y-auto border-r border-white/10 bg-[#07070b] px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.9rem,env(safe-area-inset-top))] shadow-[20px_0_60px_rgba(0,0,0,0.55)]">
        <div className="mb-3 flex min-h-12 items-center justify-between gap-3 px-2">
          <Link
            href="/"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/everbond-logo.png"
              alt="EverBond"
              className="h-11 w-11 shrink-0 rounded-xl object-cover"
            />
            <span className="truncate font-display text-2xl font-bold">
              <span className="v21-brand-ever">Ever</span>
              <span className="v21-brand-bond">Bond</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:border-bond-rose/55 hover:bg-bond-rose/10"
            aria-label={copy.close}
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5" aria-label={copy.menu}>
          {topLinks.map((item) => {
            const Icon = item.icon;
            const label =
              "customLabel" in item
                ? shopCopy.sidebarLabel
                : t(item.labelKey);
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex min-h-[52px] items-center gap-3 rounded-[13px] border px-4 text-sm font-semibold transition ${
                  active
                    ? "border-bond-rose/75 bg-bond-rose/10 text-white shadow-[0_0_22px_rgba(255,92,168,0.12)]"
                    : "border-transparent text-bond-muted hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Icon size={19} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="my-3 border-t border-white/10" />

        <nav className="flex flex-col gap-1.5" aria-label={copy.menu}>
          {infoLinks.map((item) => {
            const Icon = item.icon;
            const label = t(item.labelKey);
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex min-h-[50px] items-center gap-3 rounded-[13px] border px-4 text-sm font-semibold transition ${
                  active
                    ? "border-bond-rose/75 bg-bond-rose/10 text-white"
                    : "border-transparent text-bond-muted hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
