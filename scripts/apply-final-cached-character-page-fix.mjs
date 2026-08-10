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
  throw new Error(`Translation click-through fix could not find: ${label}`);
}

// ===========================================================================
// CHARACTER PROFILE + CHAT LOCALIZATION
//
// Discover already works through POST /api/character-localizations.
// Use that exact same cache-only endpoint for a selected character instead of
// the separate /api/characters/[slug] route.
//
// The batch endpoint already reads Supabase character_translations and calls
// localizeCharacters with allowProvider:false, so this cannot create new
// Venice translation spend.
// ===========================================================================

const hookPath = "src/components/character/useLocalizedCharacter.ts";
let hook = read(hookPath);

if (!hook.includes("CHARACTER_CLICKTHROUGH_USES_DISCOVER_CACHE")) {
  const startMarker = "    void fetch(\n      `/api/characters/";
  const endMarker = "\n\n    return () => {";
  const start = hook.indexOf(startMarker);
  const end = hook.indexOf(endMarker, Math.max(start, 0));

  if (start < 0 || end < 0 || end <= start) {
    throw new Error(
      "Translation click-through fix could not find the selected-character fetch block."
    );
  }

  const replacement = `    // CHARACTER_CLICKTHROUGH_USES_DISCOVER_CACHE
    void fetch("/api/character-localizations", {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        slugs: [currentBaseCharacter.slug],
        language
      }),
      cache: "no-store",
      signal: controller.signal
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        const candidate =
          Array.isArray(payload?.characters) && payload.characters.length
            ? (payload.characters[0] as Character)
            : null;

        if (!response.ok || !candidate) {
          throw new Error("CHARACTER_LOCALIZATION_FAILED");
        }

        const translated = isLocalizedCharacterContent(
          currentBaseCharacter,
          candidate
        );

        if (!cancelled && translated) {
          setCharacter(candidate);
          setLocalized(true);
        }
      })
      .catch((error) => {
        if (
          error instanceof DOMException &&
          error.name === "AbortError" &&
          cancelled
        ) {
          return;
        }

        if (!cancelled) {
          setCharacter(currentBaseCharacter);
          setLocalized(false);
        }
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      });`;

  hook =
    hook.slice(0, start) +
    replacement +
    hook.slice(end);
}

if (
  !hook.includes("CHARACTER_CLICKTHROUGH_USES_DISCOVER_CACHE") ||
  !hook.includes('fetch("/api/character-localizations"') ||
  !hook.includes('method: "POST"') ||
  !hook.includes("slugs: [currentBaseCharacter.slug]")
) {
  throw new Error("Character click-through cache validation failed.");
}

write(hookPath, hook);

// ===========================================================================
// OPTIONAL USER CHAT IMAGE
//
// The single-character endpoint is still used elsewhere to refresh a user's
// selected gallery/chat image. That optional lookup must never turn a valid
// cached translation into a 500 response.
// ===========================================================================

const routePath = "src/app/api/characters/[slug]/route.ts";
let route = read(routePath);

route = replaceRequired(
  route,
  `    const selectedImage = userId
      ? await selectedCharacterImageUrl(userId, character.id)
      : null;`,
  `    const selectedImage = userId
      ? await selectedCharacterImageUrl(userId, character.id).catch(() => null)
      : null;`,
  "non-fatal selected chat image lookup"
);

if (
  !route.includes(
    "await selectedCharacterImageUrl(userId, character.id).catch(() => null)"
  )
) {
  throw new Error("Selected chat image fallback validation failed.");
}

write(routePath, route);

console.log(
  "EVERBOND_TRANSLATION_CLICKTHROUGH_FINAL source=discover-cache-endpoint provider=off selected-image=nonfatal other-systems=unchanged"
);
