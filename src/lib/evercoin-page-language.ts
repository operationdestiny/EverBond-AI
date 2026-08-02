import type { LanguageCode } from "@/lib/site-language";

export const EVERCOIN_PAGE_COPY: Record<
  LanguageCode,
  {
    title: string;
    description: string;
    messagesTitle: string;
    messagesBody: string;
    messageUnit: string;
    imageUnit: string;
    checkoutFailed: string;
  }
> = {
  EN: {
    title: "One currency for everything on EverBond.",
    description:
      "Use EverCoin for messages, gifts, unrestricted companion images, and premium voice calls.",
    messagesTitle: "Messages",
    messagesBody:
      "Keep every bond and story going with one simple balance.",
    messageUnit: "message",
    imageUnit: "image",
    checkoutFailed: "Checkout failed"
  },
  ES: {
    title: "Una moneda para todo en EverBond.",
    description:
      "Usa EverCoin para mensajes, regalos, imágenes sin restricciones de tu compañero y llamadas de voz prémium.",
    messagesTitle: "Mensajes",
    messagesBody:
      "Mantén cada vínculo e historia con un solo saldo.",
    messageUnit: "mensaje",
    imageUnit: "imagen",
    checkoutFailed: "No se pudo abrir el pago"
  },
  FR: {
    title: "Une seule monnaie pour tout sur EverBond.",
    description:
      "Utilisez EverCoin pour les messages, les cadeaux, les images sans restriction de votre compagnon et les appels vocaux premium.",
    messagesTitle: "Messages",
    messagesBody:
      "Faites continuer chaque lien et chaque histoire avec un seul solde.",
    messageUnit: "message",
    imageUnit: "image",
    checkoutFailed: "Impossible d’ouvrir le paiement"
  },
  DE: {
    title: "Eine Währung für alles auf EverBond.",
    description:
      "Nutze EverCoin für Nachrichten, Geschenke, uneingeschränkte Begleiterbilder und Premium-Sprachanrufe.",
    messagesTitle: "Nachrichten",
    messagesBody:
      "Halte jede Bindung und Geschichte mit einem einzigen Guthaben am Leben.",
    messageUnit: "Nachricht",
    imageUnit: "Bild",
    checkoutFailed: "Bezahlvorgang konnte nicht geöffnet werden"
  },
  JA: {
    title: "EverBondのすべてに使えるひとつの通貨。",
    description:
      "EverCoinは、メッセージ、ギフト、自由なコンパニオン画像、プレミアム音声通話に使えます。",
    messagesTitle: "メッセージ",
    messagesBody:
      "ひとつの残高で、すべての絆と物語を続けられます。",
    messageUnit: "メッセージ",
    imageUnit: "画像",
    checkoutFailed: "決済を開けませんでした"
  },
  KO: {
    title: "EverBond의 모든 기능을 위한 하나의 화폐.",
    description:
      "EverCoin으로 메시지, 선물, 제한 없는 컴패니언 이미지, 프리미엄 음성 통화를 이용하세요.",
    messagesTitle: "메시지",
    messagesBody:
      "하나의 잔액으로 모든 유대와 이야기를 이어가세요.",
    messageUnit: "메시지",
    imageUnit: "이미지",
    checkoutFailed: "결제를 열지 못했습니다"
  }
};
