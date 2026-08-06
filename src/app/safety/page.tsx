"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useSiteLanguage } from "@/lib/site-language";
import { FINAL_LOCALIZATION_COPY } from "@/lib/final-localization-language";

export default function SafetyPage() {
  const { t, language } = useSiteLanguage();
  const copy =
    FINAL_LOCALIZATION_COPY[language] ?? FINAL_LOCALIZATION_COPY.EN;
  const items = [
    copy.safety.bullet1,
    copy.safety.bullet2,
    copy.safety.bullet3
  ];

  return (
    <AppShell>
      <main className="py-14">
        <div className="bond-container">
          <SectionHeader
            eyebrow={t("safety")}
            title={t("matureRomanceNotChaos")}
            description={copy.safety.description}
          />
          <div className="mx-auto max-w-3xl space-y-4">
            {items.map((item) => (
              <div key={item} className="bond-card rounded-2xl p-5 text-bond-muted">{item}</div>
            ))}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
