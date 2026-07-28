"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useSiteLanguage, type LanguageCode } from "@/lib/site-language";
import { MY_BOND_COPY } from "@/lib/my-bond-language";

type AuthModalProps = {
  open: boolean;
  supabase: SupabaseClient | null;
  onClose: () => void;
};

const GENERAL_LOGIN_IMAGE_BY_LANGUAGE: Record<LanguageCode, string> = {
  EN: "/assets/auth/login/en.png",
  ES: "/assets/auth/login/es.png",
  FR: "/assets/auth/login/fr.png",
  JA: "/assets/auth/login/ja.png",
  DE: "/assets/auth/login/de.png",
  KO: "/assets/auth/login/ko.png"
};

export function AuthModal({
  open,
  supabase,
  onClose
}: AuthModalProps) {
  const { language } = useSiteLanguage();
  const copy = MY_BOND_COPY[language] ?? MY_BOND_COPY.EN;
  const loginImage =
    GENERAL_LOGIN_IMAGE_BY_LANGUAGE[language] ??
    GENERAL_LOGIN_IMAGE_BY_LANGUAGE.EN;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [loading, onClose, open]);

  useEffect(() => {
    if (!open) {
      setError("");
      setNotice("");
      setLoading(false);
    }
  }, [open]);

  async function handleEmailContinue() {
    if (!supabase) {
      setError(copy.loginNotConfigured);
      return;
    }

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError(copy.enterEmailPassword);
      return;
    }

    setError("");
    setNotice("");
    setLoading(true);

    try {
      const signIn = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (!signIn.error && signIn.data.session) {
        onClose();
        return;
      }

      const signUp = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: window.location.href
        }
      });

      if (signUp.error) {
        setError(signUp.error.message);
        return;
      }

      if (!signUp.data.session) {
        setNotice(copy.checkEmail);
        return;
      }

      onClose();
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-[2rem] border-2 border-bond-rose/70 bg-bond-card shadow-[0_0_42px_rgba(255,92,168,0.30)] md:grid-cols-[1.05fr_0.95fr]">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/60 p-2 text-bond-muted transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={copy.close}
        >
          <X size={18} />
        </button>

        <div className="order-2 flex flex-col justify-center p-6 md:order-1 md:p-9">
          <p className="text-center font-display text-3xl font-bold text-bond-rose drop-shadow-[0_0_14px_rgba(255,92,168,0.28)]">
            {copy.authTitle}
          </p>

          <div className="mt-8 space-y-3">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleEmailContinue();
                }
              }}
              type="email"
              autoComplete="email"
              placeholder={copy.email}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-bond-muted focus:border-bond-rose/70"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleEmailContinue();
                }
              }}
              type="password"
              autoComplete="current-password"
              placeholder={copy.password}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-bond-muted focus:border-bond-rose/70"
            />
            <button
              type="button"
              onClick={() => void handleEmailContinue()}
              disabled={loading}
              className="bond-pink-button w-full rounded-xl bg-bond-rose px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? copy.oneMoment : copy.continueWithEmail}
            </button>
          </div>

          <p className="mt-5 text-center text-[11px] leading-5 text-bond-muted">
            {copy.legalPrefix}{" "}
            <Link
              href="/legal#terms"
              className="font-semibold text-bond-rose hover:underline"
            >
              {copy.termsOfUse}
            </Link>{" "}
            {copy.and}{" "}
            <Link
              href="/legal#privacy"
              className="font-semibold text-bond-rose hover:underline"
            >
              {copy.privacyPolicy}
            </Link>
            .
          </p>

          {error && (
            <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          )}

          {notice && (
            <p className="mt-4 rounded-xl border border-bond-gold/20 bg-bond-gold/10 px-4 py-3 text-sm text-bond-gold">
              {notice}
            </p>
          )}
        </div>

        <div className="order-1 flex max-h-[42vh] min-h-[300px] items-center justify-center overflow-hidden bg-black md:order-2 md:max-h-[86vh] md:min-h-[620px]">
          <img
            key={loginImage}
            src={loginImage}
            alt={copy.authImageAlt}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
