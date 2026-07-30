"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import {
  Character,
  CharacterCategory
} from "@/types/character";
import { CharacterGrid } from "@/components/character/CharacterGrid";
import { characterCategories } from "@/lib/characters";
import { useSiteLanguage } from "@/lib/site-language";
import { useCharacterBrowser } from "@/components/character/useCharacterBrowser";
import {
  ADDITIONAL_CHARACTER_TAGS,
  CHARACTER_TAG_KEY_MAP,
  VISIBLE_CHARACTER_TAGS
} from "@/lib/character-tags";
import { CHARACTER_TOOLS_COPY } from "@/lib/character-tools-language";
import { DISCOVER_COPY } from "@/lib/discover-language";

const categoryKeyMap: Record<
  CharacterCategory,
  string
> = {
  "everbond-girls": "everbondGirls",
  "anime-fantasy": "animeFantasy",
  "everbond-guys": "everbondGuys",
  "public-creations": "publicCreations"
};

const hiddenDiscoverTags = new Set<string>([
  "Sweet",
  "Mean",
  "Submissive",
  "Sarcastic"
]);

export function CharactersPageClient({
  characters: initial
}: {
  characters: Character[];
}) {
  const { t, language } = useSiteLanguage();
  const copy =
    CHARACTER_TOOLS_COPY[language] ??
    CHARACTER_TOOLS_COPY.EN;
  const discoverCopy = DISCOVER_COPY[language] ?? DISCOVER_COPY.EN;
  const browser = useCharacterBrowser(initial, "everbond-girls", language);
  const [showAllTags, setShowAllTags] =
    useState(false);

  const displayedTags = (showAllTags
    ? [
        ...VISIBLE_CHARACTER_TAGS,
        ...ADDITIONAL_CHARACTER_TAGS
      ]
    : [...VISIBLE_CHARACTER_TAGS]
  ).filter((tag) => !hiddenDiscoverTags.has(tag));

  return (
    <main className="px-4 py-6 md:px-6">
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {characterCategories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              browser.setCategory(item.id)
            }
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              browser.category === item.id
                ? "border-bond-rose bg-bond-rose text-white"
                : "border-bond-rose/45 bg-white/[0.03] text-bond-muted hover:border-bond-rose/70 hover:text-white"
            }`}
          >
            {t(categoryKeyMap[item.id])}
          </button>
        ))}
      </div>

      <div className="mx-auto mb-6 max-w-4xl">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3">
          <Search
            size={18}
            className="text-bond-muted"
          />
          <input
            value={browser.query}
            onChange={(event) =>
              browser.setQuery(event.target.value)
            }
            placeholder={t("searchCompanions")}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-bond-muted"
          />
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {displayedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                browser.setTag(
                  browser.tag === tag ? "" : tag
                )
              }
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                browser.tag === tag
                  ? "border-bond-rose bg-bond-rose text-white"
                  : "border-bond-rose/45 bg-white/[0.03] text-bond-muted hover:border-bond-rose/70 hover:text-white"
              }`}
            >
              {t(CHARACTER_TAG_KEY_MAP[tag])}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              if (
                showAllTags &&
                ADDITIONAL_CHARACTER_TAGS.includes(
                  browser.tag as (typeof ADDITIONAL_CHARACTER_TAGS)[number]
                )
              ) {
                browser.setTag("");
              }

              setShowAllTags(
                (current) => !current
              );
            }}
            className="rounded-full border border-bond-rose/70 bg-bond-rose/10 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-bond-rose/20"
          >
            {showAllTags
              ? copy.fewerTags
              : copy.moreTags}
          </button>
        </div>
      </div>

      {browser.loading && browser.characters.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] px-6 py-12 text-center text-bond-muted">
          {discoverCopy.translatingCharacters}
        </div>
      ) : (
        <CharacterGrid characters={browser.characters} />
      )}

      {browser.hasMore && (
        <div className="mt-8 text-center">
          <button
            type="button"
            disabled={browser.loading}
            onClick={browser.loadMore}
            className="rounded-full border border-bond-rose bg-bond-rose px-6 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {browser.loading
              ? discoverCopy.loading
              : copy.loadMoreCompanions}
          </button>
        </div>
      )}
    </main>
  );
}
