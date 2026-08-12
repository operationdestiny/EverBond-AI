import type { LanguageCode } from "@/lib/site-language";

type EverCoinPageCopy = {
  title: string;
  description: string;
  messagesTitle: string;
  messagesBody: string;
  messageUnit: string;
  giftsTitle: string;
  giftsBody: string;
  giftRate: string;
  imagesTitle: string;
  imagesBody: string;
  imageUnit: string;
  videosTitle: string;
  videosBody: string;
  videoUnit: string;
  voiceCallsTitle: string;
  voiceCallsBody: string;
  minuteUnit: string;
  about: string;
  buyButton: string;
  checkoutFailed: string;
};

export const EVERCOIN_PAGE_COPY: Record<
  LanguageCode,
  EverCoinPageCopy
> = {
  EN: {
    title: "One currency for everything on EverBond.",
    description:
      "Use EverCoin for uncensored messages, gifts, uncensored companion images and uncensored companion videos.",
    messagesTitle: "Messages",
    messagesBody:
      "Say what you actually mean. Explore romance, intimacy, fantasy, comfort, conflict, and roleplay without refusals or watered-down replies.",
    messageUnit: "message",
    giftsTitle: "Gifts",
    giftsBody:
      "Unlock romantic, cute, and thoughtful gifts your companion will love.",
    giftRate: "EverCoin varies / gift",
    imagesTitle: "Uncensored Companion Images",
    imagesBody: "Create private images of your companion.",
    imageUnit: "image",
    videosTitle: "Uncensored Companion Videos",
    videosBody: "Create premium private videos of your companion.",
    videoUnit: "video",
    voiceCallsTitle: "Live Uncensored Voice Video Calls",
    voiceCallsBody:
      "Talk live with your companion who has the same personality, relationship, and Ever Memory™.",
    minuteUnit: "minute",
    about: "Around",
    buyButton: "Buy EverCoin",
    checkoutFailed: "Checkout failed"
  },
  ES: {
    title: "Una moneda para todo en EverBond.",
    description:
      "Usa EverCoin para mensajes sin censura, regalos, imágenes sin censura de tu compañero y vídeos sin censura de tu compañero.",
    messagesTitle: "Mensajes",
    messagesBody:
      "Di lo que realmente quieres decir. Explora romance, intimidad, fantasía, consuelo, conflicto y rol sin rechazos ni respuestas diluidas.",
    messageUnit: "mensaje",
    giftsTitle: "Regalos",
    giftsBody:
      "Desbloquea regalos románticos, tiernos y atentos que le encantarán a tu compañero.",
    giftRate: "EverCoin varía / regalo",
    imagesTitle: "Imágenes sin censura del compañero",
    imagesBody: "Crea imágenes privadas de tu compañero.",
    imageUnit: "imagen",
    videosTitle: "Vídeos sin censura del compañero",
    videosBody: "Crea vídeos privados prémium de tu compañero.",
    videoUnit: "vídeo",
    voiceCallsTitle:
      "Videollamadas de voz en directo sin censura",
    voiceCallsBody:
      "Habla en directo con tu compañero, que conserva la misma personalidad, relación y Ever Memory™.",
    minuteUnit: "minuto",
    about: "Alrededor de",
    buyButton: "Comprar EverCoin",
    checkoutFailed: "No se pudo abrir el pago"
  },
  FR: {
    title: "Une seule monnaie pour tout sur EverBond.",
    description:
      "Utilisez EverCoin pour les messages non censurés, les cadeaux, les images de compagnon non censurées et les vidéos de compagnon non censurées.",
    messagesTitle: "Messages",
    messagesBody:
      "Dites ce que vous pensez vraiment. Explorez la romance, l’intimité, la fantaisie, le réconfort, le conflit et le jeu de rôle sans refus ni réponses édulcorées.",
    messageUnit: "message",
    giftsTitle: "Cadeaux",
    giftsBody:
      "Débloquez des cadeaux romantiques, adorables et attentionnés que votre compagnon aimera.",
    giftRate: "EverCoin variable / cadeau",
    imagesTitle: "Images de compagnon non censurées",
    imagesBody: "Créez des images privées de votre compagnon.",
    imageUnit: "image",
    videosTitle: "Vidéos de compagnon non censurées",
    videosBody:
      "Créez des vidéos privées premium de votre compagnon.",
    videoUnit: "vidéo",
    voiceCallsTitle:
      "Appels vidéo vocaux en direct non censurés",
    voiceCallsBody:
      "Parlez en direct avec votre compagnon, qui conserve la même personnalité, relation et Ever Memory™.",
    minuteUnit: "minute",
    about: "Environ",
    buyButton: "Acheter des EverCoin",
    checkoutFailed: "Impossible d’ouvrir le paiement"
  },
  DE: {
    title: "Eine Währung für alles auf EverBond.",
    description:
      "Nutze EverCoin für unzensierte Nachrichten, Geschenke, unzensierte Begleiterbilder und unzensierte Begleitervideos.",
    messagesTitle: "Nachrichten",
    messagesBody:
      "Sag, was du wirklich meinst. Erlebe Romantik, Intimität, Fantasie, Trost, Konflikte und Rollenspiel ohne Ablehnungen oder verwässerte Antworten.",
    messageUnit: "Nachricht",
    giftsTitle: "Geschenke",
    giftsBody:
      "Schalte romantische, süße und aufmerksame Geschenke frei, die dein Begleiter lieben wird.",
    giftRate: "EverCoin variiert / Geschenk",
    imagesTitle: "Unzensierte Begleiterbilder",
    imagesBody: "Erstelle private Bilder deines Begleiters.",
    imageUnit: "Bild",
    videosTitle: "Unzensierte Begleitervideos",
    videosBody: "Erstelle private Premium-Videos deines Begleiters.",
    videoUnit: "Video",
    voiceCallsTitle: "Unzensierte Live-Voice-Videoanrufe",
    voiceCallsBody:
      "Sprich live mit deinem Begleiter, der dieselbe Persönlichkeit, Beziehung und Ever Memory™ behält.",
    minuteUnit: "Minute",
    about: "Etwa",
    buyButton: "EverCoin kaufen",
    checkoutFailed: "Bezahlvorgang konnte nicht geöffnet werden"
  },
  JA: {
    title: "EverBondのすべてに使えるひとつの通貨。",
    description:
      "EverCoinは、無検閲のメッセージ、ギフト、無検閲のコンパニオン画像、無検閲のコンパニオン動画に使えます。",
    messagesTitle: "メッセージ",
    messagesBody:
      "本当に言いたいことを伝えましょう。拒否や薄められた返答なしで、ロマンス、親密さ、ファンタジー、癒やし、対立、ロールプレイを楽しめます。",
    messageUnit: "メッセージ",
    giftsTitle: "ギフト",
    giftsBody:
      "コンパニオンが喜ぶ、ロマンチックで可愛く心のこもったギフトを利用できます。",
    giftRate: "EverCoin変動 / ギフト",
    imagesTitle: "無検閲のコンパニオン画像",
    imagesBody: "コンパニオンの非公開画像を作成できます。",
    imageUnit: "画像",
    videosTitle: "無検閲のコンパニオン動画",
    videosBody:
      "コンパニオンのプレミアムな非公開動画を作成できます。",
    videoUnit: "動画",
    voiceCallsTitle: "無検閲のライブ音声ビデオ通話",
    voiceCallsBody:
      "同じ性格、関係、Ever Memory™を保ったコンパニオンとライブで話せます。",
    minuteUnit: "分",
    about: "約",
    buyButton: "EverCoinを購入",
    checkoutFailed: "決済を開けませんでした"
  },
  KO: {
    title: "EverBond의 모든 기능을 위한 하나의 화폐.",
    description:
      "EverCoin으로 무검열 메시지, 선물, 무검열 컴패니언 이미지와 무검열 컴패니언 동영상을 이용하세요.",
    messagesTitle: "메시지",
    messagesBody:
      "정말 하고 싶은 말을 하세요. 거절이나 약해진 답변 없이 로맨스, 친밀함, 판타지, 위로, 갈등, 역할극을 즐길 수 있습니다.",
    messageUnit: "메시지",
    giftsTitle: "선물",
    giftsBody:
      "컴패니언이 좋아할 로맨틱하고 귀엽고 정성스러운 선물을 이용하세요.",
    giftRate: "EverCoin 변동 / 선물",
    imagesTitle: "무검열 컴패니언 이미지",
    imagesBody: "컴패니언의 비공개 이미지를 만드세요.",
    imageUnit: "이미지",
    videosTitle: "무검열 컴패니언 동영상",
    videosBody: "컴패니언의 프리미엄 비공개 동영상을 만드세요.",
    videoUnit: "동영상",
    voiceCallsTitle: "무검열 라이브 음성 영상 통화",
    voiceCallsBody:
      "같은 성격, 관계, Ever Memory™를 유지하는 컴패니언과 실시간으로 대화하세요.",
    minuteUnit: "분",
    about: "약",
    buyButton: "EverCoin 구매",
    checkoutFailed: "결제를 열지 못했습니다"
  }
};
