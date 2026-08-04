import Link from "next/link";
import { FavoriteButton } from "@/components/character/FavoriteButton";
import { Character } from "@/types/character";

export function CharacterCard({
  character,
  priority = false
}: {
  character: Character;
  priority?: boolean;
  compact?: boolean;
}) {
  const openingPreview =
    character.openingScenario?.trim() ||
    character.description?.trim() ||
    character.openingMessage?.trim() ||
    character.firstMessage?.trim() ||
    character.tagline;

  return (
    <article className="v18-card group flex h-full flex-col">
      <div className="relative h-[310px] overflow-hidden bg-[#0b0b0e] sm:h-[282px] lg:h-[272px] xl:h-[278px] 2xl:h-[288px]">
        <Link
          href={`/chat/${character.slug}`}
          className="block h-full w-full"
        >
          <img
            src={character.image}
            alt={character.name}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover object-[center_18%] transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent" />
          <span className="absolute bottom-3 right-3 rounded-lg border border-bond-rose/70 bg-bond-rose/75 px-2.5 py-1 text-[11px] font-bold text-white shadow-[0_0_15px_rgba(244,114,182,0.35)]">
            Ever Memory™
          </span>
        </Link>

        <FavoriteButton
          characterId={character.id}
          characterName={character.name}
          characterImage={character.image}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 backdrop-blur transition"
          iconSize={20}
        />
      </div>

      <div className="mt-auto p-3">
        <Link href={`/chat/${character.slug}`} className="block">
          <h3 className="truncate font-display text-base font-bold leading-tight text-white">
            {character.name}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-[2.45rem] break-normal text-[13px] leading-5 text-bond-muted [hyphens:none]">
            {openingPreview}
          </p>
        </Link>

      </div>
    </article>
  );
}
