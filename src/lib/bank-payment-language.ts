import type { LanguageCode } from "@/lib/site-language";

export const BANK_PAYMENT_COPY: Record<
  LanguageCode,
  {
    title: string;
    subtitle: string;
    amount: string;
    bank: string;
    routing: string;
    account: string;
    reference: string;
    copy: string;
    copied: string;
    copyAll: string;
    chooseBank: string;
    openBank: string;
    sent: string;
    checking: string;
    paid: string;
    pending: string;
    back: string;
    important: string;
    instructions: string;
  }
> = {
  EN: {
    title: "Pay instantly from your bank",
    subtitle: "Send the exact amount to EverBond, include the payment reference, then return here. EverCoin is added only after the deposit is confirmed.",
    amount: "Amount",
    bank: "Receiving bank",
    routing: "Routing number",
    account: "Account number",
    reference: "Payment reference",
    copy: "Copy",
    copied: "Copied",
    copyAll: "Copy all payment details",
    chooseBank: "Choose your bank",
    openBank: "Open bank",
    sent: "I've sent the payment",
    checking: "Checking for your payment...",
    paid: "Payment received. Your EverCoin has been added.",
    pending: "Not received yet. Keep this page open and check again in a moment.",
    back: "Back to EverCoin",
    important: "Use the exact payment reference shown below.",
    instructions: "Your bank decides whether the transfer is sent instantly by RTP/FedNow or by another bank-transfer rail."
  },
  ES: {
    title: "Paga al instante desde tu banco",
    subtitle: "Envía el importe exacto a EverBond, incluye la referencia de pago y vuelve aquí. Los EverCoin se añaden solo cuando se confirma el depósito.",
    amount: "Importe",
    bank: "Banco receptor",
    routing: "Número de ruta",
    account: "Número de cuenta",
    reference: "Referencia de pago",
    copy: "Copiar",
    copied: "Copiado",
    copyAll: "Copiar todos los datos de pago",
    chooseBank: "Elige tu banco",
    openBank: "Abrir banco",
    sent: "Ya envié el pago",
    checking: "Buscando tu pago...",
    paid: "Pago recibido. Tus EverCoin se han añadido.",
    pending: "Aún no se ha recibido. Mantén esta página abierta y vuelve a comprobar en un momento.",
    back: "Volver a EverCoin",
    important: "Usa exactamente la referencia de pago que aparece abajo.",
    instructions: "Tu banco decide si la transferencia se envía al instante mediante RTP/FedNow u otra red bancaria."
  },
  FR: {
    title: "Payez instantanément depuis votre banque",
    subtitle: "Envoyez le montant exact à EverBond, ajoutez la référence de paiement puis revenez ici. Les EverCoin sont ajoutés uniquement après confirmation du dépôt.",
    amount: "Montant",
    bank: "Banque destinataire",
    routing: "Numéro de routage",
    account: "Numéro de compte",
    reference: "Référence de paiement",
    copy: "Copier",
    copied: "Copié",
    copyAll: "Copier toutes les informations",
    chooseBank: "Choisissez votre banque",
    openBank: "Ouvrir la banque",
    sent: "J'ai envoyé le paiement",
    checking: "Vérification du paiement...",
    paid: "Paiement reçu. Vos EverCoin ont été ajoutés.",
    pending: "Pas encore reçu. Gardez cette page ouverte et réessayez dans un instant.",
    back: "Retour à EverCoin",
    important: "Utilisez exactement la référence de paiement affichée ci-dessous.",
    instructions: "Votre banque décide si le virement est envoyé instantanément via RTP/FedNow ou par un autre réseau bancaire."
  },
  DE: {
    title: "Sofort von deinem Bankkonto bezahlen",
    subtitle: "Sende den exakten Betrag an EverBond, gib die Zahlungsreferenz an und kehre hierher zurück. EverCoin werden erst nach bestätigtem Zahlungseingang gutgeschrieben.",
    amount: "Betrag",
    bank: "Empfängerbank",
    routing: "Routing-Nummer",
    account: "Kontonummer",
    reference: "Zahlungsreferenz",
    copy: "Kopieren",
    copied: "Kopiert",
    copyAll: "Alle Zahlungsdaten kopieren",
    chooseBank: "Wähle deine Bank",
    openBank: "Bank öffnen",
    sent: "Ich habe die Zahlung gesendet",
    checking: "Zahlung wird geprüft...",
    paid: "Zahlung eingegangen. Deine EverCoin wurden hinzugefügt.",
    pending: "Noch nicht eingegangen. Lass diese Seite geöffnet und prüfe gleich noch einmal.",
    back: "Zurück zu EverCoin",
    important: "Verwende genau die unten angezeigte Zahlungsreferenz.",
    instructions: "Deine Bank entscheidet, ob die Überweisung sofort über RTP/FedNow oder über einen anderen Bankweg gesendet wird."
  },
  JA: {
    title: "銀行からすぐに支払う",
    subtitle: "正確な金額をEverBondへ送金し、支払い参照番号を入力してこのページへ戻ってください。入金確認後にEverCoinが追加されます。",
    amount: "金額",
    bank: "受取銀行",
    routing: "ルーティング番号",
    account: "口座番号",
    reference: "支払い参照番号",
    copy: "コピー",
    copied: "コピー済み",
    copyAll: "支払い情報をすべてコピー",
    chooseBank: "銀行を選択",
    openBank: "銀行を開く",
    sent: "支払いを送信しました",
    checking: "支払いを確認しています...",
    paid: "入金を確認しました。EverCoinを追加しました。",
    pending: "まだ入金を確認できません。ページを開いたまま、少し待って再確認してください。",
    back: "EverCoinへ戻る",
    important: "下に表示される支払い参照番号を正確に使用してください。",
    instructions: "送金がRTP/FedNowで即時処理されるか、別の銀行送金経路になるかは送金元の銀行が決定します。"
  },
  KO: {
    title: "은행에서 즉시 결제",
    subtitle: "정확한 금액을 EverBond로 보내고 결제 참조 코드를 입력한 뒤 이 페이지로 돌아오세요. 입금이 확인된 후 EverCoin이 추가됩니다.",
    amount: "금액",
    bank: "수취 은행",
    routing: "라우팅 번호",
    account: "계좌 번호",
    reference: "결제 참조 코드",
    copy: "복사",
    copied: "복사됨",
    copyAll: "모든 결제 정보 복사",
    chooseBank: "은행 선택",
    openBank: "은행 열기",
    sent: "결제를 보냈습니다",
    checking: "결제를 확인하는 중...",
    paid: "입금이 확인되었습니다. EverCoin이 추가되었습니다.",
    pending: "아직 입금되지 않았습니다. 이 페이지를 열어 두고 잠시 후 다시 확인하세요.",
    back: "EverCoin으로 돌아가기",
    important: "아래 표시된 결제 참조 코드를 정확히 사용하세요.",
    instructions: "송금이 RTP/FedNow를 통해 즉시 처리되는지 다른 은행 송금 방식으로 처리되는지는 송금 은행이 결정합니다."
  }
};
