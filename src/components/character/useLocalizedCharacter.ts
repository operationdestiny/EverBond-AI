"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSiteLanguage } from "@/lib/site-language";
import type { Character } from "@/types/character";

const CHARACTER_LOCALIZATION_TIMEOUT_MS = 15_000;

export function useLocalizedCharacter(baseCharacter: Character) {
  const { language } = useSiteLanguage();
  const { session, authReady } = useAuth();
  const baseCharacterRef = useRef(baseCharacter);
  baseCharacterRef.current = baseCharacter;

  const [character, setCharacter] = useState(baseCharacter);
  const [loading, setLoading] = useState(language !== "EN");
  const characterKey = useMemo(
    () => `${baseCharacter.id}:${baseCharacter.slug}`,
    [baseCharacter.id, baseCharacter.slug]
  );

  useEffect(() => {
    const currentBaseCharacter = baseCharacterRef.current;
    setCharacter(currentBaseCharacter);

    if (language === "EN") {
      setLoading(false);
      return;
    }

    if (!authReady) {
      setLoading(true);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);

    const timeout = window.setTimeout(
      () => controller.abort(),
      CHARACTER_LOCALIZATION_TIMEOUT_MS
    );

    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    void fetch(
      `/api/characters/${encodeURIComponent(
        currentBaseCharacter.slug
      )}?language=${encodeURIComponent(language)}`,
      {
        headers,
        cache: "no-store",
        signal: controller.signal
      }
    )
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload?.character) {
          throw new Error(
            payload?.message || payload?.error || "CHARACTER_LOCALIZATION_FAILED"
          );
        }

        if (!cancelled) setCharacter(payload.character as Character);
      })
      .catch((error) => {
        if (
          error instanceof DOMException &&
          error.name === "AbortError" &&
          cancelled
        ) {
          return;
        }

        if (!cancelled) setCharacter(currentBaseCharacter);
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
    loading
  };
}
