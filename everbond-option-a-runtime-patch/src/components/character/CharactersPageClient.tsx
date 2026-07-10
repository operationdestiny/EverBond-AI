"use client";

import { Search } from "lucide-react";
import { Character, CharacterCategory } from "@/types/character";
import { CharacterGrid } from "@/components/character/CharacterGrid";
import { characterCategories } from "@/lib/characters";
import { useSiteLanguage } from "@/lib/site-language";
import { useCharacterBrowser } from "@/components/character/useCharacterBrowser";

const filters = ["Romance","Fantasy","Gothic","Comfort","Rival","Mystery","Campus","Mean","Submissive","Protective","Adventure","Slice of Life","Sarcastic"];
const categoryKeyMap: Record<CharacterCategory, string> = { "everbond-girls":"everbondGirls", "anime-fantasy":"animeFantasy", "everbond-guys":"everbondGuys", "public-creations":"publicCreations" };

export function CharactersPageClient({ characters: initial }: { characters: Character[] }) {
  const { t } = useSiteLanguage();
  const browser = useCharacterBrowser(initial);
  return (
    <main className="px-4 py-6 md:px-6">
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {characterCategories.map((item) => <button key={item.id} onClick={() => browser.setCategory(item.id)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${browser.category === item.id ? "border-bond-rose bg-bond-rose text-white" : "border-bond-rose/45 bg-white/[0.03] text-bond-muted hover:border-bond-rose/70 hover:text-white"}`}>{t(categoryKeyMap[item.id])}</button>)}
      </div>
      <div className="mx-auto mb-6 max-w-4xl">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3"><Search size={18} className="text-bond-muted"/><input value={browser.query} onChange={(e)=>browser.setQuery(e.target.value)} placeholder={t("searchCompanions")} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-bond-muted"/></div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">{filters.map((filter)=><button key={filter} onClick={()=>browser.setTag(browser.tag===filter?"":filter)} className={`rounded-full border px-3.5 py-1.5 text-sm transition ${browser.tag===filter?"border-bond-rose bg-bond-rose text-white":"border-bond-rose/45 bg-white/[0.03] text-bond-muted hover:border-bond-rose/70 hover:text-white"}`}>{filter}</button>)}</div>
      </div>
      <CharacterGrid characters={browser.characters}/>
      {browser.hasMore && <div className="mt-8 text-center"><button disabled={browser.loading} onClick={browser.loadMore} className="rounded-full border border-bond-rose bg-bond-rose px-6 py-2.5 font-semibold text-white disabled:opacity-50">{browser.loading ? "Loading…" : "More"}</button></div>}
      <p className="pt-10 text-center font-display text-2xl font-bold text-bond-rose">{t("moreExcitingCompanionsComing")}</p>
    </main>
  );
}
