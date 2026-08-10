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
  throw new Error(`Final character translation fix could not find: ${label}`);
}

// ===========================================================================
// IMPORTANT SCOPE
//
// Discover already worked before the previous cache rewrite.
// DO NOT modify:
// - /api/character-localizations
// - client-character-localization.ts
// - useLocalizedCharacters.ts
// - useCharacterBrowser.ts
// - CharacterCard.tsx
//
// This patch fixes ONLY the selected character/profile/chat path.
// ===========================================================================

// ===========================================================================
// 1) EXACT EXISTING-CACHE HELPER
//
// The Venice localization code stores TranslationItemSchema directly in
// character_translations.content.
//
// For a selected character, read the already-paid cache row directly by:
//   character_id + language
//
// Deliberately do NOT require:
// - current source_hash equality
// - provider generation
// - a translation claim/write
//
// If valid cached content exists, apply it to the exact current Character.
// ===========================================================================

const localizationPath = "src/lib/character-localization.ts";
let localization = read(localizationPath);

const helperName = "localizeCharacterFromExistingCache";

if (!localization.includes(`export async function ${helperName}(`)) {
  localization += `

export async function localizeCharacterFromExistingCache(
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
    .select("content,status,source_hash")
    .eq("character_id", character.id)
    .eq("language", language)
    .maybeSingle();

  if (error) throw error;

  // Existing paid translation content is the runtime source of truth here.
  // Do not reject it only because the English character schema/hash changed
  // after the translation was originally cached.
  if (!data?.content) {
    console.warn("EVERBOND_CHARACTER_TRANSLATION_CACHE_MISS", {
      characterId: character.id,
      language,
      status: data?.status ?? null
    });
    return character;
  }

  const parsed = TranslationItemSchema.safeParse(data.content);

  if (!parsed.success) {
    console.error("EVERBOND_CHARACTER_TRANSLATION_CACHE_INVALID", {
      characterId: character.id,
      language,
      status: data.status ?? null
    });
    return character;
  }

  return applyTranslation(
    character,
    parsed.data,
    options?.translateTags !== false
  );
}
`;
}

if (
  !localization.includes(`export async function ${helperName}(`) ||
  !localization.includes('.from("character_translations")') ||
  !localization.includes('.eq("character_id", character.id)') ||
  !localization.includes('.eq("language", language)') ||
  !localization.includes("TranslationItemSchema.safeParse(data.content)") ||
  !localization.includes("return applyTranslation(")
) {
  throw new Error("Existing-cache helper validation failed.");
}

write(localizationPath, localization);

// ===========================================================================
// 2) SELECTED CHARACTER API
//
// Both public profile/chat localization and PrivateChatLoader ultimately use
// this route. Make it use the direct existing-cache helper.
//
// Also isolate the optional selected gallery image. A missing preference,
// storage/signing issue, or stale gallery row must NEVER turn a valid character
// translation into a 500 response.
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
  localizeCharacterFromExistingCache,
  type CharacterContentLanguage
} from "@/lib/character-localization";`,
  "selected-character localization import"
);

route = replaceRequired(
  route,
  `    const localized = await localizeCharacter(
      character,
      languageResult.data as CharacterContentLanguage,
      { translateTags: true, allowProvider: false }
    );`,
  `    const localized = await localizeCharacterFromExistingCache(
      character,
      languageResult.data as CharacterContentLanguage,
      { translateTags: true }
    );`,
  "selected-character direct cache call"
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
  "optional selected character image isolation"
);

if (
  !route.includes("localizeCharacterFromExistingCache(") ||
  route.includes(
    `const localized = await localizeCharacter(
      character,`
  ) ||
  !route.includes("EVERBOND_SELECTED_CHARACTER_IMAGE_OPTIONAL_FAILED")
) {
  throw new Error("Selected-character route validation failed.");
}

write(routePath, route);

// ===========================================================================
// 3) SAFETY: DO NOT LET THE OLD SYNTHETIC ERROR CHARACTER LEAK INTO CHAT
//
// Keep Discover's existing behavior untouched. But if a user arrives at chat
// with stale sessionStorage left by one of the temporary handoff builds, remove
// those keys before the current hook runs. This does not affect fresh Discover
// localization and prevents an old fake "translation unavailable" Character
// from being reused by the browser.
// ===========================================================================

const hookPath = "src/components/character/useLocalizedCharacter.ts";
let hook = read(hookPath);

if (!hook.includes("EVERBOND_CLEAR_LEGACY_TRANSLATION_HANDOFF")) {
  hook = replaceRequired(
    hook,
    `    const currentBaseCharacter = baseCharacterRef.current;
    setCharacter(currentBaseCharacter);`,
    `    const currentBaseCharacter = baseCharacterRef.current;

    // EVERBOND_CLEAR_LEGACY_TRANSLATION_HANDOFF
    // Previous temporary builds used sessionStorage to hand translated card
    // objects into chat. Remove any stale copy so the selected page always
    // loads from the real Supabase cache API now.
    if (typeof window !== "undefined" && language !== "EN") {
      try {
        window.sessionStorage.removeItem(
          \`everbond-localized-clickthrough:\${language}:\${currentBaseCharacter.slug}\`
        );
      } catch {
        // Optional cleanup must never block localization.
      }
    }

    setCharacter(currentBaseCharacter);`,
    "legacy translation handoff cleanup"
  );
}

if (!hook.includes("EVERBOND_CLEAR_LEGACY_TRANSLATION_HANDOFF")) {
  throw new Error("Legacy translation handoff cleanup validation failed.");
}

write(hookPath, hook);

// ===========================================================================
// 4) FINAL GUARDS
// ===========================================================================

// These strings must remain absent from this final patch because changing
// Discover again caused the last regression.
const forbiddenTargets = [
  'src/app/api/character-localizations/route.ts',
  'src/lib/client-character-localization.ts',
  'src/components/character/useLocalizedCharacters.ts',
  'src/components/character/useCharacterBrowser.ts',
  'src/components/character/CharacterCard.tsx'
];

const ownSource = read("scripts/apply-final-cached-character-page-fix.mjs");

for (const target of forbiddenTargets) {
  // Comments above mention the paths for documentation; writing them is what
  // must never happen. Validate that no write(...) targets those files.
  const writeNeedle = `write("${target}"`;
  if (ownSource.includes(writeNeedle)) {
    throw new Error(`Discover regression guard failed: ${target}`);
  }
}

console.log(
  "EVERBOND_CHARACTER_TRANSLATION_FINAL discover=unchanged selected=supabase-existing-cache hash-gate=off provider=off optional-image=isolated legacy-handoff=cleared"
);
