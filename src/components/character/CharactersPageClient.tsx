"use client";

import { CharacterTabsGrid } from "@/components/character/CharacterTabsGrid";
import { Character } from "@/types/character";
import { useSiteLanguage } from "@/lib/site-language";

export function CharactersPageClient({ characters }: { characters: Character[] }) {
  const { t } = useSiteLanguage();

  return (
    <main className="px-4 py-6 md:px-6">
      <CharacterTabsGrid characters={characters} />
      <p className="pt-10 text-center font-display text-2xl font-bold text-bond-rose">{t("moreExcitingCompanionsComing")}</p>
    </main>
  );
}
