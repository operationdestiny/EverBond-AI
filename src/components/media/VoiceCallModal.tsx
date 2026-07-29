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

type CallStatus =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking";

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
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function preferredRecorderMimeType() {
  if (typeof MediaRecorder === "undefined") return "";

  return [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4"
  ].find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
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
  const [status, setStatus] = useState<CallStatus>("idle");
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [turns, setTurns] = useState(0);
  const [callId, setCallId] = useState<string | null>(null);
  const [chargedMinuteIndex, setChargedMinuteIndex] = useState(1);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const openRef = useRef(open);
  const sessionRef = useRef(session);
  const turnsRef = useRef(turns);
  const closeRef = useRef(onClose);
  const insufficientRef = useRef(onInsufficientCoins);
  const callStartedAtRef = useRef<number | null>(null);
  const minuteChargeInFlightRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    insufficientRef.current = onInsufficientCoins;
  }, [onInsufficientCoins]);

  function cleanupMedia() {
    const recorder = recorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
    }

    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    chunksRef.current = [];

    if (audioRef.current) {
      const source = audioRef.current.src;
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;

      if (source.startsWith("blob:")) {
        URL.revokeObjectURL(source);
      }
    }
  }

  function finishCall() {
    cleanupMedia();
    setRecording(false);
    setStatus("idle");
    closeRef.current(turnsRef.current > 0);
  }

  function stopCallWithError(message: string) {
    cleanupMedia();
    callStartedAtRef.current = null;
    setStarted(false);
    setRecording(false);
    setStatus("idle");
    setError(message);
  }

  useEffect(() => {
    if (!open) {
      cleanupMedia();
      setStarted(false);
      setSeconds(0);
      setRecording(false);
      setStatus("idle");
      setError("");
      setConversationId(null);
      setTurns(0);
      setCallId(null);
      callStartedAtRef.current = null;
      setChargedMinuteIndex(1);
      minuteChargeInFlightRef.current = false;
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    setStarted(false);
    setSeconds(0);
    setRecording(false);
    setStatus("idle");
    setError("");
    setConversationId(null);
    setTurns(0);
    setCallId(null);
    callStartedAtRef.current = null;
    setChargedMinuteIndex(1);

    void fetch("/api/voice/call-start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionRef.current.access_token}`
      },
      body: JSON.stringify({
        characterSlug: character.slug
      }),
      signal: controller.signal
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));

        if (cancelled) return;

        if (
          response.status === 402 ||
          payload?.error === "INSUFFICIENT_EVERCOIN"
        ) {
          insufficientRef.current();
          closeRef.current(false);
          return;
        }

        if (payload?.error === "VOICE_NOT_CONFIGURED") {
          setError(copy.voiceNotConfigured);
          return;
        }

        if (!response.ok || !payload?.callId) {
          setError(payload?.message || payload?.error || copy.mediaError);
          return;
        }

        setCallId(String(payload.callId));
        callStartedAtRef.current = Date.now();
        setStarted(true);
      })
      .catch((requestError) => {
        if (
          cancelled ||
          (requestError instanceof DOMException &&
            requestError.name === "AbortError")
        ) {
          return;
        }

        setError(copy.mediaError);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    character.slug,
    open
  ]);

  useEffect(() => {
    if (!open || !started) return;

    const interval = window.setInterval(() => {
      const startedAt = callStartedAtRef.current;

      if (startedAt) {
        setSeconds(Math.max(Math.floor((Date.now() - startedAt) / 1000), 0));
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [open, started]);

  useEffect(() => {
    if (
      !open ||
      !started ||
      !callId ||
      seconds < 60 ||
      minuteChargeInFlightRef.current
    ) {
      return;
    }

    const currentMinuteIndex = Math.floor(seconds / 60) + 1;

    if (currentMinuteIndex <= chargedMinuteIndex) return;

    const minuteIndex = chargedMinuteIndex + 1;
    minuteChargeInFlightRef.current = true;

    void fetch("/api/voice/call-minute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionRef.current.access_token}`
      },
      body: JSON.stringify({
        characterSlug: character.slug,
        callId,
        minuteIndex
      })
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));

        if (!openRef.current) return;

        if (
          response.status === 402 ||
          payload?.error === "INSUFFICIENT_EVERCOIN"
        ) {
          setError(copy.callBillingFailed);
          insufficientRef.current();
          finishCall();
          return;
        }

        if (!response.ok) {
          stopCallWithError(copy.callBillingFailed);
          return;
        }

        setChargedMinuteIndex(minuteIndex);
      })
      .catch(() => {
        if (!openRef.current) return;
        stopCallWithError(copy.callBillingFailed);
      })
      .finally(() => {
        minuteChargeInFlightRef.current = false;
      });
  }, [
    callId,
    chargedMinuteIndex,
    character.slug,
    copy.callBillingFailed,
    open,
    seconds,
    started
  ]);

  useEffect(() => cleanupMedia, []);

  async function startRecording() {
    if (!started || status !== "idle") return;

    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      if (!openRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = preferredRecorderMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm"
        });

        chunksRef.current = [];

        if (blob.size > 0 && openRef.current) {
          void handleRecording(blob);
        } else {
          setStatus("idle");
        }
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
    setError("");

    try {
      const transcriptionForm = new FormData();
      transcriptionForm.set(
        "audio",
        new File([audioBlob], "voice.webm", {
          type: audioBlob.type || "audio/webm"
        })
      );
      transcriptionForm.set("language", sttLanguage(language));

      const transcriptionResponse = await fetch(
        "/api/voice/transcribe",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionRef.current.access_token}`
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

      if (!openRef.current) return;

      const chatResponse = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionRef.current.access_token}`
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

      if (!chatResponse.ok || !chat?.reply) {
        throw new Error(chat?.message || chat?.error || copy.mediaError);
      }

      if (!openRef.current) return;

      setConversationId(chat.conversationId ?? conversationId);
      setTurns((value) => value + 1);
      setStatus("speaking");

      const speechResponse = await fetch("/api/voice/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionRef.current.access_token}`
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

        throw new Error(
          payload?.message || payload?.error || copy.mediaError
        );
      }

      const audioUrl = URL.createObjectURL(await speechResponse.blob());

      if (!openRef.current) {
        URL.revokeObjectURL(audioUrl);
        return;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;

        if (openRef.current) {
          setStatus("idle");
        }
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;

        if (openRef.current) {
          setStatus("idle");
          setError(copy.mediaError);
        }
      };

      await audio.play();
    } catch (callError) {
      if (!openRef.current) return;

      setStatus("idle");
      setError(
        callError instanceof Error
          ? callError.message
          : copy.mediaError
      );
    }
  }

  if (!open) return null;

  const statusLabel = !started
    ? error
      ? copy.hangUp
      : copy.connecting
    : status === "listening"
      ? copy.listening
      : status === "thinking"
        ? copy.thinking
        : status === "speaking"
          ? copy.speaking
          : copy.tapToSpeak;

  return (
    <div
      className="fixed inset-0 z-[120] overflow-hidden bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={`${copy.liveCall}: ${character.name}`}
    >
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center opacity-45 blur-3xl"
        style={{
          backgroundImage: `url("${displayImage}")`
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,92,168,0.13),rgba(0,0,0,0.88)_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.22),rgba(0,0,0,0.05)_45%,rgba(0,0,0,0.58))]" />

      <div className="relative flex h-full flex-col items-center justify-between px-5 py-7 text-center md:py-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-bond-rose md:text-sm">
            {copy.liveCall}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white md:text-5xl">
            {character.name}
          </h2>
          <p className="mt-2 font-mono text-lg text-white/85 md:text-xl">
            {formatTime(seconds)}
          </p>
        </div>

        <div className="relative min-h-0 flex-1 py-5">
          <div className="absolute inset-6 rounded-[2.75rem] bg-bond-rose/25 blur-3xl" />
          <img
            src={displayImage}
            alt={character.name}
            className="relative h-full max-h-[64vh] min-h-[280px] w-auto max-w-[90vw] rounded-[2.75rem] border-2 border-bond-rose/70 object-cover shadow-[0_0_70px_rgba(255,92,168,0.30)]"
          />
          <div className="absolute bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-5 py-2 text-sm font-semibold text-white backdrop-blur-xl">
            {statusLabel}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          {error && (
            <p className="max-w-xl rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-2 text-sm text-red-100 backdrop-blur-xl">
              {error}
            </p>
          )}

          <div className="flex items-center gap-5">
            <button
              type="button"
              disabled={
                !started ||
                status === "thinking" ||
                status === "speaking"
              }
              onClick={() =>
                recording ? stopRecording() : void startRecording()
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
              onClick={finishCall}
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
