"use client";

import { useEffect, useState } from "react";
import { ChatShell } from "@/components/chat/ChatShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocalizedCharacter } from "@/components/character/useLocalizedCharacter";
import type { Character } from "@/types/character";

export function LocalizedChatShell({
  character: baseCharacter
}: {
  character: Character;
}) {
  const { character: localizedCharacter, language } =
    useLocalizedCharacter(baseCharacter);
  const { session, authReady } = useAuth();
  const [character, setCharacter] = useState(localizedCharacter);

  useEffect(() => {
    setCharacter(localizedCharacter);

    if (!authReady || !session?.access_token) return;

    const controller = new AbortController();

    void fetch(
      `/api/characters/${encodeURIComponent(
        localizedCharacter.slug
      )}?language=${encodeURIComponent(language)}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        cache: "no-store",
        signal: controller.signal
      }
    )
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload?.character) return;
        setCharacter(payload.character as Character);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      });

    return () => controller.abort();
  }, [authReady, language, localizedCharacter, session?.access_token]);

  return (
    <ChatShell
      key={`${character.id}:${language}:${character.tagline}`}
      character={character}
    />
  );
}
