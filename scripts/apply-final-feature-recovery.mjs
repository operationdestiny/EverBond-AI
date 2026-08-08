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
  throw new Error(`User-ready recovery patch could not find: ${label}`);
}

// ===========================================================================
// VIDEO REFERENCE URL
//
// Keep image generation exactly as-is with its data URL reference.
// Video gets a provider-fetchable URL instead. Selected private gallery images
// use a Supabase signed URL; ordinary character images use their public/site URL.
// This avoids sending a multi-megabyte base64 image inside the Kling queue JSON.
// ===========================================================================

const mediaReferencePath = "src/lib/character-media-reference.ts";
let mediaReference = read(mediaReferencePath);

if (!mediaReference.includes("export async function activeCharacterReferenceUrl(")) {
  const urlHelper = `
async function selectedGalleryImageUrl(values: {
  userId: string;
  characterId: string;
}) {
  const supabase = getSupabaseServiceClient();

  const { data: preference, error: preferenceError } = await supabase
    .from("user_character_preferences")
    .select("selected_gallery_image_id")
    .eq("user_id", values.userId)
    .eq("character_id", values.characterId)
    .maybeSingle();

  if (preferenceError) throw preferenceError;

  const selectedId = preference?.selected_gallery_image_id;
  if (!selectedId) return null;

  const { data: image, error: imageError } = await supabase
    .from("character_gallery_images")
    .select("storage_path")
    .eq("id", selectedId)
    .eq("user_id", values.userId)
    .eq("character_id", values.characterId)
    .maybeSingle();

  if (imageError) throw imageError;
  if (!image?.storage_path) return null;

  const { data: signed, error: signedError } = await supabase.storage
    .from("character-gallery")
    .createSignedUrl(image.storage_path, 2 * 60 * 60);

  if (signedError) throw signedError;
  return signed.signedUrl;
}

function fallbackReferenceUrl(request: Request, image: string) {
  if (image.startsWith("data:")) {
    // Venice's generic video queue supports data URLs. Keep this only as a
    // last-resort fallback for a legacy character that has no real URL.
    return parseDataImage(image);
  }

  const url = new URL(image, trustedSiteOrigin(request));

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("REFERENCE_IMAGE_INVALID");
  }

  const hostname = url.hostname.toLowerCase();

  if (
    isPrivateIpAddress(hostname) ||
    !allowedReferenceHosts(request).has(hostname)
  ) {
    throw new Error("REFERENCE_IMAGE_HOST_NOT_ALLOWED");
  }

  return url.href;
}

export async function activeCharacterReferenceUrl(values: {
  request: Request;
  userId: string;
  characterId: string;
  fallbackImage: string;
}) {
  const selected = await selectedGalleryImageUrl(values).catch(() => null);
  if (selected) return selected;

  return fallbackReferenceUrl(values.request, values.fallbackImage);
}
`;

  mediaReference += urlHelper;
}

if (
  !mediaReference.includes("activeCharacterReferenceDataUrl") ||
  !mediaReference.includes("activeCharacterReferenceUrl") ||
  !mediaReference.includes('createSignedUrl(image.storage_path, 2 * 60 * 60)')
) {
  throw new Error("Video reference URL helper validation failed.");
}

write(mediaReferencePath, mediaReference);

// ===========================================================================
// VIDEO
// Keep Kling O3 Standard R2V, @Element1, 8 seconds, 9:16, audio off.
// Also self-heal stale requests so an interrupted generation cannot lock users.
// ===========================================================================

const videoRoutePath =
  "src/app/api/character-video-gallery/[slug]/route.ts";
let videoRoute = read(videoRoutePath);

videoRoute = replaceRequired(
  videoRoute,
  'import { activeCharacterReferenceDataUrl } from "@/lib/character-media-reference";',
  'import { activeCharacterReferenceDataUrl, activeCharacterReferenceUrl } from "@/lib/character-media-reference";',
  "video reference import"
);

videoRoute = replaceRequired(
  videoRoute,
  `    const referenceImage = await activeCharacterReferenceDataUrl({
      request,
      userId: user.id,
      characterId: character.id,
      fallbackImage: character.image
    });`,
  `    const referenceImageUrl =
      await activeCharacterReferenceUrl({
        request,
        userId: user.id,
        characterId: character.id,
        fallbackImage: character.image
      }).catch(() => null);

    const referenceImageDataUrl =
      await activeCharacterReferenceDataUrl({
        request,
        userId: user.id,
        characterId: character.id,
        fallbackImage: character.image
      });

    const referenceImages = Array.from(
      new Set(
        [
          referenceImageUrl,
          referenceImageDataUrl
        ].filter(
          (value): value is string =>
            typeof value === "string" &&
            Boolean(value.trim())
        )
      )
    );

    if (!referenceImages.length) {
      throw new Error(
        "REFERENCE_IMAGE_LOAD_FAILED"
      );
    }`,
  "video reference helper call"
);

if (!videoRoute.includes("VIDEO_UNQUEUED_STALE_MS")) {
  const insertMarker = "async function signedVideoUrl(path: string) {";
  const insertAt = videoRoute.indexOf(insertMarker);

  if (insertAt < 0) {
    throw new Error(
      "User-ready recovery patch could not find: signedVideoUrl insertion point"
    );
  }

  const staleHelper = `const VIDEO_UNQUEUED_STALE_MS = 2 * 60 * 1000;
const VIDEO_QUEUED_STALE_MS = 30 * 60 * 1000;

async function clearStaleVideoRequests(values: {
  userId: string;
  characterId: string;
}) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("character_video_requests")
    .select(
      "request_id,provider_queue_id,provider_model,created_at"
    )
    .eq("user_id", values.userId)
    .eq("character_id", values.characterId)
    .eq("status", "processing");

  if (error) throw error;

  const now = Date.now();

  for (const row of data ?? []) {
    const createdAt = new Date(
      String(row.created_at || "")
    ).getTime();

    if (!Number.isFinite(createdAt)) continue;

    const queueId =
      typeof row.provider_queue_id === "string"
        ? row.provider_queue_id
        : "";

    const staleAfter = queueId
      ? VIDEO_QUEUED_STALE_MS
      : VIDEO_UNQUEUED_STALE_MS;

    if (now - createdAt < staleAfter) continue;

    const requestId = String(row.request_id || "");
    if (!requestId) continue;

    await failCharacterVideoRequest({
      userId: values.userId,
      requestId,
      errorCode: queueId
        ? "VIDEO_REQUEST_STALE"
        : "VIDEO_QUEUE_NOT_CREATED"
    }).catch((cleanupError) => {
      console.error(
        "Stale video request refund failed:",
        cleanupError
      );
    });

    const apiKey = process.env.VENICE_API_KEY?.trim();
    const model =
      typeof row.provider_model === "string"
        ? row.provider_model
        : "";

    if (apiKey && queueId && model) {
      await providerCleanup({
        apiKey,
        model,
        queueId
      });
    }
  }
}

`;

  videoRoute =
    videoRoute.slice(0, insertAt) +
    staleHelper +
    videoRoute.slice(insertAt);
}

if (!videoRoute.includes("VIDEO_STALE_CLEANUP_GET")) {
  const getMarker =
    '    const requestedId = new URL(request.url).searchParams.get("requestId");';

  videoRoute = replaceRequired(
    videoRoute,
    getMarker,
    `    // VIDEO_STALE_CLEANUP_GET
    await clearStaleVideoRequests({
      userId: user.id,
      characterId: character.id
    });

${getMarker}`,
    "video GET stale cleanup"
  );
}

if (!videoRoute.includes("VIDEO_STALE_CLEANUP_POST")) {
  const postMarker = "    const model = pricing.model;";

  videoRoute = replaceRequired(
    videoRoute,
    postMarker,
    `    // VIDEO_STALE_CLEANUP_POST
    await clearStaleVideoRequests({
      userId: user.id,
      characterId: character.id
    });

${postMarker}`,
    "video POST stale cleanup"
  );
}

const queueStartMarker =
  '    const providerResponse = await fetch(veniceApiUrl("video/queue"), {';
const queueEndMarker = "    queuedModel =";

if (!videoRoute.includes("VIDEO_KLING_QUEUE_RECOVERY")) {
  const queueStart = videoRoute.indexOf(queueStartMarker);
  const queueEnd = videoRoute.indexOf(
    queueEndMarker,
    Math.max(queueStart, 0)
  );

  if (queueStart < 0 || queueEnd < 0 || queueEnd <= queueStart) {
    throw new Error(
      "User-ready recovery patch could not find: Kling queue block"
    );
  }

  const queueReplacement = `    // VIDEO_KLING_QUEUE_RECOVERY
    const queueDurationVariants = [
      String(parsed.data.durationSeconds),
      \`\${parsed.data.durationSeconds}s\`
    ];

    let payload: Record<string, any> | null = null;
    let lastQueueError = "";

    for (
      let referenceIndex = 0;
      referenceIndex < referenceImages.length && !payload;
      referenceIndex += 1
    ) {
      const queueReference =
        referenceImages[referenceIndex];

      for (
        let durationIndex = 0;
        durationIndex < queueDurationVariants.length && !payload;
        durationIndex += 1
      ) {
        const queueDuration =
          queueDurationVariants[durationIndex];

        let tryNextReference = false;

        for (
          let attempt = 0;
          attempt < 2 && !payload;
          attempt += 1
        ) {
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
                    frontal_image_url:
                      queueReference
                  }
                ]
              }),
              signal: AbortSignal.timeout(60_000)
            }
          );

          if (providerResponse.ok) {
            payload =
              (await providerResponse.json()) as Record<
                string,
                any
              >;
            break;
          }

          const detail = (
            await providerResponse.text()
          ).slice(0, 500);

          lastQueueError =
            \`VIDEO_PROVIDER_QUEUE_FAILED:\${providerResponse.status}:\${detail}\`;

          const durationRejected =
            providerResponse.status === 400 &&
            /duration/i.test(detail);

          if (
            durationRejected &&
            durationIndex === 0
          ) {
            break;
          }

          const referenceRejected =
            [400, 422].includes(
              providerResponse.status
            ) &&
            /reference|frontal|element|image|url/i.test(
              detail
            );

          if (
            referenceRejected &&
            referenceIndex <
              referenceImages.length - 1
          ) {
            tryNextReference = true;
            break;
          }

          const transient = [
            429,
            500,
            502,
            503,
            504
          ].includes(providerResponse.status);

          if (transient && attempt === 0) {
            await new Promise((resolve) =>
              setTimeout(
                resolve,
                providerResponse.status === 429
                  ? 1800
                  : 1200
              )
            );
            continue;
          }

          throw new Error(lastQueueError);
        }

        if (tryNextReference) {
          break;
        }
      }
    }

    if (!payload) {
      throw new Error(
        lastQueueError ||
          "VIDEO_PROVIDER_QUEUE_FAILED"
      );
    }

`;

  videoRoute =
    videoRoute.slice(0, queueStart) +
    queueReplacement +
    videoRoute.slice(queueEnd);
}

if (
  !videoRoute.includes("activeCharacterReferenceUrl") ||
  !videoRoute.includes("VIDEO_KLING_QUEUE_RECOVERY") ||
  !videoRoute.includes("VIDEO_STALE_CLEANUP_GET") ||
  !videoRoute.includes("VIDEO_STALE_CLEANUP_POST") ||
  !videoRoute.includes(
    "frontal_image_url:"
  ) ||
  !videoRoute.includes("referenceImages") ||
  !videoRoute.includes(
    "@Element1 is the exact fictional adult character"
  ) ||
  !videoRoute.includes('aspect_ratio: "9:16"') ||
  !videoRoute.includes("audio: false")
) {
  throw new Error("User-ready video validation failed.");
}

write(videoRoutePath, videoRoute);

// ===========================================================================
// VOICE FUNCTIONALITY
//
// Keep the CURRENT call visual design unchanged.
// Keep explicit Opus because the private Supabase voice bucket stores OGG/Opus.
// Keep permanent voices, EverMemory, pricing and all existing call limits.
// ===========================================================================

const voiceTurnPath = "src/app/api/voice/turn/route.ts";
let voiceTurn = read(voiceTurnPath);

voiceTurn = replaceRequired(
  voiceTurn,
  'export const maxDuration = 60;',
  'export const maxDuration = 180;',
  "voice turn execution ceiling"
);

if (
  !voiceTurn.includes('response_format: "opus"') ||
  !voiceTurn.includes(
    'uploadedPath = `${user.id}/${callId}/${requestId}.opus`;'
  ) ||
  !voiceTurn.includes("memory: generated.memory") ||
  !voiceTurn.includes(
    "getCharacterVoiceConfig(character, {"
  )
) {
  throw new Error(
    "Voice route no longer matches the permanent Opus/EverMemory system."
  );
}

write(voiceTurnPath, voiceTurn);

// ===========================================================================
// VOICE VISUAL DESIGN
// Intentionally identical to the CURRENT deployed simple design.
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
      "User-ready recovery patch could not find: voice modal render"
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
  throw new Error(
    "Current voice-call visual design validation failed."
  );
}

write(voiceModalPath, voiceModal);

// ===========================================================================
// REFRESH CHAT SERVER
// One production RPC clears persisted history and synchronizes request state.
// ===========================================================================

const chatRoutePath = "src/app/api/chat/route.ts";
let chatRoute = read(chatRoutePath);

const deleteStartMarker =
  "export async function DELETE(request: Request) {";
const postStartMarker =
  "export async function POST(request: Request) {";

if (!chatRoute.includes("RESET_CHARACTER_CHAT_HISTORY_RPC")) {
  const deleteStart = chatRoute.indexOf(deleteStartMarker);
  const postStart = chatRoute.indexOf(
    postStartMarker,
    Math.max(deleteStart, 0)
  );

  if (
    deleteStart < 0 ||
    postStart < 0 ||
    postStart <= deleteStart
  ) {
    throw new Error(
      "User-ready recovery patch could not find: chat DELETE handler"
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

    // RESET_CHARACTER_CHAT_HISTORY_RPC
    // Use the atomic RPC when available, but do not make the user-facing
    // Refresh button depend on one database function existing correctly.
    const { data: resetData, error: resetError } =
      await supabase.rpc(
        "reset_character_chat_history",
        {
          p_user_id: user.id,
          p_character_id: character.id
        }
      );

    if (resetError) {
      console.error(
        "Atomic chat reset RPC failed; using server fallback:",
        resetError
      );
    }

    let conversationId =
      typeof resetData === "string"
        ? resetData
        : null;

    // Always reconcile pending requests. This is idempotent after a successful
    // RPC and is the recovery path when the RPC is missing or stale.
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
        "Chat reset pending lookup failed:",
        pendingError
      );
    } else {
      for (const pending of pendingRequests ?? []) {
        const pendingRequestId =
          String(pending.request_id || "");

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

    if (!conversationId) {
      conversationId =
        conversationIds[0] ?? null;
    }

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

    return NextResponse.json(
      {
        reset: true,
        conversationId
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
    "RESET_CHARACTER_CHAT_HISTORY_RPC"
  ) ||
  !chatRoute.includes(
    '"reset_character_chat_history"'
  )
) {
  throw new Error(
    "User-ready chat reset server validation failed."
  );
}

write(chatRoutePath, chatRoute);

// ===========================================================================
// REFRESH CHAT CLIENT
// Clear immediately and prevent stale send/history responses from restoring it.
// ===========================================================================

const chatShellPath =
  "src/components/chat/ChatShell.tsx";
let chatShell = read(chatShellPath);

if (!chatShell.includes("historyGeneration !== chatGenerationRef.current")) {
  chatShell = replaceRequired(
    chatShell,
    `    let cancelled = false;

    async function loadHistory() {`,
    `    let cancelled = false;
    const historyGeneration =
      chatGenerationRef.current;

    async function loadHistory() {`,
    "chat history generation token"
  );

  chatShell = replaceRequired(
    chatShell,
    "        if (cancelled || !response.ok) return;",
    `        if (
          cancelled ||
          historyGeneration !==
            chatGenerationRef.current ||
          !response.ok
        ) {
          return;
        }`,
    "chat history stale response guard"
  );
}

if (!chatShell.includes("USER_READY_CHAT_RESET")) {
  const resetStartMarker =
    "  async function resetConversation() {";
  const shareStartMarker =
    "  function shareCompanion() {";

  const resetStart =
    chatShell.indexOf(resetStartMarker);
  const shareStart =
    chatShell.indexOf(
      shareStartMarker,
      Math.max(resetStart, 0)
    );

  if (
    resetStart < 0 ||
    shareStart < 0 ||
    shareStart <= resetStart
  ) {
    throw new Error(
      "User-ready recovery patch could not find: resetConversation"
    );
  }

  const resetFunction = `  async function resetConversation() {
    if (refreshingChat) return;

    // USER_READY_CHAT_RESET
    chatGenerationRef.current += 1;
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    sendInFlightRef.current = false;

    setRefreshingChat(true);
    setHistoryLoading(false);
    setIsTyping(false);
    setGiftError("");
    setChatError("");

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(
        pendingMessageStorageKey
      );
    }

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

if (!chatShell.includes("disabled={refreshingChat}")) {
  const refreshButtonPattern =
    /<button\s+onClick=\{\(\) => void resetConversation\(\)\}[\s\S]*?aria-label=\{t\("refresh"\)\}[\s\S]*?<RefreshCcw size=\{15\} \/>[\s\S]*?<\/button>/;

  if (!refreshButtonPattern.test(chatShell)) {
    throw new Error(
      "User-ready recovery patch could not find: Refresh Chat button"
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
  !chatShell.includes("USER_READY_CHAT_RESET") ||
  !chatShell.includes("historyGeneration !==") ||
  !chatShell.includes("chatGenerationRef.current") ||
  !chatShell.includes("disabled={refreshingChat}") ||
  !chatShell.includes('method: "DELETE"')
) {
  throw new Error(
    "User-ready chat reset client validation failed."
  );
}

write(chatShellPath, chatShell);

console.log(
  "EverBond user-ready Refresh Chat, voice, and Kling video recovery applied."
);
