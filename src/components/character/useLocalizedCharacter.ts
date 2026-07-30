"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSiteLanguage } from "@/lib/site-language";
import type { Character } from "@/types/character";

export function useLocalizedCharacter(baseCharacter: Character) {
  const { language } = useSiteLanguage();
  const { session, authReady } = useAuth();
  const [character, setCharacter] = useState(baseCharacter);
  const [loading, setLoading] = useState(language !== "EN");

  useEffect(() => {
    if (language === "EN") {
      setCharacter(baseCharacter);
      setLoading(false);
      return;
    }

    if (!authReady) {
      setLoading(true);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    void fetch(
      `/api/characters/${encodeURIComponent(
        baseCharacter.slug
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

        setCharacter(payload.character as Character);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setCharacter(baseCharacter);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [
    authReady,
    baseCharacter,
    language,
    session?.access_token
  ]);

  return {
    character,
    language,
    loading
  };
}
