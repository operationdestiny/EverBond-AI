"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { AuthModal } from "@/components/auth/AuthModal";
import styles from "@/components/auth/PhoneAuthModal.module.css";
import { MY_BOND_COPY } from "@/lib/my-bond-language";
import type { LanguageCode } from "@/lib/site-language";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export type AuthModalCharacter = {
  name: string;
  image: string;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  authReady: boolean;
  openAuthModal: () => void;
  openCharacterAuthModal: (character: AuthModalCharacter) => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
};

const AUTH_LEGAL_PREFIX: Record<LanguageCode, string> = {
  EN: "By continuing, you confirm that you are at least 18 years of age and agree to our",
  ES: "Al continuar, confirmas que tienes al menos 18 años y aceptas nuestros",
  FR: "En continuant, vous confirmez avoir au moins 18 ans et accepter nos",
  DE: "Wenn du fortfährst, bestätigst du, dass du mindestens 18 Jahre alt bist, und stimmst unseren",
  JA: "続行すると、18歳以上であり、以下に同意することを確認します：",
  KO: "계속하면 만 18세 이상이며 다음에 동의함을 확인합니다:"
};

for (const language of Object.keys(
  AUTH_LEGAL_PREFIX
) as LanguageCode[]) {
  MY_BOND_COPY[language].legalPrefix =
    AUTH_LEGAL_PREFIX[language];
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authCharacter, setAuthCharacter] =
    useState<AuthModalCharacter | null>(null);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setAuthReady(true);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);

      if (nextSession) {
        setAuthModalOpen(false);
        setAuthCharacter(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const openAuthModal = useCallback(() => {
    setAuthCharacter(null);
    setAuthModalOpen(true);
  }, []);

  const openCharacterAuthModal = useCallback(
    (character: AuthModalCharacter) => {
      setAuthCharacter(character);
      setAuthModalOpen(true);
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthCharacter(null);
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setSession(null);
    setAuthModalOpen(false);
    setAuthCharacter(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      authReady,
      openAuthModal,
      openCharacterAuthModal,
      closeAuthModal,
      signOut
    }),
    [
      authReady,
      closeAuthModal,
      openAuthModal,
      openCharacterAuthModal,
      session,
      signOut
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <div className={styles.authModalScope}>
        <AuthModal
          open={authModalOpen}
          supabase={supabase}
          character={authCharacter}
          onClose={closeAuthModal}
        />
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
}
