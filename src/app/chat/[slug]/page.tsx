import { AppShell } from "@/components/layout/AppShell";
import { ChatShell } from "@/components/chat/ChatShell";
import { PrivateChatLoader } from "@/components/chat/PrivateChatLoader";
import { getCharacterBySlugFromSupabase } from "@/lib/characters-db";

export default async function ChatPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const companion =
    await getCharacterBySlugFromSupabase(slug);

  return (
    <AppShell>
      {companion ? (
        <ChatShell character={companion} />
      ) : (
        <PrivateChatLoader slug={slug} />
      )}
    </AppShell>
  );
}
