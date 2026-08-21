"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSiteLanguage } from "@/lib/site-language";
import { BANK_PAYMENT_COPY } from "@/lib/bank-payment-language";

type BankDetails = {
  orderId: string;
  status: string;
  coins: number;
  amountMinor: number;
  currency: string;
  reference: string;
  bank: {
    bankName: string;
    accountName: string;
    accountMask: string;
    routingNumber: string;
    accountNumber: string;
  };
};

type BankChoice = {
  name: string;
  domain: string;
  url: string;
  short: string;
};

const BANKS: BankChoice[] = [
  { name: "Chase", domain: "chase.com", url: "https://www.chase.com/", short: "C" },
  { name: "Bank of America", domain: "bankofamerica.com", url: "https://www.bankofamerica.com/", short: "BOA" },
  { name: "Wells Fargo", domain: "wellsfargo.com", url: "https://www.wellsfargo.com/", short: "WF" },
  { name: "Capital One", domain: "capitalone.com", url: "https://www.capitalone.com/", short: "C1" },
  { name: "Truist", domain: "truist.com", url: "https://www.truist.com/", short: "T" },
  { name: "TD Bank", domain: "td.com", url: "https://www.td.com/us/en/personal-banking", short: "TD" },
  { name: "Regions Bank", domain: "regions.com", url: "https://www.regions.com/", short: "R" },
  { name: "Fifth Third Bank", domain: "53.com", url: "https://www.53.com/", short: "5/3" },
  { name: "Huntington Bank", domain: "huntington.com", url: "https://www.huntington.com/", short: "H" },
  { name: "Ally Bank", domain: "ally.com", url: "https://www.ally.com/", short: "A" },
  { name: "Discover Bank", domain: "discover.com", url: "https://www.discover.com/online-banking/", short: "D" },
  { name: "Charles Schwab Bank", domain: "schwab.com", url: "https://www.schwab.com/", short: "CS" },
  { name: "PNC", domain: "pnc.com", url: "https://www.pnc.com/", short: "PNC" },
  { name: "U.S. Bank", domain: "usbank.com", url: "https://www.usbank.com/", short: "USB" },
  { name: "Navy Federal", domain: "navyfederal.org", url: "https://www.navyfederal.org/", short: "NFCU" }
];

export default function BankPayPage() {
  return (
    <AppShell>
      <BankPayContent />
    </AppShell>
  );
}

function BankPayContent() {
  const { language } = useSiteLanguage();
  const copy = BANK_PAYMENT_COPY[language] ?? BANK_PAYMENT_COPY.EN;
  const { session, authReady, openAuthModal } = useAuth();
  const [details, setDetails] = useState<BankDetails | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  const orderId = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("orderId") || "";
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!session?.access_token) {
      openAuthModal();
      return;
    }
    if (!orderId) {
      setStatus("Missing payment order.");
      return;
    }

    let cancelled = false;
    void fetch(`/api/evercoin/bank/details?orderId=${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store"
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.error || "BANK_DETAILS_FAILED");
        if (!cancelled) {
          setDetails(payload);
          if (payload.status === "paid") setStatus(copy.paid);
        }
      })
      .catch(() => {
        if (!cancelled) setStatus(copy.pending);
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, copy.paid, copy.pending, openAuthModal, orderId, session?.access_token]);

  async function copyValue(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  }

  function paymentDetailsText() {
    if (!details) return "";
    return [
      `Recipient: ${details.bank.accountName}`,
      `Bank: ${details.bank.bankName}`,
      `Routing: ${details.bank.routingNumber}`,
      `Account: ${details.bank.accountNumber}`,
      `Amount: $${(details.amountMinor / 100).toFixed(2)}`,
      `Reference: ${details.reference}`
    ].join("\n");
  }

  async function copyAll(copyKey = "all") {
    const text = paymentDetailsText();
    if (!text) return;
    await copyValue(copyKey, text);
  }

  function prepareBank(bank: BankChoice) {
    setSelectedBank(bank.name);
    const text = paymentDetailsText();
    if (!text) return;

    void navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(`bank:${bank.name}`);
        setStatus(copy.bankCopied.replace("{bank}", bank.name));
        window.setTimeout(() => setCopied(""), 2200);
      })
      .catch(() => {
        setStatus(copy.copyAllFirst);
      });
  }

  async function checkPayment() {
    if (!session?.access_token || !orderId || busy) return;
    setBusy(true);
    setStatus(copy.checking);

    try {
      const response = await fetch(
        `/api/evercoin/checkout/status?orderId=${encodeURIComponent(orderId)}`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store"
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (payload?.status === "paid") {
        setStatus(copy.paid);
        setDetails((current) => (current ? { ...current, status: "paid" } : current));
      } else {
        setStatus(copy.pending);
      }
    } catch {
      setStatus(copy.pending);
    } finally {
      setBusy(false);
    }
  }

  function DetailRow({
    label,
    value,
    copyKey
  }: {
    label: string;
    value: string;
    copyKey: string;
  }) {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-white/10 py-3 last:border-0">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.14em] text-bond-muted">{label}</p>
          <p className="mt-1 break-all font-semibold text-white">{value}</p>
        </div>
        <button
          type="button"
          onClick={() => void copyValue(copyKey, value)}
          className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:border-bond-rose/50"
        >
          {copied === copyKey ? copy.copied : copy.copy}
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-[2rem] border border-bond-rose/30 bg-white/[0.035] p-6 md:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-bond-rose">
          EverCoin
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-4 leading-7 text-bond-muted">{copy.subtitle}</p>

        {!details ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 text-center text-white">
            {status || copy.checking}
          </div>
        ) : (
          <>
            <div className="mt-7 rounded-2xl border border-bond-rose/30 bg-bond-rose/10 p-5 text-center">
              <p className="text-sm text-bond-muted">{copy.amount}</p>
              <p className="mt-1 font-display text-4xl font-bold text-white">
                ${(details.amountMinor / 100).toFixed(2)}
              </p>
              <p className="mt-2 font-bold text-bond-rose">
                {details.coins.toLocaleString()} EverCoin
              </p>
            </div>

            <p className="mt-6 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              {copy.important}
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4">
              <DetailRow label={copy.bank} value={details.bank.bankName} copyKey="bank" />
              <DetailRow label={copy.routing} value={details.bank.routingNumber} copyKey="routing" />
              <DetailRow label={copy.account} value={details.bank.accountNumber} copyKey="account" />
              <DetailRow label={copy.reference} value={details.reference} copyKey="reference" />
            </div>

            <button
              type="button"
              onClick={() => void copyAll()}
              className="mt-4 w-full rounded-xl border border-white/15 px-5 py-3 font-bold text-white hover:border-bond-rose/50"
            >
              {copied === "all" ? copy.copied : copy.copyAll}
            </button>

            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-white">{copy.chooseBank}</h2>
              <p className="mt-2 text-sm leading-6 text-bond-muted">{copy.instructions}</p>
              <div className="mt-4 rounded-2xl border border-bond-rose/25 bg-bond-rose/[0.07] px-4 py-3 text-sm leading-6 text-white">
                {copy.bankPickerHint}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {BANKS.map((bank) => {
                  const isSelected = selectedBank === bank.name;
                  const wasCopied = copied === `bank:${bank.name}`;
                  return (
                    <a
                      key={bank.name}
                      href={bank.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => prepareBank(bank)}
                      className={`group flex min-h-[82px] items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                        isSelected
                          ? "border-bond-rose/55 bg-bond-rose/10"
                          : "border-white/10 bg-white/[0.04] hover:border-bond-rose/45 hover:bg-white/[0.065]"
                      }`}
                    >
                      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white text-[11px] font-black text-black">
                        <span aria-hidden="true">{bank.short}</span>
                        <img
                          src={`https://www.${bank.domain}/favicon.ico`}
                          alt=""
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="absolute inset-0 h-full w-full bg-white object-contain p-1.5"
                          onError={(event: { currentTarget: HTMLImageElement }) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-white">{bank.name}</span>
                        <span className="mt-1 block text-xs text-bond-muted">
                          {wasCopied ? copy.copied : copy.copyAndOpen}
                        </span>
                      </span>
                      <span aria-hidden="true" className="text-xl text-bond-rose transition group-hover:translate-x-0.5">
                        →
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void checkPayment()}
              disabled={busy || details.status === "paid"}
              className="bond-pink-button mt-7 w-full rounded-xl px-5 py-4 text-base font-bold disabled:opacity-55"
            >
              {details.status === "paid" ? copy.paid : busy ? copy.checking : copy.sent}
            </button>

            {status && (
              <p className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center text-sm text-white">
                {status}
              </p>
            )}
          </>
        )}

        <Link
          href="/coins"
          className="mt-6 block text-center text-sm font-semibold text-bond-rose hover:underline"
        >
          {copy.back}
        </Link>
      </div>
    </main>
  );
}
