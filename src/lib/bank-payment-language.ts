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
  paidPending: string;
  pending: string;
  failed: string;
  back: string;
  timingTitle: string;
  timingIntro: string;
  rtpTitle: string;
  rtpBody: string;
  internalTitle: string;
  internalBody: string;
  achTitle: string;
  achBody: string;
  wireTitle: string;
  wireBody: string;
  slowTitle: string;
  slowBody: string;
  provisionalNote: string;
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
      "2. Use the recipient name, receiving bank, checking account type, routing number, and account number shown below.",
    step3:
      "3. Send it using any bank-transfer method your bank offers that can send to a routing and account number.",
    step4:
      "4. Return here and tap “I’ve sent payment.” Every cent received becomes 1 EverCoin.",
    amount: "Exact transfer amount",
    adjusted:
      "To keep your payment unique, EverBond reserved {amount}. You receive {coins} EverCoin — 1 for every cent sent.",
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
    paidPending:
      "Payment detected. Your EverCoin has been added while your bank finishes settlement.",
    pending: "Not visible yet. EverCoin will be added automatically as soon as the transfer appears.",
    failed:
      "The bank removed or reversed the pending transfer. Any provisional EverCoin from it has been reversed automatically.",
    back: "Back to EverCoin",
    timingTitle: "When will my EverCoin arrive?",
    timingIntro:
      "EverBond credits your EverCoin as soon as Plaid first reports the incoming transfer to the connected Navy Federal account. You do not have to wait for final settlement.",
    rtpTitle: "RTP / FedNow",
    rtpBody:
      "Usually the fastest. If the transfer reaches Navy Federal immediately and Plaid reports it immediately, EverCoin is credited as soon as it appears.",
    internalTitle: "Internal / same-bank transfer",
    internalBody:
      "Often appears quickly. EverCoin is credited at the first pending or posted appearance Plaid reports.",
    achTitle: "ACH from another bank",
    achBody:
      "It may appear as pending the same day or later. EverCoin is credited as soon as Plaid first reports the pending or posted deposit.",
    wireTitle: "Wire",
    wireBody:
      "Often arrives the same business day. EverCoin is credited as soon as the incoming wire first appears in Plaid.",
    slowTitle: "Slower ACH",
    slowBody:
      "Some transfers may not appear until the next business day. If that happens, EverCoin is credited the moment Plaid first reports it.",
    provisionalNote:
      "Pending credits are provisional until the bank posts the transfer. If a pending transfer is later removed or reversed, its EverCoin is automatically reversed. If the final posted amount changes, EverCoin is adjusted to the cents actually received."
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
      "2. Usa el nombre del destinatario, el banco receptor, el tipo de cuenta corriente, el número de ruta y el número de cuenta que aparecen abajo.",
    step3:
      "3. Envíalo mediante cualquier método de transferencia bancaria que permita enviar a un número de ruta y cuenta.",
    step4:
      "4. Vuelve aquí y pulsa «He enviado el pago». Cada centavo recibido se convierte en 1 EverCoin.",
    amount: "Importe exacto de la transferencia",
    adjusted:
      "Para mantener tu pago único, EverBond reservó {amount}. Recibes {coins} EverCoin: 1 por cada centavo enviado.",
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
    paidPending:
      "Pago detectado. Tus EverCoin se han añadido mientras el banco termina la liquidación.",
    pending:
      "Aún no aparece. Los EverCoin se añadirán automáticamente en cuanto la transferencia sea visible.",
    failed:
      "El banco eliminó o revirtió la transferencia pendiente. Los EverCoin provisionales de esa transferencia se revirtieron automáticamente.",
    back: "Volver a EverCoin",
    timingTitle: "¿Cuándo llegarán mis EverCoin?",
    timingIntro:
      "EverBond acredita tus EverCoin en cuanto Plaid informa por primera vez de la transferencia entrante en la cuenta conectada de Navy Federal. No tienes que esperar a la liquidación final.",
    rtpTitle: "RTP / FedNow",
    rtpBody:
      "Normalmente es lo más rápido. Si la transferencia llega inmediatamente a Navy Federal y Plaid la informa de inmediato, los EverCoin se acreditan en cuanto aparece.",
    internalTitle: "Transferencia interna / mismo banco",
    internalBody:
      "Suele aparecer rápidamente. Los EverCoin se acreditan en la primera aparición pendiente o contabilizada que Plaid informe.",
    achTitle: "ACH desde otro banco",
    achBody:
      "Puede aparecer como pendiente el mismo día o más tarde. Los EverCoin se acreditan en cuanto Plaid informa por primera vez del depósito pendiente o contabilizado.",
    wireTitle: "Transferencia wire",
    wireBody:
      "Suele llegar el mismo día hábil. Los EverCoin se acreditan en cuanto la transferencia entrante aparece por primera vez en Plaid.",
    slowTitle: "ACH más lento",
    slowBody:
      "Algunas transferencias pueden no aparecer hasta el siguiente día hábil. En ese caso, los EverCoin se acreditan en cuanto Plaid la informa.",
    provisionalNote:
      "Los créditos pendientes son provisionales hasta que el banco contabiliza la transferencia. Si luego se elimina o revierte, sus EverCoin se revierten automáticamente. Si cambia el importe final, los EverCoin se ajustan a los centavos realmente recibidos."
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
      "2. Utilisez le nom du bénéficiaire, la banque destinataire, le type de compte courant, le numéro de routage et le numéro de compte indiqués ci-dessous.",
    step3:
      "3. Utilisez toute méthode de virement proposée par votre banque qui accepte un numéro de routage et de compte.",
    step4:
      "4. Revenez ici et appuyez sur « J’ai envoyé le paiement ». Chaque centime reçu devient 1 EverCoin.",
    amount: "Montant exact du virement",
    adjusted:
      "Pour rendre votre paiement unique, EverBond a réservé {amount}. Vous recevez {coins} EverCoin — 1 par centime envoyé.",
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
    paidPending:
      "Paiement détecté. Vos EverCoin ont été ajoutés pendant que la banque termine le règlement.",
    pending:
      "Pas encore visible. Les EverCoin seront ajoutés automatiquement dès que le virement apparaîtra.",
    failed:
      "La banque a supprimé ou annulé le virement en attente. Les EverCoin provisoires correspondants ont été annulés automatiquement.",
    back: "Retour à EverCoin",
    timingTitle: "Quand mes EverCoin arriveront-ils ?",
    timingIntro:
      "EverBond crédite vos EverCoin dès que Plaid signale pour la première fois le virement entrant sur le compte Navy Federal connecté. Vous n’avez pas besoin d’attendre le règlement final.",
    rtpTitle: "RTP / FedNow",
    rtpBody:
      "Généralement le plus rapide. Si le virement arrive immédiatement chez Navy Federal et que Plaid le signale immédiatement, les EverCoin sont crédités dès son apparition.",
    internalTitle: "Virement interne / même banque",
    internalBody:
      "Apparaît souvent rapidement. Les EverCoin sont crédités à la première apparition en attente ou comptabilisée signalée par Plaid.",
    achTitle: "ACH depuis une autre banque",
    achBody:
      "Peut apparaître en attente le jour même ou plus tard. Les EverCoin sont crédités dès que Plaid signale le dépôt en attente ou comptabilisé.",
    wireTitle: "Virement bancaire",
    wireBody:
      "Arrive souvent le même jour ouvrable. Les EverCoin sont crédités dès que le virement entrant apparaît dans Plaid.",
    slowTitle: "ACH plus lent",
    slowBody:
      "Certains virements peuvent ne pas apparaître avant le jour ouvrable suivant. Dans ce cas, les EverCoin sont crédités dès que Plaid le signale.",
    provisionalNote:
      "Les crédits en attente sont provisoires jusqu’à la comptabilisation du virement. Si le virement est ensuite supprimé ou annulé, ses EverCoin sont annulés automatiquement. Si le montant final change, les EverCoin sont ajustés aux centimes réellement reçus."
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
      "2. Verwende Empfängername, Empfängerbank, Kontotyp Girokonto, Routing-Nummer und Kontonummer wie unten angezeigt.",
    step3:
      "3. Nutze jede von deiner Bank angebotene Überweisungsmethode, die Routing- und Kontonummern unterstützt.",
    step4:
      "4. Kehre hierher zurück und tippe auf „Ich habe die Zahlung gesendet“. Jeder eingegangene Cent wird zu 1 EverCoin.",
    amount: "Exakter Überweisungsbetrag",
    adjusted:
      "Damit deine Zahlung eindeutig bleibt, hat EverBond {amount} reserviert. Du erhältst {coins} EverCoin — 1 pro gesendetem Cent.",
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
    paidPending:
      "Zahlung erkannt. Deine EverCoin wurden hinzugefügt, während die Bank die Buchung abschließt.",
    pending:
      "Noch nicht sichtbar. EverCoin werden automatisch hinzugefügt, sobald die Überweisung erscheint.",
    failed:
      "Die Bank hat die ausstehende Überweisung entfernt oder rückgängig gemacht. Die vorläufigen EverCoin wurden automatisch zurückgebucht.",
    back: "Zurück zu EverCoin",
    timingTitle: "Wann kommen meine EverCoin an?",
    timingIntro:
      "EverBond schreibt deine EverCoin gut, sobald Plaid die eingehende Überweisung auf dem verbundenen Navy-Federal-Konto erstmals meldet. Du musst nicht auf die endgültige Buchung warten.",
    rtpTitle: "RTP / FedNow",
    rtpBody:
      "Normalerweise am schnellsten. Wenn die Zahlung Navy Federal sofort erreicht und Plaid sie sofort meldet, werden die EverCoin beim Erscheinen gutgeschrieben.",
    internalTitle: "Interne / gleiche Bank",
    internalBody:
      "Erscheint oft schnell. EverCoin werden bei der ersten von Plaid gemeldeten ausstehenden oder gebuchten Transaktion gutgeschrieben.",
    achTitle: "ACH von einer anderen Bank",
    achBody:
      "Kann am selben Tag oder später als ausstehend erscheinen. EverCoin werden gutgeschrieben, sobald Plaid die ausstehende oder gebuchte Einzahlung erstmals meldet.",
    wireTitle: "Wire-Überweisung",
    wireBody:
      "Kommt oft am selben Geschäftstag an. EverCoin werden gutgeschrieben, sobald die eingehende Überweisung erstmals in Plaid erscheint.",
    slowTitle: "Langsameres ACH",
    slowBody:
      "Manche Überweisungen erscheinen erst am nächsten Geschäftstag. Dann werden die EverCoin in dem Moment gutgeschrieben, in dem Plaid sie erstmals meldet.",
    provisionalNote:
      "Ausstehende Gutschriften sind vorläufig, bis die Bank die Überweisung bucht. Wird sie später entfernt oder rückgängig gemacht, werden die EverCoin automatisch zurückgebucht. Ändert sich der endgültige Betrag, werden die EverCoin auf die tatsächlich eingegangenen Cent angepasst."
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
      "2. 下に表示された受取人名、受取銀行、当座預金口座、ルーティング番号、口座番号を使用してください。",
    step3:
      "3. ルーティング番号と口座番号へ送金できる、銀行が提供する任意の銀行振込方法を使用してください。",
    step4:
      "4. 送金後ここに戻り「支払いを送信しました」をタップしてください。入金1セントごとに1 EverCoinが追加されます。",
    amount: "正確な送金額",
    adjusted:
      "支払いを一意にするため、EverBondは{amount}を確保しました。送金1セントにつき1 EverCoin、合計{coins} EverCoinを受け取ります。",
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
    paidPending:
      "支払いを検出しました。銀行の最終処理を待たずにEverCoinを追加しました。",
    pending:
      "まだ表示されていません。送金が確認でき次第、EverCoinは自動的に追加されます。",
    failed:
      "銀行が保留中の送金を削除または取り消しました。その送金による仮のEverCoinは自動的に取り消されました。",
    back: "EverCoinへ戻る",
    timingTitle: "EverCoinはいつ追加されますか？",
    timingIntro:
      "EverBondは、接続済みのNavy Federal口座への入金をPlaidが最初に報告した時点でEverCoinを追加します。最終決済を待つ必要はありません。",
    rtpTitle: "RTP / FedNow",
    rtpBody:
      "通常は最速です。Navy Federalへ即時に着金し、Plaidもすぐに報告した場合、表示された時点でEverCoinが追加されます。",
    internalTitle: "同一銀行 / 銀行内送金",
    internalBody:
      "比較的早く表示されることがあります。Plaidが保留中または確定済みとして最初に報告した時点でEverCoinが追加されます。",
    achTitle: "他行からのACH",
    achBody:
      "同日中に保留中として表示される場合も、後になる場合もあります。Plaidが保留中または確定済みの入金を最初に報告した時点でEverCoinが追加されます。",
    wireTitle: "Wire送金",
    wireBody:
      "多くの場合は同営業日に到着します。Plaidに入金が最初に表示された時点でEverCoinが追加されます。",
    slowTitle: "時間のかかるACH",
    slowBody:
      "翌営業日まで表示されないことがあります。その場合もPlaidが最初に報告した瞬間にEverCoinが追加されます。",
    provisionalNote:
      "保留中の入金によるEverCoinは、銀行で確定するまで仮のものです。送金が後で削除・取消された場合は自動的に取り消されます。最終入金額が変わった場合、実際に受け取ったセント数に合わせてEverCoinも調整されます。"
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
      "2. 아래의 수취인 이름, 수취 은행, 당좌예금 계좌 유형, 라우팅 번호, 계좌 번호를 사용하세요.",
    step3:
      "3. 라우팅 번호와 계좌 번호로 보낼 수 있는 은행의 송금 방법을 사용하세요.",
    step4:
      "4. 송금 후 여기로 돌아와 “결제를 보냈습니다”를 누르세요. 입금된 1센트마다 1 EverCoin이 추가됩니다.",
    amount: "정확한 송금 금액",
    adjusted:
      "결제를 고유하게 식별하기 위해 EverBond가 {amount}을 예약했습니다. 보낸 1센트당 1 EverCoin, 총 {coins} EverCoin을 받습니다.",
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
    paidPending:
      "결제가 감지되었습니다. 은행의 최종 정산을 기다리는 동안 EverCoin이 먼저 추가되었습니다.",
    pending:
      "아직 표시되지 않았습니다. 송금이 보이는 즉시 EverCoin이 자동으로 추가됩니다.",
    failed:
      "은행이 보류 중인 송금을 제거하거나 취소했습니다. 해당 송금으로 먼저 지급된 EverCoin은 자동으로 회수되었습니다.",
    back: "EverCoin으로 돌아가기",
    timingTitle: "EverCoin은 언제 들어오나요?",
    timingIntro:
      "EverBond는 연결된 Navy Federal 계좌의 입금을 Plaid가 처음 보고하는 즉시 EverCoin을 지급합니다. 최종 정산까지 기다릴 필요가 없습니다.",
    rtpTitle: "RTP / FedNow",
    rtpBody:
      "보통 가장 빠릅니다. Navy Federal에 즉시 도착하고 Plaid도 즉시 보고하면 표시되는 즉시 EverCoin이 지급됩니다.",
    internalTitle: "같은 은행 / 내부 송금",
    internalBody:
      "빠르게 표시되는 경우가 많습니다. Plaid가 보류 또는 완료 상태로 처음 보고하는 즉시 EverCoin이 지급됩니다.",
    achTitle: "다른 은행에서 보내는 ACH",
    achBody:
      "당일 보류 상태로 표시될 수도 있고 더 늦을 수도 있습니다. Plaid가 보류 또는 완료 입금을 처음 보고하는 즉시 EverCoin이 지급됩니다.",
    wireTitle: "Wire 송금",
    wireBody:
      "보통 같은 영업일에 도착합니다. Plaid에 입금이 처음 표시되는 즉시 EverCoin이 지급됩니다.",
    slowTitle: "느린 ACH",
    slowBody:
      "일부 송금은 다음 영업일까지 표시되지 않을 수 있습니다. 그런 경우에도 Plaid가 처음 보고하는 순간 EverCoin이 지급됩니다.",
    provisionalNote:
      "보류 입금으로 지급된 EverCoin은 은행이 송금을 최종 완료할 때까지 임시 지급입니다. 이후 송금이 제거되거나 취소되면 EverCoin이 자동으로 회수됩니다. 최종 입금액이 달라지면 실제로 받은 센트 수에 맞춰 EverCoin도 자동 조정됩니다."
  }
};
