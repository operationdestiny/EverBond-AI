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
  throw new Error(`Final voice-call fix could not find: ${label}`);
}

// ===========================================================================
// CLIENT PLAYBACK RELIABILITY
//
// A live voice reply currently calls audio.play() only after the full
// STT -> AI -> TTS -> storage round trip. On browsers with autoplay gating,
// that is too late to inherit the user's original tap gesture.
//
// Prime one persistent HTMLAudioElement with a tiny silent WAV while the user
// taps the microphone, then reuse that same element for the real reply.
// ===========================================================================

const modalPath = "src/components/media/VoiceCallModal.tsx";
let modal = read(modalPath);

if (!modal.includes("VOICE_PLAYBACK_UNLOCK")) {
  modal = replaceRequired(
    modal,
    "function apiLanguage(code: string): ApiLanguage {",
    `// VOICE_PLAYBACK_UNLOCK
const SILENT_WAV_DATA_URL =
  "data:audio/wav;base64,UklGRmQBAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

function apiLanguage(code: string): ApiLanguage {`,
    "voice playback unlock marker"
  );

  modal = replaceRequired(
    modal,
    "  const audioRef = useRef<HTMLAudioElement | null>(null);",
    `  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);`,
    "persistent reply audio state"
  );

  modal = replaceRequired(
    modal,
    "  function cleanupMedia() {",
    `  async function unlockReplyAudio() {
    if (audioUnlockedRef.current) return;

    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio();
      audio.preload = "auto";
      audioRef.current = audio;
    }

    const previousOnEnded = audio.onended;
    const previousOnError = audio.onerror;

    try {
      audio.onended = null;
      audio.onerror = null;
      audio.muted = false;
      audio.volume = 1;
      audio.src = SILENT_WAV_DATA_URL;

      // Calling play() here is intentional: this function is entered directly
      // from the microphone button's user gesture.
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audioUnlockedRef.current = true;
    } catch (error) {
      // Desktop browsers may not require priming at all. Keep the live call
      // usable and let the real playback attempt below be the final authority.
      console.warn("Voice playback priming was not accepted:", error);
    } finally {
      audio.onended = previousOnEnded;
      audio.onerror = previousOnError;
      audio.removeAttribute("src");
      audio.load();
    }
  }

  async function playReplyAudio(url: string) {
    let audio = audioRef.current;

    if (!audio) {
      audio = new Audio();
      audio.preload = "auto";
      audioRef.current = audio;
    }

    audio.onended = () => {
      if (openRef.current) {
        lastActivityAtRef.current = Date.now();
        setStatus("idle");
      }
    };

    audio.onerror = () => {
      if (openRef.current) {
        setStatus("idle");
        setError(copy.mediaError);
      }
    };

    audio.src = url;
    audio.load();
    await audio.play();
  }

  function cleanupMedia() {`,
    "voice playback helper functions"
  );

  modal = replaceRequired(
    modal,
    `    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }`,
    `    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    audioUnlockedRef.current = false;`,
    "voice playback cleanup"
  );

  modal = replaceRequired(
    modal,
    `  async function startRecording() {
    if (!started || status !== "idle" || !callIdRef.current) return;

    setError("");`,
    `  async function startRecording() {
    if (!started || status !== "idle" || !callIdRef.current) return;

    // Prime reply playback while this microphone tap still counts as a
    // browser user gesture.
    void unlockReplyAudio();

    setError("");`,
    "prime playback on microphone start"
  );

  modal = replaceRequired(
    modal,
    `  function stopRecording() {
    const recorder = recorderRef.current;`,
    `  function stopRecording() {
    // A manual stop is another user gesture, so use it as a second chance to
    // unlock audio. Automatic stops simply no-op once already unlocked.
    void unlockReplyAudio();

    const recorder = recorderRef.current;`,
    "prime playback on microphone stop"
  );

  modal = replaceRequired(
    modal,
    `      const audio = new Audio(String(payload.audioUrl));
      audioRef.current = audio;

      audio.onended = () => {
        audioRef.current = null;
        if (openRef.current) {
          lastActivityAtRef.current = Date.now();
          setStatus("idle");
        }
      };

      audio.onerror = () => {
        audioRef.current = null;
        if (openRef.current) {
          setStatus("idle");
          setError(copy.mediaError);
        }
      };

      await audio.play();`,
    `      await playReplyAudio(String(payload.audioUrl));`,
    "reuse unlocked audio element"
  );
}

if (
  !modal.includes("VOICE_PLAYBACK_UNLOCK") ||
  !modal.includes("void unlockReplyAudio();") ||
  !modal.includes("await playReplyAudio(String(payload.audioUrl));") ||
  modal.includes("const audio = new Audio(String(payload.audioUrl));")
) {
  throw new Error("Voice playback reliability validation failed.");
}

write(modalPath, modal);

// ===========================================================================
// LIVE-CALL LATENCY: STT
//
// Keep Whisper for Japanese/Korean because Venice's Parakeet option does not
// cover those two EverBond languages. Use Venice's smaller Parakeet model for
// English/Spanish/French/German unless VENICE_STT_MODEL explicitly overrides it.
// ===========================================================================

const turnPath = "src/app/api/voice/turn/route.ts";
let turn = read(turnPath);

if (!turn.includes("VOICE_FAST_STT_SELECTION")) {
  turn = replaceRequired(
    turn,
    `  providerForm.set(
    "model",
    process.env.VENICE_STT_MODEL || "openai/whisper-large-v3"
  );
  providerForm.set("response_format", "json");
  providerForm.set("timestamps", "false");
  providerForm.set("language", STT_LANGUAGE[language]);`,
    `  // VOICE_FAST_STT_SELECTION
  const configuredSttModel =
    process.env.VENICE_STT_MODEL?.trim() || "";
  const sttModel =
    configuredSttModel ||
    (language === "Japanese" || language === "Korean"
      ? "openai/whisper-large-v3"
      : "nvidia/parakeet-tdt-0.6b-v3");

  providerForm.set("model", sttModel);
  providerForm.set("response_format", "json");
  providerForm.set("timestamps", "false");

  // Venice documents the language hint for models such as Whisper. Parakeet
  // auto-detects its supported languages, so do not send an unnecessary hint.
  if (sttModel === "openai/whisper-large-v3") {
    providerForm.set("language", STT_LANGUAGE[language]);
  }`,
    "language-aware fast STT selection"
  );
}

if (
  !turn.includes("VOICE_FAST_STT_SELECTION") ||
  !turn.includes('"nvidia/parakeet-tdt-0.6b-v3"') ||
  !turn.includes('"openai/whisper-large-v3"')
) {
  throw new Error("Voice STT latency validation failed.");
}

write(turnPath, turn);

// ===========================================================================
// LIVE-CALL LATENCY: TTS
//
// Use the smaller private Qwen 3 TTS model by default for live calls. It keeps
// the same Qwen prompt/temperature/top-p interface and the same EverBond voice
// IDs. An explicit VENICE_TTS_CALL_MODEL environment variable still wins.
// ===========================================================================

const voicePath = "src/lib/character-voice.ts";
let voice = read(voicePath);

voice = replaceRequired(
  voice,
  `      "tts-qwen3-1-7b",`,
  `      "tts-qwen3-0-6b",`,
  "live-call default TTS model"
);

if (!voice.includes('"tts-qwen3-0-6b"')) {
  throw new Error("Voice TTS latency validation failed.");
}

write(voicePath, voice);

// ===========================================================================
// LIVE-CALL LATENCY: DATABASE CONTEXT
//
// Memory and recent-message history are independent once the conversation is
// resolved. Load them concurrently instead of paying for two serial Supabase
// round trips before every voice AI reply.
// ===========================================================================

const voiceChatPath = "src/lib/voice-chat.ts";
let voiceChat = read(voiceChatPath);

if (!voiceChat.includes("VOICE_PARALLEL_CONTEXT_LOAD")) {
  voiceChat = replaceRequired(
    voiceChat,
    `  const memory = await loadMemory({
    userId: values.userId,
    characterId: values.character.id,
    conversationMemory: conversation.memory_state
  });
  const history = await loadHistory(conversation.id);`,
    `  // VOICE_PARALLEL_CONTEXT_LOAD
  const [memory, history] = await Promise.all([
    loadMemory({
      userId: values.userId,
      characterId: values.character.id,
      conversationMemory: conversation.memory_state
    }),
    loadHistory(conversation.id)
  ]);`,
    "parallel voice memory/history load"
  );
}

if (
  !voiceChat.includes("VOICE_PARALLEL_CONTEXT_LOAD") ||
  !voiceChat.includes("const [memory, history] = await Promise.all([")
) {
  throw new Error("Voice context latency validation failed.");
}

write(voiceChatPath, voiceChat);

console.log(
  "EVERBOND_VOICE_FINAL playback=gesture-unlocked stt=parakeet-en-es-fr-de+whisper-ja-ko tts=qwen3-0.6b context=parallel continuity=unchanged billing=unchanged"
);
