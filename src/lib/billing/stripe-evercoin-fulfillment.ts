import { z } from "zod";
import {
  getEverCoinPack,
  getEverCoinPackByPriceId,
  getEverCoinPackPriceId
} from "@/lib/billing/evercoin-packs";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const UuidSchema = z.string().uuid();

function stripeApiKey() {
  const value = process.env.STRIPE_SECRET_KEY?.trim();
  if (!value) throw new Error("STRIPE_SECRET_KEY_MISSING");
  return value;
}

async function stripeGet(path: string, searchParams?: URLSearchParams) {
  const query = searchParams?.toString();
  const response = await fetch(
    `https://api.stripe.com/v1/${path}${query ? `?${query}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${stripeApiKey()}`,
        Accept: "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000)
    }
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      typeof payload?.error?.message === "string"
        ? payload.error.message.slice(0, 300)
        : "Stripe lookup failed";

    throw new Error(
      `STRIPE_LOOKUP_FAILED:${response.status}:${detail}`
    );
  }

  return payload;
}

export async function fetchStripeCheckoutSession(sessionId: string) {
  const params = new URLSearchParams();
  params.append("expand[]", "line_items");

  return stripeGet(
    `checkout/sessions/${encodeURIComponent(sessionId)}`,
    params
  );
}

function paymentIntentId(session: any) {
  const value = session?.payment_intent;

  if (typeof value === "string") return value;
  if (typeof value?.id === "string") return value.id;

  return null;
}

function lineItemPriceId(session: any) {
  const items = session?.line_items?.data;
  const item = Array.isArray(items) ? items[0] : null;
  const price = item?.price;

  if (typeof price === "string") return price;
  if (typeof price?.id === "string") return price.id;

  return null;
}

function lineItemQuantity(session: any) {
  const items = session?.line_items?.data;
  const item = Array.isArray(items) ? items[0] : null;
  const value = Number(item?.quantity ?? 0);

  return Number.isFinite(value)
    ? Math.trunc(value)
    : 0;
}

export async function creditStripeCheckoutSession(
  sessionId: string
) {
  const session = await fetchStripeCheckoutSession(sessionId);

  if (session?.object !== "checkout.session") {
    throw new Error("INVALID_STRIPE_CHECKOUT_SESSION");
  }

  if (session?.payment_status === "unpaid") {
    return {
      handled: false as const,
      reason: "unpaid"
    };
  }

  if (session?.mode !== "payment") {
    throw new Error("INVALID_STRIPE_CHECKOUT_MODE");
  }

  const metadata = session?.metadata ?? {};

  if (metadata?.kind !== "evercoin") {
    return {
      handled: false as const,
      reason: "not_evercoin"
    };
  }

  const userIdResult = UuidSchema.safeParse(metadata?.user_id);
  const pack = getEverCoinPack(
    String(metadata?.pack_code ?? "")
  );
  const transactionId = paymentIntentId(session);
  const priceId = lineItemPriceId(session);
  const quantity = lineItemQuantity(session);
  const amountTotal = Number(session?.amount_total);
  const currency = String(session?.currency ?? "").toLowerCase();
  const lineItems = session?.line_items?.data;

  if (
    !userIdResult.success ||
    !pack ||
    !transactionId ||
    !priceId ||
    !Array.isArray(lineItems)
  ) {
    throw new Error("INVALID_STRIPE_EVERCOIN_METADATA");
  }

  if (
    lineItems.length !== 1 ||
    quantity !== 1 ||
    Number(metadata?.coins) !== pack.coins ||
    session?.client_reference_id !== userIdResult.data ||
    getEverCoinPackPriceId(pack) !== priceId ||
    getEverCoinPackByPriceId(priceId)?.code !== pack.code ||
    amountTotal !== pack.amountMinor ||
    currency !== "usd"
  ) {
    throw new Error("STRIPE_EVERCOIN_PRICE_MISMATCH");
  }

  const supabase = getSupabaseServiceClient();

  // Existing EverCoin fulfillment is already idempotent by transaction ID.
  // Stripe uses the PaymentIntent ID here as that transaction ID.
  const { error } = await supabase.rpc(
    "credit_evercoin_purchase",
    {
      p_user_id: userIdResult.data,
      p_transaction_id: transactionId,
      p_price_id: priceId,
      p_pack_code: pack.code,
      p_coins: pack.coins,
      p_total_minor: amountTotal,
      p_currency_code: currency.toUpperCase()
    }
  );

  if (error) throw error;

  const { data: wallet, error: walletError } =
    await supabase
      .from("evercoin_wallets")
      .select("balance,debt")
      .eq("user_id", userIdResult.data)
      .maybeSingle();

  if (walletError) throw walletError;

  return {
    handled: true as const,
    coins: pack.coins,
    balance: Number(wallet?.balance ?? 0),
    transactionId
  };
}
