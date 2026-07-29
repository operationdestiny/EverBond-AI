import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getCharacterVoiceConfig } from "@/lib/character-voice";
import {
  claimVoiceCallTurn,
  completeVoiceCallTurn,
  everCoinCallCostPerMinute,
  failVoiceCallTurn,
  prepareVoiceCallTurn
} from "@/lib/evercoin";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getCharacterBySlugForUser } from "@/lib/user-characters";
import {
  createVoiceAudioSignedUrl,
  inspectPcmWav,
  VOICE_CALL_AUDIO_BUCKET,
  voiceCallLimits,
  voiceMinuteTtsBudget
} from "@/lib/voice-call";
import {
  generateVoiceCharacterDraft,
  normalizeVoiceTranscript,
  updateVoiceMemoryAfterCommit
} from "@/lib/voice-chat";
import type { SupportedLanguage } from "@/lib/ai/prompts";
import { veniceApiUrl } from "@/lib/venice-media";

export const runtime = "nodejs";
export const maxDuration = 60;

const SupportedLanguageSchema = z.enum([
  "English",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Korean"
]);

const Meta = z
  .object({
    callId: z.string().uuid(),
    requestId: z.string().uuid(),
    characterSlug: z.string().trim().min(1).max(160),
    language: SupportedLanguageSchema,
    conversationId: z.string().uuid().optional()
  })
  .strict();

const STT_LANGUAGE: Record<SupportedLanguage, string> = {
  English: "en",
  Spanish: "es",
  French: "fr",
  German: "de",
  Japanese: "ja",
  Korean: "ko"
};

function providerMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const value = payload as Record<string, unknown>;
  if (typeof value.message === "string") return value.message.slice(0, 500);
  if (typeof value.error === "string") return value.error.slice(0, 500);
  return fallback;
}

async function transcribeAudio(audio: File, language: SupportedLanguage) {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) throw new Error("VENICE_NOT_CONFIGURED");

  const providerForm = new FormData();
  providerForm.set("file", audio, "voice.wav");
  providerForm.set(
    "model",
    process.env.VENICE_STT_MODEL || "openai/whisper-large-v3"
  );
  providerForm.set("response_format", "json");
  providerForm.set("timestamps", "false");
  providerForm.set("language", STT_LANGUAGE[language]);

  const response = await fetch(
    veniceApiUrl("audio/transcriptions"),
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: providerForm,
      signal: AbortSignal.timeout(45_000)
    }
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `TRANSCRIPTION_FAILED:${providerMessage(payload, String(response.status))}`
    );
  }

  const text = typeof payload?.text === "string" ? payload.text.trim() : "";
  return normalizeVoiceTranscript(text);
}

async function synthesizeSpeech(values: {
  characterSlug: string;
  character: Awaited<ReturnType<typeof getCharacterBySlugForUser>>;
  text: string;
  language: SupportedLanguage;
}) {
  const character = values.character;
  if (!character) throw new Error("CHARACTER_NOT_FOUND");

  const voice = getCharacterVoiceConfig(character);
  if (!voice) throw new Error("VOICE_NOT_CONFIGURED");

  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) throw new Error("VENICE_NOT_CONFIGURED");

  const response = await fetch(veniceApiUrl("audio/speech"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: voice.model,
      voice: voice.voice,
      input: values.text,
      language: values.language,
      prompt: voice.prompt,
      speed: voice.speed,
      temperature: voice.temperature,
      top_p: voice.topP,
      streaming: false,
      response_format: "opus"
    }),
    signal: AbortSignal.timeout(45_000)
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`SPEECH_FAILED:${response.status}:${detail}`);
  }

  const contentType =
    response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ||
    "audio/ogg";
  if (!contentType.startsWith("audio/") && contentType !== "application/ogg") {
    throw new Error("SPEECH_INVALID_FILE");
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) {
    throw new Error("SPEECH_INVALID_FILE");
  }

  return { buffer, contentType };
}

async function existingTurnResponse(values: {
  audioPath: string;
  transcript: string | null;
  reply: string | null;
  conversationId: string | null;
  inputTokens: number;
  outputTokens: number;
}) {
  return NextResponse.json(
    {
      ok: true,
      duplicate: true,
      transcript: values.transcript,
      reply: values.reply,
      conversationId: values.conversationId,
      audioUrl: await createVoiceAudioSignedUrl(values.audioPath),
      usage: {
        inputTokens: values.inputTokens,
        outputTokens: values.outputTokens
      }
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function POST(request: Request) {
  let userId = "";
  let callId = "";
  let requestId = "";
  let claimed = false;
  let uploadedPath = "";

  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "SIGNUP_REQUIRED" }, { status: 401 });
    }
    userId = user.id;

    const limits = voiceCallLimits();
    const maximumWavBytes = 44 + limits.maxAudioSeconds * 48_000 * 2;
    const contentLength = Number(request.headers.get("content-length"));

    if (
      Number.isFinite(contentLength) &&
      contentLength > maximumWavBytes + 64 * 1024
    ) {
      return NextResponse.json({ error: "AUDIO_TOO_LARGE" }, { status: 413 });
    }

    const form = await request.formData();
    const audio = form.get("audio");
    const parsed = Meta.safeParse({
      callId: String(form.get("callId") ?? ""),
      requestId: String(form.get("requestId") ?? ""),
      characterSlug: String(form.get("characterSlug") ?? ""),
      language: String(form.get("language") ?? "English"),
      conversationId: form.get("conversationId")
        ? String(form.get("conversationId"))
        : undefined
    });

    if (!parsed.success || !(audio instanceof File) || audio.size < 44) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    callId = parsed.data.callId;
    requestId = parsed.data.requestId;

    if (audio.size > maximumWavBytes) {
      return NextResponse.json({ error: "AUDIO_TOO_LARGE" }, { status: 413 });
    }

    const wavBuffer = Buffer.from(await audio.arrayBuffer());
    const wavInfo = inspectPcmWav(wavBuffer);
    if (wavInfo.durationSeconds > limits.maxAudioSeconds + 0.25) {
      return NextResponse.json(
        { error: "AUDIO_TOO_LONG", maxSeconds: limits.maxAudioSeconds },
        { status: 413 }
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

    const claim = await claimVoiceCallTurn({
      userId: user.id,
      callId,
      characterId: character.id,
      requestId,
      maxTurnsPerMinute: limits.maxTurnsPerMinute
    });

    if (claim.status === "completed" && claim.audioPath) {
      return existingTurnResponse({
        audioPath: claim.audioPath,
        transcript: claim.transcript,
        reply: claim.reply,
        conversationId: claim.conversationId,
        inputTokens: claim.inputTokens,
        outputTokens: claim.outputTokens
      });
    }

    if (claim.status === "busy") {
      return NextResponse.json({ error: "VOICE_TURN_BUSY" }, { status: 409 });
    }

    if (claim.status === "rate_limited") {
      return NextResponse.json(
        { error: "RATE_LIMITED", retryAfter: claim.retryAfterSeconds },
        {
          status: 429,
          headers: { "Retry-After": String(claim.retryAfterSeconds || 15) }
        }
      );
    }

    if (claim.status !== "claimed") {
      return NextResponse.json(
        { error: claim.status === "failed" ? "REQUEST_FAILED" : "INVALID_CALL" },
        { status: 409 }
      );
    }
    claimed = true;

    const billing = await prepareVoiceCallTurn({
      userId: user.id,
      callId,
      characterId: character.id,
      amount: everCoinCallCostPerMinute(),
      maxMinutes: limits.maxMinutes,
      idleTimeoutSeconds: limits.idleTimeoutSeconds
    });

    if (!billing.allowed) {
      await failVoiceCallTurn({
        userId: user.id,
        callId,
        requestId,
        errorCode: billing.errorCode || "CALL_BILLING_FAILED"
      }).catch(() => undefined);

      const insufficient =
        billing.errorCode === "INSUFFICIENT_EVERCOIN" ||
        billing.errorCode === "EVERCOIN_DEBT";

      return NextResponse.json(
        {
          error: billing.errorCode || "CALL_BILLING_FAILED",
          balance: billing.balance,
          debt: billing.debt,
          required: everCoinCallCostPerMinute()
        },
        { status: insufficient ? 402 : 409 }
      );
    }

    if (!billing.startedAt) throw new Error("CALL_START_TIME_MISSING");

    const ttsBudget = await voiceMinuteTtsBudget({
      userId: user.id,
      callId,
      startedAt: billing.startedAt,
      currentMinute: billing.currentMinute,
      maximumCharacters: limits.maxTtsCharactersPerMinute
    });

    if (ttsBudget.remaining < 80) {
      await failVoiceCallTurn({
        userId: user.id,
        callId,
        requestId,
        errorCode: "VOICE_MINUTE_TTS_LIMIT"
      }).catch(() => undefined);

      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          retryAfter: ttsBudget.retryAfterSeconds
        },
        {
          status: 429,
          headers: { "Retry-After": String(ttsBudget.retryAfterSeconds) }
        }
      );
    }

    const transcript = await transcribeAudio(audio, parsed.data.language);
    const generated = await generateVoiceCharacterDraft({
      userId: user.id,
      character,
      transcript,
      language: parsed.data.language,
      conversationId: parsed.data.conversationId,
      maxReplyCharacters: Math.min(
        limits.maxReplyCharacters,
        ttsBudget.remaining
      )
    });
    const speech = await synthesizeSpeech({
      characterSlug: parsed.data.characterSlug,
      character,
      text: generated.reply,
      language: parsed.data.language
    });

    uploadedPath = `${user.id}/${callId}/${requestId}.opus`;
    const upload = await getSupabaseServiceClient().storage
      .from(VOICE_CALL_AUDIO_BUCKET)
      .upload(uploadedPath, speech.buffer, {
        contentType: speech.contentType,
        upsert: false,
        cacheControl: "900"
      });

    if (upload.error) throw upload.error;

    const completed = await completeVoiceCallTurn({
      userId: user.id,
      callId,
      requestId,
      conversationId: generated.conversationId,
      transcript,
      reply: generated.reply,
      audioPath: uploadedPath,
      inputTokens: generated.inputTokens,
      outputTokens: generated.outputTokens
    });

    if (!completed) throw new Error("VOICE_TURN_COMPLETION_FAILED");

    const memoryUsage = await updateVoiceMemoryAfterCommit({
      userId: user.id,
      character,
      draft: generated
    });

    return NextResponse.json(
      {
        ok: true,
        transcript,
        reply: generated.reply,
        conversationId: generated.conversationId,
        audioUrl: await createVoiceAudioSignedUrl(uploadedPath),
        billing: {
          minute: billing.currentMinute,
          newlyCharged: billing.newlyCharged,
          balance: billing.balance
        },
        usage: {
          inputTokens: generated.inputTokens + memoryUsage.inputTokens,
          outputTokens: generated.outputTokens + memoryUsage.outputTokens,
          provider: generated.provider,
          model: generated.model,
          audioSeconds: Number(wavInfo.durationSeconds.toFixed(2))
        }
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    const errorCode =
      error instanceof Error ? error.message.slice(0, 200) : "VOICE_TURN_FAILED";

    if (uploadedPath) {
      await getSupabaseServiceClient().storage
        .from(VOICE_CALL_AUDIO_BUCKET)
        .remove([uploadedPath])
        .catch(() => undefined);
    }

    if (claimed && userId && callId && requestId) {
      await failVoiceCallTurn({ userId, callId, requestId, errorCode }).catch(
        () => undefined
      );
    }

    console.error("Voice turn failed:", error);
    return NextResponse.json(
      { error: "VOICE_TURN_FAILED" },
      { status: 500 }
    );
  }
}
