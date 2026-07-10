type ChatRole = "system" | "user" | "assistant";

export type EverBondMessage = {
  role: ChatRole;
  content: string;
};

export type EverBondModelResult = {
  content: string;
  inputTokens: number;
  outputTokens: number;
  provider: string;
  model: string;
};

const DEV_FALLBACK =
  'She glances over for a second, trying not to smile too much. "I heard you. I just need a minute to figure out what to say."';

export async function callEverBondModel(messages: EverBondMessage[]): Promise<EverBondModelResult> {
  const provider = process.env.AI_PROVIDER || "generic_openai_compatible";
  const apiBaseUrl = process.env.AI_API_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL_ID || "everbond-model-not-configured";
  const maxTokens = Number(process.env.AI_MAX_TOKENS || 220);
  const temperature = Number(process.env.AI_TEMPERATURE || 0.82);

  if (!apiBaseUrl || !apiKey || !model || model === "everbond-model-not-configured") {
    return { content: DEV_FALLBACK, inputTokens: 0, outputTokens: 0, provider: "dev_fallback", model };
  }

  const endpoint = apiBaseUrl.endsWith("/chat/completions")
    ? apiBaseUrl
    : `${apiBaseUrl.replace(/\/$/, "")}/chat/completions`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      top_p: 0.9
    })
  });

  if (!response.ok) {
    throw new Error(`EverBond AI provider request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content ?? "",
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
    provider,
    model
  };
}
