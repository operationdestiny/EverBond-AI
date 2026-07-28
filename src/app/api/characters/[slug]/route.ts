import { NextResponse } from "next/server";
import { getCharacterBySlugForUser } from "@/lib/user-characters";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

async function getUserId(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");

  if (!token) return null;

  const { data, error } =
    await getSupabaseServiceClient().auth.getUser(token);

  if (error || !data.user) return null;
  return data.user.id;
}

export async function GET(
  request: Request,
  {
    params
  }: {
    params: Promise<{ slug: string }>;
  }
) {
  const { slug } = await params;
  const userId = await getUserId(request);
  const character = await getCharacterBySlugForUser(
    slug,
    userId
  );

  if (!character) {
    return NextResponse.json(
      { error: "CHARACTER_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { character },
    {
      headers: {
        "Cache-Control": "private, no-store"
      }
    }
  );
}
