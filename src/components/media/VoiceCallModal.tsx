"use client";

import {
  LoaderCircle,
  Mic,
  MicOff,
  PhoneOff,
  Sparkles
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

type CallLimits = {
  maxMinutes: number;
  idleTimeoutSeconds: number;
  maxAudioSeconds: number;
  maxTurnsPerMinute: number;
  maxTtsCharactersPerMinute: number;
};

function apiLanguage(code: string): ApiLanguage {
  if (code === "ES") return "Spanish";
  if (code === "FR") return "French";
  if (code === "DE") return "German";
  if (code === "JA") return "Japanese";
  if (code === "KO") return "Korean";
  return "English";
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

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

async function recordedBlobToPcmWav(blob: Blob, maxSeconds: number) {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) throw new Error("AUDIO_NOT_SUPPORTED");

  const context = new AudioContextClass();

  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    const duration = Math.min(decoded.duration, maxSeconds);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("EMPTY_AUDIO");
    }

    const targetRate = 16_000;
    const outputLength = Math.max(1, Math.floor(duration * targetRate));
    const mono = new Float32Array(outputLength);
    const sourceLength = Math.min(
      decoded.length,
      Math.floor(duration * decoded.sampleRate)
    );
    const channelCount = Math.max(decoded.numberOfChannels, 1);
    const ratio = decoded.sampleRate / targetRate;

    for (let outputIndex = 0; outputIndex < outputLength; outputIndex += 1) {
      const start = Math.floor(outputIndex * ratio);
      const end = Math.min(Math.max(Math.floor((outputIndex + 1) * ratio), start + 1), sourceLength);
      let total = 0;
      let samples = 0;

      for (let sourceIndex = start; sourceIndex < end; sourceIndex += 1) {
        let frame = 0;
        for (let channel = 0; channel < channelCount; channel += 1) {
          frame += decoded.getChannelData(channel)[sourceIndex] ?? 0;
        }
        total += frame / channelCount;
        samples += 1;
      }

      mono[outputIndex] = samples ? total / samples : 0;
    }

    const wav = new ArrayBuffer(44 + mono.length * 2);
    const view = new DataView(wav);
    writeAscii(view, 0, "RIFF");
    view.setUint32(4, 36 + mono.length * 2, true);
    writeAscii(view, 8, "WAVE");
    writeAscii(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, targetRate, true);
    view.setUint32(28, targetRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeAscii(view, 36, "data");
    view.setUint32(40, mono.length * 2, true);

    let offset = 44;
    for (const sample of mono) {
      const clipped = Math.max(-1, Math.min(1, sample));
      view.setInt16(
        offset,
        clipped < 0 ? clipped * 0x8000 : clipped * 0x7fff,
        true
      );
      offset += 2;
    }

    return new Blob([wav], { type: "audio/wav" });
  } finally {
    await context.close().catch(() => undefined);
  }
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
  const [costPerMinute, setCostPerMinute] = useState(35);
  const [limits, setLimits] = useState<CallLimits>({
    maxMinutes: 60,
    idleTimeoutSeconds: 90,
    maxAudioSeconds: 30,
    maxTurnsPerMinute: 4,
    maxTtsCharactersPerMinute: 900
  });

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoStopRef = useRef<number | null>(null);
  const openRef = useRef(open);
  const sessionRef = useRef(session);
  const turnsRef = useRef(turns);
  const closeRef = useRef(onClose);
  const insufficientRef = useRef(onInsufficientCoins);
  const callIdRef = useRef<string | null>(callId);
  const callStartedAtRef = useRef<number | null>(null);
  const lastActivityAtRef = useRef<number>(Date.now());
  const endedRef = useRef(false);

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

  useEffect(() => {
    callIdRef.current = callId;
  }, [callId]);

  function cleanupMedia() {
    if (autoStopRef.current !== null) {
      window.clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }

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
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }

  function notifyServerCallEnded(reason: string) {
    const activeCallId = callIdRef.current;
    if (!activeCallId) return;

    void fetch("/api/voice/call-end", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionRef.current.access_token}`
      },
      body: JSON.stringify({ callId: activeCallId, reason }),
      keepalive: true
    }).catch(() => undefined);
  }

  function finishCall(reason = "user_hangup") {
    if (endedRef.current) return;
    endedRef.current = true;
    cleanupMedia();
    notifyServerCallEnded(reason);
    setRecording(false);
    setStatus("idle");
    closeRef.current(turnsRef.current > 0);
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
      endedRef.current = false;
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
    endedRef.current = false;

    async function connect() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(copy.microphoneDenied);
        }

        // Permission is requested before the first minute is charged.
        const permissionStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        permissionStream.getTracks().forEach((track) => track.stop());

        const response = await fetch("/api/voice/call-start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionRef.current.access_token}`
          },
          body: JSON.stringify({ characterSlug: character.slug }),
          signal: controller.signal
        });
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;

        if (
          response.status === 402 ||
          payload?.error === "INSUFFICIENT_EVERCOIN" ||
          payload?.error === "EVERCOIN_DEBT"
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

        const nextLimits = payload.limits as Partial<CallLimits> | undefined;
        setLimits((current) => ({
          maxMinutes: Number(nextLimits?.maxMinutes ?? current.maxMinutes),
          idleTimeoutSeconds: Number(
            nextLimits?.idleTimeoutSeconds ?? current.idleTimeoutSeconds
          ),
          maxAudioSeconds: Number(
            nextLimits?.maxAudioSeconds ?? current.maxAudioSeconds
          ),
          maxTurnsPerMinute: Number(
            nextLimits?.maxTurnsPerMinute ?? current.maxTurnsPerMinute
          ),
          maxTtsCharactersPerMinute: Number(
            nextLimits?.maxTtsCharactersPerMinute ??
              current.maxTtsCharactersPerMinute
          )
        }));
        setCostPerMinute(Number(payload.costPerMinute ?? 35));
        setCallId(String(payload.callId));
        callStartedAtRef.current = payload.startedAt
          ? new Date(payload.startedAt).getTime()
          : Date.now();
        lastActivityAtRef.current = Date.now();
        setStarted(true);
      } catch (connectError) {
        if (
          cancelled ||
          (connectError instanceof DOMException &&
            connectError.name === "AbortError")
        ) {
          return;
        }
        setError(
          connectError instanceof Error
            ? connectError.message
            : copy.microphoneDenied
        );
      }
    }

    void connect();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [character.slug, copy.mediaError, copy.microphoneDenied, copy.voiceNotConfigured, open]);

  useEffect(() => {
    if (!open || !started) return;

    const interval = window.setInterval(() => {
      const startedAt = callStartedAtRef.current;
      if (!startedAt) return;

      const elapsed = Math.max(Math.floor((Date.now() - startedAt) / 1000), 0);
      setSeconds(elapsed);

      if (elapsed >= limits.maxMinutes * 60) {
        setError(copy.callLimitReached);
        finishCall("maximum_length");
        return;
      }

      if (
        status === "idle" &&
        Date.now() - lastActivityAtRef.current >= limits.idleTimeoutSeconds * 1000
      ) {
        setError(copy.callIdleEnded);
        finishCall("idle_timeout");
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [copy.callIdleEnded, copy.callLimitReached, limits.idleTimeoutSeconds, limits.maxMinutes, open, started, status]);

  useEffect(() => {
    return () => {
      if (callIdRef.current && !endedRef.current) {
        notifyServerCallEnded("client_unmounted");
      }
      cleanupMedia();
    };
  }, []);

  async function startRecording() {
    if (!started || status !== "idle" || !callIdRef.current) return;

    setError("");
    lastActivityAtRef.current = Date.now();

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
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        if (autoStopRef.current !== null) {
          window.clearTimeout(autoStopRef.current);
          autoStopRef.current = null;
        }

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm"
        });
        chunksRef.current = [];

        if (blob.size > 0 && openRef.current) void handleRecording(blob);
        else setStatus("idle");
      };

      recorder.start();
      setRecording(true);
      setStatus("listening");
      autoStopRef.current = window.setTimeout(() => {
        stopRecording();
      }, limits.maxAudioSeconds * 1000);
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

  async function handleRecording(recordedBlob: Blob) {
    const activeCallId = callIdRef.current;
    if (!activeCallId) return;

    setStatus("thinking");
    setError("");
    lastActivityAtRef.current = Date.now();

    try {
      const wavBlob = await recordedBlobToPcmWav(
        recordedBlob,
        limits.maxAudioSeconds
      );
      const requestId = crypto.randomUUID();
      const form = new FormData();
      form.set("audio", new File([wavBlob], "voice.wav", { type: "audio/wav" }));
      form.set("callId", activeCallId);
      form.set("requestId", requestId);
      form.set("characterSlug", character.slug);
      form.set("language", apiLanguage(language));
      if (conversationId) form.set("conversationId", conversationId);

      const response = await fetch("/api/voice/turn", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionRef.current.access_token}`
        },
        body: form
      });
      const payload = await response.json().catch(() => ({}));

      if (!openRef.current) return;

      if (
        response.status === 402 ||
        payload?.error === "INSUFFICIENT_EVERCOIN" ||
        payload?.error === "EVERCOIN_DEBT"
      ) {
        insufficientRef.current();
        finishCall("insufficient_evercoin");
        return;
      }

      if (
        payload?.error === "CALL_LIMIT_REACHED" ||
        payload?.error === "CALL_IDLE_TIMEOUT" ||
        payload?.error === "CALL_ENDED"
      ) {
        setError(
          payload.error === "CALL_IDLE_TIMEOUT"
            ? copy.callIdleEnded
            : copy.callLimitReached
        );
        finishCall(payload.error.toLowerCase());
        return;
      }

      if (response.status === 429) {
        setStatus("idle");
        setError(copy.callRateLimited);
        return;
      }

      if (!response.ok || !payload?.audioUrl || !payload?.reply) {
        throw new Error(payload?.message || payload?.error || copy.mediaError);
      }

      setConversationId(payload.conversationId ?? conversationId);
      setTurns((value) => value + 1);
      setStatus("speaking");
      lastActivityAtRef.current = Date.now();

      const audio = new Audio(String(payload.audioUrl));
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

      await audio.play();
    } catch (callError) {
      if (!openRef.current) return;
      setStatus("idle");
      setError(
        callError instanceof Error ? callError.message : copy.mediaError
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
        style={{ backgroundImage: `url("${displayImage}")` }}
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
          <p className="mt-1 text-xs font-semibold text-white/55">
            {costPerMinute} EverCoin / {copy.minute}
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
              disabled={!started || status === "thinking" || status === "speaking"}
              onClick={() =>
                recording ? stopRecording() : void startRecording()
              }
              className={`flex h-16 w-16 items-center justify-center rounded-full border-2 text-white shadow-[0_0_30px_rgba(255,92,168,0.25)] transition ${
                recording
                  ? "border-bond-gold bg-bond-gold/20 text-bond-gold"
                  : "border-bond-rose bg-bond-rose/20"
              } disabled:cursor-not-allowed disabled:opacity-40`}
              aria-label={recording ? copy.stopSpeaking : copy.tapToSpeak}
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
              onClick={() => finishCall("user_hangup")}
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
