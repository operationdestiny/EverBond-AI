"use client";

import Script from "next/script";
import {
  useCallback,
  useEffect,
  useRef
} from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type PaddleEvent = {
  name?: string;
  data?: {
    transaction_id?: string;
  };
};

type PaddleCheckoutSettings = {
  displayMode?: "overlay" | "inline";
  theme?: "light" | "dark";
};

type PaddleBrowserApi = {
  Environment: {
    set(environment: "sandbox"): void;
  };
  Initialize(options: {
    token: string;
    checkout?: {
      settings?: PaddleCheckoutSettings;
    };
    eventCallback?: (event: PaddleEvent) => void;
  }): void;
};

declare global {
  interface Window {
    Paddle?: PaddleBrowserApi;
    __everbondPaddleInitialized?: boolean;
  }
}

const PADDLE_SCRIPT =
  "https://cdn.paddle.com/paddle/v2/paddle.js";

const CLIENT_TOKEN =
  process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim() ?? "";

const PENDING_TRANSACTION_KEY =
  "everbond:paddle:pending-evercoin-transaction";

const FINALIZE_ATTEMPTS = 12;
const FINALIZE_RETRY_MS = 1500;

function wait(milliseconds: number) {
  return new Promise((resolve) =>
    window.setTimeout(resolve, milliseconds)
  );
}

function cleanCheckoutUrl(state: "success" | "pending") {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.delete("_ptxn");
  nextUrl.searchParams.set("checkout", state);

  return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
}

async function accessToken() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function finalizeEverCoinTransaction(
  transactionId: string
) {
  for (
    let attempt = 0;
    attempt < FINALIZE_ATTEMPTS;
    attempt += 1
  ) {
    const token = await accessToken();

    if (!token) {
      return {
        credited: false,
        retryable: true
      };
    }

    try {
      const response = await fetch(
        "/api/evercoin/checkout/finalize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ transactionId }),
          cache: "no-store"
        }
      );

      const payload = await response
        .json()
        .catch(() => ({}));

      if (
        response.ok &&
        payload?.status === "credited"
      ) {
        return {
          credited: true,
          retryable: false
        };
      }

      if (
        response.status !== 202 ||
        payload?.status !== "pending"
      ) {
        console.error(
          "EverCoin checkout recovery failed:",
          payload?.message ??
            payload?.error ??
            response.status
        );

        return {
          credited: false,
          retryable: false
        };
      }
    } catch (error) {
      console.error(
        "EverCoin checkout recovery request failed:",
        error
      );
    }

    if (attempt < FINALIZE_ATTEMPTS - 1) {
      await wait(FINALIZE_RETRY_MS);
    }
  }

  return {
    credited: false,
    retryable: true
  };
}

export function PaddleCheckoutBridge() {
  const recoveryRunningRef = useRef(false);

  const recoverTransaction = useCallback(
    async (
      transactionId: string,
      redirectAfter: boolean
    ) => {
      if (
        !/^txn_[a-z0-9]{26}$/.test(transactionId) ||
        recoveryRunningRef.current
      ) {
        return;
      }

      recoveryRunningRef.current = true;

      try {
        window.sessionStorage.setItem(
          PENDING_TRANSACTION_KEY,
          transactionId
        );

        const result =
          await finalizeEverCoinTransaction(transactionId);

        if (result.credited) {
          window.sessionStorage.removeItem(
            PENDING_TRANSACTION_KEY
          );

          if (redirectAfter) {
            window.location.replace(
              cleanCheckoutUrl("success")
            );
          }
          return;
        }

        if (redirectAfter) {
          window.location.replace(
            cleanCheckoutUrl("pending")
          );
        }
      } finally {
        recoveryRunningRef.current = false;
      }
    },
    []
  );

  useEffect(() => {
    const pending =
      window.sessionStorage.getItem(
        PENDING_TRANSACTION_KEY
      );

    if (pending) {
      void recoverTransaction(pending, false);
    }
  }, [recoverTransaction]);

  const initializePaddle = useCallback(() => {
    if (
      !CLIENT_TOKEN ||
      !window.Paddle ||
      window.__everbondPaddleInitialized
    ) {
      return;
    }

    const sandbox = CLIENT_TOKEN.startsWith("test_");

    if (sandbox) {
      window.Paddle.Environment.set("sandbox");
    }

    window.Paddle.Initialize({
      token: CLIENT_TOKEN,
      checkout: {
        settings: {
          displayMode: "overlay",
          theme: "dark"
        }
      },
      eventCallback: (event) => {
        if (event?.name !== "checkout.completed") {
          return;
        }

        const transactionId =
          event.data?.transaction_id;

        if (
          typeof transactionId !== "string" ||
          !transactionId
        ) {
          console.error(
            "Paddle checkout completed without transaction_id."
          );
          return;
        }

        // Do not trust the browser for fulfillment. The browser supplies only
        // the Paddle transaction ID. The authenticated server retrieves the
        // transaction directly from Paddle and verifies user, pack, price,
        // quantity, coin amount, and completed status before crediting.
        void recoverTransaction(
          transactionId,
          true
        );
      }
    });

    window.__everbondPaddleInitialized = true;
  }, [recoverTransaction]);

  if (!CLIENT_TOKEN) return null;

  return (
    <Script
      id="everbond-paddle-js"
      src={PADDLE_SCRIPT}
      strategy="afterInteractive"
      onReady={initializePaddle}
    />
  );
}
