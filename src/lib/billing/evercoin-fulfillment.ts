import { z } from "zod";
import { getPaddleApiBase } from "@/lib/billing/paddle";
import {
  getEverCoinPack,
  getEverCoinPackByPriceId,
  getEverCoinPackPriceId
} from "@/lib/billing/evercoin-packs";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const UuidSchema = z.string().uuid();

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

export async function fetchPaddleTransaction(transactionId: string) {
  const apiKey = process.env.PADDLE_API_KEY?.trim();
  if (!apiKey) throw new Error("PADDLE_API_KEY_MISSING");

  const response = await fetch(
    `${getPaddleApiBase()}/transactions/${encodeURIComponent(transactionId)}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000)
    }
  );

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(
      `PADDLE_TRANSACTION_LOOKUP_FAILED:${response.status}:${detail}`
    );
  }

  const payload = await response.json();
  return payload?.data ?? null;
}

export async function creditEverCoinTransaction(
  data: any,
  expectedUserId?: string
) {
  const customData = data?.custom_data;

  if (customData?.kind !== "evercoin") {
    return {
      handled: false as const,
      coins: 0,
      balance: 0,
      transactionId: null
    };
  }

  if (String(data?.status ?? "").toLowerCase() !== "completed") {
    throw new Error("EVERCOIN_TRANSACTION_NOT_COMPLETED");
  }

  const userIdResult = UuidSchema.safeParse(customData?.user_id);
  const pack = getEverCoinPack(String(customData?.pack_code ?? ""));
  const transactionId =
    typeof data?.id === "string" ? data.id : null;
  const priceId = firstItemPriceId(data);
  const quantity = firstItemQuantity(data);

  if (
    !userIdResult.success ||
    !pack ||
    !transactionId ||
    !priceId
  ) {
    throw new Error("INVALID_EVERCOIN_TRANSACTION_METADATA");
  }

  if (
    expectedUserId &&
    userIdResult.data !== expectedUserId
  ) {
    throw new Error("EVERCOIN_TRANSACTION_USER_MISMATCH");
  }

  if (
    quantity !== 1 ||
    Number(customData?.coins) !== pack.coins ||
    getEverCoinPackPriceId(pack) !== priceId ||
    getEverCoinPackByPriceId(priceId)?.code !== pack.code
  ) {
    throw new Error("EVERCOIN_PRICE_MISMATCH");
  }

  const supabase = getSupabaseServiceClient();

  // credit_evercoin_purchase is intentionally the single write path used by
  // both the Paddle webhook and authenticated checkout recovery. It is keyed
  // by Paddle transaction ID so repeated fulfillment attempts stay idempotent.
  const { error } = await supabase.rpc(
    "credit_evercoin_purchase",
    {
      p_user_id: userIdResult.data,
      p_transaction_id: transactionId,
      p_price_id: priceId,
      p_pack_code: pack.code,
      p_coins: pack.coins,
      p_total_minor: transactionTotalMinor(data),
      p_currency_code:
        typeof data?.currency_code === "string"
          ? data.currency_code
          : null
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
