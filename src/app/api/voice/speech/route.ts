import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getCharacterVoiceConfig } from "@/lib/character-voice";
import { getCharacterBySlugForUser } from "@/lib/user-characters";

export const runtime = "nodejs";

const Body = z
  .object({
    characterSlug: z.string().trim().min(1).max(160),
    text: z.string().trim().min(1).max(4096),
    language: z
      .enum([
        "English",
        "Spanish",
        "French",
        "German",
        "Japanese",
        "Korean"
      ])
      .default("English")
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

    const voice = getCharacterVoiceConfig(character);

    if (!voice) {
      return NextResponse.json(
        { error: "VOICE_NOT_CONFIGURED" },
        { status: 409 }
      );
    }

    const apiKey = process.env.VENICE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "VENICE_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    const response = await fetch(
      "https://api.venice.ai/api/v1/audio/speech",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: voice.model,
          voice: voice.voice,
          input: parsed.data.text,
          language: parsed.data.language,
          prompt: voice.prompt,
          speed: voice.speed,
          temperature: voice.temperature,
          top_p: voice.topP,
          streaming: true,
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

    return new NextResponse(response.body, {
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
