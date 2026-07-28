import Link from "next/link";
import { Eye } from "lucide-react";
import { CreatorLink } from "@/components/character/CreatorLink";
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
  const isPublicCreation =
    character.category === "public-creations";
  const displayViews = isPublicCreation
    ? character.viewCount ?? "1.2k"
    : `${(14 + (character.name.length % 19)).toFixed(1)}K`;

  return (
    <article className="v18-card group">
      <div className="v18-card-image-wrap">
        <Link
          href={`/chat/${character.slug}`}
          className="block h-full w-full"
        >
          <img
            src={character.image}
            alt={character.name}
            loading={priority ? "eager" : "lazy"}
            className="v18-card-image transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-bold text-white">
            <Eye size={14} />
            {displayViews}
          </div>
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

      <div className="p-3">
        <Link href={`/chat/${character.slug}`} className="block">
          <h3 className="truncate font-display text-base font-bold leading-tight text-white">
            {character.name}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-[2.45rem] text-[13px] leading-5 text-bond-muted">
            {character.tagline}
          </p>
        </Link>

        {isPublicCreation &&
          character.creatorUsername && (
            <CreatorLink
              username={character.creatorUsername}
              className="mt-2 inline-flex text-xs"
            />
          )}

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {character.tags
            .filter(
              (tag) => tag !== "Ever Memory™"
            )
            .slice(0, 4)
            .map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-bond-rose/55 bg-bond-rose/15 px-2 py-0.5 text-[10px] text-white"
              >
                {tag.replace(
                  "Ever Memory™",
                  "Memory"
                )}
              </span>
            ))}
        </div>
      </div>
    </article>
  );
}
