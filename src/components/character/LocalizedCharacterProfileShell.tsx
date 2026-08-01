"use client";

import { CharacterProfileShell } from "@/components/character/CharacterProfileShell";
import { useLocalizedCharacter } from "@/components/character/useLocalizedCharacter";
import type { Character } from "@/types/character";

export function LocalizedCharacterProfileShell({
  character: baseCharacter
}: {
  character: Character;
}) {
  const { character, language } = useLocalizedCharacter(baseCharacter);

  return (
    <CharacterProfileShell
      key={`${character.id}:${language}`}
      character={character}
    />
  );
}
