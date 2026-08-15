import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const legacyPath = path.join(
  root,
  "scripts",
  "apply-final-chat-video-reliability.mjs"
);
const runtimePath = path.join(
  root,
  "scripts",
  ".apply-final-chat-reliability-only.runtime.mjs"
);
const languagePatchPath = path.join(
  root,
  "scripts",
  "apply-chat-language-lock.mjs"
);

const legacy = fs.readFileSync(legacyPath, "utf8");
const marker = [
  "// ===========================================================================",
  "// TEXT CHAT: reject an empty provider reply so the route can retry/refund"
].join("\n");
const start = legacy.indexOf(marker);

if (start < 0) {
  throw new Error("CHAT_RELIABILITY_SECTION_NOT_FOUND");
}

let chatOnly = legacy.slice(start);
chatOnly = chatOnly.replace(
  "EverBond final chat reset, chat reliability, and Kling O3 R2V patch applied.",
  "EverBond final chat reset and chat reliability patch applied."
);

const header = `import fs from "node:fs";
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
  if (source.includes(from)) return source.replace(from, to);
  if (source.includes(to)) return source;
  throw new Error(\`Final chat reliability patch could not find: \${label}\`);
}

function insertBeforeRequired(source, marker, insertion, alreadyPresent, label) {
  if (source.includes(alreadyPresent)) return source;
  const index = source.indexOf(marker);
  if (index < 0) {
    throw new Error(\`Final chat reliability patch could not find: \${label}\`);
  }
  return source.slice(0, index) + insertion + source.slice(index);
}
`;

fs.writeFileSync(runtimePath, `${header}\n${chatOnly}`, "utf8");

try {
  await import(`${pathToFileURL(runtimePath).href}?build=${Date.now()}`);
} finally {
  fs.rmSync(runtimePath, { force: true });
}

await import(
  `${pathToFileURL(languagePatchPath).href}?build=${Date.now()}`
);
