import { NextResponse } from "next/server";
import { createPlaidLinkToken, requireEverBondOwner } from "@/lib/plaid-bank";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const owner = await requireEverBondOwner(request);
    if (!owner) {
      return NextResponse.json({ error: "OWNER_REQUIRED" }, { status: 403 });
    }

    const result = await createPlaidLinkToken(owner.id);
    return NextResponse.json(
      { linkToken: result.link_token, expiration: result.expiration },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Plaid link-token failed:", error);
    return NextResponse.json({ error: "PLAID_LINK_TOKEN_FAILED" }, { status: 500 });
  }
}
