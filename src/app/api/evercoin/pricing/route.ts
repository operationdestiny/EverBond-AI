import { NextResponse } from "next/server";
import { EVERCOIN_PACKS } from "@/lib/billing/evercoin-packs";
import {
  everCoinCallCostPerMinute,
  everCoinPerDollar
} from "@/lib/evercoin";
import {
  UNIFICALLY_VIDEO_AUDIO_ENABLED,
  UNIFICALLY_VIDEO_DURATION_SECONDS,
  unificallyImageEverCoinCost,
  unificallyVideoEverCoinCost
} from "@/lib/unifically-pricing";

export async function GET() {
  const videoCost = unificallyVideoEverCoinCost();

  return NextResponse.json(
    {
      everCoinPerDollar: everCoinPerDollar(),
      callCostPerMinute: everCoinCallCostPerMinute(),
      imageCost: unificallyImageEverCoinCost(),
      videoCost,
      videoDurationSeconds: UNIFICALLY_VIDEO_DURATION_SECONDS,
      videoAudioEnabled: UNIFICALLY_VIDEO_AUDIO_ENABLED,
      videoPricingConfigured: videoCost > 0,
      packs: Object.values(EVERCOIN_PACKS).map((pack) => ({
        code: pack.code,
        coins: pack.coins,
        displayPrice: pack.displayPrice
      }))
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=3600"
      }
    }
  );
}
