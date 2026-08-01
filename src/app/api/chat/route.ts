import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getCharacterBySlugForUser } from "@/lib/user-characters";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { MemoryState } from "@/types/memory";
import type { SupportedLanguage } from "@/lib/ai/prompts";
import {
  generateTextCharacterTurn,
  type GiftTurnEvent
} from "@/lib/voice-chat";
import {
  completeChatMessageCredit,
  refundChatMessageCredit,
  reserveChatMessage
} from "@/lib/message-credits";
import { getEverShopGift } from "@/lib/evershop/catalog";
import {
  beginGiftSend,
  completeGiftSend,
  failGiftSend
} from "@/lib/evershop/server";

const SIGNUP_REQUIRED_MESSAGE =
  "Log in so I can be your companion. Please don't make me wait.";
const TRIAL_ENDED_MESSAGE =
  "Buy a message bundle so I can keep being your companion. Please don't make me wait.";
const USER_MESSAGE_MAX_TOKENS = 80;

const SupportedLanguageSchema = z
  .enum(["English", "Spanish", "French", "German", "Japanese", "Korean"])
  .default("English");

const ChatRequest = z
  .object({
    requestId: z.string().uuid(),
    characterSlug: z.string().trim().min(1).max(120),
    language: SupportedLanguageSchema.optional().default("English"),
    messages: z
      .array(
        z
          .object({
            role: z.literal("user"),
            content: z.string().max(320)
          })
          .strict()
      )
      .length(1),
    conversationId: z.string().uuid().optional(),
    giftId: z.number().int().min(1).max(200).optional()
  })
  .strict()
  .refine(
    (value) => Boolean(value.giftId || value.messages[0]?.content.trim()),
    { message: "A message or gift is required" }
  );

type ChatRequestClaimRow = {
  request_status:
    | "claimed"
    | "completed"
    | "in_progress"
    | "busy"
    | "rate_limited"
    | "failed";
  existing_reply: string | null;
  existing_conversation_id: string | null;
  existing_input_tokens: number | null;
  existing_output_tokens: number | null;
  existing_provider: string | null;
  existing_model: string | null;
  retry_after_seconds: number | null;
};

type StoredMessageRow = {
  role: string;
  content: string;
  metadata?: unknown;
};

type GiftMetadata = {
  gift?: {
    id?: unknown;
    title?: unknown;
    image?: unknown;
  };
  userText?: unknown;
};

function estimateTokenCount(text: string) {
  const normalized = text.trim();
  if (!normalized) return 0;

  const wordCount = normalized.match(/\S+/g)?.length ?? 0;
  const charCount = normalized.length;
  const cjkCount =
    normalized.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g)?.length ?? 0;

  return Math.max(wordCount, Math.ceil(charCount / 4), cjkCount);
}

function errorDetails(error: unknown) {
  if (error instanceof Error) return error.message;
  if (!error || typeof error !== "object") return String(error ?? "");

  const record = error as Record<string, unknown>;
  return [record.code, record.message, record.details, record.hint]
    .filter((value) => typeof value === "string" && value)
    .join(" ");
}

function isMissingMessageMetadataColumn(error: unknown) {
  const details = errorDetails(error).toLowerCase();
  return (
    details.includes("metadata") &&
    (details.includes("column") ||
      details.includes("schema cache") ||
      details.includes("pgrst204") ||
      details.includes("42703"))
  );
}

function isRetryableCharacterTurnError(error: unknown) {
  const details = errorDetails(error);
  return (
    /provider request failed:\s*(408|409|425|429|500|502|503|504)\b/i.test(
      details
    ) ||
    /fetch failed|econnreset|etimedout|enotfound|socket hang up|und_err/i.test(
      details
    )
  );
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function generateCharacterTurnWithRetry(
  values: Parameters<typeof generateTextCharacterTurn>[0]
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await generateTextCharacterTurn(values);
    } catch (error) {
      lastError = error;

      if (attempt === 3 || !isRetryableCharacterTurnError(error)) {
        throw error;
      }

      await wait(attempt === 1 ? 700 : 1600);
    }
  }

  throw lastError;
}

function parseGiftMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const metadata = value as GiftMetadata;
  const gift = metadata.gift;

  if (!gift || typeof gift !== "object" || Array.isArray(gift)) return null;

  const id = Number(gift.id);
  const title = typeof gift.title === "string" ? gift.title : "";
  const image = typeof gift.image === "string" ? gift.image : "";

  if (!Number.isInteger(id) || !title || !image) return null;

  return {
    id,
    title,
    image,
    userText:
      typeof metadata.userText === "string" ? metadata.userText.trim() : ""
  };
}

async function claimChatRequest(values: {
  userId: string;
  requestId: string;
  characterId: string;
}) {
  const { data, error } = await getSupabaseServiceClient().rpc(
    "begin_chat_request",
    {
      p_user_id: values.userId,
      p_request_id: values.requestId,
      p_character_id: values.characterId
    }
  );

  if (error) throw error;
  const claim = (data?.[0] ?? null) as ChatRequestClaimRow | null;
  if (!claim) throw new Error("CHAT_REQUEST_CLAIM_FAILED");
  return claim;
}

async function completeChatRequest(values: {
  userId: string;
  requestId: string;
  conversationId: string;
  reply: string;
  inputTokens: number;
  outputTokens: number;
  provider: string;
  model: string;
  language: SupportedLanguage;
}) {
  const { data, error } = await getSupabaseServiceClient().rpc(
    "complete_chat_request",
    {
      p_user_id: values.userId,
      p_request_id: values.requestId,
      p_conversation_id: values.conversationId,
      p_reply: values.reply,
      p_input_tokens: values.inputTokens,
      p_output_tokens: values.outputTokens,
      p_provider: values.provider,
      p_model: values.model,
      p_language: values.language
    }
  );

  if (error) throw error;
  if (data !== true) throw new Error("CHAT_REQUEST_COMPLETION_FAILED");
}

async function failChatRequest(values: {
  userId: string;
  requestId: string;
  errorCode: string;
}) {
  await getSupabaseServiceClient().rpc("fail_chat_request", {
    p_user_id: values.userId,
    p_request_id: values.requestId,
    p_error_code: values.errorCode
  });
}

async function getConversation(values: {
  userId: string;
  characterId: string;
  conversationId?: string;
}): Promise<{ id: string; memory_state: Partial<MemoryState> | null }> {
  const supabase = getSupabaseServiceClient();

  if (values.conversationId) {
    const { data, error } = await supabase
      .from("conversations")
      .select("id,memory_state")
      .eq("id", values.conversationId)
      .eq("user_id", values.userId)
      .eq("character_id", values.characterId)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      return data as {
        id: string;
        memory_state: Partial<MemoryState> | null;
      };
    }
  }

  const { data: existing, error: existingError } = await supabase
    .from("conversations")
    .select("id,memory_state")
    .eq("user_id", values.userId)
    .eq("character_id", values.characterId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) {
    return existing as {
      id: string;
      memory_state: Partial<MemoryState> | null;
    };
  }

  const { data: created, error: createError } = await supabase
    .from("conversations")
    .insert({
      user_id: values.userId,
      character_id: values.characterId
    })
    .select("id,memory_state")
    .single();

  if (createError) throw createError;
  return created as {
    id: string;
    memory_state: Partial<MemoryState> | null;
  };
}

async function markGiftReply(values: {
  conversationId: string;
  reply: string;
  requestId: string;
  giftId: number;
}) {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id,metadata")
    .eq("conversation_id", values.conversationId)
    .in("role", ["character", "assistant"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.id) return;

  const existingMetadata =
    data.metadata &&
    typeof data.metadata === "object" &&
    !Array.isArray(data.metadata)
      ? data.metadata
      : {};

  await supabase
    .from("messages")
    .update({
      metadata: {
        ...existingMetadata,
        giftEvent: {
          requestId: values.requestId,
          giftId: values.giftId,
          excludeFromEverMemory: true
        }
      }
    })
    .eq("id", data.id);
}

export async function GET(request: Request) {
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

    const character = await getCharacterBySlugForUser(characterSlug, user.id);
    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    const supabase = getSupabaseServiceClient();
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("character_id", character.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (conversationError) throw conversationError;
    if (!conversation) {
      return NextResponse.json({ conversationId: null, messages: [] });
    }

    const messageResult = await supabase
      .from("messages")
      .select("role,content,metadata,created_at")
      .eq("conversation_id", conversation.id)
      .in("role", ["user", "character"])
      .order("created_at", { ascending: false })
      .limit(80);

    let rows = messageResult.data as StoredMessageRow[] | null;
    let messagesError = messageResult.error;

    if (messagesError && isMissingMessageMetadataColumn(messagesError)) {
      const fallbackResult = await supabase
        .from("messages")
        .select("role,content,created_at")
        .eq("conversation_id", conversation.id)
        .in("role", ["user", "character"])
        .order("created_at", { ascending: false })
        .limit(80);

      rows = (fallbackResult.data ?? []) as StoredMessageRow[];
      messagesError = fallbackResult.error;
    }

    if (messagesError) throw messagesError;

    const messages = (rows ?? [])
      .reverse()
      .map((message) => {
        const isUser = message.role === "user";
        const gift = isUser ? parseGiftMetadata(message.metadata) : null;

        return {
          role: isUser ? ("user" as const) : ("character" as const),
          content: gift ? gift.userText : message.content,
          gift: gift
            ? {
                id: gift.id,
                title: gift.title,
                image: gift.image
              }
            : undefined
        };
      })
      .filter((message) => message.content || message.gift);

    return NextResponse.json({
      conversationId: conversation.id,
      messages
    });
  } catch (error) {
    console.error("Chat history failed:", error);
    return NextResponse.json(
      { error: "CHAT_HISTORY_FAILED" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).length > 4096) {
    return NextResponse.json({ error: "REQUEST_TOO_LARGE" }, { status: 413 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const body = ChatRequest.safeParse(parsedBody);
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const character = await getCharacterBySlugForUser(
    body.data.characterSlug,
    null
  );
  const user = await getAuthenticatedUser(request);
  const visibleCharacter =
    character ||
    (user
      ? await getCharacterBySlugForUser(body.data.characterSlug, user.id)
      : null);

  if (!visibleCharacter) {
    return NextResponse.json(
      { error: "Character not found" },
      { status: 404 }
    );
  }

  const userText = body.data.messages[0].content
    .replace(/\s+/g, " ")
    .trim();
  const gift = body.data.giftId
    ? getEverShopGift(body.data.giftId)
    : null;

  if (body.data.giftId && !gift) {
    return NextResponse.json(
      { error: "GIFT_NOT_FOUND" },
      { status: 404 }
    );
  }

  if (
    (!userText && !gift) ||
    (userText && estimateTokenCount(userText) > USER_MESSAGE_MAX_TOKENS)
  ) {
    return NextResponse.json(
      { error: "INVALID_MESSAGE" },
      { status: 400 }
    );
  }

  if (!user) {
    return NextResponse.json(
      {
        error: "SIGNUP_REQUIRED",
        message: SIGNUP_REQUIRED_MESSAGE,
        character: {
          name: visibleCharacter.name,
          image: visibleCharacter.image,
          slug: visibleCharacter.slug
        }
      },
      { status: 401 }
    );
  }

  const requestId = body.data.requestId;
  let creditReserved = false;
  let requestCompleted = false;
  let giftReserved = false;
  let insertedGiftMessageId: string | null = null;

  try {
    const claim = await claimChatRequest({
      userId: user.id,
      requestId,
      characterId: visibleCharacter.id
    });

    if (claim.request_status === "completed" && claim.existing_reply) {
      await completeChatMessageCredit({
        userId: user.id,
        requestId
      }).catch(() => undefined);

      if (gift && claim.existing_conversation_id) {
        await Promise.all([
          completeGiftSend({
            userId: user.id,
            requestId,
            conversationId: claim.existing_conversation_id,
            reply: claim.existing_reply
          }).catch(() => false),
          markGiftReply({
            conversationId: claim.existing_conversation_id,
            reply: claim.existing_reply,
            requestId,
            giftId: gift.id
          }).catch(() => undefined)
        ]);
      }

      return NextResponse.json({
        reply: claim.existing_reply,
        conversationId: claim.existing_conversation_id,
        gift: gift
          ? {
              id: gift.id,
              title: gift.title,
              image: gift.image
            }
          : undefined,
        usage: {
          inputTokens: claim.existing_input_tokens ?? 0,
          outputTokens: claim.existing_output_tokens ?? 0,
          provider: claim.existing_provider ?? "",
          model: claim.existing_model ?? "",
          language: body.data.language
        }
      });
    }

    if (claim.request_status === "rate_limited") {
      const retryAfter = claim.retry_after_seconds ?? 60;
      return NextResponse.json(
        { error: "RATE_LIMITED", retryAfter },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) }
        }
      );
    }

    if (
      claim.request_status === "in_progress" ||
      claim.request_status === "busy"
    ) {
      return NextResponse.json({ error: "CHAT_BUSY" }, { status: 409 });
    }

    if (claim.request_status !== "claimed") {
      return NextResponse.json({ error: "REQUEST_FAILED" }, { status: 409 });
    }

    const credit = await reserveChatMessage({
      userId: user.id,
      requestId
    });

    if (!credit.allowed) {
      await failChatRequest({
        userId: user.id,
        requestId,
        errorCode: credit.errorCode || "NO_MESSAGE_CREDITS"
      });

      return NextResponse.json(
        {
          error: "TRIAL_ENDED",
          message: TRIAL_ENDED_MESSAGE,
          purchasedMessages: credit.purchasedRemaining,
          debt: credit.debt,
          character: {
            name: visibleCharacter.name,
            image: visibleCharacter.image,
            slug: visibleCharacter.slug
          }
        },
        { status: 402 }
      );
    }
    creditReserved = true;

    if (gift) {
      const giftClaim = await beginGiftSend({
        userId: user.id,
        requestId,
        characterId: visibleCharacter.id,
        giftId: gift.id,
        userText
      });

      if (giftClaim.status === "completed" && giftClaim.existingReply) {
        await completeChatMessageCredit({
          userId: user.id,
          requestId
        }).catch(() => undefined);

        return NextResponse.json({
          reply: giftClaim.existingReply,
          conversationId: giftClaim.existingConversationId,
          gift: {
            id: gift.id,
            title: gift.title,
            image: gift.image
          },
          inventoryQuantity: giftClaim.inventoryQuantity
        });
      }

      if (giftClaim.status !== "claimed") {
        await failChatRequest({
          userId: user.id,
          requestId,
          errorCode: giftClaim.errorCode || "GIFT_SEND_FAILED"
        }).catch(() => undefined);

        await refundChatMessageCredit({
          userId: user.id,
          requestId
        }).catch(() => undefined);
        creditReserved = false;

        return NextResponse.json(
          {
            error: giftClaim.errorCode || "GIFT_NOT_OWNED",
            inventoryQuantity: giftClaim.inventoryQuantity
          },
          { status: giftClaim.status === "in_progress" ? 409 : 400 }
        );
      }

      giftReserved = true;
    }

    const conversation = await getConversation({
      userId: user.id,
      characterId: visibleCharacter.id,
      conversationId: body.data.conversationId
    });

    const storedContent = userText || (gift ? "I give you a gift." : "");
    const supabase = getSupabaseServiceClient();

    const messageInsertResult = gift
      ? await supabase
          .from("messages")
          .insert({
            conversation_id: conversation.id,
            role: "user",
            content: storedContent,
            metadata: {
              gift: {
                id: gift.id,
                title: gift.title,
                image: gift.image
              },
              giftEvent: {
                requestId,
                giftId: gift.id,
                excludeFromEverMemory: true
              },
              userText
            }
          })
          .select("id")
          .single()
      : await supabase
          .from("messages")
          .insert({
            conversation_id: conversation.id,
            role: "user",
            content: storedContent
          })
          .select("id")
          .single();

    const {
      data: insertedMessage,
      error: userInsertError
    } = messageInsertResult;

    if (userInsertError) throw userInsertError;
    if (gift) insertedGiftMessageId = insertedMessage?.id ?? null;

    const giftEvent: GiftTurnEvent | undefined = gift
      ? {
          eventType: "gift",
          gift: {
            id: gift.id,
            title: gift.title,
            description: gift.description,
            suggestedReaction: gift.reactionPreview
          },
          userMessage: userText || undefined
        }
      : undefined;

    const generated = await generateCharacterTurnWithRetry({
      userId: user.id,
      character: visibleCharacter,
      language: body.data.language as SupportedLanguage,
      conversationId: conversation.id,
      giftEvent
    });

    await completeChatRequest({
      userId: user.id,
      requestId,
      conversationId: generated.conversationId,
      reply: generated.reply,
      inputTokens: generated.inputTokens,
      outputTokens: generated.outputTokens,
      provider: generated.provider,
      model: generated.model,
      language: body.data.language as SupportedLanguage
    });
    requestCompleted = true;

    if (gift) {
      // The AI turn is complete and the inventory unit has been consumed.
      // Finalization errors must not refund a successfully delivered gift.
      giftReserved = false;

      await Promise.all([
        completeGiftSend({
          userId: user.id,
          requestId,
          conversationId: generated.conversationId,
          reply: generated.reply
        }).catch((error) => {
          console.error("Gift send completion failed:", error);
          return false;
        }),
        markGiftReply({
          conversationId: generated.conversationId,
          reply: generated.reply,
          requestId,
          giftId: gift.id
        }).catch((error) => {
          console.error("Gift reply metadata update failed:", error);
        })
      ]);
    }

    await completeChatMessageCredit({
      userId: user.id,
      requestId
    }).catch((error) => {
      console.error("Message credit completion failed:", error);
    });

    return NextResponse.json({
      reply: generated.reply,
      conversationId: generated.conversationId,
      gift: gift
        ? {
            id: gift.id,
            title: gift.title,
            image: gift.image
          }
        : undefined,
      credits: {
        source: credit.source,
        trialRemaining: credit.trialRemaining,
        purchasedRemaining: credit.purchasedRemaining
      },
      usage: {
        inputTokens: generated.inputTokens,
        outputTokens: generated.outputTokens,
        provider: generated.provider,
        model: generated.model,
        language: body.data.language
      }
    });
  } catch (error) {
    if (giftReserved && !requestCompleted) {
      await failGiftSend({
        userId: user.id,
        requestId,
        errorCode: "GIFT_CHAT_FAILED"
      }).catch(() => undefined);
    }

    if (insertedGiftMessageId) {
      try {
        await getSupabaseServiceClient()
          .from("messages")
          .delete()
          .eq("id", insertedGiftMessageId);
      } catch {
        // The failed gift request is still refunded by failGiftSend.
      }
    }

    if (!requestCompleted) {
      await failChatRequest({
        userId: user.id,
        requestId,
        errorCode: "CHAT_FAILED"
      }).catch(() => undefined);

      if (creditReserved) {
        await refundChatMessageCredit({
          userId: user.id,
          requestId
        }).catch(() => undefined);
      }
    }

    console.error("Chat failed:", error);
    return NextResponse.json({ error: "CHAT_FAILED" }, { status: 500 });
  }
}
