import catalogData from "@/data/evershop-gifts.json";

export const EVERSHOP_CATEGORIES = [
  "all",
  "romance",
  "clothing-jewelry",
  "luxury",
  "food-treats",
  "magical"
] as const;

export type EverShopCategory = (typeof EVERSHOP_CATEGORIES)[number];
export type EverShopTier = "Common" | "Standard" | "Premium";

export type EverShopGift = {
  id: number;
  slug: string;
  category: Exclude<EverShopCategory, "all">;
  categoryLabel: string;
  title: string;
  tier: EverShopTier;
  price: number;
  description: string;
  reactionPreview: string;
  image: string;
};

export const EVERSHOP_GIFTS = catalogData as EverShopGift[];

const giftById = new Map(
  EVERSHOP_GIFTS.map((gift) => [gift.id, gift] as const)
);

export function getEverShopGift(giftId: number) {
  return giftById.get(giftId) ?? null;
}
