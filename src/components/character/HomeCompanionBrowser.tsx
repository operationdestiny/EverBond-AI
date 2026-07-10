"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Filter, Search, Sparkles } from "lucide-react";
import { Character, CharacterCategory } from "@/types/character";
import { CharacterGrid } from "@/components/character/CharacterGrid";
import { characterCategories } from "@/lib/characters";
import { useSiteLanguage } from "@/lib/site-language";
import { LocalizedBannerImage } from "@/components/ui/LocalizedBannerImage";

const filters = [
  { id: "All", key: "all" },
  { id: "Romance", key: "romance" },
  { id: "Comfort", key: "comfort" },
  { id: "Sweet", key: "sweet" },
  { id: "Protective", key: "protective" },
  { id: "Flirty", key: "flirty" },
  { id: "More", key: "more" }
] as const;

export function HomeCompanionBrowser({ characters }: { characters: Character[] }) {
  const { t } = useSiteLanguage();
  const [category, setCategory] = useState<CharacterCategory>("everbond-girls");
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const localizedCategories: Record<CharacterCategory, string> = {
    "everbond-girls": t("everbondGirls"),
    "anime-fantasy": t("animeFantasy"),
    "everbond-guys": t("everbondGuys"),
    "public-creations": t("publicCreations")
  };

  const activeCategoryLabel = localizedCategories[category];

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return characters
      .filter((companion) => companion.category === category)
      .filter((companion) => {
        const text = [companion.name, companion.archetype, companion.tagline, companion.description, ...companion.tags].join(" ").toLowerCase();
        return (!q || text.includes(q)) && (filter === "All" || filter === "More" || text.includes(filter.toLowerCase()));
      });
  }, [characters, category, filter, query]);

  return (
    <main className="v18-page">
      <section className="v19-hero-image" aria-label="EverBond EverCoin banner">
        <LocalizedBannerImage
          banner="discover"
          alt="EverBond EverCoin banner"
          className="v19-hero-image__img"
        />
      </section>

      <section>
        <div className="v18-section-row">
          <div className="flex items-center gap-4">
            <h2 className="v22-category-title font-display text-3xl font-bold">
              {activeCategoryLabel.startsWith("EverBond") ? (
                <>
                  <span className="ever">Ever</span><span className="bond">Bond</span><span className="rest">{activeCategoryLabel.replace("EverBond", "")}</span>
                </>
              ) : (
                <span className="rest">{activeCategoryLabel}</span>
              )} <Sparkles className="inline text-bond-rose" size={22} />
            </h2>

            <div className="v18-filter-bar">
              {filters.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={`v18-filter-btn ${filter === item.id ? "active" : ""}`}
                >
                  {item.id === "More" ? <>{t(item.key)} <ChevronDown className="inline" size={13} /></> : t(item.key)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="v18-search">
              <Search size={18} className="text-bond-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchCharacters")}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-bond-muted"
              />
            </div>
            <button className="v18-control flex h-10 w-10 items-center justify-center text-white">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {characterCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`v20-category-tab ${category === item.id ? "active" : ""}`}
            >
              {localizedCategories[item.id]}
            </button>
          ))}
        </div>

        <CharacterGrid characters={shown.slice(0, 100)} />
      </section>
    </main>
  );
}
