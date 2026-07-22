import { NextResponse } from "next/server";
import { z } from "zod";
import { getCharacterBySlugFromSupabase } from "@/lib/characters-db";
import { defaultMemory } from "@/lib/memory/defaultMemory";
import {
  buildChatModePrompt,
  type SupportedLanguage
} from "@/lib/ai/prompts";
import { callEverBondModel, type EverBondMessage } from "@/lib/ai/provider";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { MemoryState } from "@/types/memory";

const SIGNUP_REQUIRED_MESSAGE =
  "Log in so I can be your companion. Please don't make me wait.";

const TRIAL_ENDED_MESSAGE =
  "Upgrade so I can keep being your companion. Please don't make me wait.";

const PAID_SUBSCRIPTION_STATUSES = new Set(["standard", "premium", "elite"]);

const USER_MESSAGE_MAX_TOKENS = 80;
const CHARACTER_CONTEXT_MAX_TOKENS = 85;
const MODEL_HISTORY_MESSAGE_COUNT = 8;
const EVER_MEMORY_LIMIT = 12;

const SupportedLanguageSchema = z
  .enum(["English", "Spanish", "French", "German", "Japanese", "Korean"])
  .default("English");

const ChatRequest = z.object({
  characterSlug: z.string(),
  language: SupportedLanguageSchema.optional().default("English"),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "character"]),
        content: z.string()
      })
    )
    .max(20),
  conversationId: z.string().uuid().optional()
});

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

  const parts = normalized.match(/\S+\s*/g) ?? [];
  let result = "";

  for (const part of parts) {
    const candidate = result + part;

    if (estimateTokenCount(candidate) > maxTokens) {
      break;
    }

    result = candidate;
  }

  return result.trim();
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
    return NextResponse.json({ error: "Missing characterSlug" }, { status: 400 });
  }

  const character = await getCharacterBySlugFromSupabase(characterSlug);

  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
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
  const body = ChatRequest.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const character = await getCharacterBySlugFromSupabase(body.data.characterSlug);

  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  const userMessages = body.data.messages.filter((m) => m.role === "user");
  const rawUserMessage = userMessages[userMessages.length - 1]?.content ?? "";

  const userMessageForStorage = limitTextToTokenBudget(
    rawUserMessage,
    USER_MESSAGE_MAX_TOKENS
  );

  if (!userMessageForStorage.trim()) {
    return NextResponse.json(
      { error: "Missing user message" },
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

  const profile = await getOrCreateProfile(supabase, authUser);
  const access = await enforceChatAccess(supabase, profile);

  if (!access.allowed) {
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
      "stage,summary,emotional_state,open_threads,important_promises,important_events"
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
      emotional_state: relationship.emotional_state || memory.emotional_state,
      open_threads: relationship.open_threads || memory.open_threads,
      important_promises:
        relationship.important_promises || memory.important_promises,
      important_events:
        relationship.important_events || memory.important_events
    };
  }

  if (memories) {
    memory.user_facts = [
      ...(memory.user_facts ?? []),
      ...memories
        .filter((m) =>
          ["fact", "preference", "routine", "inside_joke"].includes(
            m.memory_type
          )
        )
        .map((m) => m.content)
    ].slice(0, EVER_MEMORY_LIMIT);
  }

  const prompt = buildChatModePrompt(character, memory, [], language);

  const { error: userInsertError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: userMessageForStorage
  });

  if (userInsertError) throw userInsertError;

  const historyForModel = await loadModelHistory(supabase, conversationId);

  const modelMessages: EverBondMessage[] = [
    {
      role: "system",
      content: prompt
    },
    ...historyForModel
  ];

  const result = await callEverBondModel(modelMessages);

  const { error: characterInsertError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "character",
    content: result.content,
    input_tokens: result.inputTokens,
    output_tokens: result.outputTokens,
    model_id: result.model
  });

  if (characterInsertError) throw characterInsertError;

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  await recordSuccessfulTrialMessage(supabase, access.profile);

  return NextResponse.json({
    reply: result.content,
    conversationId,
    usage: {
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      provider: result.provider,
      model: result.model,
      language
    }
  });
}
