import { NextResponse } from "next/server";
import { z } from "zod";
import { getCharacterBySlugFromSupabase } from "@/lib/characters-db";
import { defaultMemory } from "@/lib/memory/defaultMemory";
import { buildChatModePrompt } from "@/lib/ai/prompts";
import { callEverBondModel } from "@/lib/ai/provider";

const ChatRequest = z.object({
  characterSlug: z.string(),
  messages: z.array(z.object({
    role: z.enum(["user", "character"]),
    content: z.string()
  })).max(12)
});

export async function POST(request: Request) {
  const body = ChatRequest.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const character = await getCharacterBySlugFromSupabase(body.data.characterSlug);
  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  const recent = body.data.messages.slice(-8).map((m) => `${m.role}: ${m.content}`);
  const prompt = buildChatModePrompt(character, defaultMemory, recent);
  const lastUserMessage = body.data.messages[body.data.messages.length - 1]?.content ?? "";

  const result = await callEverBondModel([
    { role: "system", content: prompt },
    { role: "user", content: lastUserMessage }
  ]);

  return NextResponse.json({
    reply: result.content,
    usage: {
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      provider: result.provider,
      model: result.model
    }
  });
}
