import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";

export const runtime = "nodejs";

const ALLOWED_LANGUAGES = new Set(["en", "es", "fr", "de", "ja", "ko"]);
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "SIGNUP_REQUIRED" },
        { status: 401 }
      );
    }

    const form = await request.formData();
    const audio = form.get("audio");
    const requestedLanguage = String(form.get("language") ?? "").toLowerCase();

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

    if (ALLOWED_LANGUAGES.has(requestedLanguage)) {
      providerForm.set("language", requestedLanguage);
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
            typeof payload?.message === "string"
              ? payload.message
              : typeof payload?.error === "string"
                ? payload.error
                : "Voice transcription failed."
        },
        { status: response.status }
      );
    }

    const text =
      typeof payload?.text === "string"
        ? payload.text.trim()
        : "";

    if (!text) {
      return NextResponse.json(
        { error: "EMPTY_TRANSCRIPTION" },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { text },
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
            : "TRANSCRIPTION_FAILED"
      },
      { status: 500 }
    );
  }
}
