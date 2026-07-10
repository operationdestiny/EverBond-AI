"use client";

import { useEffect, useRef, useState } from "react";
import { Character, CharacterCategory } from "@/types/character";

export function useCharacterBrowser(initial: Character[], initialCategory: CharacterCategory = "everbond-girls") {
  const [characters, setCharacters] = useState(initial);
  const [category, setCategory] = useState<CharacterCategory>(initialCategory);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [hasMore, setHasMore] = useState(initial.length === 100);
  const [loading, setLoading] = useState(false);
  const first = useRef(true);

  async function load(reset: boolean) {
    setLoading(true);
    const offset = reset ? 0 : characters.length;
    const params = new URLSearchParams({ category, limit: "100", offset: String(offset) });
    if (query.trim()) params.set("q", query.trim());
    if (tag) params.set("tag", tag);
    const response = await fetch(`/api/characters?${params.toString()}`);
    if (!response.ok) { setLoading(false); return; }
    const data = await response.json() as { characters: Character[]; hasMore: boolean };
    setCharacters((current) => reset ? data.characters : [...current, ...data.characters]);
    setHasMore(data.hasMore);
    setLoading(false);
  }

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const timer = window.setTimeout(() => { void load(true); }, 250);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, query, tag]);

  return { characters, category, setCategory, query, setQuery, tag, setTag, hasMore, loading, loadMore: () => load(false) };
}
