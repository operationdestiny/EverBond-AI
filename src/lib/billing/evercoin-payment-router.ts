import { getSupabaseServiceClient } from "@/lib/supabase/server";
import {
  getEverCoinPack,
  isEverCoinCardPack,
  isEverCoinCryptoPack,
  type EverCoinPack
} from "@/lib/billing/evercoin-packs";

export type EverCoinPaymentRail = "card" | "crypto";
export type EverCoinPaymentProvider = "payram" | "btcpay";

type PaymentOrder = {
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

function siteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return value ? cleanBaseUrl(value) : "";
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
    rail === "card" ? isEverCoinCardPack(code) : isEverCoinCryptoPack(code);
  const pack = allowed ? getEverCoinPack(code) : null;
  if (!pack) throw new Error("INVALID_EVERCOIN_PAYMENT_PACK");
  return pack;
}

function payRamConfig(rail: EverCoinPaymentRail) {
  const baseUrl = process.env.PAYRAM_BASE_URL?.trim();
  const apiKey =
    rail === "card"
      ? process.env.PAYRAM_CARD_API_KEY?.trim()
      : process.env.PAYRAM_CRYPTO_API_KEY?.trim();

  if (!baseUrl || !apiKey) return null;

  const normalized = cleanBaseUrl(baseUrl);
  if (
    process.env.NODE_ENV === "production" &&
    !normalized.startsWith("https://")
  ) {
    throw new Error("PAYRAM_HTTPS_REQUIRED");
  }

  return { baseUrl: normalized, apiKey };
}

function btcPayConfig() {
  const baseUrl = process.env.BTCPAY_BASE_URL?.trim();
  const storeId = process.env.BTCPAY_STORE_ID?.trim();
  const apiKey = process.env.BTCPAY_API_KEY?.trim();
  if (!baseUrl || !storeId || !apiKey) return null;

  const normalized = cleanBaseUrl(baseUrl);
  if (
    process.env.NODE_ENV === "production" &&
    !normalized.startsWith("https://")
  ) {
    throw new Error("BTCPAY_HTTPS_REQUIRED");
  }

  return { baseUrl: normalized, storeId, apiKey };
}

async function insertOrder(values: {
  userId: string;
  rail: EverCoinPaymentRail;
  provider: EverCoinPaymentProvider;
  pack: EverCoinPack;
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
      status: "pending"
    })
    .select(
      "id,user_id,rail,provider,pack_code,coins,amount_minor,currency_code,status,provider_reference,checkout_url,provider_state"
    )
    .single();

  if (error) throw error;
  return data as PaymentOrder;
}

async function updateOrder(
  orderId: string,
  values: Record<string, unknown>
) {
  const { error } = await getSupabaseServiceClient()
    .from("evercoin_payment_orders")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) throw error;
}

async function createPayRamCheckout(values: {
  rail: EverCoinPaymentRail;
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
    const url = typeof payload?.url === "string" ? payload.url.trim() : "";

    if (!response.ok || !reference || !/^https?:\/\//i.test(url)) {
      throw new Error(`PAYRAM_CREATE_FAILED:${response.status}`);
    }

    await updateOrder(order.id, {
      provider_reference: reference,
      checkout_url: url,
      provider_state: "OPEN"
    });

    return {
      orderId: order.id,
      mode: "redirect",
      provider: "payram",
      url
    };
  } catch (error) {
    await updateOrder(order.id, {
      status: "failed",
      error_code:
        error instanceof Error ? error.message.slice(0, 240) : "PAYRAM_CREATE_FAILED"
    }).catch(() => undefined);
    throw error;
  }
}

async function createBtcPayCheckout(values: {
  pack: EverCoinPack;
  userId: string;
  email: string;
}): Promise<CheckoutResult> {
  const config = btcPayConfig();
  if (!config) throw new Error("BTCPAY_NOT_CONFIGURED");

  const order = await insertOrder({
    userId: values.userId,
    rail: "crypto",
    provider: "btcpay",
    pack: values.pack
  });

  try {
    const redirectURL = siteUrl() ? `${siteUrl()}/coins?payment=return` : undefined;
    const response = await fetch(
      `${config.baseUrl}/api/v1/stores/${encodeURIComponent(config.storeId)}/invoices`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${config.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          amount: decimalFromMinor(values.pack.amountMinor),
          currency: "USD",
          metadata: {
            orderId: order.id,
            userId: values.userId,
            buyerEmail: values.email,
            itemDesc: `${values.pack.coins} EverCoin`,
            packCode: values.pack.code,
            kind: "evercoin"
          },
          checkout: {
            redirectURL,
            redirectAutomatically: Boolean(redirectURL)
          }
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(20_000)
      }
    );

    const payload = await response.json().catch(() => null);
    const reference = typeof payload?.id === "string" ? payload.id.trim() : "";
    const url =
      typeof payload?.checkoutLink === "string" ? payload.checkoutLink.trim() : "";

    if (!response.ok || !reference || !/^https?:\/\//i.test(url)) {
      throw new Error(`BTCPAY_CREATE_FAILED:${response.status}`);
    }

    await updateOrder(order.id, {
      provider_reference: reference,
      checkout_url: url,
      provider_state: String(payload?.status ?? "New")
    });

    return {
      orderId: order.id,
      mode: "redirect",
      provider: "btcpay",
      url
    };
  } catch (error) {
    await updateOrder(order.id, {
      status: "failed",
      error_code:
        error instanceof Error ? error.message.slice(0, 240) : "BTCPAY_CREATE_FAILED"
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

  if (values.rail === "card") {
    return createPayRamCheckout({
      rail: "card",
      pack,
      userId: values.userId,
      email: values.email
    });
  }

  // Broad crypto checkout first (USDC/USDT/BTC/etc. as enabled in PayRam).
  // If that self-hosted gateway is unavailable, BTCPay is an independent
  // Bitcoin/Lightning fallback with the same EverCoin fulfillment path.
  try {
    return await createPayRamCheckout({
      rail: "crypto",
      pack,
      userId: values.userId,
      email: values.email
    });
  } catch (error) {
    if (!btcPayConfig()) throw error;
    console.warn("EVERBOND_PAYRAM_CRYPTO_FALLBACK_TO_BTCPAY", {
      error: error instanceof Error ? error.message : "PAYRAM_CRYPTO_FAILED"
    });
    return createBtcPayCheckout({
      pack,
      userId: values.userId,
      email: values.email
    });
  }
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

  return {
    status: "paid" as const,
    coins: order.coins,
    balance: Number(wallet?.balance ?? 0)
  };
}

async function refreshPayRamOrder(order: PaymentOrder) {
  const config = payRamConfig(order.rail);
  if (!config || !order.provider_reference) {
    throw new Error("PAYRAM_ORDER_NOT_CONFIGURED");
  }

  const response = await fetch(
    `${config.baseUrl}/api/v1/payment/reference/${encodeURIComponent(order.provider_reference)}`,
    {
      headers: {
        "API-Key": config.apiKey,
        Accept: "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000)
    }
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    throw new Error(`PAYRAM_STATUS_FAILED:${response.status}`);
  }

  const state = String(
    payload.paymentState ?? payload.payment_state ?? payload.status ?? "OPEN"
  ).toUpperCase();
  const invoiceMinor = parseUsdMinor(payload.amountInUSD ?? payload.amount_in_usd);
  const customerId = String(payload.customerID ?? payload.customerId ?? "").trim();

  if (invoiceMinor !== null && invoiceMinor !== order.amount_minor) {
    throw new Error("PAYRAM_AMOUNT_MISMATCH");
  }
  if (customerId && customerId !== order.user_id) {
    throw new Error("PAYRAM_USER_MISMATCH");
  }

  await updateOrder(order.id, {
    provider_state: state,
    last_checked_at: new Date().toISOString()
  });

  if (state === "FILLED" || state === "OVER_FILLED") {
    const filledMinor = parseUsdMinor(
      payload.filled_amount_in_usd ?? payload.filledAmountInUSD
    );
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

async function refreshBtcPayOrder(order: PaymentOrder) {
  const config = btcPayConfig();
  if (!config || !order.provider_reference) {
    throw new Error("BTCPAY_ORDER_NOT_CONFIGURED");
  }

  const response = await fetch(
    `${config.baseUrl}/api/v1/stores/${encodeURIComponent(config.storeId)}/invoices/${encodeURIComponent(order.provider_reference)}`,
    {
      headers: {
        Authorization: `token ${config.apiKey}`,
        Accept: "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000)
    }
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    throw new Error(`BTCPAY_STATUS_FAILED:${response.status}`);
  }

  const status = String(payload.status ?? "New");
  const amountMinor = parseUsdMinor(payload.amount);
  const currency = String(payload.currency ?? "").toUpperCase();
  const metadata = payload.metadata ?? {};

  if (amountMinor !== null && amountMinor !== order.amount_minor) {
    throw new Error("BTCPAY_AMOUNT_MISMATCH");
  }
  if (currency && currency !== "USD") {
    throw new Error("BTCPAY_CURRENCY_MISMATCH");
  }
  if (metadata?.orderId && String(metadata.orderId) !== order.id) {
    throw new Error("BTCPAY_ORDER_MISMATCH");
  }
  if (metadata?.userId && String(metadata.userId) !== order.user_id) {
    throw new Error("BTCPAY_USER_MISMATCH");
  }

  await updateOrder(order.id, {
    provider_state: `${status}:${String(payload.additionalStatus ?? "None")}`,
    last_checked_at: new Date().toISOString()
  });

  if (status.toLowerCase() === "settled") {
    return creditOrder(order, `btcpay:${order.provider_reference}`);
  }

  if (status.toLowerCase() === "expired" || status.toLowerCase() === "invalid") {
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

  return order.provider === "payram"
    ? refreshPayRamOrder(order)
    : refreshBtcPayOrder(order);
}

export function configuredPaymentRails() {
  return {
    card: Boolean(payRamConfig("card")),
    crypto: Boolean(payRamConfig("crypto") || btcPayConfig())
  };
}
