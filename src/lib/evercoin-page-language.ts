import type { LanguageCode } from "@/lib/site-language";

export const EVERCOIN_PAGE_COPY: Record<
  LanguageCode,
  {
    title: string;
    description: string;
    imageUnit: string;
    checkoutFailed: string;
  }
> = {
  EN: {
    title: "One premium currency to build your bond.",
    description:
      "EverCoin is the premium currency on EverBond for epic gifts, custom unrestricted companion images, and premium voice calls.",
    imageUnit: "image",
    checkoutFailed: "Checkout failed"
  },
  ES: {
    title: "Una moneda prémium para fortalecer tu vínculo.",
    description:
      "EverCoin es la moneda prémium de EverBond para regalos épicos, imágenes personalizadas y sin restricciones de tu compañero, y llamadas de voz prémium.",
    imageUnit: "imagen",
    checkoutFailed: "No se pudo abrir el pago"
  },
  FR: {
    title: "Une monnaie premium pour renforcer votre lien.",
    description:
      "EverCoin est la monnaie premium d’EverBond pour des cadeaux exceptionnels, des images personnalisées et sans restriction de votre compagnon, ainsi que des appels vocaux premium.",
    imageUnit: "image",
    checkoutFailed: "Impossible d’ouvrir le paiement"
  },
  DE: {
    title: "Eine Premiumwährung, um eure Bindung zu stärken.",
    description:
      "EverCoin ist die Premiumwährung von EverBond für besondere Geschenke, individuelle uneingeschränkte Bilder deines Begleiters und Premium-Sprachanrufe.",
    imageUnit: "Bild",
    checkoutFailed: "Bezahlvorgang konnte nicht geöffnet werden"
  },
  JA: {
    title: "絆を深めるためのプレミアム通貨。",
    description:
      "EverCoinは、豪華なギフト、自由にカスタマイズできるコンパニオン画像、プレミアム音声通話に使えるEverBondのプレミアム通貨です。",
    imageUnit: "画像",
    checkoutFailed: "決済を開けませんでした"
  },
  KO: {
    title: "유대감을 키우는 하나의 프리미엄 화폐.",
    description:
      "EverCoin은 특별한 선물, 제한 없이 커스텀할 수 있는 컴패니언 이미지, 프리미엄 음성 통화에 사용하는 EverBond의 프리미엄 화폐입니다.",
    imageUnit: "이미지",
    checkoutFailed: "결제를 열지 못했습니다"
  }
};
