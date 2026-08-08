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

function requireReplace(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) {
    throw new Error(`WAN_FINALIZER_MISSING:${label}`);
  }
  return source.replace(from, to);
}

// ============================================================================
// ONE FINAL VIDEO SOURCE OF TRUTH
// ============================================================================
//
// EverBond production video:
//   model      wan-2-7-reference-to-video
//   duration   10s
//   resolution 720p
//   aspect     9:16
//   audio      false
//
// The older build scripts still contain unrelated chat/voice/recovery work.
// This file runs LAST and replaces every video-provider value they may have
// produced, so H3/Kling/768P cannot be the deployed configuration.
// ============================================================================

const pricingPath = "src/lib/video-pricing.ts";

write(
  pricingPath,
`import { veniceApiUrl } from "@/lib/venice-media";

const VIDEO_MODEL = "wan-2-7-reference-to-video";
const VIDEO_DURATION_SECONDS = 10;
const VIDEO_RESOLUTION = "720p";
const VIDEO_ASPECT_RATIO = "9:16";
const VIDEO_AUDIO_ENABLED = false;

const DEFAULT_BASELINE_QUOTE_USD = 1.12;
const DEFAULT_BASELINE_EVERCOIN = 199;
const DISPLAY_ROUNDING_INCREMENT = 10;

export function videoPricingInputs(
  durationSeconds = VIDEO_DURATION_SECONDS
) {
  // EverBond intentionally offers only Wan's 10-second product.
  // Do not accept stale 8-second values from older builds/clients.
  const durationSecondsFinal =
    Math.trunc(durationSeconds) === VIDEO_DURATION_SECONDS
      ? VIDEO_DURATION_SECONDS
      : VIDEO_DURATION_SECONDS;

  return {
    model: VIDEO_MODEL,
    durationSeconds: durationSecondsFinal,
    duration: \`\${durationSecondsFinal}s\`,
    resolution: VIDEO_RESOLUTION,
    aspectRatio: VIDEO_ASPECT_RATIO,
    audio: VIDEO_AUDIO_ENABLED
  };
}

export function everCoinVideoCostFromQuote(quoteUsd: number) {
  if (!Number.isFinite(quoteUsd) || quoteUsd <= 0) {
    return 0;
  }

  // Original EverBond proportional relationship:
  // $1.12 live provider quote -> 199 EverCoin.
  return Math.max(
    Math.ceil(
      (quoteUsd * DEFAULT_BASELINE_EVERCOIN) /
        DEFAULT_BASELINE_QUOTE_USD
    ),
    1
  );
}

export function roundedVideoDisplayCost(everCoinCost: number) {
  if (!Number.isFinite(everCoinCost) || everCoinCost <= 0) {
    return 0;
  }

  return (
    Math.ceil(
      Math.trunc(everCoinCost) /
        DISPLAY_ROUNDING_INCREMENT
    ) * DISPLAY_ROUNDING_INCREMENT
  );
}

export async function quoteEverCoinVideoCost(
  durationSeconds = VIDEO_DURATION_SECONDS
) {
  const inputs = videoPricingInputs(durationSeconds);

  function result(
    quoteUsd: number,
    source: "venice" | "fallback"
  ) {
    const everCoinCost = everCoinVideoCostFromQuote(quoteUsd);

    return {
      ...inputs,
      quoteUsd,
      everCoinCost,
      displayCost: roundedVideoDisplayCost(everCoinCost),
      source
    };
  }

  const apiKey = process.env.VENICE_API_KEY?.trim();

  if (!apiKey) {
    return result(0, "fallback");
  }

  try {
    const response = await fetch(veniceApiUrl("video/quote"), {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${apiKey}\`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: inputs.model,
        duration: inputs.duration,
        resolution: inputs.resolution,
        aspect_ratio: inputs.aspectRatio,
        audio: inputs.audio
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000)
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      throw new Error(
        \`VIDEO_QUOTE_FAILED:\${response.status}:\${detail}\`
      );
    }

    const payload = await response.json().catch(() => null);
    const quoteUsd = Number(payload?.quote);

    if (!Number.isFinite(quoteUsd) || quoteUsd <= 0) {
      throw new Error("VIDEO_QUOTE_INVALID");
    }

    return result(quoteUsd, "venice");
  } catch (error) {
    // Never turn a failed quote into a fake/worst-case customer price.
    console.error(
      "Wan video quote unavailable; generation pricing is temporarily unavailable:",
      error
    );
    return result(0, "fallback");
  }
}
`
);

// ============================================================================
// CHARACTER VIDEO ROUTE
// ============================================================================

const routePath =
  "src/app/api/character-video-gallery/[slug]/route.ts";
let route = read(routePath);

route = route.replace(
  /const VIDEO_DURATIONS = \[[^\]]+\] as const;/,
  "const VIDEO_DURATIONS = [10] as const;"
);

// Dynamic pricing is installed by the earlier media-pricing step.
// Make sure the import exists even if the checked-in route was older.
if (!route.includes('from "@/lib/video-pricing"')) {
  route = requireReplace(
    route,
    'import { veniceApiUrl } from "@/lib/venice-media";',
    'import { veniceApiUrl } from "@/lib/venice-media";\nimport { quoteEverCoinVideoCost } from "@/lib/video-pricing";',
    "pricing-import"
  );
}

// Remove a legacy static video cost import/call if an older source revision
// reaches this finalizer.
route = route.replace(
  /(\n\s*)everCoinVideoCost,\n/,
  "$1"
);

// GET: only show a real live Venice price.
const getPricingBlock =
`    const pricing = await quoteEverCoinVideoCost(
      VIDEO_DURATIONS[0]
    );
    const cost = pricing.everCoinCost;`;

if (route.includes(getPricingBlock)) {
  const getWithStatus =
`${getPricingBlock}
    const pricingConfigured =
      pricing.source === "venice" && cost > 0;`;

  if (!route.includes('pricing.source === "venice" && cost > 0')) {
    route = route.replace(
      getPricingBlock,
      getWithStatus
    );
  }

  route = route.replace(
    /        videoCost:[^\n]*,\n(?:        videoDisplayCost:[^\n]*,\n)?        pricingConfigured:[^\n]*,/,
`        videoCost: pricingConfigured ? cost : null,
        videoDisplayCost: pricingConfigured
          ? pricing.displayCost
          : null,
        pricingConfigured,`
  );
}

// POST: require the exact live quote BEFORE EverCoin reservation.
const postPricingBlock =
`    const pricing = await quoteEverCoinVideoCost(
      parsed.data.durationSeconds
    );
    const cost = pricing.everCoinCost;`;

if (route.includes(postPricingBlock)) {
  const guardedPost =
`${postPricingBlock}

    if (pricing.source !== "venice" || cost <= 0) {
      return NextResponse.json(
        { error: "VIDEO_PRICING_NOT_CONFIGURED" },
        { status: 503 }
      );
    }`;

  const afterPost = route.slice(
    route.indexOf(postPricingBlock) +
      postPricingBlock.length,
    route.indexOf(postPricingBlock) +
      postPricingBlock.length +
      400
  );

  if (!afterPost.includes('pricing.source !== "venice"')) {
    route = route.replace(
      postPricingBlock,
      guardedPost
    );
  }
}

// If an older static route survived the media-pricing step, convert its POST
// pricing before it can reserve EverCoin.
const staticCostBlock =
`    const cost = everCoinVideoCost();
    if (cost <= 0) {
      return NextResponse.json(
        { error: "VIDEO_PRICING_NOT_CONFIGURED" },
        { status: 503 }
      );
    }`;

if (route.includes(staticCostBlock)) {
  route = route.replace(
    staticCostBlock,
`    const pricing = await quoteEverCoinVideoCost(
      parsed.data.durationSeconds
    );
    const cost = pricing.everCoinCost;

    if (pricing.source !== "venice" || cost <= 0) {
      return NextResponse.json(
        { error: "VIDEO_PRICING_NOT_CONFIGURED" },
        { status: 503 }
      );
    }`
  );
}

route = route.replace(
  "    const model = videoModel();",
  "    const model = pricing.model;"
);

// The current H3 recovery block uses a generic reference_image_urls payload,
// which Wan also uses. Keep its proven retry/reference handling but force the
// exact Wan request fields.
route = route
  .replace(
    /const queueDurationVariants = \[[\s\S]*?\];/,
`const queueDurationVariants = [
      pricing.duration
    ];`
  )
  .replace(
    "                duration: queueDuration,\n                aspect_ratio:",
    "                duration: queueDuration,\n                resolution: pricing.resolution,\n                aspect_ratio:"
  )
  .replace(
    '                aspect_ratio: "9:16",',
    "                aspect_ratio: pricing.aspectRatio,"
  )
  .replace(
    "                audio: false,",
    "                audio: pricing.audio,"
  );

// If an older direct queue block is present, normalize it too.
route = route
  .replace(
    /        duration: `\$\{parsed\.data\.durationSeconds\}s`,/,
    "        duration: pricing.duration,"
  )
  .replace(
    "        resolution: videoResolution(),",
    "        resolution: pricing.resolution,"
  )
  .replace(
    "        aspect_ratio: videoAspectRatio(),",
    "        aspect_ratio: pricing.aspectRatio,"
  );

if (
  route.includes("        aspect_ratio: pricing.aspectRatio,") &&
  !route.includes("        audio: pricing.audio,")
) {
  route = route.replace(
    "        audio: false,",
    "        audio: pricing.audio,"
  );
}

// Normalize legacy provider wording/markers in the deployed route.
route = route
  .split("VIDEO_H3_QUEUE_RECOVERY")
  .join("VIDEO_WAN_QUEUE_RECOVERY")
  .split("VIDEO_KLING_QUEUE_RECOVERY")
  .join("VIDEO_WAN_QUEUE_RECOVERY")
  .split("MiniMax H3")
  .join("Wan 2.7 Reference")
  .split("H3 Enhanced")
  .join("Wan 2.7 Reference")
  .split("Kling O3")
  .join("Wan 2.7 Reference")
  .split("@Element1 is the exact fictional adult character")
  .join("@Image1 is the exact fictional adult character");

route = route.replace(
  "Preserve @Image1's recognizable face, identity, adult age, body, skin tone, hair, and defining appearance throughout the video. ",
  "Preserve @Image1's recognizable face, identity, adult age, skin tone, hair, and defining appearance throughout the video. "
);

if (
  !route.includes("const VIDEO_DURATIONS = [10] as const;") ||
  !route.includes("quoteEverCoinVideoCost(") ||
  !(
    route.includes("duration: pricing.duration") ||
    (
      route.includes("duration: queueDuration") &&
      route.includes("pricing.duration")
    )
  ) ||
  !route.includes("resolution: pricing.resolution") ||
  !route.includes("aspect_ratio: pricing.aspectRatio") ||
  !route.includes("reference_image_urls:") ||
  !route.includes("parsed.data.prompt")
) {
  throw new Error("WAN_FINALIZER_ROUTE_VALIDATION_FAILED");
}

write(routePath, route);

// ============================================================================
// PUBLIC EVERCOIN PRICING API
// ============================================================================

write(
  "src/app/api/evercoin/pricing/route.ts",
`import { NextResponse } from "next/server";
import { EVERCOIN_PACKS } from "@/lib/billing/evercoin-packs";
import {
  everCoinCallCostPerMinute,
  everCoinImageCost,
  everCoinPerDollar
} from "@/lib/evercoin";
import { quoteEverCoinVideoCost } from "@/lib/video-pricing";

export async function GET() {
  const videoPricing = await quoteEverCoinVideoCost(10);
  const videoPricingConfigured =
    videoPricing.source === "venice" &&
    videoPricing.everCoinCost > 0;

  return NextResponse.json(
    {
      everCoinPerDollar: everCoinPerDollar(),
      callCostPerMinute: everCoinCallCostPerMinute(),
      imageCost: everCoinImageCost(),
      videoCost: videoPricingConfigured
        ? videoPricing.everCoinCost
        : null,
      videoDisplayCost: videoPricingConfigured
        ? videoPricing.displayCost
        : null,
      videoDurationSeconds: 10,
      videoAudioEnabled: false,
      videoPricingConfigured,
      packs: Object.values(EVERCOIN_PACKS).map((pack) => ({
        code: pack.code,
        coins: pack.coins,
        displayPrice: pack.displayPrice
      }))
    },
    {
      headers: {
        "Cache-Control": "private, no-store"
      }
    }
  );
}
`
);

// ============================================================================
// CLIENT DURATION
// ============================================================================

const clientPath =
  "src/components/media/CharacterGalleryClient.tsx";
let client = read(clientPath);

client = client
  .replace(
    "const [videoDuration, setVideoDuration] = useState(8);",
    "const [videoDuration, setVideoDuration] = useState(10);"
  )
  .replace(
    "const [videoDuration, setVideoDuration] = useState(5);",
    "const [videoDuration, setVideoDuration] = useState(10);"
  );

write(clientPath, client);

console.log(
  "WAN_VIDEO_READY model=wan-2-7-reference-to-video duration=10s resolution=720p aspect=9:16"
);
