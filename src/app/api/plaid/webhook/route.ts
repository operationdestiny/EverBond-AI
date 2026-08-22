import { NextResponse } from "next/server";
import { syncPlaidTransactions, verifyPlaidWebhook } from "@/lib/plaid-bank";
import { reconcileCustomBankOrders } from "@/lib/custom-bank-payments";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const rawBody = await request.text();
  const verification = request.headers.get("plaid-verification");

  try {
    const valid = await verifyPlaidWebhook(rawBody, verification);
    if (!valid) {
      return NextResponse.json({ error: "INVALID_WEBHOOK" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as {
      webhook_type?: string;
      webhook_code?: string;
    };

    if (payload.webhook_type === "TRANSACTIONS" || payload.webhook_type === "ITEM") {
      await syncPlaidTransactions().catch((error) => {
        console.error("Plaid webhook sync failed:", error);
      });
      await reconcileCustomBankOrders().catch((error) => {
        console.error("Custom bank reconciliation failed:", error);
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Plaid webhook failed:", error);
    return NextResponse.json({ error: "WEBHOOK_FAILED" }, { status: 500 });
  }
}
