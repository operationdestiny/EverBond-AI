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
  status: string;
  provider_state: string | null;
  external_transaction_id: string | null;
  settled_transaction_id: string | null;
  created_at: string;
};

type IncomingTransaction = {
  transaction_id: string;
  pending_transaction_id: string | null;
  amount_minor: number;
  currency_code: string | null;
  pending: boolean;
  first_seen_at: string;
  matched_order_id: string | null;
  removed_at: string | null;
  replacement_transaction_id: string | null;
};

const SENT_RESERVATION_DAYS = 5;

function numericMinor(value: unknown) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function plaidTransactionIdFromExternal(value: string | null | undefined) {
  const text = String(value || "");
  return text.startsWith("plaid:") ? text.slice("plaid:".length) : "";
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

export async function markCustomBankOrderSent(values: {
  userId: string;
  orderId: string;
}) {
  const supabase = getSupabaseServiceClient();
  const expiresAt = new Date(
    Date.now() + SENT_RESERVATION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: existing, error: readError } = await supabase
    .from("evercoin_payment_orders")
    .select("id,status,provider_state")
    .eq("id", values.orderId)
    .eq("user_id", values.userId)
    .eq("rail", "bank")
    .eq("provider", "direct_bank")
    .eq("pack_code", "custom")
    .maybeSingle();
  if (readError) throw readError;
  if (!existing) throw new Error("BANK_ORDER_NOT_FOUND");

  if (existing.status === "paid") {
    return { status: "paid" as const };
  }
  if (existing.status !== "pending") {
    return { status: existing.status as string };
  }

  const { error } = await supabase
    .from("evercoin_payment_orders")
    .update({
      provider_state: "TRANSFER_SENT",
      expires_at: expiresAt,
      updated_at: new Date().toISOString()
    })
    .eq("id", values.orderId)
    .eq("user_id", values.userId)
    .eq("status", "pending")
    .in("provider_state", ["AMOUNT_RESERVED", "TRANSFER_SENT"]);
  if (error) throw error;

  return { status: "pending" as const };
}

async function getCustomOrder(orderId: string) {
  const { data, error } = await getSupabaseServiceClient()
    .from("evercoin_payment_orders")
    .select(
      "id,user_id,amount_minor,requested_amount_minor,coins,currency_code,status,provider_state,external_transaction_id,settled_transaction_id,created_at"
    )
    .eq("id", orderId)
    .eq("rail", "bank")
    .eq("provider", "direct_bank")
    .eq("pack_code", "custom")
    .maybeSingle();
  if (error) throw error;
  return (data as CustomBankOrder | null) ?? null;
}

async function ensureProvisionalTransactionLinks() {
  const supabase = getSupabaseServiceClient();
  const { data: orders, error } = await supabase
    .from("evercoin_payment_orders")
    .select(
      "id,user_id,amount_minor,requested_amount_minor,coins,currency_code,status,provider_state,external_transaction_id,settled_transaction_id,created_at"
    )
    .eq("rail", "bank")
    .eq("provider", "direct_bank")
    .eq("pack_code", "custom")
    .eq("provider_state", "PENDING_CREDITED");
  if (error) throw error;

  for (const rawOrder of (orders || []) as CustomBankOrder[]) {
    const transactionId = plaidTransactionIdFromExternal(rawOrder.external_transaction_id);
    if (!transactionId) continue;

    await supabase
      .from("plaid_incoming_transactions")
      .update({
        matched_order_id: rawOrder.id,
        last_seen_at: new Date().toISOString()
      })
      .eq("transaction_id", transactionId)
      .is("matched_order_id", null);
  }
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
  const provisional = Boolean(transaction.pending);

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
        settled_transaction_id: provisional ? null : transaction.transaction_id,
        provider_state: provisional ? "PENDING_CREDITED" : "RECEIVED",
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
      // Preserve the original reconciliation error.
    }
    throw error;
  }
}

type PreparedPostedSettlement = {
  postedMinor: number;
  externalTransactionId: string | null;
};

async function preparePostedSettlement(
  order: CustomBankOrder,
  posted: IncomingTransaction
): Promise<PreparedPostedSettlement | null> {
  const supabase = getSupabaseServiceClient();
  const postedMinor = numericMinor(posted.amount_minor);
  if (!postedMinor) return null;

  if (order.provider_state === "PENDING_REVERSED") {
    const recoveryId = `plaid-recovered:${posted.transaction_id}`;
    const { error: recoveryError } = await supabase.rpc("credit_evercoin_purchase", {
      p_user_id: order.user_id,
      p_transaction_id: recoveryId,
      p_price_id: "direct_bank:bank:custom:recovered",
      p_pack_code: "custom",
      p_coins: postedMinor,
      p_total_minor: postedMinor,
      p_currency_code: "USD"
    });
    if (recoveryError) throw recoveryError;

    return { postedMinor, externalTransactionId: recoveryId };
  }

  if (order.provider_state !== "PENDING_CREDITED" || order.status !== "paid") {
    return null;
  }

  const provisionalMinor = numericMinor(order.coins) || numericMinor(order.amount_minor);
  if (!provisionalMinor || !order.external_transaction_id) return null;

  if (postedMinor < provisionalMinor) {
    const difference = provisionalMinor - postedMinor;
    const { error } = await supabase.rpc("reverse_evercoin_purchase", {
      p_transaction_id: order.external_transaction_id,
      p_adjustment_id: `plaid-settlement-down:${posted.transaction_id}`,
      p_action: "bank_settlement_adjustment",
      p_status: "confirmed",
      p_coins: difference
    });
    if (error) throw error;
  } else if (postedMinor > provisionalMinor) {
    const difference = postedMinor - provisionalMinor;
    const { error } = await supabase.rpc("credit_evercoin_purchase", {
      p_user_id: order.user_id,
      p_transaction_id: `plaid-settlement-up:${posted.transaction_id}`,
      p_price_id: "direct_bank:bank:custom:settlement_adjustment",
      p_pack_code: "custom",
      p_coins: difference,
      p_total_minor: difference,
      p_currency_code: "USD"
    });
    if (error) throw error;
  }

  return { postedMinor, externalTransactionId: null };
}

async function finalizePostedSettlement(values: {
  orderId: string;
  pendingTransactionId?: string | null;
  postedTransactionId: string;
  postedMinor: number;
  externalTransactionId?: string | null;
}) {
  const { data, error } = await getSupabaseServiceClient().rpc(
    "finalize_custom_bank_posted_match",
    {
      p_order_id: values.orderId,
      p_pending_transaction_id: values.pendingTransactionId || null,
      p_posted_transaction_id: values.postedTransactionId,
      p_posted_amount_minor: values.postedMinor,
      p_external_transaction_id: values.externalTransactionId || null
    }
  );
  if (error) throw error;
  return data === true;
}

async function confirmPostedReplacements() {
  const supabase = getSupabaseServiceClient();
  const { data: postedRows, error } = await supabase
    .from("plaid_incoming_transactions")
    .select(
      "transaction_id,pending_transaction_id,amount_minor,currency_code,pending,first_seen_at,matched_order_id,removed_at,replacement_transaction_id"
    )
    .eq("pending", false)
    .is("removed_at", null)
    .is("matched_order_id", null)
    .not("pending_transaction_id", "is", null)
    .order("first_seen_at", { ascending: true });
  if (error) throw error;

  let confirmed = 0;
  for (const posted of (postedRows || []) as IncomingTransaction[]) {
    if (!posted.pending_transaction_id) continue;

    const { data: pendingRow, error: pendingError } = await supabase
      .from("plaid_incoming_transactions")
      .select("transaction_id,matched_order_id")
      .eq("transaction_id", posted.pending_transaction_id)
      .maybeSingle();
    if (pendingError) throw pendingError;
    if (!pendingRow?.matched_order_id) continue;

    const order = await getCustomOrder(pendingRow.matched_order_id);
    if (!order || !["PENDING_CREDITED", "PENDING_REVERSED"].includes(order.provider_state || "")) {
      continue;
    }

    const prepared = await preparePostedSettlement(order, posted);
    if (!prepared) continue;
    if (
      await finalizePostedSettlement({
        orderId: order.id,
        pendingTransactionId: posted.pending_transaction_id,
        postedTransactionId: posted.transaction_id,
        postedMinor: prepared.postedMinor,
        externalTransactionId: prepared.externalTransactionId
      })
    ) {
      confirmed += 1;
    }
  }

  return confirmed;
}

async function confirmPostedByReservedAmount() {
  const supabase = getSupabaseServiceClient();
  const { data: provisionalRows, error: orderError } = await supabase
    .from("evercoin_payment_orders")
    .select(
      "id,user_id,amount_minor,requested_amount_minor,coins,currency_code,status,provider_state,external_transaction_id,settled_transaction_id,created_at"
    )
    .eq("rail", "bank")
    .eq("provider", "direct_bank")
    .eq("pack_code", "custom")
    .eq("status", "paid")
    .eq("provider_state", "PENDING_CREDITED");
  if (orderError) throw orderError;
  if (!provisionalRows?.length) return 0;

  const { data: postedRows, error: transactionError } = await supabase
    .from("plaid_incoming_transactions")
    .select(
      "transaction_id,pending_transaction_id,amount_minor,currency_code,pending,first_seen_at,matched_order_id,removed_at,replacement_transaction_id"
    )
    .eq("pending", false)
    .is("removed_at", null)
    .is("matched_order_id", null)
    .order("first_seen_at", { ascending: true });
  if (transactionError) throw transactionError;

  let confirmed = 0;
  const orders = provisionalRows as CustomBankOrder[];
  for (const posted of (postedRows || []) as IncomingTransaction[]) {
    const amount = numericMinor(posted.amount_minor);
    if (!amount) continue;

    const candidates = orders.filter((order) => {
      if (Number(order.amount_minor) !== amount) return false;
      const created = new Date(order.created_at).getTime();
      const seen = new Date(posted.first_seen_at).getTime();
      return Number.isFinite(created) && Number.isFinite(seen) && seen >= created;
    });

    if (candidates.length !== 1) continue;
    const order = candidates[0];
    const prepared = await preparePostedSettlement(order, posted);
    if (!prepared) continue;
    if (
      await finalizePostedSettlement({
        orderId: order.id,
        postedTransactionId: posted.transaction_id,
        postedMinor: prepared.postedMinor,
        externalTransactionId: prepared.externalTransactionId
      })
    ) {
      confirmed += 1;
    }
  }

  return confirmed;
}

async function matchNewIncomingTransactions() {
  const supabase = getSupabaseServiceClient();

  const { data: orders, error: ordersError } = await supabase
    .from("evercoin_payment_orders")
    .select(
      "id,user_id,amount_minor,requested_amount_minor,coins,currency_code,status,provider_state,external_transaction_id,settled_transaction_id,created_at"
    )
    .eq("rail", "bank")
    .eq("provider", "direct_bank")
    .eq("pack_code", "custom")
    .eq("status", "pending")
    .in("provider_state", ["AMOUNT_RESERVED", "TRANSFER_SENT"])
    .order("created_at", { ascending: true });
  if (ordersError) throw ordersError;
  if (!orders?.length) return 0;

  const customOrders = orders as CustomBankOrder[];
  const earliestOrder = customOrders[0]?.created_at;
  if (!earliestOrder) return 0;

  const { data: transactions, error: transactionError } = await supabase
    .from("plaid_incoming_transactions")
    .select(
      "transaction_id,pending_transaction_id,amount_minor,currency_code,pending,first_seen_at,matched_order_id,removed_at,replacement_transaction_id"
    )
    .is("matched_order_id", null)
    .is("removed_at", null)
    .gte("first_seen_at", earliestOrder)
    .order("first_seen_at", { ascending: true });
  if (transactionError) throw transactionError;
  if (!transactions?.length) return 0;

  let matched = 0;
  for (const rawTransaction of transactions as IncomingTransaction[]) {
    if (
      rawTransaction.matched_order_id ||
      rawTransaction.removed_at ||
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

  return matched;
}

async function reverseStaleRemovedPendingCredits() {
  const supabase = getSupabaseServiceClient();
  const cutoff = new Date().toISOString();

  const { data: removedRows, error } = await supabase
    .from("plaid_incoming_transactions")
    .select(
      "transaction_id,pending_transaction_id,amount_minor,currency_code,pending,first_seen_at,matched_order_id,removed_at,replacement_transaction_id"
    )
    .eq("pending", true)
    .not("matched_order_id", "is", null)
    .not("removed_at", "is", null)
    .is("replacement_transaction_id", null)
    .lte("removed_at", cutoff);
  if (error) throw error;

  let reversed = 0;
  for (const transaction of (removedRows || []) as IncomingTransaction[]) {
    if (!transaction.matched_order_id) continue;
    const order = await getCustomOrder(transaction.matched_order_id);
    if (!order || order.provider_state !== "PENDING_CREDITED" || order.status !== "paid") {
      continue;
    }
    if (!order.external_transaction_id) continue;

    const { error: reverseError } = await supabase.rpc("reverse_evercoin_purchase", {
      p_transaction_id: order.external_transaction_id,
      p_adjustment_id: `plaid-pending-removed:${transaction.transaction_id}`,
      p_action: "bank_pending_removed",
      p_status: "reversed",
      p_coins: order.coins
    });
    if (reverseError) throw reverseError;

    const { error: updateError } = await supabase
      .from("evercoin_payment_orders")
      .update({
        status: "failed",
        provider_state: "PENDING_REVERSED",
        error_code: "BANK_PENDING_TRANSFER_REMOVED",
        updated_at: new Date().toISOString()
      })
      .eq("id", order.id)
      .eq("provider_state", "PENDING_CREDITED");
    if (updateError) throw updateError;
    reversed += 1;
  }

  return reversed;
}

export async function reconcileCustomBankOrders() {
  await ensureProvisionalTransactionLinks();

  const linkedConfirmed = await confirmPostedReplacements();
  const amountConfirmed = await confirmPostedByReservedAmount();
  const matched = await matchNewIncomingTransactions();
  const reversed = await reverseStaleRemovedPendingCredits();

  return {
    matched,
    provisionalConfirmed: linkedConfirmed + amountConfirmed,
    reversed
  };
}

export async function refreshCustomBankPayments() {
  try {
    await syncPlaidTransactions();
  } catch (error) {
    console.warn("Plaid sync for custom bank payment failed:", error);
  }

  let refreshRequested = false;
  try {
    refreshRequested = await requestPlaidRefreshIfNeeded();
  } catch (error) {
    console.warn("Plaid refresh for custom bank payment failed:", error);
  }

  if (refreshRequested) {
    try {
      await syncPlaidTransactions();
    } catch (error) {
      console.warn("Plaid sync after refresh failed:", error);
    }
  }

  return reconcileCustomBankOrders();
}
