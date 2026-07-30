#!/usr/bin/env node

const siteUrl = String(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ""
).replace(/\/+$/, "");

if (!siteUrl) {
  throw new Error("Set NEXT_PUBLIC_SITE_URL or SITE_URL before running this script.");
}

const supportedLanguages = new Set(["ES", "FR", "DE", "JA", "KO"]);
const languages = String(
  process.env.CHARACTER_TRANSLATION_LANGUAGES || "ES,FR,DE,JA,KO"
)
  .split(",")
  .map((value) => value.trim().toUpperCase())
  .filter((value) => supportedLanguages.has(value));

const categories = [
  "everbond-girls",
  "anime-fantasy",
  "everbond-guys",
  "public-creations"
];

const pageSize = 8;
const delayMs = Math.max(
  Number(process.env.CHARACTER_TRANSLATION_PREWARM_DELAY_MS || 750),
  0
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(language, category, offset, attempt = 1) {
  const params = new URLSearchParams({
    language,
    category,
    limit: String(pageSize),
    offset: String(offset)
  });
  const response = await fetch(
    `${siteUrl}/api/characters-localized?${params.toString()}`,
    {
      headers: {
        "User-Agent": "EverBond-translation-prewarm/1.0"
      }
    }
  );

  if (!response.ok) {
    const detail = await response.text();

    if (attempt < 3) {
      await sleep(2_000 * attempt);
      return fetchPage(language, category, offset, attempt + 1);
    }

    throw new Error(
      `${language}/${category}/${offset}: ${response.status} ${detail.slice(0, 500)}`
    );
  }

  return response.json();
}

for (const language of languages) {
  for (const category of categories) {
    let offset = 0;

    while (true) {
      console.log(`Translating ${language} ${category} ${offset}-${offset + pageSize - 1}`);
      const payload = await fetchPage(language, category, offset);
      const count = Array.isArray(payload?.characters)
        ? payload.characters.length
        : 0;

      console.log(`Cached ${count} characters.`);

      if (!payload?.hasMore || count === 0) break;
      offset += pageSize;
      await sleep(delayMs);
    }
  }
}

console.log("Character translation prewarm complete.");
