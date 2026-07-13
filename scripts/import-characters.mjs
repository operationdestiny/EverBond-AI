#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  loadEnvFiles,
  CATEGORY_OUTPUTS,
  validatePremiumRecord,
  slugify
} from "./_premium-raw-library.mjs";

loadEnvFiles();

const root = process.cwd();
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = String(process.env.CHARACTER_IMPORT_DRY_RUN || "true").toLowerCase() === "true";
const BATCH_SIZE = Number(process.env.CHARACTER_IMPORT_BATCH_SIZE || 200);

if (!url || !serviceKey) {
  throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

function readCategoryFiles() {
  const rows = [];

  for (const cfg of CATEGORY_OUTPUTS) {
    const filePath = path.join(root, cfg.file);
    if (!fs.existsSync(filePath)) throw new Error(`Missing ${cfg.file}. Run scripts/build-premium-character-json-from-raw.mjs first.`);

    const arr = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!Array.isArray(arr)) throw new Error(`${cfg.file} must contain a JSON array`);
    if (arr.length !== cfg.expected) throw new Error(`${cfg.file}: expected ${cfg.expected}, got ${arr.length}`);

    for (const c of arr) rows.push(c);
  }

  return rows;
}

function toDbRow(character) {
  validatePremiumRecord(character);

  const generatedSeo = character.generated_seo || {};
  const slug = String(character.slug || generatedSeo.slug || slugify(`${character.name}-${character.title}`));
  const category = character.category;

  return {
    id: character.id,
    slug,
    name: character.name,
    section: character.section,
    category,
    role: character.role,
    relationship_pace: character.relationship_pace,
    tags: character.tags,
    title: character.title,
    opening_scenario: character.opening_scenario,
    first_message: character.first_message,
    relationship_context: character.relationship_context,
    ai_profile: character.ai_profile || {},
    feature_flags: character.feature_flags || {},
    generated_seo: generatedSeo,
    quality_control: character.quality_control || {},
    image_file: character.image_file,
    image_url: character.image_url,
    display_order: Number.isInteger(character.display_order) ? character.display_order : 0,
    visibility: "public",
    is_public: true,
    official: category !== "public-creations",
    creator_username: category === "public-creations" ? null : "everbond",
    is_active: true,
    updated_at: new Date().toISOString()
  };
}

async function main() {
  const sourceRows = readCategoryFiles();
  const ids = new Set();
  const slugs = new Set();

  const dbRows = sourceRows.map(toDbRow).sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return (a.display_order || 0) - (b.display_order || 0) || a.id.localeCompare(b.id);
  });

  for (const row of dbRows) {
    if (ids.has(row.id)) throw new Error(`Duplicate id: ${row.id}`);
    if (slugs.has(row.slug)) throw new Error(`Duplicate slug: ${row.slug}`);
    ids.add(row.id);
    slugs.add(row.slug);
  }

  console.log(`Ready to import ${dbRows.length} premium characters.`);
  console.log(`Dry run: ${DRY_RUN}`);
  console.log(`Batch size: ${BATCH_SIZE}`);

  const counts = {};
  for (const row of dbRows) counts[row.category] = (counts[row.category] || 0) + 1;
  console.log("Category counts:", counts);

  if (DRY_RUN) {
    console.log("Dry run complete. Set CHARACTER_IMPORT_DRY_RUN=false to import.");
    return;
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  for (let i = 0; i < dbRows.length; i += BATCH_SIZE) {
    const batch = dbRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("characters").upsert(batch, { onConflict: "id" });
    if (error) throw error;
    console.log(`Imported ${Math.min(i + batch.length, dbRows.length)}/${dbRows.length}`);
  }

  console.log("Import complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
