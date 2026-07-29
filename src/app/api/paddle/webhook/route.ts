import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getPaddleApiBase } from "@/lib/billing/paddle";
import { verifyPaddleSignature } from "@/lib/billing/paddle-signature";
import {
  getEverCoinPack,
  getEverCoinPackByPriceId,
  getEverCoinPackPriceId
} from "@/lib/billing/evercoin-packs";
import {
  getMessageBundle,
  getMessageBundleByPriceId,
  getMessageBundlePriceId
} from "@/lib/billing/message-bundles";

export const runtime = "nodejs";

const planLimits: Record<string, number> = {
  standard: 2_000,
  premium: 7_500,
  elite: 20_000
};

const UuidSchema = z.string().uuid();
const REVERSAL_ACTIONS = new Set(["refund", "chargeback"]);

function firstItemPriceId(data: any) {
  const item = Array.isArray(data?.items) ? data.items[0] : null;
  const value = item?.price?.id ?? item?.price_id ?? null;
  return typeof value === "string" ? value : null;
}

function firstItemQuantity(data: any) {
  const item = Array.isArray(data?.items) ? data.items[0] : null;
  const value = Number(item?.quantity ?? 1);
  return Number.isFinite(value) ? Math.trunc(value) : 0;
}

function minorAmount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(Math.trunc(Math.abs(value)), 0);
  }

  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
    return Math.max(Math.abs(Number.parseInt(value, 10)), 0);
  }

  return null;
}

function transactionTotalMinor(data: any) {
  return minorAmount(
    data?.details?.totals?.grand_total ??
      data?.details?.totals?.total ??
      data?.totals?.grand_total ??
      data?.totals?.total
  );
}

function adjustmentTotalMinor(data: any) {
  return minorAmount(
    data?.totals?.grand_total ??
      data?.totals?.total ??
      data?.details?.totals?.grand_total ??
      data?.details?.totals?.total
  );
}

function proportionalReversal(values: {
  granted: number;
  alreadyReversed: number;
  originalTotal: number | null;
  adjustedTotal: number | null;
  full: boolean;
}) {
  const remaining = Math.max(values.granted - values.alreadyReversed, 0);
  if (remaining <= 0) return 0;

  if (
    values.full ||
    !values.originalTotal ||
    values.adjustedTotal === null ||
    values.adjustedTotal <= 0 ||
    values.adjustedTotal >= values.originalTotal
  ) {
    return remaining;
  }

  return Math.min(
    remaining,
    Math.max(
      1,
      Math.ceil(
        (values.granted * values.adjustedTotal) / values.originalTotal
      )
    )
  );
}

async function fetchPaddleTransaction(transactionId: string) {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) throw new Error("PADDLE_API_KEY_MISSING");

  const response = await fetch(
    `${getPaddleApiBase()}/transactions/${encodeURIComponent(transactionId)}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(20_000)
    }
  );

  if (!response.ok) {
    throw new Error(`PADDLE_TRANSACTION_LOOKUP_FAILED:${response.status}`);
  }

  const payload = await response.json();
  return payload?.data ?? null;
}

async function creditEverCoinTransaction(data: any) {
  const customData = data?.custom_data;
  if (customData?.kind !== "evercoin") return false;

  const userIdResult = UuidSchema.safeParse(customData?.user_id);
  const pack = getEverCoinPack(String(customData?.pack_code ?? ""));
  const transactionId = typeof data?.id === "string" ? data.id : null;
  const priceId = firstItemPriceId(data);
  const quantity = firstItemQuantity(data);

  if (!userIdResult.success || !pack || !transactionId || !priceId) {
    throw new Error("INVALID_EVERCOIN_TRANSACTION_METADATA");
  }

  if (
    quantity !== 1 ||
    Number(customData?.coins) !== pack.coins ||
    getEverCoinPackPriceId(pack) !== priceId ||
    getEverCoinPackByPriceId(priceId)?.code !== pack.code
  ) {
    throw new Error("EVERCOIN_PRICE_MISMATCH");
  }

  const { error } = await getSupabaseServiceClient().rpc(
    "credit_evercoin_purchase",
    {
      p_user_id: userIdResult.data,
      p_transaction_id: transactionId,
      p_price_id: priceId,
      p_pack_code: pack.code,
      p_coins: pack.coins,
      p_total_minor: transactionTotalMinor(data),
      p_currency_code:
        typeof data?.currency_code === "string" ? data.currency_code : null
    }
  );

  if (error) throw error;
  return true;
}

async function creditMessageBundleTransaction(data: any) {
  const customData = data?.custom_data;
  if (customData?.kind !== "message_bundle") return false;

  const userIdResult = UuidSchema.safeParse(customData?.user_id);
  const bundle = getMessageBundle(String(customData?.bundle_code ?? ""));
  const transactionId = typeof data?.id === "string" ? data.id : null;
  const priceId = firstItemPriceId(data);
  const quantity = firstItemQuantity(data);

  if (!userIdResult.success || !bundle || !transactionId || !priceId) {
    throw new Error("INVALID_MESSAGE_BUNDLE_TRANSACTION_METADATA");
  }

  if (
    quantity !== 1 ||
    Number(customData?.messages) !== bundle.messages ||
    getMessageBundlePriceId(bundle) !== priceId ||
    getMessageBundleByPriceId(priceId)?.code !== bundle.code
  ) {
    throw new Error("MESSAGE_BUNDLE_PRICE_MISMATCH");
  }

  const { error } = await getSupabaseServiceClient().rpc(
    "credit_message_purchase",
    {
      p_user_id: userIdResult.data,
      p_transaction_id: transactionId,
      p_price_id: priceId,
      p_bundle_code: bundle.code,
      p_messages: bundle.messages,
      p_total_minor: transactionTotalMinor(data),
      p_currency_code:
        typeof data?.currency_code === "string" ? data.currency_code : null
    }
  );

  if (error) throw error;
  return true;
}

async function ensurePurchaseRecorded(transactionId: string) {
  const supabase = getSupabaseServiceClient();
  const [{ data: coinPurchase }, { data: messagePurchase }] =
    await Promise.all([
      supabase
        .from("evercoin_purchases")
        .select(
          "paddle_transaction_id,coins_granted,coins_reversed,transaction_total_minor"
        )
        .eq("paddle_transaction_id", transactionId)
        .maybeSingle(),
      supabase
        .from("message_purchases")
        .select(
          "paddle_transaction_id,messages_granted,messages_reversed,transaction_total_minor"
        )
        .eq("paddle_transaction_id", transactionId)
        .maybeSingle()
    ]);

  if (coinPurchase || messagePurchase) {
    return { coinPurchase, messagePurchase };
  }

  const transaction = await fetchPaddleTransaction(transactionId);
  if (!transaction) return { coinPurchase: null, messagePurchase: null };

  await creditEverCoinTransaction(transaction);
  await creditMessageBundleTransaction(transaction);

  const [{ data: refreshedCoin }, { data: refreshedMessage }] =
    await Promise.all([
      supabase
        .from("evercoin_purchases")
        .select(
          "paddle_transaction_id,coins_granted,coins_reversed,transaction_total_minor"
        )
        .eq("paddle_transaction_id", transactionId)
        .maybeSingle(),
      supabase
        .from("message_purchases")
        .select(
          "paddle_transaction_id,messages_granted,messages_reversed,transaction_total_minor"
        )
        .eq("paddle_transaction_id", transactionId)
        .maybeSingle()
    ]);

  return {
    coinPurchase: refreshedCoin ?? null,
    messagePurchase: refreshedMessage ?? null
  };
}

async function reversePaidCurrencyAdjustment(data: any) {
  const action = String(data?.action ?? "").toLowerCase();
  const status = String(data?.status ?? "").toLowerCase();

  if (!REVERSAL_ACTIONS.has(action) || status !== "approved") return false;

  const adjustmentId = typeof data?.id === "string" ? data.id : null;
  const transactionId =
    typeof data?.transaction_id === "string" ? data.transaction_id : null;
  if (!adjustmentId || !transactionId) return false;

  const { coinPurchase, messagePurchase } =
    await ensurePurchaseRecorded(transactionId);
  const adjustedTotal = adjustmentTotalMinor(data);
  const full = String(data?.type ?? "").toLowerCase() === "full";
  const supabase = getSupabaseServiceClient();
  let handled = false;

  if (coinPurchase) {
    const coins = proportionalReversal({
      granted: Number(coinPurchase.coins_granted ?? 0),
      alreadyReversed: Number(coinPurchase.coins_reversed ?? 0),
      originalTotal: minorAmount(coinPurchase.transaction_total_minor),
      adjustedTotal,
      full
    });

    if (coins > 0) {
      const { error } = await supabase.rpc("reverse_evercoin_purchase", {
        p_transaction_id: transactionId,
        p_adjustment_id: adjustmentId,
        p_action: action,
        p_status: status,
        p_coins: coins
      });
      if (error) throw error;
    }
    handled = true;
  }

  if (messagePurchase) {
    const messages = proportionalReversal({
      granted: Number(messagePurchase.messages_granted ?? 0),
      alreadyReversed: Number(messagePurchase.messages_reversed ?? 0),
      originalTotal: minorAmount(messagePurchase.transaction_total_minor),
      adjustedTotal,
      full
    });

    if (messages > 0) {
      const { error } = await supabase.rpc("reverse_message_purchase", {
        p_transaction_id: transactionId,
        p_adjustment_id: adjustmentId,
        p_action: action,
        p_status: status,
        p_messages: messages
      });
      if (error) throw error;
    }
    handled = true;
  }

  return handled;
}

async function preserveLegacySubscriptionEvent(eventType: string, data: any) {
  if (!eventType.startsWith("subscription.")) return;

  const plan =
    data?.custom_data?.plan ||
    data?.items?.[0]?.price?.custom_data?.plan ||
    "standard";
  const userId = data?.custom_data?.user_id ?? null;
  const payload = {
    user_id: userId,
    paddle_customer_id: data?.customer_id ?? null,
    paddle_subscription_id: data?.id,
    plan,
    status: data?.status ?? "unknown",
    monthly_message_limit: planLimits[plan] ?? planLimits.standard,
    current_period_end: data?.current_billing_period?.ends_at ?? null,
    updated_at: new Date().toISOString()
  };

  const { error } = await getSupabaseServiceClient()
    .from("subscriptions")
    .upsert(payload, { onConflict: "paddle_subscription_id" });

  if (error) throw error;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  if (
    !secret ||
    !verifyPaddleSignature(
      rawBody,
      request.headers.get("paddle-signature"),
      secret
    )
  ) {
    return NextResponse.json(
      { error: "Invalid Paddle signature" },
      { status: 401 }
    );
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid Paddle webhook" },
      { status: 400 }
    );
  }

  const eventId = typeof event?.event_id === "string" ? event.event_id : null;
  const eventType =
    typeof event?.event_type === "string" ? event.event_type : null;
  const data = event?.data;

  if (!eventId || !eventType || !data) {
    return NextResponse.json(
      { error: "Invalid Paddle webhook" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServiceClient();

  try {
    const { data: existing, error: existingError } = await supabase
      .from("paddle_events")
      .select("event_id")
      .eq("event_id", eventId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (eventType === "transaction.completed") {
      await creditEverCoinTransaction(data);
      await creditMessageBundleTransaction(data);
    }

    if (
      eventType === "adjustment.created" ||
      eventType === "adjustment.updated"
    ) {
      await reversePaidCurrencyAdjustment(data);
    }

    await preserveLegacySubscriptionEvent(eventType, data);

    const { error: eventInsertError } = await supabase
      .from("paddle_events")
      .upsert(
        {
          event_id: eventId,
          event_type: eventType,
          payload: event
        },
        { onConflict: "event_id", ignoreDuplicates: true }
      );

    if (eventInsertError) throw eventInsertError;
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paddle webhook processing failed:", error);
    return NextResponse.json(
      { error: "Paddle webhook processing failed" },
      { status: 500 }
    );
  }
}
