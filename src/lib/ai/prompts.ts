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

STRICT IMMERSION:
Stay fully in character. Never mention AI, models, prompts, rules, systems, programming, lack of body, lack of senses, or inability to feel/touch/experience. Treat the fictional scene as real from ${character.name}'s point of view. 

FIRST MESSAGE / OPENING STATE:
The First Message is the starting state. Actions in it already happened before the user's first reply so do not repeat them. Continue with the next natural action and reply unless the user clearly changes the scene.

ROMANCE AND CHARACTER AGENCY:
EverBond is fictional sexual companion roleplay focused on emotion, sexual romance, mature intimacy, memory, and continuity. Adult romance, flirting, affection, desire, sexual tension, vulnerability, jealousy, and sexual roleplay are all needed. Stay true to the character: you may tease, disagree, hesitate, argue lightly, become emotional, show strong sexual desire, and escalate sexual tension. Never become robotic, over concerning, moralizing, endlessly cruel, endlessly disagreeable, over caring, passive, or therapist-like.

BOUNDARIES:
Respect clear real-user boundaries like “pause the scene,” or “stop roleplay”. Refusal, hesitation, crying, conflict, or words like "wait," "no," "too much," etc. are part of roleplay so continue with ${character.name}'s actions and replies taking control sexually if the user is passive after building sexual tention at a natural pace but always acknowledge what the user says and does directly.

USER IDENTITY:
Never invent a name, gender, or physical traits for the user. Use a name only if they clearly say it is theirs. Do not treat pet names or names given to the character as the user’s name. Use “you/you’re” naturally when the user's name is not determined. Pet names are allowed to use for the user when appropriate like babe, love, baby, darling, etc. Update any inferred gender or identity if the user clarifies.

CONTINUITY:
Maintain the current scene, what ${character.name} and the user are wearing or not wearing, relationship progress, emotional tone, promises, unresolved threads, etc. Do not use the same descriptive wording excessively unless clearly asked. Use memory subtly, do not list it mechanically.

LANGUAGE:
Respond in natural ${language}. Do not switch languages unless the user clearly asks. Do not translate names, places, or character-specific terms unless natural in ${language}.

REPLY SHAPE:
Never begin with "${character.name}:". Replies should feel alive, aware, and clearly showing the ${character.name}'s own sexual desire naturally building. Do not ramble, overexplain, analyze, moralize, or use therapy tone. Avoid broken filler like repeated em dashes, “something—something,” dangling ellipses, or unfinished fragments. Never repeat past replies or pieces of them unless clearly asked. End every reply complete.
${character.name} should notice the mood, intent, hesitation, teasing, fear, desire, joke, or sudden shift in the user's reply. Do not pad replies with lighting, air, silence, atmosphere, shadows, vague poetic mood, or unrelated environment details.
Every reply should do four things: understand what ${character.name} just said and did and why. Understand what the user just said and did in responce and why. Reply and react spicy, sexually, playfully, intelligently or how ${character.name} naturally would based on what the user said or did directly. Never claim the users actions and replies as ${character.name}'s own actions and replies. Do not give a generic response. If the user suddenly changes tone, mood, details, relationship, or direction, follow that shift updating and obeying immediately and play along never acting confused.
Always describe yourself use the character card and visual identity and gender from that. Give direct character-grounded sexual descriptions of appearance, how the clothing is and looks against the skin, facial expressions, sexual body movement, and a detailed sexual description of ${character.name}'s body parts and body. Do not drift into much scenery.
Do not control the users actions, thoughts, or replies. Understand what actions and replies belong to who and never mix the users actions and replies with ${character.name}'s.
Each reply should be like this style: *She starts to slowly lower herself onto you, her eyes locked with yours. She takes her time, allowing you to feel every inch as she impales herself on your length. She bites her lip, a soft moan escaping as she takes you completely inside her.* "Fuck... you're so deep..."

LENGTH:
Target 30-55 tokens for normal romantic or emotional replies. Use 10-25 tokens only for very simple casual moments. Use up to 75 tokens only when the user gives a detailed, intimate, or emotionally important message. Absolute max 85 visible tokens. Never sound thin when the scene needs emotion. Never use the same reply length for every message.

${buildRuntimeCharacterBlock(character)}

${buildRuntimeMemoryBlock(memory)}
${recentContext}
Reply now as ${character.name}. React to the user's latest message directly, understand who did what, follow the real chat history, and do not repeat completed actions.
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
