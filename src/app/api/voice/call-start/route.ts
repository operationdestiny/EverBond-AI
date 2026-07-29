import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getCharacterVoiceConfig } from "@/lib/character-voice";
import { chargeVoiceCallMinute } from "@/lib/evercoin";
import { getCharacterBySlugForUser } from "@/lib/user-characters";

const Body = z
  .object({
    characterSlug: z.string().trim().min(1).max(160)
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

    if (!getCharacterVoiceConfig(character)) {
      return NextResponse.json(
        { error: "VOICE_NOT_CONFIGURED" },
        { status: 409 }
      );
    }

    if (!process.env.VENICE_API_KEY) {
      return NextResponse.json(
        { error: "VENICE_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    const callId = crypto.randomUUID();
    const cost = callCostPerMinute();
    const result = await chargeVoiceCallMinute({
      userId: user.id,
      callId,
      characterId: character.id,
      minuteIndex: 1,
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
        callId,
        minuteIndex: 1,
        charged: cost,
        balance: result.balance
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
            : "VOICE_CALL_START_FAILED"
      },
      { status: 500 }
    );
  }
}
