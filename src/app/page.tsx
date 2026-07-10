import { HomeCompanionBrowser } from "@/components/character/HomeCompanionBrowser";
import { AppShell } from "@/components/layout/AppShell";
import { getCharactersFromSupabase } from "@/lib/characters-db";

export default async function HomePage() {
  const characters = await getCharactersFromSupabase(3000);

  return (
    <AppShell>
      <HomeCompanionBrowser characters={characters} />
    </AppShell>
  );
}
