#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
}

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;

  if (!source.includes(from)) {
    throw new Error(`Test free-pass patch could not find: ${label}`);
  }

  return source.replace(from, to);
}

const helperPath = "src/lib/test-free-pass.ts";

write(
  helperPath,
  `import { getSupabaseServiceClient } from "@/lib/supabase/server";

export const TEST_FREE_PASS_LIMIT = 1_000_000_000;

export async function hasEverBondTestFreePass(userId: string) {
  const { data, error } = await getSupabaseServiceClient().rpc(
    "has_everbond_test_free_pass",
    {
      p_user_id: userId
    }
  );

  if (error) throw error;
  return data === true;
}
`
);

// ---------------------------------------------------------------------------
// Character creation: remove only the 25-character quota for the test account.
// ---------------------------------------------------------------------------

const charactersPath = "src/app/api/characters/route.ts";
let characters = read(charactersPath);

if (!characters.includes('from "@/lib/test-free-pass"')) {
  characters = replaceRequired(
    characters,
    'import { getSupabaseServiceClient } from "@/lib/supabase/server";',
    'import { getSupabaseServiceClient } from "@/lib/supabase/server";\nimport { hasEverBondTestFreePass } from "@/lib/test-free-pass";',
    "character route test-pass import"
  );
}

characters = replaceRequired(
  characters,
  `    const formData = await request.formData();`,
  `    const hasTestFreePass = await hasEverBondTestFreePass(user.id);

    const formData = await request.formData();`,
  "character route test-pass lookup"
);

characters = replaceRequired(
  characters,
  `    if ((count ?? 0) >= USER_CHARACTER_LIMIT) {`,
  `    if (!hasTestFreePass && (count ?? 0) >= USER_CHARACTER_LIMIT) {`,
  "character creation quota bypass"
);

write(charactersPath, characters);

// ---------------------------------------------------------------------------
// Image gallery: tell the client there is no stored-image quota for test pass.
// The database SQL patch separately removes the server/database quota.
// ---------------------------------------------------------------------------

const imagePath = "src/app/api/character-gallery/[slug]/route.ts";
let imageRoute = read(imagePath);

if (!imageRoute.includes('from "@/lib/test-free-pass"')) {
  imageRoute = replaceRequired(
    imageRoute,
    'import { activeCharacterReferenceDataUrl } from "@/lib/character-media-reference";',
    'import { activeCharacterReferenceDataUrl } from "@/lib/character-media-reference";\nimport { hasEverBondTestFreePass, TEST_FREE_PASS_LIMIT } from "@/lib/test-free-pass";',
    "image route test-pass import"
  );
}

imageRoute = replaceRequired(
  imageRoute,
  `    const { slug } = await params;
    const character = await getCharacterBySlugForUser(slug, user.id);`,
  `    const hasTestFreePass = await hasEverBondTestFreePass(user.id);

    const { slug } = await params;
    const character = await getCharacterBySlugForUser(slug, user.id);`,
  "image GET test-pass lookup"
);

imageRoute = replaceRequired(
  imageRoute,
  `        limit: GALLERY_LIMIT,
        imageCost: everCoinImageCost()`,
  `        limit: hasTestFreePass ? TEST_FREE_PASS_LIMIT : GALLERY_LIMIT,
        imageCost: everCoinImageCost()`,
  "image client quota bypass"
);

write(imagePath, imageRoute);

// ---------------------------------------------------------------------------
// Video gallery: same as images.
// ---------------------------------------------------------------------------

const videoPath = "src/app/api/character-video-gallery/[slug]/route.ts";
let videoRoute = read(videoPath);

if (!videoRoute.includes('from "@/lib/test-free-pass"')) {
  videoRoute = replaceRequired(
    videoRoute,
    'import { veniceApiUrl } from "@/lib/venice-media";',
    'import { veniceApiUrl } from "@/lib/venice-media";\nimport { hasEverBondTestFreePass, TEST_FREE_PASS_LIMIT } from "@/lib/test-free-pass";',
    "video route test-pass import"
  );
}

videoRoute = replaceRequired(
  videoRoute,
  `    const { slug } = await params;
    const character = await getCharacterBySlugForUser(slug, user.id);`,
  `    const hasTestFreePass = await hasEverBondTestFreePass(user.id);

    const { slug } = await params;
    const character = await getCharacterBySlugForUser(slug, user.id);`,
  "video GET test-pass lookup"
);

videoRoute = replaceRequired(
  videoRoute,
  `        videos,
        limit: VIDEO_LIMIT,
        videoCost: cost,`,
  `        videos,
        limit: hasTestFreePass ? TEST_FREE_PASS_LIMIT : VIDEO_LIMIT,
        videoCost: cost,`,
  "video client quota bypass"
);

write(videoPath, videoRoute);

if (
  !characters.includes("!hasTestFreePass &&") ||
  !imageRoute.includes("TEST_FREE_PASS_LIMIT : GALLERY_LIMIT") ||
  !videoRoute.includes("TEST_FREE_PASS_LIMIT : VIDEO_LIMIT")
) {
  throw new Error("Test free-pass source validation failed.");
}

console.log(
  "EverBond single-account QA free pass source patch applied."
);
