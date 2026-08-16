export type EverCoinPackCode =
  | "500"
  | "1000"
  | "1200"
  | "2000"
  | "5000";

export type EverCoinPack = {
  code: EverCoinPackCode;
  coins: number;
  displayPrice: string;
  amountMinor: number;
  /** Legacy Stripe price env. New payment rails do not require this. */
  priceEnv?: string;
};

export const EVERCOIN_PACKS: Record<EverCoinPackCode, EverCoinPack> = {
  "500": {
    code: "500",
    coins: 500,
    displayPrice: "$4.99",
    amountMinor: 499,
    priceEnv: "STRIPE_PRICE_EVERCOIN_500"
  },
  // Kept only so historical Stripe/Paddle transactions can still be reconciled.
  // This pack is no longer shown in the customer checkout.
  "1000": {
    code: "1000",
    coins: 1_000,
    displayPrice: "$9.99",
    amountMinor: 999,
    priceEnv: "STRIPE_PRICE_EVERCOIN_1000"
  },
  "1200": {
    code: "1200",
    coins: 1_200,
    displayPrice: "$12.09",
    amountMinor: 1_209
  },
  "2000": {
    code: "2000",
    coins: 2_000,
    displayPrice: "$19.99",
    amountMinor: 1_999
  },
  "5000": {
    code: "5000",
    coins: 5_000,
    displayPrice: "$44.99",
    amountMinor: 4_499,
    priceEnv: "STRIPE_PRICE_EVERCOIN_5000"
  }
};

export const EVERCOIN_CARD_PACK_CODES = ["1200", "2000", "5000"] as const;
export const EVERCOIN_CRYPTO_PACK_CODES = ["500", "1200", "5000"] as const;

export function getEverCoinPack(code: string | null | undefined) {
  if (!code) return null;
  return EVERCOIN_PACKS[code as EverCoinPackCode] ?? null;
}

export function getEverCoinPackPriceId(pack: EverCoinPack) {
  if (!pack.priceEnv) return null;
  const value = process.env[pack.priceEnv]?.trim();
  return value || null;
}

export function getEverCoinPackByPriceId(priceId: string) {
  return (
    Object.values(EVERCOIN_PACKS).find(
      (pack) => getEverCoinPackPriceId(pack) === priceId
    ) ?? null
  );
}

export function isEverCoinCardPack(code: string) {
  return (EVERCOIN_CARD_PACK_CODES as readonly string[]).includes(code);
}

export function isEverCoinCryptoPack(code: string) {
  return (EVERCOIN_CRYPTO_PACK_CODES as readonly string[]).includes(code);
}
