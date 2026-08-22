import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { markCustomBankOrderSent } from "@/lib/custom-bank-payments";

export const runtime = "nodejs";
export const maxDuration = 30;

const Body = z.object({ orderId: z.string().uuid() }).strict();

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "SIGNUP_REQUIRED" }, { status: 401 });
    }

    const parsed = Body.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_ORDER_ID" }, { status: 400 });
    }

    const result = await markCustomBankOrderSent({
      userId: user.id,
      orderId: parsed.data.orderId
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store" }
    });
  } catch (error) {
    console.error("Mark custom bank payment sent failed:", error);
    return NextResponse.json({ error: "BANK_SENT_FAILED" }, { status: 500 });
  }
}
