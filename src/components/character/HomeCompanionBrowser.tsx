"use client";

import { useState } from "react";
import { ChevronDown, Filter, Search, Sparkles } from "lucide-react";
import { Character, CharacterCategory } from "@/types/character";
import { CharacterGrid } from "@/components/character/CharacterGrid";
import { useCharacterBrowser } from "@/components/character/useCharacterBrowser";
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

export function HomeCompanionBrowser({ characters: initial }: { characters: Character[] }) {
  const { t } = useSiteLanguage();
  const browser = useCharacterBrowser(initial);
  const [filter, setFilter] = useState("All");
  const localizedCategories: Record<CharacterCategory, string> = {
    "everbond-girls": t("everbondGirls"), "anime-fantasy": t("animeFantasy"),
    "everbond-guys": t("everbondGuys"), "public-creations": t("publicCreations")
  };
  const activeCategoryLabel = localizedCategories[browser.category];
  return (
    <main className="v18-page">
      <section className="v19-hero-image" aria-label="EverBond EverCoin banner"><LocalizedBannerImage banner="discover" alt="EverBond EverCoin banner" className="v19-hero-image__img" /></section>
      <section>
        <div className="v18-section-row">
          <div className="flex items-center gap-4">
            <h2 className="v22-category-title font-display text-3xl font-bold">{activeCategoryLabel.startsWith("EverBond") ? <><span className="ever">Ever</span><span className="bond">Bond</span><span className="rest">{activeCategoryLabel.replace("EverBond", "")}</span></> : <span className="rest">{activeCategoryLabel}</span>} <Sparkles className="inline text-bond-rose" size={22}/></h2>
            <div className="v18-filter-bar">{filters.map((item)=><button key={item.id} onClick={()=>{setFilter(item.id);browser.setTag(item.id==="All"||item.id==="More"?"":item.id)}} className={`v18-filter-btn ${filter===item.id?"active":""}`}>{item.id==="More"?<>{t(item.key)} <ChevronDown className="inline" size={13}/></>:t(item.key)}</button>)}</div>
          </div>
          <div className="flex gap-3"><div className="v18-search"><Search size={18} className="text-bond-muted"/><input value={browser.query} onChange={(e)=>browser.setQuery(e.target.value)} placeholder={t("searchCharacters")} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-bond-muted"/></div><button className="v18-control flex h-10 w-10 items-center justify-center text-white"><Filter size={18}/></button></div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">{characterCategories.map((item)=><button key={item.id} type="button" onClick={()=>browser.setCategory(item.id)} className={`v20-category-tab ${browser.category===item.id?"active":""}`}>{localizedCategories[item.id]}</button>)}</div>
        <CharacterGrid characters={browser.characters}/>
        {browser.hasMore && <div className="mt-8 text-center"><button disabled={browser.loading} onClick={browser.loadMore} className="rounded-full border border-bond-rose bg-bond-rose px-6 py-2.5 font-semibold text-white disabled:opacity-50">{browser.loading?"Loading…":t("more")}</button></div>}
      </section>
    </main>
  );
}
