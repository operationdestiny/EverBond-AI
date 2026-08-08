import { NextResponse } from "next/server";
import { EVERCOIN_PACKS } from "@/lib/billing/evercoin-packs";
import {
  everCoinCallCostPerMinute,
  everCoinImageCost,
  everCoinPerDollar
} from "@/lib/evercoin";
import {
  VIDEO_DURATION_SECONDS,
  VIDEO_EVERCOIN_COST
} from "@/lib/wavespeed-video";

export async function GET() {
  return NextResponse.json(
    {
      everCoinPerDollar: everCoinPerDollar(),
      callCostPerMinute: everCoinCallCostPerMinute(),
      imageCost: everCoinImageCost(),
      videoCost: VIDEO_EVERCOIN_COST,
      videoDisplayCost: VIDEO_EVERCOIN_COST,
      videoDurationSeconds: VIDEO_DURATION_SECONDS,
      videoAudioEnabled: false,
      videoPricingConfigured: Boolean(
        process.env.WAVESPEED_API_KEY?.trim()
      ),
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
