import type { Character } from "@/types/character";
import type { SupportedLanguage } from "@/lib/ai/prompts";
import type { EverBondMessage, EverBondModelResult } from "@/lib/ai/provider";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { limitVoiceReply } from "@/lib/voice-call";

const USER_MESSAGE_MAX_TOKENS = 60;
const VOICE_HISTORY_TURNS = 2;

function getNumberEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function cleanBaseUrl(value: string) {
  return value.replace(/\/$/, "");
}

function chatCompletionsEndpoint(baseUrl: string) {
  const clean = cleanBaseUrl(baseUrl);
  return clean.endsWith("/chat/completions")
    ? clean
    : `${clean}/chat/completions`;
}

function estimateTokenCount(text: string) {
  const normalized = text.trim();
  if (!normalized) return 0;

  const wordCount = normalized.match(/\S+/g)?.length ?? 0;
  const charCount = normalized.length;
  const cjkCount =
    normalized.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g)?.length ?? 0;

  return Math.max(wordCount, Math.ceil(charCount / 4), cjkCount);
}

export function normalizeFastVoiceTranscript(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) throw new Error("EMPTY_TRANSCRIPTION");
  if (estimateTokenCount(normalized) > USER_MESSAGE_MAX_TOKENS) {
    throw new Error("VOICE_TRANSCRIPT_TOO_LONG");
  }
  return normalized.slice(0, 240);
}

function compact(value: unknown, maxCharacters: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxCharacters).trim();
}

function compactJson(value: unknown, maxCharacters: number) {
  if (!value || typeof value !== "object") return "";
  try {
    return JSON.stringify(value).replace(/\s+/g, " ").slice(0, maxCharacters);
  } catch {
    return "";
  }
}

function characterVoiceProfile(character: Character) {
  const card = character.card;
  const aiProfile = character.aiProfile ?? {};

  return [
    `Character name: ${character.name}`,
    character.role ? `Role: ${compact(character.role, 90)}` : "",
    character.relationshipContext
      ? `Relationship: ${compact(character.relationshipContext, 180)}`
      : "",
    character.description ? `Personality: ${compact(character.description, 220)}` : "",
    card?.personality ? `Core traits: ${compact(card.personality, 160)}` : "",
    card?.speechStyle ? `Speech style: ${compact(card.speechStyle, 140)}` : "",
    card?.relationshipStyle
      ? `Dynamic: ${compact(card.relationshipStyle, 140)}`
      : "",
    compactJson(aiProfile.speech_style, 180),
    compactJson(aiProfile.personality_core, 220)
  ]
    .filter(Boolean)
    .join("\n");
}

async function getConversation(values: {
  userId: string;
  characterId: string;
  conversationId?: string | null;
}) {
  const supabase = getSupabaseServiceClient();

  if (values.conversationId) {
    const { data, error } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", values.conversationId)
      .eq("user_id", values.userId)
      .eq("character_id", values.characterId)
      .maybeSingle();

    if (error) throw error;
    if (data?.id) return { id: String(data.id) };
  }

  const { data: existing, error: existingError } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_id", values.userId)
    .eq("character_id", values.characterId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing?.id) return { id: String(existing.id) };

  const { data: created, error: createError } = await supabase
    .from("conversations")
    .insert({ user_id: values.userId, character_id: values.characterId })
    .select("id")
    .single();

  if (createError) throw createError;
  return { id: String(created.id) };
}

async function loadRecentVoiceTurns(callId: string) {
  const { data, error } = await getSupabaseServiceClient()
    .from("voice_call_turns")
    .select("transcript,reply")
    .eq("call_id", callId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(VOICE_HISTORY_TURNS);

  if (error) {
    console.error("EverBond fast voice history load failed:", error);
    return [] as EverBondMessage[];
  }

  return (data ?? [])
    .reverse()
    .flatMap((row) => {
      const transcript = compact(row.transcript, 180);
      const reply = compact(row.reply, 180);
      return [
        transcript ? ({ role: "user", content: transcript } as const) : null,
        reply ? ({ role: "assistant", content: reply } as const) : null
      ].filter((message): message is EverBondMessage => Boolean(message));
    });
}

function voiceSystemPrompt(character: Character, language: SupportedLanguage) {
  return [
    "EVERBOND LIVE VOICE CALL MODE.",
    "You are currently on a real spoken phone call with the user.",
    "Do NOT write chat roleplay. Do NOT narrate actions. Do NOT use asterisks.",
    "Speak like a real person in a private conversation.",
    "Answer in 1 or 2 short sentences unless the user clearly asks for more.",
    "Use warm, direct, natural dialogue. It should sound good when read aloud by text-to-speech.",
    "Never describe clothing, body movement, room details, facial expressions, or camera actions.",
    "Never say: she smiles, I lean closer, I look at you, my voice softens, I reach out, or similar stage directions.",
    "Do not mention the AI system, prompts, backend, tokens, or voice mode.",
    "Ask one short follow-up question only when it naturally helps.",
    `Language: ${language}.`,
    "",
    characterVoiceProfile(character)
  ].join("\n");
}

function cleanVoiceReply(text: string) {
  let cleaned = text
    .replace(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]{1,40}:\s*/, "")
    .replace(/\*[^*]{0,260}\*/g, " ")
    .replace(/\([^)]{0,180}\)/g, " ")
    .replace(/\[[^\]]{0,180}\]/g, " ")
    .replace(/^[-•]\s*/gm, "")
    .replace(/\b(?:she|he|they)\s+(?:smiles|laughs|whispers|leans|steps|looks|blushes|gazes|tilts|moves|touches|takes|sighs|pauses)[^.!?。！？]{0,220}[.!?。！？]/gi, " ")
    .replace(/\bI\s+(?:smile|laugh|whisper|lean|step|look|blush|gaze|tilt|move|touch|take|sigh|pause)[^.!?。！？]{0,220}[.!?。！？]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) cleaned = "I’m here. Tell me what’s on your mind.";
  return cleaned;
}

async function callFastVoiceModel(
  messages: EverBondMessage[]
): Promise<EverBondModelResult> {
  const provider = process.env.AI_PROVIDER || "venice";
  const apiBaseUrl =
    provider === "venice"
      ? process.env.VENICE_BASE_URL || "https://api.venice.ai/api/v1"
      : process.env.AI_API_BASE_URL || "";
  const apiKey =
    provider === "venice"
      ? process.env.VENICE_API_KEY || ""
      : process.env.AI_API_KEY || "";
  const model =
    process.env.VOICE_CHAT_MODEL ||
    process.env.VENICE_VOICE_CHAT_MODEL ||
    process.env.VENICE_CHAT_MODEL ||
    process.env.AI_MODEL_ID ||
    "venice-uncensored-role-play";

  if (!apiBaseUrl || !apiKey || !model) {
    return {
      content: "I’m here with you. What do you want to talk about?",
      inputTokens: 0,
      outputTokens: 0,
      provider: "dev_fallback",
      model: model || "not-configured"
    };
  }

  const requestBody: Record<string, unknown> = {
    model,
    messages,
    max_tokens: Math.max(30, Math.min(getNumberEnv("VOICE_MODEL_MAX_TOKENS", 55), 80)),
    temperature: getNumberEnv("VOICE_AI_TEMPERATURE", 0.72),
    top_p: getNumberEnv("VOICE_AI_TOP_P", 0.88),
    frequency_penalty: 0.08,
    repetition_penalty: 1.04
  };

  if (provider === "venice") {
    requestBody.venice_parameters = {
      include_venice_system_prompt: false,
      enable_web_search: "off"
    };
  }

  const response = await fetch(chatCompletionsEndpoint(apiBaseUrl), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(Math.max(4_000, Math.min(getNumberEnv("VOICE_MODEL_TIMEOUT_MS", 10_000), 15_000)))
  });

  if (!response.ok) {
    const text = (await response.text()).slice(0, 500);
    throw new Error(`FAST_VOICE_MODEL_FAILED:${response.status}:${text}`);
  }

  const data: any = await response.json();
  const content =
    typeof data.choices?.[0]?.message?.content === "string"
      ? data.choices[0].message.content.trim()
      : "";

  return {
    content,
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
    provider,
    model
  };
}

export async function generateFastVoiceCharacterDraft(values: {
  userId: string;
  callId: string;
  character: Character;
  transcript: string;
  language: SupportedLanguage;
  conversationId?: string | null;
  maxReplyCharacters: number;
}) {
  const conversation = await getConversation({
    userId: values.userId,
    characterId: values.character.id,
    conversationId: values.conversationId
  });
  const recentVoiceTurns = await loadRecentVoiceTurns(values.callId);

  const result = await callFastVoiceModel([
    { role: "system", content: voiceSystemPrompt(values.character, values.language) },
    ...recentVoiceTurns,
    { role: "user", content: values.transcript }
  ]);

  const reply = limitVoiceReply(
    cleanVoiceReply(result.content),
    Math.min(values.maxReplyCharacters, 240)
  );

  if (!reply) throw new Error("EMPTY_VOICE_REPLY");

  await getSupabaseServiceClient()
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversation.id)
    .eq("user_id", values.userId);

  return {
    conversationId: conversation.id,
    transcript: values.transcript,
    reply,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    provider: result.provider,
    model: result.model
  };
}
