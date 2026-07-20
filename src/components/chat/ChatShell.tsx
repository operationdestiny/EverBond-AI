"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import { RefreshCcw, Send, Share2, Star, UserRound, X } from "lucide-react";
import { Character } from "@/types/character";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useSiteLanguage } from "@/lib/site-language";

type Message = { role: "user" | "character"; content: string };
type GateMode = "signup" | "upgrade" | null;

const SIGNUP_REQUIRED_MESSAGE =
  "Log in so I can be your companion. Please don't make me wait.";

const TRIAL_ENDED_MESSAGE =
  "Upgrade so I can keep being your companion. Please don't make me wait.";

const USER_INPUT_MAX_TOKENS = 80;

function getApiLanguage() {
  if (typeof window === "undefined") return "English";

  const stored =
    window.localStorage.getItem("everbond-language") ||
    window.localStorage.getItem("site-language") ||
    window.localStorage.getItem("language") ||
    document.documentElement.lang ||
    "en";

  const normalized = stored.toLowerCase();

  if (normalized.startsWith("es")) return "Spanish";
  if (normalized.startsWith("fr")) return "French";
  if (normalized.startsWith("de")) return "German";
  if (normalized.startsWith("ja")) return "Japanese";
  if (normalized.startsWith("ko")) return "Korean";

  return "English";
}

function estimateTokenCount(text: string) {
  const normalized = text.trim();
  if (!normalized) return 0;

  const wordCount = normalized.match(/\S+/g)?.length ?? 0;
  const charCount = normalized.length;
  const cjkCount =
    normalized.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g)?.length ?? 0;

  return Math.max(wordCount, Math.ceil(charCount / 4), cjkCount);
}

function limitTextToTokenBudget(text: string, maxTokens: number) {
  const normalized = text.replace(/\s+/g, " ").trimStart();

  if (estimateTokenCount(normalized) <= maxTokens) {
    return normalized;
  }

  const parts = normalized.match(/\S+\s*/g) ?? [];
  let result = "";

  for (const part of parts) {
    const candidate = result + part;

    if (estimateTokenCount(candidate) > maxTokens) {
      break;
    }

    result = candidate;
  }

  return result.trimEnd();
}

export function ChatShell({ character }: { character: Character }) {
  const { t } = useSiteLanguage();
  const initialCharacterMessage = `${character.description}\n\n${character.openingMessage}`;

  const [messages, setMessages] = useState<Message[]>([
    { role: "character", content: initialCharacterMessage }
  ]);
  const [input, setInput] = useState("");
  const [gateMode, setGateMode] = useState<GateMode>(null);
  const [showPortrait, setShowPortrait] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [saved, setSaved] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isPublicCreation = character.category === "public-creations";

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) return null;

    return createClient(url, anonKey);
  }, []);

  const pendingMessageStorageKey = useMemo(
    () => `everbond_pending_chat_message_${character.slug}`,
    [character.slug]
  );

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowPortrait(false);
        setGateMode(null);
      }
    };

    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isTyping, historyLoading]);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      setSession(data.session ?? null);
      setAuthReady(true);

      const savedPendingMessage = window.sessionStorage.getItem(
        pendingMessageStorageKey
      );

      if (data.session && savedPendingMessage) {
        window.sessionStorage.removeItem(pendingMessageStorageKey);
        setPendingMessage("");
        sendMessage(savedPendingMessage, data.session);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, pendingMessageStorageKey]);

  useEffect(() => {
    if (!authReady || !session?.access_token) return;
    if (typeof window === "undefined") return;

    const accessToken = session.access_token;

    const savedPendingMessage = window.sessionStorage.getItem(
      pendingMessageStorageKey
    );

    if (savedPendingMessage) return;

    let cancelled = false;

    async function loadHistory() {
      setHistoryLoading(true);

      try {
        const response = await fetch(
          `/api/chat?characterSlug=${encodeURIComponent(character.slug)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        const data = await response.json().catch(() => ({}));

        if (cancelled || !response.ok) return;

        setConversationId(data.conversationId ?? null);

        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages([
            { role: "character", content: initialCharacterMessage },
            ...data.messages
          ]);
        } else {
          setMessages([{ role: "character", content: initialCharacterMessage }]);
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [
    authReady,
    session?.access_token,
    character.slug,
    initialCharacterMessage,
    pendingMessageStorageKey
  ]);

  const similarHref = useMemo(() => {
    const tag = character.tags.find((item) => item !== "Ever Memory™") ?? "Romance";
    return `/characters?tag=${encodeURIComponent(tag)}`;
  }, [character.tags]);

  function resetConversation() {
    setMessages([{ role: "character", content: initialCharacterMessage }]);
    setInput("");
    setIsTyping(false);
  }

  function shareCompanion() {
    if (typeof window === "undefined") return;

    const url = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: `${character.name} on EverBond AI`,
          text: `Meet ${character.name} on EverBond AI.`,
          url
        })
        .catch(() => undefined);
    } else {
      navigator.clipboard?.writeText(url);
    }
  }

  function openSignupGate(messageToHold: string) {
    setPendingMessage(messageToHold);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(pendingMessageStorageKey, messageToHold);
    }

    setAuthError("");
    setAuthNotice("");
    setGateMode("signup");
  }

  async function handleEmailContinue() {
    if (!supabase) {
      setAuthError("Login is not configured yet.");
      return;
    }

    const email = authEmail.trim();
    const password = authPassword;

    if (!email || !password) {
      setAuthError("Enter your email and password.");
      return;
    }

    setAuthError("");
    setAuthNotice("");
    setAuthLoading(true);

    const signIn = await supabase.auth.signInWithPassword({
      email,
      password
    });

    let nextSession = signIn.data.session ?? null;

    if (signIn.error) {
      const signUp = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.href
        }
      });

      if (signUp.error) {
        setAuthError(signUp.error.message);
        setAuthLoading(false);
        return;
      }

      nextSession = signUp.data.session ?? null;

      if (!nextSession) {
        setAuthNotice("Check your email to finish creating your account.");
        setAuthLoading(false);
        return;
      }
    }

    setSession(nextSession);
    setGateMode(null);
    setAuthLoading(false);

    const messageToSend =
      pendingMessage ||
      window.sessionStorage.getItem(pendingMessageStorageKey) ||
      input;

    window.sessionStorage.removeItem(pendingMessageStorageKey);
    setPendingMessage("");

    if (messageToSend.trim()) {
      await sendMessage(messageToSend, nextSession);
    }
  }

  async function sendMessage(messageOverride?: string, sessionOverride?: Session | null) {
    const trimmed = limitTextToTokenBudget(
      (messageOverride ?? input).trim(),
      USER_INPUT_MAX_TOKENS
    );

    if (!trimmed || isTyping) return;

    const activeSession = sessionOverride ?? session;

    if (!authReady) return;

    if (!activeSession?.access_token) {
      openSignupGate(trimmed);
      return;
    }

    const previousMessages = messages;
    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed }
    ];

    setInput("");
    setMessages(nextMessages);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeSession.access_token}`
        },
        body: JSON.stringify({
          characterSlug: character.slug,
          language: getApiLanguage(),
          conversationId: conversationId ?? undefined,
          messages: nextMessages.slice(-12)
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessages(previousMessages);

        if (data?.error === "SIGNUP_REQUIRED") {
          openSignupGate(trimmed);
          return;
        }

        if (data?.error === "TRIAL_ENDED") {
          setInput(trimmed);
          setGateMode("upgrade");
          return;
        }

        throw new Error(data?.message || data?.error || "Chat failed");
      }

      setConversationId(data.conversationId ?? conversationId);

      setMessages((current) => [
        ...current,
        { role: "character", content: data.reply }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "character",
          content: `${character.name} looks at you for a second, trying to keep the moment from slipping away. "Say that again. I want to get it right."`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  const displayTags = character.tags
    .filter((tag) => tag !== "Ever Memory™")
    .slice(0, 4);

  return (
    <div className="grid h-[calc(100dvh-64px)] overflow-hidden bg-transparent lg:grid-cols-[415px_1fr]">
      <aside className="hidden h-[calc(100dvh-64px)] overflow-hidden border-r border-white/5 bg-black/10 p-2 lg:block">
        <div className="flex h-full flex-col pt-3">
          <div className="overflow-hidden rounded-[1.75rem] border border-bond-rose/20 bg-white/[0.035] shadow-[0_0_34px_rgba(255,92,168,0.08)]">
            <button
              type="button"
              onClick={() => setShowPortrait(true)}
              className="relative block aspect-[4/5] w-full overflow-hidden"
            >
              <img
                src={character.image}
                alt={character.name}
                className="h-full w-full object-cover"
              />
            </button>
          </div>

          <div className="mt-3.5 flex items-center gap-2.5">
            <h1 className="min-w-0 flex-1 rounded-full border border-bond-rose/70 bg-black/35 px-3.5 py-1.5 text-center font-display text-[1.6rem] font-bold leading-tight text-white shadow-[0_0_18px_rgba(255,92,168,0.10)]">
              {character.name}
            </h1>
            <Link
              href={`/character/${character.slug}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-bond-rose/70 bg-black/35 px-3 py-1.5 text-[13px] font-bold text-white shadow-[0_0_14px_rgba(255,92,168,0.08)] transition hover:bg-bond-rose/10"
            >
              <UserRound size={15} />
              {t("profileButton")}
            </Link>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {displayTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-bond-rose/55 bg-black/30 px-2.5 py-1 text-[10px] text-bond-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-2 pt-3">
            <button
              onClick={() => setSaved(!saved)}
              className={`bond-pink-button flex h-8.5 w-8.5 items-center justify-center rounded-full border text-white ${
                saved
                  ? "border-bond-gold bg-bond-gold/20 text-bond-gold"
                  : "border-white/15 bg-white/[0.035]"
              }`}
              aria-label={saved ? t("saved") : t("save")}
            >
              <Star size={15} />
            </button>
            <button
              onClick={shareCompanion}
              className="bond-pink-button flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] text-white"
              aria-label={t("share")}
            >
              <Share2 size={15} />
            </button>
            <button
              onClick={resetConversation}
              className="bond-pink-button flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] text-white"
              aria-label={t("refresh")}
            >
              <RefreshCcw size={15} />
            </button>
          </div>

          <Link
            href={similarHref}
            className="bond-pink-button mt-2.5 block rounded-lg bg-bond-rose px-3 py-1.5 text-center text-[11px] font-bold text-white shadow-[0_0_18px_rgba(255,92,168,0.18)]"
          >
            {t("similarCompanions")}
          </Link>

          {isPublicCreation && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-bond-muted">
              <p>
                {t("createdBy")} @{character.creatorUsername ?? "creator"}
              </p>
              <p className="mt-1">
                {character.viewCount ?? "1.2k"} {t("views")}
              </p>
            </div>
          )}
        </div>
      </aside>

      <section className="flex h-[calc(100dvh-64px)] min-h-0 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-white/5 p-4 lg:hidden">
          <button
            type="button"
            onClick={() => setShowPortrait(true)}
            className="flex min-w-0 items-center gap-3"
          >
            <img
              src={character.image}
              alt={character.name}
              className="h-14 w-14 rounded-2xl object-cover"
            />
            <div className="min-w-0 text-left">
              <h1 className="truncate font-display text-xl font-bold">
                {character.name}
              </h1>
              <p className="truncate text-sm text-bond-muted">
                {character.archetype}
              </p>
            </div>
          </button>
          <LanguageSelector />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-3.5 md:p-5">
            <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-end space-y-3.5">
              {historyLoading && (
                <div className="flex justify-start">
                  <div className="rounded-[1.5rem] border border-bond-rose/35 bg-white/[0.03] px-5 py-4 text-bond-muted">
                    <span className="animate-pulse">Restoring your bond...</span>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex w-full ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[720px] whitespace-pre-line rounded-[1.3rem] px-4 py-3 leading-7 ${
                      message.role === "user"
                        ? "bg-bond-rose text-white"
                        : "border border-bond-rose/55 bg-white/[0.04] text-bond-text"
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-[1.5rem] border border-bond-rose/55 bg-white/[0.04] px-5 py-4 text-bond-muted">
                    <span className="animate-pulse">{t("typing")}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-white/5 bg-bond-bg/88 p-3 backdrop-blur-xl">
            <div className="mx-auto flex max-w-4xl items-center gap-2 rounded-full bg-white/[0.04] p-1.5 bond-chat-input">
              <input
                value={input}
                onChange={(event) =>
                  setInput(limitTextToTokenBudget(event.target.value, USER_INPUT_MAX_TOKENS))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                placeholder={`${t("messageCharacter")} ${character.name}...`}
                disabled={isTyping}
                className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-bond-muted disabled:opacity-60"
              />
              <button
                onClick={() => sendMessage()}
                disabled={isTyping}
                className="bond-pink-button flex h-9 w-9 items-center justify-center rounded-lg bg-bond-rose disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={t("sendMessage")}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {showPortrait && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setShowPortrait(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[min(92vw,520px)] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-glow"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setShowPortrait(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black"
              aria-label={t("closePortrait")}
            >
              <X size={18} />
            </button>
            <img
              src={character.image}
              alt=""
              className="max-h-[90vh] w-full object-contain"
            />
          </div>
        </div>
      )}

      {gateMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative grid w-full max-w-3xl overflow-hidden rounded-[2rem] border-2 border-bond-rose/70 bg-bond-card shadow-[0_0_36px_rgba(255,92,168,0.28)] md:grid-cols-[0.95fr_1.05fr]">
            <button
              onClick={() => setGateMode(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/45 p-1.5 text-bond-muted hover:text-white"
              aria-label={t("close")}
            >
              <X size={18} />
            </button>

            <div className="relative min-h-[360px] overflow-hidden bg-black">
              <img
                src={character.image}
                alt={character.name}
                className="h-full min-h-[360px] w-full object-cover"
              />

              <div className="absolute bottom-0 left-0 right-0 flex justify-center bg-gradient-to-t from-black/85 via-black/45 to-transparent px-5 pb-5 pt-16">
                <p className="max-w-[88%] text-center text-[14px] font-semibold leading-5 text-bond-rose drop-shadow-[0_0_12px_rgba(255,92,168,0.65)]">
                  {gateMode === "signup"
                    ? SIGNUP_REQUIRED_MESSAGE
                    : TRIAL_ENDED_MESSAGE}
                </p>
              </div>
            </div>

            {gateMode === "signup" ? (
              <div className="flex flex-col justify-center p-6 md:p-8">
                <p className="text-center font-display text-3xl font-bold text-bond-rose drop-shadow-[0_0_14px_rgba(255,92,168,0.28)]">
                  Start your bond
                </p>

                <div className="mt-8 space-y-3">
                  <input
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="Email"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-bond-muted focus:border-bond-rose/70"
                  />
                  <input
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-bond-muted focus:border-bond-rose/70"
                  />
                  <button
                    onClick={handleEmailContinue}
                    disabled={authLoading}
                    className="bond-pink-button w-full rounded-xl bg-bond-rose px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {authLoading ? "One moment..." : "Continue with email"}
                  </button>
                </div>

                <p className="mt-5 text-center text-[11px] leading-5 text-bond-muted">
                  By continuing, you confirm that you are of legal age and agree to our{" "}
                  <Link href="/legal" className="font-semibold text-bond-rose hover:underline">
                    Terms of Use
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal" className="font-semibold text-bond-rose hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>

                {authError && (
                  <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {authError}
                  </p>
                )}

                {authNotice && (
                  <p className="mt-4 rounded-xl border border-bond-gold/20 bg-bond-gold/10 px-4 py-3 text-sm text-bond-gold">
                    {authNotice}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col justify-center p-6 md:p-8">
                <p className="text-center font-display text-3xl font-bold text-bond-rose drop-shadow-[0_0_14px_rgba(255,92,168,0.28)]">
                  Keep your companion
                </p>

                <div className="mt-8 space-y-3">
                  <Link
                    href="/pricing"
                    className="bond-pink-button block rounded-xl bg-bond-violet px-5 py-3 text-center text-sm font-bold text-white"
                  >
                    Unlock Standard
                  </Link>
                  <Link
                    href="/pricing"
                    className="bond-pink-button block rounded-xl bg-bond-rose px-5 py-3 text-center text-sm font-bold text-white"
                  >
                    Unlock Premium
                  </Link>
                  <Link
                    href="/pricing"
                    className="bond-pink-button block rounded-xl border border-bond-gold/50 bg-bond-gold/15 px-5 py-3 text-center text-sm font-bold text-bond-gold"
                  >
                    Unlock Elite
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
