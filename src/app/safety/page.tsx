"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useSiteLanguage } from "@/lib/site-language";

export default function SafetyPage() {
  const { t } = useSiteLanguage();

  const items = [t("safetyBullet1"), t("safetyBullet2"), t("safetyBullet3")];

  return (
    <AppShell>
      <main className="py-14">
        <div className="bond-container">
          <SectionHeader
            eyebrow={t("safety")}
            title={t("matureRomanceNotChaos")}
            description={t("safetyDescription")}
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
