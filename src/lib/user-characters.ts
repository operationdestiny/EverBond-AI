import { Character, CharacterCategory } from "@/types/character";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

type JsonObject = Record<string, unknown>;

type CharacterRow = {
  id: string;
  slug: string;
  name: string;
  section: string;
  category: CharacterCategory | string;
  role: string;
  relationship_pace?: string | null;
  tags?: string[] | null;
  title: string;
  opening_scenario: string;
  first_message: string;
  relationship_context?: string | null;
  ai_profile?: JsonObject | null;
  feature_flags?: JsonObject | null;
  generated_seo?: JsonObject | null;
  quality_control?: JsonObject | null;
  image_file: string;
  image_storage_bucket?: string | null;
  image_storage_path?: string | null;
  image_url: string;
  visibility?: "public" | "private" | "unlisted";
  is_public?: boolean;
  official?: boolean;
  view_count?: number | null;
  favorite_count?: number | null;
  display_order?: number | null;
  creator_id?: string | null;
  creator_username?: string | null;
  is_active?: boolean;
  created_at?: string | null;
};

const DEFAULT_CATEGORY: CharacterCategory = "everbond-girls";

const selectFields =
  "id,slug,name,section,category,role,relationship_pace,tags,title,opening_scenario,first_message,relationship_context,ai_profile,feature_flags,generated_seo,quality_control,image_file,image_storage_bucket,image_storage_path,image_url,visibility,is_public,official,view_count,favorite_count,display_order,creator_id,creator_username,is_active,created_at";

function normalizeCategory(value?: string | null): CharacterCategory {
  if (
    value === "anime-fantasy" ||
    value === "everbond-guys" ||
    value === "public-creations" ||
    value === "everbond-girls"
  ) {
    return value;
  }

  return DEFAULT_CATEGORY;
}

function compactViewCount(value?: number | null): string | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function stringFrom(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function arrayFrom(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function characterImageFromRow(row: CharacterRow) {
  if (row.image_url && row.image_url.trim()) return row.image_url;

  const category = normalizeCategory(row.category);

  if (row.image_storage_path && row.image_storage_path.trim()) {
    return `/character-assets/${row.image_storage_path}`;
  }

  return `/character-assets/${category}/${row.image_file}`;
}

function rowToCharacter(row: CharacterRow): Character {
  const ai = row.ai_profile ?? {};
  const visual = (ai.visual_identity ?? {}) as JsonObject;
  const core = (ai.personality_core ?? {}) as JsonObject;
  const dynamic = (ai.romantic_dynamic ?? {}) as JsonObject;
  const speech = (ai.speech_style ?? {}) as JsonObject;

  const pace = row.relationship_pace ?? "Natural";
  const category = normalizeCategory(row.category);

  const traits = arrayFrom(core.traits);
  const flaws = arrayFrom(core.flaws);
  const petNames = arrayFrom(speech.pet_names);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    archetype: row.role,
    category,
    gender: category === "everbond-guys" ? "male" : "female",
    voiceGender: category === "everbond-guys" ? "male" : "female",
    image: characterImageFromRow(row),
    imageFile: row.image_file,
    tagline: row.title,
    description: row.opening_scenario,
    openingMessage: row.first_message,
    tags: row.tags ?? [],
    visibility: row.visibility === "private" ? "private" : "public",
    official: Boolean(row.official),
    viewCount: compactViewCount(row.view_count),
    creatorUsername: row.creator_username ?? undefined,
    createdAt:
      row.created_at && Date.now() - new Date(row.created_at).getTime() < 86_400_000
        ? "today"
        : "older",

    section: row.section,
    role: row.role,
    relationshipPace: pace,
    title: row.title,
    openingScenario: row.opening_scenario,
    firstMessage: row.first_message,
    relationshipContext: row.relationship_context ?? undefined,
    aiProfile: ai,
    featureFlags: row.feature_flags ?? undefined,
    generatedSeo: row.generated_seo ?? undefined,
    qualityControl: row.quality_control ?? undefined,

    card: {
      name: row.name,
      personality: [
        traits.length ? traits.join(", ") : "",
        flaws.length ? `Flaws: ${flaws.join(", ")}` : "",
        stringFrom(core.emotional_need)
      ]
        .filter(Boolean)
        .join(" · "),
      tone: [
        pace,
        stringFrom(dynamic.starting_bond),
        stringFrom(dynamic.tension_type),
        stringFrom(dynamic.affection_style)
      ]
        .filter(Boolean)
        .join(" · "),
      speechStyle:
        [
          stringFrom(speech.voice),
          stringFrom(speech.sentence_style),
          petNames.length ? `Pet names: ${petNames.join(", ")}` : ""
        ]
          .filter(Boolean)
          .join(" · ") || "Natural, emotional, in-character dialogue.",
      motivations: row.relationship_context ?? row.title,
      boundaries:
        "Stay in character, never control the user, and keep the scene emotionally grounded.",
      relationshipStyle: [pace, stringFrom(dynamic.conflict_style)]
        .filter(Boolean)
        .join(" · "),
      worldContext: [row.section, stringFrom(visual.setting), stringFrom(visual.mood)]
        .filter(Boolean)
        .join(" · "),
      exampleDialogue: [row.first_message, ...arrayFrom(ai.sample_dialogue)].filter(Boolean)
    }
  };
}

function canUseSupabase() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function getCharacterBySlugForUser(
  slug: string,
  userId?: string | null
): Promise<Character | undefined> {
  if (!canUseSupabase()) return undefined;

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("characters")
    .select(selectFields)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;

  const row = data as CharacterRow;
  const isPublic =
    row.is_public === true && row.visibility === "public";
  const isPrivateOwner =
    row.visibility === "private" &&
    Boolean(userId) &&
    row.creator_id === userId;

  if (!isPublic && !isPrivateOwner) {
    return undefined;
  }

  return rowToCharacter(row);
}

export async function getPublicCharactersByCreatorUsername(
  username: string,
  limit = 100
): Promise<Character[]> {
  if (!canUseSupabase()) return [];

  const normalizedUsername = username.trim().toLowerCase();
  if (!normalizedUsername) return [];

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("characters")
    .select(selectFields)
    .eq("creator_username", normalizedUsername)
    .eq("is_public", true)
    .eq("is_active", true)
    .eq("visibility", "public")
    .order("updated_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));

  if (error) throw error;

  return ((data ?? []) as CharacterRow[]).map(rowToCharacter);
}
