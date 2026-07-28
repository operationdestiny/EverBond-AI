"use client";

import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ChatShell } from "@/components/chat/ChatShell";
import { useSiteLanguage } from "@/lib/site-language";
import { MY_BOND_COPY } from "@/lib/my-bond-language";
import type { Character } from "@/types/character";

export function PrivateChatLoader({
  slug
}: {
  slug: string;
}) {
  const { language } = useSiteLanguage();
  const copy = MY_BOND_COPY[language] ?? MY_BOND_COPY.EN;
  const {
    session,
    authReady,
    openAuthModal
  } = useAuth();

  const [character, setCharacter] =
    useState<Character | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!authReady || !session) {
      setCharacter(null);
      setUnavailable(false);
      return;
    }

    const controller = new AbortController();

    void fetch(`/api/characters/${encodeURIComponent(slug)}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      cache: "no-store",
      signal: controller.signal
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload?.character) {
          setUnavailable(true);
          return;
        }

        setCharacter(payload.character as Character);
        setUnavailable(false);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setUnavailable(true);
      });

    return () => controller.abort();
  }, [authReady, session, slug]);

  if (character) {
    return <ChatShell character={character} />;
  }

  if (!authReady || (session && !unavailable)) {
    return (
      <main className="min-h-screen px-4 py-16 md:px-6">
        <section className="bond-container">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-bond-rose/40 bg-white/[0.035] p-8 text-center shadow-[0_0_44px_rgba(255,92,168,0.10)]">
            <p className="animate-pulse text-bond-muted">
              {copy.privateCompanionLoading}
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen px-4 py-16 md:px-6">
        <section className="bond-container">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-bond-rose/40 bg-white/[0.035] p-8 text-center shadow-[0_0_44px_rgba(255,92,168,0.10)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bond-rose/15 text-bond-rose">
              <LockKeyhole size={30} />
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold text-white">
              {copy.privateCompanionLoginRequired}
            </h1>
            <button
              type="button"
              onClick={openAuthModal}
              className="mt-7 rounded-full bg-bond-rose px-7 py-3 text-sm font-bold text-white"
            >
              {copy.loginSignup}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-16 md:px-6">
      <section className="bond-container">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-bond-rose/40 bg-white/[0.035] p-8 text-center shadow-[0_0_44px_rgba(255,92,168,0.10)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bond-rose/15 text-bond-rose">
            <LockKeyhole size={30} />
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold text-white">
            {copy.privateCompanionUnavailable}
          </h1>
        </div>
      </section>
    </main>
  );
}
