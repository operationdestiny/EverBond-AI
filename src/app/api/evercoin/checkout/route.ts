import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import {
  createTributeEverCoinCheckout,
  tributeConfigured,
  TRIBUTE_MAX_AMOUNT_MINOR,
  TRIBUTE_MIN_AMOUNT_MINOR
} from "@/lib/tribute-payments";

export const runtime = "nodejs";
export const maxDuration = 30;

const Body = z
  .object({
    amountMinor: z
      .number()
      .int()
      .min(TRIBUTE_MIN_AMOUNT_MINOR)
      .max(TRIBUTE_MAX_AMOUNT_MINOR)
  })
  .strict();

export async function GET() {
  return NextResponse.json(
    {
      tribute: tributeConfigured(),
      minAmountMinor: TRIBUTE_MIN_AMOUNT_MINOR,
      maxAmountMinor: TRIBUTE_MAX_AMOUNT_MINOR
    },
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
      return NextResponse.json({ error: "INVALID_AMOUNT" }, { status: 400 });
    }

    const email = typeof user.email === "string" ? user.email.trim() : "";
    if (!email) {
      return NextResponse.json({ error: "ACCOUNT_EMAIL_REQUIRED" }, { status: 400 });
    }

    const checkout = await createTributeEverCoinCheckout({
      userId: user.id,
      email,
      amountMinor: parsed.data.amountMinor,
      origin: new URL(request.url).origin
    });

    return NextResponse.json(checkout, {
      headers: { "Cache-Control": "private, no-store" }
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "CHECKOUT_FAILED";
    console.error("Tribute EverCoin checkout failed:", error);

    const notConfigured = detail === "TRIBUTE_NOT_CONFIGURED";
    return NextResponse.json(
      {
        error: notConfigured ? "PAYMENT_RAIL_NOT_CONFIGURED" : "CHECKOUT_FAILED",
        message: process.env.NODE_ENV === "production" ? undefined : detail
      },
      { status: notConfigured ? 503 : 500 }
    );
  }
}
