import { NextResponse } from "next/server";

export const runtime = "nodejs";

function disabled() {
  return NextResponse.json(
    {
      error: "BTCPAY_DISABLED",
      message: "EverBond launch checkout uses PayRam only."
    },
    {
      status: 410,
      headers: { "Cache-Control": "no-store" }
    }
  );
}

export const GET = disabled;
export const POST = disabled;
