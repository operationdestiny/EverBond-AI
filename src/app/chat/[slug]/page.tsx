import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ChatShell } from "@/components/chat/ChatShell";
import { getCharacterBySlugFromSupabase } from "@/lib/characters-db";

export default async function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const companion = await getCharacterBySlugFromSupabase(slug);
  if (!companion) notFound();

  return (
    <AppShell>
      <ChatShell character={companion} />
    </AppShell>
  );
}
