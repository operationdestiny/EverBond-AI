"use client";

import Link from "next/link";
import { Coins, LogIn } from "lucide-react";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useSiteLanguage } from "@/lib/site-language";

export function NavBar() {
  const { t } = useSiteLanguage();

  return (
    <header className="v20-topbar">
      <div className="v51-topbar-inner">
        <div className="v74-top-actions ml-auto flex items-center gap-2">
          <LanguageSelector />
          <Link href="/coins" className="v18-control v51-top-pill v75-coin-pill inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#d85b97]" aria-label={t("buyEverCoin")}>
            <Coins size={16} />
            0
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-bond-rose text-white">+</span>
          </Link>
          <Link href="/pricing" className="v18-control v51-top-pill v75-login-pill inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white">
            <LogIn size={16} />
            <span>{t("logIn")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
