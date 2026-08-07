#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, "utf8");
}

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;

  if (!source.includes(from)) {
    throw new Error(
      `Permanent character voice patch could not find: ${label}`
    );
  }

  return source.replace(from, to);
}

const characterVoicePath = "src/lib/character-voice.ts";

write(
  characterVoicePath,
  `import type { Character } from "@/types/character";

const FEMALE_VOICES = [
  "Serena",
  "Vivian",
  "Sohee",
  "Ono_Anna"
] as const;

const MALE_VOICES = ["Aiden", "Ryan"] as const;

type FemaleVoice = (typeof FEMALE_VOICES)[number];
type MaleVoice = (typeof MALE_VOICES)[number];
type CharacterVoiceId = FemaleVoice | MaleVoice;

export type CharacterVoiceMemoryContext = {
  emotionalState?: string | null;
  relationshipState?: string | null;
  currentScene?: Record<string, unknown> | null;
  reply?: string | null;
};

export type CharacterVoiceConfig = {
  model: string;
  voice: CharacterVoiceId;
  prompt: string;
  speed: number;
  temperature: number;
  topP: number;
};

function objectFrom(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringFrom(value: unknown) {
  return typeof value === "string"
    ? value.replace(/\\\\s+/g, " ").trim()
    : "";
}

function numberFrom(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number
) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, minimum), maximum);
}

function isFemaleVoice(value: string): value is FemaleVoice {
  return (FEMALE_VOICES as readonly string[]).includes(value);
}

function isMaleVoice(value: string): value is MaleVoice {
  return (MALE_VOICES as readonly string[]).includes(value);
}

function voiceGender(character: Character) {
  if (
    character.voiceGender === "female" ||
    character.voiceGender === "male"
  ) {
    return character.voiceGender;
  }

  if (character.gender === "female" || character.gender === "male") {
    return character.gender;
  }

  return null;
}

function intensity(value: number) {
  if (value >= 0.78) return "high";
  if (value >= 0.52) return "balanced";
  return "subtle";
}

function sceneSummary(value: unknown) {
  const scene = objectFrom(value);

  return [
    stringFrom(scene.location),
    stringFrom(scene.current_action),
    stringFrom(scene.character_position)
  ]
    .filter(Boolean)
    .join("; ")
    .slice(0, 100);
}

function immediateDelivery(reply: string) {
  const trimmed = reply.trim();

  if (!trimmed) return "";

  if (/[!?]{2,}/.test(trimmed)) {
    return "The immediate line carries heightened emotional energy.";
  }

  if (/…|\\.\\.\\./.test(trimmed)) {
    return "The immediate line is intimate, hesitant, or reflective.";
  }

  if (/\\?$/.test(trimmed)) {
    return "The immediate line is curious and attentive.";
  }

  if (/!$/.test(trimmed)) {
    return "The immediate line is lively and emphatic.";
  }

  return "Keep the immediate line natural and emotionally present.";
}

function characterDelivery(character: Character, flags: Record<string, unknown>) {
  const profile = objectFrom(character.aiProfile);
  const speech = objectFrom(profile.speech_style);
  const personality = objectFrom(profile.personality_core);
  const romance = objectFrom(profile.romantic_dynamic);

  return [
    stringFrom(flags.voice_delivery),
    stringFrom(speech.voice),
    stringFrom(speech.sentence_style),
    stringFrom(personality.description),
    stringFrom(romance.affection_style),
    character.card?.speechStyle
  ]
    .filter(Boolean)
    .join("; ")
    .slice(0, 210);
}

function buildVoicePrompt(
  character: Character,
  flags: Record<string, unknown>,
  context: CharacterVoiceMemoryContext
) {
  const energy = numberFrom(flags.voice_energy, 0.6, 0, 1);
  const warmth = numberFrom(flags.voice_warmth, 0.7, 0, 1);
  const confidence = numberFrom(
    flags.voice_confidence,
    0.65,
    0,
    1
  );

  const relationship = stringFrom(context.relationshipState);
  const emotion = stringFrom(context.emotionalState);
  const scene = sceneSummary(context.currentScene);
  const reply = stringFrom(context.reply);

  return [
    \`Keep \${character.name}'s exact permanent base voice identity. Never switch speakers, accents, age impression, or voice identity.\`,
    \`Character delivery: \${characterDelivery(character, flags) || "natural, intimate, emotionally aware conversation"}.\`,
    \`Stable baseline: \${intensity(energy)} energy, \${intensity(warmth)} warmth, and \${intensity(confidence)} confidence.\`,
    stringFrom(flags.voice_emotion)
      ? \`Emotional baseline: \${stringFrom(flags.voice_emotion)}.\`
      : "",
    relationship
      ? \`Current EverMemory relationship: \${relationship.slice(0, 90)}.\`
      : "",
    emotion
      ? \`Current EverMemory emotion: \${emotion.slice(0, 90)}.\`
      : "",
    scene ? \`Current scene: \${scene}.\` : "",
    immediateDelivery(reply),
    "Express the present feeling naturally without robotic pacing, announcer cadence, or exaggerated acting."
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 500);
}

export function getCharacterVoiceConfig(
  character: Character,
  context: CharacterVoiceMemoryContext = {}
): CharacterVoiceConfig | null {
  const flags = objectFrom(character.featureFlags);

  if (flags.voice_enabled === false) return null;

  const gender = voiceGender(character);
  const voice = stringFrom(flags.voice_id);

  if (!gender || !voice) return null;

  let resolvedVoice: CharacterVoiceId;

  if (gender === "female") {
    if (!isFemaleVoice(voice)) return null;
    resolvedVoice = voice;
  } else {
    if (!isMaleVoice(voice)) return null;
    resolvedVoice = voice;
  }

  return {
    model:
      stringFrom(process.env.VENICE_TTS_CALL_MODEL) ||
      "tts-qwen3-1-7b",
    voice: resolvedVoice,
    prompt: buildVoicePrompt(character, flags, context),
    speed: numberFrom(flags.voice_speed, 0.96, 0.84, 1.1),
    temperature: numberFrom(
      flags.voice_temperature,
      0.8,
      0.62,
      0.96
    ),
    topP: numberFrom(flags.voice_top_p, 0.94, 0.86, 0.99)
  };
}
`
);

for (const relativePath of [
  "src/lib/characters-db.ts",
  "src/lib/user-characters.ts"
]) {
  let source = read(relativePath);

  source = replaceRequired(
    source,
    `  category: CharacterCategory | string;
  role: string;`,
    `  category: CharacterCategory | string;
  voice_gender?: "female" | "male" | "neutral" | null;
  role: string;`,
    `${relativePath} voice_gender row field`
  );

  source = replaceRequired(
    source,
    `"id,slug,name,section,category,role,relationship_pace`,
    `"id,slug,name,section,category,voice_gender,role,relationship_pace`,
    `${relativePath} voice_gender select`
  );

  if (!source.includes("const voiceGender =")) {
    source = replaceRequired(
      source,
      `  const publicCategory = isListedPublic ? storedCategory : undefined;

  const traits = arrayFrom(core.traits);`,
      `  const publicCategory = isListedPublic ? storedCategory : undefined;
  const voiceGender =
    row.voice_gender === "female" || row.voice_gender === "male"
      ? row.voice_gender
      : storedCategory === "everbond-guys"
        ? "male"
        : storedCategory === "everbond-girls" ||
            storedCategory === "anime-fantasy"
          ? "female"
          : "neutral";

  const traits = arrayFrom(core.traits);`,
      `${relativePath} runtime voice gender`
    );
  }

  source = replaceRequired(
    source,
    `    gender:
      publicCategory === "everbond-guys"
        ? "male"
        : publicCategory
          ? "female"
          : "neutral",
    voiceGender:
      publicCategory === "everbond-guys"
        ? "male"
        : publicCategory
          ? "female"
          : "neutral",`,
    `    gender: voiceGender,
    voiceGender,`,
    `${relativePath} character gender mapping`
  );

  write(relativePath, source);
}

const voiceTurnPath = "src/app/api/voice/turn/route.ts";
let voiceTurn = read(voiceTurnPath);

voiceTurn = replaceRequired(
  voiceTurn,
  `  text: string;
  language: SupportedLanguage;
}) {`,
  `  text: string;
  language: SupportedLanguage;
  memory: Awaited<
    ReturnType<typeof generateVoiceCharacterDraft>
  >["memory"];
}) {`,
  "voice turn memory input"
);

voiceTurn = replaceRequired(
  voiceTurn,
  `  const voice = getCharacterVoiceConfig(character);
  if (!voice) throw new Error("VOICE_NOT_CONFIGURED");`,
  `  const voice = getCharacterVoiceConfig(character, {
    reply: values.text,
    emotionalState: values.memory.emotional_state,
    relationshipState: values.memory.relationship_state,
    currentScene: values.memory.current_scene
  });
  if (!voice) throw new Error("VOICE_NOT_CONFIGURED");`,
  "EverMemory-aware TTS configuration"
);

voiceTurn = replaceRequired(
  voiceTurn,
  `      text: generated.reply,
      language: parsed.data.language
    });`,
  `      text: generated.reply,
      language: parsed.data.language,
      memory: generated.memory
    });`,
  "voice turn memory forwarding"
);

write(voiceTurnPath, voiceTurn);

const createRoutePath = "src/app/api/characters/route.ts";
let createRoute = read(createRoutePath);

createRoute = replaceRequired(
  createRoute,
  `    firstMessage: z.string().trim().min(1).max(100),
    visibility: z.enum(["private", "unlisted"])`,
  `    firstMessage: z.string().trim().min(1).max(100),
    voiceGender: z.enum(["female", "male"]),
    visibility: z.enum(["private", "unlisted"])`,
  "new character voice gender schema"
);

createRoute = replaceRequired(
  createRoute,
  `      firstMessage: formData.get("firstMessage"),
      visibility: formData.get("visibility")`,
  `      firstMessage: formData.get("firstMessage"),
      voiceGender: formData.get("voiceGender"),
      visibility: formData.get("visibility")`,
  "new character voice gender parsing"
);

createRoute = replaceRequired(
  createRoute,
  `        category: "public-creations",
        role: parsed.data.temperament,`,
  `        category: "public-creations",
        voice_gender: parsed.data.voiceGender,
        role: parsed.data.temperament,`,
  "new character voice gender storage"
);

createRoute = replaceRequired(
  createRoute,
  `        feature_flags: {
          voice_enabled: false,
          image_generation_enabled: false,`,
  `        feature_flags: {
          voice_enabled: true,
          image_generation_enabled: false,`,
  "new character voice enabled"
);

write(createRoutePath, createRoute);

const createFormPath = "src/components/create/LockedCreateForm.tsx";
let createForm = read(createFormPath);

if (!createForm.includes("type VoiceGender")) {
  createForm = replaceRequired(
    createForm,
    `type Visibility = "private" | "unlisted";`,
    `type Visibility = "private" | "unlisted";
type VoiceGender = "" | "female" | "male";`,
    "voice gender form type"
  );
}

if (!createForm.includes("const [voiceGender, setVoiceGender]")) {
  createForm = replaceRequired(
    createForm,
    `  const [firstMessage, setFirstMessage] = useState("");
  const [visibility, setVisibility] =`,
    `  const [firstMessage, setFirstMessage] = useState("");
  const [voiceGender, setVoiceGender] =
    useState<VoiceGender>("");
  const [visibility, setVisibility] =`,
    "voice gender form state"
  );
}

createForm = replaceRequired(
  createForm,
  `      !openingScenario.trim() ||
      !firstMessage.trim()
    ) {`,
  `      !openingScenario.trim() ||
      !firstMessage.trim() ||
      !voiceGender
    ) {`,
  "voice gender required validation"
);

createForm = replaceRequired(
  createForm,
  `      formData.set("firstMessage", firstMessage.trim());
      formData.set("visibility", visibility);`,
  `      formData.set("firstMessage", firstMessage.trim());
      formData.set("voiceGender", voiceGender);
      formData.set("visibility", visibility);`,
  "voice gender form submission"
);

if (!createForm.includes('id="character-voice-gender-help"')) {
  const voiceUi = `          <div className="space-y-3 md:col-span-2">
            <p className="text-sm font-semibold text-bond-muted">
              {language === "ES"
                ? "Género y voz del personaje"
                : language === "FR"
                  ? "Genre et voix du personnage"
                  : language === "DE"
                    ? "Geschlecht und Stimme"
                    : language === "JA"
                      ? "キャラクターの性別と声"
                      : language === "KO"
                        ? "캐릭터 성별 및 음성"
                        : "Character gender and voice"}{" "}
              <span className="text-bond-rose">*</span>
            </p>

            <div
              className="grid gap-3 md:grid-cols-2"
              aria-describedby="character-voice-gender-help"
            >
              {(
                [
                  {
                    value: "female",
                    label:
                      language === "ES"
                        ? "Femenino"
                        : language === "FR"
                          ? "Féminin"
                          : language === "DE"
                            ? "Weiblich"
                            : language === "JA"
                              ? "女性"
                              : language === "KO"
                                ? "여성"
                                : "Female"
                  },
                  {
                    value: "male",
                    label:
                      language === "ES"
                        ? "Masculino"
                        : language === "FR"
                          ? "Masculin"
                          : language === "DE"
                            ? "Männlich"
                            : language === "JA"
                              ? "男性"
                              : language === "KO"
                                ? "남성"
                                : "Male"
                  }
                ] as const
              ).map((option) => (
                <button
                  type="button"
                  key={option.value}
                  aria-pressed={voiceGender === option.value}
                  onClick={() => {
                    if (!requireLogin()) return;
                    setVoiceGender(option.value);
                  }}
                  className={\`rounded-2xl border p-4 text-left transition \${
                    voiceGender === option.value
                      ? "border-bond-rose bg-bond-rose/15"
                      : "border-white/10 bg-white/[0.03] hover:border-bond-rose/40"
                  }\`}
                >
                  <p className="font-display text-lg font-bold text-white">
                    {option.label}
                  </p>
                </button>
              ))}
            </div>

            <p
              id="character-voice-gender-help"
              className="text-xs leading-5 text-bond-muted"
            >
              {language === "ES"
                ? "Esto elige el grupo de voz correcto. La voz base asignada al personaje permanecerá igual para siempre."
                : language === "FR"
                  ? "Cela choisit le bon groupe de voix. La voix de base attribuée au personnage restera toujours la même."
                  : language === "DE"
                    ? "Damit wird der richtige Stimmenpool gewählt. Die zugewiesene Basisstimme bleibt für diesen Charakter dauerhaft gleich."
                    : language === "JA"
                      ? "正しい音声プールを選びます。割り当てられた基本音声は、このキャラクターで永久に変わりません。"
                      : language === "KO"
                        ? "올바른 음성 풀을 선택합니다. 지정된 기본 음성은 이 캐릭터에서 영구적으로 유지됩니다."
                        : "This selects the correct voice pool. The character’s assigned base voice will never change."}
            </p>
          </div>

`;

  createForm = replaceRequired(
    createForm,
    `          <div className="space-y-3 md:col-span-2">
            <p className="text-sm font-semibold text-bond-muted">
              {t("visibility")}`,
    voiceUi +
      `          <div className="space-y-3 md:col-span-2">
            <p className="text-sm font-semibold text-bond-muted">
              {t("visibility")}`,
    "voice gender form controls"
  );
}

write(createFormPath, createForm);

const requiredChecks = [
  ["src/lib/character-voice.ts", '"Serena"'],
  ["src/lib/character-voice.ts", '"Ono_Anna"'],
  ["src/lib/character-voice.ts", '"Aiden"'],
  ["src/lib/character-voice.ts", "Current EverMemory relationship"],
  ["src/lib/characters-db.ts", "voice_gender"],
  ["src/lib/user-characters.ts", "voice_gender"],
  ["src/app/api/voice/turn/route.ts", "memory: generated.memory"],
  ["src/app/api/characters/route.ts", "voice_gender: parsed.data.voiceGender"],
  ["src/components/create/LockedCreateForm.tsx", "character-voice-gender-help"]
];

for (const [relativePath, expected] of requiredChecks) {
  if (!read(relativePath).includes(expected)) {
    throw new Error(
      `Permanent character voice validation failed: ${relativePath} is missing ${expected}`
    );
  }
}

console.log(
  "EverBond schema-driven permanent six-voice system applied."
);
