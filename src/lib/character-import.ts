import { CharacterCategory } from "@/types/character";

export type EverBondCharacterInput = {
  id: string;
  image_file: string;
  name: string;
  section: string;
  role: string;
  relationship_pace: string;
  tags: string[];
  title: string;
  opening_scenario: string;
  first_message: string;
  relationship_context: string;
  ai_profile: {
    personality: string;
    reply_style: string;
    affection_style: string;
    conflict_style: string;
    memory_focus: string;
  };
  feature_flags: Record<string, boolean>;
  generated_seo: {
    slug: string;
    seo_title: string;
    seo_description: string;
    search_terms: string[];
  };
};

export function sectionToCategory(section: string): CharacterCategory {
  const normalized = section.toLowerCase();
  if (normalized.includes("anime") || normalized.includes("fantasy")) return "anime-fantasy";
  if (normalized.includes("guys")) return "everbond-guys";
  if (normalized.includes("public")) return "public-creations";
  return "everbond-girls";
}

export function imagePathForCharacter(character: EverBondCharacterInput) {
  return `/character-assets/${sectionToCategory(character.section)}/${character.image_file}`;
}

export function toDatabaseCharacter(character: EverBondCharacterInput) {
  const category = sectionToCategory(character.section);
  const official = category !== "public-creations";

  return {
    seed_id: character.id,
    slug: character.generated_seo.slug,
    name: character.name,
    archetype: character.role,
    image_url: imagePathForCharacter(character),
    tagline: character.title,
    description: character.opening_scenario,
    opening_message: character.first_message,
    tags: character.tags,
    relationship_pace: character.relationship_pace,
    ai_profile: character.ai_profile,
    generated_seo: character.generated_seo,
    feature_flags: character.feature_flags,
    character_card: {
      relationship_pace: character.relationship_pace,
      relationship_context: character.relationship_context,
      ai_profile: character.ai_profile,
      feature_flags: character.feature_flags,
      seo: character.generated_seo,
      source_schema: "everbond-character-v2"
    },
    is_seed: true,
    visibility: "public",
    is_public: true,
    category,
    official,
    voice_gender: category === "everbond-guys" ? "male" : "female",
    creator_username: official ? "everbond" : "creator"
  };
}
