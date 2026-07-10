import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const planLimits: Record<string, number> = {
  standard: 2000,
  premium: 7500,
  elite: 20000
};

export async function POST(request: Request) {
  // TODO before production: verify Paddle-Signature using PADDLE_WEBHOOK_SECRET.
  const event = await request.json();
  const eventType = event?.event_type as string | undefined;
  const data = event?.data;

  if (!eventType || !data) return NextResponse.json({ error: "Invalid Paddle webhook" }, { status: 400 });

  if (eventType.startsWith("subscription.")) {
    const supabase = getSupabaseServiceClient();
    const plan = data?.custom_data?.plan || data?.items?.[0]?.price?.custom_data?.plan || "standard";

    await supabase.from("subscriptions").upsert({
      paddle_customer_id: data.customer_id ?? null,
      paddle_subscription_id: data.id,
      plan,
      status: data.status ?? "unknown",
      monthly_message_limit: planLimits[plan] ?? planLimits.standard,
      current_period_end: data.current_billing_period?.ends_at ?? null
    }, { onConflict: "paddle_subscription_id" });
  }

  return NextResponse.json({ received: true });
}
