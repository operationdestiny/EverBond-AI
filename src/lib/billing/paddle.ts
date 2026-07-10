export type EverBondPlan = "standard" | "premium" | "elite";

const paddlePriceEnv: Record<EverBondPlan, string> = {
  standard: "PADDLE_PRICE_STANDARD",
  premium: "PADDLE_PRICE_PREMIUM",
  elite: "PADDLE_PRICE_ELITE"
};

export function getPaddlePriceId(plan: EverBondPlan) {
  return process.env[paddlePriceEnv[plan]];
}

export function getPaddleApiBase() {
  return process.env.PADDLE_ENVIRONMENT === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

export async function createPaddleCheckoutUrl({ plan, email }: { plan: EverBondPlan; email?: string }) {
  const apiKey = process.env.PADDLE_API_KEY;
  const priceId = getPaddlePriceId(plan);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!apiKey || !priceId) {
    throw new Error("Missing Paddle API key or price ID.");
  }

  const response = await fetch(`${getPaddleApiBase()}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      customer: email ? { email } : undefined,
      checkout: { url: `${siteUrl}/characters?checkout=success` },
      custom_data: { plan }
    })
  });

  if (!response.ok) {
    throw new Error(`Paddle checkout failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const checkoutUrl = data?.data?.checkout?.url;
  if (!checkoutUrl) throw new Error("Paddle did not return a checkout URL.");
  return checkoutUrl as string;
}
