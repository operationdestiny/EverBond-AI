export type EverCoinPackCode = "500" | "1000" | "5000";

export type EverCoinPack = {
  code: EverCoinPackCode;
  coins: number;
  displayPrice: string;
  amountMinor: number;
  priceEnv: string;
};

export const EVERCOIN_PACKS: Record<EverCoinPackCode, EverCoinPack> = {
  "500": {
    code: "500",
    coins: 500,
    displayPrice: "$4.99",
    amountMinor: 499,
    priceEnv: "STRIPE_PRICE_EVERCOIN_500"
  },
  "1000": {
    code: "1000",
    coins: 1_000,
    displayPrice: "$9.99",
    amountMinor: 999,
    priceEnv: "STRIPE_PRICE_EVERCOIN_1000"
  },
  "5000": {
    code: "5000",
    coins: 5_000,
    displayPrice: "$44.99",
    amountMinor: 4_499,
    priceEnv: "STRIPE_PRICE_EVERCOIN_5000"
  }
};

export function getEverCoinPack(code: string | null | undefined) {
  if (!code) return null;
  return EVERCOIN_PACKS[code as EverCoinPackCode] ?? null;
}

export function getEverCoinPackPriceId(pack: EverCoinPack) {
  const value = process.env[pack.priceEnv]?.trim();
  return value || null;
}

export function getEverCoinPackByPriceId(priceId: string) {
  return (
    Object.values(EVERCOIN_PACKS).find(
      (pack) => getEverCoinPackPriceId(pack) === priceId
    ) ?? null
  );
}

function cleanSiteUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function safeStripeError(payload: any, status: number) {
  const code =
    typeof payload?.error?.code === "string"
      ? payload.error.code.trim()
      : "unknown_error";

  const detail =
    typeof payload?.error?.message === "string"
      ? payload.error.message.trim()
      : "Stripe rejected the checkout request.";

  return `STRIPE_${status}_${code}: ${detail}`;
}

export async function createEverCoinCheckout(values: {
  pack: EverCoinPack;
  userId: string;
  email?: string | null;
  siteUrl: string;
}) {
  const apiKey = process.env.STRIPE_SECRET_KEY?.trim();
  const priceId = getEverCoinPackPriceId(values.pack);
  const siteUrl = cleanSiteUrl(values.siteUrl);

  if (!apiKey) {
    throw new Error("STRIPE_CONFIG: STRIPE_SECRET_KEY is missing.");
  }

  if (!priceId) {
    throw new Error(
      `STRIPE_CONFIG: ${values.pack.priceEnv} is missing.`
    );
  }

  if (!priceId.startsWith("price_")) {
    throw new Error(
      `STRIPE_CONFIG: ${values.pack.priceEnv} is not a Stripe Price ID.`
    );
  }

  if (!siteUrl.startsWith("https://") && !siteUrl.startsWith("http://localhost")) {
    throw new Error("STRIPE_CONFIG: NEXT_PUBLIC_SITE_URL is invalid.");
  }

  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("line_items[0][price]", priceId);
  body.set("line_items[0][quantity]", "1");
  body.set(
    "success_url",
    `${siteUrl}/coins?checkout=success&session_id={CHECKOUT_SESSION_ID}`
  );
  body.set("cancel_url", `${siteUrl}/coins?checkout=cancelled`);
  body.set("client_reference_id", values.userId);

  if (values.email?.trim()) {
    body.set("customer_email", values.email.trim());
  }

  const metadata: Record<string, string> = {
    kind: "evercoin",
    user_id: values.userId,
    pack_code: values.pack.code,
    coins: String(values.pack.coins)
  };

  for (const [key, value] of Object.entries(metadata)) {
    body.set(`metadata[${key}]`, value);
    body.set(`payment_intent_data[metadata][${key}]`, value);
  }

  const response = await fetch(
    "https://api.stripe.com/v1/checkout/sessions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(20_000)
    }
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(safeStripeError(payload, response.status));
  }

  const checkoutUrl = payload?.url;

  if (
    typeof checkoutUrl !== "string" ||
    !checkoutUrl.startsWith("https://")
  ) {
    throw new Error(
      "STRIPE_CHECKOUT_URL_MISSING: Stripe created the Checkout Session but did not return a hosted URL."
    );
  }

  return checkoutUrl;
}
