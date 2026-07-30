"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { localizeCharactersProgressively } from "@/lib/client-character-localization";
import { useSiteLanguage } from "@/lib/site-language";
import type { Character } from "@/types/character";

export function useLocalizedCharacters(baseCharacters: Character[]) {
  const { language } = useSiteLanguage();
  const { session, authReady } = useAuth();
  const [characters, setCharacters] = useState(
    language === "EN" ? baseCharacters : []
  );
  const [loading, setLoading] = useState(language !== "EN");
  const slugsKey = useMemo(
    () => baseCharacters.map((character) => character.slug).join("\u0001"),
    [baseCharacters]
  );

  useEffect(() => {
    if (language === "EN" || !baseCharacters.length) {
      setCharacters(baseCharacters);
      setLoading(false);
      return;
    }

    if (!authReady) {
      setCharacters([]);
      setLoading(true);
      return;
    }

    const controller = new AbortController();
    setCharacters([]);
    setLoading(true);

    void localizeCharactersProgressively({
      characters: baseCharacters,
      language,
      accessToken: session?.access_token,
      signal: controller.signal,
      onProgress: setCharacters
    })
      .then((localized) => {
        if (!controller.signal.aborted) setCharacters(localized);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setCharacters(baseCharacters);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [
    authReady,
    baseCharacters,
    language,
    session?.access_token,
    slugsKey
  ]);

  return {
    characters,
    language,
    loading
  };
}
