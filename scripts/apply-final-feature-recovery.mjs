#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
}

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (source.includes(from)) return source.replace(from, to);
  throw new Error(`Final feature recovery patch could not find: ${label}`);
}

function replaceBetweenRequired(
  source,
  startMarker,
  endMarker,
  replacement,
  alreadyPresent,
  label
) {
  if (alreadyPresent && source.includes(alreadyPresent)) return source;

  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);

  if (start < 0 || end < 0 || end <= start) {
    throw new Error(`Final feature recovery patch could not find: ${label}`);
  }

  return source.slice(0, start) + replacement + source.slice(end);
}

// ===========================================================================
// VIDEO
// Keep Kling O3 Standard R2V, the real character image identity element,
// dynamic EverCoin pricing, 8-second DB semantics, 9:16 framing, and no audio.
//
// Model-specific Venice Kling O3 documentation shows duration as "8", while
// the generic queue schema also exposes "8s". Try the model-specific form
// first and only try "8s" if Venice explicitly rejects the duration field.
// Retry one transient upstream failure without double-charging EverCoin.
// ===========================================================================

const videoRoutePath =
  "src/app/api/character-video-gallery/[slug]/route.ts";
let videoRoute = read(videoRoutePath);

const queueStartMarker =
  '    const providerResponse = await fetch(veniceApiUrl("video/queue"), {';
const queueEndMarker =
  "    queuedModel =";

if (!videoRoute.includes("const queueDurationVariants =")) {
  const queueStart = videoRoute.indexOf(queueStartMarker);
  const queueEnd = videoRoute.indexOf(queueEndMarker, queueStart);

  if (queueStart < 0 || queueEnd < 0 || queueEnd <= queueStart) {
    throw new Error(
      "Final feature recovery patch could not find: Kling queue request block"
    );
  }

  const queueReplacement = `    const queueDurationVariants = [
      String(parsed.data.durationSeconds),
      \`\${parsed.data.durationSeconds}s\`
    ];
    let payload: Record<string, any> | null = null;
    let lastQueueError = "";

    for (
      let durationIndex = 0;
      durationIndex < queueDurationVariants.length && !payload;
      durationIndex += 1
    ) {
      const queueDuration = queueDurationVariants[durationIndex];

      for (let attempt = 0; attempt < 2 && !payload; attempt += 1) {
        const providerResponse = await fetch(
          veniceApiUrl("video/queue"),
          {
            method: "POST",
            headers: providerHeaders(apiKey),
            body: JSON.stringify({
              model,
              prompt:
                \`@Element1 is the exact fictional adult character \${character.name}. \` +
                "Keep @Element1's recognizable face, identity, adult age, body, skin tone, hair, and defining appearance consistent throughout the video. " +
                "The user's request controls the action, pose, expression, clothing, scene, framing, and camera movement. " +
                parsed.data.prompt,
              duration: queueDuration,
              aspect_ratio: "9:16",
              audio: false,
              elements: [
                {
                  frontal_image_url: referenceImage
                }
              ]
            }),
            signal: AbortSignal.timeout(60_000)
          }
        );

        if (providerResponse.ok) {
          payload = (await providerResponse.json()) as Record<string, any>;
          break;
        }

        const detail = (await providerResponse.text()).slice(0, 500);
        lastQueueError =
          \`VIDEO_PROVIDER_QUEUE_FAILED:\${providerResponse.status}:\${detail}\`;

        const durationRejected =
          providerResponse.status === 400 &&
          /duration/i.test(detail);

        if (durationRejected && durationIndex === 0) {
          // Try Venice's generic "8s" spelling only when the model-specific
          // "8" spelling is explicitly rejected for duration.
          break;
        }

        const transient = [429, 500, 502, 503, 504].includes(
          providerResponse.status
        );

        if (transient && attempt === 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, providerResponse.status === 429 ? 1800 : 1200)
          );
          continue;
        }

        throw new Error(lastQueueError);
      }
    }

    if (!payload) {
      throw new Error(
        lastQueueError || "VIDEO_PROVIDER_QUEUE_FAILED"
      );
    }

`;

  videoRoute =
    videoRoute.slice(0, queueStart) +
    queueReplacement +
    videoRoute.slice(queueEnd);
}

if (
  !videoRoute.includes("const queueDurationVariants =") ||
  !videoRoute.includes('String(parsed.data.durationSeconds)') ||
  !videoRoute.includes('frontal_image_url: referenceImage') ||
  !videoRoute.includes('@Element1 is the exact fictional adult character') ||
  !videoRoute.includes('aspect_ratio: "9:16"') ||
  !videoRoute.includes("audio: false")
) {
  throw new Error("Final video recovery validation failed.");
}

write(videoRoutePath, videoRoute);

// ===========================================================================
// VOICE TURN RELIABILITY
// Preserve the permanent six-voice configuration, EverMemory-aware delivery,
// billing limits, and all call limits. Only make provider execution resilient:
// - allow enough server time for STT -> model -> TTS;
// - retry one transient STT/TTS provider error;
// - let Qwen TTS use its model-supported default output format;
// - store the resulting file using the actual returned MIME extension.
// ===========================================================================

const voiceTurnPath = "src/app/api/voice/turn/route.ts";
let voiceTurn = read(voiceTurnPath);

voiceTurn = replaceRequired(
  voiceTurn,
  'export const maxDuration = 60;',
  'export const maxDuration = 180;',
  "voice turn maxDuration"
);

const transcribeStart = "async function transcribeAudio(";
const synthesizeStart = "async function synthesizeSpeech(";
const existingTurnStart = "async function existingTurnResponse(";

if (!voiceTurn.includes("TRANSCRIPTION_TRANSIENT_RETRY")) {
  const transcribeIndex = voiceTurn.indexOf(transcribeStart);
  const synthesizeIndex = voiceTurn.indexOf(synthesizeStart, transcribeIndex);

  if (
    transcribeIndex < 0 ||
    synthesizeIndex < 0 ||
    synthesizeIndex <= transcribeIndex
  ) {
    throw new Error(
      "Final feature recovery patch could not find: voice transcription function"
    );
  }

  const transcribeFunction = `async function transcribeAudio(
  audio: File,
  language: SupportedLanguage
) {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) throw new Error("VENICE_NOT_CONFIGURED");

  let lastError = "TRANSCRIPTION_FAILED";

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const providerForm = new FormData();
    providerForm.set("file", audio, "voice.wav");
    providerForm.set(
      "model",
      process.env.VENICE_STT_MODEL ||
        "openai/whisper-large-v3"
    );
    providerForm.set("response_format", "json");
    providerForm.set("timestamps", "false");
    providerForm.set("language", STT_LANGUAGE[language]);

    const response = await fetch(
      veniceApiUrl("audio/transcriptions"),
      {
        method: "POST",
        headers: {
          Authorization: \`Bearer \${apiKey}\`
        },
        body: providerForm,
        signal: AbortSignal.timeout(60_000)
      }
    );

    const payload = await response
      .json()
      .catch(() => ({}));

    if (response.ok) {
      const text =
        typeof payload?.text === "string"
          ? payload.text.trim()
          : "";

      return normalizeVoiceTranscript(text);
    }

    lastError =
      \`TRANSCRIPTION_FAILED:\${providerMessage(
        payload,
        String(response.status)
      )}\`;

    if (
      [429, 500, 502, 503, 504].includes(response.status) &&
      attempt === 0
    ) {
      console.warn(
        "TRANSCRIPTION_TRANSIENT_RETRY",
        response.status
      );
      await new Promise((resolve) =>
        setTimeout(resolve, response.status === 429 ? 1500 : 900)
      );
      continue;
    }

    throw new Error(lastError);
  }

  throw new Error(lastError);
}

`;

  voiceTurn =
    voiceTurn.slice(0, transcribeIndex) +
    transcribeFunction +
    voiceTurn.slice(synthesizeIndex);
}

if (!voiceTurn.includes("TTS_TRANSIENT_RETRY")) {
  const synthesizeIndex = voiceTurn.indexOf(synthesizeStart);
  const existingIndex = voiceTurn.indexOf(
    existingTurnStart,
    synthesizeIndex
  );

  if (
    synthesizeIndex < 0 ||
    existingIndex < 0 ||
    existingIndex <= synthesizeIndex
  ) {
    throw new Error(
      "Final feature recovery patch could not find: voice synthesis function"
    );
  }

  const synthesizeFunction = `async function synthesizeSpeech(values: {
  characterSlug: string;
  character: Awaited<
    ReturnType<typeof getCharacterBySlugForUser>
  >;
  text: string;
  language: SupportedLanguage;
  memory: Awaited<
    ReturnType<typeof generateVoiceCharacterDraft>
  >["memory"];
}) {
  const character = values.character;
  if (!character) throw new Error("CHARACTER_NOT_FOUND");

  const voice = getCharacterVoiceConfig(character, {
    reply: values.text,
    emotionalState: values.memory.emotional_state,
    relationshipState: values.memory.relationship_state,
    currentScene: values.memory.current_scene
  });

  if (!voice) throw new Error("VOICE_NOT_CONFIGURED");

  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) throw new Error("VENICE_NOT_CONFIGURED");

  const speechPayload = {
    model: voice.model,
    voice: voice.voice,
    input: values.text,
    language: values.language,
    prompt: voice.prompt,
    speed: voice.speed,
    temperature: voice.temperature,
    top_p: voice.topP,
    streaming: false
  };

  let lastError = "SPEECH_FAILED";

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(
      veniceApiUrl("audio/speech"),
      {
        method: "POST",
        headers: {
          Authorization: \`Bearer \${apiKey}\`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(speechPayload),
        signal: AbortSignal.timeout(60_000)
      }
    );

    if (!response.ok) {
      const detail = (await response.text()).slice(
        0,
        500
      );

      lastError =
        \`SPEECH_FAILED:\${response.status}:\${detail}\`;

      if (
        [429, 500, 502, 503, 504].includes(response.status) &&
        attempt === 0
      ) {
        console.warn(
          "TTS_TRANSIENT_RETRY",
          response.status
        );
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            response.status === 429 ? 1500 : 900
          )
        );
        continue;
      }

      throw new Error(lastError);
    }

    const contentType =
      response.headers
        .get("content-type")
        ?.split(";")[0]
        .trim()
        .toLowerCase() || "audio/mpeg";

    if (
      !contentType.startsWith("audio/") &&
      contentType !== "application/ogg"
    ) {
      throw new Error("SPEECH_INVALID_FILE");
    }

    const buffer = Buffer.from(
      await response.arrayBuffer()
    );

    if (
      !buffer.length ||
      buffer.length > 5 * 1024 * 1024
    ) {
      throw new Error("SPEECH_INVALID_FILE");
    }

    const extension =
      contentType.includes("aac")
        ? "aac"
        : contentType.includes("ogg") ||
            contentType.includes("opus")
          ? "ogg"
          : contentType.includes("flac")
            ? "flac"
            : contentType.includes("wav")
              ? "wav"
              : contentType.includes("pcm")
                ? "pcm"
                : "mp3";

    return {
      buffer,
      contentType,
      extension
    };
  }

  throw new Error(lastError);
}

`;

  voiceTurn =
    voiceTurn.slice(0, synthesizeIndex) +
    synthesizeFunction +
    voiceTurn.slice(existingIndex);
}

voiceTurn = replaceRequired(
  voiceTurn,
  '    uploadedPath = `${user.id}/${callId}/${requestId}.opus`;',
  '    uploadedPath = `${user.id}/${callId}/${requestId}.${speech.extension}`;',
  "voice audio file extension"
);

if (
  !voiceTurn.includes('export const maxDuration = 180;') ||
  !voiceTurn.includes("TRANSCRIPTION_TRANSIENT_RETRY") ||
  !voiceTurn.includes("TTS_TRANSIENT_RETRY") ||
  !voiceTurn.includes("memory: generated.memory") ||
  !voiceTurn.includes("getCharacterVoiceConfig(character, {") ||
  !voiceTurn.includes("${speech.extension}") ||
  voiceTurn.includes('response_format: "opus"')
) {
  throw new Error("Final voice reliability validation failed.");
}

write(voiceTurnPath, voiceTurn);

// ===========================================================================
// VOICE CALL UI
// Keep all existing call/recording/billing logic. Only simplify the visible
// modal to the requested three elements:
//   character picture + Speak control + Hang Up control.
// A small error overlay remains only when something actually fails.
// ===========================================================================

const voiceModalPath =
  "src/components/media/VoiceCallModal.tsx";
let voiceModal = read(voiceModalPath);

voiceModal = voiceModal.replace(
  `  PhoneOff,\n  Sparkles\n`,
  `  PhoneOff\n`
);

if (!voiceModal.includes("data-everbond-simple-voice-call")) {
  const tailStartMarker = "  if (!open) return null;";
  const tailStart = voiceModal.indexOf(tailStartMarker);

  if (tailStart < 0) {
    throw new Error(
      "Final feature recovery patch could not find: voice modal render tail"
    );
  }

  const simpleTail = `  if (!open) return null;

  const speakBusy =
    !started ||
    status === "thinking" ||
    status === "speaking";

  return (
    <div
      data-everbond-simple-voice-call="true"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black p-5"
      role="dialog"
      aria-modal="true"
      aria-label={\`\${copy.liveCall}: \${character.name}\`}
    >
      <div className="flex h-full w-full max-w-xl flex-col items-center justify-center gap-6">
        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
          <img
            src={displayImage}
            alt={character.name}
            className="max-h-[72vh] max-w-full rounded-[2rem] border-2 border-bond-rose/70 object-contain shadow-[0_0_60px_rgba(255,92,168,0.24)]"
          />

          {error && (
            <p className="absolute bottom-3 left-1/2 w-[min(92%,520px)] -translate-x-1/2 rounded-xl border border-red-400/30 bg-black/85 px-4 py-2 text-center text-xs text-red-100 backdrop-blur">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-center gap-5 pb-3">
          <button
            type="button"
            disabled={speakBusy}
            onClick={() =>
              recording
                ? stopRecording()
                : void startRecording()
            }
            className="bond-pink-button inline-flex min-w-32 items-center justify-center gap-2 rounded-full border-2 border-bond-rose bg-bond-rose px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_28px_rgba(255,92,168,0.28)] disabled:cursor-not-allowed disabled:opacity-45"
            aria-label={
              recording
                ? copy.stopSpeaking
                : copy.tapToSpeak
            }
          >
            {status === "thinking" ||
            status === "speaking" ? (
              <LoaderCircle
                className="animate-spin"
                size={20}
              />
            ) : recording ? (
              <MicOff size={20} />
            ) : (
              <Mic size={20} />
            )}
            <span>
              {recording
                ? copy.stopSpeaking
                : copy.tapToSpeak}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              finishCall("user_hangup")
            }
            className="inline-flex min-w-32 items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_28px_rgba(220,38,38,0.34)]"
            aria-label={copy.hangUp}
          >
            <PhoneOff size={20} />
            <span>{copy.hangUp}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
`;

  voiceModal =
    voiceModal.slice(0, tailStart) +
    simpleTail;
}

if (
  !voiceModal.includes(
    'data-everbond-simple-voice-call="true"'
  ) ||
  !voiceModal.includes("copy.tapToSpeak") ||
  !voiceModal.includes("copy.hangUp") ||
  voiceModal.includes("<Sparkles")
) {
  throw new Error("Simple voice-call UI validation failed.");
}

write(voiceModalPath, voiceModal);

// ===========================================================================
// REFRESH CHAT SERVER
// Replace the generated DELETE handler with a reset that prioritizes clearing
// persisted visible history. Pending-request fail/refund cleanup is best-effort
// and cannot prevent the actual message reset.
// EverMemory, relationship state, and conversation memory_state are preserved.
// ===========================================================================

const chatRoutePath = "src/app/api/chat/route.ts";
let chatRoute = read(chatRoutePath);

const deleteStartMarker =
  "export async function DELETE(request: Request) {";
const postStartMarker =
  "export async function POST(request: Request) {";

if (!chatRoute.includes("CHAT_RESET_PERSISTED_HISTORY_CLEARED")) {
  const deleteStart = chatRoute.indexOf(deleteStartMarker);
  const postStart = chatRoute.indexOf(
    postStartMarker,
    deleteStart
  );

  if (
    deleteStart < 0 ||
    postStart < 0 ||
    postStart <= deleteStart
  ) {
    throw new Error(
      "Final feature recovery patch could not find: chat DELETE handler"
    );
  }

  const deleteHandler = `export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "SIGNUP_REQUIRED" },
        { status: 401 }
      );
    }

    const characterSlug =
      new URL(request.url).searchParams.get(
        "characterSlug"
      );

    if (!characterSlug) {
      return NextResponse.json(
        { error: "Missing characterSlug" },
        { status: 400 }
      );
    }

    const character =
      await getCharacterBySlugForUser(
        characterSlug,
        user.id
      );

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    const supabase =
      getSupabaseServiceClient();

    // Invalidate any in-flight request for this exact character. These
    // cleanups are intentionally best-effort; a refund bookkeeping problem
    // must never make the Refresh Chat button appear broken.
    const {
      data: pendingRequests,
      error: pendingError
    } = await supabase
      .from("chat_requests")
      .select("request_id")
      .eq("user_id", user.id)
      .eq("character_id", character.id)
      .eq("status", "pending");

    if (pendingError) {
      console.error(
        "Chat reset pending-request lookup failed:",
        pendingError
      );
    }

    for (const pending of pendingRequests ?? []) {
      const pendingRequestId = String(
        pending.request_id || ""
      );

      if (!pendingRequestId) continue;

      await failChatRequest({
        userId: user.id,
        requestId: pendingRequestId,
        errorCode: "CHAT_RESET"
      }).catch((cleanupError) => {
        console.error(
          "Chat reset request invalidation failed:",
          cleanupError
        );
      });

      await refundChatMessageCredit({
        userId: user.id,
        requestId: pendingRequestId
      }).catch((cleanupError) => {
        console.error(
          "Chat reset credit refund failed:",
          cleanupError
        );
      });
    }

    const {
      data: conversations,
      error: conversationError
    } = await supabase
      .from("conversations")
      .select("id,updated_at")
      .eq("user_id", user.id)
      .eq("character_id", character.id)
      .order("updated_at", {
        ascending: false
      });

    if (conversationError) {
      throw conversationError;
    }

    const conversationIds =
      (conversations ?? [])
        .map((conversation) =>
          String(conversation.id || "")
        )
        .filter(Boolean);

    if (conversationIds.length > 0) {
      const {
        error: messageDeleteError
      } = await supabase
        .from("messages")
        .delete()
        .in(
          "conversation_id",
          conversationIds
        );

      if (messageDeleteError) {
        throw messageDeleteError;
      }

      const {
        error: conversationUpdateError
      } = await supabase
        .from("conversations")
        .update({
          updated_at:
            new Date().toISOString()
        })
        .in("id", conversationIds);

      if (conversationUpdateError) {
        console.error(
          "Chat reset timestamp update failed:",
          conversationUpdateError
        );
      }
    }

    console.info(
      "CHAT_RESET_PERSISTED_HISTORY_CLEARED",
      {
        userId: user.id,
        characterId: character.id,
        conversations:
          conversationIds.length
      }
    );

    return NextResponse.json(
      {
        reset: true,
        conversationId:
          conversationIds[0] ?? null
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store"
        }
      }
    );
  } catch (error) {
    console.error(
      "Chat reset failed:",
      error
    );

    return NextResponse.json(
      { error: "CHAT_RESET_FAILED" },
      { status: 500 }
    );
  }
}

`;

  chatRoute =
    chatRoute.slice(0, deleteStart) +
    deleteHandler +
    chatRoute.slice(postStart);
}

if (
  !chatRoute.includes(
    "CHAT_RESET_PERSISTED_HISTORY_CLEARED"
  ) ||
  !chatRoute.includes(
    '.from("messages")'
  ) ||
  !chatRoute.includes(
    'errorCode: "CHAT_RESET"'
  )
) {
  throw new Error("Final chat reset server validation failed.");
}

write(chatRoutePath, chatRoute);

// ===========================================================================
// REFRESH CHAT CLIENT
// Make Refresh visibly happen immediately. The browser aborts/invalidates an
// old send, clears the pending sign-in message, and restores the opening
// message BEFORE waiting for the server DELETE. The server then synchronizes
// persisted history. No EverMemory is deleted.
// ===========================================================================

const chatShellPath =
  "src/components/chat/ChatShell.tsx";
let chatShell = read(chatShellPath);

if (!chatShell.includes("CHAT_RESET_OPTIMISTIC_CLEAR")) {
  const resetStartMarker =
    "  async function resetConversation() {";
  const shareStartMarker =
    "  function shareCompanion() {";

  const resetStart =
    chatShell.indexOf(resetStartMarker);
  const shareStart =
    chatShell.indexOf(
      shareStartMarker,
      resetStart
    );

  if (
    resetStart < 0 ||
    shareStart < 0 ||
    shareStart <= resetStart
  ) {
    throw new Error(
      "Final feature recovery patch could not find: chat reset client function"
    );
  }

  const resetFunction = `  async function resetConversation() {
    if (refreshingChat) return;

    chatGenerationRef.current += 1;
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    sendInFlightRef.current = false;

    setRefreshingChat(true);
    setIsTyping(false);
    setGiftError("");
    setChatError("");

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(
        pendingMessageStorageKey
      );
    }

    // CHAT_RESET_OPTIMISTIC_CLEAR
    // Give immediate visual feedback instead of making Refresh appear dead
    // while the server clears persisted history.
    setMessages([
      {
        role: "character",
        content: initialCharacterMessage
      }
    ]);
    setInput("");
    focusChatInput();

    try {
      if (session?.access_token) {
        const response = await fetch(
          \`/api/chat?characterSlug=\${encodeURIComponent(
            character.slug
          )}\`,
          {
            method: "DELETE",
            headers: {
              Authorization:
                \`Bearer \${session.access_token}\`
            },
            cache: "no-store"
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "CHAT_RESET_FAILED"
          );
        }

        setConversationId(
          data.conversationId ?? null
        );
      } else {
        setConversationId(null);
      }
    } catch (error) {
      console.error(
        "Chat reset failed:",
        error
      );
      setChatError(finalCopy.errors.chat);
    } finally {
      setRefreshingChat(false);
      focusChatInput();
    }
  }

`;

  chatShell =
    chatShell.slice(0, resetStart) +
    resetFunction +
    chatShell.slice(shareStart);
}

// Disable the existing refresh control while the server sync is active and
// animate the icon. Match only the button wired to resetConversation.
if (!chatShell.includes("disabled={refreshingChat}")) {
  const refreshButtonPattern = /<button\s+onClick=\{\(\) => void resetConversation\(\)\}[\s\S]*?aria-label=\{t\("refresh"\)\}[\s\S]*?<RefreshCcw size=\{15\} \/>[\s\S]*?<\/button>/;

  if (!refreshButtonPattern.test(chatShell)) {
    throw new Error(
      "Final feature recovery patch could not find: Refresh Chat button state"
    );
  }

  chatShell = chatShell.replace(
    refreshButtonPattern,
    `<button
              type="button"
              onClick={() => void resetConversation()}
              disabled={refreshingChat}
              className="bond-pink-button flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] text-white disabled:cursor-not-allowed disabled:opacity-55"
              aria-label={t("refresh")}
            >
              <RefreshCcw
                size={15}
                className={refreshingChat ? "animate-spin" : ""}
              />
            </button>`
  );
}

if (
  !chatShell.includes(
    "CHAT_RESET_OPTIMISTIC_CLEAR"
  ) ||
  !chatShell.includes(
    "disabled={refreshingChat}"
  ) ||
  !chatShell.includes(
    'method: "DELETE"'
  ) ||
  !chatShell.includes(
    "chatGenerationRef.current += 1"
  )
) {
  throw new Error("Final chat reset client validation failed.");
}

write(chatShellPath, chatShell);

console.log(
  "EverBond final video, voice-call, and Refresh Chat recovery applied."
);
