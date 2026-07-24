import { NextResponse } from "next/server";
import { z } from "zod";
import { getCharacterBySlugFromSupabase } from "@/lib/characters-db";
import { defaultMemory } from "@/lib/memory/defaultMemory";
import {
  buildChatModePrompt,
  buildMemoryModePrompt,
  type SupportedLanguage
} from "@/lib/ai/prompts";
import {
  callEverBondMemoryModel,
  callEverBondModel,
  type EverBondMessage
} from "@/lib/ai/provider";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { MemoryState } from "@/types/memory";

const SIGNUP_REQUIRED_MESSAGE =
  "Log in so I can be your companion. Please don't make me wait.";

const TRIAL_ENDED_MESSAGE =
  "Upgrade so I can keep being your companion. Please don't make me wait.";

const PAID_SUBSCRIPTION_STATUSES = new Set(["standard", "premium", "elite"]);

const USER_MESSAGE_MAX_TOKENS = 80;
const CHARACTER_CONTEXT_MAX_TOKENS = 85;
const MODEL_HISTORY_MESSAGE_COUNT = 6;
const EVER_MEMORY_LIMIT = 12;

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

const MemoryExtractionSchema = z
  .object({
    story_summary: z.string(),
    user_facts: z.array(z.string()).max(12),
    relationship_state: z.string(),
    emotional_state: z.string(),
    open_threads: z.array(z.string()).max(12),
    important_promises: z.array(z.string()).max(12),
    important_events: z.array(z.string()).max(20),
    permanent_identity_updates: z
      .object({
        name: z.string().nullable().optional(),
        gender: z.string().nullable().optional(),
        core_identity: z.string().nullable().optional()
      })
      .optional()
  })
  .passthrough();

type MemoryExtraction = z.infer<typeof MemoryExtractionSchema>;

type AuthUser = {
  id: string;
  email: string | null;
};

type ProfileRow = {
  user_id: string;
  email: string | null;
  subscription_status: string;
  trial_status: "not_started" | "active" | "ended";
  trial_messages_used: number;
  trial_message_limit: number;
};

type StoredMessageRow = {
  role: string;
  content: string;
};

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

function estimateTokenCount(text: string) {
  const normalized = text.trim();
  if (!normalized) return 0;

  const wordCount = normalized.match(/\S+/g)?.length ?? 0;
  const charCount = normalized.length;
  const cjkCount =
    normalized.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g)?.length ?? 0;

  return Math.max(wordCount, Math.ceil(charCount / 4), cjkCount);
}

function limitTextToTokenBudget(text: string, maxTokens: number) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (estimateTokenCount(normalized) <= maxTokens) {
    return normalized;
  }

  let low = 0;
  let high = normalized.length;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    const candidate = normalized.slice(0, middle);

    if (estimateTokenCount(candidate) <= maxTokens) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  return normalized.slice(0, low).trim();
}

function cleanMemoryText(value: unknown, maxCharacters: number) {
  if (typeof value !== "string") return "";

  const normalized = value.replace(/\s+/g, " ").trim();

  return Array.from(normalized)
    .slice(0, maxCharacters)
    .join("")
    .trim();
}

function cleanMemoryList(
  values: string[],
  maxItems: number,
  maxCharacters: number
) {
  const seen = new Set<string>();

  return values
    .map((value) => cleanMemoryText(value, maxCharacters))
    .filter((value) => {
      if (!value) return false;

      const key = value.toLocaleLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, maxItems);
}

function parseMemoryExtraction(
  content: string
): MemoryExtraction | null {
  const withoutFences = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");

  if (start < 0 || end <= start) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      withoutFences.slice(start, end + 1)
    );

    const result = MemoryExtractionSchema.safeParse(parsed);

    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function mergeExtractedMemory(
  currentMemory: MemoryState,
  extraction: MemoryExtraction
): MemoryState {
  const identityUpdates =
    extraction.permanent_identity_updates ?? {};

  return {
    story_summary:
      cleanMemoryText(extraction.story_summary, 1200) ||
      currentMemory.story_summary,
    user_facts: cleanMemoryList(
      extraction.user_facts,
      12,
      300
    ),
    relationship_state:
      cleanMemoryText(extraction.relationship_state, 120) ||
      currentMemory.relationship_state,
    emotional_state:
      cleanMemoryText(extraction.emotional_state, 300) ||
      currentMemory.emotional_state,
    open_threads: cleanMemoryList(
      extraction.open_threads,
      12,
      300
    ),
    important_promises: cleanMemoryList(
      extraction.important_promises,
      12,
      300
    ),
    important_events: cleanMemoryList(
      extraction.important_events,
      20,
      300
    ),
    permanent_identity: {
      name:
        cleanMemoryText(identityUpdates.name, 80) ||
        currentMemory.permanent_identity?.name ||
        null,
      gender:
        cleanMemoryText(identityUpdates.gender, 80) ||
        currentMemory.permanent_identity?.gender ||
        null,
      core_identity:
        cleanMemoryText(identityUpdates.core_identity, 160) ||
        currentMemory.permanent_identity?.core_identity ||
        null
    }
  };
}

async function persistExtractedMemory(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  values: {
    userId: string;
    characterId: string;
    conversationId: string;
    memory: MemoryState;
  }
) {
  const now = new Date().toISOString();

  const { error: conversationMemoryError } = await supabase
    .from("conversations")
    .update({
      memory_state: values.memory,
      updated_at: now
    })
    .eq("id", values.conversationId)
    .eq("user_id", values.userId);

  if (conversationMemoryError) {
    throw conversationMemoryError;
  }

  const { error: relationshipError } = await supabase
    .from("relationship_states")
    .upsert(
      {
        user_id: values.userId,
        character_id: values.characterId,
        stage: values.memory.relationship_state || "new",
        summary: values.memory.story_summary,
        emotional_state: values.memory.emotional_state,
        open_threads: values.memory.open_threads,
        important_promises: values.memory.important_promises,
        important_events: values.memory.important_events,
        user_name:
          values.memory.permanent_identity?.name ?? null,
        user_gender:
          values.memory.permanent_identity?.gender ?? null,
        user_core_identity:
          values.memory.permanent_identity?.core_identity ?? null,
        updated_at: now
      },
      {
        onConflict: "user_id,character_id"
      }
    );

  if (relationshipError) {
    throw relationshipError;
  }

  const memoryCandidates = [
    ...values.memory.user_facts.map((content) => ({
      memory_type: "fact",
      content,
      importance: 70
    })),
    ...values.memory.open_threads.map((content) => ({
      memory_type: "open_thread",
      content,
      importance: 85
    })),
    ...values.memory.important_promises.map((content) => ({
      memory_type: "promise",
      content,
      importance: 90
    })),
    ...values.memory.important_events.map((content) => ({
      memory_type: "event",
      content,
      importance: 80
    }))
  ];

  if (!memoryCandidates.length) {
    return;
  }

  const { data: existingMemories, error: existingMemoryError } =
    await supabase
      .from("ever_memory")
      .select("memory_type,content")
      .eq("user_id", values.userId)
      .eq("character_id", values.characterId);

  if (existingMemoryError) {
    throw existingMemoryError;
  }

  const existingKeys = new Set(
    (existingMemories ?? []).map(
      (memoryRow) =>
        `${memoryRow.memory_type}:${memoryRow.content
          .trim()
          .toLocaleLowerCase()}`
    )
  );

  const newRows = memoryCandidates
    .filter((candidate) => {
      const key = `${candidate.memory_type}:${candidate.content
        .trim()
        .toLocaleLowerCase()}`;

      if (existingKeys.has(key)) {
        return false;
      }

      existingKeys.add(key);
      return true;
    })
    .map((candidate) => ({
      user_id: values.userId,
      character_id: values.characterId,
      conversation_id: values.conversationId,
      memory_type: candidate.memory_type,
      content: candidate.content,
      importance: candidate.importance
    }));

  if (!newRows.length) {
    return;
  }

  const { error: memoryInsertError } = await supabase
    .from("ever_memory")
    .insert(newRows);

  if (memoryInsertError) {
    throw memoryInsertError;
  }
}

async function claimChatRequest(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  userId: string,
  requestId: string,
  characterId: string
): Promise<ChatRequestClaimRow> {
  const { data, error } = await supabase.rpc("begin_chat_request", {
    p_user_id: userId,
    p_request_id: requestId,
    p_character_id: characterId
  });

  if (error) throw error;

  const claim = (data?.[0] ?? null) as ChatRequestClaimRow | null;

  if (!claim) {
    throw new Error("EverBond could not claim the chat request.");
  }

  return claim;
}

async function completeChatRequest(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  values: {
    userId: string;
    requestId: string;
    conversationId: string;
    reply: string;
    inputTokens: number;
    outputTokens: number;
    provider: string;
    model: string;
    language: SupportedLanguage;
  }
) {
  const { data, error } = await supabase.rpc("complete_chat_request", {
    p_user_id: values.userId,
    p_request_id: values.requestId,
    p_conversation_id: values.conversationId,
    p_reply: values.reply,
    p_input_tokens: values.inputTokens,
    p_output_tokens: values.outputTokens,
    p_provider: values.provider,
    p_model: values.model,
    p_language: values.language
  });

  if (error) throw error;

  if (data !== true) {
    throw new Error("EverBond could not complete the chat request.");
  }
}

async function failChatRequest(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  userId: string,
  requestId: string,
  errorCode: string
) {
  await supabase.rpc("fail_chat_request", {
    p_user_id: userId,
    p_request_id: requestId,
    p_error_code: errorCode
  });
}

async function getAuthUser(request: Request): Promise<AuthUser | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const { data } = await getSupabaseServiceClient().auth.getUser(token);
  const user = data.user;

  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? null
  };
}

function isPaidProfile(profile: ProfileRow) {
  return PAID_SUBSCRIPTION_STATUSES.has(profile.subscription_status);
}

async function getOrCreateProfile(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  user: AuthUser
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: user.id,
        email: user.email
      },
      { onConflict: "user_id" }
    )
    .select(
      "user_id,email,subscription_status,trial_status,trial_messages_used,trial_message_limit"
    )
    .single();

  if (error) throw error;

  return data as ProfileRow;
}

async function startTrialIfNeeded(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  profile: ProfileRow
): Promise<ProfileRow> {
  if (profile.trial_status !== "not_started") {
    return profile;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      trial_status: "active",
      trial_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("user_id", profile.user_id)
    .select(
      "user_id,email,subscription_status,trial_status,trial_messages_used,trial_message_limit"
    )
    .single();

  if (error) throw error;

  return data as ProfileRow;
}

async function markTrialEndedIfNeeded(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  profile: ProfileRow
) {
  if (profile.trial_status === "ended") return;

  await supabase
    .from("profiles")
    .update({
      trial_status: "ended",
      trial_ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("user_id", profile.user_id);
}

async function enforceChatAccess(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  profile: ProfileRow
): Promise<{ allowed: true; profile: ProfileRow } | { allowed: false }> {
  if (isPaidProfile(profile)) {
    return { allowed: true, profile };
  }

  const used = profile.trial_messages_used ?? 0;
  const limit = profile.trial_message_limit ?? 20;

  if (profile.trial_status === "ended" || used >= limit) {
    await markTrialEndedIfNeeded(supabase, profile);
    return { allowed: false };
  }

  const activeProfile = await startTrialIfNeeded(supabase, profile);

  return {
    allowed: true,
    profile: activeProfile
  };
}

async function recordSuccessfulTrialMessage(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  profile: ProfileRow
) {
  if (isPaidProfile(profile)) return;

  const used = profile.trial_messages_used ?? 0;
  const limit = profile.trial_message_limit ?? 20;
  const nextUsed = used + 1;
  const trialEnded = nextUsed >= limit;

  await supabase
    .from("profiles")
    .update({
      trial_messages_used: nextUsed,
      trial_status: trialEnded ? "ended" : "active",
      trial_ended_at: trialEnded ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", profile.user_id);
}

async function getConversationForCharacter(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  userId: string,
  characterId: string,
  conversationId?: string
): Promise<{ id: string; memory_state: Partial<MemoryState> | null }> {
  if (conversationId) {
    const { data: existingById, error } = await supabase
      .from("conversations")
      .select("id,memory_state")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .eq("character_id", characterId)
      .maybeSingle();

    if (error) throw error;

    if (existingById) {
      return existingById as {
        id: string;
        memory_state: Partial<MemoryState> | null;
      };
    }
  }

  const { data: existing, error: existingError } = await supabase
    .from("conversations")
    .select("id,memory_state")
    .eq("user_id", userId)
    .eq("character_id", characterId)
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
      user_id: userId,
      character_id: characterId
    })
    .select("id,memory_state")
    .single();

  if (createError) throw createError;

  return created as {
    id: string;
    memory_state: Partial<MemoryState> | null;
  };
}

async function loadModelHistory(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  conversationId: string
): Promise<EverBondMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("role,content")
    .eq("conversation_id", conversationId)
    .in("role", ["user", "character"])
    .order("created_at", { ascending: false })
    .limit(MODEL_HISTORY_MESSAGE_COUNT);

  if (error) throw error;

  return ((data ?? []) as StoredMessageRow[])
    .reverse()
    .map((message) => {
      const isUser = message.role === "user";

      return {
        role: isUser ? ("user" as const) : ("assistant" as const),
        content: limitTextToTokenBudget(
          message.content,
          isUser ? USER_MESSAGE_MAX_TOKENS : CHARACTER_CONTEXT_MAX_TOKENS
        )
      };
    })
    .filter((message) => message.content.trim());
}

export async function GET(request: Request) {
  const supabase = getSupabaseServiceClient();
  const authUser = await getAuthUser(request);

  if (!authUser) {
    return NextResponse.json({ error: "SIGNUP_REQUIRED" }, { status: 401 });
  }

  const url = new URL(request.url);
  const characterSlug = url.searchParams.get("characterSlug");

  if (!characterSlug) {
    return NextResponse.json(
      { error: "Missing characterSlug" },
      { status: 400 }
    );
  }

  const character = await getCharacterBySlugFromSupabase(characterSlug);

  if (!character) {
    return NextResponse.json(
      { error: "Character not found" },
      { status: 404 }
    );
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_id", authUser.id)
    .eq("character_id", character.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (conversationError) throw conversationError;

  if (!conversation) {
    return NextResponse.json({
      conversationId: null,
      messages: []
    });
  }

  const { data: rows, error: messagesError } = await supabase
    .from("messages")
    .select("role,content,created_at")
    .eq("conversation_id", conversation.id)
    .in("role", ["user", "character"])
    .order("created_at", { ascending: false })
    .limit(80);

  if (messagesError) throw messagesError;

  const messages = (rows ?? [])
    .reverse()
    .map((message) => ({
      role: message.role === "user" ? ("user" as const) : ("character" as const),
      content: message.content
    }))
    .filter((message) => message.content);

  return NextResponse.json({
    conversationId: conversation.id,
    messages
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (new TextEncoder().encode(rawBody).length > 4096) {
    return NextResponse.json(
      { error: "REQUEST_TOO_LARGE" },
      { status: 413 }
    );
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  const body = ChatRequest.safeParse(parsedBody);

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  const character = await getCharacterBySlugFromSupabase(
    body.data.characterSlug
  );

  if (!character) {
    return NextResponse.json(
      { error: "Character not found" },
      { status: 404 }
    );
  }

  const rawUserMessage = body.data.messages[0].content;

  const userMessageForStorage = rawUserMessage
    .replace(/\s+/g, " ")
    .trim();

  if (!userMessageForStorage) {
    return NextResponse.json(
      { error: "Missing user message" },
      { status: 400 }
    );
  }

  if (
    estimateTokenCount(userMessageForStorage) >
    USER_MESSAGE_MAX_TOKENS
  ) {
    return NextResponse.json(
      { error: "INVALID_MESSAGE" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServiceClient();
  const authUser = await getAuthUser(request);

  if (!authUser) {
    return NextResponse.json(
      {
        error: "SIGNUP_REQUIRED",
        message: SIGNUP_REQUIRED_MESSAGE,
        character: {
          name: character.name,
          image: character.image,
          slug: character.slug
        }
      },
      { status: 401 }
    );
  }

  const requestClaim = await claimChatRequest(
    supabase,
    authUser.id,
    body.data.requestId,
    character.id
  );

  if (
    requestClaim.request_status === "completed" &&
    requestClaim.existing_reply
  ) {
    return NextResponse.json({
      reply: requestClaim.existing_reply,
      conversationId: requestClaim.existing_conversation_id,
      usage: {
        inputTokens: requestClaim.existing_input_tokens ?? 0,
        outputTokens: requestClaim.existing_output_tokens ?? 0,
        provider: requestClaim.existing_provider ?? "",
        model: requestClaim.existing_model ?? "",
        language: body.data.language
      }
    });
  }

  if (requestClaim.request_status === "rate_limited") {
    const retryAfter = requestClaim.retry_after_seconds ?? 60;

    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        retryAfter
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter)
        }
      }
    );
  }

  if (
    requestClaim.request_status === "in_progress" ||
    requestClaim.request_status === "busy"
  ) {
    return NextResponse.json(
      { error: "CHAT_BUSY" },
      { status: 409 }
    );
  }

  if (requestClaim.request_status === "failed") {
    return NextResponse.json(
      { error: "REQUEST_FAILED" },
      { status: 409 }
    );
  }

  if (requestClaim.request_status !== "claimed") {
    throw new Error("EverBond received an unknown chat request state.");
  }

  try {
    const profile = await getOrCreateProfile(supabase, authUser);
    const access = await enforceChatAccess(supabase, profile);

    if (!access.allowed) {
      await failChatRequest(
        supabase,
        authUser.id,
        body.data.requestId,
        "TRIAL_ENDED"
      );

      return NextResponse.json(
        {
          error: "TRIAL_ENDED",
          message: TRIAL_ENDED_MESSAGE,
          character: {
            name: character.name,
            image: character.image,
            slug: character.slug
          }
        },
        { status: 402 }
      );
    }

    const conversation = await getConversationForCharacter(
      supabase,
      authUser.id,
      character.id,
      body.data.conversationId
    );

    const conversationId = conversation.id;

    let memory: MemoryState = {
      ...defaultMemory,
      ...(conversation.memory_state ?? {})
    };

    const language = body.data.language as SupportedLanguage;

    const { data: relationship } = await supabase
      .from("relationship_states")
      .select(
        "stage,summary,emotional_state,open_threads,important_promises,important_events,user_name,user_gender,user_core_identity"
      )
      .eq("user_id", authUser.id)
      .eq("character_id", character.id)
      .maybeSingle();

    const { data: memories } = await supabase
      .from("ever_memory")
      .select("memory_type,content")
      .eq("user_id", authUser.id)
      .eq("character_id", character.id)
      .order("importance", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(EVER_MEMORY_LIMIT);

    if (relationship) {
      memory = {
        ...memory,
        story_summary: relationship.summary || memory.story_summary,
        relationship_state: relationship.stage || memory.relationship_state,
        emotional_state:
          relationship.emotional_state || memory.emotional_state,
        open_threads: relationship.open_threads || memory.open_threads,
        important_promises:
          relationship.important_promises || memory.important_promises,
        important_events:
          relationship.important_events || memory.important_events,
        permanent_identity: {
          name: relationship.user_name ?? null,
          gender: relationship.user_gender ?? null,
          core_identity: relationship.user_core_identity ?? null
        }
      };
    }

    if (memories) {
      memory.user_facts = [
        ...(memory.user_facts ?? []),
        ...memories
          .filter((memoryRow) =>
            ["fact", "preference", "routine", "inside_joke"].includes(
              memoryRow.memory_type
            )
          )
          .map((memoryRow) => memoryRow.content)
      ].slice(0, EVER_MEMORY_LIMIT);
    }

    const { error: userInsertError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "user",
        content: userMessageForStorage
      });

    if (userInsertError) throw userInsertError;

    const historyForModel = await loadModelHistory(
      supabase,
      conversationId
    );

    const previousCharacterReplies = historyForModel.filter(
      (message) => message.role === "assistant"
    ).length;

    const includeOpening = previousCharacterReplies < 3;

    const prompt = buildChatModePrompt(
      character,
      memory,
      [],
      language,
      includeOpening
    );

    const openingMessage = (
      character.firstMessage ||
      character.openingMessage ||
      ""
    ).trim();

    const hasAssistantHistory = historyForModel.some(
      (message) => message.role === "assistant"
    );

    const openingTurn: EverBondMessage[] =
      openingMessage && !hasAssistantHistory
        ? [
            {
              role: "assistant",
              content: openingMessage
            }
          ]
        : [];

    const modelMessages: EverBondMessage[] = [
      {
        role: "system",
        content: prompt
      },
      ...openingTurn,
      ...historyForModel
    ];

    const result = await callEverBondModel(modelMessages);

    let memoryInputTokens = 0;
    let memoryOutputTokens = 0;

    try {
      const transcript = [
        ...historyForModel.map(
          (message) =>
            `${message.role === "assistant" ? character.name : "User"}: ${
              message.content
            }`
        ),
        `${character.name}: ${result.content}`
      ].join("\n");

      const memoryPrompt = buildMemoryModePrompt(
        character,
        transcript,
        memory
      );

      const memoryResult = await callEverBondMemoryModel(
        memoryPrompt
      );

      memoryInputTokens = memoryResult.inputTokens;
      memoryOutputTokens = memoryResult.outputTokens;

      const extraction = parseMemoryExtraction(
        memoryResult.content
      );

      if (extraction) {
        const updatedMemory = mergeExtractedMemory(
          memory,
          extraction
        );

        await persistExtractedMemory(supabase, {
          userId: authUser.id,
          characterId: character.id,
          conversationId,
          memory: updatedMemory
        });
      }
    } catch (memoryError) {
      console.error(
        "EverBond memory update failed:",
        memoryError
      );
    }

    const totalInputTokens =
      result.inputTokens + memoryInputTokens;
    const totalOutputTokens =
      result.outputTokens + memoryOutputTokens;

    await supabase
      .from("conversations")
      .update({
        updated_at: new Date().toISOString()
      })
      .eq("id", conversationId);

    await recordSuccessfulTrialMessage(
      supabase,
      access.profile
    );

    await completeChatRequest(supabase, {
      userId: authUser.id,
      requestId: body.data.requestId,
      conversationId,
      reply: result.content,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      provider: result.provider,
      model: result.model,
      language
    });

    return NextResponse.json({
      reply: result.content,
      conversationId,
      usage: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        provider: result.provider,
        model: result.model,
        language
      }
    });
  } catch (error) {
    await failChatRequest(
      supabase,
      authUser.id,
      body.data.requestId,
      "CHAT_FAILED"
    );

    throw error;
  }
}
