import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "SIGNUP_REQUIRED" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const audio = formData.get("audio");
    const language = String(formData.get("language") ?? "").trim();

    if (!(audio instanceof File) || audio.size < 1) {
      return NextResponse.json(
        { error: "AUDIO_REQUIRED" },
        { status: 400 }
      );
    }

    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "AUDIO_TOO_LARGE" },
        { status: 413 }
      );
    }

    const apiKey = process.env.VENICE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "VENICE_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    const providerForm = new FormData();
    providerForm.set("file", audio, audio.name || "voice.webm");
    providerForm.set(
      "model",
      process.env.VENICE_STT_MODEL || "openai/whisper-large-v3"
    );
    providerForm.set("response_format", "json");
    providerForm.set("timestamps", "false");

    if (language) {
      providerForm.set("language", language);
    }

    const response = await fetch(
      "https://api.venice.ai/api/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        body: providerForm
      }
    );

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "TRANSCRIPTION_FAILED",
          message:
            typeof payload?.error === "string"
              ? payload.error
              : "Venice transcription failed."
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      text:
        typeof payload?.text === "string"
          ? payload.text.trim()
          : ""
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "TRANSCRIPTION_FAILED"
      },
      { status: 500 }
    );
  }
}
