import { NextResponse } from "next/server";
import {
  completeCharacterVideoRequest,
  failCharacterVideoRequest
} from "@/lib/evercoin";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { veniceApiUrl } from "@/lib/venice-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BATCH_LIMIT = 5;
const MAX_GENERATED_VIDEO_BYTES = 100 * 1024 * 1024;
const TERMINAL_PROVIDER_STATUSES = new Set(["FAILED", "ERROR", "CANCELLED"]);

type PendingVideoRequest = {
  request_id: string;
  user_id: string;
  character_id: string;
  prompt: string;
  duration_seconds: number | string;
  evercoin_charge: number | string;
  provider_model: string;
  provider_queue_id: string;
  provider_download_url: string | null;
};

type ProviderResult =
  | {
      state: "processing";
    }
  | {
      state: "failed";
      errorCode: string;
    }
  | {
      state: "completed";
      bytes: Buffer;
    };

function providerHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
}

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function providerCleanup(values: {
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
    signal: AbortSignal.timeout(15_000)
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
    signal: AbortSignal.timeout(35_000)
  });

  if (!response.ok) {
    throw new Error(`VIDEO_DOWNLOAD_FAILED:${response.status}`);
  }

  const contentLength = Number(response.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_GENERATED_VIDEO_BYTES
  ) {
    throw new Error("VIDEO_PROVIDER_RETURNED_INVALID_FILE");
  }

  const contentType =
    response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ||
    "video/mp4";
  if (contentType !== "video/mp4" && contentType !== "application/octet-stream") {
    throw new Error("VIDEO_PROVIDER_RETURNED_INVALID_FILE");
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > MAX_GENERATED_VIDEO_BYTES) {
    throw new Error("VIDEO_PROVIDER_RETURNED_INVALID_FILE");
  }

  return bytes;
}

async function retrieveProviderVideo(values: {
  apiKey: string;
  model: string;
  queueId: string;
  downloadUrl: string | null;
}): Promise<ProviderResult> {
  const response = await fetch(veniceApiUrl("video/retrieve"), {
    method: "POST",
    headers: providerHeaders(values.apiKey),
    body: JSON.stringify({
      model: values.model,
      queue_id: values.queueId,
      delete_media_on_completion: false
    }),
    signal: AbortSignal.timeout(25_000)
  });

  const contentType =
    response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ||
    "";

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    const terminal = [400, 401, 402, 403, 404, 410, 413, 415, 422].includes(
      response.status
    );

    if (terminal) {
      return {
        state: "failed",
        errorCode: `VIDEO_PROVIDER_FAILED:${response.status}:${detail}`
      };
    }

    return { state: "processing" };
  }

  if (contentType === "video/mp4" || contentType === "application/octet-stream") {
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > MAX_GENERATED_VIDEO_BYTES) {
      return {
        state: "failed",
        errorCode: "VIDEO_PROVIDER_RETURNED_INVALID_FILE"
      };
    }

    return { state: "completed", bytes };
  }

  const payload = await response.json().catch(() => null);
  const status = String(payload?.status ?? "PROCESSING").toUpperCase();

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
          error instanceof Error ? error.message : "VIDEO_DOWNLOAD_FAILED"
      };
    }
  }

  if (TERMINAL_PROVIDER_STATUSES.has(status)) {
    return {
      state: "failed",
      errorCode: String(payload?.error ?? payload?.message ?? status).slice(0, 200)
    };
  }

  return { state: "processing" };
}

async function finalizeVideo(request: PendingVideoRequest, bytes: Buffer) {
  const videoId = request.request_id;
  const storagePath = `${request.user_id}/${request.character_id}/${videoId}.mp4`;
  const supabase = getSupabaseServiceClient();

  const upload = await supabase.storage
    .from("character-videos")
    .upload(storagePath, bytes, {
      contentType: "video/mp4",
      cacheControl: "31536000",
      upsert: true
    });
  if (upload.error) throw upload.error;

  const { error: upsertError } = await supabase
    .from("character_gallery_videos")
    .upsert(
      {
        id: videoId,
        user_id: request.user_id,
        character_id: request.character_id,
        storage_path: storagePath,
        prompt: request.prompt,
        duration_seconds: Number(request.duration_seconds),
        provider: "venice",
        model: request.provider_model,
        evercoin_charge: Number(request.evercoin_charge)
      },
      { onConflict: "id" }
    );
  if (upsertError) throw upsertError;

  const completed = await completeCharacterVideoRequest({
    userId: request.user_id,
    requestId: request.request_id,
    videoId
  });

  if (!completed) {
    await supabase
      .from("character_gallery_videos")
      .delete()
      .eq("id", videoId)
      .eq("user_id", request.user_id);
    await supabase.storage
      .from("character-videos")
      .remove([storagePath])
      .catch(() => undefined);
    throw new Error("VIDEO_REQUEST_COMPLETION_FAILED");
  }
}

async function processRequest(request: PendingVideoRequest, apiKey: string) {
  const retrieved = await retrieveProviderVideo({
    apiKey,
    model: request.provider_model,
    queueId: request.provider_queue_id,
    downloadUrl: request.provider_download_url
  });

  if (retrieved.state === "processing") return "processing" as const;

  if (retrieved.state === "failed") {
    await failCharacterVideoRequest({
      userId: request.user_id,
      requestId: request.request_id,
      errorCode: retrieved.errorCode
    });
    await providerCleanup({
      apiKey,
      model: request.provider_model,
      queueId: request.provider_queue_id
    });
    return "failed" as const;
  }

  await finalizeVideo(request, retrieved.bytes);
  await providerCleanup({
    apiKey,
    model: request.provider_model,
    queueId: request.provider_queue_id
  });
  return "completed" as const;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const apiKey = process.env.VENICE_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "VENICE_NOT_CONFIGURED" }, { status: 503 });
  }

  const { data, error } = await getSupabaseServiceClient()
    .from("character_video_requests")
    .select(
      "request_id,user_id,character_id,prompt,duration_seconds,evercoin_charge,provider_model,provider_queue_id,provider_download_url"
    )
    .eq("status", "processing")
    .not("provider_queue_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(BATCH_LIMIT);

  if (error) {
    console.error("Video recovery query failed:", error);
    return NextResponse.json({ error: "VIDEO_RECOVERY_QUERY_FAILED" }, { status: 500 });
  }

  const pending: PendingVideoRequest[] = (data ?? []).flatMap(
    (row: Record<string, unknown>) =>
      typeof row.provider_queue_id === "string" && row.provider_queue_id.length > 0
        ? [row as PendingVideoRequest]
        : []
  );

  const settled = await Promise.allSettled(
    pending.map((row) => processRequest(row, apiKey))
  );

  const summary = {
    checked: pending.length,
    completed: 0,
    failed: 0,
    processing: 0,
    errors: 0
  };

  for (const result of settled) {
    if (result.status === "rejected") {
      summary.errors += 1;
      console.error("Video recovery item failed:", result.reason);
      continue;
    }
    summary[result.value] += 1;
  }

  return NextResponse.json(summary, {
    headers: { "Cache-Control": "private, no-store" }
  });
}
