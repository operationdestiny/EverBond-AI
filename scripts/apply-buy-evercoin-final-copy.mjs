import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, "utf8");
}

function replaceRequired(content, pattern, replacement, label) {
  if (!pattern.test(content)) {
    throw new Error(
      `Buy EverCoin copy patch could not find: ${label}`
    );
  }

  return content.replace(pattern, replacement);
}

function setStringField(block, field, value) {
  const pattern = new RegExp(
    `(\\n\\s*${field}:\\s*)"(?:\\\\.|[^"\\\\])*"`
  );

  if (!pattern.test(block)) {
    throw new Error(
      `Buy EverCoin copy patch could not find English field: ${field}`
    );
  }

  return block.replace(
    pattern,
    `$1${JSON.stringify(value)}`
  );
}

const copyPath = "src/lib/evercoin-page-language.ts";
let copy = read(copyPath);

const englishStart = copy.indexOf("  EN: {");
const spanishStart = copy.indexOf("\n  ES: {", englishStart);

if (englishStart < 0 || spanishStart < 0) {
  throw new Error(
    "Buy EverCoin copy patch could not isolate the English copy."
  );
}

let english = copy.slice(englishStart, spanishStart);

const englishFields = {
  title: "One currency for everything on EverBond.",
  description:
    "Use EverCoin for uncensored messages, gifts, uncensored companion images, uncensored companion videos, and live uncensored voice calls.",
  messagesTitle: "Messages",
  messagesBody:
    "Say what you actually mean. Explore romance, intimacy, fantasy, comfort, conflict, and roleplay without refusals or watered-down replies.",
  messageUnit: "message",
  imageUnit: "image",
  videosTitle: "Uncensored Companion Videos",
  videosBody:
    "Create premium private videos of your companion.",
  videoUnit: "video",
  imagesTitle: "Uncensored Companion Images",
  imagesBody:
    "Create private images of your companion.",
  voiceCallsTitle: "Live Uncensored Voice Video Calls",
  voiceCallsBody:
    "Talk live with your companion who has the same personality, relationship, and Ever Memory™.",
  about: "Around"
};

for (const [field, value] of Object.entries(englishFields)) {
  english = setStringField(english, field, value);
}

copy =
  copy.slice(0, englishStart) +
  english +
  copy.slice(spanishStart);

for (const required of Object.values(englishFields)) {
  if (!english.includes(JSON.stringify(required))) {
    throw new Error(
      `Buy EverCoin English copy is missing: ${required}`
    );
  }
}

write(copyPath, copy);

const pagePath = "src/app/coins/page.tsx";
let page = read(pagePath);

page = page.replace(
  /\n\s*Sparkles,?/,
  ""
);

page = replaceRequired(
  page,
  /const \[videoCost, setVideoCost\] = useState\(\d+\);/,
  "const [videoCost, setVideoCost] = useState(199);",
  "initial video estimate"
);

page = replaceRequired(
  page,
  /const nextVideoCost = Number\(\s*payload\?\.(?:videoDisplayCost \?\? payload\?\.videoCost|videoCost)\s*\);/,
  "const nextVideoCost = Number(payload?.videoCost);",
  "dynamic exact video cost"
);

if (!page.includes('"EverCoin varies/gift"')) {
  page = replaceRequired(
    page,
    /\{\s*icon:\s*Gift,\s*title:\s*t\("gifts"\),\s*body:\s*t\("giftsBody"\),\s*rate:\s*null\s*\},/,
    `{
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
}

page = page.replace(
  /`\$\{pageCopy\.about\}\s+\$\{videoCost\}\s+EverCoin\s*\/\s*\$\{pageCopy\.videoUnit\}`/,
  "`${pageCopy.about} ${videoCost} EverCoin/${pageCopy.videoUnit}`"
);

page = page.replace(
  /\s*,?\s*\{\s*icon:\s*Sparkles,\s*title:\s*t\("premiumCurrency"\),\s*body:\s*t\("premiumCurrencyBody"\),\s*rate:\s*null\s*\}/,
  ""
);

page = page.replace(
  "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6",
  "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
);

for (const required of [
  "const [videoCost, setVideoCost] = useState(199);",
  "const nextVideoCost = Number(payload?.videoCost);",
  '"EverCoin varies/gift"',
  "`${pageCopy.about} ${videoCost} EverCoin/${pageCopy.videoUnit}`",
  "2xl:grid-cols-5"
]) {
  if (!page.includes(required)) {
    throw new Error(
      `Buy EverCoin page is missing: ${required}`
    );
  }
}

if (/\bSparkles\b/.test(page)) {
  throw new Error(
    "The obsolete Premium Currency card or icon remains."
  );
}

write(pagePath, page);

console.log("Final Buy EverCoin advertising copy is applied.");
