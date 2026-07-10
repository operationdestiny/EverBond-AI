#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const dataDir = path.join(root, "data", "characters");
const publicDir = path.join(root, "public", "character-assets");

function sectionToCategory(section = "") {
  const slug = String(section)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (slug === "anime-and-fantasy" || slug === "anime-fantasy") return "anime-fantasy";
  if (slug === "everbond-girls") return "everbond-girls";
  if (slug === "everbond-guys") return "everbond-guys";
  if (slug === "public-creations" || slug === "public-creations-seed-characters") return "public-creations";
  return slug;
}

function requireString(character, field) {
  if (typeof character[field] !== "string" || !character[field].trim()) {
    throw new Error(`${character.id || "unknown"} missing required string field: ${field}`);
  }
}

function validateCharacter(character) {
  for (const field of [
    "id",
    "image_file",
    "name",
    "section",
    "role",
    "relationship_pace",
    "title",
    "opening_scenario",
    "first_message",
    "relationship_context"
  ]) {
    requireString(character, field);
  }

  if (!Array.isArray(character.tags)) throw new Error(`${character.id} tags must be an array`);
  if (!character.ai_profile || typeof character.ai_profile !== "object") throw new Error(`${character.id} missing ai_profile`);
  if (!character.feature_flags || typeof character.feature_flags !== "object") throw new Error(`${character.id} missing feature_flags`);
  if (!character.generated_seo || typeof character.generated_seo !== "object") throw new Error(`${character.id} missing generated_seo`);
  if (!character.generated_seo.slug) throw new Error(`${character.id} missing generated_seo.slug`);

  const category = sectionToCategory(character.section);
  const imagePath = path.join(publicDir, category, character.image_file);
  if (!fs.existsSync(imagePath)) {
    throw new Error(`${character.id} missing image: public/character-assets/${category}/${character.image_file}`);
  }

  return { category, imagePath };
}

function voiceGenderForCategory(category) {
  return category === "everbond-guys" ? "male" : "female";
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const files = fs.readdirSync(dataDir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  if (!files.length) throw new Error("No JSON files found in data/characters.");

  const ids = new Set();
  const slugs = new Set();
  const rows = [];

  for (const file of files) {
    const fullPath = path.join(dataDir, file);
    const characters = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    if (!Array.isArray(characters)) throw new Error(`${file} must contain a JSON array`);

    for (const character of characters) {
      const { category } = validateCharacter(character);
      const slug = character.generated_seo.slug;

      if (ids.has(character.id)) throw new Error(`Duplicate character id: ${character.id}`);
      if (slugs.has(slug)) throw new Error(`Duplicate character slug: ${slug}`);
      ids.add(character.id);
      slugs.add(slug);

      const isPublicCreation = category === "public-creations";

      rows.push({
        seed_id: character.id,
        slug,
        name: character.name,
        archetype: character.role,
        image_file: character.image_file,
        image_url: `/character-assets/${category}/${character.image_file}`,
        tagline: character.title,
        description: character.opening_scenario,
        opening_message: character.first_message,
        tags: character.tags,
        character_card: character,
        relationship_pace: character.relationship_pace,
        relationship_context: character.relationship_context,
        ai_profile: character.ai_profile,
        generated_seo: character.generated_seo,
        feature_flags: character.feature_flags,
        category,
        section: character.section,
        official: !isPublicCreation,
        is_seed: true,
        is_public: true,
        visibility: "public",
        creator_username: isPublicCreation ? "community" : "everbond",
        voice_gender: voiceGenderForCategory(category)
      });
    }
  }

  console.log(`Validated ${rows.length} characters across ${files.length} category files.`);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const chunkSize = 200;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from("characters")
      .upsert(chunk, { onConflict: "seed_id" });

    if (error) throw error;
    console.log(`Imported ${Math.min(i + chunk.length, rows.length)} / ${rows.length}`);
  }

  console.log("EverBond character import complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
