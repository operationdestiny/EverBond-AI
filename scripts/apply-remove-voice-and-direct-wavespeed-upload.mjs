import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();

function target(relativePath) {
  return join(root, relativePath);
}

function read(relativePath) {
  return readFileSync(target(relativePath), "utf8");
}

function write(relativePath, content) {
  const filePath = target(relativePath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf8");
}

function exists(relativePath) {
  return existsSync(target(relativePath));
}

function replaceRequired(source, pattern, replacement, label) {
  const next = source.replace(pattern, replacement);
  if (next === source) throw new Error(`VOICE_REMOVE_PATCH_MISSING:${label}`);
  return next;
}

function removeVoiceFromChatToolbar() {
  const path = "src/components/media/ChatMediaBridge.tsx";
  if (!exists(path)) return;

  let source = read(path);

  source = source.replace(
    'import { ImageIcon, Phone, ShoppingBag } from "lucide-react";',
    'import { ImageIcon, ShoppingBag } from "lucide-react";'
  );
  source = source.replace(/\nimport \{ InsufficientEverCoinModal \} from "@\/components\/media\/InsufficientEverCoinModal";/, "");
  source = source.replace(/\nimport \{ VoiceCallModal \} from "@\/components\/media\/VoiceCallModal";/, "");
  source = source.replace(/\nimport \{ MEDIA_COPY \} from "@\/lib\/media-language";/, "");
  source = source.replace(/\n  const copy = MEDIA_COPY\[language\] \?\? MEDIA_COPY\.EN;/, "");
  source = source.replace(/\n  const \[callOpen, setCallOpen\] = useState\(false\);/, "");
  source = source.replace(/\n  const \[coinModal, setCoinModal\] = useState\(false\);/, "");

  source = source.replace(
    /\n\s*<button\n\s*type="button"\n\s*onClick=\{\(\) => requireSession\(\(\) => setCallOpen\(true\)\)\}[\s\S]*?\n\s*<\/button>\n(?=\n\s*<Link)/,
    "\n"
  );

  source = source.replace(
    /\n\s*\{session && \(\n\s*<VoiceCallModal[\s\S]*?\n\s*\)\}\n/,
    "\n"
  );

  source = source.replace(
    /\n\s*<InsufficientEverCoinModal\n\s*open=\{coinModal\}[\s\S]*?\n\s*\/\>\n/,
    "\n"
  );

  for (const forbidden of [
    "VoiceCallModal",
    "setCallOpen",
    "callOpen",
    "Phone size",
    "callCharacter",
    "coinModal"
  ]) {
    if (source.includes(forbidden)) {
      throw new Error(`VOICE_REMOVE_VALIDATION_FAILED:ChatMediaBridge:${forbidden}`);
    }
  }

  write(path, source);
}

function stubVoiceModal() {
  const path = "src/components/media/VoiceCallModal.tsx";
  if (!exists(path)) return;
  write(
    path,
    `"use client";\n\nexport function VoiceCallModal() {\n  return null;\n}\n`
  );
}

function simplifyMediaCopy() {
  const path = "src/lib/media-language.ts";
  if (!exists(path)) return;
  write(
    path,
    `import type { LanguageCode } from "@/lib/site-language";\n\nexport type MediaCopy = {\n  insufficientCoins: string;\n  buyEverCoin: string;\n  mediaError: string;\n};\n\nexport const MEDIA_COPY: Record<LanguageCode, MediaCopy> = {\n  EN: {\n    insufficientCoins: "You do not have enough EverCoin for this request",\n    buyEverCoin: "Buy EverCoin",\n    mediaError: "The request could not be completed."\n  },\n  ES: {\n    insufficientCoins: "No tienes suficiente EverCoin para esta solicitud",\n    buyEverCoin: "Comprar EverCoin",\n    mediaError: "No se pudo completar la solicitud."\n  },\n  FR: {\n    insufficientCoins: "Vous n’avez pas assez d’EverCoin pour cette demande",\n    buyEverCoin: "Acheter des EverCoin",\n    mediaError: "La demande n’a pas pu être effectuée."\n  },\n  DE: {\n    insufficientCoins: "Du hast nicht genug EverCoin für diese Anfrage",\n    buyEverCoin: "EverCoin kaufen",\n    mediaError: "Die Anfrage konnte nicht abgeschlossen werden."\n  },\n  JA: {\n    insufficientCoins: "このリクエストに必要なEverCoinが足りません",\n    buyEverCoin: "EverCoinを購入",\n    mediaError: "リクエストを完了できませんでした。"\n  },\n  KO: {\n    insufficientCoins: "이 요청에 필요한 EverCoin이 부족합니다",\n    buyEverCoin: "EverCoin 구매",\n    mediaError: "요청을 완료할 수 없습니다."\n  }\n};\n`
  );
}

function removeVoiceMarketingCopy() {
  const path = "src/app/why-everbond/page.tsx";
  if (!exists(path)) return;

  let source = read(path);
  source = source.replace(/\n\s*\| "live-video-calls"/g, "");
  source = source.replace(
    /\n\s*\{\n\s*"key": "live-video-calls",[\s\S]*?\n\s*\},(?=\n\s*\{\n\s*"key": "video-generation")/g,
    ""
  );

  const replacements = new Map([
    [", live uncensored voice video calls", ""],
    [", live uncensored voice calls", ""],
    [", live voice calls", ""],
    [", live calls", ""],
    [", videollamadas de voz en directo sin censura", ""],
    [", videollamadas de voz en directo", ""],
    [", appels vidéo vocaux en direct non censurés", ""],
    [", appels vidéo vocaux en direct", ""],
    [", unzensierte Live-Sprach-Videoanrufe", ""],
    [", Live-Sprach-Videoanrufe", ""],
    ["、ライブ音声ビデオ通話", ""],
    [", 라이브 음성 영상 통화", ""],
    [", live uncensored voice video calls,", ","],
    [", live voice calls,", ","],
    [", live calls,", ","]
  ]);

  for (const [before, after] of replacements) {
    source = source.split(before).join(after);
  }

  for (const forbidden of [
    "live-video-calls",
    "voice calls",
    "voice video calls",
    "voice-call",
    "Sprach-Videoanrufe",
    "appels vidéo vocaux",
    "videollamadas de voz",
    "ライブ音声ビデオ通話",
    "라이브 음성 영상 통화"
  ]) {
    if (source.toLowerCase().includes(forbidden.toLowerCase())) {
      throw new Error(`VOICE_WORDING_STILL_PRESENT:why-everbond:${forbidden}`);
    }
  }

  write(path, source);
}

function directUploadHelperSource() {
  return String.raw`async function uploadReferenceImage(apiKey: string, dataUrl: string) {
  const reference = parseReferenceDataUrl(dataUrl);

  const ticketResponse = await fetch(\`${WAVESPEED_API_BASE}/media/uploads\`, {
    method: "POST",
    headers: providerHeaders(apiKey),
    body: JSON.stringify({
      filename: reference.filename,
      size: reference.bytes.length,
      content_type: reference.contentType
    }),
    signal: AbortSignal.timeout(30_000)
  });

  const ticketPayload = await ticketResponse.json().catch(() => null);
  if (!ticketResponse.ok || Number(ticketPayload?.code ?? 200) !== 200) {
    const detail = String(
      ticketPayload?.message ?? \`HTTP_${ticketResponse.status}\`
    ).slice(0, 300);
    throw new Error(\`WAVESPEED_UPLOAD_TICKET_FAILED:${detail}\`);
  }

  const ticket = ticketPayload?.data;
  const upload = ticket?.upload;
  const uploadUrl = typeof upload?.url === "string" ? upload.url : "";
  const uploadMethod =
    typeof upload?.method === "string" ? upload.method.toUpperCase() : "PUT";
  const uploadHeaders =
    upload?.headers && typeof upload.headers === "object" ? upload.headers : {};

  if (!uploadUrl || !uploadUrl.startsWith("https://")) {
    throw new Error("WAVESPEED_UPLOAD_URL_MISSING");
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: uploadMethod,
    headers: uploadHeaders as HeadersInit,
    body: new Uint8Array(reference.bytes),
    signal: AbortSignal.timeout(180_000)
  });

  if (!uploadResponse.ok) {
    const detail = (await uploadResponse.text().catch(() => "")).slice(0, 300);
    throw new Error(
      \`WAVESPEED_DIRECT_UPLOAD_FAILED:${uploadResponse.status}:${detail}\`
    );
  }

  const url =
    typeof ticket?.download_url === "string"
      ? ticket.download_url
      : typeof ticket?.url === "string"
        ? ticket.url
        : "";

  if (!url || !url.startsWith("https://")) {
    throw new Error("WAVESPEED_UPLOAD_URL_MISSING");
  }

  return url;
}

function safetyFieldRejected`;
}

function applyWaveSpeedDirectUpload() {
  for (const path of [
    "src/lib/wavespeed-video.ts",
    "scripts/wavespeed-video-final-templates/src/lib/wavespeed-video.ts"
  ]) {
    if (!exists(path)) continue;

    const before = read(path);
    const after = replaceRequired(
      before,
      /async function uploadReferenceImage\(apiKey: string, dataUrl: string\) \{[\s\S]*?\n\}\n\nfunction safetyFieldRejected/,
      directUploadHelperSource(),
      `wavespeed-direct-upload:${path}`
    );

    if (after.includes("/media/upload/binary")) {
      throw new Error(`WAVESPEED_LEGACY_UPLOAD_STILL_PRESENT:${path}`);
    }
    if (!after.includes("/media/uploads")) {
      throw new Error(`WAVESPEED_DIRECT_UPLOAD_MISSING:${path}`);
    }

    write(path, after);
  }
}

removeVoiceFromChatToolbar();
stubVoiceModal();
simplifyMediaCopy();
removeVoiceMarketingCopy();
applyWaveSpeedDirectUpload();

console.log(
  "EverBond voice-call UI/wording removed; WaveSpeed direct upload enabled."
);
