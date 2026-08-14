import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, source) {
  fs.writeFileSync(path.join(root, relativePath), source, "utf8");
}

function replaceRequired(source, pattern, replacement, label) {
  const next = source.replace(pattern, replacement);
  if (next === source && !source.includes(replacement)) {
    throw new Error(`FINAL_EVERCOIN_PRICING_MISSING:${label}`);
  }
  return next;
}

// Actual image charge used by the image-generation reservation.
{
  const relativePath = "src/lib/evercoin.ts";
  let source = read(relativePath);

  source = replaceRequired(
    source,
    /export const EVERCOIN_IMAGE_COST = \d+;/,
    "export const EVERCOIN_IMAGE_COST = 20;",
    "image-cost"
  );

  source = replaceRequired(
    source,
    /export const EVERCOIN_VIDEO_COST = \d+;/,
    "export const EVERCOIN_VIDEO_COST = 90;",
    "legacy-video-cost"
  );

  write(relativePath, source);
}

// The final WaveSpeed video installer creates this runtime file immediately
// before this script. Patch the single production video charge after install.
{
  const relativePath = "src/lib/wavespeed-video.ts";
  let source = read(relativePath);

  source = replaceRequired(
    source,
    /export const VIDEO_EVERCOIN_COST = \d+;/,
    "export const VIDEO_EVERCOIN_COST = 90;",
    "wavespeed-video-cost"
  );

  write(relativePath, source);
}

// Buy EverCoin: show the exact final prices in the feature cards at the bottom.
// The API still remains the source of truth; these defaults prevent stale
// 15/199 values from flashing before the pricing request completes.
{
  const relativePath = "src/app/coins/page.tsx";
  let source = read(relativePath);

  source = replaceRequired(
    source,
    /const \[imageCost, setImageCost\] = useState\(\d+\);/,
    "const [imageCost, setImageCost] = useState(20);",
    "coins-image-default"
  );

  source = replaceRequired(
    source,
    /const \[videoCost, setVideoCost\] = useState\(\d+\);/,
    "const [videoCost, setVideoCost] = useState(90);",
    "coins-video-default"
  );

  source = source.replace(
    /rate:\s*\n\s*`\$\{pageCopy\.about\} \$\{videoCost\} EverCoin \/ \$\{pageCopy\.videoUnit\}`/,
    "rate: `${videoCost} EverCoin / ${pageCopy.videoUnit}`"
  );

  write(relativePath, source);
}

const evercoin = read("src/lib/evercoin.ts");
const wavespeedVideo = read("src/lib/wavespeed-video.ts");
const coins = read("src/app/coins/page.tsx");

for (const [label, ok] of [
  ["image=20", evercoin.includes("EVERCOIN_IMAGE_COST = 20")],
  ["video=90", wavespeedVideo.includes("VIDEO_EVERCOIN_COST = 90")],
  ["coins-image=20", coins.includes("useState(20)")],
  ["coins-video=90", coins.includes("useState(90)")],
  [
    "coins-video-exact",
    coins.includes("`${videoCost} EverCoin / ${pageCopy.videoUnit}`")
  ],
  [
    "message-price-unchanged",
    coins.includes("`1 EverCoin / ${pageCopy.messageUnit}`")
  ]
]) {
  if (!ok) {
    throw new Error(`FINAL_EVERCOIN_PRICING_VALIDATION_FAILED:${label}`);
  }
}

console.log(
  "EVERBOND_FINAL_PRICING message=1EC image=20EC video=90EC buy-evercoin=updated"
);
