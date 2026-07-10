import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { verifyPaddleSignature } from "@/lib/billing/paddle-signature";

const planLimits: Record<string, number> = { standard: 2000, premium: 7500, elite: 20000 };

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret || !verifyPaddleSignature(rawBody, request.headers.get("paddle-signature"), secret)) return NextResponse.json({ error: "Invalid Paddle signature" }, { status: 401 });
  const event = JSON.parse(rawBody);
  const eventId = event?.event_id as string | undefined;
  const eventType = event?.event_type as string | undefined;
  const data = event?.data;
  if (!eventId || !eventType || !data) return NextResponse.json({ error: "Invalid Paddle webhook" }, { status: 400 });

  const supabase = getSupabaseServiceClient();
  const { data: existing } = await supabase.from("paddle_events").select("event_id").eq("event_id", eventId).maybeSingle();
  if (existing) return NextResponse.json({ received: true, duplicate: true });

  if (eventType.startsWith("subscription.")) {
    const plan = data?.custom_data?.plan || data?.items?.[0]?.price?.custom_data?.plan || "standard";
    const userId = data?.custom_data?.user_id ?? null;
    const payload = { user_id: userId, paddle_customer_id: data.customer_id ?? null, paddle_subscription_id: data.id, plan, status: data.status ?? "unknown", monthly_message_limit: planLimits[plan] ?? planLimits.standard, current_period_end: data.current_billing_period?.ends_at ?? null, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("subscriptions").upsert(payload, { onConflict: "paddle_subscription_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  await supabase.from("paddle_events").insert({ event_id: eventId, event_type: eventType, payload: event });
  return NextResponse.json({ received: true });
}
