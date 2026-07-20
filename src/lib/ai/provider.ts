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

function cleanBaseUrl(value: string) {
  return value.replace(/\/$/, "");
}

function buildChatCompletionsEndpoint(baseUrl: string) {
  const clean = cleanBaseUrl(baseUrl);

  if (clean.endsWith("/chat/completions")) {
    return clean;
  }

  return `${clean}/chat/completions`;
}

function getProviderConfig() {
  const provider = process.env.AI_PROVIDER || "venice";

  if (provider === "venice") {
    return {
      provider: "venice",
      apiBaseUrl:
        process.env.VENICE_BASE_URL ||
        "https://api.venice.ai/api/v1",
      apiKey:
        process.env.VENICE_API_KEY ||
        "",
      model:
        process.env.VENICE_CHAT_MODEL ||
        "venice-uncensored-role-play",
      useVeniceParameters: true
    };
  }

  return {
    provider,
    apiBaseUrl: process.env.AI_API_BASE_URL || "",
    apiKey: process.env.AI_API_KEY || "",
    model: process.env.AI_MODEL_ID || "everbond-model-not-configured",
    useVeniceParameters: false
  };
}

function getNumberEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function cleanModelContent(content: unknown) {
  if (typeof content !== "string") return "";

  let text = content
    .trim()
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\b(something else|something)\s*[—–-]\s*\1\b/gi, "$1");

  const looksCutOff =
    /[—–-]\s*$/.test(text) ||
    /\.{3}\s*$/.test(text) ||
    /[,;:]\s*$/.test(text);

  if (looksCutOff) {
    const completeSentence = text.match(/^([\s\S]*[.!?]["')\]]?)(?:\s|$)/);

    if (completeSentence?.[1] && completeSentence[1].trim().length > 20) {
      text = completeSentence[1].trim();
    }
  }

  return text;
}

async function postChatCompletion(
  endpoint: string,
  apiKey: string,
  body: Record<string, unknown>
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`EverBond AI provider request failed: ${response.status} ${text}`);
  }

  return response.json();
}

export async function callEverBondModel(
  messages: EverBondMessage[]
): Promise<EverBondModelResult> {
  const config = getProviderConfig();

  const maxTokens = Math.min(getNumberEnv("AI_MAX_TOKENS", 80), 80);
  const temperature = getNumberEnv("AI_TEMPERATURE", 0.9);
  const topP = getNumberEnv("AI_TOP_P", 0.95);

  if (
    !config.apiBaseUrl ||
    !config.apiKey ||
    !config.model ||
    config.model === "everbond-model-not-configured"
  ) {
    return {
      content: DEV_FALLBACK,
      inputTokens: 0,
      outputTokens: 0,
      provider: "dev_fallback",
      model: config.model
    };
  }

  const endpoint = buildChatCompletionsEndpoint(config.apiBaseUrl);

  const requestBody: Record<string, unknown> = {
    model: config.model,
    messages,
    max_tokens: maxTokens,
    temperature,
    top_p: topP
  };

  if (config.useVeniceParameters) {
    requestBody.venice_parameters = {
      include_venice_system_prompt: false,
      enable_web_search: "off"
    };
  }

  let data: any;

  try {
    data = await postChatCompletion(endpoint, config.apiKey, requestBody);
  } catch (firstError) {
    data = await postChatCompletion(endpoint, config.apiKey, requestBody).catch(() => {
      throw firstError;
    });
  }

  const content = cleanModelContent(data.choices?.[0]?.message?.content);

  return {
    content,
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
    provider: config.provider,
    model: config.model
  };
}
