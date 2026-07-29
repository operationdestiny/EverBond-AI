"use client";

import Link from "next/link";
import {
  Check,
  ImageIcon,
  LoaderCircle,
  LockKeyhole,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { InsufficientEverCoinModal } from "@/components/media/InsufficientEverCoinModal";
import { useSiteLanguage } from "@/lib/site-language";
import { MEDIA_COPY } from "@/lib/media-language";

type GalleryImage = {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
};

type GalleryData = {
  character: {
    id: string;
    slug: string;
    name: string;
    image: string;
  };
  images: GalleryImage[];
  selectedImageId: string | null;
  limit: number;
  imageCost: number;
};

export function CharacterGalleryClient({
  slug
}: {
  slug: string;
}) {
  const { language } = useSiteLanguage();
  const copy = MEDIA_COPY[language] ?? MEDIA_COPY.EN;
  const {
    session,
    authReady,
    openAuthModal
  } = useAuth();

  const [data, setData] = useState<GalleryData | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pendingCard, setPendingCard] = useState(false);
  const [busyImageId, setBusyImageId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [coinModal, setCoinModal] = useState(false);

  const atLimit = Boolean(data && data.images.length >= data.limit);
  const canGenerate =
    Boolean(data) &&
    !atLimit &&
    prompt.trim().length >= 3 &&
    !generating;

  async function loadGallery() {
    if (!session?.access_token) return;

    setLoading(true);
    setError("");

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

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || copy.mediaError);
      }

      setData(payload as GalleryData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : copy.mediaError
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authReady) return;

    if (!session) {
      openAuthModal();
      setLoading(false);
      return;
    }

    void loadGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, session?.access_token, slug]);

  async function generateImage() {
    if (!session?.access_token || !canGenerate) return;

    const requestId = crypto.randomUUID();
    setGenerating(true);
    setPendingCard(true);
    setError("");

    try {
      const response = await fetch(
        `/api/character-gallery/${encodeURIComponent(slug)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            requestId,
            prompt: prompt.trim()
          })
        }
      );

      const payload = await response.json().catch(() => ({}));

      if (
        response.status === 402 ||
        payload?.error === "INSUFFICIENT_EVERCOIN" ||
        payload?.error === "EVERCOIN_DEBT"
      ) {
        setCoinModal(true);
        return;
      }

      if (payload?.error === "IMAGE_LIMIT_REACHED") {
        setError(copy.galleryLimitReached);
        return;
      }

      if (payload?.error === "IMAGE_REQUEST_IN_PROGRESS") {
        setError(copy.generating);
        return;
      }

      if (!response.ok || !payload?.image) {
        throw new Error(payload?.message || payload?.error || copy.mediaError);
      }

      setData((current) => {
        if (!current) return current;
        const nextImage = payload.image as GalleryImage;
        const withoutDuplicate = current.images.filter(
          (image) => image.id !== nextImage.id
        );

        return {
          ...current,
          images: [nextImage, ...withoutDuplicate]
        };
      });
      setPrompt("");
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : copy.mediaError
      );
    } finally {
      setGenerating(false);
      setPendingCard(false);
    }
  }

  async function act(
    action: "select" | "delete",
    imageId: string
  ) {
    if (!session?.access_token || busyImageId) return;

    setBusyImageId(imageId);
    setError("");

    try {
      const response = await fetch(
        `/api/character-gallery/${encodeURIComponent(slug)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action,
            imageId
          })
        }
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || copy.mediaError);
      }

      if (action === "select") {
        setData((current) =>
          current
            ? {
                ...current,
                selectedImageId: imageId
              }
            : current
        );

        window.dispatchEvent(
          new CustomEvent("everbond:chat-image-changed", {
            detail: {
              characterSlug: slug,
              imageId
            }
          })
        );
        return;
      }

      const deletedWasSelected = data?.selectedImageId === imageId;

      setData((current) =>
        current
          ? {
              ...current,
              images: current.images.filter((image) => image.id !== imageId),
              selectedImageId: deletedWasSelected
                ? null
                : current.selectedImageId
            }
          : current
      );

      if (deletedWasSelected) {
        window.dispatchEvent(
          new CustomEvent("everbond:chat-image-changed", {
            detail: {
              characterSlug: slug,
              imageId: null
            }
          })
        );
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : copy.mediaError
      );
    } finally {
      setBusyImageId(null);
    }
  }

  if (!authReady || loading) {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="bond-container">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-bond-rose/35 bg-white/[0.03] p-12 text-center">
            <LoaderCircle className="mx-auto animate-spin text-bond-rose" />
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="bond-container">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-bond-rose/35 bg-white/[0.03] p-10 text-center text-bond-muted">
            {copy.gallerySubtitle}
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="bond-container">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-400/25 bg-red-500/10 p-10 text-center text-red-100">
            {error || copy.mediaError}
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen px-4 py-10 md:px-6">
        <div className="bond-container">
          <div className="mx-auto max-w-7xl">
            <section className="overflow-hidden rounded-[2.25rem] border border-bond-rose/45 bg-[linear-gradient(135deg,rgba(255,92,168,0.12),rgba(255,255,255,0.025),rgba(89,45,130,0.14))] p-7 shadow-[0_0_48px_rgba(255,92,168,0.10)] md:p-10">
              <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-center">
                <img
                  src={data.character.image}
                  alt={data.character.name}
                  className="aspect-[4/5] w-full rounded-[1.75rem] border border-bond-rose/35 object-cover shadow-[0_0_35px_rgba(255,92,168,0.12)]"
                />

                <div>
                  <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-bond-rose">
                    <LockKeyhole size={16} />
                    {copy.privateGallery}
                  </p>
                  <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-6xl">
                    {copy.galleryTitle(data.character.name)}
                  </h1>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-bond-muted">
                    {copy.gallerySubtitle}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-bond-rose/25 bg-bond-rose/10 px-3 py-1.5 text-sm font-semibold text-bond-rose">
                    <LockKeyhole size={14} />
                    {copy.privateOnly}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-white/75">
                    {data.images.length} / {data.limit} · {copy.imageLimit}
                  </p>

                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder={copy.describeImage}
                    rows={4}
                    maxLength={1500}
                    disabled={atLimit || generating}
                    className="mt-6 w-full resize-none rounded-[1.5rem] border border-white/10 bg-black/25 px-5 py-4 text-white outline-none placeholder:text-bond-muted focus:border-bond-rose/65 disabled:cursor-not-allowed disabled:opacity-55"
                  />

                  {atLimit && (
                    <p className="mt-3 text-sm font-semibold text-bond-gold">
                      {copy.galleryLimitReached}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void generateImage()}
                      disabled={!canGenerate}
                      className="bond-pink-button inline-flex items-center gap-2 rounded-full bg-bond-rose px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {generating ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <ImageIcon size={17} />
                      )}
                      {generating
                        ? copy.generating
                        : `${copy.generateImage} · ${data.imageCost} EverCoin`}
                    </button>

                    <Link
                      href={`/chat/${data.character.slug}`}
                      className="inline-flex rounded-full border border-bond-rose/55 bg-black/25 px-6 py-3 text-sm font-bold text-white hover:bg-bond-rose/10"
                    >
                      {copy.backToChat}
                    </Link>
                  </div>

                  {error && (
                    <p className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      {error}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-8">
              {data.images.length === 0 && !pendingCard ? (
                <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-14 text-center text-bond-muted">
                  {copy.emptyGallery}
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {pendingCard && (
                    <article className="aspect-[4/5] animate-pulse rounded-[1.75rem] border border-bond-rose/40 bg-[radial-gradient(circle_at_center,rgba(255,92,168,0.18),rgba(255,255,255,0.03))]">
                      <div className="flex h-full items-center justify-center">
                        <LoaderCircle
                          className="animate-spin text-bond-rose"
                          size={34}
                        />
                      </div>
                    </article>
                  )}

                  {data.images.map((image) => {
                    const selected = data.selectedImageId === image.id;
                    const busy = busyImageId === image.id;

                    return (
                      <article
                        key={image.id}
                        className={`overflow-hidden rounded-[1.75rem] border bg-black/25 ${
                          selected
                            ? "border-bond-gold shadow-[0_0_30px_rgba(246,196,83,0.18)]"
                            : "border-white/10"
                        }`}
                      >
                        <div className="aspect-[4/5] overflow-hidden bg-black">
                          <img
                            src={image.url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="p-4">
                          <p className="line-clamp-2 min-h-[2.7rem] text-sm leading-6 text-bond-muted">
                            {image.prompt}
                          </p>

                          <button
                            type="button"
                            onClick={() => void act("select", image.id)}
                            disabled={selected || Boolean(busyImageId)}
                            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
                              selected
                                ? "bg-bond-gold/15 text-bond-gold"
                                : "bg-bond-rose text-white"
                            }`}
                          >
                            {busy ? (
                              <LoaderCircle className="animate-spin" size={16} />
                            ) : (
                              <Check size={16} />
                            )}
                            {selected
                              ? copy.activeChatImage
                              : copy.setAsChatImage}
                          </button>

                          <button
                            type="button"
                            onClick={() => void act("delete", image.id)}
                            disabled={Boolean(busyImageId)}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {busy ? (
                              <LoaderCircle className="animate-spin" size={16} />
                            ) : (
                              <Trash2 size={16} />
                            )}
                            {copy.deleteImage}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <InsufficientEverCoinModal
        open={coinModal}
        onClose={() => setCoinModal(false)}
      />
    </>
  );
}
