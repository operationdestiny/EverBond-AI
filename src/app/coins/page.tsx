"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clapperboard,
  Gift,
  ImageIcon,
  LoaderCircle,
  MessageCircleMore
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useSiteLanguage } from "@/lib/site-language";
import { EVERCOIN_PAGE_COPY } from "@/lib/evercoin-page-language";
import { EVERCOIN_PAYMENT_COPY } from "@/lib/evercoin-payment-language";
import { BANK_PAYMENT_COPY } from "@/lib/bank-payment-language";
import {
  LOCALE_BY_LANGUAGE,
  localizedErrorMessage
} from "@/lib/final-localization-language";

type Rail = "bank";
type Pack = {
  code: "1200" | "2000" | "5000";
  amount: number;
  price: string;
  image: string;
};

const paymentPackages: Pack[] = [
  { code: "1200", amount: 1_200, price: "$12.09", image: "/assets/evercoin-1000.png" },
  { code: "2000", amount: 2_000, price: "$19.99", image: "/assets/evercoin-5000.png" },
  { code: "5000", amount: 5_000, price: "$44.99", image: "/assets/evercoin-10000.png" }
];

const PENDING_PAYMENT_KEY = "everbond-pending-evercoin-payment";

export default function CoinsPage() {
  return (
    <AppShell>
      <CoinsPageContent />
    </AppShell>
  );
}

function CoinsPageContent() {
  const { language } = useSiteLanguage();
  const pageCopy = EVERCOIN_PAGE_COPY[language] ?? EVERCOIN_PAGE_COPY.EN;
  const paymentCopy = EVERCOIN_PAYMENT_COPY[language] ?? EVERCOIN_PAYMENT_COPY.EN;
  const bankCopy = BANK_PAYMENT_COPY[language] ?? BANK_PAYMENT_COPY.EN;
  const locale = LOCALE_BY_LANGUAGE[language] ?? LOCALE_BY_LANGUAGE.EN;
  const { session, authReady, openAuthModal } = useAuth();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [imageCost, setImageCost] = useState(20);
  const [videoCost, setVideoCost] = useState(90);
  const [paymentReady, setPaymentReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      fetch("/api/evercoin/pricing", { cache: "no-store" })
        .then((response) => response.json().catch(() => ({})))
        .catch(() => ({})),
      fetch("/api/evercoin/checkout", { cache: "no-store" })
        .then((response) => response.json().catch(() => ({})))
        .catch(() => ({}))
    ]).then(([pricing, checkout]) => {
      if (cancelled) return;

      const nextImageCost = Number(pricing?.imageCost);
      const nextVideoCost = Number(pricing?.videoCost);
      if (Number.isFinite(nextImageCost) && nextImageCost > 0) {
        setImageCost(Math.trunc(nextImageCost));
      }
      if (Number.isFinite(nextVideoCost) && nextVideoCost > 0) {
        setVideoCost(Math.trunc(nextVideoCost));
      }

      setPaymentReady(checkout?.rails?.bank === true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session?.access_token || typeof window === "undefined") return;

    const orderId = window.localStorage.getItem(PENDING_PAYMENT_KEY);
    if (!orderId) return;

    let cancelled = false;
    let attempts = 0;

    async function checkPending() {
      if (cancelled) return;
      attempts += 1;

      try {
        const response = await fetch(
          `/api/evercoin/checkout/status?orderId=${encodeURIComponent(orderId!)}`,
          {
            headers: { Authorization: `Bearer ${session!.access_token}` },
            cache: "no-store"
          }
        );
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;

        if (payload?.status === "paid") {
          window.localStorage.removeItem(PENDING_PAYMENT_KEY);
          setNotice(paymentCopy.paid);
          return;
        }

        if (payload?.status === "expired" || payload?.status === "failed") {
          window.localStorage.removeItem(PENDING_PAYMENT_KEY);
          setNotice(paymentCopy.expired);
          return;
        }

        if (response.ok && attempts < 6) {
          window.setTimeout(checkPending, 3000);
        } else {
          setNotice(paymentCopy.pending);
        }
      } catch {
        if (!cancelled) setNotice(paymentCopy.pending);
      }
    }

    void checkPending();
    return () => {
      cancelled = true;
    };
  }, [
    session?.access_token,
    paymentCopy.expired,
    paymentCopy.paid,
    paymentCopy.pending
  ]);

  const items = useMemo(
    () => [
      {
        icon: MessageCircleMore,
        title: pageCopy.messagesTitle,
        body: pageCopy.messagesBody,
        rate: `1 EverCoin / ${pageCopy.messageUnit}`
      },
      {
        icon: Gift,
        title: pageCopy.giftsTitle,
        body: pageCopy.giftsBody,
        rate: pageCopy.giftRate
      },
      {
        icon: ImageIcon,
        title: pageCopy.imagesTitle,
        body: pageCopy.imagesBody,
        rate: `${imageCost} EverCoin / ${pageCopy.imageUnit}`
      },
      {
        icon: Clapperboard,
        title: pageCopy.videosTitle,
        body: pageCopy.videosBody,
        rate: `${videoCost} EverCoin / ${pageCopy.videoUnit}`
      }
    ],
    [imageCost, pageCopy, videoCost]
  );

  async function buyPack(rail: Rail, pack: Pack) {
    if (!authReady || busyKey) return;

    if (!session?.access_token) {
      openAuthModal();
      return;
    }

    const key = `${rail}:${pack.code}`;
    setBusyKey(key);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/evercoin/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ rail, pack: pack.code })
      });
      const payload = await response.json().catch(() => ({}));

      if (
        !response.ok ||
        payload?.mode !== "redirect" ||
        typeof payload?.url !== "string" ||
        typeof payload?.orderId !== "string"
      ) {
        if (payload?.error === "PAYMENT_RAIL_NOT_CONFIGURED") {
          throw new Error(paymentCopy.unavailable);
        }
        throw new Error(
          localizedErrorMessage(
            payload?.message ?? payload?.error,
            language,
            pageCopy.checkoutFailed,
            "checkout"
          )
        );
      }

      window.localStorage.setItem(PENDING_PAYMENT_KEY, payload.orderId);
      window.location.assign(payload.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error ? checkoutError.message : pageCopy.checkoutFailed
      );
      setBusyKey(null);
    }
  }

  return (
    <main className="px-4 py-10 md:px-6">
      <SectionHeader
        eyebrow="EverCoin"
        title={pageCopy.title}
        description={pageCopy.description}
      />

      {notice && (
        <p className="mx-auto mb-8 max-w-3xl rounded-2xl border border-bond-rose/25 bg-bond-rose/10 px-5 py-3 text-center text-sm text-white">
          {notice}
        </p>
      )}

      {error && (
        <p className="mx-auto mb-8 max-w-3xl rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-3 text-center text-sm text-red-100">
          {error}
        </p>
      )}

      <section className="mx-auto mb-12 max-w-6xl">
        <div className="grid gap-4 md:grid-cols-3">
          {paymentPackages.map((pack) => {
            const key = `bank:${pack.code}`;
            const busy = busyKey === key;
            return (
              <div
                key={key}
                className="eb-neon-card overflow-hidden rounded-[2rem] bg-white/[0.035] p-4 text-center"
              >
                <div className="overflow-hidden rounded-[1.55rem] border border-bond-rose/45 bg-black">
                  <img
                    src={pack.image}
                    alt={`${pack.amount.toLocaleString(locale)} EverCoin`}
                    className="h-80 w-full object-cover"
                  />
                </div>

                <p className="mt-5 font-display text-5xl font-bold text-bond-rose drop-shadow-[0_0_18px_rgba(255,92,168,0.55)]">
                  {pack.amount.toLocaleString(locale)}
                </p>
                <p className="mt-2 text-lg text-white">EverCoin</p>
                <p className="mt-2 text-2xl font-bold text-white">{pack.price}</p>

                <button
                  type="button"
                  onClick={() => void buyPack("bank", pack)}
                  disabled={!authReady || Boolean(busyKey) || !paymentReady}
                  className="bond-pink-button mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-bond-rose/15 px-5 py-3 text-base font-bold text-bond-rose disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {busy && <LoaderCircle size={18} className="animate-spin" />}
                  {paymentReady ? bankCopy.title : paymentCopy.unavailable}
                </button>
              </div>
            );
          })}
        </div>
      </section>

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
              <p className="mt-3 text-sm leading-6 text-bond-muted">{item.body}</p>
              <p className="mt-4 inline-flex rounded-full border border-bond-rose/35 bg-bond-rose/10 px-3 py-1.5 text-sm font-bold text-bond-rose">
                {item.rate}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
