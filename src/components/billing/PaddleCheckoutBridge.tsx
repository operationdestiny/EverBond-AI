"use client";

import Script from "next/script";
import { useCallback } from "react";

type PaddleEvent = {
  name?: string;
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

export function PaddleCheckoutBridge() {
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
        if (event?.name !== "checkout.completed") return;

        // The webhook owns fulfillment. Give it a brief moment to credit
        // EverCoin, then reload without Paddle's transaction query string so
        // the completed checkout cannot reopen.
        window.setTimeout(() => {
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.delete("_ptxn");
          nextUrl.searchParams.set("checkout", "success");

          window.location.replace(
            `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
          );
        }, 2500);
      }
    });

    window.__everbondPaddleInitialized = true;
  }, []);

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
