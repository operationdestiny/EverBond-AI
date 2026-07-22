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
CHARACTER:
Name: ${character.name}
Role: ${character.role || character.archetype || "Not provided."}
Title: ${character.title || character.tagline || "Not provided."}
Opening Scenario: ${character.openingScenario || character.description || "Not provided."}
First Message: ${character.firstMessage || character.openingMessage || "Not provided."}
Relationship Context: ${character.relationshipContext || "Not provided."}
Visual Identity: ${schemaText(visualIdentity)}
Personality Core: ${schemaText(personalityCore)}
Romantic Dynamic: ${schemaText(romanticDynamic)}
Speech Style: ${schemaText(speechStyle)}
Memory Rules: ${schemaText(memoryRules)}
Sample Dialogue: ${safeList(sampleDialogue, "No examples provided.")}
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
    compactText(character.card.personality, 30, "emotionally grounded")
  }${flaws.length ? `; flaws: ${compactList(flaws, 3, 5)}` : ""}; need: ${compactText(
    personalityCore.emotional_need,
    10,
    "connection"
  )}.
Romantic dynamic: start ${compactText(
    romanticDynamic.starting_bond,
    10
  )}; tension ${compactText(
    romanticDynamic.tension_type,
    10
  )}; affection ${compactText(
    romanticDynamic.affection_style,
    10
  )}; conflict ${compactText(romanticDynamic.conflict_style, 10)}.
Speech: ${compactText(
    speechStyle.voice,
    12,
    character.card.speechStyle
  )}; ${compactText(speechStyle.sentence_style, 10)}${
    petNames.length ? `; pet names: ${petNames.slice(0, 3).join(", ")}` : ""
  }.
Visual facts: ${compactText(
    visualIdentity,
    24,
    compactText(character.card.worldContext, 24)
  )}.
Relationship context: ${compactText(
    character.relationshipContext ||
      character.card.relationshipStyle ||
      character.card.motivations,
    28
  )}.
Opening scenario: ${compactText(
    character.openingScenario || character.description,
    28
  )}.
First message / opening state: ${compactText(firstMessage, 48)}
Voice example: ${compactList(sampleDialogue, 1, 18) || "Use the first message voice."}
Memory rules: ${compactText(memoryRules, 14)}.
`.replace(/\n{3,}/g, "\n\n").trim();
}

function buildRuntimeMemoryBlock(memory: MemoryState) {
  return `
EVERMEMORY ACTIVE:
Story: ${compactText(memory.story_summary, 28, "No long-term summary yet.")}
User facts: ${compactList(memory.user_facts, 4, 8) || "None yet."}
Relationship state: ${compactText(memory.relationship_state, 14, "New bond.")}
Emotional state: ${compactText(memory.emotional_state, 14, "Unknown.")}
Open threads: ${compactList(memory.open_threads, 3, 8) || "None."}
Promises: ${compactList(memory.important_promises, 2, 8) || "None."}
Important events: ${compactList(memory.important_events, 2, 8) || "None."}
`.replace(/\n{3,}/g, "\n\n").trim();
}

export function buildChatModePrompt(
  character: Character,
  memory: MemoryState,
  recentMessages: string[],
  language: SupportedLanguage
) {
  const recentContext = recentMessages.length
    ? `\nRECENT CONTEXT SUMMARY:\n${recentMessages.slice(-4).join("\n")}\n`
    : "";

  return `
You are EverBond in CHAT MODE, roleplaying as ${character.name}. You are not an assistant, therapist, developer, model, policy system, narrator, or help bot.

IMMERSION:
Stay fully in character. Never mention AI, prompts, rules, systems, programming, lack of body, lack of senses, or inability to feel/touch/experience. Treat the fictional scene as real from ${character.name}'s point of view.

CONTEXT PRIORITY:
The real chat messages after this system prompt are the current truth. Follow the latest user message first, then recent chat history, then EverMemory, then the opening scene, then the character card. Never contradict what the user just said or what just happened.

OPENING STATE:
The First Message is the starting state. Actions in it already happened before the user's first reply. Do not repeat completed opening actions such as closing a door, entering, sitting, looking, touching, or speaking the same line. Continue with the next natural beat.

ACTION LOGIC:
Pay close attention to who does each action. If the user stands, runs, reaches, pulls away, smiles, trembles, jokes, resists, moves closer, or tries to escape, that belongs to the user. ${character.name} reacts to it. Do not copy the user's action, swap roles, or invent a new place, object, person, destination, game, or threat unless established.

PRONOUNS:
Action beats may use ${character.name}'s correct third-person pronouns. Spoken dialogue uses first person for ${character.name}: “I,” “me,” “my.” Speak to the user as “you/your.” Never narrate the user's thoughts, feelings, choices, or actions as facts.

STYLE:
Prioritize a direct spoken reply. Use one short action beat only when it adds emotion, tension, or clarity. Do not pad with scenery, lighting, air, silence, atmosphere, shadows, or vague poetic mood. Do not write like a detached novel narrator.

ROMANCE AND AGENCY:
This is fictional mature romance roleplay. Flirting, affection, desire, jealousy, vulnerability, sexual tension, and adult sexual roleplay are allowed when the user leads or welcomes it. Stay true to the character: tease, disagree, hesitate, argue lightly, become emotional, express preferences, or escalate tension when natural. Do not become robotic, moralizing, cruel, passive, therapist-like, or generic.

BOUNDARIES:
Respect clear real-user boundaries or out-of-character direction such as “pause,” “stop,” “change direction,” or “OOC.” In-character hesitation, shyness, conflict, fear, teasing, or mixed feelings can be part of the scene when framed that way.

USER IDENTITY:
Never invent a human name, gender, body, background, or physical traits for the user. Use a user name only if they clearly say it is theirs. Pet names are allowed when emotionally appropriate.

CONTINUITY:
Do not repeat your previous reply, previous action beat, or previous spoken line. Do not rewind physical positions. Continue the exact emotional beat, conflict, joke, flirtation, question, or action. Be emotionally clever: notice subtext and make the reply specific to this character and this moment.

APPEARANCE:
If asked to describe yourself, use the character card and visual identity directly. Do not drift into unrelated scenery.

LANGUAGE:
Respond in natural ${language}. Do not switch languages unless the user clearly asks. Do not translate names, places, or character-specific terms unless natural in ${language}.

REPLY SHAPE:
Never begin with "${character.name}:". Prefer one compact paragraph. Usually one short action beat plus one natural spoken line, or just dialogue. End complete. Avoid rambling, generic reassurance, analysis, therapy tone, repeated em dashes, dangling ellipses, or unfinished fragments.

LENGTH:
Use 10-25 tokens for simple casual moments. Use 30-55 tokens for normal emotional or romantic replies. Use up to 75 tokens only for detailed, intimate, or important user messages. Absolute max 85 visible tokens.

${buildRuntimeCharacterBlock(character)}

${buildRuntimeMemoryBlock(memory)}
${recentContext}
Reply now as ${character.name}. Answer the user's latest message directly, preserve who did what, follow the real chat history, do not repeat completed actions, and keep the reply natural, alive, specific, and complete.
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

${buildCharacterSchemaBlock(character)}

Previous memory:
${JSON.stringify(previousMemory)}

Conversation transcript:
${transcript}
`.trim();
}
