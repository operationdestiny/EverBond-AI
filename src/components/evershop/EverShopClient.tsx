"use client";

import Link from "next/link";
import { Coins, Gift, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  EVERSHOP_CATEGORIES,
  EVERSHOP_GIFTS,
  type EverShopCategory,
  type EverShopGift
} from "@/lib/evershop/catalog";
import { EVERSHOP_COPY } from "@/lib/evershop-language";
import { useSiteLanguage } from "@/lib/site-language";

type InventoryResponse = {
  items?: Array<EverShopGift & { quantity: number }>;
  balance?: number;
  debt?: number;
};

const categoryCopyKey: Record<EverShopCategory, keyof typeof EVERSHOP_COPY.EN> = {
  all: "all",
  romance: "romance",
  "clothing-jewelry": "clothingJewelry",
  luxury: "luxury",
  "food-treats": "foodTreats",
  magical: "magical"
};

export function EverShopClient({ shoppingFor }: { shoppingFor: string }) {
  const { language } = useSiteLanguage();
  const copy = EVERSHOP_COPY[language] ?? EVERSHOP_COPY.EN;
  const { session, authReady, openAuthModal } = useAuth();

  const [category, setCategory] = useState<EverShopCategory>("all");
  const [balance, setBalance] = useState(0);
  const [debt, setDebt] = useState(0);
  const [owned, setOwned] = useState<Record<number, number>>({});
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const visibleGifts = useMemo(
    () =>
      category === "all"
        ? EVERSHOP_GIFTS
        : EVERSHOP_GIFTS.filter((gift) => gift.category === category),
    [category]
  );

  async function loadInventory() {
    if (!session?.access_token) {
      setBalance(0);
      setDebt(0);
      setOwned({});
      return;
    }

    const response = await fetch("/api/evershop/inventory", {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      cache: "no-store"
    });

    const payload = (await response.json().catch(() => ({}))) as InventoryResponse;
    if (!response.ok) return;

    const nextOwned: Record<number, number> = {};
    for (const item of payload.items ?? []) {
      nextOwned[item.id] = item.quantity;
    }

    setOwned(nextOwned);
    setBalance(Number(payload.balance ?? 0));
    setDebt(Number(payload.debt ?? 0));
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
          throw new Error(copy.insufficientEverCoin);
        }
        if (payload?.error === "EVERCOIN_DEBT") {
          throw new Error(copy.walletDebt);
        }
        throw new Error(copy.purchaseFailed);
      }

      setBalance(Number(payload.balance ?? balance));
      setDebt(Number(payload.debt ?? debt));
      setOwned((current) => ({
        ...current,
        [gift.id]: Number(payload.quantity ?? (current[gift.id] ?? 0) + 1)
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

  function tierLabel(gift: EverShopGift) {
    if (gift.tier === "Premium") return copy.premium;
    if (gift.tier === "Standard") return copy.standard;
    return copy.common;
  }

  return (
    <main className="min-h-screen px-4 py-10 md:px-6 md:py-12">
      <section className="bond-container">
        <div className="mx-auto max-w-[1500px]">
          <section className="relative overflow-hidden rounded-[2rem] border border-bond-rose/45 bg-[linear-gradient(135deg,rgba(255,92,168,0.13),rgba(255,255,255,0.025),rgba(89,45,130,0.15))] p-7 shadow-[0_0_48px_rgba(255,92,168,0.12)] md:p-10">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-bond-rose/20 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-bond-rose">
                  {copy.pageEyebrow}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <ShoppingBag className="text-bond-rose" size={38} />
                  <h1 className="font-display text-5xl font-bold text-white md:text-7xl">
                    {copy.pageTitle}
                  </h1>
                </div>
                <p className="mt-5 max-w-3xl text-base leading-8 text-bond-muted md:text-lg">
                  {copy.pageDescription}
                </p>
                {shoppingFor && (
                  <p className="mt-4 inline-flex rounded-full border border-bond-rose/45 bg-black/25 px-4 py-2 text-sm font-bold text-white">
                    {copy.shoppingFor}: {shoppingFor}
                  </p>
                )}
              </div>

              <div className="min-w-[260px] rounded-[1.6rem] border border-bond-rose/45 bg-black/35 p-6 text-center shadow-[0_0_30px_rgba(255,92,168,0.12)]">
                <Coins className="mx-auto text-bond-gold" size={28} />
                <p className="mt-3 font-display text-5xl font-bold text-white">
                  {authReady && session ? balance.toLocaleString() : "—"}
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-bond-rose">
                  {copy.balance}
                </p>
                <Link
                  href="/coins"
                  className="bond-pink-button mt-5 inline-flex w-full items-center justify-center rounded-full bg-bond-rose px-5 py-3 text-sm font-bold text-white"
                >
                  {copy.buyEverCoin}
                </Link>
              </div>
            </div>
          </section>

          {(notice || error) && (
            <div
              className={`mt-5 rounded-2xl border px-5 py-4 text-sm ${
                error
                  ? "border-red-400/25 bg-red-500/10 text-red-100"
                  : "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
              }`}
            >
              {error || notice}
            </div>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
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

          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
                      <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
                        {tierLabel(gift)}
                      </span>
                      {quantity > 0 && (
                        <span className="absolute right-3 top-3 rounded-full bg-bond-rose px-3 py-1 text-[11px] font-bold text-white shadow-glow">
                          {copy.owned} × {quantity}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="font-display text-xl font-bold leading-tight text-white">
                        {gift.title}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-bond-muted">
                        {gift.description}
                      </p>

                      <div className="mt-4 rounded-2xl border border-bond-rose/25 bg-bond-rose/[0.06] p-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-bond-rose">
                          {copy.typicalReaction}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-bond-muted">
                          {gift.reactionPreview}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                        <div className="flex items-center gap-1.5 font-display text-xl font-bold text-bond-gold">
                          <Coins size={18} />
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
  );
}
