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
      `Buy EverCoin copy patch could not find: ${label}`
    );
  }

  return content.replace(from, to);
}

function replaceOneOf(content, candidates, to, label) {
  if (content.includes(to)) return content;

  for (const candidate of candidates) {
    if (content.includes(candidate)) {
      return content.replace(candidate, to);
    }
  }

  throw new Error(
    `Buy EverCoin copy patch could not find: ${label}`
  );
}

const copyPath = "src/lib/evercoin-page-language.ts";
let copy = read(copyPath);

copy = replaceRequired(
  copy,
  "Use EverCoin for messages, gifts, unrestricted companion images, silent companion videos, and premium voice calls.",
  "Use EverCoin for uncensored messages, gifts, uncensored companion images, uncensored companion videos, and live uncensored voice calls.",
  "page description"
);

copy = replaceRequired(
  copy,
  "Keep every bond and story going with one simple balance.",
  "Say what you actually mean. Explore romance, intimacy, fantasy, comfort, conflict, and roleplay without refusals or watered-down replies.",
  "message description"
);

copy = replaceRequired(
  copy,
  'imagesTitle: "Full-Body Companion Images"',
  'imagesTitle: "Uncensored Companion Images"',
  "image title"
);

copy = replaceRequired(
  copy,
  "Create private 1K images from your companion’s identity reference with new poses, outfits, angles, and backgrounds.",
  "Create private images of your companion.",
  "image description"
);

copy = replaceRequired(
  copy,
  'videosTitle: "Companion Videos"',
  'videosTitle: "Uncensored Companion Videos"',
  "video title"
);

copy = replaceRequired(
  copy,
  "Create a private eight-second 720p video that preserves your companion’s appearance. The EverCoin price adjusts automatically with Venice’s current generation cost.",
  "Create premium private videos of your companion.",
  "video description"
);

copy = replaceRequired(
  copy,
  'videoUnit: "8-second video"',
  'videoUnit: "video"',
  "video unit"
);

copy = replaceOneOf(
  copy,
  [
    'voiceCallsTitle: "Live Voice Calls"',
    'voiceCallsTitle: "Live Uncensored Voice Calls"'
  ],
  'voiceCallsTitle: "Live Uncensored Voice Video Calls"',
  "voice-call title"
);

copy = replaceOneOf(
  copy,
  [
    "Speak live with your companion using the same personality, relationship, and Ever Memory™.",
    "Talk live with your companion through a voice-based video-call-style experience using the same personality, relationship, and Ever Memory™."
  ],
  "Talk live with your companion who has the same personality, relationship, and Ever Memory™.",
  "voice-call description"
);

copy = replaceRequired(
  copy,
  'about: "About"',
  'about: "Around"',
  "video estimate prefix"
);

for (const required of [
  "Use EverCoin for uncensored messages, gifts, uncensored companion images, uncensored companion videos, and live uncensored voice calls.",
  "Say what you actually mean. Explore romance, intimacy, fantasy, comfort, conflict, and roleplay without refusals or watered-down replies.",
  'imagesTitle: "Uncensored Companion Images"',
  'videosTitle: "Uncensored Companion Videos"',
  'videoUnit: "video"',
  'voiceCallsTitle: "Live Uncensored Voice Video Calls"',
  'about: "Around"'
]) {
  if (!copy.includes(required)) {
    throw new Error(
      `Buy EverCoin copy is missing: ${required}`
    );
  }
}

write(copyPath, copy);

const pagePath = "src/app/coins/page.tsx";
let page = read(pagePath);

if (page.includes(`  Phone,
  Sparkles
`)) {
  page = page.replace(
    `  Phone,
  Sparkles
`,
    `  Phone
`
  );
} else if (page.includes("Sparkles")) {
  throw new Error(
    "Buy EverCoin copy patch could not remove the premium-currency icon."
  );
}

page = replaceOneOf(
  page,
  [
    "const [videoCost, setVideoCost] = useState(200);",
    "const [videoCost, setVideoCost] = useState(40);"
  ],
  "const [videoCost, setVideoCost] = useState(199);",
  "initial video estimate"
);

page = replaceOneOf(
  page,
  [
    "const nextVideoCost = Number(payload?.videoDisplayCost ?? payload?.videoCost);",
    "const nextVideoCost = Number(payload?.videoCost);"
  ],
  "const nextVideoCost = Number(payload?.videoCost);",
  "dynamic exact video cost"
);

page = replaceRequired(
  page,
  `    { icon: Gift, title: t("gifts"), body: t("giftsBody"), rate: null },`,
  `    {
      icon: Gift,
      title: language === "EN" ? "Gifts" : t("gifts"),
      body:
        language === "EN"
          ? "Unlock romantic, cute, and thoughtful gifts your companion will love."
          : t("giftsBody"),
      rate:
        language === "EN"
          ? "EverCoin varies/gift"
          : null
    },`,
  "gift card"
);

page = replaceRequired(
  page,
  '      rate: `${pageCopy.about} ${videoCost} EverCoin / ${pageCopy.videoUnit}`',
  '      rate: `${pageCopy.about} ${videoCost} EverCoin/${pageCopy.videoUnit}`',
  "video rate wording"
);

const premiumCard = `    },
    {
      icon: Sparkles,
      title: t("premiumCurrency"),
      body: t("premiumCurrencyBody"),
      rate: null
    }
`;

if (page.includes(premiumCard)) {
  page = page.replace(premiumCard, `    }
`);
} else if (page.includes("icon: Sparkles")) {
  throw new Error(
    "Buy EverCoin copy patch could not remove the premium-currency card."
  );
}

page = replaceRequired(
  page,
  "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6",
  "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5",
  "five-card layout"
);

for (const required of [
  "const [videoCost, setVideoCost] = useState(199);",
  "const nextVideoCost = Number(payload?.videoCost);",
  '"EverCoin varies/gift"',
  "EverCoin/${pageCopy.videoUnit}",
  "2xl:grid-cols-5"
]) {
  if (!page.includes(required)) {
    throw new Error(
      `Buy EverCoin page is missing: ${required}`
    );
  }
}

if (page.includes("Sparkles")) {
  throw new Error(
    "The obsolete premium-currency card is still present."
  );
}

write(pagePath, page);

console.log("Final Buy EverCoin advertising copy is applied.");
