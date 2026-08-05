import { veniceApiUrl } from "@/lib/venice-media";

const DEFAULT_VIDEO_MODEL = "wan-2-7-reference-to-video";
const DEFAULT_DURATION_SECONDS = 8;
const DEFAULT_RESOLUTION = "720p";
const DEFAULT_ASPECT_RATIO = "9:16";
const DEFAULT_AUDIO_ENABLED = false;
const DEFAULT_BASELINE_QUOTE_USD = 1.12;
const DEFAULT_BASELINE_EVERCOIN = 199;
const DISPLAY_ROUNDING_INCREMENT = 10;

function positiveNumberEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function positiveIntegerEnv(name: string, fallback: number) {
  return Math.max(
    Math.trunc(positiveNumberEnv(name, fallback)),
    1
  );
}

export function videoPricingInputs(
  durationSeconds = DEFAULT_DURATION_SECONDS
) {
  const configuredResolution =
    process.env.VENICE_VIDEO_RESOLUTION?.trim().toLowerCase();
  const resolution = new Set(["480p", "720p", "1080p"]).has(
    configuredResolution || ""
  )
    ? configuredResolution!
    : DEFAULT_RESOLUTION;

  const configuredAspectRatio =
    process.env.VENICE_VIDEO_ASPECT_RATIO?.trim();
  const aspectRatio = new Set([
    "1:1",
    "2:3",
    "3:2",
    "3:4",
    "4:3",
    "9:16",
    "16:9",
    "21:9"
  ]).has(configuredAspectRatio || "")
    ? configuredAspectRatio!
    : DEFAULT_ASPECT_RATIO;

  return {
    model:
      process.env.VENICE_VIDEO_MODEL?.trim() ||
      DEFAULT_VIDEO_MODEL,
    durationSeconds: Math.max(Math.trunc(durationSeconds), 1),
    duration: `${Math.max(Math.trunc(durationSeconds), 1)}s`,
    resolution,
    aspectRatio,
    audio: DEFAULT_AUDIO_ENABLED
  };
}

export function everCoinVideoCostFromQuote(quoteUsd: number) {
  const baselineQuoteUsd = positiveNumberEnv(
    "VENICE_VIDEO_BASELINE_QUOTE_USD",
    DEFAULT_BASELINE_QUOTE_USD
  );
  const baselineEverCoin = positiveIntegerEnv(
    "EVERCOIN_VIDEO_BASELINE_COST",
    DEFAULT_BASELINE_EVERCOIN
  );
  const normalizedQuote =
    Number.isFinite(quoteUsd) && quoteUsd > 0
      ? quoteUsd
      : baselineQuoteUsd;

  return Math.max(
    Math.ceil(
      (normalizedQuote * baselineEverCoin) /
        baselineQuoteUsd
    ),
    1
  );
}

export function roundedVideoDisplayCost(everCoinCost: number) {
  const normalized = Math.max(Math.trunc(everCoinCost), 1);
  return (
    Math.ceil(normalized / DISPLAY_ROUNDING_INCREMENT) *
    DISPLAY_ROUNDING_INCREMENT
  );
}

export async function quoteEverCoinVideoCost(
  durationSeconds = DEFAULT_DURATION_SECONDS
) {
  const inputs = videoPricingInputs(durationSeconds);
  const fallbackQuoteUsd = positiveNumberEnv(
    "VENICE_VIDEO_FALLBACK_QUOTE_USD",
    DEFAULT_BASELINE_QUOTE_USD
  );

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
    return result(fallbackQuoteUsd, "fallback");
  }

  try {
    const response = await fetch(veniceApiUrl("video/quote"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
      const detail = (await response.text()).slice(0, 300);
      throw new Error(
        `VIDEO_QUOTE_FAILED:${response.status}:${detail}`
      );
    }

    const payload = await response.json().catch(() => null);
    const quoteUsd = Number(payload?.quote);

    if (!Number.isFinite(quoteUsd) || quoteUsd <= 0) {
      throw new Error("VIDEO_QUOTE_INVALID");
    }

    return result(quoteUsd, "venice");
  } catch (error) {
    console.error(
      "Venice video quote unavailable; using the profitable fallback price:",
      error
    );
    return result(fallbackQuoteUsd, "fallback");
  }
}
