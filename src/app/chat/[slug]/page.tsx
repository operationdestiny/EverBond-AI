import { AppShell } from "@/components/layout/AppShell";
import { LocalizedChatShell } from "@/components/chat/LocalizedChatShell";
import { PrivateChatLoader } from "@/components/chat/PrivateChatLoader";
import { getCharacterBySlugFromSupabase } from "@/lib/characters-db";

export default async function ChatPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const companion = await getCharacterBySlugFromSupabase(slug);

  return (
    <AppShell>
      {companion ? (
        <LocalizedChatShell character={companion} />
      ) : (
        <PrivateChatLoader slug={slug} />
      )}
    </AppShell>
  );
}
