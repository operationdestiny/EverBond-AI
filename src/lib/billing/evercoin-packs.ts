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

function safePaddleError(payload: any, status: number) {
  const code =
    typeof payload?.error?.code === "string"
      ? payload.error.code.trim()
      : "unknown_error";

  const detail =
    typeof payload?.error?.detail === "string"
      ? payload.error.detail.trim()
      : "Paddle rejected the checkout request.";

  return `PADDLE_${status}_${code}: ${detail}`;
}

export async function createEverCoinCheckout(values: {
  pack: EverCoinPack;
  userId: string;
}) {
  const apiKey = process.env.PADDLE_API_KEY?.trim();
  const priceId = getEverCoinPackPriceId(values.pack);

  if (!apiKey) {
    throw new Error("PADDLE_CONFIG: PADDLE_API_KEY is missing.");
  }

  if (!priceId) {
    throw new Error(
      `PADDLE_CONFIG: ${values.pack.priceEnv} is missing.`
    );
  }

  if (!priceId.startsWith("pri_")) {
    throw new Error(
      `PADDLE_CONFIG: ${values.pack.priceEnv} is not a Paddle price ID.`
    );
  }

  const response = await fetch(`${getPaddleApiBase()}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      collection_mode: "automatic",
      custom_data: {
        kind: "evercoin",
        user_id: values.userId,
        pack_code: values.pack.code,
        coins: values.pack.coins
      }
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000)
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(safePaddleError(payload, response.status));
  }

  const checkoutUrl = payload?.data?.checkout?.url;

  if (
    typeof checkoutUrl !== "string" ||
    !checkoutUrl.startsWith("https://")
  ) {
    throw new Error(
      "PADDLE_CHECKOUT_URL_MISSING: Paddle created the transaction but did not return checkout.url."
    );
  }

  return checkoutUrl;
}
