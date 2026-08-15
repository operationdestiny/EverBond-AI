"use client";

import { useEffect } from "react";

export function PwaRuntime() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        updateViaCache: "none"
      })
      .then((registration) => {
        if (!cancelled) {
          void registration.update();
        }
      })
      .catch((error) => {
        console.error("EverBond PWA service worker registration failed:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
