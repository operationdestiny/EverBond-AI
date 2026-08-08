import { NextResponse } from "next/server";
import { EVERCOIN_PACKS } from "@/lib/billing/evercoin-packs";
import {
  everCoinCallCostPerMinute,
  everCoinImageCost,
  everCoinPerDollar
} from "@/lib/evercoin";
import {
  PRIMARY_VIDEO_MODEL,
  VIDEO_DURATION_SECONDS,
  quoteEverCoinVideoCost
} from "@/lib/video-pricing";

export async function GET() {
  const videoPricing = await quoteEverCoinVideoCost(
    PRIMARY_VIDEO_MODEL,
    VIDEO_DURATION_SECONDS
  );

  const videoPricingConfigured =
    videoPricing.source === "venice" &&
    videoPricing.everCoinCost > 0;

  return NextResponse.json(
    {
      everCoinPerDollar: everCoinPerDollar(),
      callCostPerMinute: everCoinCallCostPerMinute(),
      imageCost: everCoinImageCost(),

      // Public UI shows the live Grok-first price only.
      // Wan is never exposed as a worst-case button price.
      videoCost: videoPricingConfigured
        ? videoPricing.everCoinCost
        : null,
      videoDisplayCost: videoPricingConfigured
        ? videoPricing.displayCost
        : null,

      videoDurationSeconds: VIDEO_DURATION_SECONDS,
      videoAudioEnabled: false,
      videoPricingConfigured,

      packs: Object.values(EVERCOIN_PACKS).map(
        (pack) => ({
          code: pack.code,
          coins: pack.coins,
          displayPrice: pack.displayPrice
        })
      )
    },
    {
      headers: {
        "Cache-Control": "private, no-store"
      }
    }
  );
}
