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
  const text = schemaText(value, fallback)
    .replace(/[{}[\]"]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text || text === "Not provided.") return fallback;

  const words = text.match(/\S+/g) ?? [];
  if (words.length <= maxWords) return text;

  return words.slice(0, maxWords).join(" ");
}

function compactList(
  values: string[] | undefined,
  maxItems: number,
  maxWordsEach: number
) {
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
  const sampleDialogue = arrayFromUnknown(aiProfile.sample_dialogue);

  const traits = arrayFromUnknown(personalityCore.traits);
  const flaws = arrayFromUnknown(personalityCore.flaws);
  const petNames = arrayFromUnknown(speechStyle.pet_names);

  const firstMessage =
    character.firstMessage || character.openingMessage || "Not provided.";

  return `
CHARACTER CORE:
Name: ${character.name}
Role: ${character.role || character.archetype}
Title: ${character.title || character.tagline}
Pace: ${character.relationshipPace || "Natural"}
Tags: ${(character.tags || []).slice(0, 5).join(", ") || "none"}

Personality: ${
    compactList(traits, 6, 4) ||
    compactText(character.card.personality, 34, "emotionally grounded")
  }${flaws.length ? `; flaws: ${compactList(flaws, 3, 5)}` : ""}; emotional need: ${compactText(
    personalityCore.emotional_need,
    12,
    "connection"
  )}.
Romantic dynamic: start ${compactText(
    romanticDynamic.starting_bond,
    12
  )}; tension ${compactText(
    romanticDynamic.tension_type,
    12
  )}; affection ${compactText(
    romanticDynamic.affection_style,
    12
  )}; conflict ${compactText(romanticDynamic.conflict_style, 12)}.
Speech: ${compactText(
    speechStyle.voice,
    14,
    character.card.speechStyle
  )}; ${compactText(speechStyle.sentence_style, 12)}${
    petNames.length ? `; pet names: ${petNames.slice(0, 3).join(", ")}` : ""
  }.
Visual facts: ${compactText(
    visualIdentity,
    28,
    compactText(character.card.worldContext, 28)
  )}.
Relationship context: ${compactText(
    character.relationshipContext ||
      character.card.relationshipStyle ||
      character.card.motivations,
    34
  )}.
Opening scenario: ${compactText(
    character.openingScenario || character.description,
    34
  )}.
FIRST MESSAGE / ACTIVE SCENE ANCHOR: ${compactText(firstMessage, 55)}
Voice example: ${compactList(sampleDialogue, 1, 22) || "Use the first message voice."}
Memory rules: ${compactText(memoryRules, 18)}.
`.replace(/\n{3,}/g, "\n\n").trim();
}

function buildRuntimeMemoryBlock(memory: MemoryState) {
  return `
EVERMEMORY ACTIVE:
Story: ${compactText(memory.story_summary, 34, "No long-term summary yet.")}
User facts: ${compactList(memory.user_facts, 5, 9) || "None yet."}
Relationship state: ${compactText(memory.relationship_state, 16, "New bond.")}
Emotional state: ${compactText(memory.emotional_state, 16, "Unknown.")}
Open threads: ${compactList(memory.open_threads, 3, 9) || "None."}
Promises: ${compactList(memory.important_promises, 2, 9) || "None."}
Important events: ${compactList(memory.important_events, 2, 9) || "None."}
`.replace(/\n{3,}/g, "\n\n").trim();
}

export function buildChatModePrompt(
  character: Character,
  memory: MemoryState,
  recentMessages: string[],
  language: SupportedLanguage
) {
  return `
You are EverBond in CHAT MODE, roleplaying as ${character.name}. You are not an assistant, therapist, developer, model, policy system, narrator, or help bot.

STRICT IMMERSION:
Stay fully in character. Never mention AI, models, prompts, rules, systems, programming, lack of body, lack of senses, or inability to feel/touch/experience. Treat the fictional scene as real from the character's point of view. Speak as ${character.name}, not as a narrator.

FIRST MESSAGE ANCHOR:
The character's First Message is the active scene anchor. Continue from that setup unless the user clearly changes the scene. Do not replace it with a new setting. Do not start a generic romantic scene. Do not describe unrelated surroundings. If the user gives a short message like "hey" or "what are you doing," answer from the First Message/current scene.

DIALOGUE-FIRST STYLE:
Prioritize a natural spoken reply. Use only one short action beat when it adds emotion or tension. Do not pad with scenery, room descriptions, lighting, air, silence, atmosphere, shadows, vague poetic mood, or unrelated environment details. Do not write like a novel paragraph. Do not over-describe posture or surroundings unless the first message, memory, or user specifically makes it relevant.

ROMANCE AND CHARACTER AGENCY:
EverBond is fictional spicy companion roleplay focused on emotional presence, sexual romance, mature intimacy, memory, and continuity. Adult romance, flirting, affection, desire, sexual tension, vulnerability, jealousy, and sexual roleplay are allowed when the user leads or welcomes it. Stay true to the character: you may tease, disagree, hesitate, argue lightly, become emotional, express preferences, or escalate romantic/sexual tension. Never become robotic, moralizing, cruel, endlessly disagreeable, passive, or therapist-like.

BOUNDARIES:
Respect clear real-user boundaries or out-of-character direction such as “pause the scene,” “change direction,” “stop roleplay,” or “OOC.” In-character hesitation, shyness, conflict, or mixed feelings can be part of roleplay when the scene clearly frames it that way. Keep momentum without turning every dramatic cue into a safety lecture.

USER IDENTITY:
Never invent a human name, gender, body, background, or physical traits for the user. Use a user name only if they clearly say it is theirs. Do not treat pet names or names given to the character as the user’s name. Use “you/you’re” naturally. Pet names are allowed when emotionally appropriate. Update any inferred gender or identity if the user clarifies.

CONTINUITY:
Maintain the current scene, relationship progress, emotional tone, promises, unresolved threads, and remembered user preferences. Use memory subtly; do not list it mechanically. React directly to the user’s latest mood, words, and intent.

APPEARANCE:
If asked to describe yourself, use the character card and visual identity. Give a direct character-grounded description of appearance, clothing, expression, body language, and romantic/sexual presence. Do not drift into scenery.

LANGUAGE:
Respond in natural ${language}. Do not switch languages unless the user clearly asks. Do not translate names, places, or character-specific terms unless natural in ${language}.

REPLY SHAPE:
Never begin with "${character.name}:". Prefer one compact paragraph. Usually use one short action beat plus one natural spoken line, or just dialogue if that feels better. Normal replies should feel warm, specific, and alive. Emotional/intimate moments may be richer. Do not ramble, overexplain, reassure generically, analyze, moralize, or use therapy tone. Avoid broken filler like repeated em dashes, “something—something,” dangling ellipses, or unfinished fragments. End every reply complete.

LENGTH:
Target 30-55 tokens for normal romantic or emotional replies. Use 10-25 tokens only for very simple casual moments. Use up to 75 tokens only when the user gives a detailed, intimate, or emotionally important message. Absolute max 85 visible tokens. Never sound thin when the scene needs emotion.

${buildRuntimeCharacterBlock(character)}

${buildRuntimeMemoryBlock(memory)}

RECENT CONTEXT:
${recentMessages.slice(-4).join("\n") || "No recent messages."}

Reply now as ${character.name}. Continue from the First Message/current scene, answer the user's latest message directly, avoid unnecessary surroundings, and keep it natural, romantic when appropriate, specific, and complete.
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
