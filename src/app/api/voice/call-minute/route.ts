import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { chargeVoiceCallMinute } from "@/lib/evercoin";
import { getCharacterBySlugForUser } from "@/lib/user-characters";

const Body = z
  .object({
    characterSlug: z.string().trim().min(1).max(160),
    callId: z.string().uuid(),
    minuteIndex: z.number().int().min(2).max(1440)
  })
  .strict();

function callCostPerMinute() {
  return Math.max(
    Math.trunc(
      Number(
        process.env.EVERCOIN_CALL_COST_PER_MINUTE ??
          process.env.EVERCOIN_CALL_START_COST ??
          0
      ) || 0
    ),
    0
  );
}

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

    const cost = callCostPerMinute();
    const result = await chargeVoiceCallMinute({
      userId: user.id,
      callId: parsed.data.callId,
      characterId: character.id,
      minuteIndex: parsed.data.minuteIndex,
      amount: cost
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

    return NextResponse.json(
      {
        ok: true,
        minuteIndex: parsed.data.minuteIndex,
        charged: result.alreadyCharged ? 0 : cost,
        balance: result.balance,
        alreadyCharged: result.alreadyCharged
      },
      {
        headers: {
          "Cache-Control": "private, no-store"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "VOICE_CALL_CHARGE_FAILED"
      },
      { status: 500 }
    );
  }
}
