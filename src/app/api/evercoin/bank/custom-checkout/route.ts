import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { reserveCustomBankOrder } from "@/lib/custom-bank-payments";

export const runtime = "nodejs";
export const maxDuration = 30;

const Body = z
  .object({
    amountMinor: z.number().int().min(6).max(1_000_000)
  })
  .strict();

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

    const checkout = await reserveCustomBankOrder({
      userId: user.id,
      requestedAmountMinor: parsed.data.amountMinor
    });

    return NextResponse.json(checkout, {
      headers: { "Cache-Control": "private, no-store" }
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "CHECKOUT_FAILED";

    if (detail === "BANK_AMOUNT_SLOTS_BUSY") {
      return NextResponse.json(
        { error: "BANK_AMOUNT_SLOTS_BUSY" },
        {
          status: 409,
          headers: {
            "Cache-Control": "private, no-store",
            "Retry-After": "2"
          }
        }
      );
    }

    const notConfigured =
      detail === "BANK_RAIL_NOT_CONFIGURED" ||
      detail === "PLAID_BANK_NOT_CONNECTED";

    console.error("Custom bank checkout failed:", error);
    return NextResponse.json(
      {
        error: notConfigured ? "PAYMENT_RAIL_NOT_CONFIGURED" : "CHECKOUT_FAILED"
      },
      { status: notConfigured ? 503 : 500 }
    );
  }
}
