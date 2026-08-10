#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function replaceExactlyOnce(relativePath, from, to, label) {
  const filePath = path.join(root, relativePath);
  const source = fs.readFileSync(filePath, "utf8");

  if (source.includes(to)) {
    return;
  }

  const occurrences = source.split(from).length - 1;

  if (occurrences !== 1) {
    throw new Error(
      `Exact video wording patch expected one ${label} match; found ${occurrences}.`
    );
  }

  fs.writeFileSync(
    filePath,
    source.replace(from, to),
    "utf8"
  );
}

// 1) Why EverBond page — wording only.
replaceExactlyOnce(
  "src/app/why-everbond/page.tsx",
  '"description": "Turn private ideas and scenes into videos of your companion."',
  '"description": "Turn any custom or original companion image into spicy videos exactly how your companion looks."',
  "Why EverBond video description"
);

// 2) Character gallery — change the FINAL WaveSpeed build rewrite so the
// deployed English empty-state copy is not reverted during prebuild.
replaceExactlyOnce(
  "scripts/apply-final-wavespeed-video-system.mjs",
  `'videoEmpty: "No private videos yet. Click generate video to create a charming video of your companion.",'`,
  `'videoEmpty: "No private videos yet. Click generate video to create a spicy video of your companion from the image currently in use as their chat image.",'`,
  "character gallery final video empty-state description"
);

console.log(
  "EVERBOND_EXACT_VIDEO_WORDING why-everbond=updated gallery-empty=updated other-changes=none"
);
