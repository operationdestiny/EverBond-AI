import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { endVoiceCall } from "@/lib/evercoin";
import { removeCallAudio } from "@/lib/voice-call";

export const runtime = "nodejs";

const Body = z
  .object({
    callId: z.string().uuid(),
    reason: z.string().trim().min(1).max(100).optional()
  })
  .strict();

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "SIGNUP_REQUIRED" }, { status: 401 });
    }

    const parsed = Body.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    await endVoiceCall({
      userId: user.id,
      callId: parsed.data.callId,
      reason: parsed.data.reason ?? "user_hangup"
    });

    // Audio is only needed while a live call can retry a response. Cleanup failure
    // must never prevent a call from ending.
    await removeCallAudio(user.id, parsed.data.callId).catch((error) => {
      console.error("Voice audio cleanup failed:", error);
    });

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Voice call end failed:", error);
    return NextResponse.json(
      { error: "VOICE_CALL_END_FAILED" },
      { status: 500 }
    );
  }
}
