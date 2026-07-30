"use client";

import { useEffect, useState } from "react";
import {
  Gift,
  ImageIcon,
  LoaderCircle,
  Phone,
  Sparkles
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useSiteLanguage } from "@/lib/site-language";
import { MEDIA_COPY } from "@/lib/media-language";
import { EVERCOIN_PAGE_COPY } from "@/lib/evercoin-page-language";

const packages = [
  {
    code: "1000" as const,
    amount: 1_000,
    price: "$10.99",
    image: "/assets/evercoin-1000.png"
  },
  {
    code: "5000" as const,
    amount: 5_000,
    price: "$44.99",
    image: "/assets/evercoin-5000.png"
  },
  {
    code: "10000" as const,
    amount: 10_000,
    price: "$84.99",
    image: "/assets/evercoin-10000.png"
  }
];

export default function CoinsPage() {
  return (
    <AppShell>
      <CoinsPageContent />
    </AppShell>
  );
}

function CoinsPageContent() {
  const { t, language } = useSiteLanguage();
  const copy = MEDIA_COPY[language] ?? MEDIA_COPY.EN;
  const pageCopy = EVERCOIN_PAGE_COPY[language] ?? EVERCOIN_PAGE_COPY.EN;
  const { session, authReady, openAuthModal } = useAuth();
  const [busyPack, setBusyPack] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [callCost, setCallCost] = useState(35);
  const [imageCost, setImageCost] = useState(20);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/evercoin/pricing", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (cancelled || !response.ok) return;

        const nextCallCost = Number(payload?.callCostPerMinute);
        const nextImageCost = Number(payload?.imageCost);

        if (Number.isFinite(nextCallCost) && nextCallCost > 0) {
          setCallCost(Math.trunc(nextCallCost));
        }
        if (Number.isFinite(nextImageCost) && nextImageCost > 0) {
          setImageCost(Math.trunc(nextImageCost));
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const items = [
    { icon: Gift, title: t("gifts"), body: t("giftsBody"), rate: null },
    {
      icon: ImageIcon,
      title: t("images"),
      body: t("imagesBody"),
      rate: `${imageCost} EverCoin / ${pageCopy.imageUnit}`
    },
    {
      icon: Phone,
      title: t("voiceCalls"),
      body: t("voiceCallsBody"),
      rate: `${callCost} EverCoin / ${copy.minute}`
    },
    {
      icon: Sparkles,
      title: t("premiumCurrency"),
      body: t("premiumCurrencyBody"),
      rate: null
    }
  ];

  async function buyPack(pack: (typeof packages)[number]) {
    if (!authReady || busyPack) return;

    if (!session?.access_token) {
      openAuthModal();
      return;
    }

    setBusyPack(pack.code);
    setError("");

    try {
      const response = await fetch("/api/evercoin/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ pack: pack.code })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || typeof payload?.url !== "string") {
        throw new Error(payload?.message || payload?.error || pageCopy.checkoutFailed);
      }

      window.location.assign(payload.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : pageCopy.checkoutFailed
      );
      setBusyPack(null);
    }
  }

  return (
    <main className="px-4 py-10 md:px-6">
      <SectionHeader
        eyebrow="EverCoin"
        title={pageCopy.title}
        description={pageCopy.description}
      />

      <div className="mx-auto mb-10 grid max-w-6xl gap-4 md:grid-cols-3">
        {packages.map((pack) => {
          const busy = busyPack === pack.code;

          return (
            <div
              key={pack.amount}
              className="eb-neon-card overflow-hidden rounded-[2rem] bg-white/[0.035] p-4 text-center"
            >
              <div className="overflow-hidden rounded-[1.55rem] border border-bond-rose/45 bg-black">
                <img
                  src={pack.image}
                  alt={`${pack.amount.toLocaleString("en-US")} EverCoin`}
                  className="h-80 w-full object-cover"
                />
              </div>

              <p className="mt-5 font-display text-5xl font-bold text-bond-rose drop-shadow-[0_0_18px_rgba(255,92,168,0.55)]">
                {pack.amount.toLocaleString("en-US")}
              </p>
              <p className="mt-2 text-lg text-white">EverCoin</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {pack.price}
              </p>

              <button
                type="button"
                onClick={() => void buyPack(pack)}
                disabled={!authReady || Boolean(busyPack)}
                className="bond-pink-button mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-bond-rose/15 px-5 py-3 text-base font-bold text-bond-rose disabled:cursor-not-allowed disabled:opacity-55"
              >
                {busy && <LoaderCircle size={18} className="animate-spin" />}
                {t("buyCoins")}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mx-auto mb-8 max-w-3xl rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-3 text-center text-sm text-red-100">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-bond-rose/15 text-bond-rose">
                <Icon size={22} />
              </div>
              <h3 className="font-display text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-bond-muted">
                {item.body}
              </p>
              {item.rate && (
                <p className="mt-4 inline-flex rounded-full border border-bond-rose/35 bg-bond-rose/10 px-3 py-1.5 text-sm font-bold text-bond-rose">
                  {item.rate}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
