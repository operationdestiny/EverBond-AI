#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function file(relativePath) {
  return path.join(root, relativePath);
}

function patch(relativePath, replacements) {
  const target = file(relativePath);
  let source = fs.readFileSync(target, "utf8");

  for (const [pattern, replacement, label] of replacements) {
    const next = source.replace(pattern, replacement);
    if (next === source && !source.includes(replacement)) {
      throw new Error(`UNIFICALLY_PRICING_PATCH_MISSING:${label}`);
    }
    source = next;
  }

  fs.writeFileSync(target, source, "utf8");
}

patch("src/lib/evercoin.ts", [
  [/export const EVERCOIN_IMAGE_COST = \d+;/, "export const EVERCOIN_IMAGE_COST = 20;", "image-cost"],
  [/export const EVERCOIN_VIDEO_COST = \d+;/, "export const EVERCOIN_VIDEO_COST = 125;", "video-cost"]
]);

patch("src/app/coins/page.tsx", [
  [/const \[imageCost, setImageCost\] = useState\(\d+\);/, "const [imageCost, setImageCost] = useState(20);", "coins-image-default"],
  [/const \[videoCost, setVideoCost\] = useState\(\d+\);/, "const [videoCost, setVideoCost] = useState(125);", "coins-video-default"]
]);

patch("src/components/media/CharacterGalleryClient.tsx", [
  [/const \[videoDuration, setVideoDuration\] = useState\(\d+\);/, "const [videoDuration, setVideoDuration] = useState(10);", "gallery-video-duration"]
]);

console.log("EVERBOND_UNIFICALLY_PRICING image=20EC video=125EC duration=10s");
