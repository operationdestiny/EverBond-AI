import { createHmac, timingSafeEqual } from "node:crypto";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const TRIBUTE_API_BASE = "https://tribute.tg/api/v1";
export const TRIBUTE_MIN_AMOUNT_MINOR = 100;
export const TRIBUTE_MAX_AMOUNT_MINOR = 300_000;

export type TributePaymentOrder = {
  id: string;
  user_id: string;
  rail: string;
  provider: string;
  pack_code: string;
  coins: number;
  amount_minor: number;
  currency_code: string;
  status: string;
  provider_reference: string | null;
  checkout_url: string | null;
  provider_state: string | null;
  external_transaction_id: string | null;
  paid_at?: string | null;
};

type TributeCreateResponse = {
  uuid?: string;
  paymentUrl?: string;
  webappPaymentUrl?: string;
};

type TributeStatusResponse = {
  status?: string;
};

function apiKey() {
  const value = process.env.TRIBUTE_API_KEY?.trim();
  if (!value) throw new Error("TRIBUTE_NOT_CONFIGURED");
  return value;
}

export function tributeConfigured() {
  return Boolean(process.env.TRIBUTE_API_KEY?.trim());
}

function validAmountMinor(value: number) {
  return (
    Number.isSafeInteger(value) &&
    value >= TRIBUTE_MIN_AMOUNT_MINOR &&
    value <= TRIBUTE_MAX_AMOUNT_MINOR
  );
}

function cleanOrigin(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" && process.env.NODE_ENV === "production") {
    throw new Error("TRIBUTE_HTTPS_RETURN_URL_REQUIRED");
  }
  return url.origin;
}

async function tributeRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${TRIBUTE_API_BASE}${path}`, {
    ...init,
    headers: {
      "Api-Key": apiKey(),
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {})
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000)
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    const detail =
      typeof payload?.message === "string"
        ? payload.message
        : typeof payload?.error === "string"
          ? payload.error
          : `HTTP_${response.status}`;
    throw new Error(`TRIBUTE_API_FAILED:${detail}`);
  }

  return payload as T;
}

function validPaymentUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "web.tribute.tg") {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

async function updateOrder(orderId: string, values: Record<string, unknown>) {
  const { error } = await getSupabaseServiceClient()
    .from("evercoin_payment_orders")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) throw error;
}

export async function getTributeOrderForUser(orderId: string, userId: string) {
  const { data, error } = await getSupabaseServiceClient()
    .from("evercoin_payment_orders")
    .select(
      "id,user_id,rail,provider,pack_code,coins,amount_minor,currency_code,status,provider_reference,checkout_url,provider_state,external_transaction_id,paid_at"
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .eq("provider", "tribute")
    .maybeSingle();
  if (error) throw error;
  return (data as TributePaymentOrder | null) ?? null;
}

async function getTributeOrderByReference(reference: string) {
  const { data, error } = await getSupabaseServiceClient()
    .from("evercoin_payment_orders")
    .select(
      "id,user_id,rail,provider,pack_code,coins,amount_minor,currency_code,status,provider_reference,checkout_url,provider_state,external_transaction_id,paid_at"
    )
    .eq("provider", "tribute")
    .eq("provider_reference", reference)
    .maybeSingle();
  if (error) throw error;
  return (data as TributePaymentOrder | null) ?? null;
}

export async function createTributeEverCoinCheckout(values: {
  userId: string;
  email: string;
  amountMinor: number;
  origin: string;
}) {
  if (!tributeConfigured()) throw new Error("TRIBUTE_NOT_CONFIGURED");
  if (!validAmountMinor(values.amountMinor)) throw new Error("TRIBUTE_AMOUNT_OUT_OF_RANGE");

  const origin = cleanOrigin(values.origin);
  const supabase = getSupabaseServiceClient();

  const { data: inserted, error: insertError } = await supabase
    .from("evercoin_payment_orders")
    .insert({
      user_id: values.userId,
      rail: "card",
      provider: "tribute",
      pack_code: "custom",
      coins: values.amountMinor,
      amount_minor: values.amountMinor,
      currency_code: "USD",
      status: "pending",
      provider_state: "CREATING"
    })
    .select("id")
    .single();

  if (insertError || !inserted?.id) throw insertError ?? new Error("TRIBUTE_ORDER_INSERT_FAILED");
  const orderId = String(inserted.id);

  try {
    const successUrl = `${origin}/coins?payment=success&orderId=${encodeURIComponent(orderId)}`;
    const failUrl = `${origin}/coins?payment=failed&orderId=${encodeURIComponent(orderId)}`;

    const payload = await tributeRequest<TributeCreateResponse>("/shop/orders", {
      method: "POST",
      body: JSON.stringify({
        amount: values.amountMinor,
        currency: "usd",
        title: `${values.amountMinor.toLocaleString("en-US")} EverCoin`,
        description: "EverCoin for use on EverBond. 1 EverCoin = 1 cent.",
        successUrl,
        failUrl,
        email: values.email,
        customerId: values.userId,
        period: "onetime"
      })
    });

    const reference = typeof payload.uuid === "string" ? payload.uuid.trim() : "";
    const paymentUrl = validPaymentUrl(payload.paymentUrl);
    if (!reference || !paymentUrl) throw new Error("TRIBUTE_INVALID_CREATE_RESPONSE");

    await updateOrder(orderId, {
      provider_reference: reference,
      checkout_url: paymentUrl,
      provider_state: "CREATED"
    });

    return {
      orderId,
      mode: "redirect" as const,
      provider: "tribute" as const,
      url: paymentUrl
    };
  } catch (error) {
    await updateOrder(orderId, {
      status: "failed",
      provider_state: "CREATE_FAILED",
      error_code: error instanceof Error ? error.message.slice(0, 240) : "TRIBUTE_CREATE_FAILED"
    }).catch(() => undefined);
    throw error;
  }
}

function assertWebhookOrderMatches(
  order: TributePaymentOrder,
  payload: Record<string, unknown>
) {
  const amount = Number(payload.amount);
  if (Number.isFinite(amount) && Math.trunc(amount) !== order.amount_minor) {
    throw new Error("TRIBUTE_WEBHOOK_AMOUNT_MISMATCH");
  }

  const currency = typeof payload.currency === "string" ? payload.currency.toUpperCase() : "";
  if (currency && currency !== order.currency_code.toUpperCase()) {
    throw new Error("TRIBUTE_WEBHOOK_CURRENCY_MISMATCH");
  }
}

export async function fulfillTributeOrderByReference(
  reference: string,
  webhookPayload?: Record<string, unknown>
) {
  const order = await getTributeOrderByReference(reference);
  if (!order) throw new Error("TRIBUTE_ORDER_NOT_FOUND");
  if (webhookPayload) assertWebhookOrderMatches(order, webhookPayload);

  if (order.status === "refunded") {
    throw new Error("TRIBUTE_ORDER_ALREADY_REFUNDED");
  }

  const externalId = `tribute:${reference}`;
  const supabase = getSupabaseServiceClient();

  const { error: creditError } = await supabase.rpc("credit_evercoin_purchase", {
    p_user_id: order.user_id,
    p_transaction_id: externalId,
    p_price_id: "tribute:card:custom",
    p_pack_code: "custom",
    p_coins: order.coins,
    p_total_minor: order.amount_minor,
    p_currency_code: order.currency_code
  });
  if (creditError) throw creditError;

  await updateOrder(order.id, {
    status: "paid",
    external_transaction_id: externalId,
    provider_state: "PAID",
    paid_at: order.paid_at || new Date().toISOString(),
    last_checked_at: new Date().toISOString(),
    error_code: null
  });

  return { status: "paid" as const, coins: order.coins, balance: null };
}

export async function reverseTributeOrderByReference(
  reference: string,
  transactionId: string | number | null | undefined,
  webhookPayload?: Record<string, unknown>
) {
  const order = await getTributeOrderByReference(reference);
  if (!order) throw new Error("TRIBUTE_ORDER_NOT_FOUND");
  if (webhookPayload) assertWebhookOrderMatches(order, webhookPayload);
  if (order.status === "refunded") return true;

  const externalId = `tribute:${reference}`;
  const adjustmentId = `tribute-refund:${reference}:${String(transactionId ?? "order")}`;
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase.rpc("reverse_evercoin_purchase", {
    p_transaction_id: externalId,
    p_adjustment_id: adjustmentId,
    p_action: "refund",
    p_status: "approved",
    p_coins: order.coins
  });
  if (error) throw error;

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.reversed && order.status !== "paid") {
    throw new Error("TRIBUTE_REFUND_PURCHASE_NOT_READY");
  }

  await updateOrder(order.id, {
    status: "refunded",
    provider_state: "REFUNDED",
    last_checked_at: new Date().toISOString(),
    error_code: null
  });
  return true;
}

export async function markTributeOrderFailed(reference: string, state = "FAILED") {
  const order = await getTributeOrderByReference(reference);
  if (!order) return false;
  if (order.status !== "pending") return true;

  await updateOrder(order.id, {
    status: "failed",
    provider_state: state,
    last_checked_at: new Date().toISOString()
  });
  return true;
}

export async function refreshTributeOrder(order: TributePaymentOrder) {
  if (order.status === "paid") {
    return { status: "paid" as const, coins: order.coins, balance: null };
  }
  if (order.status === "refunded") {
    return { status: "refunded" as const, coins: 0, balance: null };
  }
  if (order.status === "failed" || order.status === "expired" || order.status === "cancelled") {
    return { status: order.status, coins: 0, balance: null };
  }
  if (!order.provider_reference) {
    return { status: "pending" as const, coins: 0, balance: null };
  }

  const payload = await tributeRequest<TributeStatusResponse>(
    `/shop/orders/${encodeURIComponent(order.provider_reference)}/status`
  );
  const state = String(payload.status ?? "pending").toLowerCase();

  await updateOrder(order.id, {
    provider_state: state.toUpperCase(),
    last_checked_at: new Date().toISOString()
  });

  if (state === "paid") {
    return fulfillTributeOrderByReference(order.provider_reference);
  }
  if (state === "failed" || state === "canceled" || state === "cancelled") {
    await updateOrder(order.id, {
      status: state === "failed" ? "failed" : "cancelled",
      provider_state: state.toUpperCase()
    });
    return { status: state === "failed" ? "failed" : "cancelled", coins: 0, balance: null };
  }

  return { status: "pending" as const, coins: 0, balance: null };
}

export function verifyTributeWebhookSignature(rawBody: string, signatureHeader: string | null) {
  if (!signatureHeader) return false;
  const signature = signatureHeader.trim();
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;

  const expected = createHmac("sha256", apiKey()).update(rawBody, "utf8").digest();
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
