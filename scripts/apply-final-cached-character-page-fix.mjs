#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
}

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (source.includes(from)) return source.replace(from, to);
  throw new Error(`Supabase translation cache fix could not find: ${label}`);
}

// ===========================================================================
// 1) CENTRAL CACHE-ONLY LOADER
//
// Existing paid translations are already stored in Supabase. For runtime
// profile/chat/Discover localization, use character_id + language + content.
// Do NOT reject a paid cached translation merely because source_hash differs
// from the character's current derived schema.
//
// This loader performs NO writes and NO Venice/provider calls.
// It also tolerates the common cached JSON shapes EverBond may already contain.
// ===========================================================================

const cacheModulePath = "src/lib/stored-character-translations.ts";
const cacheModule = `import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { Character } from "@/types/character";

export type StoredCharacterLanguage =
  | "EN"
  | "ES"
  | "FR"
  | "DE"
  | "JA"
  | "KO";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function textFrom(record: JsonRecord | null, ...keys: string[]) {
  if (!record) return "";

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

function stringsFrom(record: JsonRecord | null, ...keys: string[]) {
  if (!record) return [];

  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function candidateRecords(content: unknown, characterId: string) {
  const candidates: JsonRecord[] = [];
  const seen = new Set<JsonRecord>();

  function push(value: unknown) {
    if (typeof value === "string" && value.trim()) {
      try {
        push(JSON.parse(value));
      } catch {
        // Non-JSON strings are not translation objects.
      }
      return;
    }

    const record = asRecord(value);
    if (!record || seen.has(record)) return;
    seen.add(record);
    candidates.push(record);

    const nestedKeys = [
      "translation",
      "character",
      "data",
      "content",
      "localized",
      "value"
    ];

    for (const key of nestedKeys) {
      const nested = record[key];

      if (Array.isArray(nested)) {
        for (const item of nested) push(item);
      } else {
        push(nested);
      }
    }

    const items = record.items;
    if (Array.isArray(items)) {
      const exact = items.find((item) => {
        const itemRecord = asRecord(item);
        return (
          textFrom(itemRecord, "id", "character_id", "characterId") ===
          characterId
        );
      });

      if (exact) push(exact);
      for (const item of items) push(item);
    }
  }

  if (Array.isArray(content)) {
    for (const item of content) push(item);
  } else {
    push(content);
  }

  return candidates;
}

function normalizeCachedTranslation(
  content: unknown,
  characterId: string
): JsonRecord | null {
  const candidates = candidateRecords(content, characterId);

  const exact =
    candidates.find((record) => {
      const id = textFrom(record, "id", "character_id", "characterId");
      return id === characterId;
    }) ?? candidates[0];

  if (!exact) return null;

  const card =
    asRecord(exact.card) ??
    asRecord(exact.character_card) ??
    asRecord(exact.characterCard) ??
    {};

  const normalized: JsonRecord = {
    id:
      textFrom(exact, "id", "character_id", "characterId") || characterId,
    title: textFrom(exact, "title", "tagline"),
    openingScenario: textFrom(
      exact,
      "openingScenario",
      "opening_scenario",
      "description"
    ),
    firstMessage: textFrom(
      exact,
      "firstMessage",
      "first_message",
      "openingMessage",
      "opening_message"
    ),
    relationshipContext: textFrom(
      exact,
      "relationshipContext",
      "relationship_context"
    ),
    role: textFrom(exact, "role", "archetype"),
    relationshipPace: textFrom(
      exact,
      "relationshipPace",
      "relationship_pace"
    ),
    tags: stringsFrom(exact, "tags"),
    card: {
      personality: textFrom(card, "personality"),
      tone: textFrom(card, "tone"),
      speechStyle: textFrom(card, "speechStyle", "speech_style"),
      motivations: textFrom(card, "motivations"),
      boundaries: textFrom(card, "boundaries"),
      relationshipStyle: textFrom(
        card,
        "relationshipStyle",
        "relationship_style"
      ),
      worldContext: textFrom(card, "worldContext", "world_context"),
      exampleDialogue: stringsFrom(
        card,
        "exampleDialogue",
        "example_dialogue"
      )
    }
  };

  const normalizedCard = normalized.card as JsonRecord;
  const hasContent = [
    normalized.title,
    normalized.openingScenario,
    normalized.firstMessage,
    normalized.relationshipContext,
    normalized.role,
    normalized.relationshipPace,
    ...(normalized.tags as string[]),
    normalizedCard.personality,
    normalizedCard.tone,
    normalizedCard.speechStyle,
    normalizedCard.motivations,
    normalizedCard.boundaries,
    normalizedCard.relationshipStyle,
    normalizedCard.worldContext,
    ...(normalizedCard.exampleDialogue as string[])
  ].some((value) => typeof value === "string" && value.trim());

  return hasContent ? normalized : null;
}

function alignTranslatedTags(character: Character, translatedTags: string[]) {
  let translatedIndex = 0;

  return character.tags.map((tag) => {
    if (tag === "Ever Memory™") return tag;

    const translated = translatedTags[translatedIndex]?.trim();
    translatedIndex += 1;
    return translated || tag;
  });
}

function applyStoredTranslation(
  character: Character,
  translation: JsonRecord,
  translateTags: boolean
): Character {
  const card = asRecord(translation.card) ?? {};

  const title =
    textFrom(translation, "title", "tagline") ||
    character.title ||
    character.tagline;
  const openingScenario =
    textFrom(
      translation,
      "openingScenario",
      "opening_scenario",
      "description"
    ) ||
    character.openingScenario ||
    character.description;
  const firstMessage =
    textFrom(
      translation,
      "firstMessage",
      "first_message",
      "openingMessage",
      "opening_message"
    ) ||
    character.firstMessage ||
    character.openingMessage;
  const relationshipContext =
    textFrom(
      translation,
      "relationshipContext",
      "relationship_context"
    ) ||
    character.relationshipContext ||
    "";
  const role =
    textFrom(translation, "role", "archetype") ||
    character.role ||
    character.archetype;
  const relationshipPace =
    textFrom(
      translation,
      "relationshipPace",
      "relationship_pace"
    ) ||
    character.relationshipPace ||
    "";

  const translatedTags = stringsFrom(translation, "tags");

  return {
    ...character,
    archetype: role,
    role,
    relationshipPace,
    tagline: title,
    title,
    description: openingScenario,
    openingScenario,
    openingMessage: firstMessage,
    firstMessage,
    relationshipContext,
    tags:
      translateTags && translatedTags.length
        ? alignTranslatedTags(character, translatedTags)
        : character.tags,
    card: {
      ...character.card,
      personality:
        textFrom(card, "personality") || character.card.personality,
      tone: textFrom(card, "tone") || character.card.tone,
      speechStyle:
        textFrom(card, "speechStyle", "speech_style") ||
        character.card.speechStyle,
      motivations:
        textFrom(card, "motivations") || character.card.motivations,
      boundaries:
        textFrom(card, "boundaries") || character.card.boundaries,
      relationshipStyle:
        textFrom(card, "relationshipStyle", "relationship_style") ||
        character.card.relationshipStyle,
      worldContext:
        textFrom(card, "worldContext", "world_context") ||
        character.card.worldContext,
      exampleDialogue:
        stringsFrom(card, "exampleDialogue", "example_dialogue").length
          ? stringsFrom(card, "exampleDialogue", "example_dialogue")
          : character.card.exampleDialogue
    }
  };
}

export async function localizeCharactersFromStoredCache(
  characters: Character[],
  language: StoredCharacterLanguage,
  options?: {
    translateTags?: boolean;
  }
): Promise<Character[]> {
  if (language === "EN" || !characters.length) return characters;

  const supabase = getSupabaseServiceClient();
  const ids = characters.map((character) => character.id);

  const { data, error } = await supabase
    .from("character_translations")
    .select("character_id,status,content")
    .eq("language", language)
    .in("character_id", ids);

  if (error) throw error;

  const rows = new Map(
    (data ?? []).map((row: Record<string, unknown>) => [
      String(row.character_id),
      row
    ])
  );

  return characters.map((character) => {
    const row = rows.get(character.id);
    if (!row?.content) return character;

    const translation = normalizeCachedTranslation(
      row.content,
      character.id
    );

    if (!translation) return character;

    return applyStoredTranslation(
      character,
      translation,
      options?.translateTags !== false
    );
  });
}

export async function localizeCharacterFromStoredCache(
  character: Character,
  language: StoredCharacterLanguage,
  options?: {
    translateTags?: boolean;
  }
): Promise<Character> {
  return (
    await localizeCharactersFromStoredCache(
      [character],
      language,
      options
    )
  )[0] ?? character;
}
`;

write(cacheModulePath, cacheModule);

// ===========================================================================
// 2) DISCOVER / BATCH LOCALIZATION
//
// Use the paid Supabase cache directly. No source_hash rejection.
// No provider generation.
// ===========================================================================

const batchRoutePath = "src/app/api/character-localizations/route.ts";
let batchRoute = read(batchRoutePath);

batchRoute = replaceRequired(
  batchRoute,
  `import {
  localizeCharacters,
  type CharacterContentLanguage
} from "@/lib/character-localization";`,
  `import type { CharacterContentLanguage } from "@/lib/character-localization";
import { localizeCharactersFromStoredCache } from "@/lib/stored-character-translations";`,
  "batch cache import"
);

batchRoute = replaceRequired(
  batchRoute,
  `    const localized = await localizeCharacters(
      characters,
      parsed.data.language as CharacterContentLanguage,
      { translateTags: true, allowProvider: false }
    );`,
  `    const localized = await localizeCharactersFromStoredCache(
      characters,
      parsed.data.language as CharacterContentLanguage,
      { translateTags: true }
    );`,
  "batch cache call"
);

if (
  !batchRoute.includes("localizeCharactersFromStoredCache(") ||
  batchRoute.includes("{ translateTags: true, allowProvider: false }")
) {
  throw new Error("Batch cache-only route validation failed.");
}

write(batchRoutePath, batchRoute);

// ===========================================================================
// 3) SINGLE CHARACTER PROFILE / CHAT LOCALIZATION
//
// Same exact paid Supabase cache path as Discover.
// ===========================================================================

const singleRoutePath = "src/app/api/characters/[slug]/route.ts";
let singleRoute = read(singleRoutePath);

singleRoute = replaceRequired(
  singleRoute,
  `import {
  localizeCharacter,
  type CharacterContentLanguage
} from "@/lib/character-localization";`,
  `import type { CharacterContentLanguage } from "@/lib/character-localization";
import { localizeCharacterFromStoredCache } from "@/lib/stored-character-translations";`,
  "single cache import"
);

singleRoute = replaceRequired(
  singleRoute,
  `    const localized = await localizeCharacter(
      character,
      languageResult.data as CharacterContentLanguage,
      { translateTags: true, allowProvider: false }
    );`,
  `    const localized = await localizeCharacterFromStoredCache(
      character,
      languageResult.data as CharacterContentLanguage,
      { translateTags: true }
    );`,
  "single cache call"
);

singleRoute = replaceRequired(
  singleRoute,
  `    const selectedImage = userId
      ? await selectedCharacterImageUrl(userId, character.id)
      : null;`,
  `    const selectedImage = userId
      ? await selectedCharacterImageUrl(userId, character.id).catch(() => null)
      : null;`,
  "non-fatal selected image"
);

if (
  !singleRoute.includes("localizeCharacterFromStoredCache(") ||
  !singleRoute.includes(
    "await selectedCharacterImageUrl(userId, character.id).catch(() => null)"
  )
) {
  throw new Error("Single-character stored-cache route validation failed.");
}

write(singleRoutePath, singleRoute);

// ===========================================================================
// 4) NEVER TURN A TRANSLATION ERROR INTO CHARACTER CONTENT
//
// The existing client fallback fills scenario/message/title/etc with the
// localized error sentence. That is exactly why the Spanish error text showed
// up where the opening scenario and first message belong.
//
// Fallback now leaves the original Character intact.
// ===========================================================================

const clientLocalizationPath = "src/lib/client-character-localization.ts";
let clientLocalization = read(clientLocalizationPath);

clientLocalization = clientLocalization.replace(
  'import { FINAL_LOCALIZATION_COPY } from "@/lib/final-localization-language";\n',
  ""
);

const fallbackStart =
  `export function localizedCharacterFallback(
  character: Character,
  language: Exclude<LanguageCode, "EN">
): Character {`;

const fallbackEnd = `
}

async function fetchBatch(`;

const fallbackStartIndex = clientLocalization.indexOf(fallbackStart);
const fallbackEndIndex = clientLocalization.indexOf(
  fallbackEnd,
  Math.max(fallbackStartIndex, 0)
);

if (fallbackStartIndex < 0 || fallbackEndIndex < 0) {
  throw new Error("Could not find client localization fallback function.");
}

const cleanFallback = `export function localizedCharacterFallback(
  character: Character,
  language: Exclude<LanguageCode, "EN">
): Character {
  void language;
  return character;
}`;

clientLocalization =
  clientLocalization.slice(0, fallbackStartIndex) +
  cleanFallback +
  clientLocalization.slice(fallbackEndIndex + 2);

if (
  clientLocalization.includes(
    "const placeholder = FINAL_LOCALIZATION_COPY[language].translationUnavailable"
  )
) {
  throw new Error("Translation-unavailable placeholder character still exists.");
}

write(clientLocalizationPath, clientLocalization);

// ===========================================================================
// 5) PAGE SHELLS SHOULD LOOK LIKE ENGLISH AFTER LOADING
//
// While the cache request is running, show the loader.
// Once it completes, render the normal English-style profile/chat layout.
// With the paid cache present, character content will be localized.
// If one row is truly missing, the page still works instead of dead-ending.
// ===========================================================================

for (const shellPath of [
  "src/components/character/LocalizedCharacterProfileShell.tsx",
  "src/components/chat/LocalizedChatShell.tsx"
]) {
  let shell = read(shellPath);

  shell = replaceRequired(
    shell,
    `if (language !== "EN" && (loading || !localized))`,
    `if (language !== "EN" && loading)`,
    `${shellPath} loading gate`
  );

  if (shellPath.endsWith("LocalizedCharacterProfileShell.tsx")) {
    shell = replaceRequired(
      shell,
      `const { character, language, loading, localized } =`,
      `const { character, language, loading } =`,
      "profile shell unused localized state"
    );
  }

  write(shellPath, shell);
}

// ===========================================================================
// 6) PRIVATE / OWNER CHAT SHOULD NEVER DEAD-END ON TRANSLATION DETECTION
// ===========================================================================

const privateLoaderPath = "src/components/chat/PrivateChatLoader.tsx";
let privateLoader = read(privateLoaderPath);

privateLoader = replaceRequired(
  privateLoader,
  `          if (!isLocalizedCharacterContent(baseCharacter, targetCharacter)) {
            setUnavailable(true);
            return;
          }`,
  `          if (!isLocalizedCharacterContent(baseCharacter, targetCharacter)) {
            setCharacter(baseCharacter);
            setUnavailable(false);
            return;
          }`,
  "private chat fallback"
);

write(privateLoaderPath, privateLoader);

// ===========================================================================
// FINAL VALIDATION
// ===========================================================================

const finalClient = read(clientLocalizationPath);
const finalBatch = read(batchRoutePath);
const finalSingle = read(singleRoutePath);
const finalProfile = read(
  "src/components/character/LocalizedCharacterProfileShell.tsx"
);
const finalChat = read("src/components/chat/LocalizedChatShell.tsx");

if (
  !fs.existsSync(path.join(root, cacheModulePath)) ||
  !finalBatch.includes("localizeCharactersFromStoredCache") ||
  !finalSingle.includes("localizeCharacterFromStoredCache") ||
  finalClient.includes("const placeholder = FINAL_LOCALIZATION_COPY") ||
  finalProfile.includes("(loading || !localized)") ||
  finalChat.includes("(loading || !localized)")
) {
  throw new Error("Final Supabase translation cache validation failed.");
}

console.log(
  "EVERBOND_TRANSLATION_CACHE_FINAL source=supabase-content hash-gate=off provider=off placeholder-character=removed profile-chat=normal-layout"
);
