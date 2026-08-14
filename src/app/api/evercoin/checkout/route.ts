import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import {
  createEverCoinCheckout,
  getEverCoinPack
} from "@/lib/billing/evercoin-packs";

const Body = z
  .object({ pack: z.enum(["500", "1000", "5000"]) })
  .strict();

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "SIGNUP_REQUIRED" },
        { status: 401 }
      );
    }

    const parsed = Body.safeParse(
      await request.json().catch(() => null)
    );

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const pack = getEverCoinPack(parsed.data.pack);
    if (!pack) {
      return NextResponse.json(
        { error: "INVALID_PACK" },
        { status: 400 }
      );
    }

    const configuredSiteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim();
    const requestOrigin = new URL(request.url).origin;

    const url = await createEverCoinCheckout({
      pack,
      userId: user.id,
      email:
        typeof user.email === "string"
          ? user.email
          : null,
      siteUrl: configuredSiteUrl || requestOrigin
    });

    return NextResponse.json(
      { url },
      {
        headers: {
          "Cache-Control": "private, no-store"
        }
      }
    );
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "CHECKOUT_FAILED";

    console.error("EverCoin Stripe checkout failed:", error);

    const safeToExpose =
      process.env.NODE_ENV !== "production" ||
      process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");

    return NextResponse.json(
      {
        error: "CHECKOUT_FAILED",
        message: safeToExpose ? detail : undefined
      },
      { status: 500 }
    );
  }
}
