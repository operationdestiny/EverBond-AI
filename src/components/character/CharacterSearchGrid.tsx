"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Character } from "@/types/character";
import { CharacterGrid } from "@/components/character/CharacterGrid";
import { useSiteLanguage } from "@/lib/site-language";

const filters = ["Romance", "Fantasy", "Gothic", "Comfort", "Rival", "Mystery", "Campus", "Mean", "Submissive", "Protective", "Adventure", "Slice of Life", "Sarcastic"] as const;

const filterKeyMap: Record<(typeof filters)[number], string> = {
  Romance: "romance",
  Fantasy: "fantasy",
  Gothic: "gothic",
  Comfort: "comfort",
  Rival: "rival",
  Mystery: "mystery",
  Campus: "campus",
  Mean: "mean",
  Submissive: "submissive",
  Protective: "protective",
  Adventure: "adventure",
  "Slice of Life": "sliceOfLife",
  Sarcastic: "sarcastic"
};

export function CharacterSearchGrid({ characters }: { characters: Character[] }) {
  const { t } = useSiteLanguage();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return characters.filter((character) => {
      const text = [character.name, character.archetype, character.tagline, character.description, ...character.tags].join(" ").toLowerCase();
      return (!q || text.includes(q)) && (!active || text.includes(active.toLowerCase()));
    });
  }, [characters, query, active]);

  return (
    <div>
      <div className="mx-auto mb-6 max-w-3xl">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3">
          <Search size={18} className="text-bond-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchCharactersBy")}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-bond-muted"
          />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActive(active === filter ? null : filter)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                active === filter
                  ? "border-bond-rose bg-bond-rose text-white"
                  : "border-bond-rose/45 bg-white/[0.03] text-bond-muted hover:border-bond-rose/70 hover:text-white"
              }`}
            >
              {t(filterKeyMap[filter])}
            </button>
          ))}
        </div>
      </div>
      <CharacterGrid characters={filtered} compact />
      {filtered.length === 0 && (
        <div className="bond-card mx-auto mt-10 max-w-lg rounded-[2rem] p-8 text-center">
          <p className="font-display text-2xl font-bold">{t("noCharactersFound")}</p>
          <p className="mt-3 text-sm text-bond-muted">{t("tryDifferentName")}</p>
        </div>
      )}
    </div>
  );
}
