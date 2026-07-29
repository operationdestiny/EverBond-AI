"use client";

import Link from "next/link";
import { ImageIcon, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Character } from "@/types/character";
import { useAuth } from "@/components/auth/AuthProvider";
import { InsufficientEverCoinModal } from "@/components/media/InsufficientEverCoinModal";
import { VoiceCallModal } from "@/components/media/VoiceCallModal";
import { useSiteLanguage } from "@/lib/site-language";
import { MEDIA_COPY } from "@/lib/media-language";

function chatSlug(pathname: string) {
  const match = pathname.match(/^\/chat\/([^/?#]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : "";
}

type GalleryPayload = {
  images?: Array<{ id: string; url: string }>;
  selectedImageId?: string | null;
};

export function ChatMediaBridge() {
  const pathname = usePathname();
  const slug = chatSlug(pathname);
  const { language } = useSiteLanguage();
  const copy = MEDIA_COPY[language] ?? MEDIA_COPY.EN;
  const {
    session,
    authReady,
    openCharacterAuthModal
  } = useAuth();

  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [displayImage, setDisplayImage] = useState("");
  const [callOpen, setCallOpen] = useState(false);
  const [coinModal, setCoinModal] = useState(false);

  useEffect(() => {
    if (!slug) {
      setMountNode(null);
      return;
    }

    let observer: MutationObserver | null = null;

    function attach() {
      const input = document.querySelector<HTMLElement>(".bond-chat-input");
      const footer = input?.parentElement;

      if (!input || !footer) return false;

      let mount = footer.querySelector<HTMLElement>(
        '[data-everbond-media-toolbar="true"]'
      );

      if (!mount) {
        mount = document.createElement("div");
        mount.dataset.everbondMediaToolbar = "true";
        mount.className =
          "no-scrollbar mx-auto mb-2 flex max-w-4xl flex-nowrap items-center gap-2 overflow-x-auto";
        footer.insertBefore(mount, input);
      }

      setMountNode(mount);
      return true;
    }

    if (!attach()) {
      observer = new MutationObserver(() => {
        if (attach()) observer?.disconnect();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      observer?.disconnect();
      document
        .querySelector<HTMLElement>(
          '[data-everbond-media-toolbar="true"]'
        )
        ?.remove();
    };
  }, [slug]);

  useEffect(() => {
    if (!slug || !authReady) return;

    let cancelled = false;

    void fetch(`/api/characters/${encodeURIComponent(slug)}`, {
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined,
      cache: "no-store"
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));

        if (!cancelled && response.ok && payload?.character) {
          const nextCharacter = payload.character as Character;
          setCharacter(nextCharacter);
          setDisplayImage(nextCharacter.image);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [authReady, session?.access_token, slug]);

  const loadSelectedImage = useCallback(async () => {
    if (!slug || !session?.access_token || !character) return;

    try {
      const response = await fetch(
        `/api/character-gallery/${encodeURIComponent(slug)}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          cache: "no-store"
        }
      );

      if (!response.ok) return;

      const payload = (await response.json()) as GalleryPayload;
      const selected = Array.isArray(payload.images)
        ? payload.images.find(
            (image) => image.id === payload.selectedImageId
          )
        : null;

      setDisplayImage(selected?.url || character.image);
    } catch {
      setDisplayImage(character.image);
    }
  }, [character, session?.access_token, slug]);

  useEffect(() => {
    void loadSelectedImage();

    const interval = window.setInterval(() => {
      void loadSelectedImage();
    }, 45 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, [loadSelectedImage]);

  useEffect(() => {
    function refreshSelectedImage(event: Event) {
      const custom = event as CustomEvent<{
        characterSlug?: string;
      }>;

      if (custom.detail?.characterSlug !== slug) return;
      void loadSelectedImage();
    }

    window.addEventListener(
      "everbond:chat-image-changed",
      refreshSelectedImage
    );

    return () => {
      window.removeEventListener(
        "everbond:chat-image-changed",
        refreshSelectedImage
      );
    };
  }, [loadSelectedImage, slug]);

  useEffect(() => {
    if (!slug || !displayImage || !character?.name) return;

    const resolvedDisplayImage = new URL(
      displayImage,
      window.location.href
    ).href;

    const updateImages = () => {
      const candidates = Array.from(
        document.querySelectorAll<HTMLImageElement>(
          `.v18-main img[alt="${CSS.escape(character.name)}"]`
        )
      );

      candidates.forEach((image) => {
        const belongsToChatPortrait =
          image.closest("aside") ||
          image.closest(".lg\\:hidden") ||
          image.closest('[role="dialog"]');

        if (belongsToChatPortrait && image.src !== resolvedDisplayImage) {
          image.src = displayImage;
        }
      });
    };

    updateImages();

    const observer = new MutationObserver(updateImages);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"]
    });

    return () => observer.disconnect();
  }, [character?.name, displayImage, slug]);

  if (!slug || !character || !mountNode) return null;

  function requireSession(action: () => void) {
    if (!authReady) return;

    if (!session) {
      openCharacterAuthModal({
        name: character!.name,
        image: displayImage || character!.image
      });
      return;
    }

    action();
  }

  const toolbar = (
    <>
      <button
        type="button"
        onClick={() => requireSession(() => setCallOpen(true))}
        className="bond-pink-button inline-flex shrink-0 items-center gap-2 rounded-full bg-bond-rose px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,92,168,0.18)]"
      >
        <Phone size={16} />
        {copy.callCharacter(character.name)}
      </button>

      <Link
        href={session ? `/character/${character.slug}/gallery` : "#"}
        onClick={(event) => {
          if (!session) {
            event.preventDefault();
            requireSession(() => undefined);
          }
        }}
        className="bond-pink-button inline-flex shrink-0 items-center gap-2 rounded-full border border-bond-rose/60 bg-bond-rose/10 px-5 py-2.5 text-sm font-bold text-white"
      >
        <ImageIcon size={16} />
        {copy.imageGallery(character.name)}
      </Link>
    </>
  );

  return (
    <>
      {createPortal(toolbar, mountNode)}

      {session && (
        <VoiceCallModal
          open={callOpen}
          character={character}
          displayImage={displayImage || character.image}
          session={session}
          onInsufficientCoins={() => setCoinModal(true)}
          onClose={(hadTurns) => {
            setCallOpen(false);

            if (hadTurns) {
              window.location.reload();
            }
          }}
        />
      )}

      <InsufficientEverCoinModal
        open={coinModal}
        onClose={() => setCoinModal(false)}
      />
    </>
  );
}
