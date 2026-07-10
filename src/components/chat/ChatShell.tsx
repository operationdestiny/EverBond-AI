"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Send, Share2, Star, UserRound, X } from "lucide-react";
import { Character } from "@/types/character";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useSiteLanguage } from "@/lib/site-language";

type Message = { role: "user" | "character"; content: string };

export function ChatShell({ character }: { character: Character }) {
  const { t } = useSiteLanguage();
  const initialCharacterMessage = `${character.description}\n\n${character.openingMessage}`;
  const [messages, setMessages] = useState<Message[]>([{ role: "character", content: initialCharacterMessage }]);
  const [input, setInput] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showPortrait, setShowPortrait] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [saved, setSaved] = useState(false);
  const remaining = Math.max(0, 40 - messages.filter((m) => m.role === "user").length);
  const isPublicCreation = character.category === "public-creations";

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowPortrait(false);
        setShowUpgrade(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

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
    if (navigator.share) navigator.share({ title: `${character.name} on EverBond AI`, text: `Meet ${character.name} on EverBond AI.`, url }).catch(() => undefined);
    else navigator.clipboard?.writeText(url);
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (remaining <= 0) {
      setShowUpgrade(true);
      return;
    }

    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setInput("");
    setMessages(nextMessages);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterSlug: character.slug, messages: nextMessages.slice(-12) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Chat failed");
      if (remaining <= 1) setShowUpgrade(true);
      setMessages((current) => [...current, { role: "character", content: data.reply }]);
    } catch {
      setMessages((current) => [...current, { role: "character", content: `${character.name} looks at you for a second, trying to keep the moment from slipping away. "Say that again. I want to get it right."` }]);
    } finally {
      setIsTyping(false);
    }
  }

  const displayTags = character.tags.filter((tag) => tag !== "Ever Memory™").slice(0, 4);

  return (
    <div className="grid min-h-[calc(100vh-64px)] bg-transparent lg:grid-cols-[415px_1fr]">
      <aside className="hidden border-r border-white/5 bg-black/10 p-2 lg:block">
        <div className="sticky top-20 flex min-h-[calc(100vh-96px)] flex-col pt-3">
          <div className="overflow-hidden rounded-[1.75rem] border border-bond-rose/20 bg-white/[0.035] shadow-[0_0_34px_rgba(255,92,168,0.08)]">
            <button type="button" onClick={() => setShowPortrait(true)} className="relative block aspect-[4/5] w-full overflow-hidden">
              <img src={character.image} alt={character.name} className="h-full w-full object-cover" />
            </button>
          </div>

          <div className="mt-3.5 flex items-center gap-2.5">
            <h1 className="min-w-0 flex-1 rounded-full border border-bond-rose/70 bg-black/35 px-3.5 py-1.5 text-center font-display text-[1.6rem] font-bold leading-tight text-white shadow-[0_0_18px_rgba(255,92,168,0.10)]">
              {character.name}
            </h1>
            <Link href={`/character/${character.slug}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-bond-rose/70 bg-black/35 px-3 py-1.5 text-[13px] font-bold text-white shadow-[0_0_14px_rgba(255,92,168,0.08)] transition hover:bg-bond-rose/10">
              <UserRound size={15} />
              {t("profileButton")}
            </Link>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {displayTags.map((tag) => (
              <span key={tag} className="rounded-full border border-bond-rose/55 bg-black/30 px-2.5 py-1 text-[10px] text-bond-muted">{tag}</span>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-2 pt-3">
            <button onClick={() => setSaved(!saved)} className={`bond-pink-button flex h-8.5 w-8.5 items-center justify-center rounded-full border text-white ${saved ? "border-bond-gold bg-bond-gold/20 text-bond-gold" : "border-white/15 bg-white/[0.035]"}`} aria-label={saved ? t("saved") : t("save")}>
              <Star size={15} />
            </button>
            <button onClick={shareCompanion} className="bond-pink-button flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] text-white" aria-label={t("share")}>
              <Share2 size={15} />
            </button>
            <button onClick={resetConversation} className="bond-pink-button flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] text-white" aria-label={t("refresh")}>
              <RefreshCcw size={15} />
            </button>
          </div>

          <Link href={similarHref} className="bond-pink-button mt-2.5 block rounded-lg bg-bond-rose px-3 py-1.5 text-center text-[11px] font-bold text-white shadow-[0_0_18px_rgba(255,92,168,0.18)]">{t("similarCompanions")}</Link>

          {isPublicCreation && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-bond-muted">
              <p>{t("createdBy")} @{character.creatorUsername ?? "creator"}</p>
              <p className="mt-1">{character.viewCount ?? "1.2k"} {t("views")}</p>
            </div>
          )}
        </div>
      </aside>

      <section className="flex min-h-[calc(100vh-64px)] flex-col">
        <div className="flex items-center justify-between border-b border-white/5 p-4 lg:hidden">
          <button type="button" onClick={() => setShowPortrait(true)} className="flex min-w-0 items-center gap-3">
            <img src={character.image} alt={character.name} className="h-14 w-14 rounded-2xl object-cover" />
            <div className="min-w-0 text-left">
              <h1 className="truncate font-display text-xl font-bold">{character.name}</h1>
              <p className="truncate text-sm text-bond-muted">{character.archetype}</p>
            </div>
          </button>
          <LanguageSelector />
        </div>

        <div className="flex flex-1 flex-col justify-end overflow-hidden">
          <div className="no-scrollbar flex flex-1 flex-col justify-end space-y-3.5 overflow-y-auto p-3.5 md:p-5">
            {messages.map((message, index) => (
              <div key={index} className={`mx-auto flex w-full max-w-4xl ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[720px] whitespace-pre-line rounded-[1.3rem] px-4 py-3 leading-7 ${message.role === "user" ? "bg-bond-rose text-white" : "border border-bond-rose/55 bg-white/[0.04] text-bond-text"}`}>
                  <p>{message.content}</p>
                </div>
              </div>
            ))}

            {isTyping && <div className="flex justify-start"><div className="rounded-[1.5rem] border border-bond-rose/55 bg-white/[0.04] px-5 py-4 text-bond-muted"><span className="animate-pulse">{t("typing")}</span></div></div>}
          </div>

          <div className="border-t border-white/5 bg-bond-bg/88 p-3 backdrop-blur-xl">
            <div className="mx-auto flex max-w-4xl items-center gap-2 rounded-full bg-white/[0.04] p-1.5 bond-chat-input">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") sendMessage(); }}
                placeholder={remaining > 0 ? `${t("messageCharacter")} ${character.name}...` : t("unlockEverMemoryToContinue")}
                disabled={remaining <= 0}
                className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-bond-muted"
              />
              <button onClick={sendMessage} disabled={remaining <= 0} className="bond-pink-button flex h-9 w-9 items-center justify-center rounded-lg bg-bond-rose disabled:cursor-not-allowed disabled:opacity-40" aria-label={t("sendMessage")}>
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {showPortrait && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setShowPortrait(false)}>
          <div className="relative max-h-[90vh] max-w-[min(92vw,520px)] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-glow" onClick={(event) => event.stopPropagation()}>
            <button onClick={() => setShowPortrait(false)} className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black" aria-label={t("closePortrait")}><X size={18} /></button>
            <img src={character.image} alt="" className="max-h-[90vh] w-full object-contain" />
          </div>
        </div>
      )}

      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[1.75rem] border border-bond-violet/40 bg-bond-card p-7 text-center shadow-glow">
            <button onClick={() => setShowUpgrade(false)} className="absolute right-4 top-4 rounded-full p-1 text-bond-muted hover:text-white" aria-label={t("close")}><X size={18} /></button>
            <p className="font-display text-3xl font-bold text-bond-gold drop-shadow-[0_0_18px_rgba(251,191,36,0.55)]">{t("pleaseUpgradeForAccess")}</p>
            <p className="mt-3 text-sm leading-6 text-bond-muted">{t("unlockEverMemoryAndKeepChatting")} {character.name}.</p>
            <Link href="/pricing" className="bond-pink-button mt-6 inline-flex rounded-lg bg-bond-violet px-6 py-3 text-sm font-bold text-white">{t("seePlans")}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
