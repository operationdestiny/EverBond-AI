"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useSiteLanguage } from "@/lib/site-language";

export default function LegalPage() {
  const { t } = useSiteLanguage();

  const legalBody = (key: string) =>
    t(key)
      .split("\n")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

  const sections = [
    {
      id: "terms",
      title: t("legalV2TermsOfUseTitle"),
      body: legalBody("legalV2TermsBody")
    },
    {
      id: "privacy",
      title: t("legalV2PrivacyPolicyTitle"),
      body: legalBody("legalV2PrivacyBody")
    },
    {
      id: "safety",
      title: t("legalV2SafetyPolicyTitle"),
      body: legalBody("legalV2SafetyBody")
    },
    {
      id: "ai-disclaimer",
      title: t("legalV2AiDisclaimerTitle"),
      body: legalBody("legalV2AiDisclaimerBody")
    },
    {
      id: "user-responsibility",
      title: t("legalV2UserResponsibilityTitle"),
      body: legalBody("legalV2UserResponsibilityBody")
    },
    {
      id: "content-ownership",
      title: t("legalV2ContentOwnershipTitle"),
      body: legalBody("legalV2ContentOwnershipBody")
    },
    {
      id: "copyright-impersonation",
      title: t("legalV2CopyrightAndImpersonationTitle"),
      body: legalBody("legalV2CopyrightBody")
    },
    {
      id: "ai-image-generation-similarity",
      title: t("legalV2AiImageGenerationSimilarityNoticeTitle"),
      body: legalBody("legalV2ImageNoticeBody")
    },
    {
      id: "dmca-takedown",
      title: t("legalV2DmcaTakedownProcedureTitle"),
      body: legalBody("legalV2DmcaBody")
    },
    {
      id: "arbitration",
      title: t("legalV2ArbitrationAgreementTitle"),
      body: legalBody("legalV2ArbitrationBody")
    },
    {
      id: "limitation-of-liability",
      title: t("legalV2LimitationOfLiabilityTitle"),
      body: legalBody("legalV2LiabilityBody")
    },
    {
      id: "indemnification",
      title: t("legalV2IndemnificationTitle"),
      body: legalBody("legalV2IndemnificationBody")
    },
    {
      id: "refund",
      title: t("legalV2RefundPolicyTitle"),
      body: legalBody("legalV2RefundBody")
    },
    {
      id: "contact",
      title: t("legalV2ContactTitle"),
      body: legalBody("legalV2ContactBody")
    }
  ];

  return (
    <AppShell>
      <main className="py-12">
        <section className="bond-container">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-bond-rose">
                {t("legalV2PageLabel")}
              </p>
              <h1 className="mx-auto mt-4 max-w-4xl font-display text-5xl font-bold tracking-tight text-white md:text-7xl">
                {t("legalV2PageTitle")}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-bond-muted">
                {t("legalV2UseTableOfContents")}
              </p>
            </div>

            <nav className="mt-10 rounded-[2rem] border border-bond-rose/45 bg-white/[0.03] p-6">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">
                {t("legalV2TableOfContents")}
              </p>
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
                  <h2 className="font-display text-3xl font-bold text-bond-rose">
                    {section.title}
                  </h2>
                  <div className="mt-5 space-y-5 text-base leading-8 text-bond-muted">
                    {section.body.map((paragraph, index) => (
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
