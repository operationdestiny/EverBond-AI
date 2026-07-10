"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useSiteLanguage } from "@/lib/site-language";

export default function MyBondPage() {
  const { t } = useSiteLanguage();

  return (
    <AppShell>
      <main className="min-h-screen px-4 py-16 md:px-6">
        <section className="bond-container">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-bond-rose/40 bg-white/[0.035] p-8 text-center shadow-[0_0_44px_rgba(255,92,168,0.10)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bond-rose/15 text-bond-rose">
              <LockKeyhole size={30} />
            </div>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">{t("myBond")}</p>
            <h1 className="mt-4 font-display text-4xl font-bold text-white md:text-5xl">
              {t("logInOrSignUpToAccessMyBond")}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-bond-muted">
              {t("myBondDescription")}
            </p>
            <Link
              href="/pricing"
              className="mt-8 inline-flex rounded-full bg-bond-rose px-7 py-3 text-sm font-bold text-white transition hover:bg-bond-rose/90"
            >
              {t("loginSignup")}
            </Link>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
