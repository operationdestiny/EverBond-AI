"use client";

import Link from "next/link";
import { Flag, RefreshCcw, Share2, Star } from "lucide-react";
import { CreatorLink } from "@/components/character/CreatorLink";
import { Character } from "@/types/character";
import { useSiteLanguage } from "@/lib/site-language";

export function CharacterProfileShell({ character }: { character: Character }) {
  const { t } = useSiteLanguage();

  function shareCompanion() {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: `${character.name} on EverBond AI`, text: character.description, url }).catch(() => undefined);
    else navigator.clipboard?.writeText(url);
  }

  const displayTags = character.tags.filter((tag) => tag !== "Ever Memory™").slice(0, 4);
  const similarTag = character.tags.find((item) => item !== "Ever Memory™") ?? "Romance";
  const similarHref = `/characters?tag=${encodeURIComponent(similarTag)}`;
  const showCreator =
    character.category === "public-creations" &&
    character.visibility !== "private" &&
    Boolean(character.creatorUsername);

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-10 md:px-6">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[420px_1fr]">
        <div>
          <div className="overflow-hidden rounded-[2rem] border border-bond-rose/25 bg-white/[0.035] shadow-[0_0_34px_rgba(255,92,168,0.08)]">
            <img src={character.image} alt={character.name} className="aspect-[4/5] w-full object-cover" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {displayTags.map((tag) => (
              <span key={tag} className="rounded-full border border-bond-rose/55 bg-black/30 px-3 py-1.5 text-xs text-bond-muted">{tag}</span>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="rounded-[2rem] border border-bond-rose/35 bg-white/[0.035] p-6 shadow-[0_0_34px_rgba(255,92,168,0.08)] md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="rounded-full border border-bond-rose/70 bg-black/35 px-6 py-3 text-center font-display text-3xl font-bold leading-tight text-white shadow-[0_0_18px_rgba(255,92,168,0.10)] md:text-4xl">
                {character.name}
              </h1>

              <div className="flex items-center gap-2">
                <button className="bond-pink-button flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] text-white" aria-label={t("save")}>
                  <Star size={17} />
                </button>
                <button onClick={shareCompanion} className="bond-pink-button flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] text-white" aria-label={t("share")}>
                  <Share2 size={17} />
                </button>
                <Link href={`/chat/${character.slug}`} className="bond-pink-button flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] text-white" aria-label={t("refresh")}>
                  <RefreshCcw size={17} />
                </Link>
                <button className="bond-pink-button flex h-10 w-10 items-center justify-center rounded-full border border-bond-rose/70 bg-bond-rose/10 text-white" aria-label={t("report")}>
                  <Flag size={17} />
                </button>
              </div>
            </div>

            {showCreator && character.creatorUsername && (
              <CreatorLink
                username={character.creatorUsername}
                className="mt-5 inline-flex text-sm"
              />
            )}

            <p className="mt-6 text-base leading-8 text-bond-muted">
              {character.description}
            </p>

            <div className="mt-6 rounded-[1.5rem] border border-bond-rose/55 bg-black/25 p-5 text-sm leading-7 text-bond-text">
              {character.openingMessage}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/chat/${character.slug}`} className="bond-pink-button inline-flex rounded-full bg-bond-rose px-7 py-3 text-sm font-bold text-white shadow-[0_0_18px_rgba(255,92,168,0.18)]">
                {t("startChatting")}
              </Link>
              <Link href={similarHref} className="bond-pink-button inline-flex rounded-full border border-bond-rose/70 bg-black/35 px-7 py-3 text-sm font-bold text-white shadow-[0_0_14px_rgba(255,92,168,0.08)] transition hover:bg-bond-rose/10">
                {t("similarCompanions")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
