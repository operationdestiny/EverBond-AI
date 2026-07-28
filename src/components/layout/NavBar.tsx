"use client";

import Link from "next/link";
import { Coins, LogIn, LogOut } from "lucide-react";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSiteLanguage } from "@/lib/site-language";
import { MY_BOND_COPY } from "@/lib/my-bond-language";
import styles from "./NavBar.module.css";

export function NavBar() {
  const { t, language } = useSiteLanguage();
  const { session, authReady, openAuthModal, signOut } = useAuth();
  const copy = MY_BOND_COPY[language] ?? MY_BOND_COPY.EN;

  return (
    <header className="v20-topbar">
      <div className="v51-topbar-inner">
        <div className="v74-top-actions ml-auto flex items-center gap-2">
          <LanguageSelector />
          <Link
            href="/coins"
            className="v18-control v51-top-pill v75-coin-pill inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#d85b97]"
            aria-label={t("buyEverCoin")}
          >
            <Coins size={16} />
            0
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-bond-rose text-white">
              +
            </span>
          </Link>

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
