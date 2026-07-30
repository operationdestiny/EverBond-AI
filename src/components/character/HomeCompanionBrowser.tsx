"use client";

import { useState } from "react";
import { ChevronDown, Filter, Search, Sparkles } from "lucide-react";
import { Character, CharacterCategory } from "@/types/character";
import { CharacterGrid } from "@/components/character/CharacterGrid";
import { useCharacterBrowser } from "@/components/character/useCharacterBrowser";
import { characterCategories } from "@/lib/characters";
import { useSiteLanguage } from "@/lib/site-language";
import { LocalizedBannerImage } from "@/components/ui/LocalizedBannerImage";
import { CHARACTER_TAG_KEY_MAP, type CharacterTag } from "@/lib/character-tags";
import { CHARACTER_TOOLS_COPY } from "@/lib/character-tools-language";
import { DISCOVER_COPY } from "@/lib/discover-language";

const visibleFilters = [
  { id: "All", key: "all" },
  { id: "Romance", key: "romance" },
  { id: "Comfort", key: "comfort" },
  { id: "Protective", key: "protective" },
  { id: "Flirty", key: "flirty" }
] as const;

const additionalFilters: CharacterTag[] = [
  "Fantasy",
  "Gothic",
  "Rival",
  "Mystery",
  "Campus",
  "Adventure",
  "Slice of Life"
];

export function HomeCompanionBrowser({
  characters: initial
}: {
  characters: Character[];
}) {
  const { t, language } = useSiteLanguage();
  const copy =
    CHARACTER_TOOLS_COPY[language] ?? CHARACTER_TOOLS_COPY.EN;
  const discoverCopy = DISCOVER_COPY[language] ?? DISCOVER_COPY.EN;
  const browser = useCharacterBrowser(initial, "everbond-girls", language);
  const [filter, setFilter] = useState("All");
  const [showAllTags, setShowAllTags] = useState(false);

  const localizedCategories: Record<CharacterCategory, string> = {
    "everbond-girls": t("everbondGirls"),
    "anime-fantasy": t("animeFantasy"),
    "everbond-guys": t("everbondGuys"),
    "public-creations": t("publicCreations")
  };

  const activeCategoryLabel = localizedCategories[browser.category];

  function chooseFilter(id: string) {
    setFilter(id);
    browser.setTag(id === "All" ? "" : id);
  }

  function toggleMoreTags() {
    if (showAllTags && additionalFilters.includes(filter as CharacterTag)) {
      setFilter("All");
      browser.setTag("");
    }

    setShowAllTags((current) => !current);
  }

  return (
    <main className="v18-page">
      <section
        className="v19-hero-image"
        aria-label={discoverCopy.bannerLabel}
      >
        <LocalizedBannerImage
          banner="discover"
          alt={discoverCopy.bannerLabel}
          className="v19-hero-image__img"
        />
      </section>

      <section>
        <div className="grid min-w-0 gap-x-4 gap-y-3 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-center">
          <h2 className="v22-category-title shrink-0 font-display text-3xl font-bold">
            {activeCategoryLabel.startsWith("EverBond") ? (
              <>
                <span className="ever">Ever</span>
                <span className="bond">Bond</span>
                <span className="rest">
                  {activeCategoryLabel.replace("EverBond", "")}
                </span>
              </>
            ) : (
              <span className="rest">{activeCategoryLabel}</span>
            )}{" "}
            <Sparkles className="inline text-bond-rose" size={22} />
          </h2>

          <div className="v18-filter-bar no-scrollbar flex min-w-0 flex-nowrap overflow-x-auto">
            {visibleFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseFilter(item.id)}
                className={`v18-filter-btn shrink-0 ${
                  filter === item.id ? "active" : ""
                }`}
              >
                {t(item.key)}
              </button>
            ))}

            <button
              type="button"
              onClick={toggleMoreTags}
              className={`v18-filter-btn shrink-0 ${
                showAllTags ? "active" : ""
              }`}
              aria-expanded={showAllTags}
            >
              {showAllTags ? copy.fewerTags : copy.moreTags}{" "}
              <ChevronDown
                className={`inline transition-transform ${
                  showAllTags ? "rotate-180" : ""
                }`}
                size={13}
              />
            </button>
          </div>

          <div className="flex gap-3 xl:justify-self-end">
            <div className="v18-search">
              <Search size={18} className="text-bond-muted" />
              <input
                value={browser.query}
                onChange={(event) => browser.setQuery(event.target.value)}
                placeholder={t("searchCharacters")}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-bond-muted"
              />
            </div>
            <button
              type="button"
              className="v18-control flex h-10 w-10 items-center justify-center text-white"
            >
              <Filter size={18} />
            </button>
          </div>

          <div className="mb-3 flex min-w-0 flex-wrap items-start gap-2 xl:col-span-2">
            {characterCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => browser.setCategory(item.id)}
                className={`v20-category-tab shrink-0 ${
                  browser.category === item.id ? "active" : ""
                }`}
              >
                {localizedCategories[item.id]}
              </button>
            ))}

            {showAllTags && (
              <div className="flex min-w-[18rem] flex-1 flex-wrap gap-1.5 xl:pl-2">
                {additionalFilters.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => chooseFilter(tag)}
                    className={`v18-filter-btn shrink-0 ${
                      filter === tag ? "active" : ""
                    }`}
                  >
                    {t(CHARACTER_TAG_KEY_MAP[tag])}
                  </button>
                ))}
              </div>
            )}
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
              {browser.loading ? discoverCopy.loading : copy.loadMoreCompanions}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
