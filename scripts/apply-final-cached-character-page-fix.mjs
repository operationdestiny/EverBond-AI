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
  throw new Error(`Cached character-page fix could not find: ${label}`);
}

// ===========================================================================
// READY CACHE LOADER
//
// EverBond already has pre-generated translations in Supabase. The selected
// character profile/chat page should use those rows directly instead of trying
// to generate anything or rejecting a ready row because a derived source hash
// changed elsewhere.
//
// This helper:
// - reads character_translations only
// - requires status = "ready"
// - never calls Venice
// - never writes translations
// - applies the existing stored translation content to the current character
// ===========================================================================

const localizationPath = "src/lib/character-localization.ts";
let localization = read(localizationPath);

if (!localization.includes("localizeCharacterFromReadyCache")) {
  localization += `

export async function localizeCharacterFromReadyCache(
  character: Character,
  language: CharacterContentLanguage,
  options?: {
    translateTags?: boolean;
  }
): Promise<Character> {
  if (language === "EN") return character;

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("character_translations")
    .select("content")
    .eq("character_id", character.id)
    .eq("language", language)
    .eq("status", "ready")
    .maybeSingle();

  if (error) throw error;
  if (!data?.content) return character;

  const parsed = TranslationItemSchema.safeParse(data.content);
  if (!parsed.success) return character;

  return applyTranslation(
    character,
    parsed.data,
    options?.translateTags !== false
  );
}
`;
}

if (
  !localization.includes("export async function localizeCharacterFromReadyCache(") ||
  !localization.includes('.from("character_translations")') ||
  !localization.includes('.eq("status", "ready")')
) {
  throw new Error("Ready-cache localization helper validation failed.");
}

write(localizationPath, localization);

// ===========================================================================
// SINGLE CHARACTER API
//
// Both the selected profile page and chat page use this endpoint. Point it at
// the existing ready-cache helper. This deliberately does NOT use the normal
// localization function on this click-through path, so there is no provider
// fallback and no source-hash rejection.
// ===========================================================================

const routePath = "src/app/api/characters/[slug]/route.ts";
let route = read(routePath);

route = replaceRequired(
  route,
  `import {
  localizeCharacter,
  type CharacterContentLanguage
} from "@/lib/character-localization";`,
  `import {
  localizeCharacterFromReadyCache,
  type CharacterContentLanguage
} from "@/lib/character-localization";`,
  "single-character localization import"
);

route = replaceRequired(
  route,
  `    const localized = await localizeCharacter(
      character,
      languageResult.data as CharacterContentLanguage,
      { translateTags: true, allowProvider: false }
    );`,
  `    const localized = await localizeCharacterFromReadyCache(
      character,
      languageResult.data as CharacterContentLanguage,
      { translateTags: true }
    );`,
  "single-character ready-cache call"
);

if (
  !route.includes("localizeCharacterFromReadyCache(") ||
  route.includes("localizeCharacter(")
) {
  throw new Error("Single-character ready-cache route validation failed.");
}

write(routePath, route);

console.log(
  "EVERBOND_CHARACTER_PAGE_CACHE_FINAL source=supabase-ready-cache provider=off translation-writes=off discover=unchanged media=unchanged"
);
