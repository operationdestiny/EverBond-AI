"use client";

import { LoaderCircle } from "lucide-react";
import { ChatShell } from "@/components/chat/ChatShell";
import { useLocalizedCharacter } from "@/components/character/useLocalizedCharacter";
import { DISCOVER_COPY } from "@/lib/discover-language";
import type { Character } from "@/types/character";

export function LocalizedChatShell({
  character: baseCharacter
}: {
  character: Character;
}) {
  const { character, language, loading } =
    useLocalizedCharacter(baseCharacter);
  const copy = DISCOVER_COPY[language] ?? DISCOVER_COPY.EN;

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-64px)] px-4 py-16 md:px-6">
        <section className="bond-container">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-bond-rose/35 bg-white/[0.035] p-10 text-center text-bond-muted">
            <LoaderCircle className="mx-auto mb-4 animate-spin text-bond-rose" />
            {copy.translatingCharacters}
          </div>
        </section>
      </main>
    );
  }

  return (
    <ChatShell
      key={`${character.id}:${language}`}
      character={character}
    />
  );
}
