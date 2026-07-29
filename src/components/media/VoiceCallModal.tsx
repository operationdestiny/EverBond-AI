"use client";

import {
  LoaderCircle,
  Mic,
  MicOff,
  PhoneOff,
  Sparkles
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type { Session } from "@supabase/supabase-js";
import type { Character } from "@/types/character";
import { useSiteLanguage } from "@/lib/site-language";
import { MEDIA_COPY } from "@/lib/media-language";

type ApiLanguage =
  | "English"
  | "Spanish"
  | "French"
  | "German"
  | "Japanese"
  | "Korean";

function apiLanguage(code: string): ApiLanguage {
  if (code === "ES") return "Spanish";
  if (code === "FR") return "French";
  if (code === "DE") return "German";
  if (code === "JA") return "Japanese";
  if (code === "KO") return "Korean";
  return "English";
}

function sttLanguage(code: string) {
  if (code === "ES") return "es";
  if (code === "FR") return "fr";
  if (code === "DE") return "de";
  if (code === "JA") return "ja";
  if (code === "KO") return "ko";
  return "en";
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function VoiceCallModal({
  open,
  character,
  displayImage,
  session,
  onClose,
  onInsufficientCoins
}: {
  open: boolean;
  character: Character;
  displayImage: string;
  session: Session;
  onClose: (hadTurns: boolean) => void;
  onInsufficientCoins: () => void;
}) {
  const { language } = useSiteLanguage();
  const copy = MEDIA_COPY[language] ?? MEDIA_COPY.EN;

  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [turns, setTurns] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    void fetch("/api/voice/call-start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        characterSlug: character.slug
      })
    }).then(async (response) => {
      const payload = await response.json().catch(() => ({}));

      if (cancelled) return;

      if (response.status === 402 || payload?.error === "INSUFFICIENT_EVERCOIN") {
        onInsufficientCoins();
        onClose(false);
        return;
      }

      if (!response.ok) {
        setError(payload?.error || copy.mediaError);
        return;
      }

      setStarted(true);
    });

    return () => {
      cancelled = true;
    };
  }, [
    character.slug,
    copy.mediaError,
    onClose,
    onInsufficientCoins,
    open,
    session.access_token
  ]);

  useEffect(() => {
    if (!open || !started) return;

    const interval = window.setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [open, started]);

  useEffect(() => {
    if (!open) {
      setStarted(false);
      setSeconds(0);
      setRecording(false);
      setStatus("idle");
      setError("");
      setConversationId(null);
      setTurns(0);
    }
  }, [open]);

  function cleanupMedia() {
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
  }

  useEffect(() => cleanupMedia, []);

  async function startRecording() {
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        void handleRecording(
          new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm"
          })
        );
      };

      recorder.start();
      setRecording(true);
      setStatus("listening");
    } catch {
      setError(copy.microphoneDenied);
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;

    if (!recorder || recorder.state === "inactive") return;

    setRecording(false);
    recorder.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function handleRecording(audioBlob: Blob) {
    setStatus("thinking");

    try {
      const transcriptionForm = new FormData();
      transcriptionForm.set(
        "audio",
        new File([audioBlob], "voice.webm", {
          type: audioBlob.type || "audio/webm"
        })
      );
      transcriptionForm.set(
        "language",
        sttLanguage(language)
      );

      const transcriptionResponse = await fetch(
        "/api/voice/transcribe",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          body: transcriptionForm
        }
      );

      const transcription = await transcriptionResponse
        .json()
        .catch(() => ({}));

      if (!transcriptionResponse.ok || !transcription?.text) {
        throw new Error(
          transcription?.message ||
            transcription?.error ||
            copy.mediaError
        );
      }

      const chatResponse = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          requestId: crypto.randomUUID(),
          characterSlug: character.slug,
          language: apiLanguage(language),
          conversationId: conversationId ?? undefined,
          messages: [
            {
              role: "user",
              content: String(transcription.text).slice(0, 320)
            }
          ]
        })
      });

      const chat = await chatResponse.json().catch(() => ({}));

      if (!chatResponse.ok) {
        throw new Error(chat?.error || copy.mediaError);
      }

      setConversationId(chat.conversationId ?? conversationId);
      setTurns((value) => value + 1);
      setStatus("speaking");

      const speechResponse = await fetch("/api/voice/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          characterSlug: character.slug,
          text: chat.reply,
          language: apiLanguage(language)
        })
      });

      if (!speechResponse.ok) {
        const payload = await speechResponse.json().catch(() => ({}));

        if (payload?.error === "VOICE_NOT_CONFIGURED") {
          throw new Error(copy.voiceNotConfigured);
        }

        throw new Error(payload?.message || payload?.error || copy.mediaError);
      }

      const audioUrl = URL.createObjectURL(await speechResponse.blob());
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        setStatus("idle");
      };

      await audio.play();
    } catch (callError) {
      setStatus("idle");
      setError(
        callError instanceof Error
          ? callError.message
          : copy.mediaError
      );
    }
  }

  if (!open) return null;

  const statusLabel =
    status === "listening"
      ? copy.listening
      : status === "thinking"
        ? copy.thinking
        : status === "speaking"
          ? copy.speaking
          : copy.tapToSpeak;

  return (
    <div className="fixed inset-0 z-[115] overflow-hidden bg-black">
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-3xl opacity-45"
        style={{
          backgroundImage: `url("${displayImage}")`
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,92,168,0.12),rgba(0,0,0,0.86)_68%)]" />

      <div className="relative flex h-full flex-col items-center justify-between px-5 py-8 text-center md:py-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-bond-rose">
            LIVE EVERBOND CALL
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-white">
            {character.name}
          </h2>
          <p className="mt-2 font-mono text-xl text-white/85">
            {formatTime(seconds)}
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2.75rem] bg-bond-rose/25 blur-3xl" />
          <img
            src={displayImage}
            alt={character.name}
            className="relative h-[56vh] max-h-[680px] min-h-[360px] w-auto max-w-[88vw] rounded-[2.75rem] border-2 border-bond-rose/70 object-cover shadow-[0_0_70px_rgba(255,92,168,0.28)]"
          />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/65 px-5 py-2 text-sm font-semibold text-white backdrop-blur">
            {started ? statusLabel : copy.thinking}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {error && (
            <p className="max-w-xl rounded-full border border-red-400/25 bg-red-500/10 px-5 py-2 text-sm text-red-100">
              {error}
            </p>
          )}

          <div className="flex items-center gap-5">
            <button
              type="button"
              disabled={!started || status === "thinking" || status === "speaking"}
              onClick={() =>
                recording
                  ? stopRecording()
                  : void startRecording()
              }
              className={`flex h-16 w-16 items-center justify-center rounded-full border-2 text-white shadow-[0_0_30px_rgba(255,92,168,0.25)] transition ${
                recording
                  ? "border-bond-gold bg-bond-gold/20 text-bond-gold"
                  : "border-bond-rose bg-bond-rose/20"
              } disabled:cursor-not-allowed disabled:opacity-40`}
              aria-label={
                recording ? copy.stopSpeaking : copy.tapToSpeak
              }
            >
              {status === "thinking" || status === "speaking" ? (
                <LoaderCircle className="animate-spin" size={27} />
              ) : recording ? (
                <MicOff size={27} />
              ) : (
                <Mic size={27} />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                cleanupMedia();
                onClose(turns > 0);
              }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_36px_rgba(220,38,38,0.42)] transition hover:scale-105"
              aria-label={copy.hangUp}
            >
              <PhoneOff size={32} />
            </button>

            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-bond-rose/35 bg-bond-rose/10 text-bond-rose">
              <Sparkles size={25} />
            </div>
          </div>

          <p className="text-sm font-semibold text-white/75">
            {recording ? copy.stopSpeaking : copy.tapToSpeak}
          </p>
        </div>
      </div>
    </div>
  );
}
