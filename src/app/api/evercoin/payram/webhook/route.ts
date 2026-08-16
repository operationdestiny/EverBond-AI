import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getPaymentOrderByProviderReference,
  refreshEverCoinPaymentOrder
} from "@/lib/billing/evercoin-payment-router";

export const runtime = "nodejs";
export const maxDuration = 30;

function sameSecret(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function validPayRamWebhook(request: Request) {
  const provided = request.headers.get("api-key")?.trim() || "";
  if (!provided) return false;

  const allowed = [
    process.env.PAYRAM_CARD_API_KEY?.trim(),
    process.env.PAYRAM_CRYPTO_API_KEY?.trim()
  ].filter((value): value is string => Boolean(value));

  return allowed.some((value) => sameSecret(provided, value));
}

function referenceFrom(value: Record<string, unknown> | null, request: Request) {
  const url = new URL(request.url);
  const candidates = [
    url.searchParams.get("reference_id"),
    url.searchParams.get("referenceID"),
    value?.reference_id,
    value?.referenceID,
    value?.referenceId
  ];
  return candidates.find((item) => typeof item === "string" && item.trim()) as
    | string
    | undefined;
}

async function handle(request: Request) {
  try {
    // PayRam documents the project API key in the API-Key webhook header.
    // Validate it before doing even the status lookup. Fulfillment still never
    // trusts webhook amount/status; it re-fetches the payment from PayRam.
    if (!validPayRamWebhook(request)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const payload =
      request.method === "POST"
        ? ((await request.json().catch(() => null)) as Record<string, unknown> | null)
        : null;
    const reference = referenceFrom(payload, request)?.trim();

    if (!reference) return NextResponse.json({ ok: true });

    const order = await getPaymentOrderByProviderReference("payram", reference);
    if (!order) return NextResponse.json({ ok: true });

    await refreshEverCoinPaymentOrder(order);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PayRam webhook refresh failed:", error);
    // A non-2xx response lets the gateway retry later.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
