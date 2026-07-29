import { getPaddleApiBase } from "@/lib/billing/paddle";

export type EverCoinPackCode = "1000" | "5000" | "10000";

export type EverCoinPack = {
  code: EverCoinPackCode;
  coins: number;
  displayPrice: string;
  priceEnv: string;
};

export const EVERCOIN_PACKS: Record<EverCoinPackCode, EverCoinPack> = {
  "1000": {
    code: "1000",
    coins: 1_000,
    displayPrice: "$10.99",
    priceEnv: "PADDLE_PRICE_EVERCOIN_1000"
  },
  "5000": {
    code: "5000",
    coins: 5_000,
    displayPrice: "$44.99",
    priceEnv: "PADDLE_PRICE_EVERCOIN_5000"
  },
  "10000": {
    code: "10000",
    coins: 10_000,
    displayPrice: "$84.99",
    priceEnv: "PADDLE_PRICE_EVERCOIN_10000"
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

export async function createEverCoinCheckout(values: {
  pack: EverCoinPack;
  userId: string;
  email?: string | null;
}) {
  const apiKey = process.env.PADDLE_API_KEY;
  const priceId = getEverCoinPackPriceId(values.pack);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!apiKey || !priceId) {
    throw new Error("EverCoin checkout is not configured.");
  }

  const response = await fetch(`${getPaddleApiBase()}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      customer: values.email ? { email: values.email } : undefined,
      checkout: { url: `${siteUrl}/coins?checkout=success` },
      custom_data: {
        kind: "evercoin",
        user_id: values.userId,
        pack_code: values.pack.code,
        coins: values.pack.coins
      }
    }),
    signal: AbortSignal.timeout(20_000)
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Paddle checkout failed: ${response.status} ${detail}`);
  }

  const payload = await response.json();
  const checkoutUrl = payload?.data?.checkout?.url;

  if (typeof checkoutUrl !== "string" || !checkoutUrl.startsWith("https://")) {
    throw new Error("Paddle did not return a checkout URL.");
  }

  return checkoutUrl;
}
