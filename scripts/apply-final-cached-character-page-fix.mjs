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
  throw new Error(`Translation build fix could not find: ${label}`);
}

const STORAGE_PREFIX = "everbond-localized-clickthrough";

// ===========================================================================
// 1) DISCOVER CARD -> CHAT HANDOFF
// ===========================================================================

const cardPath = "src/components/character/CharacterCard.tsx";
let card = read(cardPath);

if (!card.includes("CHARACTER_TRANSLATION_HANDOFF")) {
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
      // Optional handoff must never block chat navigation.
    }
  }

  const openingPreview =`,
    "CharacterCard handoff function"
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
  !card.startsWith('"use client";') ||
  !card.includes("CHARACTER_TRANSLATION_HANDOFF") ||
  !card.includes("rememberLocalizedCharacter") ||
  !card.includes("onClick={rememberLocalizedCharacter}") ||
  !card.includes(STORAGE_PREFIX)
) {
  throw new Error("CharacterCard translation handoff validation failed.");
}

write(cardPath, card);

// ===========================================================================
// 2) SELECTED CHARACTER LOCALIZATION
//
// Write this small hook deterministically instead of stacking fragile search /
// replace operations. It preserves the existing public API:
//   isLocalizedCharacterContent()
//   useLocalizedCharacter()
//
// Behavior:
// - EN: unchanged.
// - ES/FR/DE/JA/KO: first use the exact translated Character clicked in
//   Discover when available.
// - Then verify against the SAME cache-only endpoint Discover uses:
//   POST /api/character-localizations.
// - If that background cache request fails or returns English, keep the valid
//   clicked translation instead of showing "translation unavailable".
// - No Venice provider calls are introduced here.
// ===========================================================================

const hookPath = "src/components/character/useLocalizedCharacter.ts";
const currentHook = read(hookPath);

if (
  !currentHook.includes("export function isLocalizedCharacterContent") ||
  !currentHook.includes("export function useLocalizedCharacter")
) {
  throw new Error("Unexpected useLocalizedCharacter.ts shape; refusing to overwrite.");
}

const hook = `"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSiteLanguage } from "@/lib/site-language";
import type { Character } from "@/types/character";

const CHARACTER_LOCALIZATION_TIMEOUT_MS = 15_000;
const CLICKTHROUGH_STORAGE_PREFIX = "${STORAGE_PREFIX}";

function localizationComparable(character: Character) {
  return JSON.stringify({
    archetype: character.archetype,
    role: character.role,
    tagline: character.tagline,
    title: character.title,
    description: character.description,
    openingScenario: character.openingScenario,
    openingMessage: character.openingMessage,
    firstMessage: character.firstMessage,
    relationshipContext: character.relationshipContext,
    relationshipPace: character.relationshipPace,
    tags: character.tags,
    card: character.card
  });
}

export function isLocalizedCharacterContent(
  baseCharacter: Character,
  candidate: Character
) {
  return localizationComparable(baseCharacter) !== localizationComparable(candidate);
}

export function useLocalizedCharacter(baseCharacter: Character) {
  const { language } = useSiteLanguage();
  const { session, authReady } = useAuth();
  const baseCharacterRef = useRef(baseCharacter);
  baseCharacterRef.current = baseCharacter;

  const [character, setCharacter] = useState(baseCharacter);
  const [loading, setLoading] = useState(language !== "EN");
  const [localized, setLocalized] = useState(language === "EN");
  const characterKey = useMemo(
    () => \`\${baseCharacter.id}:\${baseCharacter.slug}\`,
    [baseCharacter.id, baseCharacter.slug]
  );

  useEffect(() => {
    const currentBaseCharacter = baseCharacterRef.current;
    setCharacter(currentBaseCharacter);

    if (language === "EN") {
      setLocalized(true);
      setLoading(false);
      return;
    }

    let handedOffCharacter: Character | null = null;

    if (typeof window !== "undefined") {
      try {
        const raw = window.sessionStorage.getItem(
          \`\${CLICKTHROUGH_STORAGE_PREFIX}:\${language}:\${currentBaseCharacter.slug}\`
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
        // Damaged optional handoff falls through to the Supabase cache endpoint.
      }
    }

    if (!handedOffCharacter) {
      setLocalized(false);
    }

    if (!authReady) {
      if (!handedOffCharacter) setLoading(true);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    setLoading(!handedOffCharacter);

    const timeout = window.setTimeout(
      () => controller.abort(),
      CHARACTER_LOCALIZATION_TIMEOUT_MS
    );

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (session?.access_token) {
      headers.Authorization = \`Bearer \${session.access_token}\`;
    }

    void fetch("/api/character-localizations", {
      method: "POST",
      headers,
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
          if (handedOffCharacter) return;
          throw new Error("CHARACTER_LOCALIZATION_FAILED");
        }

        const translated = isLocalizedCharacterContent(
          currentBaseCharacter,
          candidate
        );

        if (!cancelled && translated) {
          setCharacter(candidate);
          setLocalized(true);
          return;
        }

        if (!cancelled && handedOffCharacter) {
          setCharacter(handedOffCharacter);
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

        if (!cancelled && handedOffCharacter) {
          setCharacter(handedOffCharacter);
          setLocalized(true);
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
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [authReady, characterKey, language, session?.access_token]);

  return {
    character,
    language,
    loading,
    localized
  };
}
`;

write(hookPath, hook);

// ===========================================================================
// 3) OPTIONAL SELECTED CHAT IMAGE
//
// This endpoint can still be used after localization to refresh the user's
// currently selected gallery image. An optional image lookup failure must not
// become a translation failure.
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
  "EVERBOND_TRANSLATION_HANDOFF_FINAL build=deterministic discover=handoff cache=/api/character-localizations provider=off image=nonfatal"
);
