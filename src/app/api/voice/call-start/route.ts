import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { chargeEverCoin } from "@/lib/evercoin";
import { getCharacterBySlugForUser } from "@/lib/user-characters";

const Body = z
  .object({
    characterSlug: z.string().trim().min(1).max(160)
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
        { error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const character = await getCharacterBySlugForUser(
      parsed.data.characterSlug,
      user.id
    );

    if (!character) {
      return NextResponse.json(
        { error: "CHARACTER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const cost = Math.max(
      Number(process.env.EVERCOIN_CALL_START_COST ?? 0) || 0,
      0
    );

    const result = await chargeEverCoin({
      userId: user.id,
      amount: cost,
      reason: "voice_call_start",
      referenceId: character.id
    });

    if (!result.charged) {
      return NextResponse.json(
        {
          error: "INSUFFICIENT_EVERCOIN",
          balance: result.balance,
          required: cost
        },
        { status: 402 }
      );
    }

    return NextResponse.json({
      ok: true,
      balance: result.balance,
      charged: cost
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "VOICE_CALL_START_FAILED"
      },
      { status: 500 }
    );
  }
}
