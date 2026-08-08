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
    throw new Error(`WAN_FINALIZER_MISSING:${label}`);
  }
  return source.replace(from, to);
}

// ============================================================================
// EVERBOND FINAL VIDEO SOURCE OF TRUTH
// ============================================================================
// Provider: Venice
// Model: wan-2-7-reference-to-video
// Duration: 10s
// Resolution: 720p
//
// IMPORTANT:
// The live Venice API for this model rejected BOTH `aspect_ratio` and `audio`
// on /video/queue. They are intentionally omitted from BOTH quote and queue.
//
// User price:
// exact live Venice provider cost + approximately $0.50 contribution,
// conservatively calculated against EverBond's lowest-value EverCoin pack
// after the assumed Paddle 5% + $0.50 checkout fee.
// ============================================================================

const pricingPath = "src/lib/video-pricing.ts";

write(
  pricingPath,
`import { veniceApiUrl } from "@/lib/venice-media";

const VIDEO_MODEL = "wan-2-7-reference-to-video";
const VIDEO_DURATION_SECONDS = 10;
const VIDEO_RESOLUTION = "720p";

// Conservative EverCoin economics use the 10,000 EC pack because it gives
// users the most EverCoin per dollar and therefore produces EverBond's lowest
// net dollar value per redeemed coin.
const WORST_CASE_PACK_PRICE_USD = 84.99;
const WORST_CASE_PACK_EVERCOIN = 10_000;
const PADDLE_PERCENT_FEE = 0.05;
const PADDLE_FIXED_FEE_USD = 0.50;
const TARGET_VIDEO_CONTRIBUTION_USD = 0.50;

const NET_PACK_REVENUE_USD =
  WORST_CASE_PACK_PRICE_USD * (1 - PADDLE_PERCENT_FEE) -
  PADDLE_FIXED_FEE_USD;

const NET_USD_PER_EVERCOIN =
  NET_PACK_REVENUE_USD / WORST_CASE_PACK_EVERCOIN;

export function videoPricingInputs(
  _durationSeconds = VIDEO_DURATION_SECONDS
) {
  return {
    model: VIDEO_MODEL,
    durationSeconds: VIDEO_DURATION_SECONDS,
    duration: \`\${VIDEO_DURATION_SECONDS}s\`,
    resolution: VIDEO_RESOLUTION
  };
}

export function everCoinVideoCostFromQuote(quoteUsd: number) {
  if (!Number.isFinite(quoteUsd) || quoteUsd <= 0) {
    return 0;
  }

  // Recover the live provider cost and retain about $0.50 after allocating
  // Paddle's fee against the lowest-value EverCoin pack.
  return Math.max(
    Math.ceil(
      (quoteUsd + TARGET_VIDEO_CONTRIBUTION_USD) /
        NET_USD_PER_EVERCOIN
    ),
    1
  );
}

export function roundedVideoDisplayCost(everCoinCost: number) {
  // Display exactly what will be charged. No fake "~" price and no markup
  // rounding above the calculated live cost + contribution.
  return Number.isFinite(everCoinCost) && everCoinCost > 0
    ? Math.trunc(everCoinCost)
    : 0;
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
        resolution: inputs.resolution
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
    // Never display or charge a made-up fallback price.
    console.error(
      "Wan video quote unavailable; pricing is temporarily unavailable:",
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

// One product duration only. Wan rejected the old 8s value.
route = route.replace(
  /const VIDEO_DURATIONS = \[[^\]]+\] as const;/,
  "const VIDEO_DURATIONS = [10] as const;"
);

// Ensure dynamic quote helper exists even if checked-in source is older.
if (!route.includes('from "@/lib/video-pricing"')) {
  route = replaceRequired(
    route,
    'import { veniceApiUrl } from "@/lib/venice-media";',
    'import { veniceApiUrl } from "@/lib/venice-media";\nimport { quoteEverCoinVideoCost } from "@/lib/video-pricing";',
    "pricing-import"
  );
}

// Remove obsolete static video-cost import if present.
route = route.replace(
  /(\n\s*)everCoinVideoCost,\n/,
  "$1"
);

// GET: only expose a real live Venice quote.
const getPricingBlock =
`    const pricing = await quoteEverCoinVideoCost(
      VIDEO_DURATIONS[0]
    );
    const cost = pricing.everCoinCost;`;

if (route.includes(getPricingBlock)) {
  if (!route.includes('pricing.source === "venice" && cost > 0')) {
    route = route.replace(
      getPricingBlock,
`${getPricingBlock}
    const pricingConfigured =
      pricing.source === "venice" && cost > 0;`
    );
  }

  route = route.replace(
    /        videoCost:[^\n]*,\n(?:        videoDisplayCost:[\s\S]*?\n)?        pricingConfigured:[^\n]*,/,
`        videoCost: pricingConfigured ? cost : null,
        videoDisplayCost: pricingConfigured
          ? pricing.displayCost
          : null,
        pricingConfigured,`
  );
}

// POST: require a real live quote BEFORE reserving EverCoin.
const postPricingBlock =
`    const pricing = await quoteEverCoinVideoCost(
      parsed.data.durationSeconds
    );
    const cost = pricing.everCoinCost;`;

if (route.includes(postPricingBlock)) {
  const position = route.indexOf(postPricingBlock);
  const nearby = route.slice(
    position,
    position + postPricingBlock.length + 500
  );

  if (!nearby.includes('pricing.source !== "venice"')) {
    route = route.replace(
      postPricingBlock,
`${postPricingBlock}

    if (pricing.source !== "venice" || cost <= 0) {
      return NextResponse.json(
        { error: "VIDEO_PRICING_NOT_CONFIGURED" },
        { status: 503 }
      );
    }`
    );
  }
}

// Convert a static legacy POST path if one survives earlier build scripts.
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

// Force all duration variants produced by the H3/Kling recovery layers to the
// one Wan duration Venice actually accepts for EverBond.
route = route.replace(
  /const queueDurationVariants = \[[\s\S]*?\];/,
`const queueDurationVariants = [
      pricing.duration
    ];`
);

// Normalize direct legacy queue fields.
route = route
  .replace(
    /        duration: `\$\{parsed\.data\.durationSeconds\}s`,/,
    "        duration: pricing.duration,"
  )
  .replace(
    "        resolution: videoResolution(),",
    "        resolution: pricing.resolution,"
  );

// The live Wan endpoint explicitly rejected these fields.
// Remove them anywhere in this video route's provider payload.
route = route
  .replace(/\n\s+aspect_ratio:\s*[^,\n]+,?/g, "")
  .replace(/\n\s+audio:\s*[^,\n]+,?/g, "");

// Ensure Wan queue includes the accepted resolution.
if (
  route.includes("                duration: queueDuration,") &&
  !route.includes(
    "                duration: queueDuration,\n                resolution: pricing.resolution,"
  )
) {
  route = route.replace(
    "                duration: queueDuration,",
    "                duration: queueDuration,\n                resolution: pricing.resolution,"
  );
}

if (
  route.includes("        duration: pricing.duration,") &&
  !route.includes(
    "        duration: pricing.duration,\n        resolution: pricing.resolution,"
  )
) {
  route = route.replace(
    "        duration: pricing.duration,",
    "        duration: pricing.duration,\n        resolution: pricing.resolution,"
  );
}

// Keep the generic reference-image queue format and user-controlled prompt,
// while removing provider-specific H3/Kling labels.
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
  .join("Wan 2.7 Reference");

route = route.replace(
  "Preserve @Image1's recognizable face, identity, adult age, body, skin tone, hair, and defining appearance throughout the video. ",
  "Preserve @Image1's recognizable face, identity, adult age, skin tone, hair, and defining appearance throughout the video. "
);

// Encourage portrait composition through the text prompt because this live Wan
// model does not expose an aspect_ratio parameter.
route = route.replace(
  `"Use the reference only to preserve character identity. The user's request controls the action, pose, expression, clothing, scene, framing, and camera movement. " +`,
  `"Use the reference only to preserve character identity. Compose the scene as a vertical portrait-oriented video suitable for a 9:16 display. The user's request controls the action, pose, expression, clothing, scene, framing, and camera movement. " +`
);

if (
  !route.includes("const VIDEO_DURATIONS = [10] as const;") ||
  !route.includes("quoteEverCoinVideoCost(") ||
  !route.includes("resolution: pricing.resolution") ||
  !route.includes("reference_image_urls:") ||
  !route.includes("parsed.data.prompt") ||
  route.includes("aspect_ratio:") ||
  route.includes("audio:")
) {
  throw new Error(
    "WAN_FINALIZER_ROUTE_VALIDATION_FAILED"
  );
}

write(routePath, route);

// ============================================================================
// EVERCOIN PRICING API
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
  "WAN_VIDEO_READY model=wan-2-7-reference-to-video duration=10s resolution=720p optional_fields=omitted pricing=live_cost_plus_0.50"
);
