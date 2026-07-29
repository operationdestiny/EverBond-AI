import { getPaddleApiBase } from "@/lib/billing/paddle";

export type MessageBundleCode = "500" | "1000" | "1500";

export type MessageBundle = {
  code: MessageBundleCode;
  messages: number;
  priceEnv: string;
};

export const MESSAGE_BUNDLES: Record<MessageBundleCode, MessageBundle> = {
  "500": {
    code: "500",
    messages: 500,
    priceEnv: "PADDLE_PRICE_MESSAGE_500"
  },
  "1000": {
    code: "1000",
    messages: 1_000,
    priceEnv: "PADDLE_PRICE_MESSAGE_1000"
  },
  "1500": {
    code: "1500",
    messages: 1_500,
    priceEnv: "PADDLE_PRICE_MESSAGE_1500"
  }
};

export function getMessageBundle(code: string | null | undefined) {
  if (!code) return null;
  return MESSAGE_BUNDLES[code as MessageBundleCode] ?? null;
}

export function getMessageBundlePriceId(bundle: MessageBundle) {
  const value = process.env[bundle.priceEnv]?.trim();
  return value || null;
}

export function getMessageBundleByPriceId(priceId: string) {
  return (
    Object.values(MESSAGE_BUNDLES).find(
      (bundle) => getMessageBundlePriceId(bundle) === priceId
    ) ?? null
  );
}

export async function createMessageBundleCheckout(values: {
  bundle: MessageBundle;
  userId: string;
  email?: string | null;
}) {
  const apiKey = process.env.PADDLE_API_KEY;
  const priceId = getMessageBundlePriceId(values.bundle);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!apiKey || !priceId) {
    throw new Error("Message bundle checkout is not configured.");
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
      checkout: { url: `${siteUrl}/pricing?checkout=success` },
      custom_data: {
        kind: "message_bundle",
        user_id: values.userId,
        bundle_code: values.bundle.code,
        messages: values.bundle.messages
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
