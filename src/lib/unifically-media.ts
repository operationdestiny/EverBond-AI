const DEFAULT_UNIFICALLY_API_BASE_URL = "https://api.unifically.com";
const DEFAULT_UNIFICALLY_FILES_BASE_URL = "https://files.unifically.com";
const TERMINAL_STATUSES = new Set(["completed", "failed"]);

export type UnificallyTask = {
  taskId: string;
  status: string;
  model: string;
  output: Record<string, unknown> | null;
  error: string | null;
  costUsd: number | null;
};

type CreateUnificallyTaskBase = {
  apiKey: string;
  model: string;
  input: Record<string, unknown>;
  callbackUrl?: string | null;
  timeoutMs?: number;
};

type UnificallyDryRunQuote = {
  readonly costUsd: number;
};

function cleanBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function apiBaseUrl() {
  return cleanBaseUrl(
    process.env.UNIFICALLY_API_BASE_URL?.trim() ||
      DEFAULT_UNIFICALLY_API_BASE_URL
  );
}

function filesBaseUrl() {
  return cleanBaseUrl(
    process.env.UNIFICALLY_FILES_BASE_URL?.trim() ||
      DEFAULT_UNIFICALLY_FILES_BASE_URL
  );
}

export function unificallyApiKey() {
  return process.env.UNIFICALLY_API_KEY?.trim() || "";
}

function authHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
}

async function readJsonResponse(response: Response) {
  const text = await response.text();
  let payload: any = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { message: text };
  }

  return { text, payload };
}

function unwrapData(payload: any) {
  if (payload?.success === false) {
    throw new Error(
      `UNIFICALLY_API_ERROR:${String(
        payload?.message ??
          payload?.error ??
          payload?.data?.message ??
          payload?.code ??
          "unknown"
      ).slice(0, 500)}`
    );
  }

  return payload?.data ?? payload;
}

function normalizeTask(
  value: any,
  fallbackModel = ""
): UnificallyTask {
  const status = String(value?.status ?? "processing")
    .trim()
    .toLowerCase();
  const rawCost = Number(value?.cost);

  return {
    taskId:
      typeof value?.task_id === "string" ? value.task_id.trim() : "",
    status,
    model:
      typeof value?.model === "string" && value.model.trim()
        ? value.model.trim()
        : fallbackModel,
    output:
      value?.output && typeof value.output === "object"
        ? (value.output as Record<string, unknown>)
        : null,
    error:
      typeof value?.error_message === "string"
        ? value.error_message.slice(0, 500)
        : typeof value?.message === "string" && status === "failed"
          ? value.message.slice(0, 500)
          : null,
    costUsd: Number.isFinite(rawCost) ? rawCost : null
  };
}

export async function uploadUnificallyBase64(values: {
  apiKey: string;
  base64: string;
  timeoutMs?: number;
}) {
  const response = await fetch(`${filesBaseUrl()}/upload`, {
    method: "PUT",
    headers: authHeaders(values.apiKey),
    body: JSON.stringify({ base64: values.base64 }),
    cache: "no-store",
    signal: AbortSignal.timeout(values.timeoutMs ?? 45_000)
  });

  const { text, payload } = await readJsonResponse(response);
  if (!response.ok || payload?.success !== true) {
    throw new Error(
      `UNIFICALLY_UPLOAD_FAILED:${response.status}:${String(
        payload?.message ?? payload?.error ?? text
      ).slice(0, 500)}`
    );
  }

  const fileUrl =
    typeof payload?.file_url === "string" ? payload.file_url.trim() : "";
  if (!fileUrl.startsWith("https://")) {
    throw new Error("UNIFICALLY_UPLOAD_URL_MISSING");
  }

  return fileUrl;
}

/*
  Overloads are intentional:
  - A normal generation always returns a real UnificallyTask.
  - A dry_run request returns only its quoted USD cost.
  This keeps image/video runtime code strongly typed instead of exposing
  an unnecessary union to every normal task submission.
*/
export function createUnificallyTask(
  values: CreateUnificallyTaskBase & { dryRun: true }
): Promise<UnificallyDryRunQuote>;

export function createUnificallyTask(
  values: CreateUnificallyTaskBase & { dryRun?: false | undefined }
): Promise<UnificallyTask>;

export async function createUnificallyTask(
  values: CreateUnificallyTaskBase & { dryRun?: boolean }
): Promise<UnificallyTask | UnificallyDryRunQuote> {
  const body: Record<string, unknown> = {
    model: values.model,
    input: values.input
  };

  if (values.callbackUrl) body.callback_url = values.callbackUrl;
  if (values.dryRun) body.dry_run = true;

  const response = await fetch(`${apiBaseUrl()}/v1/tasks`, {
    method: "POST",
    headers: authHeaders(values.apiKey),
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(values.timeoutMs ?? 60_000)
  });

  const { text, payload } = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(
      `UNIFICALLY_SUBMIT_FAILED:${response.status}:${String(
        payload?.message ?? payload?.error ?? payload?.data?.message ?? text
      ).slice(0, 500)}`
    );
  }

  const data = unwrapData(payload);

  if (values.dryRun) {
    const cost = Number(data?.cost);
    if (!Number.isFinite(cost) || cost < 0) {
      throw new Error("UNIFICALLY_DRY_RUN_COST_MISSING");
    }
    return { costUsd: cost } as const;
  }

  const task = normalizeTask(data, values.model);
  if (!task.taskId) {
    throw new Error("UNIFICALLY_TASK_ID_MISSING");
  }

  return task;
}

export async function getUnificallyTask(values: {
  apiKey: string;
  taskId: string;
  timeoutMs?: number;
}) {
  const response = await fetch(
    `${apiBaseUrl()}/v1/tasks/${encodeURIComponent(values.taskId)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${values.apiKey}` },
      cache: "no-store",
      signal: AbortSignal.timeout(values.timeoutMs ?? 30_000)
    }
  );

  const { text, payload } = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(
      `UNIFICALLY_TASK_FAILED:${response.status}:${String(
        payload?.message ?? payload?.error ?? payload?.data?.message ?? text
      ).slice(0, 500)}`
    );
  }

  const data = unwrapData(payload);
  const task = normalizeTask(data);
  if (!task.taskId) task.taskId = values.taskId;
  return task;
}

export async function waitForUnificallyTask(values: {
  apiKey: string;
  taskId: string;
  maximumWaitMs: number;
  pollIntervalMs?: number;
}) {
  const startedAt = Date.now();
  const interval = Math.max(values.pollIntervalMs ?? 2_000, 1_500);

  while (Date.now() - startedAt < values.maximumWaitMs) {
    const task = await getUnificallyTask({
      apiKey: values.apiKey,
      taskId: values.taskId
    });

    if (task.status === "completed") return task;

    if (task.status === "failed") {
      throw new Error(
        `UNIFICALLY_TASK_FAILED:${task.error ?? "generation failed"}`
      );
    }

    if (
      task.status !== "processing" &&
      task.status !== "pending" &&
      !TERMINAL_STATUSES.has(task.status)
    ) {
      throw new Error(`UNIFICALLY_TASK_STATUS_UNKNOWN:${task.status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error("UNIFICALLY_TASK_WAIT_TIMEOUT");
}

export function unificallyOutputUrls(task: UnificallyTask) {
  const output = task.output ?? {};
  const urls: string[] = [];

  const imageUrls = output.image_urls;
  if (Array.isArray(imageUrls)) {
    for (const value of imageUrls) {
      if (typeof value === "string" && value.startsWith("https://")) {
        urls.push(value);
      }
    }
  }

  for (const key of ["image_url", "video_url", "audio_url", "url"] as const) {
    const value = output[key];
    if (typeof value === "string" && value.startsWith("https://")) {
      urls.push(value);
    }
  }

  return [...new Set(urls)];
}

export async function downloadUnificallyOutput(values: {
  url: string;
  maximumBytes: number;
  allowedContentTypes: Set<string>;
  fallbackContentType: string;
  timeoutMs?: number;
}) {
  const url = new URL(values.url);
  if (url.protocol !== "https:") {
    throw new Error("UNIFICALLY_OUTPUT_URL_INVALID");
  }

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    redirect: "follow",
    signal: AbortSignal.timeout(values.timeoutMs ?? 120_000)
  });

  if (!response.ok) {
    throw new Error(`UNIFICALLY_OUTPUT_DOWNLOAD_FAILED:${response.status}`);
  }

  const contentLength = Number(response.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > values.maximumBytes
  ) {
    throw new Error("UNIFICALLY_OUTPUT_TOO_LARGE");
  }

  let contentType =
    response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ||
    values.fallbackContentType;

  if (contentType === "image/jpg") contentType = "image/jpeg";

  if (contentType === "application/octet-stream") {
    contentType = values.fallbackContentType;
  }

  if (!values.allowedContentTypes.has(contentType)) {
    throw new Error(`UNIFICALLY_OUTPUT_TYPE_INVALID:${contentType}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > values.maximumBytes) {
    throw new Error("UNIFICALLY_OUTPUT_INVALID");
  }

  return { bytes, contentType };
}

export async function getUnificallyAccount(values: {
  apiKey: string;
  timeoutMs?: number;
}) {
  const response = await fetch(`${apiBaseUrl()}/v1/account`, {
    method: "GET",
    headers: { Authorization: `Bearer ${values.apiKey}` },
    cache: "no-store",
    signal: AbortSignal.timeout(values.timeoutMs ?? 5_000)
  });

  const { text, payload } = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(
      `UNIFICALLY_ACCOUNT_FAILED:${response.status}:${String(
        payload?.message ?? payload?.error ?? payload?.data?.message ?? text
      ).slice(0, 300)}`
    );
  }

  const data = unwrapData(payload);
  const balanceUsd = Number(data?.balance_usd);

  return {
    balanceUsd: Number.isFinite(balanceUsd) ? balanceUsd : null
  };
}
