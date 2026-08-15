const EVERBOND_PWA_VERSION = "everbond-pwa-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // EverBond intentionally does not cache application responses here.
  // Chats, auth, EverCoin, Stripe, Supabase data, generated media, and
  // all other live application state continue to use the network exactly
  // as they do in the normal website.
  event.respondWith(fetch(request));
});

self.addEventListener("message", (event) => {
  if (event.data === "EVERBOND_PWA_VERSION") {
    event.source?.postMessage({
      type: "EVERBOND_PWA_VERSION",
      version: EVERBOND_PWA_VERSION
    });
  }
});
