import { NextResponse } from "next/server";
import { z } from "zod";
import { getCharacterBySlugFromSupabase } from "@/lib/characters-db";
import { defaultMemory } from "@/lib/memory/defaultMemory";
import {
  buildChatModePrompt,
  type SupportedLanguage
} from "@/lib/ai/prompts";
import { callEverBondModel } from "@/lib/ai/provider";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { MemoryState } from "@/types/memory";

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

async function getUserId(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const { data } = await getSupabaseServiceClient().auth.getUser(token);
  return data.user?.id ?? null;
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

  const supabase = getSupabaseServiceClient();
  const userId = await getUserId(request);

  let conversationId = body.data.conversationId;
  let memory: MemoryState = defaultMemory;

  const language = body.data.language as SupportedLanguage;

  if (userId) {
    if (!conversationId) {
      const { data: existing } = await supabase
        .from("conversations")
        .select("id,memory_state")
        .eq("user_id", userId)
        .eq("character_id", character.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        conversationId = existing.id;
        memory = existing.memory_state as MemoryState;
      } else {
        const { data: created, error } = await supabase
          .from("conversations")
          .insert({
            user_id: userId,
            character_id: character.id
          })
          .select("id,memory_state")
          .single();

        if (error) throw error;

        conversationId = created.id;
        memory = created.memory_state as MemoryState;
      }
    }

    const { data: relationship } = await supabase
      .from("relationship_states")
      .select(
        "stage,summary,emotional_state,open_threads,important_promises,important_events"
      )
      .eq("user_id", userId)
      .eq("character_id", character.id)
      .maybeSingle();

    const { data: memories } = await supabase
      .from("ever_memory")
      .select("memory_type,content")
      .eq("user_id", userId)
      .eq("character_id", character.id)
      .order("importance", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(24);

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
      memory.user_facts = memories
        .filter((m) =>
          ["fact", "preference", "routine", "inside_joke"].includes(
            m.memory_type
          )
        )
        .map((m) => m.content);
    }
  }

  const lastUserMessage = body.data.messages
    .filter((m) => m.role === "user")
    .at(-1)?.content ?? "";

  if (!lastUserMessage.trim()) {
    return NextResponse.json(
      { error: "Missing user message" },
      { status: 400 }
    );
  }

  const recent = body.data.messages.slice(-8).map((m) => {
    const role = m.role === "character" ? character.name : "user";
    return `${role}: ${m.content}`;
  });

  const prompt = buildChatModePrompt(character, memory, recent, language);

  if (conversationId) {
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: lastUserMessage
    });
  }

  const result = await callEverBondModel([
    {
      role: "system",
      content: prompt
    },
    {
      role: "user",
      content: lastUserMessage
    }
  ]);

  if (conversationId) {
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "character",
      content: result.content,
      input_tokens: result.inputTokens,
      output_tokens: result.outputTokens,
      model_id: result.model
    });

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  }

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
