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
  throw new Error(`Final runtime fix could not find: ${label}`);
}

// ===========================================================================
// PROFILE REFRESH BUTTON
// The character-profile refresh icon was only a Link to /chat/[slug].
// Make it reset the authenticated persisted chat first, then navigate.
// ===========================================================================

const profilePath =
  "src/components/character/CharacterProfileShell.tsx";
let profile = read(profilePath);

if (!profile.includes(
  'import { useAuth } from "@/components/auth/AuthProvider";'
)) {
  profile = replaceRequired(
    profile,
    'import { FavoriteButton } from "@/components/character/FavoriteButton";',
    'import { FavoriteButton } from "@/components/character/FavoriteButton";\nimport { useAuth } from "@/components/auth/AuthProvider";',
    "profile AuthProvider import"
  );
}

if (!profile.includes("PROFILE_REFRESH_RESETS_CHAT")) {
  profile = replaceRequired(
    profile,
    '  const { t, language } = useSiteLanguage();',
    `  const { t, language } = useSiteLanguage();
  const {
    session,
    authReady,
    openCharacterAuthModal
  } = useAuth();
  const [refreshingChat, setRefreshingChat] =
    useState(false);`,
    "profile auth state"
  );

  profile = replaceRequired(
    profile,
    '  function shareCompanion() {',
    `  // PROFILE_REFRESH_RESETS_CHAT
  async function refreshConversation() {
    if (!authReady || refreshingChat) return;

    if (!session?.access_token) {
      openCharacterAuthModal({
        name: character.name,
        image: character.image
      });
      return;
    }

    setRefreshingChat(true);

    try {
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

      const payload = await response
        .json()
        .catch(() => ({}));

      if (
        !response.ok ||
        typeof payload?.conversationId !== "string" ||
        !payload.conversationId
      ) {
        throw new Error(
          payload?.error || "CHAT_RESET_FAILED"
        );
      }

      window.location.assign(
        \`/chat/\${character.slug}?fresh=\${encodeURIComponent(
          payload.conversationId
        )}\`
      );
    } catch (error) {
      console.error(
        "Profile chat refresh failed:",
        error
      );
      setRefreshingChat(false);
    }
  }

  function shareCompanion() {`,
    "profile refresh function"
  );

  const label =
    'aria-label={t("refresh")}';
  const labelIndex =
    profile.indexOf(label);

  if (labelIndex < 0) {
    throw new Error(
      "Final runtime fix could not find: profile refresh label"
    );
  }

  const linkStart =
    profile.lastIndexOf("<Link", labelIndex);
  const linkEndStart =
    profile.indexOf("</Link>", labelIndex);

  if (
    linkStart < 0 ||
    linkEndStart < 0 ||
    linkEndStart <= linkStart
  ) {
    throw new Error(
      "Final runtime fix could not find: profile refresh Link"
    );
  }

  const linkEnd =
    linkEndStart + "</Link>".length;
  const existingRefresh =
    profile.slice(linkStart, linkEnd);

  if (
    !existingRefresh.includes(
      'href={`/chat/${character.slug}`}'
    ) ||
    !existingRefresh.includes(
      "<RefreshCcw"
    )
  ) {
    throw new Error(
      "Final runtime fix found the wrong profile control."
    );
  }

  const refreshButton = `<button
                    type="button"
                    onClick={() => void refreshConversation()}
                    disabled={!authReady || refreshingChat}
                    className="bond-pink-button flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] text-white disabled:cursor-not-allowed disabled:opacity-55"
                    aria-label={t("refresh")}
                  >
                    <RefreshCcw
                      size={17}
                      className={
                        refreshingChat ? "animate-spin" : ""
                      }
                    />
                  </button>`;

  profile =
    profile.slice(0, linkStart) +
    refreshButton +
    profile.slice(linkEnd);
}

if (
  !profile.includes("PROFILE_REFRESH_RESETS_CHAT") ||
  !profile.includes('method: "DELETE"') ||
  !profile.includes(
    'disabled={!authReady || refreshingChat}'
  )
) {
  throw new Error(
    "Profile Refresh Chat final validation failed."
  );
}

write(profilePath, profile);

// ===========================================================================
// VOICE
// Keep current visual design, permanent six voices, EverMemory, billing,
// call limits, and current STT/model selection. Fix only the live MP3 format
// mismatch plus provider-stage timeouts and diagnostics.
// ===========================================================================

const voiceTurnPath =
  "src/app/api/voice/turn/route.ts";
let voiceTurn = read(voiceTurnPath);

voiceTurn = replaceRequired(
  voiceTurn,
  'export const maxDuration = 180;',
  'export const maxDuration = 300;',
  "voice execution ceiling 180 to 300"
);

voiceTurn = replaceRequired(
  voiceTurn,
  'export const maxDuration = 60;',
  'export const maxDuration = 300;',
  "voice execution ceiling 60 to 300"
);

voiceTurn = replaceRequired(
  voiceTurn,
  'response_format: "opus"',
  'response_format: "mp3"',
  "Qwen MP3 output"
);

voiceTurn = replaceRequired(
  voiceTurn,
  '    "audio/ogg";',
  '    "audio/mpeg";',
  "MP3 fallback MIME"
);

voiceTurn = replaceRequired(
  voiceTurn,
  'uploadedPath = `${user.id}/${callId}/${requestId}.opus`;',
  'uploadedPath = `${user.id}/${callId}/${requestId}.mp3`;',
  "MP3 storage path"
);

// Raise only the two explicit Venice media timeouts.
// Keep the configured STT model selection exactly as the existing route has it.
const transcriptionStart =
  voiceTurn.indexOf("async function transcribeAudio(");
const synthesisStart =
  voiceTurn.indexOf(
    "async function synthesizeSpeech(",
    transcriptionStart
  );
const existingTurnStart =
  voiceTurn.indexOf(
    "async function existingTurnResponse(",
    synthesisStart
  );

if (
  transcriptionStart < 0 ||
  synthesisStart < 0 ||
  existingTurnStart < 0
) {
  throw new Error(
    "Voice provider function boundaries not found."
  );
}

let transcriptionSection =
  voiceTurn.slice(
    transcriptionStart,
    synthesisStart
  );

if (
  transcriptionSection.includes(
    "AbortSignal.timeout(45_000)"
  )
) {
  transcriptionSection =
    transcriptionSection.replace(
      "AbortSignal.timeout(45_000)",
      "AbortSignal.timeout(90_000)"
    );
} else if (
  !transcriptionSection.includes(
    "AbortSignal.timeout(90_000)"
  )
) {
  throw new Error(
    "Voice STT timeout anchor not found."
  );
}

voiceTurn =
  voiceTurn.slice(0, transcriptionStart) +
  transcriptionSection +
  voiceTurn.slice(synthesisStart);

const synthesisStart2 =
  voiceTurn.indexOf("async function synthesizeSpeech(");
const existingTurnStart2 =
  voiceTurn.indexOf(
    "async function existingTurnResponse(",
    synthesisStart2
  );

let synthesisSection =
  voiceTurn.slice(
    synthesisStart2,
    existingTurnStart2
  );

if (
  synthesisSection.includes(
    "AbortSignal.timeout(45_000)"
  )
) {
  synthesisSection =
    synthesisSection.replace(
      "AbortSignal.timeout(45_000)",
      "AbortSignal.timeout(120_000)"
    );
} else if (
  !synthesisSection.includes(
    "AbortSignal.timeout(120_000)"
  )
) {
  throw new Error(
    "Voice TTS timeout anchor not found."
  );
}

voiceTurn =
  voiceTurn.slice(0, synthesisStart2) +
  synthesisSection +
  voiceTurn.slice(existingTurnStart2);

if (!voiceTurn.includes("VOICE_STAGE_DIAGNOSTICS")) {
  voiceTurn = replaceRequired(
    voiceTurn,
    '  let uploadedPath = "";',
    `  let uploadedPath = "";
  // VOICE_STAGE_DIAGNOSTICS
  let voiceStage = "setup";`,
    "voice stage state"
  );

  voiceTurn = replaceRequired(
    voiceTurn,
    "    const transcript = await transcribeAudio(audio, parsed.data.language);",
    `    voiceStage = "stt";
    const transcript = await transcribeAudio(
      audio,
      parsed.data.language
    );

    voiceStage = "ai";`,
    "voice STT stage"
  );

  voiceTurn = replaceRequired(
    voiceTurn,
    "    const speech = await synthesizeSpeech({",
    `    voiceStage = "tts";
    const speech = await synthesizeSpeech({`,
    "voice TTS stage"
  );

  voiceTurn = replaceRequired(
    voiceTurn,
    '    uploadedPath = `${user.id}/${callId}/${requestId}.mp3`;',
    `    voiceStage = "storage";
    uploadedPath =
      \`\${user.id}/\${callId}/\${requestId}.mp3\`;`,
    "voice storage stage"
  );

  voiceTurn = replaceRequired(
    voiceTurn,
    "    const completed = await completeVoiceCallTurn({",
    `    voiceStage = "complete";
    const completed = await completeVoiceCallTurn({`,
    "voice completion stage"
  );

  voiceTurn = replaceRequired(
    voiceTurn,
    '    console.error("Voice turn failed:", error);',
    `    console.error(
      "Voice turn failed:",
      {
        stage: voiceStage,
        error
      }
    );`,
    "voice stage log"
  );
}

if (
  !voiceTurn.includes(
    'export const maxDuration = 300;'
  ) ||
  !voiceTurn.includes(
    'response_format: "mp3"'
  ) ||
  !voiceTurn.includes(
    "AbortSignal.timeout(90_000)"
  ) ||
  !voiceTurn.includes(
    "AbortSignal.timeout(120_000)"
  ) ||
  !voiceTurn.includes(
    "VOICE_STAGE_DIAGNOSTICS"
  ) ||
  voiceTurn.includes(
    'response_format: "opus"'
  )
) {
  throw new Error(
    "Voice-only runtime validation failed."
  );
}

write(voiceTurnPath, voiceTurn);



// ===========================================================================
// VOICE CALL LATENCY
//
// Keep text chat behavior unchanged. These changes apply voice-specific
// latency controls and move voice EverMemory extraction after the response.
// ===========================================================================

const providerPath = "src/lib/ai/provider.ts";
let provider = read(providerPath);

if (!provider.includes("skipSimilarityRetry?: boolean")) {
  provider = replaceRequired(
    provider,
    `async function postChatCompletion(
  endpoint: string,
  apiKey: string,
  body: Record<string, unknown>
) {`,
    `async function postChatCompletion(
  endpoint: string,
  apiKey: string,
  body: Record<string, unknown>,
  timeoutMs?: number
) {`,
    "AI provider optional timeout parameter"
  );

  provider = replaceRequired(
    provider,
    `    body: JSON.stringify(body)
  });`,
    `    body: JSON.stringify(body),
    signal:
      timeoutMs && timeoutMs > 0
        ? AbortSignal.timeout(timeoutMs)
        : undefined
  });`,
    "AI provider timeout signal"
  );

  provider = replaceRequired(
    provider,
    `export async function callEverBondModel(
  messages: EverBondMessage[]
): Promise<EverBondModelResult> {`,
    `export async function callEverBondModel(
  messages: EverBondMessage[],
  options?: {
    timeoutMs?: number;
    skipSimilarityRetry?: boolean;
  }
): Promise<EverBondModelResult> {`,
    "AI model voice options"
  );

  provider = replaceRequired(
    provider,
    `  const firstData: any = await postChatCompletion(
    endpoint,
    config.apiKey,
    buildRequestBody(messages)
  );`,
    `  const firstData: any = await postChatCompletion(
    endpoint,
    config.apiKey,
    buildRequestBody(messages),
    options?.timeoutMs
  );`,
    "AI first call voice timeout"
  );

  provider = replaceRequired(
    provider,
    `  if (
    previousAssistantReply &&
    isTooSimilarToPreviousReply(`,
    `  if (
    !options?.skipSimilarityRetry &&
    previousAssistantReply &&
    isTooSimilarToPreviousReply(`,
    "voice skip anti-repeat retry"
  );

  provider = replaceRequired(
    provider,
    `    const retryData: any = await postChatCompletion(
      endpoint,
      config.apiKey,
      buildRequestBody(retryMessages)
    );`,
    `    const retryData: any = await postChatCompletion(
      endpoint,
      config.apiKey,
      buildRequestBody(retryMessages),
      options?.timeoutMs
    );`,
    "AI retry timeout"
  );
}

if (
  !provider.includes("skipSimilarityRetry?: boolean") ||
  !provider.includes("AbortSignal.timeout(timeoutMs)")
) {
  throw new Error(
    "Voice-specific AI timeout validation failed."
  );
}

write(providerPath, provider);

const voiceChatPath = "src/lib/voice-chat.ts";
let voiceChat = read(voiceChatPath);

voiceChat = replaceRequired(
  voiceChat,
  `  const voiceInstruction =
    "LIVE VOICE CALL: Reply as natural spoken dialogue with concise actions. " +
    "Use roughly 45-65 visible tokens when detail is needed, fewer for simple moments, " +
    "and never exceed 75 visible tokens. Do not use markdown headings or long narration.";`,
  `  const voiceInstruction =
    "LIVE VOICE CALL: Reply as natural spoken dialogue with very concise actions. " +
    "Use roughly 20-35 visible tokens for most turns, fewer for simple moments, " +
    "and never exceed 45 visible tokens. Keep the response immediately speakable. " +
    "Do not use markdown headings or long narration.";`,
  "short live voice replies"
);

voiceChat = replaceRequired(
  voiceChat,
  `  const result = await callEverBondModel(modelMessages);`,
  `  const result = await callEverBondModel(
    modelMessages,
    {
      timeoutMs: 18_000,
      skipSimilarityRetry: true
    }
  );`,
  "voice-only AI deadline"
);

voiceChat = replaceRequired(
  voiceChat,
  `  const reply = limitVoiceReply(result.content, values.maxReplyCharacters);`,
  `  const reply = limitVoiceReply(
    result.content,
    Math.min(values.maxReplyCharacters, 320)
  );`,
  "voice reply character limit"
);

if (
  !voiceChat.includes("timeoutMs: 18_000") ||
  !voiceChat.includes("skipSimilarityRetry: true") ||
  !voiceChat.includes("never exceed 45 visible tokens") ||
  !voiceChat.includes("Math.min(values.maxReplyCharacters, 320)")
) {
  throw new Error(
    "Voice draft latency validation failed."
  );
}

write(voiceChatPath, voiceChat);

// Patch the already-generated voice Route Handler.
let fastVoiceTurn = read(voiceTurnPath);

fastVoiceTurn = replaceRequired(
  fastVoiceTurn,
  'import { NextResponse } from "next/server";',
  'import { after, NextResponse } from "next/server";',
  "Next.js after import"
);

// English voice calls use Venice's current default STT model. Keep Whisper for
// the other localized site languages because it honors explicit language hints.
fastVoiceTurn = replaceRequired(
  fastVoiceTurn,
  `    process.env.VENICE_STT_MODEL ||
      "openai/whisper-large-v3"`,
  `    process.env.VENICE_STT_MODEL ||
      (language === "English"
        ? "nvidia/parakeet-tdt-0.6b-v3"
        : "openai/whisper-large-v3")`,
  "fast English STT default"
);

// Long timeouts are poor UX for a live call. Faster STT + shorter TTS text
// allow bounded failure instead of an apparently endless spinner.
fastVoiceTurn = replaceRequired(
  fastVoiceTurn,
  "AbortSignal.timeout(90_000)",
  "AbortSignal.timeout(35_000)",
  "voice STT live-call timeout"
);

fastVoiceTurn = replaceRequired(
  fastVoiceTurn,
  "AbortSignal.timeout(120_000)",
  "AbortSignal.timeout(60_000)",
  "voice TTS live-call timeout"
);

// Memory extraction should never delay playback. completeVoiceCallTurn has
// already committed the visible turn before this is scheduled.
if (!fastVoiceTurn.includes("VOICE_MEMORY_AFTER_RESPONSE")) {
  const oldMemoryBlock = `    const memoryUsage = await updateVoiceMemoryAfterCommit({
      userId: user.id,
      character,
      draft: generated
    });

    return NextResponse.json(`;

  const newMemoryBlock = `    // VOICE_MEMORY_AFTER_RESPONSE
    after(async () => {
      await updateVoiceMemoryAfterCommit({
        userId: user.id,
        character,
        draft: generated
      });
    });

    return NextResponse.json(`;

  fastVoiceTurn = replaceRequired(
    fastVoiceTurn,
    oldMemoryBlock,
    newMemoryBlock,
    "voice memory background update"
  );

  fastVoiceTurn = replaceRequired(
    fastVoiceTurn,
    `          inputTokens: generated.inputTokens + memoryUsage.inputTokens,
          outputTokens: generated.outputTokens + memoryUsage.outputTokens,`,
    `          inputTokens: generated.inputTokens,
          outputTokens: generated.outputTokens,`,
    "voice immediate token usage"
  );
}

// Record practical stage timings in Vercel without changing the UI.
if (!fastVoiceTurn.includes("VOICE_TURN_TIMING")) {
  fastVoiceTurn = replaceRequired(
    fastVoiceTurn,
    '  let voiceStage = "setup";',
    `  let voiceStage = "setup";
  // VOICE_TURN_TIMING
  const voiceTurnStartedAt = Date.now();
  let voiceStageStartedAt = voiceTurnStartedAt;`,
    "voice timing state"
  );

  fastVoiceTurn = replaceRequired(
    fastVoiceTurn,
    `    voiceStage = "ai";`,
    `    console.info("Voice stage complete:", {
      stage: "stt",
      ms: Date.now() - voiceStageStartedAt
    });
    voiceStage = "ai";
    voiceStageStartedAt = Date.now();`,
    "STT timing log"
  );

  fastVoiceTurn = replaceRequired(
    fastVoiceTurn,
    `    voiceStage = "tts";
    const speech = await synthesizeSpeech({`,
    `    console.info("Voice stage complete:", {
      stage: "ai",
      ms: Date.now() - voiceStageStartedAt
    });
    voiceStage = "tts";
    voiceStageStartedAt = Date.now();
    const speech = await synthesizeSpeech({`,
    "AI timing log"
  );

  fastVoiceTurn = replaceRequired(
    fastVoiceTurn,
    `    voiceStage = "storage";
    uploadedPath =`,
    `    console.info("Voice stage complete:", {
      stage: "tts",
      ms: Date.now() - voiceStageStartedAt
    });
    voiceStage = "storage";
    voiceStageStartedAt = Date.now();
    uploadedPath =`,
    "TTS timing log"
  );

  fastVoiceTurn = replaceRequired(
    fastVoiceTurn,
    `    voiceStage = "complete";
    const completed = await completeVoiceCallTurn({`,
    `    console.info("Voice stage complete:", {
      stage: "storage",
      ms: Date.now() - voiceStageStartedAt
    });
    voiceStage = "complete";
    voiceStageStartedAt = Date.now();
    const completed = await completeVoiceCallTurn({`,
    "storage timing log"
  );

  fastVoiceTurn = replaceRequired(
    fastVoiceTurn,
    `    if (!completed) throw new Error("VOICE_TURN_COMPLETION_FAILED");`,
    `    if (!completed) throw new Error("VOICE_TURN_COMPLETION_FAILED");

    console.info("Voice stage complete:", {
      stage: "complete",
      ms: Date.now() - voiceStageStartedAt,
      totalMs: Date.now() - voiceTurnStartedAt
    });`,
    "completion timing log"
  );
}

if (
  !fastVoiceTurn.includes(
    'import { after, NextResponse } from "next/server";'
  ) ||
  !fastVoiceTurn.includes(
    "VOICE_MEMORY_AFTER_RESPONSE"
  ) ||
  !fastVoiceTurn.includes(
    "nvidia/parakeet-tdt-0.6b-v3"
  ) ||
  !fastVoiceTurn.includes(
    "AbortSignal.timeout(35_000)"
  ) ||
  !fastVoiceTurn.includes(
    "AbortSignal.timeout(60_000)"
  ) ||
  !fastVoiceTurn.includes(
    "VOICE_TURN_TIMING"
  ) ||
  fastVoiceTurn.includes(
    "const memoryUsage = await updateVoiceMemoryAfterCommit"
  )
) {
  throw new Error(
    "Fast voice-call final validation failed."
  );
}

write(voiceTurnPath, fastVoiceTurn);


console.log(
  "EverBond fast voice critical path applied; video remains unchanged for diagnosis."
);
