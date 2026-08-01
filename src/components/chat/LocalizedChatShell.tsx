"use client";

import { ChatShell } from "@/components/chat/ChatShell";
import { useLocalizedCharacter } from "@/components/character/useLocalizedCharacter";
import type { Character } from "@/types/character";

export function LocalizedChatShell({
  character: baseCharacter
}: {
  character: Character;
}) {
  const { character, language } = useLocalizedCharacter(baseCharacter);

  return (
    <ChatShell
      key={`${character.id}:${language}:${character.tagline}`}
      character={character}
    />
  );
}
