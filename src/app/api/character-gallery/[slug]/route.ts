import { isIP } from "node:net";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import {
  completeCharacterImageRequest,
  everCoinImageCost,
  failCharacterImageRequest,
  startCharacterImageRequest
} from "@/lib/evercoin";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getCharacterBySlugForUser } from "@/lib/user-characters";
import { veniceApiUrl } from "@/lib/venice-media";

export const runtime = "nodejs";
export const maxDuration = 60;

const GALLERY_LIMIT = 5;
const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_GENERATED_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_SOURCE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp"
]);

const GenerateBody = z
  .object({
    requestId: z.string().uuid(),
    prompt: z.string().trim().min(3).max(1500)
  })
  .strict();

const ActionBody = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("select"),
      imageId: z.string().uuid()
    })
    .strict(),
  z
    .object({
      action: z.literal("delete"),
      imageId: z.string().uuid()
    })
    .strict()
]);

type GalleryRow = {
  id: string;
  storage_path: string;
  prompt: string;
  created_at: string;
};

async function signedUrl(path: string) {
  const { data, error } = await getSupabaseServiceClient()
    .storage.from("character-gallery")
    .createSignedUrl(path, 60 * 60);

  if (error) throw error;
  return data.signedUrl;
}

function isPrivateIpAddress(hostname: string) {
  const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();

  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "0.0.0.0" ||
    normalized === "::" ||
    normalized === "::1"
  ) {
    return true;
  }

  if (isIP(normalized) === 4) {
    const parts = normalized.split(".").map(Number);
    return (
      parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 169 && parts[1] === 254) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 0
    );
  }

  if (isIP(normalized) === 6) {
    return (
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe8") ||
      normalized.startsWith("fe9") ||
      normalized.startsWith("fea") ||
      normalized.startsWith("feb")
    );
  }

  return false;
}

function trustedSiteOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;

  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return url.origin;
      }
    } catch {
      // Development falls back to the request origin below.
    }
  }

  return new URL(request.url).origin;
}

function allowedReferenceHosts(request: Request) {
  const hosts = new Set<string>();
  hosts.add(new URL(trustedSiteOrigin(request)).hostname.toLowerCase());

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

  for (const candidate of [supabaseUrl]) {
    if (!candidate) continue;
    try {
      hosts.add(new URL(candidate).hostname.toLowerCase());
    } catch {
      // Invalid optional environment values are ignored here and fail elsewhere.
    }
  }

  for (const host of (process.env.IMAGE_REFERENCE_ALLOWED_HOSTS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)) {
    hosts.add(host);
  }

  return hosts;
}

function parseDataImage(image: string) {
  const match = image.match(
    /^data:(image\/(?:png|jpeg|webp));base64,([a-z0-9+/=\r\n]+)$/i
  );

  if (!match) throw new Error("REFERENCE_IMAGE_INVALID");

  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error("REFERENCE_IMAGE_TOO_LARGE");
  }

  return `data:${match[1].toLowerCase()};base64,${bytes.toString("base64")}`;
}

async function sourceImageDataUrl(request: Request, image: string) {
  if (image.startsWith("data:")) return parseDataImage(image);

  const url = new URL(image, trustedSiteOrigin(request));
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("REFERENCE_IMAGE_INVALID");
  }

  const hostname = url.hostname.toLowerCase();
  if (
    isPrivateIpAddress(hostname) ||
    !allowedReferenceHosts(request).has(hostname)
  ) {
    throw new Error("REFERENCE_IMAGE_HOST_NOT_ALLOWED");
  }

  const response = await fetch(url, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(20_000)
  });

  if (!response.ok) throw new Error("REFERENCE_IMAGE_LOAD_FAILED");

  const contentLength = Number(response.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_SOURCE_IMAGE_BYTES
  ) {
    throw new Error("REFERENCE_IMAGE_TOO_LARGE");
  }

  const contentType =
    response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ||
    "";

  if (!ALLOWED_SOURCE_MIME_TYPES.has(contentType)) {
    throw new Error("REFERENCE_IMAGE_INVALID");
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error("REFERENCE_IMAGE_TOO_LARGE");
  }

  return `data:${contentType};base64,${bytes.toString("base64")}`;
}

async function galleryImageResponse(imageId: string, userId: string) {
  const { data, error } = await getSupabaseServiceClient()
    .from("character_gallery_images")
    .select("id,storage_path,prompt,created_at")
    .eq("id", imageId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const image = data as GalleryRow;
  return {
    id: image.id,
    prompt: image.prompt,
    createdAt: image.created_at,
    url: await signedUrl(image.storage_path)
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "SIGNUP_REQUIRED" }, { status: 401 });
    }

    const { slug } = await params;
    const character = await getCharacterBySlugForUser(slug, user.id);
    if (!character) {
      return NextResponse.json(
        { error: "CHARACTER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const supabase = getSupabaseServiceClient();
    const [
      { data: images, error: imagesError },
      { data: preference, error: preferenceError }
    ] = await Promise.all([
      supabase
        .from("character_gallery_images")
        .select("id,storage_path,prompt,created_at")
        .eq("user_id", user.id)
        .eq("character_id", character.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("user_character_preferences")
        .select("selected_gallery_image_id")
        .eq("user_id", user.id)
        .eq("character_id", character.id)
        .maybeSingle()
    ]);

    if (imagesError) throw imagesError;
    if (preferenceError) throw preferenceError;

    const result = await Promise.all(
      ((images ?? []) as GalleryRow[]).map(async (image) => ({
        id: image.id,
        prompt: image.prompt,
        createdAt: image.created_at,
        url: await signedUrl(image.storage_path)
      }))
    );

    return NextResponse.json(
      {
        character: {
          id: character.id,
          slug: character.slug,
          name: character.name,
          image: character.image
        },
        images: result,
        selectedImageId: preference?.selected_gallery_image_id ?? null,
        limit: GALLERY_LIMIT,
        imageCost: everCoinImageCost()
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "GALLERY_LOAD_FAILED"
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  let userId = "";
  let requestId = "";
  let uploadedPath = "";
  let insertedImageId = "";

  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "SIGNUP_REQUIRED" }, { status: 401 });
    }
    userId = user.id;

    const parsed = GenerateBody.safeParse(
      await request.json().catch(() => null)
    );
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_PROMPT" }, { status: 400 });
    }
    requestId = parsed.data.requestId;

    const { slug } = await params;
    const character = await getCharacterBySlugForUser(slug, user.id);
    if (!character) {
      return NextResponse.json(
        { error: "CHARACTER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const cost = everCoinImageCost();
    const claim = await startCharacterImageRequest({
      userId: user.id,
      requestId,
      characterId: character.id,
      prompt: parsed.data.prompt,
      amount: cost,
      galleryLimit: GALLERY_LIMIT
    });

    if (claim.status === "completed" && claim.imageId) {
      const existingImage = await galleryImageResponse(claim.imageId, user.id);
      if (!existingImage) {
        return NextResponse.json(
          { error: "IMAGE_NOT_FOUND" },
          { status: 410 }
        );
      }

      return NextResponse.json(
        { image: existingImage, duplicate: true },
        { headers: { "Cache-Control": "private, no-store" } }
      );
    }

    if (claim.status === "busy") {
      return NextResponse.json(
        { error: "IMAGE_REQUEST_IN_PROGRESS" },
        { status: 409 }
      );
    }

    if (claim.status === "limit_reached") {
      return NextResponse.json(
        { error: "IMAGE_LIMIT_REACHED" },
        { status: 409 }
      );
    }

    if (claim.status === "insufficient") {
      return NextResponse.json(
        {
          error: claim.errorCode || "INSUFFICIENT_EVERCOIN",
          balance: claim.balance,
          debt: claim.debt,
          required: cost
        },
        { status: 402 }
      );
    }

    if (claim.status !== "claimed") {
      return NextResponse.json(
        { error: claim.errorCode || "REQUEST_FAILED" },
        { status: 409 }
      );
    }

    const apiKey = process.env.VENICE_API_KEY;
    if (!apiKey) throw new Error("VENICE_NOT_CONFIGURED");

    const model = process.env.VENICE_IMAGE_MODEL || "qwen-edit";
    const referenceImage = await sourceImageDataUrl(request, character.image);

    const providerResponse = await fetch(
      veniceApiUrl("image/edit"),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          image: referenceImage,
          aspect_ratio: "4:5",
          prompt:
            `Preserve the exact identity, adult age, face, and recognizable appearance of the fictional character ${character.name}. ` +
            `Create a polished private companion portrait matching this request: ${parsed.data.prompt}`
        }),
        signal: AbortSignal.timeout(55_000)
      }
    );

    if (!providerResponse.ok) {
      const detail = (await providerResponse.text()).slice(0, 500);
      throw new Error(
        `IMAGE_PROVIDER_FAILED:${providerResponse.status}:${detail}`
      );
    }

    const contentType =
      providerResponse.headers
        .get("content-type")
        ?.split(";")[0]
        .trim()
        .toLowerCase() || "image/png";
    if (!ALLOWED_SOURCE_MIME_TYPES.has(contentType)) {
      throw new Error("IMAGE_PROVIDER_RETURNED_INVALID_FILE");
    }

    const imageBytes = Buffer.from(await providerResponse.arrayBuffer());
    if (!imageBytes.length || imageBytes.length > MAX_GENERATED_IMAGE_BYTES) {
      throw new Error("IMAGE_PROVIDER_RETURNED_INVALID_FILE");
    }

    const imageId = crypto.randomUUID();
    insertedImageId = imageId;
    const extension =
      contentType === "image/jpeg"
        ? "jpg"
        : contentType === "image/webp"
          ? "webp"
          : "png";
    uploadedPath = `${user.id}/${character.id}/${imageId}.${extension}`;
    const supabase = getSupabaseServiceClient();

    const upload = await supabase.storage
      .from("character-gallery")
      .upload(uploadedPath, imageBytes, {
        contentType,
        upsert: false,
        cacheControl: "31536000"
      });
    if (upload.error) throw upload.error;

    const { data: inserted, error: insertError } = await supabase
      .from("character_gallery_images")
      .insert({
        id: imageId,
        user_id: user.id,
        character_id: character.id,
        storage_path: uploadedPath,
        prompt: parsed.data.prompt,
        provider: "venice",
        model,
        evercoin_charge: cost
      })
      .select("id,storage_path,prompt,created_at")
      .single();
    if (insertError) throw insertError;

    const responseImage = {
      id: inserted.id,
      prompt: inserted.prompt,
      createdAt: inserted.created_at,
      url: await signedUrl(inserted.storage_path)
    };

    const completed = await completeCharacterImageRequest({
      userId: user.id,
      requestId,
      imageId
    });
    if (!completed) throw new Error("IMAGE_REQUEST_COMPLETION_FAILED");

    return NextResponse.json(
      { image: responseImage },
      {
        status: 201,
        headers: { "Cache-Control": "private, no-store" }
      }
    );
  } catch (error) {
    const errorCode =
      error instanceof Error
        ? error.message.slice(0, 200)
        : "IMAGE_GENERATION_FAILED";

    if (userId && insertedImageId) {
      try {
        await getSupabaseServiceClient()
          .from("character_gallery_images")
          .delete()
          .eq("id", insertedImageId)
          .eq("user_id", userId);
      } catch {
        // The request refund below is the financial source of truth.
      }
    }

    if (uploadedPath) {
      await getSupabaseServiceClient().storage
        .from("character-gallery")
        .remove([uploadedPath])
        .catch(() => undefined);
    }

    if (userId && requestId) {
      await failCharacterImageRequest({
        userId,
        requestId,
        errorCode
      }).catch(() => undefined);
    }

    console.error("Character image generation failed:", error);
    return NextResponse.json(
      { error: "IMAGE_GENERATION_FAILED" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "SIGNUP_REQUIRED" }, { status: 401 });
    }

    const { slug } = await params;
    const character = await getCharacterBySlugForUser(slug, user.id);
    if (!character) {
      return NextResponse.json(
        { error: "CHARACTER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const parsed = ActionBody.safeParse(
      await request.json().catch(() => null)
    );
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    if (parsed.data.action === "select") {
      const { data: image, error } = await supabase
        .from("character_gallery_images")
        .select("id")
        .eq("id", parsed.data.imageId)
        .eq("user_id", user.id)
        .eq("character_id", character.id)
        .maybeSingle();

      if (error) throw error;
      if (!image) {
        return NextResponse.json(
          { error: "IMAGE_NOT_FOUND" },
          { status: 404 }
        );
      }

      const { error: preferenceError } = await supabase
        .from("user_character_preferences")
        .upsert(
          {
            user_id: user.id,
            character_id: character.id,
            selected_gallery_image_id: image.id,
            updated_at: new Date().toISOString()
          },
          { onConflict: "user_id,character_id" }
        );
      if (preferenceError) throw preferenceError;

      return NextResponse.json({ selectedImageId: image.id });
    }

    const { data: image, error: lookupError } = await supabase
      .from("character_gallery_images")
      .select("id,storage_path")
      .eq("id", parsed.data.imageId)
      .eq("user_id", user.id)
      .eq("character_id", character.id)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!image) {
      return NextResponse.json({ error: "IMAGE_NOT_FOUND" }, { status: 404 });
    }

    const { error: preferenceError } = await supabase
      .from("user_character_preferences")
      .update({
        selected_gallery_image_id: null,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id)
      .eq("character_id", character.id)
      .eq("selected_gallery_image_id", image.id);
    if (preferenceError) throw preferenceError;

    const { error: deleteError } = await supabase
      .from("character_gallery_images")
      .delete()
      .eq("id", image.id)
      .eq("user_id", user.id)
      .eq("character_id", character.id);
    if (deleteError) throw deleteError;

    await supabase.storage
      .from("character-gallery")
      .remove([image.storage_path])
      .catch(() => undefined);

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "GALLERY_ACTION_FAILED"
      },
      { status: 500 }
    );
  }
}
