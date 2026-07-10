"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useSiteLanguage } from "@/lib/site-language";

export default function LegalPage() {
  const { t } = useSiteLanguage();

  const sections = [
    {
      id: "terms",
      title: t("termsOfUse"),
      body: [t("legalTerms1"), t("legalTerms2"), t("legalTerms3")]
    },
    {
      id: "privacy",
      title: t("privacyPolicy"),
      body: [t("legalPrivacy1"), t("legalPrivacy2"), t("legalPrivacy3")]
    },
    {
      id: "safety",
      title: t("safetyPolicy"),
      body: [t("legalSafety1"), t("legalSafety2"), t("legalSafety3")]
    },
    {
      id: "refund",
      title: t("refundPolicy"),
      body: [t("legalRefund1"), t("legalRefund2")]
    },
    {
      id: "contact",
      title: t("contact"),
      body: [t("legalContact1")]
    }
  ];

  return (
    <AppShell>
      <main className="py-12">
        <section className="bond-container">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-bond-rose">{t("legal")}</p>
              <h1 className="mx-auto mt-4 max-w-4xl font-display text-5xl font-bold tracking-tight text-white md:text-7xl">
                {t("policiesAndUserInformation")}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-bond-muted">
                {t("useTableOfContents")}
              </p>
            </div>

            <nav className="mt-10 rounded-[2rem] border border-bond-rose/45 bg-white/[0.03] p-6">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">{t("tableOfContents")}</p>
              <div className="flex flex-wrap gap-3">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-full border border-bond-rose/60 bg-bond-rose/10 px-5 py-2 text-sm font-bold text-white transition hover:border-bond-rose hover:bg-bond-rose/20"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </nav>

            <div className="mt-8 space-y-6">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 rounded-[2rem] border border-bond-rose/45 bg-white/[0.03] p-7 shadow-[0_0_32px_rgba(255,92,168,0.06)]"
                >
                  <h2 className="font-display text-3xl font-bold text-bond-rose">{section.title}</h2>
                  <div className="mt-5 space-y-5 text-base leading-8 text-bond-muted">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
