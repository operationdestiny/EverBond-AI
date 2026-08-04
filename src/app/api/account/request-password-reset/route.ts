import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/api-auth";

export const runtime = "nodejs";

function getAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase public auth variables.");
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

function redirectBase(request: Request) {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;

  const origin = request.headers.get("origin");
  if (origin) return origin.replace(/\/+$/, "");

  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user?.email) {
      return NextResponse.json(
        { error: "SIGNUP_REQUIRED" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (email !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "EMAIL_MISMATCH" },
        { status: 400 }
      );
    }

    const { error } =
      await getAuthClient().auth.resetPasswordForEmail(
        user.email,
        {
          redirectTo:
            `${redirectBase(request)}/auth/reset-password`
        }
      );

    if (error) {
      console.error("Password reset request failed:", error);
      return NextResponse.json(
        { error: "PASSWORD_RESET_FAILED" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { sent: true },
      {
        headers: {
          "Cache-Control": "private, no-store"
        }
      }
    );
  } catch (error) {
    console.error("Password reset failed:", error);

    return NextResponse.json(
      { error: "PASSWORD_RESET_FAILED" },
      { status: 500 }
    );
  }
}
