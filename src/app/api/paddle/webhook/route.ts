import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { verifyPaddleSignature } from "@/lib/billing/paddle-signature";
import {
  creditEverCoinTransaction,
  fetchPaddleTransaction
} from "@/lib/billing/evercoin-fulfillment";

export const runtime = "nodejs";

const REVERSAL_ACTIONS = new Set([
  "refund",
  "chargeback"
]);

function minorAmount(value: unknown) {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return Math.max(
      Math.trunc(Math.abs(value)),
      0
    );
  }

  if (
    typeof value === "string" &&
    /^-?\d+$/.test(value.trim())
  ) {
    return Math.max(
      Math.abs(Number.parseInt(value, 10)),
      0
    );
  }

  return null;
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
  const remaining = Math.max(
    values.granted - values.alreadyReversed,
    0
  );

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
        (values.granted *
          values.adjustedTotal) /
          values.originalTotal
      )
    )
  );
}

async function ensureEverCoinPurchaseRecorded(
  transactionId: string
) {
  const supabase = getSupabaseServiceClient();

  const selectPurchase = () =>
    supabase
      .from("evercoin_purchases")
      .select(
        "paddle_transaction_id,coins_granted,coins_reversed,transaction_total_minor"
      )
      .eq(
        "paddle_transaction_id",
        transactionId
      )
      .maybeSingle();

  const {
    data: existing,
    error: existingError
  } = await selectPurchase();

  if (existingError) throw existingError;
  if (existing) return existing;

  const transaction =
    await fetchPaddleTransaction(transactionId);

  if (!transaction) return null;

  const handled =
    await creditEverCoinTransaction(transaction);

  if (!handled.handled) return null;

  const {
    data: refreshed,
    error: refreshedError
  } = await selectPurchase();

  if (refreshedError) throw refreshedError;
  return refreshed ?? null;
}

async function reverseEverCoinAdjustment(data: any) {
  const action = String(
    data?.action ?? ""
  ).toLowerCase();

  const status = String(
    data?.status ?? ""
  ).toLowerCase();

  if (
    !REVERSAL_ACTIONS.has(action) ||
    status !== "approved"
  ) {
    return false;
  }

  const adjustmentId =
    typeof data?.id === "string"
      ? data.id
      : null;

  const transactionId =
    typeof data?.transaction_id === "string"
      ? data.transaction_id
      : null;

  if (!adjustmentId || !transactionId) {
    return false;
  }

  const purchase =
    await ensureEverCoinPurchaseRecorded(
      transactionId
    );

  if (!purchase) return false;

  const coins = proportionalReversal({
    granted: Number(
      purchase.coins_granted ?? 0
    ),
    alreadyReversed: Number(
      purchase.coins_reversed ?? 0
    ),
    originalTotal: minorAmount(
      purchase.transaction_total_minor
    ),
    adjustedTotal:
      adjustmentTotalMinor(data),
    full:
      String(
        data?.type ?? ""
      ).toLowerCase() === "full"
  });

  if (coins > 0) {
    const { error } =
      await getSupabaseServiceClient().rpc(
        "reverse_evercoin_purchase",
        {
          p_transaction_id: transactionId,
          p_adjustment_id: adjustmentId,
          p_action: action,
          p_status: status,
          p_coins: coins
        }
      );

    if (error) throw error;
  }

  return true;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret =
    process.env.PADDLE_WEBHOOK_SECRET?.trim();

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

  const eventId =
    typeof event?.event_id === "string"
      ? event.event_id
      : null;

  const eventType =
    typeof event?.event_type === "string"
      ? event.event_type
      : null;

  const data = event?.data;

  if (!eventId || !eventType || !data) {
    return NextResponse.json(
      { error: "Invalid Paddle webhook" },
      { status: 400 }
    );
  }

  const supabase =
    getSupabaseServiceClient();

  try {
    const {
      data: existing,
      error: existingError
    } = await supabase
      .from("paddle_events")
      .select("event_id")
      .eq("event_id", eventId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      return NextResponse.json({
        received: true,
        duplicate: true
      });
    }

    if (
      eventType === "transaction.completed"
    ) {
      await creditEverCoinTransaction(data);
    }

    if (
      eventType === "adjustment.created" ||
      eventType === "adjustment.updated"
    ) {
      await reverseEverCoinAdjustment(data);
    }

    const { error: eventInsertError } =
      await supabase
        .from("paddle_events")
        .upsert(
          {
            event_id: eventId,
            event_type: eventType,
            payload: event
          },
          {
            onConflict: "event_id",
            ignoreDuplicates: true
          }
        );

    if (eventInsertError) {
      throw eventInsertError;
    }

    return NextResponse.json({
      received: true
    });
  } catch (error) {
    console.error(
      "Paddle EverCoin webhook processing failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Paddle webhook processing failed"
      },
      { status: 500 }
    );
  }
}
