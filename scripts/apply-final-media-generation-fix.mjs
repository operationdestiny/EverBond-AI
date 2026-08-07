#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
}

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) {
    throw new Error(`Final media generation fix could not find: ${label}`);
  }
  return source.replace(from, to);
}

// ---------------------------------------------------------------------------
// IMAGE GENERATION
//
// Use Venice's NATIVE generation endpoint, not the OpenAI-compatible endpoint.
// The character image is a REFERENCE for identity/appearance guidance, while
// Seedream V5 Pro creates a completely new composition from the user's prompt.
//
// Native Venice generation supports:
// - model
// - prompt
// - aspect_ratio
// - resolution
// - format
// - return_binary
// - variants
// - safe_mode
// - style_references
// ---------------------------------------------------------------------------

const imagePath = "src/app/api/character-gallery/[slug]/route.ts";
let imageRoute = read(imagePath);

if (imageRoute.includes('export const maxDuration = 60;')) {
  imageRoute = imageRoute.replace(
    'export const maxDuration = 60;',
    'export const maxDuration = 180;'
  );
}

const imageStartMarkers = [
  '    const model = "seedream-v5-pro";',
  '    const model = process.env.VENICE_IMAGE_MODEL || "seedream-v5-pro-edit";',
  '    const model = "seedream-v5-pro-edit";'
];

let start = -1;
for (const marker of imageStartMarkers) {
  const index = imageRoute.indexOf(marker);
  if (index >= 0) {
    start = index;
    break;
  }
}

const endMarker = '    const imageId = crypto.randomUUID();';
const end = imageRoute.indexOf(endMarker, Math.max(start, 0));

if (start < 0 || end < 0 || end <= start) {
  throw new Error(
    "Final media generation fix could not locate the image provider block."
  );
}

const fixedImageBlock = `    const model = "seedream-v5-pro";
    const referenceImage =
      await activeCharacterReferenceDataUrl({
        request,
        userId: user.id,
        characterId: character.id,
        fallbackImage: character.image
      });

    const generationPayload = {
      model,
      prompt:
        \`The supplied reference image represents the exact fictional adult character \${character.name}. \` +
        "Use the same recognizable person, face, adult age, defining facial features, hair, build, and overall visual identity, but generate a completely new image rather than copying the original composition. " +
        "The user's request controls the new pose, expression, camera angle, framing, clothing, body visibility, action, environment, lighting, and background. " +
        "Do not preserve the original pose, clothing, framing, or background unless the user asks for them. " +
        "When the user requests full body, show the character clearly from head to feet. " +
        "Keep anatomy natural and the character consistently recognizable. " +
        \`User request: \${parsed.data.prompt}\`,
      aspect_ratio: "3:4",
      resolution: "1K",
      format: "png",
      return_binary: false,
      variants: 1,
      safe_mode: false,
      style_references: [
        {
          image: referenceImage,
          strength: 1
        }
      ]
    };

    let providerResponse = await fetch(
      veniceApiUrl("image/generate"),
      {
        method: "POST",
        headers: {
          Authorization: \`Bearer \${apiKey}\`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(generationPayload),
        signal: AbortSignal.timeout(150_000)
      }
    );

    if (
      providerResponse.status === 429 ||
      providerResponse.status === 503
    ) {
      const retryAfterHeader = Number(
        providerResponse.headers.get("retry-after")
      );
      const retryDelay = Number.isFinite(retryAfterHeader)
        ? Math.min(Math.max(retryAfterHeader * 1000, 1000), 8000)
        : 2500;

      await providerResponse.arrayBuffer().catch(() => undefined);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));

      providerResponse = await fetch(
        veniceApiUrl("image/generate"),
        {
          method: "POST",
          headers: {
            Authorization: \`Bearer \${apiKey}\`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(generationPayload),
          signal: AbortSignal.timeout(150_000)
        }
      );
    }

    if (!providerResponse.ok) {
      const detail = (await providerResponse.text()).slice(0, 500);
      const providerCode =
        providerResponse.status === 401
          ? "IMAGE_PROVIDER_AUTH_FAILED"
          : providerResponse.status === 402
            ? "IMAGE_PROVIDER_PAYMENT_REQUIRED"
            : providerResponse.status === 403
              ? "IMAGE_PROVIDER_REGION_BLOCKED"
              : providerResponse.status === 400 ||
                  providerResponse.status === 415 ||
                  providerResponse.status === 422
                ? "IMAGE_PROVIDER_REJECTED"
                : providerResponse.status === 429 ||
                    providerResponse.status === 503
                  ? "IMAGE_PROVIDER_BUSY"
                  : "IMAGE_PROVIDER_FAILED";

      throw new Error(
        \`\${providerCode}:\${providerResponse.status}:\${detail}\`
      );
    }

    const providerContentType =
      providerResponse.headers
        .get("content-type")
        ?.split(";")[0]
        .trim()
        .toLowerCase() || "";

    let contentType = "image/png";
    let imageBytes;

    if (ALLOWED_SOURCE_MIME_TYPES.has(providerContentType)) {
      contentType = providerContentType;
      imageBytes = Buffer.from(
        await providerResponse.arrayBuffer()
      );
    } else {
      const payload = await providerResponse
        .json()
        .catch(() => null);

      const output =
        payload?.images?.[0] ??
        payload?.data?.[0]?.b64_json ??
        payload?.data?.[0]?.url ??
        payload?.image;

      if (typeof output !== "string" || !output.trim()) {
        throw new Error(
          "IMAGE_PROVIDER_RETURNED_INVALID_FILE"
        );
      }

      if (output.startsWith("https://")) {
        const download = await fetch(output, {
          cache: "no-store",
          signal: AbortSignal.timeout(60_000)
        });

        if (!download.ok) {
          throw new Error(
            \`IMAGE_DOWNLOAD_FAILED:\${download.status}\`
          );
        }

        const downloadedType =
          download.headers
            .get("content-type")
            ?.split(";")[0]
            .trim()
            .toLowerCase() || "image/png";

        if (!ALLOWED_SOURCE_MIME_TYPES.has(downloadedType)) {
          throw new Error(
            "IMAGE_PROVIDER_RETURNED_INVALID_FILE"
          );
        }

        contentType = downloadedType;
        imageBytes = Buffer.from(
          await download.arrayBuffer()
        );
      } else {
        let encoded = output.trim();

        const dataUrlMatch = encoded.match(
          /^data:(image\\/(?:png|jpeg|webp));base64,([\\s\\S]+)$/
        );

        if (dataUrlMatch) {
          contentType = dataUrlMatch[1].toLowerCase();
          encoded = dataUrlMatch[2];
        }

        imageBytes = Buffer.from(encoded, "base64");
      }
    }

    if (
      !imageBytes.length ||
      imageBytes.length > MAX_GENERATED_IMAGE_BYTES
    ) {
      throw new Error(
        "IMAGE_PROVIDER_RETURNED_INVALID_FILE"
      );
    }

`;

imageRoute =
  imageRoute.slice(0, start) +
  fixedImageBlock +
  imageRoute.slice(end);

if (
  !imageRoute.includes('const model = "seedream-v5-pro";') ||
  !imageRoute.includes('veniceApiUrl("image/generate")') ||
  !imageRoute.includes('resolution: "1K"') ||
  !imageRoute.includes('aspect_ratio: "3:4"') ||
  !imageRoute.includes("style_references: [") ||
  imageRoute.includes('veniceApiUrl("images/generations")') ||
  imageRoute.includes('veniceApiUrl("image/edit")') ||
  imageRoute.includes('"seedream-v5-pro-edit"')
) {
  throw new Error("Final native Seedream V5 Pro validation failed.");
}

write(imagePath, imageRoute);

// ---------------------------------------------------------------------------
// VIDEO
//
// Leave the current video implementation alone. The separate existing media
// patch already handles dynamic video pricing/model settings.
// ---------------------------------------------------------------------------

console.log(
  "EverBond native Seedream V5 Pro reference-generation fix applied."
);
