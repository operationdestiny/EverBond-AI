import type { LanguageCode } from "@/lib/site-language";

type TributePaymentCopy = {
  customRate: string;
  customTitle: string;
  customPrompt: string;
  customPlaceholder: string;
  youReceive: string;
  continue: string;
  opening: string;
  invalidAmount: string;
  secureNote: string;
};

export const TRIBUTE_PAYMENT_COPY: Record<LanguageCode, TributePaymentCopy> = {
  EN: {
    customRate: "1¢ = 1 EverCoin",
    customTitle: "Choose any amount",
    customPrompt: "Enter how much you want to add. Every cent you pay becomes one EverCoin.",
    customPlaceholder: "20.00",
    youReceive: "You receive",
    continue: "Continue to secure checkout",
    opening: "Opening secure checkout...",
    invalidAmount: "Enter an amount from $1.00 to $3,000.00.",
    secureNote: "One-time payment. No subscription."
  },
  ES: {
    customRate: "1¢ = 1 EverCoin",
    customTitle: "Elige cualquier importe",
    customPrompt: "Introduce cuánto quieres añadir. Cada centavo que pagues se convierte en un EverCoin.",
    customPlaceholder: "20.00",
    youReceive: "Recibes",
    continue: "Continuar al pago seguro",
    opening: "Abriendo el pago seguro...",
    invalidAmount: "Introduce un importe entre $1.00 y $3,000.00.",
    secureNote: "Pago único. Sin suscripción."
  },
  FR: {
    customRate: "1¢ = 1 EverCoin",
    customTitle: "Choisissez le montant",
    customPrompt: "Saisissez le montant à ajouter. Chaque centime payé devient un EverCoin.",
    customPlaceholder: "20.00",
    youReceive: "Vous recevez",
    continue: "Continuer vers le paiement sécurisé",
    opening: "Ouverture du paiement sécurisé...",
    invalidAmount: "Saisissez un montant compris entre 1,00 $ et 3 000,00 $.",
    secureNote: "Paiement unique. Aucun abonnement."
  },
  DE: {
    customRate: "1¢ = 1 EverCoin",
    customTitle: "Wähle einen beliebigen Betrag",
    customPrompt: "Gib ein, wie viel du hinzufügen möchtest. Jeder bezahlte Cent wird zu einem EverCoin.",
    customPlaceholder: "20.00",
    youReceive: "Du erhältst",
    continue: "Weiter zur sicheren Zahlung",
    opening: "Sichere Zahlung wird geöffnet...",
    invalidAmount: "Gib einen Betrag zwischen 1,00 $ und 3.000,00 $ ein.",
    secureNote: "Einmalige Zahlung. Kein Abonnement."
  },
  JA: {
    customRate: "1¢ = 1 EverCoin",
    customTitle: "好きな金額を選択",
    customPrompt: "追加したい金額を入力してください。支払った1セントごとに1 EverCoinが付与されます。",
    customPlaceholder: "20.00",
    youReceive: "受け取るEverCoin",
    continue: "安全な決済へ進む",
    opening: "安全な決済を開いています...",
    invalidAmount: "$1.00〜$3,000.00の金額を入力してください。",
    secureNote: "1回限りの支払いです。サブスクリプションではありません。"
  },
  KO: {
    customRate: "1¢ = 1 EverCoin",
    customTitle: "원하는 금액 선택",
    customPrompt: "추가할 금액을 입력하세요. 결제한 1센트마다 EverCoin 1개가 지급됩니다.",
    customPlaceholder: "20.00",
    youReceive: "받는 EverCoin",
    continue: "안전한 결제로 계속",
    opening: "안전한 결제를 여는 중...",
    invalidAmount: "$1.00에서 $3,000.00 사이의 금액을 입력하세요.",
    secureNote: "일회성 결제입니다. 구독이 아닙니다."
  }
};
