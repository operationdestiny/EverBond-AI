import { NextResponse } from "next/server";
import { EVERCOIN_PACKS } from "@/lib/billing/evercoin-packs";
import {
  everCoinCallCostPerMinute,
  everCoinImageCost,
  everCoinPerDollar
} from "@/lib/evercoin";
import {
  VIDEO_DURATION_SECONDS,
  advertisedVideoEverCoinCost
} from "@/lib/video-pricing";

export async function GET() {
  const videoCost = advertisedVideoEverCoinCost();
  const videoPricingConfigured = Boolean(
    process.env.VENICE_API_KEY?.trim()
  );

  return NextResponse.json(
    {
      everCoinPerDollar: everCoinPerDollar(),
      callCostPerMinute: everCoinCallCostPerMinute(),
      imageCost: everCoinImageCost(),

      // This is deliberately an advertised estimate. Generation itself uses
      // a fresh Grok quote, and a fresh Wan quote if automatic fallback occurs.
      videoCost,
      videoDisplayCost: videoCost,

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
