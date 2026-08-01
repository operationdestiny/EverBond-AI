import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { LocalizedChatShell } from "@/components/chat/LocalizedChatShell";
import { PrivateChatLoader } from "@/components/chat/PrivateChatLoader";
import { getLinkAccessibleCharacterBySlugFromSupabase } from "@/lib/characters-db";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const companion =
    await getLinkAccessibleCharacterBySlugFromSupabase(slug);

  if (!companion) {
    return {
      title: "EverBond Chat",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const isShareByLink = companion.visibility === "unlisted";

  return {
    title: `Chat with ${companion.name} — EverBond`,
    robots: isShareByLink
      ? {
          index: false,
          follow: false,
          noarchive: true,
          noimageindex: true
        }
      : undefined
  };
}

export default async function ChatPage({ params }: PageProps) {
  const { slug } = await params;
  const companion =
    await getLinkAccessibleCharacterBySlugFromSupabase(slug);

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
