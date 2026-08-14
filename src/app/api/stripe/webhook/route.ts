import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { verifyStripeSignature } from "@/lib/billing/stripe-webhook";
import { creditStripeCheckoutSession } from "@/lib/billing/stripe-evercoin-fulfillment";

export const runtime = "nodejs";

function integerMinor(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number)
    ? Math.max(Math.trunc(number), 0)
    : null;
}

async function reverseStripePurchase(values: {
  paymentIntentId: string;
  eventId: string;
  action: "refund" | "chargeback";
  adjustedTotalMinor?: number | null;
  full?: boolean;
}) {
  const supabase = getSupabaseServiceClient();

  const { data: purchase, error } = await supabase
    .from("evercoin_purchases")
    .select(
      "paddle_transaction_id,coins_granted,coins_reversed,transaction_total_minor"
    )
    .eq("paddle_transaction_id", values.paymentIntentId)
    .maybeSingle();

  if (error) throw error;
  if (!purchase) return false;

  const granted = Math.max(
    Math.trunc(Number(purchase.coins_granted ?? 0)),
    0
  );
  const alreadyReversed = Math.max(
    Math.trunc(Number(purchase.coins_reversed ?? 0)),
    0
  );
  const originalTotal =
    integerMinor(purchase.transaction_total_minor);

  if (granted <= 0 || alreadyReversed >= granted) {
    return true;
  }

  let targetReversed = granted;

  if (
    !values.full &&
    originalTotal &&
    values.adjustedTotalMinor !== null &&
    values.adjustedTotalMinor !== undefined
  ) {
    const adjusted = Math.min(
      Math.max(values.adjustedTotalMinor, 0),
      originalTotal
    );

    targetReversed = Math.min(
      granted,
      Math.max(
        adjusted > 0 ? 1 : 0,
        Math.ceil((granted * adjusted) / originalTotal)
      )
    );
  }

  const coins = Math.max(
    Math.min(
      targetReversed - alreadyReversed,
      granted - alreadyReversed
    ),
    0
  );

  if (coins <= 0) return true;

  const { error: reversalError } = await supabase.rpc(
    "reverse_evercoin_purchase",
    {
      p_transaction_id: values.paymentIntentId,
      p_adjustment_id: values.eventId,
      p_action: values.action,
      p_status: "approved",
      p_coins: coins
    }
  );

  if (reversalError) throw reversalError;
  return true;
}

async function handleRefund(eventId: string, charge: any) {
  const paymentIntent =
    typeof charge?.payment_intent === "string"
      ? charge.payment_intent
      : charge?.payment_intent?.id;

  if (typeof paymentIntent !== "string") return false;

  const amount = integerMinor(charge?.amount);
  const amountRefunded = integerMinor(charge?.amount_refunded);

  return reverseStripePurchase({
    paymentIntentId: paymentIntent,
    eventId,
    action: "refund",
    adjustedTotalMinor: amountRefunded,
    full:
      Boolean(charge?.refunded) ||
      (
        amount !== null &&
        amountRefunded !== null &&
        amount > 0 &&
        amountRefunded >= amount
      )
  });
}

async function handleDispute(eventId: string, dispute: any) {
  let paymentIntent =
    typeof dispute?.payment_intent === "string"
      ? dispute.payment_intent
      : dispute?.payment_intent?.id;

  if (!paymentIntent) {
    const chargeId =
      typeof dispute?.charge === "string"
        ? dispute.charge
        : dispute?.charge?.id;

    if (chargeId) {
      const response = await fetch(
        `https://api.stripe.com/v1/charges/${encodeURIComponent(chargeId)}`,
        {
          headers: {
            Authorization:
              `Bearer ${process.env.STRIPE_SECRET_KEY?.trim() ?? ""}`,
            Accept: "application/json"
          },
          cache: "no-store",
          signal: AbortSignal.timeout(20_000)
        }
      );

      const charge = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          `STRIPE_CHARGE_LOOKUP_FAILED:${response.status}`
        );
      }

      paymentIntent =
        typeof charge?.payment_intent === "string"
          ? charge.payment_intent
          : charge?.payment_intent?.id;
    }
  }

  if (typeof paymentIntent !== "string") return false;

  return reverseStripePurchase({
    paymentIntentId: paymentIntent,
    eventId,
    action: "chargeback",
    full: true
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret =
    process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (
    !secret ||
    !verifyStripeSignature(
      rawBody,
      request.headers.get("stripe-signature"),
      secret
    )
  ) {
    return NextResponse.json(
      { error: "Invalid Stripe signature" },
      { status: 401 }
    );
  }

  let event: any;

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid Stripe webhook" },
      { status: 400 }
    );
  }

  const eventId =
    typeof event?.id === "string"
      ? event.id
      : null;
  const eventType =
    typeof event?.type === "string"
      ? event.type
      : null;
  const data = event?.data?.object;

  if (!eventId || !eventType || !data) {
    return NextResponse.json(
      { error: "Invalid Stripe webhook" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServiceClient();

  try {
    // Reuse the existing event-id store so this payment-provider migration
    // needs no Supabase schema change.
    const { data: existing, error: existingError } =
      await supabase
        .from("paddle_events")
        .select("event_id")
        .eq("event_id", eventId)
        .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return NextResponse.json({
        received: true,
        duplicate: true
      });
    }

    if (
      eventType === "checkout.session.completed" ||
      eventType === "checkout.session.async_payment_succeeded"
    ) {
      if (typeof data?.id !== "string") {
        throw new Error("STRIPE_CHECKOUT_SESSION_ID_MISSING");
      }

      await creditStripeCheckoutSession(data.id);
    }

    if (eventType === "charge.refunded") {
      const handled = await handleRefund(eventId, data);
      if (!handled) {
        throw new Error("STRIPE_REFUND_PURCHASE_NOT_FOUND");
      }
    }

    if (eventType === "charge.dispute.created") {
      const handled = await handleDispute(eventId, data);
      if (!handled) {
        throw new Error("STRIPE_DISPUTE_PURCHASE_NOT_FOUND");
      }
    }

    const { error: eventInsertError } =
      await supabase
        .from("paddle_events")
        .upsert(
          {
            event_id: eventId,
            event_type: `stripe:${eventType}`,
            payload: event
          },
          {
            onConflict: "event_id",
            ignoreDuplicates: true
          }
        );

    if (eventInsertError) throw eventInsertError;

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      "Stripe EverCoin webhook processing failed:",
      error
    );

    return NextResponse.json(
      { error: "Stripe webhook processing failed" },
      { status: 500 }
    );
  }
}
