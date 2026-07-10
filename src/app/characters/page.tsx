import { CharactersPageClient } from "@/components/character/CharactersPageClient";
import { AppShell } from "@/components/layout/AppShell";
import { getCharactersFromSupabase } from "@/lib/characters-db";

export default async function CompanionsPage() {
  const characters = await getCharactersFromSupabase(3000);

  return (
    <AppShell>
      <CharactersPageClient characters={characters} />
    </AppShell>
  );
}
