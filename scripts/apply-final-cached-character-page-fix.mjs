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
  throw new Error(`Static chat intro fix could not find: ${label}`);
}

const spanishDataPath = "src/data/chat-intro-translations/es.json";
const frenchDataPath = "src/data/chat-intro-translations/fr.json";

for (const dataPath of [spanishDataPath, frenchDataPath]) {
  if (!fs.existsSync(path.join(root, dataPath))) {
    throw new Error(`Missing exact static chat intro data: ${dataPath}`);
  }
}

const helperPath = "src/lib/chat-intro-localization.ts";

write(
  helperPath,
  `import spanishChatIntros from "@/data/chat-intro-translations/es.json";\nimport frenchChatIntros from "@/data/chat-intro-translations/fr.json";\nimport { getSupabaseServiceClient } from "@/lib/supabase/server";\nimport type { Character } from "@/types/character";\n\nexport type ChatIntroLanguage = "EN" | "ES" | "FR" | "DE" | "JA" | "KO";\n\ntype ChatIntroTranslationRow = {\n  opening_scenario: string | null;\n  first_message: string | null;\n};\n\ntype StaticChatIntro = {\n  openingScenario: string;\n  firstMessage: string;\n};\n\ntype StaticChatIntroMap = Record<string, StaticChatIntro>;\n\nconst STATIC_CHAT_INTROS: Partial<Record<ChatIntroLanguage, StaticChatIntroMap>> = {\n  ES: spanishChatIntros as StaticChatIntroMap,\n  FR: frenchChatIntros as StaticChatIntroMap\n};\n\nfunction applyChatIntro(\n  character: Character,\n  openingScenario: string,\n  firstMessage: string\n): Character {\n  return {\n    ...character,\n    description: openingScenario,\n    openingScenario,\n    openingMessage: firstMessage,\n    firstMessage\n  };\n}\n\nexport async function localizeCharacterChatIntroFromCache(\n  character: Character,\n  language: ChatIntroLanguage\n): Promise<Character> {\n  if (language === "EN") return character;\n\n  // Exact static translations for catalog languages shipped with the app.\n  // No translation provider and no Supabase read are needed for these rows.\n  const staticRows = STATIC_CHAT_INTROS[language];\n  if (staticRows) {\n    const exact = staticRows[String(character.id)];\n    const openingScenario =\n      typeof exact?.openingScenario === "string"\n        ? exact.openingScenario.trim()\n        : "";\n    const firstMessage =\n      typeof exact?.firstMessage === "string"\n        ? exact.firstMessage.trim()\n        : "";\n\n    if (openingScenario && firstMessage) {\n      return applyChatIntro(character, openingScenario, firstMessage);\n    }\n  }\n\n  // Keep the lightweight cache for future languages or any manually cached\n  // non-catalog character. This never calls a translation provider.\n  const supabase = getSupabaseServiceClient();\n  const { data, error } = await supabase\n    .from("character_chat_translations")\n    .select("opening_scenario,first_message")\n    .eq("character_id", character.id)\n    .eq("language", language)\n    .maybeSingle();\n\n  if (!error) {\n    const row = data as ChatIntroTranslationRow | null;\n    const openingScenario =\n      typeof row?.opening_scenario === "string"\n        ? row.opening_scenario.trim()\n        : "";\n    const firstMessage =\n      typeof row?.first_message === "string"\n        ? row.first_message.trim()\n        : "";\n\n    if (openingScenario && firstMessage) {\n      return applyChatIntro(character, openingScenario, firstMessage);\n    }\n  } else {\n    console.warn("EVERBOND_CHAT_INTRO_TRANSLATION_CACHE_READ_FAILED", {\n      characterId: character.id,\n      language,\n      error: error.message\n    });\n  }\n\n  // Missing static/cache translation: keep the English intro.\n  // ChatShell still sends the selected language to the normal AI chat API.\n  return character;\n}\n`
);

const routePath = "src/app/api/characters/[slug]/route.ts";
let route = read(routePath);

route = replaceRequired(
  route,
  `import {\n  localizeCharacter,\n  type CharacterContentLanguage\n} from "@/lib/character-localization";`,
  `import {\n  localizeCharacterChatIntroFromCache,\n  type ChatIntroLanguage\n} from "@/lib/chat-intro-localization";`,
  "selected character localization import"
);

route = replaceRequired(
  route,
  `    const localized = await localizeCharacter(\n      character,\n      languageResult.data as CharacterContentLanguage,\n      { translateTags: true, allowProvider: false }\n    );`,
  `    // EVERBOND_EXACT_STATIC_CHAT_INTRO_TRANSLATION\n    const localized = await localizeCharacterChatIntroFromCache(\n      character,\n      languageResult.data as ChatIntroLanguage\n    );`,
  "selected character exact chat intro call"
);

route = replaceRequired(
  route,
  `    const selectedImage = userId\n      ? await selectedCharacterImageUrl(userId, character.id)\n      : null;`,
  `    const selectedImage = userId\n      ? await selectedCharacterImageUrl(userId, character.id).catch((error) => {\n          console.warn("EVERBOND_SELECTED_CHARACTER_IMAGE_OPTIONAL_FAILED", {\n            characterId: character.id,\n            error:\n              error instanceof Error\n                ? error.message\n                : "OPTIONAL_SELECTED_IMAGE_FAILED"\n          });\n          return null;\n        })\n      : null;`,
  "optional selected image isolation"
);

write(routePath, route);

const chatPath = "src/components/chat/LocalizedChatShell.tsx";
let chat = read(chatPath);

chat = replaceRequired(
  chat,
  `  if (language !== "EN" && (loading || !localized)) {\n    return (\n      <main className="flex h-[calc(100dvh-64px)] items-center justify-center px-4">\n        <section className="w-full max-w-2xl rounded-[2rem] border border-bond-rose/35 bg-white/[0.035] p-8 text-center shadow-[0_0_34px_rgba(255,92,168,0.08)]">\n          <p className={loading ? "animate-pulse text-bond-muted" : "text-bond-muted"}>\n            {loading ? copy.translatingCharacter : copy.translationUnavailable}\n          </p>\n        </section>\n      </main>\n    );\n  }\n\n  return (\n    <ChatShell\n      key={\`\${character.id}:\${language}:\${character.tagline}\`}\n      character={character}\n    />\n  );`,
  `  if (language !== "EN" && loading) {\n    return (\n      <main className="flex h-[calc(100dvh-64px)] items-center justify-center px-4">\n        <section className="w-full max-w-2xl rounded-[2rem] border border-bond-rose/35 bg-white/[0.035] p-8 text-center shadow-[0_0_34px_rgba(255,92,168,0.08)]">\n          <p className="animate-pulse text-bond-muted">\n            {copy.translatingCharacter}\n          </p>\n        </section>\n      </main>\n    );\n  }\n\n  // EVERBOND_CHAT_INTRO_ENGLISH_FALLBACK\n  const renderedCharacter =\n    language !== "EN" && !localized ? baseCharacter : character;\n\n  return (\n    <ChatShell\n      key={\`\${renderedCharacter.id}:\${language}:\${renderedCharacter.tagline}\`}\n      character={renderedCharacter}\n    />\n  );`,
  "non-blocking chat intro fallback"
);

write(chatPath, chat);

const legacyPath = "src/app/api/characters-localized/route.ts";
let legacy = read(legacyPath);

legacy = replaceRequired(
  legacy,
  `    const characters = await localizeCharacters(\n      result.characters,\n      parsed.data.language as CharacterContentLanguage,\n      { translateTags: true }\n    );`,
  `    const characters = await localizeCharacters(\n      result.characters,\n      parsed.data.language as CharacterContentLanguage,\n      { translateTags: true, allowProvider: false }\n    );`,
  "legacy localized endpoint provider guard"
);

write(legacyPath, legacy);

if (!route.includes("EVERBOND_EXACT_STATIC_CHAT_INTRO_TRANSLATION")) {
  throw new Error("Selected route validation failed.");
}
if (!chat.includes("EVERBOND_CHAT_INTRO_ENGLISH_FALLBACK")) {
  throw new Error("Chat fallback validation failed.");
}
if (!legacy.includes("allowProvider: false")) {
  throw new Error("Legacy provider guard validation failed.");
}

const spanishRows = JSON.parse(
  fs.readFileSync(path.join(root, spanishDataPath), "utf8")
);
const frenchRows = JSON.parse(
  fs.readFileSync(path.join(root, frenchDataPath), "utf8")
);

function validateStaticRows(label, rows, expectedCount) {
  const ids = Object.keys(rows);
  if (ids.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} ${label} chat intros, found ${ids.length}.`);
  }

  for (const [id, row] of Object.entries(rows)) {
    const openingScenario =
      typeof row?.openingScenario === "string" ? row.openingScenario.trim() : "";
    const firstMessage =
      typeof row?.firstMessage === "string" ? row.firstMessage.trim() : "";
    if (!openingScenario || !firstMessage) {
      throw new Error(`${label} static chat intro is incomplete for ${id}.`);
    }
    const extraKeys = Object.keys(row).filter(
      (key) => key !== "openingScenario" && key !== "firstMessage"
    );
    if (extraKeys.length) {
      throw new Error(
        `${label} static chat intro has unexpected fields for ${id}: ${extraKeys.join(", ")}`
      );
    }
  }

  return ids;
}

const spanishIds = validateStaticRows("Spanish", spanishRows, 2674);
// French intentionally covers the full 2,864-row master catalog so every
// active Spanish ID is guaranteed to have a static French intro even when
// retired catalog entries remain as harmless unused keys.
const frenchIds = validateStaticRows("French", frenchRows, 2864);
const spanishIdSet = new Set(spanishIds);
const frenchIdSet = new Set(frenchIds);

const missingFrenchIds = spanishIds.filter((id) => !frenchIdSet.has(id));
const extraFrenchIds = frenchIds.filter((id) => !spanishIdSet.has(id));
if (missingFrenchIds.length) {
  throw new Error(
    `French static coverage is incomplete: missingSpanishActiveIds=${missingFrenchIds.length}`
  );
}

console.log(
  `EVERBOND_EXACT_CHAT_TRANSLATION spanish=${spanishIds.length}/2674 french=${frenchIds.length}/2864 active-french-coverage=${spanishIds.length}/2674 unused-french-extra=${extraFrenchIds.length} source=static-json fields=opening-scenario+first-message provider=off missing=english-fallback legacy-provider-route=off`
);
