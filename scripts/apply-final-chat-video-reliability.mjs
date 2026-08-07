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
  if (source.includes(from)) return source.replace(from, to);
  if (source.includes(to)) return source;
  throw new Error(`Final chat/video reliability patch could not find: ${label}`);
}

function insertBeforeRequired(source, marker, insertion, alreadyPresent, label) {
  if (source.includes(alreadyPresent)) return source;
  const index = source.indexOf(marker);
  if (index < 0) {
    throw new Error(`Final chat/video reliability patch could not find: ${label}`);
  }
  return source.slice(0, index) + insertion + source.slice(index);
}

// ===========================================================================
// VIDEO: use a documented identity-locking reference-to-video model.
//
// Kling O3 Standard R2V treats frontal_image_url as the primary identity
// anchor. Keep one real character image as @Element1 and let the user's prompt
// control movement, pose, clothing, scene, framing, and camera.
//
// Restore 8 seconds because:
// - Kling O3 supports 8s.
// - the existing normal-user Supabase billing function already validates 8s.
// - this avoids changing production billing semantics for every ordinary user.
// ===========================================================================

const pricingPath = "src/lib/video-pricing.ts";
let videoPricing = read(pricingPath);

videoPricing = replaceRequired(
  videoPricing,
  'const DEFAULT_VIDEO_MODEL = "wan-2-7-reference-to-video";',
  'const DEFAULT_VIDEO_MODEL = "kling-o3-standard-reference-to-video";',
  "Kling O3 Standard R2V model"
);

videoPricing = replaceRequired(
  videoPricing,
  "const DEFAULT_DURATION_SECONDS = 10;",
  "const DEFAULT_DURATION_SECONDS = 8;",
  "8-second video duration"
);

videoPricing = replaceRequired(
  videoPricing,
  `    model:
      process.env.VENICE_VIDEO_MODEL?.trim() ||
      DEFAULT_VIDEO_MODEL,`,
  `    model: DEFAULT_VIDEO_MODEL,`,
  "fixed documented reference-video model"
);

videoPricing = replaceRequired(
  videoPricing,
  `      body: JSON.stringify({
        model: inputs.model,
        duration: inputs.duration,
        resolution: inputs.resolution
      }),`,
  `      body: JSON.stringify({
        model: inputs.model,
        duration: inputs.duration,
        aspect_ratio: "9:16",
        audio: false
      }),`,
  "Kling O3 video quote fields"
);

if (
  !videoPricing.includes(
    'const DEFAULT_VIDEO_MODEL = "kling-o3-standard-reference-to-video";'
  ) ||
  !videoPricing.includes("const DEFAULT_DURATION_SECONDS = 8;") ||
  !videoPricing.includes("model: DEFAULT_VIDEO_MODEL") ||
  !videoPricing.includes('aspect_ratio: "9:16"') ||
  !videoPricing.includes("audio: false")
) {
  throw new Error("Kling O3 video pricing validation failed.");
}

write(pricingPath, videoPricing);

const videoRoutePath =
  "src/app/api/character-video-gallery/[slug]/route.ts";
let videoRoute = read(videoRoutePath);

videoRoute = replaceRequired(
  videoRoute,
  "const VIDEO_DURATIONS = [10] as const;",
  "const VIDEO_DURATIONS = [8] as const;",
  "video route duration"
);

videoRoute = replaceRequired(
  videoRoute,
  `        prompt:
          \`@Image1 is the exact fictional adult character \${character.name}. \` +
          \`Preserve the same face, identity, age, body, and recognizable appearance throughout the video. \` +
          parsed.data.prompt,
        duration: pricing.duration,
        resolution: pricing.resolution,
        reference_image_urls: [referenceImage],
        negative_prompt:
          "identity drift, different person, face distortion, low resolution, blur, watermark, text, duplicate body parts"`,
  `        prompt:
          \`@Element1 is the exact fictional adult character \${character.name}. \` +
          "Keep @Element1's recognizable face, identity, adult age, body, skin tone, hair, and defining appearance consistent throughout the video. " +
          "The user's request controls the action, pose, expression, clothing, scene, framing, and camera movement. " +
          parsed.data.prompt,
        duration: pricing.duration,
        aspect_ratio: "9:16",
        audio: false,
        elements: [
          {
            frontal_image_url: referenceImage
          }
        ],
        negative_prompt:
          "identity drift, different person, face distortion, low resolution, blur, watermark, text, duplicate body parts"`,
  "Kling O3 identity element request"
);

if (
  !videoRoute.includes("const VIDEO_DURATIONS = [8] as const;") ||
  !videoRoute.includes("@Element1 is the exact fictional adult character") ||
  !videoRoute.includes("frontal_image_url: referenceImage") ||
  videoRoute.includes("reference_image_urls: [referenceImage]") ||
  videoRoute.includes("resolution: pricing.resolution")
) {
  throw new Error("Kling O3 video route validation failed.");
}

write(videoRoutePath, videoRoute);

const galleryClientPath =
  "src/components/media/CharacterGalleryClient.tsx";
let galleryClient = read(galleryClientPath);

galleryClient = replaceRequired(
  galleryClient,
  "const [videoDuration, setVideoDuration] = useState(10);",
  "const [videoDuration, setVideoDuration] = useState(8);",
  "video client duration"
);

write(galleryClientPath, galleryClient);

// ===========================================================================
// CHAT PROVIDER RELIABILITY
//
// A provider request must not be allowed to hang indefinitely. Main replies
// get 25 seconds per provider attempt; the secondary memory extraction gets
// 10 seconds and is already best-effort in voice-chat.ts.
// ===========================================================================

const providerPath = "src/lib/ai/provider.ts";
let provider = read(providerPath);

provider = replaceRequired(
  provider,
  `async function postChatCompletion(
  endpoint: string,
  apiKey: string,
  body: Record<string, unknown>
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${apiKey}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });`,
  `async function postChatCompletion(
  endpoint: string,
  apiKey: string,
  body: Record<string, unknown>,
  timeoutMs = 25_000
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${apiKey}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs)
  });`,
  "provider request timeout"
);

provider = replaceRequired(
  provider,
  `  const data: any = await postChatCompletion(
    endpoint,
    config.apiKey,
    requestBody
  );`,
  `  const data: any = await postChatCompletion(
    endpoint,
    config.apiKey,
    requestBody,
    10_000
  );`,
  "memory-model timeout"
);

if (
  !provider.includes("timeoutMs = 25_000") ||
  !provider.includes("signal: AbortSignal.timeout(timeoutMs)") ||
  !provider.includes("requestBody,\n    10_000")
) {
  throw new Error("Chat provider reliability validation failed.");
}

write(providerPath, provider);

// ===========================================================================
// TEXT CHAT: reject an empty provider reply so the route can retry/refund
// instead of returning HTTP 200 with an invisible assistant message.
// ===========================================================================

const voiceChatPath = "src/lib/voice-chat.ts";
let voiceChat = read(voiceChatPath);

voiceChat = replaceRequired(
  voiceChat,
  `  ]);

  let memoryInputTokens = 0;
  let memoryOutputTokens = 0;`,
  `  ]);

  if (!result.content.trim()) {
    throw new Error("EMPTY_TEXT_REPLY");
  }

  let memoryInputTokens = 0;
  let memoryOutputTokens = 0;`,
  "empty text reply guard"
);

write(voiceChatPath, voiceChat);

// ===========================================================================
// CHAT API
// - Retry empty/time-out replies.
// - Add a real DELETE reset endpoint.
// - Reset clears message history and pending request locks for this character,
//   but preserves relationship_states / ever_memory and conversation memory.
// ===========================================================================

const chatRoutePath = "src/app/api/chat/route.ts";
let chatRoute = read(chatRoutePath);

if (!chatRoute.includes('export const runtime = "nodejs";')) {
  const importEndMarker =
    'import {\\n  beginGiftSend,\\n  completeGiftSend,\\n  failGiftSend\\n} from "@/lib/evershop/server";\\n';
  const actualMarker = `import {
  beginGiftSend,
  completeGiftSend,
  failGiftSend
} from "@/lib/evershop/server";
`;

  chatRoute = insertBeforeRequired(
    chatRoute,
    actualMarker,
    actualMarker +
      '\nexport const runtime = "nodejs";\nexport const maxDuration = 60;\n\n',
    'export const runtime = "nodejs";',
    "chat runtime configuration"
  ).replace(actualMarker + actualMarker, actualMarker);
}

chatRoute = replaceRequired(
  chatRoute,
  `  for (let attempt = 1; attempt <= 3; attempt += 1) {`,
  `  for (let attempt = 1; attempt <= 2; attempt += 1) {`,
  "chat retry attempt count"
);

chatRoute = replaceRequired(
  chatRoute,
  `      if (attempt === 3 || !isRetryableCharacterTurnError(error)) {`,
  `      if (attempt === 2 || !isRetryableCharacterTurnError(error)) {`,
  "chat retry terminal attempt"
);

chatRoute = replaceRequired(
  chatRoute,
  `/fetch failed|econnreset|etimedout|enotfound|socket hang up|und_err/i.test(
      details
    )`,
  `/fetch failed|econnreset|etimedout|enotfound|socket hang up|und_err|timeout|timed out|aborted|empty_text_reply/i.test(
      details
    )`,
  "chat retryable timeout and empty reply errors"
);

const deleteHandler = `export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "SIGNUP_REQUIRED" }, { status: 401 });
    }

    const characterSlug = new URL(request.url).searchParams.get(
      "characterSlug"
    );
    if (!characterSlug) {
      return NextResponse.json(
        { error: "Missing characterSlug" },
        { status: 400 }
      );
    }

    const character = await getCharacterBySlugForUser(
      characterSlug,
      user.id
    );
    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    const supabase = getSupabaseServiceClient();

    const { data: pendingRequests, error: pendingError } =
      await supabase
        .from("chat_requests")
        .select("request_id")
        .eq("user_id", user.id)
        .eq("character_id", character.id)
        .eq("status", "pending");

    if (pendingError) throw pendingError;

    for (const pending of pendingRequests ?? []) {
      const pendingRequestId = String(pending.request_id || "");
      if (!pendingRequestId) continue;

      await failChatRequest({
        userId: user.id,
        requestId: pendingRequestId,
        errorCode: "CHAT_RESET"
      }).catch(() => undefined);

      await refundChatMessageCredit({
        userId: user.id,
        requestId: pendingRequestId
      }).catch(() => undefined);
    }

    const { data: conversations, error: conversationError } =
      await supabase
        .from("conversations")
        .select("id,updated_at")
        .eq("user_id", user.id)
        .eq("character_id", character.id)
        .order("updated_at", { ascending: false });

    if (conversationError) throw conversationError;

    const conversationIds = (conversations ?? [])
      .map((conversation) => String(conversation.id || ""))
      .filter(Boolean);

    if (conversationIds.length) {
      const { error: messageDeleteError } = await supabase
        .from("messages")
        .delete()
        .in("conversation_id", conversationIds);

      if (messageDeleteError) throw messageDeleteError;

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .in("id", conversationIds);
    }

    return NextResponse.json({
      reset: true,
      conversationId: conversationIds[0] ?? null
    });
  } catch (error) {
    console.error("Chat reset failed:", error);
    return NextResponse.json(
      { error: "CHAT_RESET_FAILED" },
      { status: 500 }
    );
  }
}

`;

chatRoute = insertBeforeRequired(
  chatRoute,
  "export async function POST(request: Request) {",
  deleteHandler,
  "export async function DELETE(request: Request)",
  "chat DELETE reset endpoint"
);

if (
  !chatRoute.includes("export async function DELETE(request: Request)") ||
  !chatRoute.includes('errorCode: "CHAT_RESET"') ||
  !chatRoute.includes("attempt <= 2") ||
  !chatRoute.includes("empty_text_reply")
) {
  throw new Error("Chat route reliability validation failed.");
}

write(chatRoutePath, chatRoute);

// ===========================================================================
// CHAT CLIENT
// - Refresh Chat now calls the server reset.
// - It can abort a stuck in-flight chat request.
// - Chat failures are visible instead of silently disappearing.
// ===========================================================================

const chatShellPath = "src/components/chat/ChatShell.tsx";
let chatShell = read(chatShellPath);

chatShell = replaceRequired(
  chatShell,
  `  const [giftError, setGiftError] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const sendInFlightRef = useRef(false);`,
  `  const [giftError, setGiftError] = useState("");
  const [chatError, setChatError] = useState("");
  const [refreshingChat, setRefreshingChat] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const sendInFlightRef = useRef(false);
  const chatAbortRef = useRef<AbortController | null>(null);
  const chatGenerationRef = useRef(0);`,
  "chat reliability state"
);

chatShell = replaceRequired(
  chatShell,
  `  function resetConversation() {
    if (sendInFlightRef.current) return;

    setMessages([{ role: "character", content: initialCharacterMessage }]);
    setInput("");
    setIsTyping(false);
    setGiftError("");
    focusChatInput();
  }`,
  `  async function resetConversation() {
    if (refreshingChat) return;

    chatGenerationRef.current += 1;
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    sendInFlightRef.current = false;

    setRefreshingChat(true);
    setIsTyping(false);
    setGiftError("");
    setChatError("");

    try {
      if (session?.access_token) {
        const response = await fetch(
          \`/api/chat?characterSlug=\${encodeURIComponent(character.slug)}\`,
          {
            method: "DELETE",
            headers: {
              Authorization: \`Bearer \${session.access_token}\`
            }
          }
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || "CHAT_RESET_FAILED");
        }

        setConversationId(data.conversationId ?? null);
      } else {
        setConversationId(null);
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(pendingMessageStorageKey);
      }
      setPendingMessage("");
      setMessages([
        { role: "character", content: initialCharacterMessage }
      ]);
      setInput("");
    } catch (error) {
      console.error("Chat reset failed:", error);
      setChatError(finalCopy.errors.chat);
    } finally {
      setRefreshingChat(false);
      focusChatInput();
    }
  }`,
  "real chat reset"
);

chatShell = replaceRequired(
  chatShell,
  `    sendInFlightRef.current = true;
    setGiftError("");
    if (gift) setSendingGiftId(gift.id);

    const requestId = crypto.randomUUID();`,
  `    sendInFlightRef.current = true;
    setGiftError("");
    setChatError("");
    if (gift) setSendingGiftId(gift.id);

    const sendGeneration = chatGenerationRef.current;
    const controller = new AbortController();
    chatAbortRef.current = controller;
    const requestId = crypto.randomUUID();`,
  "chat abort controller setup"
);

chatShell = replaceRequired(
  chatShell,
  `          body: JSON.stringify({
            requestId,
            characterSlug: character.slug,
            language: getApiLanguage(language),
            conversationId: conversationId ?? undefined,
            giftId: gift?.id,
            messages: [
              {
                role: "user",
                content: trimmed
              }
            ]
          })
        }
      );
      const data = await response.json().catch(() => ({}));`,
  `          body: JSON.stringify({
            requestId,
            characterSlug: character.slug,
            language: getApiLanguage(language),
            conversationId: conversationId ?? undefined,
            giftId: gift?.id,
            messages: [
              {
                role: "user",
                content: trimmed
              }
            ]
          }),
          signal: controller.signal
        }
      );
      const data = await response.json().catch(() => ({}));

      if (sendGeneration !== chatGenerationRef.current) {
        return;
      }`,
  "chat fetch abort signal"
);

chatShell = replaceRequired(
  chatShell,
  `      setConversationId(data.conversationId ?? conversationId);
      setGiftPickerOpen(false);

      setMessages((current) => [
        ...current,
        { role: "character", content: data.reply }
      ]);`,
  `      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("EMPTY_CHAT_REPLY");
      }

      setConversationId(data.conversationId ?? conversationId);
      setGiftPickerOpen(false);
      setChatError("");

      setMessages((current) => [
        ...current,
        { role: "character", content: data.reply }
      ]);`,
  "client empty reply guard"
);

chatShell = replaceRequired(
  chatShell,
  `    } catch (error) {
      console.error("Chat request failed:", error);
      setMessages(previousMessages);
      setInput(trimmed);

      if (gift) {
        setGiftError(shopCopy.noGiftsToSend);
        setGiftPickerOpen(true);
      }
    } finally {
      sendInFlightRef.current = false;
      setSendingGiftId(null);
      setIsTyping(false);
      focusChatInput();
    }`,
  `    } catch (error) {
      if (sendGeneration !== chatGenerationRef.current) {
        return;
      }

      console.error("Chat request failed:", error);
      setMessages(previousMessages);
      setInput(trimmed);
      setChatError(finalCopy.errors.chat);

      if (gift) {
        setGiftError(shopCopy.noGiftsToSend);
        setGiftPickerOpen(true);
      }
    } finally {
      if (sendGeneration === chatGenerationRef.current) {
        sendInFlightRef.current = false;
        chatAbortRef.current = null;
        setSendingGiftId(null);
        setIsTyping(false);
        focusChatInput();
      }
    }`,
  "visible chat failure handling"
);

chatShell = replaceRequired(
  chatShell,
  `            <button
              onClick={resetConversation}
              className="bond-pink-button flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] text-white"
              aria-label={t("refresh")}
            >
              <RefreshCcw size={15} />
            </button>`,
  `            <button
              onClick={() => void resetConversation()}
              disabled={refreshingChat}
              className="bond-pink-button flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={t("refresh")}
            >
              <RefreshCcw
                size={15}
                className={refreshingChat ? "animate-spin" : ""}
              />
            </button>`,
  "refresh button behavior"
);

chatShell = replaceRequired(
  chatShell,
  `            {giftError && (
              <div className="mx-auto mb-2 flex max-w-4xl justify-end">
                <p className="line-clamp-1 text-xs text-red-200">{giftError}</p>
              </div>
            )}

            <div className="mx-auto flex max-w-4xl items-center gap-2 rounded-full bg-white/[0.04] p-1.5 bond-chat-input">`,
  `            {giftError && (
              <div className="mx-auto mb-2 flex max-w-4xl justify-end">
                <p className="line-clamp-1 text-xs text-red-200">{giftError}</p>
              </div>
            )}

            {chatError && (
              <div className="mx-auto mb-2 flex max-w-4xl justify-end">
                <p className="text-xs text-red-200">{chatError}</p>
              </div>
            )}

            <div className="mx-auto flex max-w-4xl items-center gap-2 rounded-full bg-white/[0.04] p-1.5 bond-chat-input">`,
  "visible chat error"
);

if (
  !chatShell.includes("const chatAbortRef = useRef<AbortController | null>(null);") ||
  !chatShell.includes('method: "DELETE"') ||
  !chatShell.includes("EMPTY_CHAT_REPLY") ||
  !chatShell.includes("finalCopy.errors.chat")
) {
  throw new Error("Chat client reliability validation failed.");
}

write(chatShellPath, chatShell);

console.log(
  "EverBond final chat reset, chat reliability, and Kling O3 R2V patch applied."
);
