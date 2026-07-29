import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getCharacterVoiceConfig } from "@/lib/character-voice";
import {
  everCoinCallCostPerMinute,
  startVoiceCall
} from "@/lib/evercoin";
import { getCharacterBySlugForUser } from "@/lib/user-characters";
import { removeEndedCallAudio, voiceCallLimits } from "@/lib/voice-call";

export const runtime = "nodejs";

const Body = z
  .object({
    characterSlug: z.string().trim().min(1).max(160)
  })
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

    const limits = voiceCallLimits();
    const cost = everCoinCallCostPerMinute();
    const result = await startVoiceCall({
      userId: user.id,
      characterId: character.id,
      amount: cost,
      maxMinutes: limits.maxMinutes
    });

    if (!result.started || !result.callId) {
      const insufficient =
        result.errorCode === "INSUFFICIENT_EVERCOIN" ||
        result.errorCode === "EVERCOIN_DEBT";

      return NextResponse.json(
        {
          error: result.errorCode || "VOICE_CALL_START_FAILED",
          balance: result.balance,
          debt: result.debt,
          required: cost
        },
        { status: insufficient ? 402 : 409 }
      );
    }

    await removeEndedCallAudio(user.id).catch((cleanupError) => {
      console.error("Old voice audio cleanup failed:", cleanupError);
    });

    return NextResponse.json(
      {
        ok: true,
        callId: result.callId,
        startedAt: result.startedAt,
        paidThrough: result.paidThrough,
        maxEndsAt: result.maxEndsAt,
        charged: cost,
        balance: result.balance,
        costPerMinute: cost,
        limits: {
          maxMinutes: limits.maxMinutes,
          idleTimeoutSeconds: limits.idleTimeoutSeconds,
          maxAudioSeconds: limits.maxAudioSeconds,
          maxTurnsPerMinute: limits.maxTurnsPerMinute,
          maxTtsCharactersPerMinute: limits.maxTtsCharactersPerMinute
        }
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Voice call start failed:", error);
    return NextResponse.json(
      { error: "VOICE_CALL_START_FAILED" },
      { status: 500 }
    );
  }
}
