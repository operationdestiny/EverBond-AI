"use client";

import { AppShell } from "@/components/layout/AppShell";
import { LEGAL_PAGE_COPY } from "@/lib/legal-page-language";
import { useSiteLanguage } from "@/lib/site-language";

export default function LegalPage() {
  const { language } = useSiteLanguage();
  const copy =
    LEGAL_PAGE_COPY[language] ?? LEGAL_PAGE_COPY.EN;

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
              <p className="mx-auto mt-6 max-w-3xl text-sm leading-6 text-white/65">
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
                    {section.paragraphs.map(
                      (paragraph, index) => (
                        <p key={`${section.id}-${index}`}>
                          {paragraph}
                        </p>
                      )
                    )}

                    {section.emailParagraph && (
                      <p>
                        {section.emailParagraph.prefix}{" "}
                        <a
                          href={`mailto:${section.emailParagraph.email}`}
                          className="font-semibold text-bond-rose hover:underline"
                        >
                          {section.emailParagraph.email}
                        </a>
                      </p>
                    )}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-28 border-t border-bond-rose/30 pt-8">
              <section className="mx-auto max-w-4xl text-[11px] leading-4 text-white/35">
                <p className="font-bold uppercase tracking-[0.2em] text-bond-rose/50">
                  {copy.dmcaAgent.title}
                </p>

                <div className="mt-3 grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
                  <p>{copy.dmcaAgent.department}</p>
                  <p>{copy.dmcaAgent.organization}</p>
                  <p>{copy.dmcaAgent.addressLine1}</p>
                  <p>{copy.dmcaAgent.addressLine2}</p>
                  <p>
                    {copy.dmcaAgent.phoneLabel}:{" "}
                    <a
                      href={`tel:${copy.dmcaAgent.phone.replace(/[^\d+]/g, "")}`}
                      className="transition hover:text-bond-rose"
                    >
                      {copy.dmcaAgent.phone}
                    </a>
                  </p>
                  <p>
                    {copy.dmcaAgent.emailLabel}:{" "}
                    <a
                      href={`mailto:${copy.dmcaAgent.email}`}
                      className="transition hover:text-bond-rose"
                    >
                      {copy.dmcaAgent.email}
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
