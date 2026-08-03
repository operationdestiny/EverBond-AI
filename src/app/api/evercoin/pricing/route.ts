import { NextResponse } from "next/server";
import { EVERCOIN_PACKS } from "@/lib/billing/evercoin-packs";
import {
  everCoinCallCostPerMinute,
  everCoinImageCost,
  everCoinPerDollar,
  everCoinVideoCost
} from "@/lib/evercoin";

export async function GET() {
  const videoCost = everCoinVideoCost();

  return NextResponse.json(
    {
      everCoinPerDollar: everCoinPerDollar(),
      callCostPerMinute: everCoinCallCostPerMinute(),
      imageCost: everCoinImageCost(),
      videoCost,
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
