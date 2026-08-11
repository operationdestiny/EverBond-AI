import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const voiceChatPath = path.join(root, "src/lib/voice-chat.ts");
const voiceTurnPath = path.join(root, "src/app/api/voice/turn/route.ts");
const voiceCallPath = path.join(root, "src/lib/voice-call.ts");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function write(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function replaceRequired(content, from, to, label) {
  if (!content.includes(from)) {
    throw new Error(`Missing expected block for ${label}`);
  }
  return content.replace(from, to);
}

function ensureVoiceChatMode() {
  let content = read(voiceChatPath);

  content = content.replace(
    "const CHARACTER_CONTEXT_MAX_TOKENS = 85;\nconst MODEL_HISTORY_MESSAGE_COUNT = 6;",
    "const CHARACTER_CONTEXT_MAX_TOKENS = 55;\nconst MODEL_HISTORY_MESSAGE_COUNT = 4;"
  );

  const cleanFunction = `
function cleanVoiceSpokenReply(text: string) {
  return text
    .replace(/\\*[^*]{0,220}\\*/g, " ")
    .replace(/\\([^)]{0,160}\\)/g, " ")
    .replace(/\\[[^\\]]{0,160}\\]/g, " ")
    .replace(/^[-•]\\s*/gm, "")
    .replace(/\\b(?:she|he|they)\\s+(?:smiles|laughs|whispers|leans|steps|looks|blushes|gazes|tilts|moves|touches|takes|sighs)[^.!?。！？]{0,180}[.!?。！？]/gi, " ")
    .replace(/\\s+/g, " ")
    .trim();
}
`;

  if (!content.includes("function cleanVoiceSpokenReply")) {
    content = content.replace(
      "export async function generateVoiceCharacterDraft(values: {",
      `${cleanFunction}\nexport async function generateVoiceCharacterDraft(values: {`
    );
  }

  const oldInstruction = `  const voiceInstruction =
    "LIVE VOICE CALL: Reply as natural spoken dialogue with concise actions. " +
    "Use roughly 45-65 visible tokens when detail is needed, fewer for simple moments, " +
    "and never exceed 75 visible tokens. Do not use markdown headings or long narration.";`;

  const newInstruction = `  const voiceInstruction = [
    "LIVE VOICE CALL MODE:",
    "You are speaking out loud in a real-time phone call with the user.",
    "This is not text chat and not written roleplay.",
    "Reply like a real person talking in a private conversation.",
    "Use 1-3 short spoken sentences.",
    "Use mostly dialogue, warmth, emotion, and direct responses.",
    "Avoid stage directions, markdown, narration, scene descriptions, clothing descriptions, and body movement descriptions.",
    "Do not say things like 'she smiles', 'I lean closer', or describe your expression unless it sounds natural when spoken aloud.",
    "Ask one short follow-up question when it helps the conversation continue.",
    "Never mention that this is a prompt, mode, AI system, or voice system."
  ].join("\\n");`;

  content = content.includes(oldInstruction)
    ? content.replace(oldInstruction, newInstruction)
    : content;

  content = content.replace(
    "  const reply = limitVoiceReply(result.content, values.maxReplyCharacters);",
    "  const reply = limitVoiceReply(\n    cleanVoiceSpokenReply(result.content),\n    values.maxReplyCharacters\n  );"
  );

  write(voiceChatPath, content);
}

function ensureFastVoiceTurn() {
  let content = read(voiceTurnPath);

  const oldMemoryBlock = `    const memoryUsage = await updateVoiceMemoryAfterCommit({
      userId: user.id,
      character,
      draft: generated
    });

    return NextResponse.json(`;

  const newMemoryBlock = `    void updateVoiceMemoryAfterCommit({
      userId: user.id,
      character,
      draft: generated
    }).catch((error) => {
      console.error("EverBond voice memory update failed:", error);
    });

    return NextResponse.json(`;

  content = content.includes(oldMemoryBlock)
    ? content.replace(oldMemoryBlock, newMemoryBlock)
    : content;

  content = content.replace(
    "          inputTokens: generated.inputTokens + memoryUsage.inputTokens,\n          outputTokens: generated.outputTokens + memoryUsage.outputTokens,",
    "          inputTokens: generated.inputTokens,\n          outputTokens: generated.outputTokens,"
  );

  write(voiceTurnPath, content);
}

function ensureVoiceLimits() {
  let content = read(voiceCallPath);

  const oldLimits = `    maxReplyCharacters: Math.max(
      120,
      Math.min(integerEnv("VOICE_REPLY_MAX_CHARACTERS", 600, 600), 600)
    ),
    maxTtsCharactersPerMinute: Math.max(
      300,
      Math.min(
        integerEnv("VOICE_TTS_MAX_CHARACTERS_PER_MINUTE", 900, 900),
        900
      )
    )`;

  const newLimits = `    maxReplyCharacters: Math.max(
      80,
      Math.min(integerEnv("VOICE_REPLY_MAX_CHARACTERS", 260, 260), 320)
    ),
    maxTtsCharactersPerMinute: Math.max(
      240,
      Math.min(
        integerEnv("VOICE_TTS_MAX_CHARACTERS_PER_MINUTE", 620, 620),
        700
      )
    )`;

  content = replaceRequired(content, oldLimits, newLimits, "voice call limits");
  write(voiceCallPath, content);
}

ensureVoiceChatMode();
ensureFastVoiceTurn();
ensureVoiceLimits();
console.log("Applied fast voice-call-only conversation mode.");
