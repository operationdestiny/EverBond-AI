import type { LanguageCode } from "@/lib/site-language";

export const EVERCOIN_PAYMENT_COPY: Record<
  LanguageCode,
  {
    cardTitle: string;
    cardDescription: string;
    cryptoTitle: string;
    cryptoDescription: string;
    buyCard: string;
    buyCrypto: string;
    checking: string;
    paid: string;
    pending: string;
    expired: string;
    unavailable: string;
  }
> = {
  EN: {
    cardTitle: "Pay with Card / Bank",
    cardDescription: "Pay by card or a supported bank method. Availability varies by region.",
    cryptoTitle: "Pay with Crypto",
    cryptoDescription: "Pay with USDC on the Base network.",
    buyCard: "Buy EverCoin",
    buyCrypto: "Buy EverCoin",
    checking: "Checking your payment...",
    paid: "Payment confirmed. Your EverCoin has been added.",
    pending: "Your payment is still processing. You can safely check again in a moment.",
    expired: "That payment request expired. Please start a new one.",
    unavailable: "This payment method is being configured and is not available yet."
  },
  ES: {
    cardTitle: "Pagar con tarjeta / banco",
    cardDescription: "Paga con tarjeta o con un método bancario compatible. La disponibilidad varía según la región.",
    cryptoTitle: "Pagar con criptomonedas",
    cryptoDescription: "Paga con USDC en la red Base.",
    buyCard: "Comprar EverCoin",
    buyCrypto: "Comprar EverCoin",
    checking: "Comprobando tu pago...",
    paid: "Pago confirmado. Tus EverCoin se han añadido.",
    pending: "Tu pago aún se está procesando. Puedes volver a comprobarlo en un momento.",
    expired: "La solicitud de pago caducó. Inicia una nueva.",
    unavailable: "Este método de pago se está configurando y aún no está disponible."
  },
  FR: {
    cardTitle: "Payer par carte / banque",
    cardDescription: "Payez par carte ou avec un moyen bancaire pris en charge. La disponibilité varie selon la région.",
    cryptoTitle: "Payer en crypto",
    cryptoDescription: "Payez en USDC sur le réseau Base.",
    buyCard: "Acheter EverCoin",
    buyCrypto: "Acheter EverCoin",
    checking: "Vérification de votre paiement...",
    paid: "Paiement confirmé. Vos EverCoin ont été ajoutés.",
    pending: "Votre paiement est toujours en cours. Vous pouvez revérifier dans un instant.",
    expired: "Cette demande de paiement a expiré. Veuillez en créer une nouvelle.",
    unavailable: "Ce moyen de paiement est en cours de configuration et n’est pas encore disponible."
  },
  DE: {
    cardTitle: "Mit Karte / Bank bezahlen",
    cardDescription: "Zahle per Karte oder mit einer unterstützten Bankmethode. Die Verfügbarkeit hängt von der Region ab.",
    cryptoTitle: "Mit Krypto bezahlen",
    cryptoDescription: "Zahle mit USDC im Base-Netzwerk.",
    buyCard: "EverCoin kaufen",
    buyCrypto: "EverCoin kaufen",
    checking: "Zahlung wird geprüft...",
    paid: "Zahlung bestätigt. Deine EverCoin wurden hinzugefügt.",
    pending: "Deine Zahlung wird noch verarbeitet. Du kannst gleich erneut prüfen.",
    expired: "Diese Zahlungsanforderung ist abgelaufen. Bitte starte eine neue.",
    unavailable: "Diese Zahlungsmethode wird gerade eingerichtet und ist noch nicht verfügbar."
  },
  JA: {
    cardTitle: "カード / 銀行で支払う",
    cardDescription: "カードまたは対応している銀行決済で支払えます。利用できる方法は地域によって異なります。",
    cryptoTitle: "暗号資産で支払う",
    cryptoDescription: "BaseネットワークのUSDCで支払います。",
    buyCard: "EverCoinを購入",
    buyCrypto: "EverCoinを購入",
    checking: "お支払いを確認しています...",
    paid: "お支払いを確認しました。EverCoinを追加しました。",
    pending: "お支払いは処理中です。少し待ってから再確認できます。",
    expired: "この支払いリクエストは期限切れです。新しく開始してください。",
    unavailable: "この支払い方法は現在設定中で、まだ利用できません。"
  },
  KO: {
    cardTitle: "카드 / 은행으로 결제",
    cardDescription: "카드 또는 지원되는 은행 결제 수단으로 결제하세요. 이용 가능 여부는 지역에 따라 다릅니다.",
    cryptoTitle: "암호화폐로 결제",
    cryptoDescription: "Base 네트워크의 USDC로 결제하세요.",
    buyCard: "EverCoin 구매",
    buyCrypto: "EverCoin 구매",
    checking: "결제를 확인하는 중...",
    paid: "결제가 확인되었습니다. EverCoin이 추가되었습니다.",
    pending: "결제가 아직 처리 중입니다. 잠시 후 다시 확인할 수 있습니다.",
    expired: "결제 요청이 만료되었습니다. 새 결제를 시작해 주세요.",
    unavailable: "이 결제 방법은 현재 설정 중이며 아직 사용할 수 없습니다."
  }
};
