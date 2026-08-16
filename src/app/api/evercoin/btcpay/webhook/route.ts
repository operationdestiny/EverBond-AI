import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getPaymentOrderByProviderReference,
  refreshEverCoinPaymentOrder
} from "@/lib/billing/evercoin-payment-router";

export const runtime = "nodejs";
export const maxDuration = 30;

function validSignature(rawBody: string, signature: string, secret: string) {
  const expected = `sha256=${createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex")}`;
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const secret = process.env.BTCPAY_WEBHOOK_SECRET?.trim();
    const signature = request.headers.get("btcpay-sig")?.trim() || "";
    const rawBody = await request.text();

    // BTCPay signs webhook bodies with HMAC-SHA256. Requiring the secret keeps
    // this public endpoint quiet; the authenticated checkout-status endpoint
    // remains an independent recovery path even if a webhook is missed.
    if (!secret || !signature || !validSignature(rawBody, signature, secret)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const payload = JSON.parse(rawBody || "null") as Record<string, unknown> | null;
    const invoiceId =
      typeof payload?.invoiceId === "string" ? payload.invoiceId.trim() : "";

    // Never trust webhook status. Re-read the invoice from the configured
    // BTCPay server and credit only after that API reports Settled.
    if (!invoiceId) return NextResponse.json({ ok: true });

    const order = await getPaymentOrderByProviderReference("btcpay", invoiceId);
    if (!order) return NextResponse.json({ ok: true });

    await refreshEverCoinPaymentOrder(order);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("BTCPay webhook refresh failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
