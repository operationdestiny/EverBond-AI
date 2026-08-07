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
// The character image is an IDENTITY REFERENCE for a brand-new composition.
// It is NOT the canvas to edit.
//
// The earlier pricing patch already rewrites this route to Seedream V5 Pro's
// generation endpoint. This final patch makes that generated request explicit,
// stable, and model-specific:
//   model: seedream-v5-pro
//   endpoint: /images/generations
//   1K output
//   reference image supplied as a conditioning/reference input
//   user prompt remains in control of pose, outfit, scene, framing, etc.
// ---------------------------------------------------------------------------

const imagePath = "src/app/api/character-gallery/[slug]/route.ts";
let imageRoute = read(imagePath);

imageRoute = replaceRequired(
  imageRoute,
  'export const maxDuration = 60;',
  'export const maxDuration = 180;',
  "image route maxDuration"
);

const imageStartMarkers = [
  '    const model = "seedream-v5-pro";',
  '    const model = process.env.VENICE_IMAGE_MODEL || "seedream-v5-pro-edit";',
  '    const model = "seedream-v5-pro-edit";'
];

let start = -1;
for (const marker of imageStartMarkers) {
  start = imageRoute.indexOf(marker);
  if (start >= 0) break;
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
        \`The supplied reference image defines the exact identity and recognizable appearance of the fictional adult character \${character.name}. \` +
        "Use it as an identity reference only, not as an image to edit or preserve as the same composition. " +
        "Generate a completely new image while keeping the same recognizable person, face, adult age, defining features, and overall physical identity. " +
        "The user's request controls what happens in the new image, including pose, expression, camera angle, framing, outfit, body visibility, action, environment, lighting, and background. " +
        "When the user asks for a full-body image, show the character clearly from head to feet. " +
        "Do not copy the original pose, framing, clothing, or background unless the user requests them. " +
        \`User request: \${parsed.data.prompt}\`,
      image: [referenceImage],
      size: "1K",
      aspect_ratio: "3:4",
      response_format: "b64_json",
      output_format: "png",
      n: 1
    };

    let providerResponse = await fetch(
      veniceApiUrl("images/generations"),
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
        veniceApiUrl("images/generations"),
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
        payload?.data?.[0]?.b64_json ??
        payload?.data?.[0]?.url ??
        payload?.images?.[0] ??
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
  !imageRoute.includes('veniceApiUrl("images/generations")') ||
  !imageRoute.includes('image: [referenceImage]') ||
  !imageRoute.includes('size: "1K"') ||
  imageRoute.includes('veniceApiUrl("image/edit")') ||
  imageRoute.includes('"seedream-v5-pro-edit"')
) {
  throw new Error("Final Seedream V5 Pro generation validation failed.");
}

write(imagePath, imageRoute);

// ---------------------------------------------------------------------------
// VIDEO CONFIGURATION
//
// Keep Wan 2.7 Reference-to-Video. Clamp stale/incompatible environment
// overrides to the model's intended supported configuration.
// ---------------------------------------------------------------------------

const pricingPath = "src/lib/video-pricing.ts";
let videoPricing = read(pricingPath);

videoPricing = replaceRequired(
  videoPricing,
  `  const resolution = new Set(["480p", "720p", "1080p"]).has(
    configuredResolution || ""
  )
    ? configuredResolution!
    : DEFAULT_RESOLUTION;`,
  `  const resolution = new Set(["720p", "1080p"]).has(
    configuredResolution || ""
  )
    ? configuredResolution!
    : DEFAULT_RESOLUTION;`,
  "Wan 2.7 supported resolution validation"
);

videoPricing = replaceRequired(
  videoPricing,
  `  const configuredAspectRatio =
    process.env.VENICE_VIDEO_ASPECT_RATIO?.trim();
  const aspectRatio = new Set([
    "1:1",
    "2:3",
    "3:2",
    "3:4",
    "4:3",
    "9:16",
    "16:9",
    "21:9"
  ]).has(configuredAspectRatio || "")
    ? configuredAspectRatio!
    : DEFAULT_ASPECT_RATIO;`,
  `  const configuredAspectRatio =
    process.env.VENICE_VIDEO_ASPECT_RATIO?.trim();
  const aspectRatio = new Set([
    "1:1",
    "3:4",
    "4:3",
    "9:16",
    "16:9"
  ]).has(configuredAspectRatio || "")
    ? configuredAspectRatio!
    : DEFAULT_ASPECT_RATIO;`,
  "Wan 2.7 supported aspect-ratio validation"
);

videoPricing = replaceRequired(
  videoPricing,
  `    model:
      process.env.VENICE_VIDEO_MODEL?.trim() ||
      DEFAULT_VIDEO_MODEL,`,
  `    model: DEFAULT_VIDEO_MODEL,`,
  "fixed Wan 2.7 reference-video model"
);

if (
  !videoPricing.includes('const DEFAULT_VIDEO_MODEL = "wan-2-7-reference-to-video";') ||
  !videoPricing.includes('new Set(["720p", "1080p"])') ||
  videoPricing.includes('"2:3",') ||
  videoPricing.includes('"21:9"')
) {
  throw new Error("Final video pricing/model validation failed.");
}

write(pricingPath, videoPricing);

// ---------------------------------------------------------------------------
// VIDEO QUEUE HARDENING
// ---------------------------------------------------------------------------

const videoPath =
  "src/app/api/character-video-gallery/[slug]/route.ts";
let videoRoute = read(videoPath);

const oldQueueStart =
`    const providerResponse = await fetch(veniceApiUrl("video/queue"), {
      method: "POST",
      headers: providerHeaders(apiKey),
      body: JSON.stringify({
        model,
        prompt:
          \`@Image1 is the exact fictional adult character \${character.name}. \` +
          \`Preserve the same face, identity, age, body, and recognizable appearance throughout the video. \` +
          parsed.data.prompt,
        duration: pricing.duration,
        resolution: pricing.resolution,
        aspect_ratio: pricing.aspectRatio,
        audio: pricing.audio,
        reference_image_urls: [referenceImage],
        negative_prompt:
          "identity drift, different person, face distortion, low resolution, blur, watermark, text, duplicate body parts"
      }),
      signal: AbortSignal.timeout(60_000)
    });

    if (!providerResponse.ok) {
      const detail = (await providerResponse.text()).slice(0, 500);
      throw new Error(
        \`VIDEO_PROVIDER_QUEUE_FAILED:\${providerResponse.status}:\${detail}\`
      );
    }`;

const newQueueStart =
`    const queuePayload = {
      model,
      prompt:
        \`@Image1 is the exact fictional adult character \${character.name}. \` +
        \`Preserve the same face, identity, age, body, and recognizable appearance throughout the video. \` +
        parsed.data.prompt,
      duration: pricing.duration,
      resolution: pricing.resolution,
      aspect_ratio: pricing.aspectRatio,
      audio: pricing.audio,
      reference_image_urls: [referenceImage],
      negative_prompt:
        "identity drift, different person, face distortion, low resolution, blur, watermark, text, duplicate body parts"
    };

    let providerResponse = await fetch(
      veniceApiUrl("video/queue"),
      {
        method: "POST",
        headers: providerHeaders(apiKey),
        body: JSON.stringify(queuePayload),
        signal: AbortSignal.timeout(60_000)
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
        veniceApiUrl("video/queue"),
        {
          method: "POST",
          headers: providerHeaders(apiKey),
          body: JSON.stringify(queuePayload),
          signal: AbortSignal.timeout(60_000)
        }
      );
    }

    if (!providerResponse.ok) {
      const detail = (await providerResponse.text()).slice(0, 500);
      const providerCode =
        providerResponse.status === 401
          ? "VIDEO_PROVIDER_AUTH_FAILED"
          : providerResponse.status === 402
            ? "VIDEO_PROVIDER_PAYMENT_REQUIRED"
            : providerResponse.status === 403
              ? "VIDEO_PROVIDER_REGION_BLOCKED"
              : providerResponse.status === 400 ||
                  providerResponse.status === 422
                ? "VIDEO_PROVIDER_REJECTED"
                : providerResponse.status === 429 ||
                    providerResponse.status === 503
                  ? "VIDEO_PROVIDER_BUSY"
                  : "VIDEO_PROVIDER_QUEUE_FAILED";

      throw new Error(
        \`\${providerCode}:\${providerResponse.status}:\${detail}\`
      );
    }`;

videoRoute = replaceRequired(
  videoRoute,
  oldQueueStart,
  newQueueStart,
  "Venice video queue hardening"
);

if (
  !videoRoute.includes("const queuePayload = {") ||
  !videoRoute.includes("VIDEO_PROVIDER_PAYMENT_REQUIRED") ||
  !videoRoute.includes("reference_image_urls: [referenceImage]")
) {
  throw new Error("Final video generation validation failed.");
}

write(videoPath, videoRoute);

console.log(
  "EverBond final Seedream V5 Pro reference-generation and video fix applied."
);
