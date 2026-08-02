"use client";

import { useEffect, useState } from "react";
import { useSiteLanguage, type LanguageCode } from "@/lib/site-language";

type BannerKind = "discover" | "pricing" | "create";
type DiscoverBannerPair = readonly [string, string];

const discoverBannerSources: Record<LanguageCode, DiscoverBannerPair> = {
  EN: [
    "/assets/banners/discover/en.png?v=discover-rotation-20260801",
    "/assets/banners/discover/en-2.png?v=discover-second-updated-20260801"
  ],
  ES: [
    "/assets/banners/discover/es.png?v=discover-rotation-20260801",
    "/assets/banners/discover/es-2.png?v=discover-second-updated-20260801"
  ],
  FR: [
    "/assets/banners/discover/fr.png?v=discover-rotation-20260801",
    "/assets/banners/discover/fr-2.png?v=discover-second-updated-20260801"
  ],
  DE: [
    "/assets/banners/discover/de.png?v=discover-rotation-20260801",
    "/assets/banners/discover/de-2.png?v=discover-second-updated-20260801"
  ],
  JA: [
    "/assets/banners/discover/ja.png?v=discover-rotation-20260801",
    "/assets/banners/discover/ja-2.png?v=discover-second-updated-20260801"
  ],
  KO: [
    "/assets/banners/discover/ko.png?v=discover-rotation-20260801",
    "/assets/banners/discover/ko-2.png?v=discover-second-updated-20260801"
  ]
};

const bannerSources: Record<
  Exclude<BannerKind, "discover">,
  Record<LanguageCode, string>
> = {
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

type DiscoverBannerRotationProps = Omit<
  LocalizedBannerImageProps,
  "banner"
> & {
  sources: DiscoverBannerPair;
};

function DiscoverBannerRotation({
  sources,
  alt,
  className,
  draggable
}: DiscoverBannerRotationProps) {
  const [activeBanner, setActiveBanner] = useState<0 | 1>(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveBanner((current) => (current === 0 ? 1 : 0));
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const baseClasses = `${className ?? ""} transition-opacity duration-700 ease-in-out`;

  return (
    <span className="relative block w-full">
      <img
        src={sources[0]}
        alt={alt}
        className={`${baseClasses} ${
          activeBanner === 0 ? "opacity-100" : "opacity-0"
        }`}
        draggable={draggable}
      />
      <img
        src={sources[1]}
        alt=""
        aria-hidden="true"
        className={`${baseClasses} absolute inset-0 ${
          activeBanner === 1 ? "opacity-100" : "opacity-0"
        }`}
        draggable={draggable}
      />
    </span>
  );
}

export function LocalizedBannerImage({
  banner,
  alt,
  className,
  draggable
}: LocalizedBannerImageProps) {
  const { language } = useSiteLanguage();

  if (banner === "discover") {
    const sources =
      discoverBannerSources[language] ?? discoverBannerSources.EN;

    return (
      <DiscoverBannerRotation
        key={language}
        sources={sources}
        alt={alt}
        className={className}
        draggable={draggable}
      />
    );
  }

  const src = bannerSources[banner][language] ?? bannerSources[banner].EN;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={draggable}
    />
  );
}
