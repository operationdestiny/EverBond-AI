import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import {
  chargeEverCoin,
  refundEverCoin
} from "@/lib/evercoin";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getCharacterBySlugForUser } from "@/lib/user-characters";

export const runtime = "nodejs";

const GenerateBody = z
  .object({
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

async function signedUrl(path: string) {
  const { data, error } = await getSupabaseServiceClient()
    .storage.from("character-gallery")
    .createSignedUrl(path, 60 * 60);

  if (error) throw error;
  return data.signedUrl;
}

export async function GET(
  request: Request,
  {
    params
  }: {
    params: Promise<{ slug: string }>;
  }
) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "SIGNUP_REQUIRED" },
        { status: 401 }
      );
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

    const [{ data: images, error: imagesError }, { data: preference, error: preferenceError }] =
      await Promise.all([
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
      (images ?? []).map(async (image) => ({
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
        selectedImageId:
          preference?.selected_gallery_image_id ?? null,
        limit: 5
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
            : "GALLERY_LOAD_FAILED"
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  {
    params
  }: {
    params: Promise<{ slug: string }>;
  }
) {
  const requestId = crypto.randomUUID();
  let chargedAmount = 0;

  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "SIGNUP_REQUIRED" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const character = await getCharacterBySlugForUser(slug, user.id);

    if (!character) {
      return NextResponse.json(
        { error: "CHARACTER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const parsed = GenerateBody.safeParse(
      await request.json().catch(() => null)
    );

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_PROMPT" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    const { count, error: countError } = await supabase
      .from("character_gallery_images")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("character_id", character.id);

    if (countError) throw countError;

    if ((count ?? 0) >= 5) {
      return NextResponse.json(
        { error: "IMAGE_LIMIT_REACHED" },
        { status: 409 }
      );
    }

    chargedAmount = Math.max(
      Number(process.env.EVERCOIN_IMAGE_COST ?? 0) || 0,
      0
    );

    const charge = await chargeEverCoin({
      userId: user.id,
      amount: chargedAmount,
      reason: "character_image_generation",
      referenceId: requestId
    });

    if (!charge.charged) {
      return NextResponse.json(
        {
          error: "INSUFFICIENT_EVERCOIN",
          balance: charge.balance,
          required: chargedAmount
        },
        { status: 402 }
      );
    }

    const apiKey = process.env.VENICE_API_KEY;

    if (!apiKey) {
      throw new Error("VENICE_NOT_CONFIGURED");
    }

    const providerResponse = await fetch(
      "https://api.venice.ai/api/v1/image/edit",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model:
            process.env.VENICE_IMAGE_MODEL ||
            "qwen-edit",
          image: character.image,
          aspect_ratio: "4:5",
          prompt:
            `Preserve the exact identity, face, age, and recognizable appearance of ${character.name}. ` +
            `Create a polished private companion portrait matching this request: ${parsed.data.prompt}`
        })
      }
    );

    if (!providerResponse.ok) {
      const detail = await providerResponse.text();
      throw new Error(
        `IMAGE_PROVIDER_FAILED:${providerResponse.status}:${detail}`
      );
    }

    const imageBytes = await providerResponse.arrayBuffer();
    const imageId = crypto.randomUUID();
    const storagePath = `${user.id}/${character.id}/${imageId}.png`;

    const upload = await supabase.storage
      .from("character-gallery")
      .upload(storagePath, Buffer.from(imageBytes), {
        contentType: "image/png",
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
        storage_path: storagePath,
        prompt: parsed.data.prompt,
        provider: "venice",
        model:
          process.env.VENICE_IMAGE_MODEL ||
          "qwen-edit",
        evercoin_charge: chargedAmount
      })
      .select("id,storage_path,prompt,created_at")
      .single();

    if (insertError) {
      await supabase.storage
        .from("character-gallery")
        .remove([storagePath]);
      throw insertError;
    }

    return NextResponse.json(
      {
        image: {
          id: inserted.id,
          prompt: inserted.prompt,
          createdAt: inserted.created_at,
          url: await signedUrl(inserted.storage_path)
        }
      },
      { status: 201 }
    );
  } catch (error) {
    const user = await getAuthenticatedUser(request).catch(() => null);

    if (user && chargedAmount > 0) {
      await refundEverCoin({
        userId: user.id,
        amount: chargedAmount,
        reason: "character_image_generation_failed",
        referenceId: requestId
      }).catch(() => undefined);
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "IMAGE_GENERATION_FAILED"
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  {
    params
  }: {
    params: Promise<{ slug: string }>;
  }
) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "SIGNUP_REQUIRED" },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: "INVALID_REQUEST" },
        { status: 400 }
      );
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
          {
            onConflict: "user_id,character_id"
          }
        );

      if (preferenceError) throw preferenceError;

      return NextResponse.json({
        selectedImageId: image.id
      });
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
      return NextResponse.json(
        { error: "IMAGE_NOT_FOUND" },
        { status: 404 }
      );
    }

    await supabase
      .from("user_character_preferences")
      .update({
        selected_gallery_image_id: null,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id)
      .eq("character_id", character.id)
      .eq("selected_gallery_image_id", image.id);

    const { error: deleteError } = await supabase
      .from("character_gallery_images")
      .delete()
      .eq("id", image.id)
      .eq("user_id", user.id);

    if (deleteError) throw deleteError;

    await supabase.storage
      .from("character-gallery")
      .remove([image.storage_path]);

    return NextResponse.json({
      deleted: true
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "GALLERY_ACTION_FAILED"
      },
      { status: 500 }
    );
  }
}
