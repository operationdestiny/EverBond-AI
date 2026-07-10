import { CharacterGrid } from "@/components/character/CharacterGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { featuredCharacters } from "@/lib/characters";

export function FeaturedCharacters() {
  return (
    <section className="py-16">
      <div className="bond-container">
        <SectionHeader
          eyebrow="Featured bonds"
          title="Meet companions built for quality and loyalty."
        />
        <CharacterGrid characters={featuredCharacters.slice(0, 8)} />
      </div>
    </section>
  );
}
