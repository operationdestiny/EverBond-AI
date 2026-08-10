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
  throw new Error(`Translation handoff fix could not find: ${label}`);
}

const STORAGE_PREFIX = "everbond-localized-clickthrough";

// ===========================================================================
// DISCOVER CARD -> CHAT HANDOFF
//
// Discover already has the successfully translated Character object. Preserve
// that exact Supabase-backed object synchronously when the user clicks a card.
// sessionStorage survives the Next navigation and a same-tab refresh, but does
// not create a permanent stale copy.
// ===========================================================================

const cardPath = "src/components/character/CharacterCard.tsx";
let card = read(cardPath);

if (!card.startsWith('"use client";')) {
  card = `"use client";\n\n${card}`;
}

if (!card.includes('useSiteLanguage')) {
  card = replaceRequired(
    card,
    'import { Character } from "@/types/character";',
    'import { Character } from "@/types/character";\nimport { useSiteLanguage } from "@/lib/site-language";',
    "CharacterCard language import"
  );
}

if (!card.includes("CHARACTER_TRANSLATION_HANDOFF")) {
  card = replaceRequired(
    card,
    `}) {
  const openingPreview =`,
    `}) {
  const { language } = useSiteLanguage();

  // CHARACTER_TRANSLATION_HANDOFF
  function rememberLocalizedCharacter() {
    if (language === "EN" || typeof window === "undefined") return;

    try {
      window.sessionStorage.setItem(
        \`${STORAGE_PREFIX}:\${language}:\${character.slug}\`,
        JSON.stringify(character)
      );
    } catch {
      // Optional navigation handoff must never block opening chat.
    }
  }

  const openingPreview =`,
    "CharacterCard translation handoff function"
  );

  card = replaceRequired(
    card,
    `        <Link
          href={\`/chat/\${character.slug}\`}
          className="block h-full w-full"
        >`,
    `        <Link
          href={\`/chat/\${character.slug}\`}
          onClick={rememberLocalizedCharacter}
          className="block h-full w-full"
        >`,
    "CharacterCard image link handoff"
  );

  card = replaceRequired(
    card,
    `        <Link href={\`/chat/\${character.slug}\`} className="block">`,
    `        <Link
          href={\`/chat/\${character.slug}\`}
          onClick={rememberLocalizedCharacter}
          className="block"
        >`,
    "CharacterCard text link handoff"
  );
}

if (
  !card.includes("CHARACTER_TRANSLATION_HANDOFF") ||
  !card.includes("rememberLocalizedCharacter") ||
  !card.includes(STORAGE_PREFIX)
) {
  throw new Error("CharacterCard translation handoff validation failed.");
}

write(cardPath, card);

// ===========================================================================
// CHAT/PROFILE LOCALIZATION HOOK
//
// On a non-English character page, first consume the exact translated object
// that the user just clicked. Then continue the existing cache-only Supabase
// request in the background. If that background request fails or returns the
// English source, keep the already-successful translated object instead of
// replacing the page with "translation unavailable."
// ===========================================================================

const hookPath = "src/components/character/useLocalizedCharacter.ts";
let hook = read(hookPath);

if (!hook.includes("CLICKTHROUGH_TRANSLATION_HANDOFF")) {
  hook = replaceRequired(
    hook,
    `    setLocalized(false);

    if (!authReady) {
      setLoading(true);
      return;
    }`,
    `    // CLICKTHROUGH_TRANSLATION_HANDOFF
    let handedOffCharacter: Character | null = null;

    if (typeof window !== "undefined") {
      try {
        const raw = window.sessionStorage.getItem(
          \`${STORAGE_PREFIX}:\${language}:\${currentBaseCharacter.slug}\`
        );

        if (raw) {
          const candidate = JSON.parse(raw) as Character;

          if (
            candidate?.id === currentBaseCharacter.id &&
            candidate?.slug === currentBaseCharacter.slug &&
            isLocalizedCharacterContent(currentBaseCharacter, candidate)
          ) {
            handedOffCharacter = candidate;
            setCharacter(candidate);
            setLocalized(true);
            setLoading(false);
          }
        }
      } catch {
        // Damaged optional handoff cache falls through to the server cache.
      }
    }

    if (!handedOffCharacter) {
      setLocalized(false);
    }

    if (!authReady) {
      if (!handedOffCharacter) setLoading(true);
      return;
    }`,
    "useLocalizedCharacter handoff read"
  );

  hook = replaceRequired(
    hook,
    `    setLoading(true);

    const timeout =`,
    `    setLoading(!handedOffCharacter);

    const timeout =`,
    "useLocalizedCharacter non-blocking background refresh"
  );

  hook = replaceRequired(
    hook,
    `        if (!response.ok || !candidate) {
          throw new Error("CHARACTER_LOCALIZATION_FAILED");
        }`,
    `        if (!response.ok || !candidate) {
          if (handedOffCharacter) return;
          throw new Error("CHARACTER_LOCALIZATION_FAILED");
        }`,
    "useLocalizedCharacter preserve handoff on empty response"
  );

  hook = replaceRequired(
    hook,
    `        if (!cancelled && translated) {
          setCharacter(candidate);
          setLocalized(true);
        }`,
    `        if (!cancelled && translated) {
          setCharacter(candidate);
          setLocalized(true);
          return;
        }

        if (!cancelled && handedOffCharacter) {
          setCharacter(handedOffCharacter);
          setLocalized(true);
        }`,
    "useLocalizedCharacter preserve handoff on untranslated response"
  );

  hook = replaceRequired(
    hook,
    `        if (!cancelled) {
          setCharacter(currentBaseCharacter);
          setLocalized(false);
        }`,
    `        if (!cancelled && handedOffCharacter) {
          setCharacter(handedOffCharacter);
          setLocalized(true);
          return;
        }

        if (!cancelled) {
          setCharacter(currentBaseCharacter);
          setLocalized(false);
        }`,
    "useLocalizedCharacter preserve handoff on request failure"
  );
}

if (
  !hook.includes("CLICKTHROUGH_TRANSLATION_HANDOFF") ||
  !hook.includes("handedOffCharacter") ||
  !hook.includes(STORAGE_PREFIX) ||
  !hook.includes('fetch("/api/character-localizations"')
) {
  throw new Error("Character localization handoff validation failed.");
}

write(hookPath, hook);

// ===========================================================================
// OPTIONAL SELECTED CHAT IMAGE
//
// Keep the optional user image lookup non-fatal. A storage preference problem
// must never be reported to the user as a translation failure.
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
  "EVERBOND_TRANSLATION_HANDOFF_FINAL discover=supabase-translated clickthrough=session-handoff server-cache=background provider=off"
);
