"use client";

import { useSiteLanguage, type LanguageCode } from "@/lib/site-language";

type BannerKind = "discover" | "pricing" | "create";

const bannerSources: Record<BannerKind, Record<LanguageCode, string>> = {
  discover: {
    EN: "/assets/everbond-v19-real-coin-hero.png",
    ES: "/assets/banners/discover/es.png?v=discover-shrink-inside-1120x235",
    FR: "/assets/banners/discover/fr.png?v=discover-shrink-inside-1120x235",
    DE: "/assets/banners/discover/de.png?v=discover-shrink-inside-1120x235",
    JA: "/assets/banners/discover/ja.png?v=discover-shrink-inside-1120x235",
    KO: "/assets/banners/discover/ko.png?v=discover-shrink-inside-1120x235"
  },
  pricing: {
    EN: "/assets/everbond-pricing-v66.png",
    ES: "/assets/banners/pricing/es.png",
    FR: "/assets/banners/pricing/fr.png",
    DE: "/assets/banners/pricing/de.png",
    JA: "/assets/banners/pricing/ja.png",
    KO: "/assets/banners/pricing/ko.png"
  },
  create: {
    EN: "/assets/create-character-hero-v72.png",
    ES: "/assets/banners/create/es.png",
    FR: "/assets/banners/create/fr.png",
    DE: "/assets/banners/create/de.png",
    JA: "/assets/banners/create/ja.png",
    KO: "/assets/banners/create/ko.png"
  }
};

type LocalizedBannerImageProps = {
  banner: BannerKind;
  alt: string;
  className?: string;
  draggable?: boolean;
};

export function LocalizedBannerImage({
  banner,
  alt,
  className,
  draggable
}: LocalizedBannerImageProps) {
  const { language } = useSiteLanguage();
  const src = bannerSources[banner][language] ?? bannerSources[banner].EN;

  return <img src={src} alt={alt} className={className} draggable={draggable} />;
}
