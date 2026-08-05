"use client";

import { AppShell } from "@/components/layout/AppShell";
import { LEGAL_PAGE_COPY } from "@/lib/legal-page-language";
import { useSiteLanguage } from "@/lib/site-language";

export default function LegalPage() {
  const { language } = useSiteLanguage();
  const copy = LEGAL_PAGE_COPY[language] ?? LEGAL_PAGE_COPY.EN;

  return (
    <AppShell>
      <main className="py-12">
        <section className="bond-container">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-bond-rose">
                {copy.label}
              </p>
              <h1 className="mx-auto mt-4 max-w-4xl font-display text-5xl font-bold tracking-tight text-white md:text-7xl">
                {copy.title}
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-bond-muted">
                {copy.intro}
              </p>
              <p className="mt-4 text-sm font-bold text-bond-rose">
                {copy.effectiveDate}
              </p>
              <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-white/65">
                {copy.controllingLanguage}
              </p>
            </div>

            <nav className="mt-10 rounded-[2rem] border border-bond-rose/45 bg-white/[0.03] p-6">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">
                {copy.contents}
              </p>
              <div className="flex flex-wrap gap-3">
                {copy.sections.map((section) => (
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
              {copy.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 rounded-[2rem] border border-bond-rose/45 bg-white/[0.03] p-7 shadow-[0_0_32px_rgba(255,92,168,0.06)]"
                >
                  <h2 className="font-display text-3xl font-bold text-bond-rose">
                    {section.title}
                  </h2>
                  <div className="mt-5 space-y-5 text-base leading-8 text-bond-muted">
                    {section.paragraphs.map((paragraph, index) => (
                      <p key={`${section.id}-${index}`}>{paragraph}</p>
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
