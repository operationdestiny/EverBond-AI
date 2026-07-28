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
      <AuthModal
        open={authModalOpen}
        supabase={supabase}
        character={authCharacter}
        onClose={closeAuthModal}
      />
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
