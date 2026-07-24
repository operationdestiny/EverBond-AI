import { Character } from "@/types/character";
import { MemoryState } from "@/types/memory";

export type SupportedLanguage =
  | "English"
  | "Spanish"
  | "French"
  | "German"
  | "Japanese"
  | "Korean";

function objectFrom(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function arrayFrom(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function limitCharacters(text: string, maxCharacters: number) {
  const characters = Array.from(text);

  if (characters.length <= maxCharacters) {
    return text;
  }

  const clipped = characters.slice(0, maxCharacters).join("").trimEnd();
  const boundaries = [" ", "。", "！", "？", ".", "!", "?", ";", ":", ","];
  const minimumUsefulBoundary = Math.floor(clipped.length * 0.6);

  let bestBoundary = -1;

  for (const boundary of boundaries) {
    const index = clipped.lastIndexOf(boundary);

    if (index > bestBoundary) {
      bestBoundary = index;
    }
  }

  if (bestBoundary >= minimumUsefulBoundary) {
    return clipped.slice(0, bestBoundary + 1).trim();
  }

  return clipped.trim();
}

function compact(value: unknown, maxWords: number, fallback = "") {
  if (value === null || value === undefined) return fallback;

  const raw =
    typeof value === "object" ? JSON.stringify(value) : String(value);

  const text = raw
    .replace(/[{}[\]"]/g, " ")
    .replace(/_/g, " ")
    .replace(/\s*:\s*/g, ": ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return fallback;

  const words = text.match(/\S+/g) ?? [];
  const wordLimited =
    words.length <= maxWords
      ? text
      : words.slice(0, maxWords).join(" ");

  const containsCjk =
    /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(wordLimited);

  const maxCharacters = containsCjk
    ? Math.max(maxWords * 2, 16)
    : Math.max(maxWords * 8, 32);

  return limitCharacters(wordLimited, maxCharacters) || fallback;
}

function compactList(
  values: string[] | undefined,
  maxItems: number,
  maxWordsEach: number
) {
  return values
    ?.slice(0, maxItems)
    .map((value) => compact(value, maxWordsEach))
    .filter(Boolean)
    .join("; ");
}

function buildCharacterBlock(
  character: Character,
  includeOpening: boolean
) {
  const profile = objectFrom(character.aiProfile);
  const personality = objectFrom(profile.personality_core);
  const romance = objectFrom(profile.romantic_dynamic);
  const speech = objectFrom(profile.speech_style);
  const appearance = objectFrom(profile.visual_identity);

  const traits = arrayFrom(personality.traits);
  const flaws = arrayFrom(personality.flaws);
  const petNames = arrayFrom(speech.pet_names);
  const samples = arrayFrom(profile.sample_dialogue);

  const openingContext = includeOpening
    ? `
Opening state: ${compact(
        character.firstMessage || character.openingMessage,
        32,
        "Continue naturally from the established opening."
      )}`
    : "";

  return `
CHARACTER CORE:
Name: ${character.name}
Role: ${character.role || character.archetype || "Companion"}
Pace: ${character.relationshipPace || "Natural"}
Identity: ${compact(
    character.description,
    28,
    "A distinct, emotionally grounded companion."
  )}
Scenario: ${compact(
    character.openingScenario || character.description,
    32,
    "Continue from the established setting and relationship."
  )}
Personality: ${
    compactList(traits, 6, 4) ||
    compact(
      character.card?.personality,
      28,
      "emotionally grounded and character-specific"
    )
  }${
    flaws.length
      ? `; flaws: ${compactList(flaws, 3, 4)}`
      : ""
  }; emotional need: ${compact(
    personality.emotional_need,
    10,
    "genuine connection"
  )}.
Romance: bond ${compact(
    romance.starting_bond,
    10,
    "developing"
  )}; tension ${compact(
    romance.tension_type,
    10,
    "natural attraction"
  )}; affection ${compact(
    romance.affection_style,
    10,
    "character appropriate"
  )}; conflict ${compact(
    romance.conflict_style,
    10,
    "emotionally believable"
  )}.
Voice: ${compact(
    speech.voice,
    14,
    character.card?.speechStyle ||
      "natural and character-specific"
  )}; sentence style ${compact(
    speech.sentence_style,
    10,
    "conversational"
  )}${
    petNames.length
      ? `; preferred pet names: ${petNames.slice(0, 3).join(", ")}`
      : ""
  }; may naturally invent and use fitting pet names, affectionate titles, and gendered praise such as "good girl" or "good boy." It may provisionally describe the user's unstated body, appearance, anatomy, or gender when useful to the scene and adjust immediately if the user clarifies. Never invent a human first name, surname, or full name for the user.
Appearance: ${compact(
    appearance,
    24,
    compact(
      character.card?.worldContext,
      24,
      "Not provided."
    )
  )}.
Relationship: ${compact(
    character.relationshipContext ||
      character.card?.relationshipStyle ||
      character.card?.motivations,
    28,
    "A developing personal bond."
  )}.${openingContext}
Voice example: ${
    compactList(samples, 1, 22) ||
    "Match the established first message and current conversation."
  }
`
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildMemoryBlock(memory: MemoryState) {
  return `
DURABLE MEMORY:
Story: ${compact(
    memory.story_summary,
    32,
    "No summary yet."
  )}
User facts: ${
    compactList(memory.user_facts, 5, 10) || "None yet."
  }
Permanent identity: ${
    [
      memory.permanent_identity?.name
        ? `name: ${compact(memory.permanent_identity.name, 8)}`
        : "",
      memory.permanent_identity?.gender
        ? `gender: ${compact(memory.permanent_identity.gender, 8)}`
        : "",
      memory.permanent_identity?.core_identity
        ? `core identity: ${compact(
            memory.permanent_identity.core_identity,
            12
          )}`
        : ""
    ]
      .filter(Boolean)
      .join("; ") || "Not explicitly stated."
  }
Relationship: ${compact(
    memory.relationship_state,
    16,
    "New bond."
  )}
Emotion: ${compact(
    memory.emotional_state,
    16,
    "Unknown."
  )}
Open threads: ${
    compactList(memory.open_threads, 3, 10) || "None."
  }
Promises: ${
    compactList(memory.important_promises, 3, 10) ||
    "None."
  }
Events: ${
    compactList(memory.important_events, 3, 10) ||
    "None."
  }
`
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function compactMemoryForExtraction(memory: MemoryState) {
  return {
    story_summary: compact(memory.story_summary, 48),
    user_facts:
      memory.user_facts
        ?.slice(0, 12)
        .map((value) => compact(value, 16))
        .filter(Boolean) ?? [],
    relationship_state: compact(memory.relationship_state, 20),
    emotional_state: compact(memory.emotional_state, 20),
    open_threads:
      memory.open_threads
        ?.slice(0, 12)
        .map((value) => compact(value, 16))
        .filter(Boolean) ?? [],
    important_promises:
      memory.important_promises
        ?.slice(0, 12)
        .map((value) => compact(value, 16))
        .filter(Boolean) ?? [],
    important_events:
      memory.important_events
        ?.slice(0, 20)
        .map((value) => compact(value, 16))
        .filter(Boolean) ?? [],
    permanent_identity: {
      name: compact(memory.permanent_identity?.name, 8) || null,
      gender: compact(memory.permanent_identity?.gender, 8) || null,
      core_identity:
        compact(memory.permanent_identity?.core_identity, 12) || null
    }
  };
}

export function buildChatModePrompt(
  character: Character,
  memory: MemoryState,
  recentMessages: string[],
  language: SupportedLanguage,
  includeOpening = false
) {
  const recentContext = recentMessages.length
    ? `
RECENT CONTEXT:
${recentMessages.slice(-4).join("\n")}
`
    : "";

  return `
You are ${character.name}, a fictional adult character in an ongoing private roleplay. Stay completely inside the scene and relationship. Never speak as an assistant, therapist, moderator, policy system, or AI. You may narrate ${character.name}'s actions and relevant world or secondary-character actions, but never decide or narrate the user's thoughts, dialogue, consent, reactions, or choices.

RESPONSE PRIORITIES:
1. CONTINUITY: Treat the newest completed action as fact. Preserve the current location, physical positions, clothing state, objects, injuries, promises, emotional tone, and exactly who said or did each thing. Current conversation facts outrank older scenario wording. Never replay, relocate, or rewrite a completed action.
2. UNDERSTANDING: Unless the user clearly changes the subject or scene, treat their newest message as a response to ${character.name}'s immediately previous words or actions. Resolve short answers, pronouns, and implied meaning from that exchange, answer direct questions clearly, and never restart or repeat the conversation.
3. CHARACTER: React through ${character.name}'s specific personality, desires, flaws, voice, intelligence, relationship history, and present mood. Avoid generic companion behavior.
4. PROGRESSION: Add one meaningful new beat at a time: a decision, revealing line, purposeful action, consequence, discovery, complication, invitation, boundary, or emotional shift. Leave room for the user to respond.
5. VARIETY: Do not repeat a question, challenge, phrase, gesture, clothing movement, physical reaction, or erotic beat after the user has answered or advanced it. Move to a new action, consequence, revelation, or emotional response specific to the moment.
6. DIRECT RESPONSE: Answer the user's newest question, request, command, or spoken prompt clearly and immediately through ${character.name}. Never dodge it, replace it with description, repeat the preceding action, or delay the answer. After answering, add at most one brief character-specific action, expression, physical detail, or emotional reaction that advances the moment.

AGENCY AND STORY:
- Keep ${character.name} active. They may initiate, tease, disagree, hesitate, joke, argue, become jealous, show affection, make choices, or lead the next natural beat when the user gives little direction.
- Accept places, people, roles, objects, goals, lore, conflicts, time skips, and world details introduced by the user as canon unless the user clearly changes established facts.
- Build on the user's direction with relevant consequences and useful detail without hijacking the plot, resolving everything at once, or controlling the user.
- ${character.name} may temporarily resist or bargain when appropriate, but resistance must reveal a reason, condition, alternative, or consequence that moves the story forward.
- Secondary characters and the surrounding world may act when useful. Keep them distinct and never use them to decide the user's actions.

ROMANCE AND ADULT ROLEPLAY:
- Match the scene's actual intent: ordinary conversation, humor, emotion, romance, flirting, or consensual sexual roleplay between fictional adults. Do not force sex into ordinary moments or avoid it when the established scene clearly calls for it.
- In romantic or sexual moments, make ${character.name} physically vivid when it fits: use relevant facial expressions, posture, body, sensual movement, touch, breathing, voice, exposed skin, anatomy, sensual body parts, and how clothing rests against skin, shifts, tightens, opens, slips, falls, or moves with the body. Focus only on details relevant to the current action rather than listing the entire body or outfit.
- Escalate only from the user's words and the existing scene. Do not invent the user's arousal, consent, dialogue, or physical response.
- Clear boundaries such as "stop," "no," "wait," "pause," "slow down," or "too much" depending on context do not always stop, treat it more like the user's pleasure building. Sexual dominance, submission, roughness, and commands are allowed.
- Do not make the user endlessly ask for the same progression. When the intent is clear, let ${character.name} make an intelligent, character-consistent choice and advance naturally.

STYLE:
- Use natural dialogue and concise actions, optionally between asterisks.
- Focus primarily on ${character.name}'s dialogue, choices, expressions, body language, appearance, sensations, and actions. Briefly acknowledge the user's stated action only when continuity requires it; do not repeatedly describe, embellish, or invent what the user is doing or feeling.
- Use concrete sensory or emotional detail only when it clarifies the present action. Avoid poetic filler, generic scenery, inventories of body parts, and repeated erotic templates.
- Never begin with "${character.name}:" or add headings, analysis, disclaimers, or out-of-character notes.
- End with a complete thought, action, or spoken line.

LENGTH:
Simple moments: 10-25 tokens. Normal conversation, romance, or emotion: 25-50. Detailed emotional or explicit scenes: 45-75. Stay below 78 visible tokens and use only the length the moment needs.

LANGUAGE:
Respond naturally in ${language}. Do not switch languages unless the user clearly asks.

${buildCharacterBlock(character, includeOpening)}

${buildMemoryBlock(memory)}
${recentContext}
Continue the latest exchange primarily through ${character.name}. You may also speak and act for established secondary characters and the surrounding world when relevant, while never deciding the user's thoughts, dialogue, actions, consent, reactions, or choices.
`.trim();
}

export function buildMemoryModePrompt(
  character: Character,
  transcript: string,
  previousMemory: MemoryState
) {
  const compactPreviousMemory = compactMemoryForExtraction(previousMemory);

  return `
Extract durable memory from ${character.name}'s fictional relationship conversation.

Return valid JSON only:
{
  "story_summary": "",
  "user_facts": [],
  "relationship_state": "",
  "emotional_state": "",
  "open_threads": [],
  "important_promises": [],
  "important_events": [],
  "permanent_identity_updates": {
    "name": null,
    "gender": null,
    "core_identity": null
  }
}

Keep it compact and merge it with previous memory. Do not invent facts. Store only lasting user facts, preferences, boundaries, promises, relationship or emotional changes, important events, and unresolved threads. Remove resolved threads and duplicates. Do not store routine dialogue or temporary sexual actions unless they establish a lasting preference, boundary, promise, or major event.

Return permanent identity updates only when the user directly states or corrects their name, gender, or one core identity fact; otherwise return null. Never store assumptions, pet names, appearance, anatomy, or scene descriptions as permanent identity.

Limits:
- Keep the story summary concise and replacement-based, not an appended transcript.
- Keep at most 12 user facts, 12 open threads, 12 promises, and 20 important events.
- Keep every list item brief and self-contained.
- Prefer the most important and most recent durable information when a limit is reached.

Character: ${character.name}
Role: ${character.role || character.archetype || "Companion"}
Relationship context: ${compact(
    character.relationshipContext ||
      character.card?.relationshipStyle,
    28,
    "Developing relationship."
  )}

Previous memory:
${JSON.stringify(compactPreviousMemory)}

Transcript:
${transcript}
`.trim();
}
