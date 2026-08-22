import { getSupabaseServiceClient } from "@/lib/supabase/server";
import {
  bankRailConfigured,
  requestPlaidRefreshIfNeeded,
  syncPlaidTransactions
} from "@/lib/plaid-bank";

type ReservedBankOrderRow = {
  order_id: string;
  assigned_amount_minor: number | string;
  coins: number | string;
};

type CustomBankOrder = {
  id: string;
  user_id: string;
  amount_minor: number;
  requested_amount_minor: number | null;
  coins: number;
  currency_code: string;
  created_at: string;
  provider_state: string | null;
};

type IncomingTransaction = {
  transaction_id: string;
  amount_minor: number;
  currency_code: string | null;
  pending: boolean;
  first_seen_at: string;
  matched_order_id: string | null;
};

function numericMinor(value: unknown) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function reserveCustomBankOrder(values: {
  userId: string;
  requestedAmountMinor: number;
}) {
  if (!(await bankRailConfigured())) {
    throw new Error("BANK_RAIL_NOT_CONFIGURED");
  }

  const requested = numericMinor(values.requestedAmountMinor);
  if (!requested || requested < 6 || requested > 1_000_000) {
    throw new Error("BANK_AMOUNT_OUT_OF_RANGE");
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.rpc("reserve_custom_evercoin_bank_order", {
    p_user_id: values.userId,
    p_requested_amount_minor: requested
  });

  if (error) {
    const detail = `${error.message || ""} ${error.details || ""} ${error.hint || ""}`;
    if (detail.includes("BANK_AMOUNT_SLOTS_BUSY")) {
      throw new Error("BANK_AMOUNT_SLOTS_BUSY");
    }
    if (detail.includes("BANK_AMOUNT_OUT_OF_RANGE")) {
      throw new Error("BANK_AMOUNT_OUT_OF_RANGE");
    }
    throw error;
  }

  const row = (Array.isArray(data) ? data[0] : data) as ReservedBankOrderRow | null;
  const orderId = typeof row?.order_id === "string" ? row.order_id : "";
  const assignedAmountMinor = numericMinor(row?.assigned_amount_minor);
  const coins = numericMinor(row?.coins);

  if (!orderId || !assignedAmountMinor || !coins) {
    throw new Error("BANK_AMOUNT_RESERVATION_FAILED");
  }

  const url = `/bank-pay?orderId=${encodeURIComponent(orderId)}`;
  const { error: updateError } = await supabase
    .from("evercoin_payment_orders")
    .update({
      checkout_url: url,
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId)
    .eq("user_id", values.userId)
    .eq("pack_code", "custom");

  if (updateError) throw updateError;

  return {
    orderId,
    mode: "redirect" as const,
    provider: "direct_bank" as const,
    url,
    requestedAmountMinor: requested,
    assignedAmountMinor,
    coins
  };
}

async function creditCustomBankOrder(
  order: CustomBankOrder,
  transaction: IncomingTransaction
) {
  const supabase = getSupabaseServiceClient();
  const now = new Date().toISOString();

  const { data: claimed, error: claimError } = await supabase
    .from("evercoin_payment_orders")
    .update({
      provider_state: "MATCHING",
      updated_at: now
    })
    .eq("id", order.id)
    .eq("status", "pending")
    .eq("pack_code", "custom")
    .in("provider_state", ["AMOUNT_RESERVED", "TRANSFER_SENT"])
    .select("id")
    .maybeSingle();

  if (claimError) throw claimError;
  if (!claimed) return false;

  const receivedMinor = numericMinor(transaction.amount_minor);
  if (!receivedMinor || receivedMinor !== Number(order.amount_minor)) {
    await supabase
      .from("evercoin_payment_orders")
      .update({ provider_state: "AMOUNT_RESERVED", updated_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("status", "pending");
    return false;
  }

  const externalId = `plaid:${transaction.transaction_id}`;

  try {
    const { error: creditError } = await supabase.rpc("credit_evercoin_purchase", {
      p_user_id: order.user_id,
      p_transaction_id: externalId,
      p_price_id: "direct_bank:bank:custom",
      p_pack_code: "custom",
      p_coins: receivedMinor,
      p_total_minor: receivedMinor,
      p_currency_code: "USD"
    });
    if (creditError) throw creditError;

    const { error: orderError } = await supabase
      .from("evercoin_payment_orders")
      .update({
        coins: receivedMinor,
        amount_minor: receivedMinor,
        status: "paid",
        external_transaction_id: externalId,
        provider_state: "RECEIVED",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        error_code: null
      })
      .eq("id", order.id)
      .eq("status", "pending");
    if (orderError) throw orderError;

    const { error: transactionError } = await supabase
      .from("plaid_incoming_transactions")
      .update({
        matched_order_id: order.id,
        last_seen_at: new Date().toISOString()
      })
      .eq("transaction_id", transaction.transaction_id)
      .is("matched_order_id", null);
    if (transactionError) throw transactionError;

    return true;
  } catch (error) {
    try {
      await supabase
        .from("evercoin_payment_orders")
        .update({
          provider_state: "AMOUNT_RESERVED",
          updated_at: new Date().toISOString()
        })
        .eq("id", order.id)
        .eq("status", "pending")
        .eq("provider_state", "MATCHING");
    } catch {
      // Leave the original reconciliation error intact.
    }
    throw error;
  }
}

export async function reconcileCustomBankOrders() {
  const supabase = getSupabaseServiceClient();

  // Recover a claim if a previous server invocation ended between claiming and crediting.
  const staleMatchingCutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  await supabase
    .from("evercoin_payment_orders")
    .update({
      provider_state: "AMOUNT_RESERVED",
      updated_at: new Date().toISOString()
    })
    .eq("rail", "bank")
    .eq("provider", "direct_bank")
    .eq("pack_code", "custom")
    .eq("status", "pending")
    .eq("provider_state", "MATCHING")
    .lt("updated_at", staleMatchingCutoff);

  const { data: orders, error: ordersError } = await supabase
    .from("evercoin_payment_orders")
    .select(
      "id,user_id,amount_minor,requested_amount_minor,coins,currency_code,created_at,provider_state"
    )
    .eq("rail", "bank")
    .eq("provider", "direct_bank")
    .eq("pack_code", "custom")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (ordersError) throw ordersError;
  if (!orders?.length) return { matched: 0 };

  const customOrders = orders as CustomBankOrder[];
  const earliestOrder = customOrders[0]?.created_at;
  if (!earliestOrder) return { matched: 0 };

  const { data: transactions, error: transactionError } = await supabase
    .from("plaid_incoming_transactions")
    .select(
      "transaction_id,amount_minor,currency_code,pending,first_seen_at,matched_order_id"
    )
    .eq("pending", false)
    .is("matched_order_id", null)
    .gte("first_seen_at", earliestOrder)
    .order("first_seen_at", { ascending: true });

  if (transactionError) throw transactionError;
  if (!transactions?.length) return { matched: 0 };

  let matched = 0;

  for (const rawTransaction of transactions as IncomingTransaction[]) {
    if (
      rawTransaction.pending ||
      rawTransaction.matched_order_id ||
      String(rawTransaction.currency_code || "USD").toUpperCase() !== "USD"
    ) {
      continue;
    }

    const transactionAmount = numericMinor(rawTransaction.amount_minor);
    if (!transactionAmount) continue;

    const candidates = customOrders.filter((order) => {
      if (Number(order.amount_minor) !== transactionAmount) return false;
      const orderTime = new Date(order.created_at).getTime();
      const seenTime = new Date(rawTransaction.first_seen_at).getTime();
      return Number.isFinite(orderTime) && Number.isFinite(seenTime) && seenTime >= orderTime;
    });

    if (candidates.length !== 1) continue;

    if (await creditCustomBankOrder(candidates[0], rawTransaction)) {
      matched += 1;
    }
  }

  return { matched };
}

export async function refreshCustomBankPayments() {
  try {
    await syncPlaidTransactions();
  } catch (error) {
    console.warn("Plaid sync for custom bank payment failed:", error);
  }

  try {
    await requestPlaidRefreshIfNeeded();
  } catch (error) {
    console.warn("Plaid refresh for custom bank payment failed:", error);
  }

  return reconcileCustomBankOrders();
}
