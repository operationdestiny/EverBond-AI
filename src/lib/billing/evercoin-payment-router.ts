import { getSupabaseServiceClient } from "@/lib/supabase/server";
import {
  bankRailConfigured,
  refreshAndReconcileBankPayments
} from "@/lib/plaid-bank";
import {
  getEverCoinPack,
  isEverCoinCardPack,
  isEverCoinCryptoPack,
  type EverCoinPack
} from "@/lib/billing/evercoin-packs";

export type EverCoinPaymentRail = "bank" | "card" | "crypto";
export type EverCoinPaymentProvider = "direct_bank" | "payram";

export type PaymentOrder = {
  id: string;
  user_id: string;
  rail: EverCoinPaymentRail;
  provider: EverCoinPaymentProvider;
  pack_code: string;
  coins: number;
  amount_minor: number;
  currency_code: string;
  status: string;
  provider_reference: string | null;
  checkout_url: string | null;
  provider_state: string | null;
};

type CheckoutResult = {
  orderId: string;
  mode: "redirect";
  provider: EverCoinPaymentProvider;
  url: string;
};

function cleanBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function decimalFromMinor(amountMinor: number) {
  return (amountMinor / 100).toFixed(2);
}

function parseUsdMinor(value: unknown) {
  const text = String(value ?? "").trim();
  const match = /^(\d+)(?:\.(\d{1,6}))?$/.exec(text);
  if (!match) return null;
  const dollars = Number.parseInt(match[1], 10);
  const cents = (match[2] ?? "").padEnd(2, "0").slice(0, 2);
  const minor = dollars * 100 + Number.parseInt(cents || "0", 10);
  return Number.isSafeInteger(minor) ? minor : null;
}

function paymentPack(rail: EverCoinPaymentRail, code: string) {
  const allowed =
    rail === "crypto" ? isEverCoinCryptoPack(code) : isEverCoinCardPack(code);
  const pack = allowed ? getEverCoinPack(code) : null;
  if (!pack) throw new Error("INVALID_EVERCOIN_PAYMENT_PACK");
  return pack;
}

function payRamConfig(rail: "card" | "crypto") {
  const baseUrl = process.env.PAYRAM_BASE_URL?.trim();
  const apiKey =
    rail === "card"
      ? process.env.PAYRAM_CARD_API_KEY?.trim()
      : process.env.PAYRAM_CRYPTO_API_KEY?.trim();

  if (!baseUrl || !apiKey) return null;
  const normalized = cleanBaseUrl(baseUrl);
  if (process.env.NODE_ENV === "production" && !normalized.startsWith("https://")) {
    throw new Error("PAYRAM_HTTPS_REQUIRED");
  }
  return { baseUrl: normalized, apiKey };
}

function validPayRamCheckoutUrl(baseUrl: string, value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const checkout = new URL(value.trim());
    const base = new URL(baseUrl);
    if (checkout.protocol !== "https:" && process.env.NODE_ENV === "production") return "";
    if (checkout.protocol !== "https:" && checkout.protocol !== "http:") return "";
    if (checkout.hostname.toLowerCase() !== base.hostname.toLowerCase()) return "";
    return checkout.toString();
  } catch {
    return "";
  }
}

async function insertOrder(values: {
  userId: string;
  rail: EverCoinPaymentRail;
  provider: EverCoinPaymentProvider;
  pack: EverCoinPack;
  providerReference?: string | null;
  checkoutUrl?: string | null;
}) {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("evercoin_payment_orders")
    .insert({
      user_id: values.userId,
      rail: values.rail,
      provider: values.provider,
      pack_code: values.pack.code,
      coins: values.pack.coins,
      amount_minor: values.pack.amountMinor,
      currency_code: "USD",
      status: "pending",
      provider_reference: values.providerReference || null,
      checkout_url: values.checkoutUrl || null,
      provider_state: values.provider === "direct_bank" ? "AWAITING_TRANSFER" : null
    })
    .select(
      "id,user_id,rail,provider,pack_code,coins,amount_minor,currency_code,status,provider_reference,checkout_url,provider_state"
    )
    .single();

  if (error) throw error;
  return data as PaymentOrder;
}

async function updateOrder(orderId: string, values: Record<string, unknown>) {
  const { error } = await getSupabaseServiceClient()
    .from("evercoin_payment_orders")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) throw error;
}

function makeBankReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "EVB-";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

async function createDirectBankCheckout(values: {
  pack: EverCoinPack;
  userId: string;
}): Promise<CheckoutResult> {
  if (!(await bankRailConfigured())) throw new Error("BANK_RAIL_NOT_CONFIGURED");

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const reference = makeBankReference();
    try {
      const order = await insertOrder({
        userId: values.userId,
        rail: "bank",
        provider: "direct_bank",
        pack: values.pack,
        providerReference: reference
      });
      const url = `/bank-pay?orderId=${encodeURIComponent(order.id)}`;
      await updateOrder(order.id, { checkout_url: url });
      return {
        orderId: order.id,
        mode: "redirect",
        provider: "direct_bank",
        url
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("BANK_REFERENCE_CREATE_FAILED");
}

async function createPayRamCheckout(values: {
  rail: "card" | "crypto";
  pack: EverCoinPack;
  userId: string;
  email: string;
}): Promise<CheckoutResult> {
  const config = payRamConfig(values.rail);
  if (!config) throw new Error("PAYRAM_NOT_CONFIGURED");

  const order = await insertOrder({
    userId: values.userId,
    rail: values.rail,
    provider: "payram",
    pack: values.pack
  });

  try {
    const response = await fetch(`${config.baseUrl}/api/v1/payment`, {
      method: "POST",
      headers: {
        "API-Key": config.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        customerEmail: values.email,
        customerID: values.userId,
        amountInUSD: Number(decimalFromMinor(values.pack.amountMinor))
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000)
    });

    const payload = await response.json().catch(() => null);
    const reference =
      typeof payload?.reference_id === "string"
        ? payload.reference_id.trim()
        : typeof payload?.referenceID === "string"
          ? payload.referenceID.trim()
          : "";
    const url = validPayRamCheckoutUrl(config.baseUrl, payload?.url);

    if (!response.ok || !reference || !url) {
      throw new Error(`PAYRAM_CREATE_FAILED:${response.status}`);
    }

    await updateOrder(order.id, {
      provider_reference: reference,
      checkout_url: url,
      provider_state: "OPEN"
    });

    return { orderId: order.id, mode: "redirect", provider: "payram", url };
  } catch (error) {
    await updateOrder(order.id, {
      status: "failed",
      error_code:
        error instanceof Error ? error.message.slice(0, 240) : "PAYRAM_CREATE_FAILED"
    }).catch(() => undefined);
    throw error;
  }
}

export async function createEverCoinPaymentCheckout(values: {
  rail: EverCoinPaymentRail;
  packCode: string;
  userId: string;
  email: string;
}) {
  const pack = paymentPack(values.rail, values.packCode);
  if (values.rail === "bank") {
    return createDirectBankCheckout({ pack, userId: values.userId });
  }
  return createPayRamCheckout({
    rail: values.rail,
    pack,
    userId: values.userId,
    email: values.email
  });
}

async function creditOrder(order: PaymentOrder, transactionId: string) {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.rpc("credit_evercoin_purchase", {
    p_user_id: order.user_id,
    p_transaction_id: transactionId,
    p_price_id: `${order.provider}:${order.rail}:${order.pack_code}`,
    p_pack_code: order.pack_code,
    p_coins: order.coins,
    p_total_minor: order.amount_minor,
    p_currency_code: order.currency_code
  });
  if (error) throw error;

  await updateOrder(order.id, {
    status: "paid",
    external_transaction_id: transactionId,
    paid_at: new Date().toISOString(),
    error_code: null
  });

  const { data: wallet, error: walletError } = await supabase
    .from("evercoin_wallets")
    .select("balance,debt")
    .eq("user_id", order.user_id)
    .maybeSingle();
  if (walletError) throw walletError;

  return { status: "paid" as const, coins: order.coins, balance: Number(wallet?.balance ?? 0) };
}

async function refreshPayRamOrder(order: PaymentOrder) {
  if (order.rail !== "card" && order.rail !== "crypto") {
    throw new Error("PAYRAM_INVALID_RAIL");
  }
  const config = payRamConfig(order.rail);
  if (!config || !order.provider_reference) throw new Error("PAYRAM_ORDER_NOT_CONFIGURED");

  const response = await fetch(
    `${config.baseUrl}/api/v1/payment/reference/${encodeURIComponent(order.provider_reference)}`,
    {
      headers: { "API-Key": config.apiKey, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000)
    }
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) throw new Error(`PAYRAM_STATUS_FAILED:${response.status}`);

  const state = String(
    payload.paymentState ?? payload.payment_state ?? payload.status ?? "OPEN"
  ).toUpperCase();
  const invoiceMinor = parseUsdMinor(payload.amountInUSD ?? payload.amount_in_usd);
  const customerId = String(payload.customerID ?? payload.customerId ?? "").trim();

  if (invoiceMinor !== null && invoiceMinor !== order.amount_minor) {
    throw new Error("PAYRAM_AMOUNT_MISMATCH");
  }
  if (customerId && customerId !== order.user_id) throw new Error("PAYRAM_USER_MISMATCH");

  await updateOrder(order.id, {
    provider_state: state,
    last_checked_at: new Date().toISOString()
  });

  if (state === "FILLED" || state === "OVER_FILLED") {
    const filledMinor = parseUsdMinor(payload.filled_amount_in_usd ?? payload.filledAmountInUSD);
    if (filledMinor !== null && filledMinor < order.amount_minor) {
      throw new Error("PAYRAM_UNDERPAYMENT");
    }
    return creditOrder(order, `payram:${order.provider_reference}`);
  }

  if (state === "CANCELLED" || state === "CANCELED") {
    await updateOrder(order.id, { status: "expired" });
    return { status: "expired" as const, coins: 0, balance: null };
  }
  return { status: "pending" as const, coins: 0, balance: null };
}

export async function getPaymentOrderForUser(orderId: string, userId: string) {
  const { data, error } = await getSupabaseServiceClient()
    .from("evercoin_payment_orders")
    .select(
      "id,user_id,rail,provider,pack_code,coins,amount_minor,currency_code,status,provider_reference,checkout_url,provider_state"
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as PaymentOrder | null) ?? null;
}

export async function getPaymentOrderByProviderReference(
  provider: EverCoinPaymentProvider,
  reference: string
) {
  const { data, error } = await getSupabaseServiceClient()
    .from("evercoin_payment_orders")
    .select(
      "id,user_id,rail,provider,pack_code,coins,amount_minor,currency_code,status,provider_reference,checkout_url,provider_state"
    )
    .eq("provider", provider)
    .eq("provider_reference", reference)
    .maybeSingle();
  if (error) throw error;
  return (data as PaymentOrder | null) ?? null;
}

export async function refreshEverCoinPaymentOrder(order: PaymentOrder) {
  if (order.status === "paid") {
    return { status: "paid" as const, coins: order.coins, balance: null };
  }
  if (order.status === "expired" || order.status === "failed") {
    return { status: order.status as "expired" | "failed", coins: 0, balance: null };
  }

  if (order.provider === "direct_bank") {
    await refreshAndReconcileBankPayments();
    const latest = await getPaymentOrderForUser(order.id, order.user_id);
    if (latest?.status === "paid") {
      return { status: "paid" as const, coins: latest.coins, balance: null };
    }
    return { status: "pending" as const, coins: 0, balance: null };
  }

  return refreshPayRamOrder(order);
}

export async function configuredPaymentRails() {
  return {
    bank: await bankRailConfigured(),
    card: Boolean(payRamConfig("card")),
    crypto: Boolean(payRamConfig("crypto"))
  };
}
