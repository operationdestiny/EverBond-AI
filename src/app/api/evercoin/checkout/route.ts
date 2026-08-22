import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import {
  configuredPaymentRails,
  createEverCoinPaymentCheckout
} from "@/lib/billing/evercoin-payment-router";

export const runtime = "nodejs";
export const maxDuration = 30;

// Bundle checkout is retained only for non-bank legacy/provider rails.
// New bank purchases use /api/evercoin/bank/custom-checkout.
const Body = z
  .object({
    rail: z.enum(["card", "crypto"]),
    pack: z.enum(["500", "1000", "5000"])
  })
  .strict();

export async function GET() {
  return NextResponse.json(
    { rails: await configuredPaymentRails() },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "SIGNUP_REQUIRED" }, { status: 401 });
    }

    const parsed = Body.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    const email = typeof user.email === "string" ? user.email.trim() : "";
    if (!email) {
      return NextResponse.json({ error: "ACCOUNT_EMAIL_REQUIRED" }, { status: 400 });
    }

    const checkout = await createEverCoinPaymentCheckout({
      rail: parsed.data.rail,
      packCode: parsed.data.pack,
      userId: user.id,
      email
    });

    return NextResponse.json(checkout, {
      headers: { "Cache-Control": "private, no-store" }
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "CHECKOUT_FAILED";
    console.error("EverCoin payment-router checkout failed:", error);

    const notConfigured = detail === "PAYRAM_NOT_CONFIGURED";

    return NextResponse.json(
      {
        error: notConfigured ? "PAYMENT_RAIL_NOT_CONFIGURED" : "CHECKOUT_FAILED",
        message: process.env.NODE_ENV === "production" ? undefined : detail
      },
      { status: notConfigured ? 503 : 500 }
    );
  }
}
