import { NextResponse } from "next/server";
import { z } from "zod";
import { queryCharacters } from "@/lib/characters-db";

const Category = z.enum(["everbond-girls", "anime-fantasy", "everbond-guys", "public-creations"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(100),
    offset: z.coerce.number().int().min(0).default(0),
    category: Category.default("everbond-girls"),
    q: z.string().max(100).optional(),
    tag: z.string().max(50).optional()
  }).safeParse(Object.fromEntries(url.searchParams));

  if (!parsed.success) return NextResponse.json({ error: "Invalid character query" }, { status: 400 });
  try {
    const result = await queryCharacters({
      limit: parsed.data.limit,
      offset: parsed.data.offset,
      category: parsed.data.category,
      query: parsed.data.q,
      tag: parsed.data.tag
    });
    return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Character query failed" }, { status: 500 });
  }
}
