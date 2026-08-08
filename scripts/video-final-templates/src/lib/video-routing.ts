import { veniceApiUrl } from "@/lib/venice-media";
import {
  FALLBACK_VIDEO_MODEL,
  PRIMARY_VIDEO_MODEL,
  VIDEO_ASPECT_RATIO,
  VIDEO_RESOLUTION
} from "@/lib/video-pricing";

export const MAX_GENERATED_VIDEO_BYTES = 100 * 1024 * 1024;

export type ProviderVideoResult =
  | {
      state: "processing";
      averageExecutionTime?: number;
      executionDuration?: number;
    }
  | {
      state: "failed";
      errorCode: string;
    }
  | {
      state: "completed";
      bytes: Buffer;
    };

export type QueuedProviderVideo = {
  model: string;
  queueId: string;
  downloadUrl: string | null;
};

function providerHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
}

function providerPrompt(
  characterName: string,
  userPrompt: string
) {
  return (
    `@Image1 is the exact fictional adult character ${characterName}. ` +
    "Preserve the same recognizable face, identity, adult age, skin tone, hair, and defining appearance throughout the video. " +
    "Use the reference only to preserve character identity. " +
    "The user's request controls the action, pose, expression, clothing, scene, framing, and camera movement. " +
    userPrompt
  );
}

function queuePayload(values: {
  model: string;
  characterName: string;
  prompt: string;
  durationSeconds: number;
  referenceImage: string;
}) {
  const commonPrompt = providerPrompt(
    values.characterName,
    values.prompt
  );

  if (values.model === PRIMARY_VIDEO_MODEL) {
    return {
      model: values.model,
      prompt: commonPrompt,
      duration: String(values.durationSeconds),
      resolution: VIDEO_RESOLUTION,
      aspect_ratio: VIDEO_ASPECT_RATIO,
      referenceImageUrls: [values.referenceImage]
    };
  }

  if (values.model === FALLBACK_VIDEO_MODEL) {
    return {
      model: values.model,
      prompt:
        "Compose the scene as a vertical portrait-oriented video suitable for a 9:16 display. " +
        commonPrompt,
      duration: `${values.durationSeconds}s`,
      resolution: VIDEO_RESOLUTION,
      reference_image_urls: [values.referenceImage]
    };
  }

  throw new Error(`VIDEO_MODEL_NOT_SUPPORTED:${values.model}`);
}

export async function queueProviderVideo(values: {
  apiKey: string;
  model: string;
  characterName: string;
  prompt: string;
  durationSeconds: number;
  referenceImage: string;
}): Promise<QueuedProviderVideo> {
  const response = await fetch(veniceApiUrl("video/queue"), {
    method: "POST",
    headers: providerHeaders(values.apiKey),
    body: JSON.stringify(queuePayload(values)),
    signal: AbortSignal.timeout(60_000)
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 700);
    throw new Error(
      `VIDEO_PROVIDER_QUEUE_FAILED:${values.model}:${response.status}:${detail}`
    );
  }

  const payload = await response.json().catch(() => null);
  const queueId =
    typeof payload?.queue_id === "string"
      ? payload.queue_id
      : typeof payload?.id === "string"
        ? payload.id
        : "";

  if (!queueId) {
    throw new Error(
      `VIDEO_PROVIDER_QUEUE_ID_MISSING:${values.model}`
    );
  }

  return {
    model:
      typeof payload?.model === "string" && payload.model.trim()
        ? payload.model.trim()
        : values.model,
    queueId,
    downloadUrl:
      typeof payload?.download_url === "string"
        ? payload.download_url
        : null
  };
}

export async function cleanupProviderVideo(values: {
  apiKey: string;
  model: string;
  queueId: string;
}) {
  await fetch(veniceApiUrl("video/complete"), {
    method: "POST",
    headers: providerHeaders(values.apiKey),
    body: JSON.stringify({
      model: values.model,
      queue_id: values.queueId
    }),
    signal: AbortSignal.timeout(20_000)
  }).catch(() => undefined);
}

async function downloadProviderUrl(urlValue: string) {
  const url = new URL(urlValue);
  if (url.protocol !== "https:") {
    throw new Error("VIDEO_DOWNLOAD_URL_INVALID");
  }

  const response = await fetch(url, {
    cache: "no-store",
    redirect: "follow",
    signal: AbortSignal.timeout(120_000)
  });

  if (!response.ok) {
    throw new Error(`VIDEO_DOWNLOAD_FAILED:${response.status}`);
  }

  const contentLength = Number(
    response.headers.get("content-length")
  );
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_GENERATED_VIDEO_BYTES
  ) {
    throw new Error("VIDEO_PROVIDER_RETURNED_INVALID_FILE");
  }

  const contentType =
    response.headers
      .get("content-type")
      ?.split(";")[0]
      ?.trim()
      .toLowerCase() || "video/mp4";

  if (
    contentType !== "video/mp4" &&
    contentType !== "application/octet-stream"
  ) {
    throw new Error("VIDEO_PROVIDER_RETURNED_INVALID_FILE");
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (
    !bytes.length ||
    bytes.length > MAX_GENERATED_VIDEO_BYTES
  ) {
    throw new Error("VIDEO_PROVIDER_RETURNED_INVALID_FILE");
  }

  return bytes;
}

export async function retrieveProviderVideo(values: {
  apiKey: string;
  model: string;
  queueId: string;
  downloadUrl: string | null;
}): Promise<ProviderVideoResult> {
  try {
    const response = await fetch(veniceApiUrl("video/retrieve"), {
      method: "POST",
      headers: providerHeaders(values.apiKey),
      body: JSON.stringify({
        model: values.model,
        queue_id: values.queueId,
        delete_media_on_completion: false
      }),
      signal: AbortSignal.timeout(60_000)
    });

    const contentType =
      response.headers
        .get("content-type")
        ?.split(";")[0]
        ?.trim()
        .toLowerCase() || "";

    // Any provider HTTP failure on Grok can immediately trigger Wan.
    // On Wan, the caller treats the same failure as terminal/refundable.
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      return {
        state: "failed",
        errorCode:
          `VIDEO_PROVIDER_FAILED:${values.model}:${response.status}:${detail}`
      };
    }

    if (
      contentType === "video/mp4" ||
      contentType === "application/octet-stream"
    ) {
      const contentLength = Number(
        response.headers.get("content-length")
      );
      if (
        Number.isFinite(contentLength) &&
        contentLength > MAX_GENERATED_VIDEO_BYTES
      ) {
        return {
          state: "failed",
          errorCode: "VIDEO_PROVIDER_RETURNED_INVALID_FILE"
        };
      }

      const bytes = Buffer.from(await response.arrayBuffer());
      if (
        !bytes.length ||
        bytes.length > MAX_GENERATED_VIDEO_BYTES
      ) {
        return {
          state: "failed",
          errorCode: "VIDEO_PROVIDER_RETURNED_INVALID_FILE"
        };
      }

      return { state: "completed", bytes };
    }

    const payload = await response.json().catch(() => null);
    const status = String(
      payload?.status ?? "PROCESSING"
    ).toUpperCase();

    if (status === "COMPLETED") {
      const downloadUrl =
        typeof payload?.download_url === "string"
          ? payload.download_url
          : values.downloadUrl;

      if (!downloadUrl) {
        return {
          state: "failed",
          errorCode: "VIDEO_DOWNLOAD_URL_MISSING"
        };
      }

      try {
        return {
          state: "completed",
          bytes: await downloadProviderUrl(downloadUrl)
        };
      } catch (error) {
        return {
          state: "failed",
          errorCode:
            error instanceof Error
              ? error.message
              : "VIDEO_DOWNLOAD_FAILED"
        };
      }
    }

    if (
      status === "FAILED" ||
      status === "ERROR" ||
      status === "CANCELLED"
    ) {
      return {
        state: "failed",
        errorCode: String(
          payload?.error ?? payload?.message ?? status
        ).slice(0, 200)
      };
    }

    return {
      state: "processing",
      averageExecutionTime: Number(
        payload?.average_execution_time ?? 0
      ),
      executionDuration: Number(
        payload?.execution_duration ?? 0
      )
    };
  } catch (error) {
    return {
      state: "failed",
      errorCode:
        error instanceof Error
          ? error.message.slice(0, 200)
          : "VIDEO_PROVIDER_RETRIEVE_FAILED"
    };
  }
}
