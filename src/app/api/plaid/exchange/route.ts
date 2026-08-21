import { NextResponse } from "next/server";
import { z } from "zod";
import {
  exchangePlaidPublicToken,
  requireEverBondOwner,
  syncPlaidTransactions
} from "@/lib/plaid-bank";

export const runtime = "nodejs";
export const maxDuration = 30;

const Body = z.object({
  publicToken: z.string().min(1),
  selectedAccountId: z.string().optional().nullable(),
  institutionId: z.string().optional().nullable(),
  institutionName: z.string().optional().nullable()
});

export async function POST(request: Request) {
  try {
    const owner = await requireEverBondOwner(request);
    if (!owner) {
      return NextResponse.json({ error: "OWNER_REQUIRED" }, { status: 403 });
    }

    const parsed = Body.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    const result = await exchangePlaidPublicToken({
      ownerUserId: owner.id,
      publicToken: parsed.data.publicToken,
      selectedAccountId: parsed.data.selectedAccountId,
      institutionId: parsed.data.institutionId,
      institutionName: parsed.data.institutionName
    });

    await syncPlaidTransactions().catch((error) => {
      console.warn("Initial Plaid transaction sync failed:", error);
    });

    return NextResponse.json({ connected: true, ...result });
  } catch (error) {
    console.error("Plaid public-token exchange failed:", error);
    return NextResponse.json({ error: "PLAID_EXCHANGE_FAILED" }, { status: 500 });
  }
}
