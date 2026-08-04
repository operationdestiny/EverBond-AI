import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/api-auth";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const currentPassword =
      typeof body?.currentPassword === "string"
        ? body.currentPassword
        : "";
    const newEmail =
      typeof body?.newEmail === "string"
        ? body.newEmail.trim().toLowerCase()
        : "";

    if (
      !currentPassword ||
      !EMAIL_PATTERN.test(newEmail) ||
      newEmail === user.email.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const auth = getAuthClient();
    const signIn = await auth.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (signIn.error || !signIn.data.session) {
      return NextResponse.json(
        { error: "INVALID_PASSWORD" },
        { status: 403 }
      );
    }

    const { error } = await auth.auth.updateUser(
      { email: newEmail },
      {
        emailRedirectTo:
          `${redirectBase(request)}/my-bond`
      }
    );

    if (error) {
      console.error("Email change request failed:", error);
      return NextResponse.json(
        { error: "EMAIL_CHANGE_FAILED" },
        { status: 400 }
      );
    }

    await auth.auth.signOut();

    return NextResponse.json(
      { requested: true },
      {
        headers: {
          "Cache-Control": "private, no-store"
        }
      }
    );
  } catch (error) {
    console.error("Email change failed:", error);

    return NextResponse.json(
      { error: "EMAIL_CHANGE_FAILED" },
      { status: 500 }
    );
  }
}
