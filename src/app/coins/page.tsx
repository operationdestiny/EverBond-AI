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
import { TRIBUTE_PAYMENT_COPY } from "@/lib/tribute-payment-language";
import {
  LOCALE_BY_LANGUAGE,
  localizedErrorMessage
} from "@/lib/final-localization-language";

const PENDING_PAYMENT_KEY = "everbond-pending-evercoin-payment";
const MIN_AMOUNT_MINOR = 100;
const MAX_AMOUNT_MINOR = 300_000;

function parseUsdMinor(value: string) {
  const normalized = value.trim().replace(/[$,\s]/g, "");
  const match = /^(\d+)(?:\.(\d{0,2}))?$/.exec(normalized);
  if (!match) return null;

  const dollars = Number.parseInt(match[1], 10);
  const cents = (match[2] || "").padEnd(2, "0");
  const amount = dollars * 100 + Number.parseInt(cents || "0", 10);
  return Number.isSafeInteger(amount) ? amount : null;
}

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
  const tributeCopy = TRIBUTE_PAYMENT_COPY[language] ?? TRIBUTE_PAYMENT_COPY.EN;
  const locale = LOCALE_BY_LANGUAGE[language] ?? LOCALE_BY_LANGUAGE.EN;
  const { session, authReady, openAuthModal } = useAuth();

  const [amountInput, setAmountInput] = useState("20.00");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [imageCost, setImageCost] = useState(20);
  const [videoCost, setVideoCost] = useState(90);
  const [paymentReady, setPaymentReady] = useState(false);

  const requestedMinor = useMemo(() => parseUsdMinor(amountInput), [amountInput]);

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

      setPaymentReady(checkout?.tribute === true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session?.access_token || typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const returnedOrderId = params.get("orderId") || "";
    const storedOrderId = window.localStorage.getItem(PENDING_PAYMENT_KEY) || "";
    const orderId = returnedOrderId || storedOrderId;
    if (!orderId) return;

    if (returnedOrderId) {
      window.localStorage.setItem(PENDING_PAYMENT_KEY, returnedOrderId);
    }

    let cancelled = false;
    let attempts = 0;

    async function checkPending() {
      if (cancelled) return;
      attempts += 1;

      try {
        const response = await fetch(
          `/api/evercoin/checkout/status?orderId=${encodeURIComponent(orderId)}`,
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

        if (
          payload?.status === "expired" ||
          payload?.status === "failed" ||
          payload?.status === "cancelled" ||
          payload?.status === "refunded"
        ) {
          window.localStorage.removeItem(PENDING_PAYMENT_KEY);
          setNotice(paymentCopy.expired);
          return;
        }

        if (response.ok && attempts < 8) {
          window.setTimeout(checkPending, 2000);
        } else if (response.ok) {
          setNotice(paymentCopy.pending);
        }
      } catch {
        if (!cancelled && attempts < 8) {
          window.setTimeout(checkPending, 2500);
        }
      }
    }

    void checkPending();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token, paymentCopy.expired, paymentCopy.paid, paymentCopy.pending]);

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

  async function startTributePayment() {
    if (!authReady || busy) return;

    if (!session?.access_token) {
      openAuthModal();
      return;
    }

    if (
      !requestedMinor ||
      requestedMinor < MIN_AMOUNT_MINOR ||
      requestedMinor > MAX_AMOUNT_MINOR
    ) {
      setError(tributeCopy.invalidAmount);
      return;
    }

    setBusy(true);
    setError("");
    setNotice(tributeCopy.opening);

    try {
      const response = await fetch("/api/evercoin/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ amountMinor: requestedMinor })
      });

      const payload = await response.json().catch(() => ({}));
      if (
        !response.ok ||
        payload?.mode !== "redirect" ||
        payload?.provider !== "tribute" ||
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
      setNotice("");
      setBusy(false);
    }
  }

  function setQuickAmount(value: string) {
    if (busy) return;
    setAmountInput(value);
    setError("");
    setNotice("");
  }

  return (
    <main className="px-4 py-10 md:px-6">
      <SectionHeader
        eyebrow="EverCoin"
        title={pageCopy.title}
        description={pageCopy.description}
      />

      <section className="mx-auto mb-12 max-w-3xl">
        <div className="eb-neon-card rounded-[2rem] bg-white/[0.035] p-6 text-center md:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-bond-rose">
            {tributeCopy.customRate}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white">
            {tributeCopy.customTitle}
          </h2>
          <p className="mt-3 text-bond-muted">{tributeCopy.customPrompt}</p>

          <div className="mx-auto mt-7 max-w-md">
            <label className="relative block">
              <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-white">
                $
              </span>
              <input
                inputMode="decimal"
                value={amountInput}
                onChange={(event: { target: { value: string } }) => {
                  setAmountInput(event.target.value);
                  setError("");
                  setNotice("");
                }}
                placeholder={tributeCopy.customPlaceholder}
                disabled={busy}
                className="w-full rounded-2xl border border-bond-rose/35 bg-black/35 py-4 pl-11 pr-5 text-center font-display text-3xl font-bold text-white outline-none transition focus:border-bond-rose disabled:opacity-60"
                aria-label={tributeCopy.customPrompt}
              />
            </label>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {["5.00", "10.00", "20.00", "50.00"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setQuickAmount(value)}
                  disabled={busy}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2.5 text-sm font-bold text-white hover:border-bond-rose/45 disabled:opacity-50"
                >
                  ${Number(value).toFixed(0)}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-bond-rose/25 bg-bond-rose/10 px-5 py-4">
              <p className="text-sm text-bond-muted">{tributeCopy.youReceive}</p>
              <p className="mt-1 font-display text-4xl font-bold text-bond-rose">
                {(requestedMinor && requestedMinor >= MIN_AMOUNT_MINOR
                  ? requestedMinor
                  : 0
                ).toLocaleString(locale)}{" "}
                EverCoin
              </p>
            </div>

            <button
              type="button"
              onClick={() => void startTributePayment()}
              disabled={!authReady || busy || !paymentReady}
              className="bond-pink-button mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-base font-bold disabled:cursor-not-allowed disabled:opacity-55"
            >
              {busy && <LoaderCircle size={18} className="animate-spin" />}
              {paymentReady ? tributeCopy.continue : paymentCopy.unavailable}
            </button>

            <p className="mt-3 text-xs text-bond-muted">{tributeCopy.secureNote}</p>

            {notice && (
              <p className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
                {notice}
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            )}
          </div>
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
