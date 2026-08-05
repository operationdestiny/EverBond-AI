import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, "utf8");
}

function replaceRequired(content, from, to, label) {
  if (content.includes(to)) return content;

  if (!content.includes(from)) {
    throw new Error(
      `Final media pricing patch could not find: ${label}`
    );
  }

  return content.replace(from, to);
}

function replaceRegexRequired(
  content,
  pattern,
  replacement,
  alreadyPresent,
  label
) {
  if (content.includes(alreadyPresent)) return content;

  if (!pattern.test(content)) {
    throw new Error(
      `Final media pricing patch could not find: ${label}`
    );
  }

  return content.replace(pattern, replacement);
}

function replaceAll(content, from, to) {
  return content.split(from).join(to);
}

const evercoinPath = "src/lib/evercoin.ts";
let evercoin = read(evercoinPath);

evercoin = replaceRequired(
  evercoin,
  `export function everCoinCallCostPerMinute() {
  return Math.max(
    integerEnv("EVERCOIN_CALL_COST_PER_MINUTE", 35, 100_000),
    35
  );
}

export const EVERCOIN_IMAGE_COST = 25;
export const EVERCOIN_VIDEO_COST = 40;`,
  `export function everCoinCallCostPerMinute() {
  return 30;
}

export const EVERCOIN_IMAGE_COST = 15;
export const EVERCOIN_VIDEO_COST = 199;`,
  "EverCoin media prices"
);

write(evercoinPath, evercoin);

const voiceModalPath =
  "src/components/media/VoiceCallModal.tsx";
let voiceModal = read(voiceModalPath);

voiceModal = replaceAll(
  voiceModal,
  "const [costPerMinute, setCostPerMinute] = useState(35);",
  "const [costPerMinute, setCostPerMinute] = useState(30);"
);
voiceModal = replaceAll(
  voiceModal,
  "setCostPerMinute(Number(payload.costPerMinute ?? 35));",
  "setCostPerMinute(Number(payload.costPerMinute ?? 30));"
);

if (
  !voiceModal.includes(
    "const [costPerMinute, setCostPerMinute] = useState(30);"
  )
) {
  throw new Error(
    "Final media pricing patch could not set the voice-call display price."
  );
}

write(voiceModalPath, voiceModal);

const imageRoutePath =
  "src/app/api/character-gallery/[slug]/route.ts";
let imageRoute = read(imageRoutePath);

imageRoute = replaceRegexRequired(
  imageRoute,
  /    const model = process\.env\.VENICE_IMAGE_MODEL \|\| "seedream-v5-pro-edit";[\s\S]*?    if \(!imageBytes\.length \|\| imageBytes\.length > MAX_GENERATED_IMAGE_BYTES\) \{\n      throw new Error\("IMAGE_PROVIDER_RETURNED_INVALID_FILE"\);\n    \}/,
  `    const model = "seedream-v5-pro";
    const referenceImage =
      await activeCharacterReferenceDataUrl({
        request,
        userId: user.id,
        characterId: character.id,
        fallbackImage: character.image
      });

    const providerResponse = await fetch(
      veniceApiUrl("images/generations"),
      {
        method: "POST",
        headers: {
          Authorization: \`Bearer \${apiKey}\`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          prompt:
            \`Use the supplied image only as the exact identity reference for the fictional adult character \${character.name}. \` +
            "Generate a completely new 1K composition while preserving the same recognizable face, adult age, identity, and defining appearance. " +
            "You may zoom out, change the camera angle, create a new pose, change the outfit, and create a new background. " +
            "When the request asks for a full-body image, show the character clearly from head to feet. " +
            \`User request: \${parsed.data.prompt}\`,
          image: [referenceImage],
          size: "1K",
          aspect_ratio: "3:4",
          response_format: "b64_json",
          output_format: "png",
          n: 1
        }),
        signal: AbortSignal.timeout(55_000)
      }
    );

    if (!providerResponse.ok) {
      const detail = (await providerResponse.text()).slice(
        0,
        500
      );
      throw new Error(
        \`IMAGE_PROVIDER_FAILED:\${providerResponse.status}:\${detail}\`
      );
    }

    const providerContentType =
      providerResponse.headers
        .get("content-type")
        ?.split(";")[0]
        .trim()
        .toLowerCase() || "";

    let contentType = "image/png";
    let imageBytes: Buffer;

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
          signal: AbortSignal.timeout(30_000)
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
        imageBytes = Buffer.from(await download.arrayBuffer());
      } else {
        let encoded = output.trim();
        const dataUrlMatch = encoded.match(
          /^data:(image\\/(?:png|jpeg|webp));base64,(.+)$/s
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
    }`,
  '"seedream-v5-pro";',
  "Seedream V5 Pro reference generation"
);

write(imageRoutePath, imageRoute);

const videoRoutePath =
  "src/app/api/character-video-gallery/[slug]/route.ts";
let videoRoute = read(videoRoutePath);

videoRoute = replaceRequired(
  videoRoute,
  `import {
  completeCharacterVideoRequest,
  everCoinVideoCost,
  failCharacterVideoRequest,
  setCharacterVideoQueue,
  startCharacterVideoRequest
} from "@/lib/evercoin";`,
  `import {
  completeCharacterVideoRequest,
  failCharacterVideoRequest,
  setCharacterVideoQueue,
  startCharacterVideoRequest
} from "@/lib/evercoin";`,
  "video EverCoin imports"
);

videoRoute = replaceRequired(
  videoRoute,
  'import { veniceApiUrl } from "@/lib/venice-media";',
  `import { veniceApiUrl } from "@/lib/venice-media";
import { quoteEverCoinVideoCost } from "@/lib/video-pricing";`,
  "dynamic video pricing import"
);

if (videoRoute.includes("function videoModel()")) {
  const withoutFixedSettings = videoRoute.replace(
    /function videoModel\(\) \{[\s\S]*?\n\}\n\nfunction videoResolution\(\) \{[\s\S]*?\n\}\n\nfunction videoAspectRatio\(\) \{[\s\S]*?\n\}\n\n/,
    ""
  );

  if (withoutFixedSettings === videoRoute) {
    throw new Error(
      "Final media pricing patch could not remove the obsolete fixed video settings."
    );
  }

  videoRoute = withoutFixedSettings;
}

videoRoute = replaceRequired(
  videoRoute,
  `    const cost = everCoinVideoCost();
    return NextResponse.json(`,
  `    const pricing = await quoteEverCoinVideoCost(
      VIDEO_DURATIONS[0]
    );
    const cost = pricing.everCoinCost;
    return NextResponse.json(`,
  "dynamic video gallery price"
);

videoRoute = replaceRequired(
  videoRoute,
  `        videoCost: cost,
        pricingConfigured: cost > 0,`,
  `        videoCost: cost,
        videoDisplayCost: pricing.displayCost,
        pricingConfigured: true,`,
  "video gallery price response"
);

videoRoute = replaceRequired(
  videoRoute,
  `    const cost = everCoinVideoCost();
    if (cost <= 0) {
      return NextResponse.json(
        { error: "VIDEO_PRICING_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    const { slug } = await params;`,
  `    const pricing = await quoteEverCoinVideoCost(
      parsed.data.durationSeconds
    );
    const cost = pricing.everCoinCost;

    const { slug } = await params;`,
  "quote before video reservation"
);

videoRoute = replaceRequired(
  videoRoute,
  "    const model = videoModel();",
  "    const model = pricing.model;",
  "quoted video model"
);

videoRoute = replaceRequired(
  videoRoute,
  `        duration: \`\${parsed.data.durationSeconds}s\`,
        resolution: videoResolution(),
        aspect_ratio: videoAspectRatio(),
        audio: false,`,
  `        duration: pricing.duration,
        resolution: pricing.resolution,
        aspect_ratio: pricing.aspectRatio,
        audio: pricing.audio,`,
  "quoted video queue inputs"
);

videoRoute = replaceRequired(
  videoRoute,
  `{ status: "processing", requestId },`,
  `{ status: "processing", requestId, everCoinCost: cost },`,
  "video response charge"
);

for (const required of [
  "quoteEverCoinVideoCost(",
  "amount: cost,",
  "required: cost",
  "resolution: pricing.resolution",
  "aspect_ratio: pricing.aspectRatio",
  "audio: pricing.audio"
]) {
  if (!videoRoute.includes(required)) {
    throw new Error(
      `Dynamic video pricing is missing: ${required}`
    );
  }
}

if (videoRoute.includes("everCoinVideoCost()")) {
  throw new Error(
    "The fixed video price is still used in the video route."
  );
}

write(videoRoutePath, videoRoute);

const pricingRoutePath =
  "src/app/api/evercoin/pricing/route.ts";
let pricingRoute = read(pricingRoutePath);

pricingRoute = replaceRequired(
  pricingRoute,
  `  everCoinImageCost,
  everCoinPerDollar,
  everCoinVideoCost
} from "@/lib/evercoin";`,
  `  everCoinImageCost,
  everCoinPerDollar
} from "@/lib/evercoin";
import { quoteEverCoinVideoCost } from "@/lib/video-pricing";`,
  "pricing API imports"
);

pricingRoute = replaceRequired(
  pricingRoute,
  `export async function GET() {
  const videoCost = everCoinVideoCost();`,
  `export async function GET() {
  const videoPricing = await quoteEverCoinVideoCost();
  const videoCost = videoPricing.everCoinCost;`,
  "pricing API video quote"
);

pricingRoute = replaceRequired(
  pricingRoute,
  `      videoCost,
      videoDurationSeconds: 8,`,
  `      videoCost,
      videoDisplayCost: videoPricing.displayCost,
      videoDurationSeconds: videoPricing.durationSeconds,`,
  "pricing API display estimate"
);

pricingRoute = replaceRequired(
  pricingRoute,
  `      videoAudioEnabled: false,
      videoPricingConfigured: videoCost > 0,`,
  `      videoAudioEnabled: videoPricing.audio,
      videoPricingConfigured: true,`,
  "pricing API dynamic configuration"
);

write(pricingRoutePath, pricingRoute);

const pageCopyPath = "src/lib/evercoin-page-language.ts";
let pageCopy = read(pageCopyPath);

pageCopy = replaceRequired(
  pageCopy,
  `    videosBody: string;
    videoUnit: string;
    checkoutFailed: string;`,
  `    videosBody: string;
    videoUnit: string;
    imagesTitle: string;
    imagesBody: string;
    voiceCallsTitle: string;
    voiceCallsBody: string;
    about: string;
    checkoutFailed: string;`,
  "EverCoin page copy fields"
);

const localeAdditions = [
  {
    marker:
      '    videoUnit: "8-second video",\n    checkoutFailed:',
    replacement:
      '    videoUnit: "8-second video",\n    imagesTitle: "Full-Body Companion Images",\n    imagesBody:\n      "Create private 1K images from your companion’s identity reference with new poses, outfits, angles, and backgrounds.",\n    voiceCallsTitle: "Live Voice Calls",\n    voiceCallsBody:\n      "Speak live with your companion using the same personality, relationship, and Ever Memory™.",\n    about: "About",\n    checkoutFailed:'
  },
  {
    marker:
      '    videoUnit: "video de 8 segundos",\n    checkoutFailed:',
    replacement:
      '    videoUnit: "video de 8 segundos",\n    imagesTitle: "Imágenes de cuerpo completo",\n    imagesBody:\n      "Crea imágenes privadas en 1K a partir de la identidad de tu compañero con nuevas poses, ropa, ángulos y fondos.",\n    voiceCallsTitle: "Llamadas de voz en directo",\n    voiceCallsBody:\n      "Habla en directo con tu compañero manteniendo la misma personalidad, relación y Ever Memory™.",\n    about: "Aproximadamente",\n    checkoutFailed:'
  },
  {
    marker:
      '    videoUnit: "vidéo de 8 secondes",\n    checkoutFailed:',
    replacement:
      '    videoUnit: "vidéo de 8 secondes",\n    imagesTitle: "Images du compagnon en pied",\n    imagesBody:\n      "Créez des images privées en 1K à partir de l’identité de votre compagnon avec de nouvelles poses, tenues, perspectives et arrière-plans.",\n    voiceCallsTitle: "Appels vocaux en direct",\n    voiceCallsBody:\n      "Parlez en direct avec votre compagnon en conservant la même personnalité, relation et Ever Memory™.",\n    about: "Environ",\n    checkoutFailed:'
  },
  {
    marker:
      '    videoUnit: "8-Sekunden-Video",\n    checkoutFailed:',
    replacement:
      '    videoUnit: "8-Sekunden-Video",\n    imagesTitle: "Ganzkörperbilder deines Begleiters",\n    imagesBody:\n      "Erstelle private 1K-Bilder aus der Identitätsreferenz deines Begleiters mit neuen Posen, Outfits, Winkeln und Hintergründen.",\n    voiceCallsTitle: "Live-Sprachanrufe",\n    voiceCallsBody:\n      "Sprich live mit deinem Begleiter mit derselben Persönlichkeit, Beziehung und Ever Memory™.",\n    about: "Etwa",\n    checkoutFailed:'
  },
  {
    marker:
      '    videoUnit: "8秒動画",\n    checkoutFailed:',
    replacement:
      '    videoUnit: "8秒動画",\n    imagesTitle: "コンパニオンの全身画像",\n    imagesBody:\n      "コンパニオンの本人参照画像から、新しいポーズ、衣装、角度、背景の非公開1K画像を作成できます。",\n    voiceCallsTitle: "ライブ音声通話",\n    voiceCallsBody:\n      "同じ性格、関係、Ever Memory™を保ったコンパニオンとリアルタイムで話せます。",\n    about: "約",\n    checkoutFailed:'
  },
  {
    marker:
      '    videoUnit: "8초 동영상",\n    checkoutFailed:',
    replacement:
      '    videoUnit: "8초 동영상",\n    imagesTitle: "컴패니언 전신 이미지",\n    imagesBody:\n      "컴패니언의 정체성 참조 이미지로 새로운 포즈, 의상, 각도, 배경의 비공개 1K 이미지를 만드세요.",\n    voiceCallsTitle: "라이브 음성 통화",\n    voiceCallsBody:\n      "같은 성격, 관계, Ever Memory™를 유지하는 컴패니언과 실시간으로 대화하세요.",\n    about: "약",\n    checkoutFailed:'
  }
];

for (const locale of localeAdditions) {
  pageCopy = replaceRequired(
    pageCopy,
    locale.marker,
    locale.replacement,
    `EverCoin localized media copy: ${locale.marker}`
  );
}

const videoBodies = [
  [
    "Create a private eight-second video that preserves your companion's appearance.",
    "Create a private eight-second 720p video that preserves your companion’s appearance. The EverCoin price adjusts automatically with Venice’s current generation cost."
  ],
  [
    "Crea un video privado de ocho segundos que conserve la apariencia de tu compañero.",
    "Crea un video privado de ocho segundos en 720p que conserve la apariencia de tu compañero. El precio en EverCoin se ajusta automáticamente al coste actual de generación de Venice."
  ],
  [
    "Créez une vidéo privée de huit secondes qui préserve l'apparence de votre compagnon.",
    "Créez une vidéo privée de huit secondes en 720p qui préserve l’apparence de votre compagnon. Le prix en EverCoin s’ajuste automatiquement au coût de génération actuel de Venice."
  ],
  [
    "Erstelle ein privates achtsekündiges Video, das das Aussehen deines Begleiters bewahrt.",
    "Erstelle ein privates achtsekündiges 720p-Video, das das Aussehen deines Begleiters bewahrt. Der EverCoin-Preis passt sich automatisch an die aktuellen Venice-Generierungskosten an."
  ],
  [
    "コンパニオンの見た目を保った8秒間の非公開動画を作成します。",
    "コンパニオンの見た目を保った8秒間の非公開720p動画を作成します。EverCoin価格はVeniceの現在の生成コストに合わせて自動調整されます。"
  ],
  [
    "컴패니언의 외모를 유지하는 비공개 8초 동영상을 만드세요.",
    "컴패니언의 외모를 유지하는 비공개 8초 720p 동영상을 만드세요. EverCoin 가격은 Venice의 현재 생성 비용에 맞춰 자동 조정됩니다."
  ]
];

for (const [from, to] of videoBodies) {
  pageCopy = replaceRequired(
    pageCopy,
    from,
    to,
    `EverCoin video advertising: ${from}`
  );
}

write(pageCopyPath, pageCopy);

const coinsPagePath = "src/app/coins/page.tsx";
let coinsPage = read(coinsPagePath);

coinsPage = replaceAll(
  coinsPage,
  "const [callCost, setCallCost] = useState(35);",
  "const [callCost, setCallCost] = useState(30);"
);
coinsPage = replaceAll(
  coinsPage,
  "const [imageCost, setImageCost] = useState(25);",
  "const [imageCost, setImageCost] = useState(15);"
);
coinsPage = replaceAll(
  coinsPage,
  "const [videoCost, setVideoCost] = useState(40);",
  "const [videoCost, setVideoCost] = useState(200);"
);
coinsPage = replaceRequired(
  coinsPage,
  "const nextVideoCost = Number(payload?.videoCost);",
  "const nextVideoCost = Number(payload?.videoDisplayCost ?? payload?.videoCost);",
  "rounded video display price"
);
coinsPage = replaceRequired(
  coinsPage,
  `      icon: ImageIcon,
      title: t("images"),
      body: t("imagesBody"),`,
  `      icon: ImageIcon,
      title: pageCopy.imagesTitle,
      body: pageCopy.imagesBody,`,
  "image advertising copy"
);
coinsPage = replaceRequired(
  coinsPage,
  `      rate: \`\${videoCost} EverCoin / \${pageCopy.videoUnit}\``,
  `      rate: \`\${pageCopy.about} \${videoCost} EverCoin / \${pageCopy.videoUnit}\``,
  "rounded likely video price"
);
coinsPage = replaceRequired(
  coinsPage,
  `      icon: Phone,
      title: t("voiceCalls"),
      body: t("voiceCallsBody"),`,
  `      icon: Phone,
      title: pageCopy.voiceCallsTitle,
      body: pageCopy.voiceCallsBody,`,
  "voice-call advertising copy"
);

write(coinsPagePath, coinsPage);

const whyPath = "src/app/why-everbond/page.tsx";
let why = read(whyPath);

const wordingReplacements = [
  [
    "unrestricted private chats, uncensored image and video creation, live video calls, meaningful gifts",
    "unrestricted private chats, uncensored image and video creation, live voice calls, meaningful gifts"
  ],
  [
    "Live uncensored video calls",
    "Live uncensored voice calls"
  ],
  [
    "Text, images, generated video, live video calls, gifts",
    "Text, images, generated video, live voice calls, gifts"
  ],
  [
    "videollamadas en directo, regalos",
    "llamadas de voz en directo, regalos"
  ],
  [
    "Videollamadas en directo sin censura",
    "Llamadas de voz en directo sin censura"
  ],
  [
    "vídeo generado, videollamadas, regalos",
    "vídeo generado, llamadas de voz, regalos"
  ],
  [
    "des appels vidéo en direct, des cadeaux",
    "des appels vocaux en direct, des cadeaux"
  ],
  [
    "Appels vidéo en direct non censurés",
    "Appels vocaux en direct non censurés"
  ],
  [
    "vidéos générées, appels vidéo, cadeaux",
    "vidéos générées, appels vocaux, cadeaux"
  ],
  [
    "Live-Videoanrufe, bedeutungsvolle Geschenke",
    "Live-Sprachanrufe, bedeutungsvolle Geschenke"
  ],
  [
    "Unzensierte Live-Videoanrufe",
    "Unzensierte Live-Sprachanrufe"
  ],
  [
    "generierte Videos, Videoanrufe, Geschenke",
    "generierte Videos, Sprachanrufe, Geschenke"
  ],
  [
    "ライブビデオ通話、心のこもったギフト",
    "ライブ音声通話、心のこもったギフト"
  ],
  [
    "無検閲のライブビデオ通話",
    "無検閲のライブ音声通話"
  ],
  [
    "生成動画、ビデオ通話、ギフト",
    "生成動画、音声通話、ギフト"
  ],
  [
    "라이브 영상 통화, 의미 있는 선물",
    "라이브 음성 통화, 의미 있는 선물"
  ],
  [
    "무검열 라이브 영상 통화",
    "무검열 라이브 음성 통화"
  ],
  [
    "생성 영상, 영상 통화, 선물",
    "생성 영상, 음성 통화, 선물"
  ]
];

for (const [from, to] of wordingReplacements) {
  why = replaceAll(why, from, to);
}

const imageAdvertising = [
  [
    "Create private images of your companion in the outfit, pose, setting, lighting, and mood you choose, then keep the results inside your personal gallery.",
    "Generate private 1K full-body images from your companion’s identity reference, then change the pose, outfit, camera angle, background, lighting, and mood without losing who they are."
  ],
  [
    "Crea imágenes privadas de tu compañero con la ropa, pose, escenario, iluminación y ambiente que elijas, y guárdalas en tu galería personal.",
    "Genera imágenes privadas de cuerpo completo en 1K desde la identidad de tu compañero y cambia la pose, ropa, ángulo, fondo, iluminación y ambiente sin perder su apariencia."
  ],
  [
    "Créez des images privées de votre compagnon avec la tenue, la pose, le décor, la lumière et l’ambiance de votre choix, puis gardez-les dans votre galerie personnelle.",
    "Générez des images privées en pied en 1K à partir de l’identité de votre compagnon, puis changez la pose, la tenue, l’angle, l’arrière-plan, la lumière et l’ambiance sans perdre son apparence."
  ],
  [
    "Erstelle private Bilder deines Begleiters mit Kleidung, Pose, Umgebung, Licht und Stimmung deiner Wahl und bewahre sie in deiner persönlichen Galerie auf.",
    "Erstelle private 1K-Ganzkörperbilder aus der Identitätsreferenz deines Begleiters und ändere Pose, Outfit, Kamerawinkel, Hintergrund, Licht und Stimmung, ohne seine Identität zu verlieren."
  ],
  [
    "衣装、ポーズ、場所、照明、雰囲気を自由に指定してコンパニオンのプライベート画像を作り、自分だけのギャラリーに保存できます。",
    "コンパニオンの本人参照画像から非公開の1K全身画像を生成し、本人らしさを保ったままポーズ、衣装、角度、背景、照明、雰囲気を変えられます。"
  ],
  [
    "원하는 의상, 포즈, 장소, 조명, 분위기로 컴패니언의 비공개 이미지를 만들고 개인 갤러리에 보관할 수 있습니다.",
    "컴패니언의 정체성 참조 이미지로 비공개 1K 전신 이미지를 만들고, 같은 인물을 유지하면서 포즈, 의상, 각도, 배경, 조명, 분위기를 바꿀 수 있습니다."
  ]
];

for (const [from, to] of imageAdvertising) {
  why = replaceRequired(
    why,
    from,
    to,
    `Why EverBond image copy: ${from}`
  );
}

if (
  /live video calls|Live uncensored video calls|videollamadas|appels vidéo|Videoanrufe|ライブビデオ通話|라이브 영상 통화/.test(
    why
  )
) {
  throw new Error(
    "A video-call phrase remains on the Why EverBond page."
  );
}

write(whyPath, why);

console.log(
  "Final media pricing, dynamic video quotes, Seedream V5 Pro, and voice-call wording are applied."
);
