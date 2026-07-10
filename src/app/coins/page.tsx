"use client";

import { Gift, ImageIcon, Mic, Phone, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useSiteLanguage } from "@/lib/site-language";

const packages = [
  { amount: 1000, image: "/assets/evercoin-1000.png" },
  { amount: 5000, image: "/assets/evercoin-5000.png" },
  { amount: 10000, image: "/assets/evercoin-10000.png" }
];

export default function CoinsPage() {
  const { t } = useSiteLanguage();

  const items = [
    { icon: Gift, title: t("gifts"), body: t("giftsBody") },
    { icon: ImageIcon, title: t("images"), body: t("imagesBody") },
    { icon: Mic, title: t("voiceMessages"), body: t("voiceMessagesBody") },
    { icon: Phone, title: t("voiceCalls"), body: t("voiceCallsBody") },
    { icon: Sparkles, title: t("premiumCurrency"), body: t("premiumCurrencyBody") }
  ];

  return (
    <AppShell>
      <main className="px-4 py-10 md:px-6">
        <SectionHeader
          eyebrow="EverCoin"
          title={t("onePremiumCurrencyToBuildYourBond")}
          description={t("everCoinDescription")}
        />

        <div className="mx-auto mb-10 grid max-w-6xl gap-4 md:grid-cols-3">
          {packages.map((pack) => (
            <div key={pack.amount} className="eb-neon-card overflow-hidden rounded-[2rem] bg-white/[0.035] p-4 text-center">
              <div className="overflow-hidden rounded-[1.55rem] border border-bond-rose/45 bg-black">
                <img
                  src={pack.image}
                  alt={`${pack.amount.toLocaleString()} EverCoin`}
                  className="h-80 w-full object-cover"
                />
              </div>

              <p className="mt-5 font-display text-5xl font-bold text-bond-rose drop-shadow-[0_0_18px_rgba(255,92,168,0.55)]">
                {pack.amount.toLocaleString()}
              </p>
              <p className="mt-2 text-lg text-white">EverCoin</p>

              <button className="bond-pink-button mt-5 w-full rounded-xl bg-bond-rose/15 px-5 py-3 text-base font-bold text-bond-rose">
                {t("buyCoins")}
              </button>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-bond-rose/15 text-bond-rose">
                  <Icon size={22} />
                </div>
                <h3 className="font-display text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-bond-muted">{item.body}</p>
              </div>
            );
          })}
        </div>
      </main>
    </AppShell>
  );
}
