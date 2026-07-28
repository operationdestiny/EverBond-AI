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

const visibleFilters = [
  { id: "All", key: "all" },
  { id: "Romance", key: "romance" },
  { id: "Comfort", key: "comfort" },
  { id: "Sweet", key: "sweet" },
  { id: "Protective", key: "protective" },
  { id: "Flirty", key: "flirty" }
] as const;

const additionalFilters: CharacterTag[] = [
  "Fantasy",
  "Gothic",
  "Rival",
  "Mystery",
  "Campus",
  "Mean",
  "Submissive",
  "Adventure",
  "Slice of Life",
  "Sarcastic"
];

export function HomeCompanionBrowser({
  characters: initial
}: {
  characters: Character[];
}) {
  const { t, language } = useSiteLanguage();
  const copy =
    CHARACTER_TOOLS_COPY[language] ?? CHARACTER_TOOLS_COPY.EN;
  const browser = useCharacterBrowser(initial);
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
        aria-label="EverBond EverCoin banner"
      >
        <LocalizedBannerImage
          banner="discover"
          alt="EverBond EverCoin banner"
          className="v19-hero-image__img"
        />
      </section>

      <section>
        <div className="v18-section-row">
          <div className="flex min-w-0 flex-wrap items-center gap-4">
            <h2 className="v22-category-title font-display text-3xl font-bold">
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

            <div className="v18-filter-bar flex flex-wrap">
              {visibleFilters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => chooseFilter(item.id)}
                  className={`v18-filter-btn ${
                    filter === item.id ? "active" : ""
                  }`}
                >
                  {t(item.key)}
                </button>
              ))}

              <button
                type="button"
                onClick={toggleMoreTags}
                className={`v18-filter-btn ${showAllTags ? "active" : ""}`}
              >
                {showAllTags ? copy.fewerTags : copy.moreTags}{" "}
                <ChevronDown
                  className={`inline transition-transform ${
                    showAllTags ? "rotate-180" : ""
                  }`}
                  size={13}
                />
              </button>

              {showAllTags &&
                additionalFilters.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => chooseFilter(tag)}
                    className={`v18-filter-btn ${
                      filter === tag ? "active" : ""
                    }`}
                  >
                    {t(CHARACTER_TAG_KEY_MAP[tag])}
                  </button>
                ))}
            </div>
          </div>

          <div className="flex gap-3">
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
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {characterCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => browser.setCategory(item.id)}
              className={`v20-category-tab ${
                browser.category === item.id ? "active" : ""
              }`}
            >
              {localizedCategories[item.id]}
            </button>
          ))}
        </div>

        <CharacterGrid characters={browser.characters} />

        {browser.hasMore && (
          <div className="mt-8 text-center">
            <button
              type="button"
              disabled={browser.loading}
              onClick={browser.loadMore}
              className="rounded-full border border-bond-rose bg-bond-rose px-6 py-2.5 font-semibold text-white disabled:opacity-50"
            >
              {browser.loading ? "Loading…" : copy.loadMoreCompanions}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
