import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LocalizedCharacterProfileShell } from "@/components/character/LocalizedCharacterProfileShell";
import { getCharacterBySlugFromSupabase } from "@/lib/characters-db";

export default async function CompanionProfilePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const companion = await getCharacterBySlugFromSupabase(slug);

  if (!companion) notFound();

  return (
    <AppShell>
      <LocalizedCharacterProfileShell character={companion} />
    </AppShell>
  );
}
