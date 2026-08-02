"use client";

import { Coins, Gift } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  EVERSHOP_CATEGORIES,
  EVERSHOP_GIFTS,
  type EverShopCategory,
  type EverShopGift
} from "@/lib/evershop/catalog";
import { EVERSHOP_COPY } from "@/lib/evershop-language";
import { localizeEverShopGift } from "@/lib/evershop/localization";
import {
  useSiteLanguage,
  type LanguageCode
} from "@/lib/site-language";

type InventoryResponse = {
  items?: Array<EverShopGift & { quantity: number }>;
};

const categoryCopyKey: Record<
  EverShopCategory,
  keyof typeof EVERSHOP_COPY.EN
> = {
  all: "all",
  romance: "romance",
  "clothing-jewelry": "clothingJewelry",
  luxury: "luxury",
  "food-treats": "foodTreats",
  magical: "magical"
};

const bannerByLanguage: Record<LanguageCode, string> = {
  EN: "/assets/banners/evershop/en.png?v=evershop-hero-1197x260-20260801",
  ES: "/assets/banners/evershop/es.png?v=evershop-hero-1197x260-20260801",
  FR: "/assets/banners/evershop/fr.png?v=evershop-hero-1197x260-20260801",
  DE: "/assets/banners/evershop/de.png?v=evershop-hero-1197x260-20260801",
  JA: "/assets/banners/evershop/ja.png?v=evershop-hero-1197x260-20260801",
  KO: "/assets/banners/evershop/ko.png?v=evershop-hero-1197x260-20260801"
};

export function EverShopClient({
  shoppingFor
}: {
  shoppingFor: string;
}) {
  const { language } = useSiteLanguage();
  const copy = EVERSHOP_COPY[language] ?? EVERSHOP_COPY.EN;
  const { session, authReady, openAuthModal } = useAuth();

  const [category, setCategory] =
    useState<EverShopCategory>("all");
  const [owned, setOwned] = useState<Record<number, number>>({});
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [purchasePopup, setPurchasePopup] = useState("");

  const visibleGifts = useMemo(() => {
    const gifts =
      category === "all"
        ? EVERSHOP_GIFTS
        : EVERSHOP_GIFTS.filter(
            (gift) => gift.category === category
          );

    return gifts.map((gift) =>
      localizeEverShopGift(gift, language)
    );
  }, [category, language]);

  async function loadInventory() {
    if (!session?.access_token) {
      setOwned({});
      return;
    }

    const response = await fetch("/api/evershop/inventory", {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      cache: "no-store"
    });

    const payload = (await response
      .json()
      .catch(() => ({}))) as InventoryResponse;

    if (!response.ok) return;

    const nextOwned: Record<number, number> = {};

    for (const item of payload.items ?? []) {
      nextOwned[item.id] = item.quantity;
    }

    setOwned(nextOwned);
  }

  useEffect(() => {
    if (!authReady) return;
    void loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, session?.access_token]);

  async function purchaseGift(gift: EverShopGift) {
    if (!session?.access_token) {
      setError(copy.signInToBuy);
      setNotice("");
      openAuthModal();
      return;
    }

    setBuyingId(gift.id);
    setError("");
    setNotice("");
    setPurchasePopup("");

    try {
      const response = await fetch("/api/evershop/purchase", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requestId: crypto.randomUUID(),
          giftId: gift.id
        })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (payload?.error === "INSUFFICIENT_EVERCOIN") {
          setPurchasePopup(copy.insufficientEverCoin);
          return;
        }

        if (payload?.error === "EVERCOIN_DEBT") {
          throw new Error(copy.walletDebt);
        }

        throw new Error(copy.purchaseFailed);
      }

      setOwned((current) => ({
        ...current,
        [gift.id]: Number(
          payload.quantity ?? (current[gift.id] ?? 0) + 1
        )
      }));
      setNotice(`${gift.title}: ${copy.purchaseComplete}`);
    } catch (purchaseError) {
      setError(
        purchaseError instanceof Error
          ? purchaseError.message
          : copy.purchaseFailed
      );
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <>
      <main className="min-h-screen px-4 pb-10 pt-2 md:px-6 md:pb-12 md:pt-3">
        <section className="bond-container">
          <div className="mx-auto max-w-[1500px]">
            <section className="mx-auto aspect-[1197/260] w-full max-w-[1280px] overflow-hidden rounded-[1.35rem] bg-black">
              <img
                src={bannerByLanguage[language]}
                alt={copy.pageTitle}
                className="block h-full w-full object-contain"
              />
            </section>

            {shoppingFor && (
              <div className="mt-3 flex justify-center">
                <p className="inline-flex rounded-full border border-bond-rose/45 bg-black/25 px-4 py-2 text-sm font-bold text-white">
                  {copy.shoppingFor}: {shoppingFor}
                </p>
              </div>
            )}

            {(notice || error) && (
              <div
                className={`mt-4 rounded-2xl border px-5 py-4 text-sm ${
                  error
                    ? "border-red-400/25 bg-red-500/10 text-red-100"
                    : "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
                }`}
              >
                {error || notice}
              </div>
            )}

            <div className="mt-4 flex flex-wrap justify-center gap-2.5">
              {EVERSHOP_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
                    category === item
                      ? "border-bond-rose bg-bond-rose text-white"
                      : "border-bond-rose/40 bg-white/[0.025] text-bond-muted hover:border-bond-rose/70 hover:text-white"
                  }`}
                >
                  {String(copy[categoryCopyKey[item]])}
                </button>
              ))}
            </div>

            <section className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleGifts.map((gift) => {
                const quantity = owned[gift.id] ?? 0;
                const buying = buyingId === gift.id;

                return (
                  <article
                    key={gift.id}
                    className="flex overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.03] shadow-[0_0_26px_rgba(255,92,168,0.04)]"
                  >
                    <div className="flex w-full flex-col">
                      <div className="relative aspect-square overflow-hidden bg-black/30">
                        <img
                          src={gift.image}
                          alt={gift.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        />

                        {quantity > 0 && (
                          <span className="absolute right-3 top-3 rounded-full bg-bond-rose px-3 py-1 text-[11px] font-bold text-white shadow-glow">
                            {copy.owned} × {quantity}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <h2 className="font-display text-lg font-bold leading-tight text-white">
                          {gift.title}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-bond-muted">
                          {gift.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                          <div
                            className="flex items-center gap-1.5 font-display text-xl font-bold text-white"
                            aria-label={`${gift.price} ${copy.everCoin}`}
                          >
                            <Coins
                              size={18}
                              className="text-bond-rose"
                            />
                            {gift.price}
                          </div>

                          <button
                            type="button"
                            onClick={() => void purchaseGift(gift)}
                            disabled={buyingId !== null}
                            className="bond-pink-button inline-flex items-center gap-2 rounded-full bg-bond-rose px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Gift size={15} />
                            {buying ? copy.buying : copy.buyGift}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </div>
        </section>
      </main>

      {purchasePopup && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={purchasePopup}
          onClick={() => setPurchasePopup("")}
        >
          <div
            className="w-full max-w-md rounded-[1.75rem] border border-bond-rose/70 bg-bond-card p-7 text-center shadow-[0_0_42px_rgba(255,92,168,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bond-rose/15 text-bond-rose">
              <Gift size={27} />
            </span>
            <p className="mt-5 text-base font-bold leading-7 text-white">
              {purchasePopup}
            </p>
            <button
              type="button"
              onClick={() => setPurchasePopup("")}
              className="bond-pink-button mt-6 inline-flex min-w-32 items-center justify-center rounded-full bg-bond-rose px-6 py-3 text-sm font-bold text-white"
            >
              {copy.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
