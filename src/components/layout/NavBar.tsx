"use client";

import { LogIn, LogOut, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSiteLanguage } from "@/lib/site-language";
import { MY_BOND_COPY } from "@/lib/my-bond-language";
import styles from "./NavBar.module.css";

const MENU_COPY = {
  EN: "Open menu",
  ES: "Abrir menú",
  FR: "Ouvrir le menu",
  DE: "Menü öffnen",
  JA: "メニューを開く",
  KO: "메뉴 열기"
} as const;

export function NavBar({
  onOpenMobileMenu
}: {
  onOpenMobileMenu: () => void;
}) {
  const pathname = usePathname();
  const { language } = useSiteLanguage();
  const { session, authReady, openAuthModal, signOut } = useAuth();
  const copy = MY_BOND_COPY[language] ?? MY_BOND_COPY.EN;
  const menuLabel = MENU_COPY[language] ?? MENU_COPY.EN;
  const isDiscoverPage = pathname === "/";

  return (
    <header
      className={`v20-topbar ${
        isDiscoverPage ? "" : styles.hideOnPhone
      }`}
    >
      <div className="v51-topbar-inner">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="v18-control mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center text-white lg:hidden"
          aria-label={menuLabel}
        >
          <Menu size={20} />
        </button>

        <div className="v74-top-actions ml-auto flex items-center gap-2">
          <LanguageSelector />

          {authReady && session ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className={`${styles.authButton} v18-control v51-top-pill v75-login-pill inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white`}
            >
              <LogOut size={16} />
              <span>{copy.logout}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className={`${styles.authButton} v18-control v51-top-pill v75-login-pill inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white`}
            >
              <LogIn size={16} />
              <span>{copy.loginSignup}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
