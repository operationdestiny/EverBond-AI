import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import {
  createMessageBundleCheckout,
  getMessageBundle
} from "@/lib/billing/message-bundles";

const Body = z
  .object({ bundle: z.enum(["500", "1000", "1500"]) })
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

    const bundle = getMessageBundle(parsed.data.bundle);
    if (!bundle) {
      return NextResponse.json({ error: "INVALID_BUNDLE" }, { status: 400 });
    }

    const url = await createMessageBundleCheckout({
      bundle,
      userId: user.id,
      email: user.email
    });

    return NextResponse.json(
      { url },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Message bundle checkout failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "CHECKOUT_FAILED"
      },
      { status: 500 }
    );
  }
}
