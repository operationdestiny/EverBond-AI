import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import {
  createEverCoinCheckout,
  getEverCoinPack
} from "@/lib/billing/evercoin-packs";

const Body = z
  .object({
    pack: z.enum(["1000", "5000", "10000"])
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
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    const pack = getEverCoinPack(parsed.data.pack);
    if (!pack) {
      return NextResponse.json({ error: "INVALID_PACK" }, { status: 400 });
    }

    const url = await createEverCoinCheckout({
      pack,
      userId: user.id,
      email: user.email
    });

    return NextResponse.json(
      { url },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("EverCoin checkout failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "CHECKOUT_FAILED"
      },
      { status: 500 }
    );
  }
}
