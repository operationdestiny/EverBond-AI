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
  if (source.includes(from)) return source.replace(from, to);
  throw new Error(`Final runtime fix could not find: ${label}`);
}

// ===========================================================================
// PROFILE REFRESH BUTTON
// The character-profile refresh icon was only a Link to /chat/[slug].
// Make it reset the authenticated persisted chat first, then navigate.
// ===========================================================================

const profilePath =
  "src/components/character/CharacterProfileShell.tsx";
let profile = read(profilePath);

if (!profile.includes(
  'import { useAuth } from "@/components/auth/AuthProvider";'
)) {
  profile = replaceRequired(
    profile,
    'import { FavoriteButton } from "@/components/character/FavoriteButton";',
    'import { FavoriteButton } from "@/components/character/FavoriteButton";\nimport { useAuth } from "@/components/auth/AuthProvider";',
    "profile AuthProvider import"
  );
}

if (!profile.includes("PROFILE_REFRESH_RESETS_CHAT")) {
  profile = replaceRequired(
    profile,
    '  const { t, language } = useSiteLanguage();',
    `  const { t, language } = useSiteLanguage();
  const {
    session,
    authReady,
    openCharacterAuthModal
  } = useAuth();
  const [refreshingChat, setRefreshingChat] =
    useState(false);`,
    "profile auth state"
  );

  profile = replaceRequired(
    profile,
    '  function shareCompanion() {',
    `  // PROFILE_REFRESH_RESETS_CHAT
  async function refreshConversation() {
    if (!authReady || refreshingChat) return;

    if (!session?.access_token) {
      openCharacterAuthModal({
        name: character.name,
        image: character.image
      });
      return;
    }

    setRefreshingChat(true);

    try {
      const response = await fetch(
        \`/api/chat?characterSlug=\${encodeURIComponent(
          character.slug
        )}\`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              \`Bearer \${session.access_token}\`
          },
          cache: "no-store"
        }
      );

      const payload = await response
        .json()
        .catch(() => ({}));

      if (
        !response.ok ||
        typeof payload?.conversationId !== "string" ||
        !payload.conversationId
      ) {
        throw new Error(
          payload?.error || "CHAT_RESET_FAILED"
        );
      }

      window.location.assign(
        \`/chat/\${character.slug}?fresh=\${encodeURIComponent(
          payload.conversationId
        )}\`
      );
    } catch (error) {
      console.error(
        "Profile chat refresh failed:",
        error
      );
      setRefreshingChat(false);
    }
  }

  function shareCompanion() {`,
    "profile refresh function"
  );

  const label =
    'aria-label={t("refresh")}';
  const labelIndex =
    profile.indexOf(label);

  if (labelIndex < 0) {
    throw new Error(
      "Final runtime fix could not find: profile refresh label"
    );
  }

  const linkStart =
    profile.lastIndexOf("<Link", labelIndex);
  const linkEndStart =
    profile.indexOf("</Link>", labelIndex);

  if (
    linkStart < 0 ||
    linkEndStart < 0 ||
    linkEndStart <= linkStart
  ) {
    throw new Error(
      "Final runtime fix could not find: profile refresh Link"
    );
  }

  const linkEnd =
    linkEndStart + "</Link>".length;
  const existingRefresh =
    profile.slice(linkStart, linkEnd);

  if (
    !existingRefresh.includes(
      'href={`/chat/${character.slug}`}'
    ) ||
    !existingRefresh.includes(
      "<RefreshCcw"
    )
  ) {
    throw new Error(
      "Final runtime fix found the wrong profile control."
    );
  }

  const refreshButton = `<button
                    type="button"
                    onClick={() => void refreshConversation()}
                    disabled={!authReady || refreshingChat}
                    className="bond-pink-button flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] text-white disabled:cursor-not-allowed disabled:opacity-55"
                    aria-label={t("refresh")}
                  >
                    <RefreshCcw
                      size={17}
                      className={
                        refreshingChat ? "animate-spin" : ""
                      }
                    />
                  </button>`;

  profile =
    profile.slice(0, linkStart) +
    refreshButton +
    profile.slice(linkEnd);
}

if (
  !profile.includes("PROFILE_REFRESH_RESETS_CHAT") ||
  !profile.includes('method: "DELETE"') ||
  !profile.includes(
    'disabled={!authReady || refreshingChat}'
  )
) {
  throw new Error(
    "Profile Refresh Chat final validation failed."
  );
}

write(profilePath, profile);

// ===========================================================================
// VOICE
// Venice currently reports tts-qwen3-1-7b supports MP3, not Opus.
// Keep the voice model, six permanent assignments, UI, EverMemory, billing,
// and call limits unchanged. Only fix output format/storage extension.
// ===========================================================================

const voiceTurnPath =
  "src/app/api/voice/turn/route.ts";
let voiceTurn = read(voiceTurnPath);

voiceTurn = replaceRequired(
  voiceTurn,
  'export const maxDuration = 60;',
  'export const maxDuration = 180;',
  "voice execution ceiling"
);

voiceTurn = replaceRequired(
  voiceTurn,
  'response_format: "opus"',
  'response_format: "mp3"',
  "Qwen MP3 output"
);

voiceTurn = replaceRequired(
  voiceTurn,
  '    "audio/ogg";',
  '    "audio/mpeg";',
  "MP3 fallback MIME"
);

voiceTurn = replaceRequired(
  voiceTurn,
  'uploadedPath = `${user.id}/${callId}/${requestId}.opus`;',
  'uploadedPath = `${user.id}/${callId}/${requestId}.mp3`;',
  "MP3 storage path"
);

if (
  !voiceTurn.includes(
    'response_format: "mp3"'
  ) ||
  !voiceTurn.includes(
    'uploadedPath = `${user.id}/${callId}/${requestId}.mp3`;'
  ) ||
  voiceTurn.includes(
    'response_format: "opus"'
  )
) {
  throw new Error(
    "Voice MP3 final validation failed."
  );
}

write(voiceTurnPath, voiceTurn);

// ===========================================================================
// VIDEO
// Keep Kling O3 Standard R2V, @Element1, 8 seconds, 9:16, no audio,
// existing EverCoin pricing and refunds.
// Prefer the current queue-schema "8s" spelling and a data URL reference,
// both explicitly supported by Venice. Keep the HTTPS/signed URL fallback.
// ===========================================================================

const videoRoutePath =
  "src/app/api/character-video-gallery/[slug]/route.ts";
let videoRoute = read(videoRoutePath);

const referenceBefore =
  `    const referenceImages = Array.from(
      new Set(
        [
          referenceImageUrl,
          referenceImageDataUrl
        ].filter(`;

const referenceAfter =
  `    const referenceImages = Array.from(
      new Set(
        [
          referenceImageDataUrl,
          referenceImageUrl
        ].filter(`;

videoRoute = replaceRequired(
  videoRoute,
  referenceBefore,
  referenceAfter,
  "Kling reference preference"
);

const durationBefore =
  '    const queueDurationVariants = [\n' +
  '      String(parsed.data.durationSeconds),\n' +
  '      `${parsed.data.durationSeconds}s`\n' +
  '    ];';

const durationAfter =
  '    const queueDurationVariants = [\n' +
  '      `${parsed.data.durationSeconds}s`,\n' +
  '      String(parsed.data.durationSeconds)\n' +
  '    ];';

videoRoute = replaceRequired(
  videoRoute,
  durationBefore,
  durationAfter,
  "Kling duration preference"
);

const pricingPath =
  "src/lib/video-pricing.ts";
const videoPricing = read(pricingPath);

if (
  !videoPricing.includes(
    'const DEFAULT_VIDEO_MODEL = "kling-o3-standard-reference-to-video";'
  ) ||
  !videoRoute.includes(
    "@Element1 is the exact fictional adult character"
  ) ||
  !videoRoute.includes(
    "VIDEO_KLING_QUEUE_RECOVERY"
  ) ||
  !videoRoute.includes(
    "referenceImageDataUrl"
  ) ||
  !videoRoute.includes(
    'aspect_ratio: "9:16"'
  ) ||
  !videoRoute.includes(
    "audio: false"
  )
) {
  throw new Error(
    "Kling final runtime validation failed."
  );
}

write(videoRoutePath, videoRoute);

console.log(
  "EverBond final profile Refresh, MP3 voice, and Kling runtime fixes applied."
);
