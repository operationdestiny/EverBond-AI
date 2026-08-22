import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getPaymentOrderForUser } from "@/lib/billing/evercoin-payment-router";
import { getReceivingBankDetails } from "@/lib/plaid-bank";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const OrderId = z.string().uuid();

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "SIGNUP_REQUIRED" }, { status: 401 });
    }

    const orderId = new URL(request.url).searchParams.get("orderId");
    const parsed = OrderId.safeParse(orderId);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_ORDER_ID" }, { status: 400 });
    }

    const order = await getPaymentOrderForUser(parsed.data, user.id);
    if (!order || order.provider !== "direct_bank" || order.rail !== "bank") {
      return NextResponse.json({ error: "BANK_ORDER_NOT_FOUND" }, { status: 404 });
    }

    const receiving = await getReceivingBankDetails();
    const { data: metadata } = await getSupabaseServiceClient()
      .from("evercoin_payment_orders")
      .select("requested_amount_minor")
      .eq("id", order.id)
      .eq("user_id", user.id)
      .maybeSingle();

    return NextResponse.json(
      {
        orderId: order.id,
        status: order.status,
        coins: order.coins,
        amountMinor: order.amount_minor,
        requestedAmountMinor:
          Number(metadata?.requested_amount_minor) || Number(order.amount_minor),
        currency: order.currency_code,
        bank: {
          accountHolderName:
            process.env.EVERBOND_BANK_ACCOUNT_NAME?.trim() || "EverBond LLC",
          bankName: receiving.bankName,
          accountType: "Checking",
          routingNumber: receiving.routingNumber,
          accountNumber: receiving.accountNumber
        }
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Bank payment details failed:", error);
    return NextResponse.json({ error: "BANK_DETAILS_FAILED" }, { status: 500 });
  }
}
