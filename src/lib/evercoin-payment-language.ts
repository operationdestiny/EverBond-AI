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
    cardDescription: "Use the simplest available card or bank checkout for your region.",
    cryptoTitle: "Pay with Crypto",
    cryptoDescription: "Choose from the wallet and crypto options available at checkout.",
    buyCard: "Pay with Card / Bank",
    buyCrypto: "Pay with Crypto",
    checking: "Checking your payment...",
    paid: "Payment confirmed. Your EverCoin has been added.",
    pending: "Your payment is still processing. You can safely check again in a moment.",
    expired: "That payment request expired. Please start a new one.",
    unavailable: "This payment method is being configured and is not available yet."
  },
  ES: {
    cardTitle: "Pagar con tarjeta / banco",
    cardDescription: "Usa la opción de tarjeta o banco más sencilla disponible en tu región.",
    cryptoTitle: "Pagar con criptomonedas",
    cryptoDescription: "Elige entre las opciones de billetera y criptomonedas disponibles al pagar.",
    buyCard: "Pagar con tarjeta / banco",
    buyCrypto: "Pagar con criptomonedas",
    checking: "Comprobando tu pago...",
    paid: "Pago confirmado. Tus EverCoin se han añadido.",
    pending: "Tu pago aún se está procesando. Puedes volver a comprobarlo en un momento.",
    expired: "La solicitud de pago caducó. Inicia una nueva.",
    unavailable: "Este método de pago se está configurando y aún no está disponible."
  },
  FR: {
    cardTitle: "Payer par carte / banque",
    cardDescription: "Utilisez l’option carte ou bancaire la plus simple disponible dans votre région.",
    cryptoTitle: "Payer en crypto",
    cryptoDescription: "Choisissez parmi les portefeuilles et cryptomonnaies proposés lors du paiement.",
    buyCard: "Payer par carte / banque",
    buyCrypto: "Payer en crypto",
    checking: "Vérification de votre paiement...",
    paid: "Paiement confirmé. Vos EverCoin ont été ajoutés.",
    pending: "Votre paiement est toujours en cours. Vous pouvez revérifier dans un instant.",
    expired: "Cette demande de paiement a expiré. Veuillez en créer une nouvelle.",
    unavailable: "Ce moyen de paiement est en cours de configuration et n’est pas encore disponible."
  },
  DE: {
    cardTitle: "Mit Karte / Bank bezahlen",
    cardDescription: "Nutze die einfachste in deiner Region verfügbare Karten- oder Bankzahlung.",
    cryptoTitle: "Mit Krypto bezahlen",
    cryptoDescription: "Wähle beim Bezahlen aus den verfügbaren Wallet- und Krypto-Optionen.",
    buyCard: "Mit Karte / Bank bezahlen",
    buyCrypto: "Mit Krypto bezahlen",
    checking: "Zahlung wird geprüft...",
    paid: "Zahlung bestätigt. Deine EverCoin wurden hinzugefügt.",
    pending: "Deine Zahlung wird noch verarbeitet. Du kannst gleich erneut prüfen.",
    expired: "Diese Zahlungsanforderung ist abgelaufen. Bitte starte eine neue.",
    unavailable: "Diese Zahlungsmethode wird gerade eingerichtet und ist noch nicht verfügbar."
  },
  JA: {
    cardTitle: "カード / 銀行で支払う",
    cardDescription: "お住まいの地域で利用できる最も簡単なカードまたは銀行決済を使用します。",
    cryptoTitle: "暗号資産で支払う",
    cryptoDescription: "チェックアウトで利用可能なウォレットと暗号資産から選べます。",
    buyCard: "カード / 銀行で支払う",
    buyCrypto: "暗号資産で支払う",
    checking: "お支払いを確認しています...",
    paid: "お支払いを確認しました。EverCoinを追加しました。",
    pending: "お支払いは処理中です。少し待ってから再確認できます。",
    expired: "この支払いリクエストは期限切れです。新しく開始してください。",
    unavailable: "この支払い方法は現在設定中で、まだ利用できません。"
  },
  KO: {
    cardTitle: "카드 / 은행으로 결제",
    cardDescription: "지역에서 이용 가능한 가장 간편한 카드 또는 은행 결제를 사용하세요.",
    cryptoTitle: "암호화폐로 결제",
    cryptoDescription: "결제 화면에서 이용 가능한 지갑과 암호화폐 옵션을 선택하세요.",
    buyCard: "카드 / 은행으로 결제",
    buyCrypto: "암호화폐로 결제",
    checking: "결제를 확인하는 중...",
    paid: "결제가 확인되었습니다. EverCoin이 추가되었습니다.",
    pending: "결제가 아직 처리 중입니다. 잠시 후 다시 확인할 수 있습니다.",
    expired: "결제 요청이 만료되었습니다. 새 결제를 시작해 주세요.",
    unavailable: "이 결제 방법은 현재 설정 중이며 아직 사용할 수 없습니다."
  }
};
