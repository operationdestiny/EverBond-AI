import { Character, CharacterCategory } from "@/types/character";
import { characters as fallbackCharacters } from "@/lib/characters";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

type CharacterRow = {
  id: string;
  seed_id?: string | null;
  slug: string;
  name: string;
  archetype?: string | null;
  image_url?: string | null;
  image_file?: string | null;
  tagline?: string | null;
  description?: string | null;
  opening_message?: string | null;
  tags?: string[] | null;
  character_card?: Record<string, any> | null;
  visibility?: "public" | "private" | null;
  is_public?: boolean | null;
  official?: boolean | null;
  view_count?: number | null;
  creator_username?: string | null;
  category?: CharacterCategory | string | null;
  section?: string | null;
  voice_gender?: "female" | "male" | "neutral" | null;
  created_at?: string | null;
  relationship_pace?: string | null;
  relationship_context?: string | null;
  ai_profile?: Record<string, any> | null;
  generated_seo?: Record<string, any> | null;
  feature_flags?: Record<string, any> | null;
};

const DEFAULT_IMAGE = "/assets/everbond-icon.png";
const DEFAULT_CATEGORY: CharacterCategory = "everbond-girls";

export function sectionToCategory(value?: string | null): CharacterCategory {
  const raw = (value ?? "").toLowerCase().replace(/&/g, "and");
  const slug = raw.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  if (slug === "everbond-girls") return "everbond-girls";
  if (slug === "anime-and-fantasy" || slug === "anime-fantasy") return "anime-fantasy";
  if (slug === "everbond-guys") return "everbond-guys";
  if (slug === "public-creations" || slug === "public-creations-seed-characters") return "public-creations";

  return DEFAULT_CATEGORY;
}

export function getCharacterImagePath(input: { image_url?: string | null; image_file?: string | null; category?: string | null; section?: string | null }) {
  if (input.image_url) return input.image_url;
  if (!input.image_file) return DEFAULT_IMAGE;
  const category = sectionToCategory(input.category ?? input.section);
  return `/character-assets/${category}/${input.image_file}`;
}

function compactViewCount(value?: number | null): string | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

export function rowToCharacter(row: CharacterRow): Character {
  const fullCard = row.character_card ?? {};
  const aiProfile = row.ai_profile ?? fullCard.ai_profile ?? {};
  const generatedSeo = row.generated_seo ?? fullCard.generated_seo ?? {};
  const relationshipPace = row.relationship_pace ?? fullCard.relationship_pace ?? "Natural";
  const relationshipContext = row.relationship_context ?? fullCard.relationship_context ?? "";
  const tags = Array.isArray(row.tags) ? row.tags : [];
  const category = sectionToCategory(row.category ?? row.section);
  const imageFile = row.image_file ?? fullCard.image_file ?? null;

  return {
    id: row.seed_id ?? row.id,
    name: row.name,
    slug: row.slug || generatedSeo.slug || row.seed_id || row.id,
    archetype: row.archetype || fullCard.role || "Companion",
    category,
    gender: row.voice_gender === "male" ? "male" : row.voice_gender === "neutral" ? "neutral" : "female",
    voiceGender: row.voice_gender ?? (category === "everbond-guys" ? "male" : "female"),
    image: getCharacterImagePath({ image_url: row.image_url, image_file: imageFile, category }),
    imageFile: imageFile ?? undefined,
    tagline: row.tagline || fullCard.title || "",
    description: row.description || fullCard.opening_scenario || "",
    openingMessage: row.opening_message || fullCard.first_message || "",
    tags,
    visibility: row.visibility === "private" ? "private" : "public",
    official: Boolean(row.official),
    viewCount: compactViewCount(row.view_count),
    creatorUsername: row.creator_username ?? undefined,
    createdAt: row.created_at && Date.now() - new Date(row.created_at).getTime() < 24 * 60 * 60 * 1000 ? "today" : "older",
    relationshipContext,
    aiProfile,
    featureFlags: row.feature_flags ?? fullCard.feature_flags ?? {},
    generatedSeo,
    card: {
      name: row.name,
      personality: aiProfile.personality ?? "",
      tone: `${relationshipPace}${aiProfile.affection_style ? ` · ${aiProfile.affection_style}` : ""}`,
      speechStyle: aiProfile.reply_style ?? "Simple, casual, human, and direct.",
      motivations: relationshipContext || row.tagline || fullCard.title || "",
      boundaries: "Stay in character, never speak as an assistant, never narrate the user's actions, and keep the scene emotionally grounded.",
      relationshipStyle: relationshipPace,
      worldContext: fullCard.section ?? row.section ?? String(category),
      exampleDialogue: [row.opening_message || fullCard.first_message].filter(Boolean)
    }
  };
}

function canUseSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const selectColumns = "id,seed_id,slug,name,archetype,image_url,image_file,tagline,description,opening_message,tags,character_card,visibility,is_public,official,view_count,creator_username,category,section,voice_gender,created_at,relationship_pace,relationship_context,ai_profile,generated_seo,feature_flags";

export async function getCharactersFromSupabase(limit = 3000, offset = 0): Promise<Character[]> {
  if (!canUseSupabase()) return fallbackCharacters;

  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("characters")
      .select(selectColumns)
      .eq("is_public", true)
      .order("seed_id", { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (!data || data.length === 0) return fallbackCharacters;
    return (data as CharacterRow[]).map(rowToCharacter);
  } catch (error) {
    console.warn("Falling back to static characters because Supabase character fetch failed:", error);
    return fallbackCharacters;
  }
}

export async function getCharacterBySlugFromSupabase(slug: string): Promise<Character | undefined> {
  if (!canUseSupabase()) return fallbackCharacters.find((character) => character.slug === slug);

  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("characters")
      .select(selectColumns)
      .eq("slug", slug)
      .eq("is_public", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return fallbackCharacters.find((character) => character.slug === slug);
    return rowToCharacter(data as CharacterRow);
  } catch (error) {
    console.warn("Falling back to static character because Supabase character lookup failed:", error);
    return fallbackCharacters.find((character) => character.slug === slug);
  }
}
