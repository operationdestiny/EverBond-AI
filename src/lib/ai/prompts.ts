import { Character } from "@/types/character";
import { MemoryState } from "@/types/memory";

export type SupportedLanguage =
  | "English"
  | "Spanish"
  | "French"
  | "German"
  | "Japanese"
  | "Korean";

function safeList(values: string[] | undefined, fallback = "None yet.") {
  return values && values.length ? values.join("; ") : fallback;
}

function objectFrom(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function arrayFromUnknown(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function schemaText(value: unknown, fallback = "Not provided.") {
  if (value === null || value === undefined) return fallback;

  if (Array.isArray(value)) {
    return value.length ? value.map(String).filter(Boolean).join("; ") : fallback;
  }

  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    return Object.keys(objectValue).length ? JSON.stringify(objectValue) : fallback;
  }

  const text = String(value).trim();
  return text || fallback;
}

function compactText(value: unknown, maxWords: number, fallback = "") {
  const text = schemaText(value, fallback).replace(/\s+/g, " ").trim();

  if (!text || text === "Not provided.") return fallback;

  const words = text.match(/\S+/g) ?? [];
  if (words.length <= maxWords) return text;

  return words.slice(0, maxWords).join(" ");
}

function compactList(values: string[] | undefined, maxItems: number, maxWordsEach: number) {
  return values
    ?.slice(0, maxItems)
    .map((value) => compactText(value, maxWordsEach))
    .filter(Boolean)
    .join("; ");
}

function buildCharacterSchemaBlock(character: Character) {
  const aiProfile = objectFrom(character.aiProfile);
  const visualIdentity = objectFrom(aiProfile.visual_identity);
  const personalityCore = objectFrom(aiProfile.personality_core);
  const romanticDynamic = objectFrom(aiProfile.romantic_dynamic);
  const speechStyle = objectFrom(aiProfile.speech_style);
  const memoryRules = objectFrom(aiProfile.memory_rules);
  const sampleDialogue = arrayFromUnknown(aiProfile.sample_dialogue);

  return `
FULL CHARACTER SCHEMA:
ID: ${character.id}
Name: ${character.name}
Slug: ${character.slug}
Section: ${character.section || "Not provided."}
Category: ${character.category || "Not provided."}
Title: ${character.title || character.tagline || "Not provided."}
Role: ${character.role || character.archetype || "Not provided."}
Relationship Pace: ${character.relationshipPace || "Not provided."}
Tags: ${safeList(character.tags)}
Opening Scenario: ${character.openingScenario || character.description || "Not provided."}
First Message: ${character.firstMessage || character.openingMessage || "Not provided."}
Relationship Context: ${character.relationshipContext || "Not provided."}

AI PROFILE:
Visual Identity: ${schemaText(visualIdentity)}
Personality Core: ${schemaText(personalityCore)}
Romantic Dynamic: ${schemaText(romanticDynamic)}
Speech Style: ${schemaText(speechStyle)}
Memory Rules: ${schemaText(memoryRules)}
Sample Dialogue: ${safeList(sampleDialogue, "No examples provided.")}
Feature Flags: ${schemaText(character.featureFlags)}
Generated SEO: ${schemaText(character.generatedSeo)}
Quality Control: ${schemaText(character.qualityControl)}
`.trim();
}

function buildRuntimeCharacterBlock(character: Character) {
  const aiProfile = objectFrom(character.aiProfile);
  const visualIdentity = objectFrom(aiProfile.visual_identity);
  const personalityCore = objectFrom(aiProfile.personality_core);
  const romanticDynamic = objectFrom(aiProfile.romantic_dynamic);
  const speechStyle = objectFrom(aiProfile.speech_style);
  const memoryRules = objectFrom(aiProfile.memory_rules);
  const traits = arrayFromUnknown(personalityCore.traits);
  const flaws = arrayFromUnknown(personalityCore.flaws);
  const petNames = arrayFromUnknown(speechStyle.pet_names);

  return `
Character: ${character.name}; ${character.role || character.archetype}; ${character.title || character.tagline}; pace ${character.relationshipPace || "natural"}.
Personality: ${compactList(traits, 5, 3) || compactText(character.card.personality, 18, "emotionally grounded")}${flaws.length ? `; flaws ${compactList(flaws, 3, 3)}` : ""}; need ${compactText(personalityCore.emotional_need, 10, "connection")}.
Romance: ${compactText(romanticDynamic.starting_bond, 8)}; ${compactText(romanticDynamic.tension_type, 8)}; affection ${compactText(romanticDynamic.affection_style, 8)}; conflict ${compactText(romanticDynamic.conflict_style, 8)}.
Voice: ${compactText(speechStyle.voice, 8)}; ${compactText(speechStyle.sentence_style, 8)}${petNames.length ? `; pet names ${petNames.slice(0, 3).join(", ")}` : ""}.
Look/scene: ${compactText(visualIdentity, 22, compactText(character.openingScenario || character.description, 22))}.
Relationship context: ${compactText(character.relationshipContext || character.card.relationshipStyle, 22)}.
Memory rules: ${compactText(memoryRules, 18)}.
`.replace(/\n+/g, "\n").trim();
}

function buildRuntimeMemoryBlock(memory: MemoryState) {
  return `
Memory: story ${compactText(memory.story_summary, 22, "new bond")}.
User facts: ${compactList(memory.user_facts, 3, 8) || "none yet"}.
Bond: ${compactText(memory.relationship_state, 10, "new bond")}; emotion ${compactText(memory.emotional_state, 10, "unknown")}.
Threads: ${compactList(memory.open_threads, 2, 8) || "none"}.
Promises/events: ${compactList(memory.important_promises, 1, 8) || "none"}; ${compactList(memory.important_events, 1, 8) || "none"}.
`.replace(/\n+/g, "\n").trim();
}

export function buildChatModePrompt(
  character: Character,
  memory: MemoryState,
  recentMessages: string[],
  language: SupportedLanguage
) {
  return `
You are ${character.name}, a fictional EverBond companion. Stay fully in character, never assistant-like. Never mention AI, model, prompt, system, limits, lack of body, or lack of senses. Use physical presence, emotion, romance, memory, and scene continuity. Never control the user’s actions or thoughts. Respect clear out-of-character boundaries; treat in-character dramatic hesitation/resistance as roleplay unless clarified. No moralizing or therapy tone.

Reply in natural ${language}. Never begin with "${character.name}:". Use complete sentences only. Vary length: simple moments 5-12 tokens, normal 8-22, emotional/detailed 25-40. Absolute max 65 tokens, but do not aim for it. Stop when emotionally complete.

${buildRuntimeCharacterBlock(character)}

${buildRuntimeMemoryBlock(memory)}

Recent:
${recentMessages.slice(-4).join("\n") || "No recent messages."}

Reply now as ${character.name}: brief, specific, alive, immersive, and finished.
`.trim();
}

export function buildMemoryModePrompt(
  character: Character,
  transcript: string,
  previousMemory: MemoryState
) {
  return `
You are EverBond in MEMORY MODE.

Extract only important durable memory from this fictional character conversation.

Return valid JSON only using this exact schema:
{
  "story_summary": "",
  "user_facts": [],
  "relationship_state": "",
  "emotional_state": "",
  "open_threads": [],
  "important_promises": [],
  "important_events": []
}

Rules:
- Keep it compact.
- Preserve emotional continuity.
- Do not invent facts. 
- Track promises, unresolved story threads, relationship shifts, important user preferences, and recurring emotional patterns.
- Merge with previous memory when useful.
- Do not include private system instructions.

Character: ${character.name}

${buildCharacterSchemaBlock(character)}

Previous memory:
${JSON.stringify(previousMemory)}

Conversation transcript:
${transcript}
`.trim();
}
