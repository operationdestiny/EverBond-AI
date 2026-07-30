"use client";

import { useEffect, useRef, useState } from "react";
import { localizeCharactersProgressively } from "@/lib/client-character-localization";
import type { LanguageCode } from "@/lib/site-language";
import type { Character, CharacterCategory } from "@/types/character";

export function useCharacterBrowser(
  initial: Character[],
  initialCategory: CharacterCategory = "everbond-girls",
  language: LanguageCode = "EN"
) {
  const [characters, setCharacters] = useState(
    language === "EN" ? initial : []
  );
  const [category, setCategory] =
    useState<CharacterCategory>(initialCategory);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [hasMore, setHasMore] = useState(initial.length === 100);
  const [loading, setLoading] = useState(language !== "EN");
  const sourceCharactersRef = useRef<Character[]>(initial);
  const localizedByIdRef = useRef(new Map<string, Character>());
  const requestSequence = useRef(0);
  const firstEffect = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  async function load(reset: boolean) {
    const requestId = ++requestSequence.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    const offset = reset ? 0 : sourceCharactersRef.current.length;
    const params = new URLSearchParams({
      category,
      limit: "100",
      offset: String(offset)
    });

    if (query.trim()) params.set("q", query.trim());
    if (tag) params.set("tag", tag);

    try {
      const response = await fetch(`/api/characters?${params.toString()}`, {
        cache: "no-store",
        signal: controller.signal
      });
      const data = (await response.json().catch(() => ({}))) as {
        characters?: Character[];
        hasMore?: boolean;
      };

      if (
        !response.ok ||
        !Array.isArray(data.characters) ||
        requestId !== requestSequence.current
      ) {
        return;
      }

      const sourcePage = data.characters;
      sourceCharactersRef.current = reset
        ? sourcePage
        : [...sourceCharactersRef.current, ...sourcePage];
      setHasMore(Boolean(data.hasMore));

      if (language === "EN") {
        setCharacters(sourceCharactersRef.current);
        return;
      }

      if (reset) {
        localizedByIdRef.current.clear();
        setCharacters([]);
      }

      const localizedPage = await localizeCharactersProgressively({
        characters: sourcePage,
        language,
        signal: controller.signal,
        onProgress: (localized) => {
          if (requestId !== requestSequence.current) return;

          localized.forEach((character) => {
            localizedByIdRef.current.set(character.id, character);
          });
          setCharacters(
            sourceCharactersRef.current
              .map((character) => localizedByIdRef.current.get(character.id))
              .filter(
                (character): character is Character => Boolean(character)
              )
          );
        }
      });

      if (requestId !== requestSequence.current) return;

      localizedPage.forEach((character) => {
        localizedByIdRef.current.set(character.id, character);
      });
      setCharacters(
        sourceCharactersRef.current.map(
          (character) =>
            localizedByIdRef.current.get(character.id) ?? character
        )
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      if (requestId === requestSequence.current) {
        setCharacters(sourceCharactersRef.current);
      }
    } finally {
      if (requestId === requestSequence.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (firstEffect.current) {
      firstEffect.current = false;

      if (language === "EN") return;
    }

    sourceCharactersRef.current = [];
    localizedByIdRef.current.clear();
    setCharacters([]);
    setHasMore(false);

    const timer = window.setTimeout(() => {
      void load(true);
    }, 250);

    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
    };
    // `load` intentionally reads the latest filter state for this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, query, tag, language]);

  return {
    characters,
    category,
    setCategory,
    query,
    setQuery,
    tag,
    setTag,
    hasMore,
    loading,
    loadMore: () => load(false)
  };
}
