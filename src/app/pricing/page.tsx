"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { LocalizedBannerImage } from "@/components/ui/LocalizedBannerImage";

const bundles = [
  {
    name: "Starter Bundle",
    messages: 500,
    code: "500" as const,
    className: "left-[9.7%] top-[66.4%] h-[5%] w-[21.4%]"
  },
  {
    name: "Popular Bundle",
    messages: 1000,
    code: "1000" as const,
    className: "left-[37.2%] top-[66.4%] h-[5%] w-[22.4%]"
  },
  {
    name: "Premium Bundle",
    messages: 1500,
    code: "1500" as const,
    className: "left-[66.2%] top-[66.4%] h-[5%] w-[21.3%]"
  }
];

export default function PricingPage() {
  const { session, authReady, openAuthModal } = useAuth();
  const [busyBundle, setBusyBundle] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function buyBundle(bundle: (typeof bundles)[number]) {
    if (!authReady || busyBundle) return;

    if (!session?.access_token) {
      openAuthModal();
      return;
    }

    setBusyBundle(bundle.code);
    setError("");

    try {
      const response = await fetch("/api/message-bundles/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ bundle: bundle.code })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || typeof payload?.url !== "string") {
        throw new Error(payload?.message || payload?.error || "Checkout failed");
      }

      window.location.assign(payload.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout failed"
      );
      setBusyBundle(null);
    }
  }

  return (
    <AppShell>
      <main className="bg-black">
        <section className="mx-auto flex h-screen items-center justify-center overflow-hidden px-0 py-0">
          <div className="relative inline-block">
            <LocalizedBannerImage
              banner="pricing"
              alt="EverBond one-time message bundles"
              className="block h-auto w-full max-w-[1920px] max-h-screen object-contain"
            />

            {bundles.map((bundle) => (
              <button
                key={bundle.messages}
                type="button"
                onClick={() => void buyBundle(bundle)}
                disabled={!authReady || Boolean(busyBundle)}
                aria-label={`Buy ${bundle.messages.toLocaleString("en-US")} messages`}
                className={`absolute rounded-full focus:outline-none disabled:cursor-wait ${bundle.className}`}
              >
                <span className="sr-only">
                  Buy {bundle.messages.toLocaleString("en-US")} messages
                </span>
                {busyBundle === bundle.code && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-white">
                    <LoaderCircle className="animate-spin" size={18} />
                  </span>
                )}
              </button>
            ))}

            {error && (
              <p className="absolute bottom-[3%] left-1/2 w-[80%] -translate-x-1/2 rounded-xl border border-red-400/25 bg-black/85 px-4 py-2 text-center text-sm text-red-100">
                {error}
              </p>
            )}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
