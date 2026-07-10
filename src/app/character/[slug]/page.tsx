import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { CharacterProfileShell } from "@/components/character/CharacterProfileShell";
import { getCharacterBySlugFromSupabase } from "@/lib/characters-db";

export default async function CompanionProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const companion = await getCharacterBySlugFromSupabase(slug);
  if (!companion) notFound();

  return (
    <AppShell>
      <CharacterProfileShell character={companion} />
    </AppShell>
  );
}
