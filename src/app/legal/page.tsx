"use client";

import { AppShell } from "@/components/layout/AppShell";
import { LEGAL_PAGE_COPY } from "@/lib/legal-page-language";
import {
  useSiteLanguage,
  type LanguageCode
} from "@/lib/site-language";

const LLC_OPERATOR_COPY: Record<LanguageCode, string> = {
  EN: "EverBond is operated by EverBond LLC. In these policies, references to EverBond mean the EverBond service operated by EverBond LLC.",
  ES: "EverBond es operado por EverBond LLC. En estas políticas, las referencias a EverBond se refieren al servicio EverBond operado por EverBond LLC.",
  FR: "EverBond est exploité par EverBond LLC. Dans les présentes politiques, les références à EverBond désignent le service EverBond exploité par EverBond LLC.",
  DE: "EverBond wird von EverBond LLC betrieben. In diesen Richtlinien beziehen sich Verweise auf EverBond auf den von EverBond LLC betriebenen EverBond-Dienst.",
  JA: "EverBondはEverBond LLCによって運営されています。本ポリシーにおけるEverBondへの言及は、EverBond LLCが運営するEverBondサービスを指します。",
  KO: "EverBond는 EverBond LLC가 운영합니다. 본 정책에서 EverBond에 대한 언급은 EverBond LLC가 운영하는 EverBond 서비스를 의미합니다."
};

const CALL_TEXT_REPLACEMENTS: Record<
  LanguageCode,
  Array<readonly [string, string]>
> = {
  EN: [
    ["voice-based live calls, ", ""],
    [
      "; voice-call audio, transcripts, replies, and technical usage data",
      "; technical usage data"
    ],
    [", provide voice calls", ""],
    [
      "Prompts, reference images, audio, transcripts, and related content",
      "Prompts, reference images, and related content"
    ],
    [
      " Voice audio may be stored temporarily to deliver a call and may be removed after calls end or during routine cleanup.",
      ""
    ],
    [
      "Companions, messages, memories, images, videos, and voices are",
      "Companions, messages, memories, images, and videos are"
    ],
    ["voice-call, ", ""]
  ],
  ES: [
    [", llamadas de voz en directo", ""],
    [
      "; audio de llamadas de voz, transcripciones, respuestas y datos técnicos de uso",
      "; datos técnicos de uso"
    ],
    [", proporcionar llamadas de voz", ""],
    [
      "Las indicaciones, imágenes de referencia, audio, transcripciones y contenido relacionado",
      "Las indicaciones, imágenes de referencia y contenido relacionado"
    ],
    [
      " El audio de voz puede almacenarse temporalmente para prestar una llamada y puede eliminarse al terminar las llamadas o durante la limpieza rutinaria.",
      ""
    ],
    [
      "Los compañeros, mensajes, recuerdos, imágenes, vídeos y voces son",
      "Los compañeros, mensajes, recuerdos, imágenes y vídeos son"
    ],
    [", llamada de voz", ""]
  ],
  FR: [
    [", des appels vocaux en direct", ""],
    [
      " ; l’audio des appels vocaux, les transcriptions, les réponses et les données techniques d’utilisation",
      " ; les données techniques d’utilisation"
    ],
    [", fournir des appels vocaux", ""],
    [
      "Les invites, images de référence, contenus audio, transcriptions et contenus connexes",
      "Les invites, images de référence et contenus connexes"
    ],
    [
      " L’audio vocal peut être stocké temporairement pour fournir un appel et peut être supprimé après la fin des appels ou lors du nettoyage courant.",
      ""
    ],
    [
      "Les compagnons, messages, souvenirs, images, vidéos et voix sont",
      "Les compagnons, messages, souvenirs, images et vidéos sont"
    ],
    [", d’appel vocal", ""]
  ],
  DE: [
    [", sprachbasierte Live-Anrufe", ""],
    [
      "; Audio von Sprachanrufen, Transkripte, Antworten und technische Nutzungsdaten",
      "; technische Nutzungsdaten"
    ],
    [", Sprachanrufe bereitzustellen", ""],
    [
      "Eingaben, Referenzbilder, Audio, Transkripte und zugehörige Inhalte",
      "Eingaben, Referenzbilder und zugehörige Inhalte"
    ],
    [
      " Sprachaudio kann vorübergehend zur Bereitstellung eines Anrufs gespeichert und nach Beendigung des Anrufs oder bei routinemäßiger Bereinigung entfernt werden.",
      ""
    ],
    [
      "Begleiter, Nachrichten, Erinnerungen, Bilder, Videos und Stimmen werden",
      "Begleiter, Nachrichten, Erinnerungen, Bilder und Videos werden"
    ],
    [", Sprachanruf", ""]
  ],
  JA: [
    ["、音声ベースのライブ通話", ""],
    ["、音声通話の音声、文字起こし、応答", ""],
    ["、音声通話の提供", ""],
    [
      "プロンプト、参照画像、音声、文字起こし、および関連コンテンツ",
      "プロンプト、参照画像、および関連コンテンツ"
    ],
    [
      "音声音声は通話提供のため一時的に保存され、通話終了後または定期的なクリーンアップ時に削除される場合があります。",
      ""
    ],
    [
      "コンパニオン、メッセージ、記憶、画像、動画、音声は",
      "コンパニオン、メッセージ、記憶、画像、動画は"
    ],
    ["、音声通話", ""]
  ],
  KO: [
    [", 음성 기반 라이브 통화", ""],
    [", 음성 통화 오디오, 녹취록, 답변", ""],
    [", 음성 통화 제공", ""],
    [
      "프롬프트, 참조 이미지, 오디오, 녹취록 및 관련 콘텐츠",
      "프롬프트, 참조 이미지 및 관련 콘텐츠"
    ],
    [
      " 음성 오디오는 통화 제공을 위해 일시적으로 저장될 수 있고 통화 종료 후 또는 정기 정리 과정에서 삭제될 수 있습니다.",
      ""
    ],
    [
      "컴패니언, 메시지, 기억, 이미지, 동영상 및 음성은",
      "컴패니언, 메시지, 기억, 이미지 및 동영상은"
    ],
    [", 음성 통화", ""]
  ]
};

function cleanCallText(
  language: LanguageCode,
  paragraph: string
) {
  return CALL_TEXT_REPLACEMENTS[language].reduce(
    (text, [from, to]) => text.replace(from, to),
    paragraph
  );
}

export default function LegalPage() {
  const { language } = useSiteLanguage();
  const copy =
    LEGAL_PAGE_COPY[language] ?? LEGAL_PAGE_COPY.EN;

  return (
    <AppShell>
      <main className="py-12">
        <section className="bond-container">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-bond-rose">
                {copy.label}
              </p>
              <h1 className="mx-auto mt-4 max-w-4xl font-display text-5xl font-bold tracking-tight text-white md:text-7xl">
                {copy.title}
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-sm leading-6 text-white/65">
                {copy.controllingLanguage}
              </p>
            </div>

            <nav className="mt-10 rounded-[2rem] border border-bond-rose/45 bg-white/[0.03] p-6">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">
                {copy.contents}
              </p>
              <div className="flex flex-wrap gap-3">
                {copy.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-full border border-bond-rose/60 bg-bond-rose/10 px-5 py-2 text-sm font-bold text-white transition hover:border-bond-rose hover:bg-bond-rose/20"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </nav>

            <div className="mt-8 space-y-6">
              {copy.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 rounded-[2rem] border border-bond-rose/45 bg-white/[0.03] p-7 shadow-[0_0_32px_rgba(255,92,168,0.06)]"
                >
                  <h2 className="font-display text-3xl font-bold text-bond-rose">
                    {section.title}
                  </h2>
                  <div className="mt-5 space-y-5 text-base leading-8 text-bond-muted">
                    {section.id === "terms" && (
                      <p>{LLC_OPERATOR_COPY[language]}</p>
                    )}

                    {section.paragraphs.map(
                      (paragraph, index) => {
                        if (
                          section.id === "ai-disclaimer" &&
                          index === 2
                        ) {
                          return null;
                        }

                        return (
                          <p key={`${section.id}-${index}`}>
                            {cleanCallText(
                              language,
                              paragraph
                            )}
                          </p>
                        );
                      }
                    )}

                    {section.emailParagraph && (
                      <p>
                        {section.emailParagraph.prefix}{" "}
                        <a
                          href={`mailto:${section.emailParagraph.email}`}
                          className="font-semibold text-bond-rose hover:underline"
                        >
                          {section.emailParagraph.email}
                        </a>
                        {section.emailParagraph.suffix ?? ""}
                      </p>
                    )}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-28 border-t border-bond-rose/30 pt-8">
              <section className="mx-auto max-w-4xl text-[11px] leading-4 text-white/35">
                <p className="font-bold uppercase tracking-[0.2em] text-bond-rose/50">
                  {copy.dmcaAgent.title}
                </p>

                <div className="mt-3 grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
                  <p>{copy.dmcaAgent.department}</p>
                  <p>EverBond LLC</p>
                  <p>{copy.dmcaAgent.addressLine1}</p>
                  <p>{copy.dmcaAgent.addressLine2}</p>
                  <p>
                    {copy.dmcaAgent.phoneLabel}:{" "}
                    <a
                      href={`tel:${copy.dmcaAgent.phone.replace(/[^\d+]/g, "")}`}
                      className="transition hover:text-bond-rose"
                    >
                      {copy.dmcaAgent.phone}
                    </a>
                  </p>
                  <p>
                    {copy.dmcaAgent.emailLabel}:{" "}
                    <a
                      href={`mailto:${copy.dmcaAgent.email}`}
                      className="transition hover:text-bond-rose"
                    >
                      {copy.dmcaAgent.email}
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
