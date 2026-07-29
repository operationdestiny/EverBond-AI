import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getCharacterBySlugForUser } from "@/lib/user-characters";

const Body = z
  .object({
    characterSlug: z.string().trim().min(1).max(160),
    text: z.string().trim().min(1).max(4096),
    language: z
      .enum(["English", "Spanish", "French", "German", "Japanese", "Korean"])
      .default("English")
  })
  .strict();

function objectFrom(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
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

    const apiKey = process.env.VENICE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "VENICE_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    const flags = objectFrom(character.featureFlags);
    const voice =
      (typeof flags.voice_id === "string" && flags.voice_id.trim()
        ? flags.voice_id.trim()
        : process.env.VENICE_TTS_DEFAULT_VOICE?.trim()) || "";

    if (!voice) {
      return NextResponse.json(
        { error: "VOICE_NOT_CONFIGURED" },
        { status: 409 }
      );
    }

    const stylePrompt =
      (typeof flags.voice_prompt === "string" &&
      flags.voice_prompt.trim()
        ? flags.voice_prompt.trim()
        : "Warm, intimate, emotionally expressive, natural and conversational. Speak with gentle affection and subtle playful tension.");

    const speed =
      typeof flags.voice_speed === "number"
        ? flags.voice_speed
        : 0.96;

    const response = await fetch(
      "https://api.venice.ai/api/v1/audio/speech",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model:
            process.env.VENICE_TTS_CALL_MODEL ||
            "tts-qwen3-1-7b",
          voice,
          input: parsed.data.text,
          language: parsed.data.language,
          prompt: stylePrompt,
          speed,
          temperature: 0.8,
          top_p: 0.95,
          streaming: false,
          response_format: "opus"
        })
      }
    );

    if (!response.ok) {
      const message = await response.text();

      return NextResponse.json(
        {
          error: "SPEECH_FAILED",
          message
        },
        { status: response.status }
      );
    }

    return new NextResponse(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "audio/ogg",
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "SPEECH_FAILED"
      },
      { status: 500 }
    );
  }
}
