import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const dataDir = path.join(root, "data", "characters");
const assetsDir = path.join(root, "public", "character-assets");
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

const categoryMap = {
  "EverBond Girls": "everbond-girls",
  "Anime & Fantasy": "anime-fantasy",
  "EverBond Guys": "everbond-guys",
  "Public Creations": "public-creations"
};

const required = ["id","image_file","name","section","role","tags","title","opening_scenario","first_message","relationship_context","ai_profile","feature_flags","generated_seo"];
const files = fs.readdirSync(dataDir).filter((file) => file.endsWith(".json")).sort();
const all = [];
const ids = new Set();
const slugs = new Set();

for (const file of files) {
  const parsed = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
  if (!Array.isArray(parsed)) throw new Error(`${file} must contain a JSON array`);
  for (const character of parsed) {
    for (const field of required) if (character[field] === undefined || character[field] === null) throw new Error(`${file}: ${character.id ?? "unknown"} missing ${field}`);
    const slug = character.generated_seo?.slug;
    if (!slug) throw new Error(`${character.id}: generated_seo.slug is required`);
    if (ids.has(character.id)) throw new Error(`Duplicate character id: ${character.id}`);
    if (slugs.has(slug)) throw new Error(`Duplicate character slug: ${slug}`);
    ids.add(character.id);
    slugs.add(slug);

    const category = categoryMap[character.section];
    if (!category) throw new Error(`${character.id}: unsupported section ${character.section}`);
    const assetPath = path.join(assetsDir, category, character.image_file);
    if (!fs.existsSync(assetPath)) throw new Error(`${character.id}: missing image ${assetPath}`);

    all.push({
      id: character.id,
      slug,
      name: character.name,
      section: character.section,
      category,
      role: character.role,
      relationship_pace: character.relationship_pace ?? null,
      tags: character.tags,
      title: character.title,
      opening_scenario: character.opening_scenario,
      first_message: character.first_message,
      relationship_context: character.relationship_context,
      ai_profile: character.ai_profile,
      feature_flags: character.feature_flags,
      generated_seo: character.generated_seo,
      image_file: character.image_file,
      image_url: `/character-assets/${category}/${character.image_file}`,
      visibility: "public",
      is_public: true,
      official: category !== "public-creations",
      creator_username: category === "public-creations" ? null : "everbond"
    });
  }
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
for (let i = 0; i < all.length; i += 200) {
  const batch = all.slice(i, i + 200);
  const { error } = await supabase.from("characters").upsert(batch, { onConflict: "id" });
  if (error) throw error;
  console.log(`Imported ${Math.min(i + batch.length, all.length)}/${all.length}`);
}
console.log(`Done. Imported ${all.length} characters using text primary keys.`);
