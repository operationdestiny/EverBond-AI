"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/components/auth/AuthProvider";

declare global {
  interface Window {
    Plaid?: {
      create: (options: {
        token: string;
        receivedRedirectUri?: string;
        onSuccess: (publicToken: string, metadata: any) => void;
        onExit?: (error: any, metadata: any) => void;
      }) => { open: () => void; destroy: () => void };
    };
  }
}

const LINK_TOKEN_KEY = "everbond-plaid-link-token";

function loadPlaidScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Plaid) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("PLAID_SCRIPT_FAILED")), {
        once: true
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("PLAID_SCRIPT_FAILED"));
    document.head.appendChild(script);
  });
}

export default function PlaidOauthPage() {
  const { session, authReady, openAuthModal } = useAuth();
  const [status, setStatus] = useState("Ready to connect the EverBond receiving account.");
  const [busy, setBusy] = useState(false);
  const resumed = useRef(false);

  async function openPlaid(existingToken?: string) {
    if (!session?.access_token) {
      openAuthModal();
      return;
    }

    setBusy(true);
    setStatus("Preparing secure Navy Federal connection...");

    try {
      await loadPlaidScript();

      let token = existingToken;
      if (!token) {
        const response = await fetch("/api/plaid/link-token", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || typeof payload?.linkToken !== "string") {
          throw new Error(payload?.error || "LINK_TOKEN_FAILED");
        }
        token = payload.linkToken;
        window.localStorage.setItem(LINK_TOKEN_KEY, token);
      }

      if (!window.Plaid) throw new Error("PLAID_NOT_LOADED");

      const handler = window.Plaid.create({
        token,
        receivedRedirectUri:
          window.location.search.includes("oauth_state_id=") ? window.location.href : undefined,
        onSuccess: async (publicToken, metadata) => {
          setStatus("Saving the authorized business checking account...");
          const selectedAccountId =
            Array.isArray(metadata?.accounts) && metadata.accounts.length
              ? metadata.accounts[0]?.id
              : null;

          const response = await fetch("/api/plaid/exchange", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              publicToken,
              selectedAccountId,
              institutionId: metadata?.institution?.institution_id ?? null,
              institutionName: metadata?.institution?.name ?? null
            })
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok || payload?.connected !== true) {
            setStatus("Connection failed. Please try again.");
            setBusy(false);
            return;
          }

          window.localStorage.removeItem(LINK_TOKEN_KEY);
          setStatus(
            `Connected: ${payload.accountName || "business checking"}${
              payload.accountMask ? ` ••••${payload.accountMask}` : ""
            }. EverBond can now monitor incoming payments.`
          );
          setBusy(false);
        },
        onExit: (error) => {
          if (error) setStatus("Plaid connection was not completed. Please try again.");
          else setStatus("Connection closed.");
          setBusy(false);
        }
      });

      handler.open();
    } catch (error) {
      console.error(error);
      setStatus("Could not start the Plaid connection.");
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!authReady || !session?.access_token || resumed.current) return;
    if (!window.location.search.includes("oauth_state_id=")) return;

    const token = window.localStorage.getItem(LINK_TOKEN_KEY);
    if (!token) {
      setStatus("The bank authorization session expired. Start the connection again.");
      return;
    }

    resumed.current = true;
    void openPlaid(token);
  }, [authReady, session?.access_token]);

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-7">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-bond-rose">
            EverBond Owner Setup
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white">
            Connect Navy Federal
          </h1>
          <p className="mt-4 leading-7 text-bond-muted">
            This connects only EverBond&apos;s own receiving business account. Plaid is
            used read-only for bank details and incoming-transaction reconciliation. It
            does not move customer money.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white">
            {status}
          </div>

          <button
            type="button"
            onClick={() => void openPlaid()}
            disabled={busy || !authReady}
            className="bond-pink-button mt-6 w-full rounded-xl px-5 py-3 font-bold disabled:opacity-50"
          >
            {session ? "Connect Navy Federal Business Checking" : "Sign in to continue"}
          </button>
        </div>
      </main>
    </AppShell>
  );
}
