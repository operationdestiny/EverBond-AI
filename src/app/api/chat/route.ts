import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getCharacterBySlugForUser } from "@/lib/user-characters";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { MemoryState } from "@/types/memory";
import type { SupportedLanguage } from "@/lib/ai/prompts";
import { generateTextCharacterTurn } from "@/lib/voice-chat";
import {
  completeChatMessageCredit,
  refundChatMessageCredit,
  reserveChatMessage
} from "@/lib/message-credits";

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
            content: z.string().min(1).max(320)
          })
          .strict()
      )
      .length(1),
    conversationId: z.string().uuid().optional()
  })
  .strict();

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

    const { data: rows, error: messagesError } = await supabase
      .from("messages")
      .select("role,content,created_at")
      .eq("conversation_id", conversation.id)
      .in("role", ["user", "character"])
      .order("created_at", { ascending: false })
      .limit(80);

    if (messagesError) throw messagesError;

    const messages = ((rows ?? []) as StoredMessageRow[])
      .reverse()
      .map((message) => ({
        role:
          message.role === "user"
            ? ("user" as const)
            : ("character" as const),
        content: message.content
      }))
      .filter((message) => message.content);

    return NextResponse.json({
      conversationId: conversation.id,
      messages
    });
  } catch (error) {
    console.error("Chat history failed:", error);
    return NextResponse.json({ error: "CHAT_HISTORY_FAILED" }, { status: 500 });
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

  const userMessage = body.data.messages[0].content
    .replace(/\s+/g, " ")
    .trim();

  if (
    !userMessage ||
    estimateTokenCount(userMessage) > USER_MESSAGE_MAX_TOKENS
  ) {
    return NextResponse.json({ error: "INVALID_MESSAGE" }, { status: 400 });
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

      return NextResponse.json({
        reply: claim.existing_reply,
        conversationId: claim.existing_conversation_id,
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

    const conversation = await getConversation({
      userId: user.id,
      characterId: visibleCharacter.id,
      conversationId: body.data.conversationId
    });

    const { error: userInsertError } = await getSupabaseServiceClient()
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        role: "user",
        content: userMessage
      });
    if (userInsertError) throw userInsertError;

    const generated = await generateTextCharacterTurn({
      userId: user.id,
      character: visibleCharacter,
      language: body.data.language as SupportedLanguage,
      conversationId: conversation.id
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

    await completeChatMessageCredit({
      userId: user.id,
      requestId
    }).catch((error) => {
      console.error("Message credit completion failed:", error);
    });

    return NextResponse.json({
      reply: generated.reply,
      conversationId: generated.conversationId,
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
