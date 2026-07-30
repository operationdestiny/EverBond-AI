import { NextResponse } from "next/server";
import { z } from "zod";
import {
  localizeCharacter,
  type CharacterContentLanguage
} from "@/lib/character-localization";
import { getCharacterBySlugForUser } from "@/lib/user-characters";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const Language = z.enum(["EN", "ES", "FR", "DE", "JA", "KO"]);

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
  const character = await getCharacterBySlugForUser(slug, userId);

  if (!character) {
    return NextResponse.json(
      { error: "CHARACTER_NOT_FOUND" },
      { status: 404 }
    );
  }

  const url = new URL(request.url);
  const languageResult = Language.safeParse(
    url.searchParams.get("language") || "EN"
  );

  if (!languageResult.success) {
    return NextResponse.json(
      { error: "INVALID_LANGUAGE" },
      { status: 400 }
    );
  }

  try {
    const localized = await localizeCharacter(
      character,
      languageResult.data as CharacterContentLanguage,
      { translateTags: true }
    );

    return NextResponse.json(
      {
        character: localized,
        language: languageResult.data
      },
      {
        headers: {
          "Cache-Control": "private, no-store"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "CHARACTER_LOCALIZATION_FAILED"
      },
      { status: 500 }
    );
  }
}
