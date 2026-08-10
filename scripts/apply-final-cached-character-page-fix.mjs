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
  throw new Error(`Zero-cost chat translation fix could not find: ${label}`);
}

const helperPath = "src/lib/chat-intro-localization.ts";

write(
  helperPath,
  `import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { Character } from "@/types/character";

export type ChatIntroLanguage = "EN" | "ES" | "FR" | "DE" | "JA" | "KO";

type ChatIntroTranslationRow = {
  opening_scenario: string | null;
  first_message: string | null;
};

export async function localizeCharacterChatIntroFromCache(
  character: Character,
  language: ChatIntroLanguage
): Promise<Character> {
  if (language === "EN") return character;

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("character_chat_translations")
    .select("opening_scenario,first_message")
    .eq("character_id", character.id)
    .eq("language", language)
    .maybeSingle();

  if (error) {
    console.warn("EVERBOND_CHAT_INTRO_TRANSLATION_CACHE_READ_FAILED", {
      characterId: character.id,
      language,
      error: error.message
    });
    return character;
  }

  const row = data as ChatIntroTranslationRow | null;
  const openingScenario =
    typeof row?.opening_scenario === "string" ? row.opening_scenario.trim() : "";
  const firstMessage =
    typeof row?.first_message === "string" ? row.first_message.trim() : "";

  if (!openingScenario || !firstMessage) return character;

  return {
    ...character,
    description: openingScenario,
    openingScenario,
    openingMessage: firstMessage,
    firstMessage
  };
}
`
);

const routePath = "src/app/api/characters/[slug]/route.ts";
let route = read(routePath);

route = replaceRequired(
  route,
  `import {
  localizeCharacter,
  type CharacterContentLanguage
} from "@/lib/character-localization";`,
  `import {
  localizeCharacterChatIntroFromCache,
  type ChatIntroLanguage
} from "@/lib/chat-intro-localization";`,
  "selected character localization import"
);

route = replaceRequired(
  route,
  `    const localized = await localizeCharacter(
      character,
      languageResult.data as CharacterContentLanguage,
      { translateTags: true, allowProvider: false }
    );`,
  `    // EVERBOND_ZERO_COST_CHAT_INTRO_TRANSLATION
    const localized = await localizeCharacterChatIntroFromCache(
      character,
      languageResult.data as ChatIntroLanguage
    );`,
  "selected character lightweight cache call"
);

route = replaceRequired(
  route,
  `    const selectedImage = userId
      ? await selectedCharacterImageUrl(userId, character.id)
      : null;`,
  `    const selectedImage = userId
      ? await selectedCharacterImageUrl(userId, character.id).catch((error) => {
          console.warn("EVERBOND_SELECTED_CHARACTER_IMAGE_OPTIONAL_FAILED", {
            characterId: character.id,
            error:
              error instanceof Error
                ? error.message
                : "OPTIONAL_SELECTED_IMAGE_FAILED"
          });
          return null;
        })
      : null;`,
  "optional selected image isolation"
);

write(routePath, route);

const chatPath = "src/components/chat/LocalizedChatShell.tsx";
let chat = read(chatPath);

chat = replaceRequired(
  chat,
  `  if (language !== "EN" && (loading || !localized)) {
    return (
      <main className="flex h-[calc(100dvh-64px)] items-center justify-center px-4">
        <section className="w-full max-w-2xl rounded-[2rem] border border-bond-rose/35 bg-white/[0.035] p-8 text-center shadow-[0_0_34px_rgba(255,92,168,0.08)]">
          <p className={loading ? "animate-pulse text-bond-muted" : "text-bond-muted"}>
            {loading ? copy.translatingCharacter : copy.translationUnavailable}
          </p>
        </section>
      </main>
    );
  }

  return (
    <ChatShell
      key={\`\${character.id}:\${language}:\${character.tagline}\`}
      character={character}
    />
  );`,
  `  if (language !== "EN" && loading) {
    return (
      <main className="flex h-[calc(100dvh-64px)] items-center justify-center px-4">
        <section className="w-full max-w-2xl rounded-[2rem] border border-bond-rose/35 bg-white/[0.035] p-8 text-center shadow-[0_0_34px_rgba(255,92,168,0.08)]">
          <p className="animate-pulse text-bond-muted">
            {copy.translatingCharacter}
          </p>
        </section>
      </main>
    );
  }

  // EVERBOND_CHAT_INTRO_ENGLISH_FALLBACK
  const renderedCharacter =
    language !== "EN" && !localized ? baseCharacter : character;

  return (
    <ChatShell
      key={\`\${renderedCharacter.id}:\${language}:\${renderedCharacter.tagline}\`}
      character={renderedCharacter}
    />
  );`,
  "non-blocking chat intro fallback"
);

write(chatPath, chat);

const legacyPath = "src/app/api/characters-localized/route.ts";
let legacy = read(legacyPath);
legacy = replaceRequired(
  legacy,
  `    const characters = await localizeCharacters(
      result.characters,
      parsed.data.language as CharacterContentLanguage,
      { translateTags: true }
    );`,
  `    const characters = await localizeCharacters(
      result.characters,
      parsed.data.language as CharacterContentLanguage,
      { translateTags: true, allowProvider: false }
    );`,
  "legacy localized endpoint provider guard"
);
write(legacyPath, legacy);

if (!route.includes("EVERBOND_ZERO_COST_CHAT_INTRO_TRANSLATION")) {
  throw new Error("Selected route validation failed.");
}
if (!chat.includes("EVERBOND_CHAT_INTRO_ENGLISH_FALLBACK")) {
  throw new Error("Chat fallback validation failed.");
}
if (!legacy.includes("allowProvider: false")) {
  throw new Error("Legacy provider guard validation failed.");
}

console.log(
  "EVERBOND_ZERO_COST_CHAT_TRANSLATION discover=unchanged chat=intro-cache-only fields=opening-scenario+first-message provider=off missing=fallback-English legacy-provider-route=off"
);
