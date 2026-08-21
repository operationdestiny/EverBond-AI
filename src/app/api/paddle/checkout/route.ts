import { NextResponse } from "next/server";
import { z } from "zod";
import { createPaddleCheckoutUrl } from "@/lib/billing/paddle";

const CheckoutRequest = z.object({
  plan: z.enum(["standard", "premium", "elite"]),
  email: z.string().email().optional()
});

export async function POST(request: Request) {
  const parsed = CheckoutRequest.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const url = await createPaddleCheckoutUrl({
      plan: parsed.data.plan,
      email: parsed.data.email
    });
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Paddle checkout failed" }, { status: 500 });
  }
}
