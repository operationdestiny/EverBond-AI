import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import {
  getPaymentOrderForUser,
  refreshEverCoinPaymentOrder
} from "@/lib/billing/evercoin-payment-router";
import { refreshCustomBankPayments } from "@/lib/custom-bank-payments";

export const runtime = "nodejs";
export const maxDuration = 30;

const OrderId = z.string().uuid();

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "SIGNUP_REQUIRED" }, { status: 401 });
    }

    const parsed = OrderId.safeParse(new URL(request.url).searchParams.get("orderId"));
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_ORDER_ID" }, { status: 400 });
    }

    const order = await getPaymentOrderForUser(parsed.data, user.id);
    if (!order) {
      return NextResponse.json({ error: "PAYMENT_ORDER_NOT_FOUND" }, { status: 404 });
    }

    if (
      order.provider === "direct_bank" &&
      order.rail === "bank" &&
      order.pack_code === "custom"
    ) {
      await refreshCustomBankPayments();
      const latest = await getPaymentOrderForUser(order.id, user.id);

      if (latest?.status === "paid") {
        return NextResponse.json(
          { status: "paid", coins: latest.coins, balance: null },
          { headers: { "Cache-Control": "private, no-store" } }
        );
      }

      return NextResponse.json(
        { status: "pending", coins: 0, balance: null },
        { headers: { "Cache-Control": "private, no-store" } }
      );
    }

    const result = await refreshEverCoinPaymentOrder(order);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store" }
    });
  } catch (error) {
    console.error("EverCoin payment status failed:", error);
    return NextResponse.json({ error: "PAYMENT_STATUS_FAILED" }, { status: 500 });
  }
}
