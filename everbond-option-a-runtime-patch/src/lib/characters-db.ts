import { Character, CharacterCategory } from "@/types/character";
import { characters as fallbackCharacters } from "@/lib/characters";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export type CharacterQuery = {
  limit?: number;
  offset?: number;
  category?: CharacterCategory;
  query?: string;
  tag?: string;
};

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
  ai_profile?: Record<string, any> | null;
  feature_flags?: Record<string, any> | null;
  generated_seo?: Record<string, any> | null;
  image_file: string;
  image_url: string;
  visibility?: "public" | "private" | "unlisted";
  is_public?: boolean;
  official?: boolean;
  view_count?: number | null;
  creator_username?: string | null;
  created_at?: string | null;
};

const DEFAULT_CATEGORY: CharacterCategory = "everbond-girls";
const selectFields = "id,slug,name,section,category,role,relationship_pace,tags,title,opening_scenario,first_message,relationship_context,ai_profile,feature_flags,generated_seo,image_file,image_url,visibility,is_public,official,view_count,creator_username,created_at";

function normalizeCategory(value?: string | null): CharacterCategory {
  if (value === "anime-fantasy" || value === "everbond-guys" || value === "public-creations" || value === "everbond-girls") return value;
  return DEFAULT_CATEGORY;
}

function compactViewCount(value?: number | null): string | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function rowToCharacter(row: CharacterRow): Character {
  const ai = row.ai_profile ?? {};
  const pace = row.relationship_pace ?? "Natural";
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    archetype: row.role,
    category: normalizeCategory(row.category),
    gender: row.category === "everbond-guys" ? "male" : "female",
    voiceGender: row.category === "everbond-guys" ? "male" : "female",
    image: row.image_url,
    tagline: row.title,
    description: row.opening_scenario,
    openingMessage: row.first_message,
    tags: row.tags ?? [],
    visibility: row.visibility === "private" ? "private" : "public",
    official: Boolean(row.official),
    viewCount: compactViewCount(row.view_count),
    creatorUsername: row.creator_username ?? undefined,
    createdAt: row.created_at && Date.now() - new Date(row.created_at).getTime() < 86_400_000 ? "today" : "older",
    card: {
      name: row.name,
      personality: String(ai.personality ?? ""),
      tone: `${pace}${ai.affection_style ? ` · ${ai.affection_style}` : ""}`,
      speechStyle: String(ai.reply_style ?? "Simple, casual, human, and direct."),
      motivations: row.relationship_context ?? row.title,
      boundaries: "Stay in character, never control the user, and keep the scene emotionally grounded.",
      relationshipStyle: pace,
      worldContext: row.section,
      exampleDialogue: [row.first_message]
    }
  };
}

function canUseSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function queryCharacters(input: CharacterQuery = {}) {
  const limit = Math.min(Math.max(input.limit ?? 100, 1), 100);
  const offset = Math.max(input.offset ?? 0, 0);
  if (!canUseSupabase()) {
    const filtered = fallbackCharacters.filter((item) => !input.category || item.category === input.category);
    return { characters: filtered.slice(offset, offset + limit), hasMore: filtered.length > offset + limit };
  }

  const supabase = getSupabaseServiceClient();
  let query = supabase.from("characters").select(selectFields, { count: "exact" }).eq("is_public", true);
  if (input.category) query = query.eq("category", input.category);
  if (input.tag) query = query.contains("tags", [input.tag]);
  if (input.query?.trim()) {
    const term = input.query.trim().replaceAll(",", " ");
    query = query.or(`name.ilike.%${term}%,title.ilike.%${term}%,opening_scenario.ilike.%${term}%,role.ilike.%${term}%`);
  }
  const { data, error, count } = await query.order("id", { ascending: true }).range(offset, offset + limit - 1);
  if (error) throw error;
  return { characters: (data as CharacterRow[]).map(rowToCharacter), hasMore: typeof count === "number" ? offset + limit < count : (data?.length ?? 0) === limit };
}

export async function getCharactersFromSupabase(limit = 100, offset = 0, category: CharacterCategory = "everbond-girls") {
  return (await queryCharacters({ limit, offset, category })).characters;
}

export async function getCharacterBySlugFromSupabase(slug: string): Promise<Character | undefined> {
  if (!canUseSupabase()) return fallbackCharacters.find((character) => character.slug === slug);
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.from("characters").select(selectFields).eq("slug", slug).eq("is_public", true).maybeSingle();
  if (error) throw error;
  return data ? rowToCharacter(data as CharacterRow) : undefined;
}
