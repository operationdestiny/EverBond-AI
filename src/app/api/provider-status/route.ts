import { NextResponse } from "next/server";
import {
  getUnificallyAccount,
  unificallyApiKey
} from "@/lib/unifically-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_CACHE_MS = 20_000;
let cachedAt = 0;
let cachedPayload: Record<string, unknown> | null = null;

function response(payload: Record<string, unknown>) {
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control":
        "private, no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0"
    }
  });
}

export async function GET() {
  const now = Date.now();
  if (cachedPayload && now - cachedAt < STATUS_CACHE_MS) {
    return response(cachedPayload);
  }

  const checkedAt = new Date(now).toISOString();
  const apiKey = unificallyApiKey();

  if (!apiKey) {
    const payload = {
      confirmedOutage: false,
      sourceAvailable: false,
      providerStatus: "not_configured",
      incidentName: null,
      checkedAt
    };
    cachedAt = now;
    cachedPayload = payload;
    return response(payload);
  }

  try {
    const account = await getUnificallyAccount({
      apiKey,
      timeoutMs: 4_000
    });
    const payload = {
      confirmedOutage: false,
      sourceAvailable: true,
      providerStatus: "available",
      incidentName: null,
      balanceAvailable: account.balanceUsd !== null,
      checkedAt
    };
    cachedAt = now;
    cachedPayload = payload;
    return response(payload);
  } catch {
    // Fail open: an account/status lookup failure must never itself block media.
    const payload = {
      confirmedOutage: false,
      sourceAvailable: false,
      providerStatus: "not_confirmed",
      incidentName: null,
      checkedAt
    };
    cachedAt = now;
    cachedPayload = payload;
    return response(payload);
  }
}
