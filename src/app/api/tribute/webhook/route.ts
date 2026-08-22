import { NextResponse } from "next/server";
import {
  fulfillTributeOrderByReference,
  markTributeOrderFailed,
  reverseTributeOrderByReference,
  verifyTributeWebhookSignature
} from "@/lib/tribute-payments";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const rawBody = await request.text();

  let signatureValid = false;
  try {
    signatureValid = verifyTributeWebhookSignature(
      rawBody,
      request.headers.get("trbt-signature")
    );
  } catch (error) {
    console.error("Tribute webhook signature setup failed:", error);
  }

  if (!signatureValid) {
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
  }

  let event: {
    name?: string;
    created_at?: string;
    sent_at?: string;
    payload?: Record<string, unknown>;
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "INVALID_WEBHOOK" }, { status: 400 });
  }

  const name = typeof event.name === "string" ? event.name : "";
  const payload = event.payload && typeof event.payload === "object" ? event.payload : null;
  const reference = typeof payload?.uuid === "string" ? payload.uuid.trim() : "";

  if (!name || !payload || !reference) {
    return NextResponse.json({ error: "INVALID_WEBHOOK" }, { status: 400 });
  }

  try {
    if (name === "shop_order") {
      const status = String(payload.status ?? "").toLowerCase();
      if (status === "paid") {
        await fulfillTributeOrderByReference(reference, payload);
      }
    } else if (name === "shop_order_refunded") {
      await reverseTributeOrderByReference(reference, payload.transactionId as string | number | null, payload);
    } else if (name === "shop_order_payment_failed") {
      await markTributeOrderFailed(reference, "PAYMENT_FAILED");
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Tribute webhook processing failed:", error);
    return NextResponse.json({ error: "WEBHOOK_PROCESSING_FAILED" }, { status: 500 });
  }
}
