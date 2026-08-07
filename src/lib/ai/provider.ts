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

const AI_REPLY_MAX_TOKENS = 80;

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

function splitTokens(text: string) {
  return text.trim().match(/\S+/g) ?? [];
}

function endsWithCompleteSentence(text: string) {
  return /[.!?。！？]["')\]”’」』）]*\s*$/.test(text.trim());
}

function findLastSentenceEnd(text: string) {
  const matches = [...text.matchAll(/[.!?。！？]["')\]”’」』）]*/g)];
  const last = matches[matches.length - 1];

  if (!last || last.index === undefined || last.index < 8) {
    return "";
  }

  return text.slice(0, last.index + last[0].length).trim();
}

function textFromFirstTokens(text: string, maxTokens: number) {
  return splitTokens(text).slice(0, maxTokens).join(" ");
}

function limitToCompleteReply(text: string, finishReason?: string) {
  const tokens = splitTokens(text);

  if (
    tokens.length <= AI_REPLY_MAX_TOKENS &&
    finishReason !== "length" &&
    endsWithCompleteSentence(text)
  ) {
    return text;
  }

  if (tokens.length <= AI_REPLY_MAX_TOKENS && finishReason !== "length") {
    return text.replace(/[—–,\s.]+$/, "") + ".";
  }

  const hardLimited = textFromFirstTokens(text, AI_REPLY_MAX_TOKENS);
  const hardComplete = findLastSentenceEnd(hardLimited);

  if (hardComplete && splitTokens(hardComplete).length >= 8) {
    return hardComplete;
  }

  const shorter = textFromFirstTokens(text, 60);
  const shorterComplete = findLastSentenceEnd(shorter);

  if (shorterComplete && splitTokens(shorterComplete).length >= 8) {
    return shorterComplete;
  }

  return textFromFirstTokens(text, 48).replace(/[—–,\s.]+$/, "") + ".";
}

function cleanModelContent(content: unknown, finishReason?: string) {
  if (typeof content !== "string") return "";

  let text = content
    .trim()
    .replace(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]{1,40}:\s*/, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(
      /\bsomething(?:\s+else)?\s*[—–-]\s*something(?:\s+else)?\b/gi,
      "something"
    )
    .replace(/\bsomething\s*(?:\.{3}|…)/gi, "something")
    .replace(/([—–-]\s*){2,}/g, "—")
    .replace(/\s+/g, " ")
    .trim();

  text = limitToCompleteReply(text, finishReason);

  const looksCutOff =
    /[—–-]\s*$/.test(text) ||
    /\.{3}\s*$/.test(text) ||
    /…\s*$/.test(text) ||
    /[,;:]\s*$/.test(text) ||
    !endsWithCompleteSentence(text);

  if (looksCutOff) {
    const completeSentence = findLastSentenceEnd(text);

    if (completeSentence) {
      text = completeSentence;
    } else {
      text = text.replace(/[—–,\s.]+$/, "") + ".";
    }
  }

  return text;
}

function normalizeForSimilarity(text: string) {
  return text
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ngramSet(tokens: string[], size: number) {
  const values = new Set<string>();

  for (let index = 0; index <= tokens.length - size; index += 1) {
    values.add(tokens.slice(index, index + size).join(" "));
  }

  return values;
}

function isTooSimilarToPreviousReply(
  candidate: string,
  previousReply: string
) {
  const candidateNormalized = normalizeForSimilarity(candidate);
  const previousNormalized = normalizeForSimilarity(previousReply);

  if (!candidateNormalized || !previousNormalized) {
    return false;
  }

  if (candidateNormalized === previousNormalized) {
    return true;
  }

  const candidateTokens = candidateNormalized.split(" ");
  const previousTokens = previousNormalized.split(" ");

  if (candidateTokens.length < 14 || previousTokens.length < 14) {
    return false;
  }

  const candidateNgrams = ngramSet(candidateTokens, 3);
  const previousNgrams = ngramSet(previousTokens, 3);

  if (!candidateNgrams.size || !previousNgrams.size) {
    return false;
  }

  let shared = 0;

  for (const value of candidateNgrams) {
    if (previousNgrams.has(value)) {
      shared += 1;
    }
  }

  const containment =
    shared / Math.min(candidateNgrams.size, previousNgrams.size);

  return containment >= 0.62;
}

function messagesWithAntiRepeatCorrection(
  messages: EverBondMessage[]
) {
  const correction =
    "RETRY CORRECTION: The draft repeated the character's previous reply. " +
    "Respond to the user's newest message from the exact current action. " +
    "Use new wording, do not reuse the prior opening, question, pet name, " +
    "gesture, or description, and add one genuinely new beat.";

  const firstSystemIndex = messages.findIndex(
    (message) => message.role === "system"
  );

  if (firstSystemIndex < 0) {
    return [
      {
        role: "system" as const,
        content: correction
      },
      ...messages
    ];
  }

  return messages.map((message, index) =>
    index === firstSystemIndex
      ? {
          ...message,
          content: `${message.content}\n\n${correction}`
        }
      : message
  );
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
    throw new Error(
      `EverBond AI provider request failed: ${response.status} ${text}`
    );
  }

  return response.json();
}

export async function callEverBondModel(
  messages: EverBondMessage[]
): Promise<EverBondModelResult> {
  const config = getProviderConfig();

  const maxTokens = 110;
  const temperature = getNumberEnv("AI_TEMPERATURE", 0.85);
  const topP = getNumberEnv("AI_TOP_P", 0.9);
  const frequencyPenalty = getNumberEnv(
    "AI_FREQUENCY_PENALTY",
    0.12
  );
  const repetitionPenalty = getNumberEnv(
    "AI_REPETITION_PENALTY",
    1.06
  );

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

  const buildRequestBody = (
    requestMessages: EverBondMessage[]
  ): Record<string, unknown> => {
    const requestBody: Record<string, unknown> = {
      model: config.model,
      messages: requestMessages,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      repetition_penalty: repetitionPenalty
    };

    if (config.useVeniceParameters) {
      requestBody.venice_parameters = {
        include_venice_system_prompt: false,
        enable_web_search: "off"
      };
    }

    return requestBody;
  };

  const firstData: any = await postChatCompletion(
    endpoint,
    config.apiKey,
    buildRequestBody(messages)
  );

  const firstChoice = firstData.choices?.[0];
  const firstContent = cleanModelContent(
    firstChoice?.message?.content,
    firstChoice?.finish_reason
  );

  const previousAssistantReply =
    [...messages]
      .reverse()
      .find((message) => message.role === "assistant")
      ?.content ?? "";

  if (
    previousAssistantReply &&
    isTooSimilarToPreviousReply(
      firstContent,
      previousAssistantReply
    )
  ) {
    const retryMessages =
      messagesWithAntiRepeatCorrection(messages);

    const retryData: any = await postChatCompletion(
      endpoint,
      config.apiKey,
      buildRequestBody(retryMessages)
    );

    const retryChoice = retryData.choices?.[0];
    const retryContent = cleanModelContent(
      retryChoice?.message?.content,
      retryChoice?.finish_reason
    );

    return {
      content: retryContent || firstContent,
      inputTokens:
        (firstData.usage?.prompt_tokens ?? 0) +
        (retryData.usage?.prompt_tokens ?? 0),
      outputTokens:
        (firstData.usage?.completion_tokens ?? 0) +
        (retryData.usage?.completion_tokens ?? 0),
      provider: config.provider,
      model: config.model
    };
  }

  return {
    content: firstContent,
    inputTokens: firstData.usage?.prompt_tokens ?? 0,
    outputTokens: firstData.usage?.completion_tokens ?? 0,
    provider: config.provider,
    model: config.model
  };
}

export async function callEverBondMemoryModel(
  prompt: string
): Promise<EverBondModelResult> {
  const config = getProviderConfig();

  if (
    !config.apiBaseUrl ||
    !config.apiKey ||
    !config.model ||
    config.model === "everbond-model-not-configured"
  ) {
    return {
      content: "",
      inputTokens: 0,
      outputTokens: 0,
      provider: "dev_fallback",
      model: config.model
    };
  }

  const endpoint = buildChatCompletionsEndpoint(config.apiBaseUrl);

  const requestBody: Record<string, unknown> = {
    model: config.model,
    messages: [
      {
        role: "system",
        content: prompt
      }
    ],
    max_tokens: 600,
    temperature: 0.1,
    top_p: 0.95
  };

  if (config.useVeniceParameters) {
    requestBody.venice_parameters = {
      include_venice_system_prompt: false,
      enable_web_search: "off"
    };
  }

  const data: any = await postChatCompletion(
    endpoint,
    config.apiKey,
    requestBody
  );

  const content =
    typeof data.choices?.[0]?.message?.content === "string"
      ? data.choices[0].message.content.trim()
      : "";

  return {
    content,
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
    provider: config.provider,
    model: config.model
  };
}
