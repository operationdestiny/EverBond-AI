import type { LanguageCode } from "@/lib/site-language";

type BankPaymentCopy = {
  customTitle: string;
  customRate: string;
  customPrompt: string;
  customPlaceholder: string;
  youReceive: string;
  continue: string;
  reserving: string;
  waiting: string;
  invalidAmount: string;
  title: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  amount: string;
  adjusted: string;
  recipient: string;
  bank: string;
  accountType: string;
  checking: string;
  routing: string;
  account: string;
  copy: string;
  copied: string;
  copyAll: string;
  sent: string;
  checkingPayment: string;
  paid: string;
  pending: string;
  back: string;
};

export const BANK_PAYMENT_COPY: Record<LanguageCode, BankPaymentCopy> = {
  EN: {
    customTitle: "Choose how much EverCoin you want",
    customRate: "1 EverCoin = 1¢",
    customPrompt: "Enter the amount you want to send.",
    customPlaceholder: "20.00",
    youReceive: "You receive",
    continue: "Continue to bank details",
    reserving: "Reserving your exact transfer amount...",
    waiting:
      "That amount and the five lower cent amounts are currently being used for other payments. Waiting for one to clear...",
    invalidAmount: "Enter an amount of at least $0.06.",
    title: "Pay from your bank",
    step1: "1. Send the EXACT amount shown below.",
    step2:
      "2. Use the recipient name, bank, checking account type, routing number, and account number shown below.",
    step3:
      "3. Send it using any bank-transfer method your bank offers that can send to a routing and account number.",
    step4:
      "4. Return here and tap “I’ve sent payment.” Every cent received becomes 1 EverCoin.",
    amount: "Exact transfer amount",
    adjusted: "To keep your payment unique, EverBond reserved {amount}. You receive {coins} EverCoin — 1 for every cent sent.",
    recipient: "Recipient",
    bank: "Receiving bank",
    accountType: "Account type",
    checking: "Checking",
    routing: "Routing number",
    account: "Account number",
    copy: "Copy",
    copied: "Copied",
    copyAll: "Copy all bank details",
    sent: "I’ve sent payment",
    checkingPayment: "Checking for your payment...",
    paid: "Payment received. Your EverCoin has been added.",
    pending: "Not received yet. Check again in a moment.",
    back: "Back to EverCoin"
  },
  ES: {
    customTitle: "Elige cuántos EverCoin quieres",
    customRate: "1 EverCoin = 1¢",
    customPrompt: "Introduce el importe que quieres enviar.",
    customPlaceholder: "20.00",
    youReceive: "Recibes",
    continue: "Continuar a los datos bancarios",
    reserving: "Reservando el importe exacto de tu transferencia...",
    waiting:
      "Ese importe y los cinco centavos inferiores están siendo usados por otros pagos. Esperando a que uno quede libre...",
    invalidAmount: "Introduce un importe de al menos $0.06.",
    title: "Paga desde tu banco",
    step1: "1. Envía el importe EXACTO que aparece abajo.",
    step2:
      "2. Usa el nombre del destinatario, el banco, el tipo de cuenta corriente, el número de ruta y el número de cuenta que aparecen abajo.",
    step3:
      "3. Envíalo mediante cualquier método de transferencia bancaria que permita enviar a un número de ruta y cuenta.",
    step4:
      "4. Vuelve aquí y pulsa «He enviado el pago». Cada centavo recibido se convierte en 1 EverCoin.",
    amount: "Importe exacto de la transferencia",
    adjusted: "Para mantener tu pago único, EverBond reservó {amount}. Recibes {coins} EverCoin: 1 por cada centavo enviado.",
    recipient: "Destinatario",
    bank: "Banco receptor",
    accountType: "Tipo de cuenta",
    checking: "Cuenta corriente",
    routing: "Número de ruta",
    account: "Número de cuenta",
    copy: "Copiar",
    copied: "Copiado",
    copyAll: "Copiar todos los datos bancarios",
    sent: "He enviado el pago",
    checkingPayment: "Comprobando tu pago...",
    paid: "Pago recibido. Tus EverCoin se han añadido.",
    pending: "Aún no se ha recibido. Vuelve a comprobar en un momento.",
    back: "Volver a EverCoin"
  },
  FR: {
    customTitle: "Choisissez le nombre d’EverCoin souhaité",
    customRate: "1 EverCoin = 1¢",
    customPrompt: "Saisissez le montant que vous souhaitez envoyer.",
    customPlaceholder: "20.00",
    youReceive: "Vous recevez",
    continue: "Continuer vers les coordonnées bancaires",
    reserving: "Réservation du montant exact de votre virement...",
    waiting:
      "Ce montant et les cinq centimes inférieurs sont utilisés par d’autres paiements. En attente d’un montant disponible...",
    invalidAmount: "Saisissez un montant d’au moins 0,06 $.",
    title: "Payez depuis votre banque",
    step1: "1. Envoyez le montant EXACT indiqué ci-dessous.",
    step2:
      "2. Utilisez le nom du bénéficiaire, la banque, le type de compte courant, le numéro de routage et le numéro de compte indiqués ci-dessous.",
    step3:
      "3. Envoyez-le avec toute méthode de virement proposée par votre banque qui accepte un numéro de routage et de compte.",
    step4:
      "4. Revenez ici et appuyez sur « J’ai envoyé le paiement ». Chaque centime reçu devient 1 EverCoin.",
    amount: "Montant exact du virement",
    adjusted: "Pour rendre votre paiement unique, EverBond a réservé {amount}. Vous recevez {coins} EverCoin — 1 par centime envoyé.",
    recipient: "Bénéficiaire",
    bank: "Banque destinataire",
    accountType: "Type de compte",
    checking: "Compte courant",
    routing: "Numéro de routage",
    account: "Numéro de compte",
    copy: "Copier",
    copied: "Copié",
    copyAll: "Copier toutes les coordonnées bancaires",
    sent: "J’ai envoyé le paiement",
    checkingPayment: "Vérification de votre paiement...",
    paid: "Paiement reçu. Vos EverCoin ont été ajoutés.",
    pending: "Pas encore reçu. Réessayez dans un instant.",
    back: "Retour à EverCoin"
  },
  DE: {
    customTitle: "Wähle, wie viele EverCoin du möchtest",
    customRate: "1 EverCoin = 1¢",
    customPrompt: "Gib den Betrag ein, den du senden möchtest.",
    customPlaceholder: "20.00",
    youReceive: "Du erhältst",
    continue: "Weiter zu den Bankdaten",
    reserving: "Dein exakter Überweisungsbetrag wird reserviert...",
    waiting:
      "Dieser Betrag und die fünf niedrigeren Cent-Beträge werden gerade für andere Zahlungen verwendet. Wir warten auf einen freien Betrag...",
    invalidAmount: "Gib einen Betrag von mindestens 0,06 $ ein.",
    title: "Von deinem Bankkonto bezahlen",
    step1: "1. Sende den unten angezeigten EXAKTEN Betrag.",
    step2:
      "2. Verwende Empfängername, Bank, Kontotyp Girokonto, Routing-Nummer und Kontonummer wie unten angezeigt.",
    step3:
      "3. Sende ihn mit jeder von deiner Bank angebotenen Überweisungsmethode, die Routing- und Kontonummern unterstützt.",
    step4:
      "4. Kehre hierher zurück und tippe auf „Ich habe die Zahlung gesendet“. Jeder eingegangene Cent wird zu 1 EverCoin.",
    amount: "Exakter Überweisungsbetrag",
    adjusted: "Damit deine Zahlung eindeutig bleibt, hat EverBond {amount} reserviert. Du erhältst {coins} EverCoin — 1 pro gesendetem Cent.",
    recipient: "Empfänger",
    bank: "Empfängerbank",
    accountType: "Kontotyp",
    checking: "Girokonto",
    routing: "Routing-Nummer",
    account: "Kontonummer",
    copy: "Kopieren",
    copied: "Kopiert",
    copyAll: "Alle Bankdaten kopieren",
    sent: "Ich habe die Zahlung gesendet",
    checkingPayment: "Zahlung wird geprüft...",
    paid: "Zahlung eingegangen. Deine EverCoin wurden hinzugefügt.",
    pending: "Noch nicht eingegangen. Prüfe gleich noch einmal.",
    back: "Zurück zu EverCoin"
  },
  JA: {
    customTitle: "購入するEverCoinの量を選択",
    customRate: "1 EverCoin = 1¢",
    customPrompt: "送金したい金額を入力してください。",
    customPlaceholder: "20.00",
    youReceive: "受け取るEverCoin",
    continue: "銀行情報へ進む",
    reserving: "正確な送金額を確保しています...",
    waiting:
      "その金額と5セント下までの金額は他の支払いで使用中です。空きが出るまで待っています...",
    invalidAmount: "$0.06以上の金額を入力してください。",
    title: "銀行から支払う",
    step1: "1. 下に表示された正確な金額を送金してください。",
    step2:
      "2. 下に表示された受取人名、銀行名、当座預金口座、ルーティング番号、口座番号を使用してください。",
    step3:
      "3. ルーティング番号と口座番号へ送金できる、銀行が提供する任意の銀行振込方法を使用してください。",
    step4:
      "4. 送金後ここに戻り「支払いを送信しました」をタップしてください。入金1セントごとに1 EverCoinが追加されます。",
    amount: "正確な送金額",
    adjusted: "支払いを一意にするため、EverBondは{amount}を確保しました。送金1セントにつき1 EverCoin、合計{coins} EverCoinを受け取ります。",
    recipient: "受取人",
    bank: "受取銀行",
    accountType: "口座種類",
    checking: "当座預金",
    routing: "ルーティング番号",
    account: "口座番号",
    copy: "コピー",
    copied: "コピー済み",
    copyAll: "銀行情報をすべてコピー",
    sent: "支払いを送信しました",
    checkingPayment: "支払いを確認しています...",
    paid: "入金を確認しました。EverCoinを追加しました。",
    pending: "まだ入金を確認できません。少し待って再確認してください。",
    back: "EverCoinへ戻る"
  },
  KO: {
    customTitle: "원하는 EverCoin 금액 선택",
    customRate: "1 EverCoin = 1¢",
    customPrompt: "보내고 싶은 금액을 입력하세요.",
    customPlaceholder: "20.00",
    youReceive: "받는 EverCoin",
    continue: "은행 정보로 계속",
    reserving: "정확한 송금 금액을 예약하는 중...",
    waiting:
      "해당 금액과 최대 5센트 낮은 금액이 다른 결제에 사용 중입니다. 빈 금액을 기다리는 중...",
    invalidAmount: "$0.06 이상의 금액을 입력하세요.",
    title: "은행에서 결제",
    step1: "1. 아래 표시된 정확한 금액을 보내세요.",
    step2:
      "2. 아래의 수취인 이름, 은행, 당좌예금 계좌 유형, 라우팅 번호, 계좌 번호를 사용하세요.",
    step3:
      "3. 라우팅 번호와 계좌 번호로 보낼 수 있는 은행의 송금 방법을 사용하세요.",
    step4:
      "4. 송금 후 여기로 돌아와 “결제를 보냈습니다”를 누르세요. 입금된 1센트마다 1 EverCoin이 추가됩니다.",
    amount: "정확한 송금 금액",
    adjusted: "결제를 고유하게 식별하기 위해 EverBond가 {amount}을 예약했습니다. 보낸 1센트당 1 EverCoin, 총 {coins} EverCoin을 받습니다.",
    recipient: "수취인",
    bank: "수취 은행",
    accountType: "계좌 유형",
    checking: "당좌예금",
    routing: "라우팅 번호",
    account: "계좌 번호",
    copy: "복사",
    copied: "복사됨",
    copyAll: "모든 은행 정보 복사",
    sent: "결제를 보냈습니다",
    checkingPayment: "결제를 확인하는 중...",
    paid: "입금이 확인되었습니다. EverCoin이 추가되었습니다.",
    pending: "아직 입금되지 않았습니다. 잠시 후 다시 확인하세요.",
    back: "EverCoin으로 돌아가기"
  }
};
