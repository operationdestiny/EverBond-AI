import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import {
  creditEverCoinTransaction,
  fetchPaddleTransaction
} from "@/lib/billing/evercoin-fulfillment";

export const runtime = "nodejs";

const Body = z
  .object({
    transactionId: z
      .string()
      .regex(/^txn_[a-z0-9]{26}$/)
  })
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
        { error: "INVALID_TRANSACTION_ID" },
        { status: 400 }
      );
    }

    const transaction = await fetchPaddleTransaction(
      parsed.data.transactionId
    );

    if (!transaction) {
      return NextResponse.json(
        { error: "TRANSACTION_NOT_FOUND" },
        { status: 404 }
      );
    }

    const status =
      typeof transaction.status === "string"
        ? transaction.status.toLowerCase()
        : "";

    // Paddle.js checkout.completed can arrive just before Paddle finishes
    // converting a fully-paid transaction from "paid" to "completed".
    // Never credit early; let the client retry for a few seconds.
    if (status !== "completed") {
      if (
        status === "paid" ||
        status === "ready" ||
        status === "draft"
      ) {
        return NextResponse.json(
          { status: "pending" },
          {
            status: 202,
            headers: {
              "Cache-Control": "private, no-store"
            }
          }
        );
      }

      return NextResponse.json(
        {
          error: "TRANSACTION_NOT_COMPLETED",
          transactionStatus: status || null
        },
        { status: 409 }
      );
    }

    const result = await creditEverCoinTransaction(
      transaction,
      user.id
    );

    if (!result.handled) {
      return NextResponse.json(
        { error: "NOT_EVERCOIN_TRANSACTION" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: "credited",
        coins: result.coins,
        balance: result.balance,
        transactionId: result.transactionId
      },
      {
        headers: {
          "Cache-Control": "private, no-store"
        }
      }
    );
  } catch (error) {
    console.error(
      "EverCoin checkout finalization failed:",
      error
    );

    const detail =
      error instanceof Error
        ? error.message
        : "EVERCOIN_FINALIZATION_FAILED";

    const sandbox =
      process.env.PADDLE_ENVIRONMENT !== "production";

    return NextResponse.json(
      {
        error: "EVERCOIN_FINALIZATION_FAILED",
        message: sandbox ? detail : undefined
      },
      { status: 500 }
    );
  }
}
