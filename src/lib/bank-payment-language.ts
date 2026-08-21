import type { LanguageCode } from "@/lib/site-language";

export const BANK_PAYMENT_COPY: Record<
  LanguageCode,
  {
    title: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
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
    bankPickerHint: string;
    copyAndOpen: string;
    bankCopied: string;
    copyAllFirst: string;
  }
> = {
  EN: {
    title: "Pay instantly from your bank",
    step1: "1. Send the EXACT amount shown to EverBond.",
    step2: "2. Copy the bank name, routing number, account number, and EVB‑xxxxxx reference into your bank transfer.",
    step3: "3. After sending the payment, return here and tap “I’ve sent payment.”",
    step4: "4. EverCoin is added automatically once your deposit is confirmed.",
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
    sent: "I’ve sent payment",
    checking: "Checking for your payment...",
    paid: "Payment received. Your EverCoin has been added.",
    pending: "Not received yet. Keep this page open and check again in a moment.",
    back: "Back to EverCoin",
    important: "Use the exact payment reference shown below.",
    instructions: "Your bank decides whether the transfer is sent instantly by RTP/FedNow or by another bank-transfer rail.",
    bankPickerHint: "Tap your bank. EverBond copies the recipient, routing number, account number, exact amount, and payment reference first, then opens your bank so you can paste the details into the transfer.",
    copyAndOpen: "Copy details & open",
    bankCopied: "Payment details copied. {bank} opened in a new tab — paste the details into your transfer.",
    copyAllFirst: "Your browser could not copy automatically. Use “Copy all payment details,” then open your bank."
  },
  ES: {
    title: "Paga al instante desde tu banco",
    step1: "1. Envía a EverBond el importe EXACTO que se muestra.",
    step2: "2. Copia el nombre del banco, el número de ruta, el número de cuenta y la referencia EVB‑xxxxxx en tu transferencia bancaria.",
    step3: "3. Después de enviar el pago, vuelve aquí y pulsa «He enviado el pago».",
    step4: "4. EverCoin se añade automáticamente una vez confirmado tu depósito.",
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
    instructions: "Tu banco decide si la transferencia se envía al instante mediante RTP/FedNow u otra red bancaria.",
    bankPickerHint: "Toca tu banco. EverBond copia primero el destinatario, el número de ruta, la cuenta, el importe exacto y la referencia; después abre tu banco para que pegues los datos en la transferencia.",
    copyAndOpen: "Copiar datos y abrir",
    bankCopied: "Datos de pago copiados. {bank} se abrió en otra pestaña; pega los datos en tu transferencia.",
    copyAllFirst: "El navegador no pudo copiar automáticamente. Usa “Copiar todos los datos de pago” y después abre tu banco."
  },
  FR: {
    title: "Payez instantanément depuis votre banque",
    step1: "1. Envoyez à EverBond le montant EXACT affiché.",
    step2: "2. Copiez le nom de la banque, le numéro de routage, le numéro de compte et la référence EVB‑xxxxxx dans votre virement bancaire.",
    step3: "3. Après avoir envoyé le paiement, revenez ici et appuyez sur « J’ai envoyé le paiement ».",
    step4: "4. Les EverCoin sont ajoutés automatiquement dès que votre dépôt est confirmé.",
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
    instructions: "Votre banque décide si le virement est envoyé instantanément via RTP/FedNow ou par un autre réseau bancaire.",
    bankPickerHint: "Touchez votre banque. EverBond copie d’abord le bénéficiaire, le routage, le compte, le montant exact et la référence, puis ouvre votre banque pour que vous puissiez coller les informations dans le virement.",
    copyAndOpen: "Copier et ouvrir",
    bankCopied: "Informations copiées. {bank} s’est ouverte dans un nouvel onglet — collez les informations dans votre virement.",
    copyAllFirst: "Le navigateur n’a pas pu copier automatiquement. Utilisez « Copier toutes les informations », puis ouvrez votre banque."
  },
  DE: {
    title: "Sofort von deinem Bankkonto bezahlen",
    step1: "1. Sende den angezeigten EXAKTEN Betrag an EverBond.",
    step2: "2. Kopiere Bankname, Routing-Nummer, Kontonummer und die EVB‑xxxxxx-Referenz in deine Banküberweisung.",
    step3: "3. Kehre nach dem Senden der Zahlung hierher zurück und tippe auf „Ich habe die Zahlung gesendet“.",
    step4: "4. EverCoin werden automatisch hinzugefügt, sobald deine Einzahlung bestätigt ist.",
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
    instructions: "Deine Bank entscheidet, ob die Überweisung sofort über RTP/FedNow oder über einen anderen Bankweg gesendet wird.",
    bankPickerHint: "Tippe auf deine Bank. EverBond kopiert zuerst Empfänger, Routing-Nummer, Kontonummer, exakten Betrag und Zahlungsreferenz und öffnet dann deine Bank, damit du die Daten in die Überweisung einfügen kannst.",
    copyAndOpen: "Daten kopieren & öffnen",
    bankCopied: "Zahlungsdaten kopiert. {bank} wurde in einem neuen Tab geöffnet — füge die Daten in deine Überweisung ein.",
    copyAllFirst: "Automatisches Kopieren war nicht möglich. Nutze „Alle Zahlungsdaten kopieren“ und öffne danach deine Bank."
  },
  JA: {
    title: "銀行からすぐに支払う",
    step1: "1. 表示された正確な金額をEverBondへ送金してください。",
    step2: "2. 銀行名、ルーティング番号、口座番号、EVB‑xxxxxx参照番号を銀行振込に入力してください。",
    step3: "3. 送金後、このページに戻り「支払いを送信しました」をタップしてください。",
    step4: "4. 入金が確認されるとEverCoinが自動的に追加されます。",
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
    instructions: "送金がRTP/FedNowで即時処理されるか、別の銀行送金経路になるかは送金元の銀行が決定します。",
    bankPickerHint: "銀行をタップすると、EverBondが受取人・ルーティング番号・口座番号・正確な金額・参照番号を先にコピーし、その後銀行を開きます。送金画面に貼り付けてください。",
    copyAndOpen: "情報をコピーして開く",
    bankCopied: "支払い情報をコピーしました。{bank}を新しいタブで開きました。送金画面に貼り付けてください。",
    copyAllFirst: "自動コピーできませんでした。「支払い情報をすべてコピー」を押してから銀行を開いてください。"
  },
  KO: {
    title: "은행에서 즉시 결제",
    step1: "1. 표시된 정확한 금액을 EverBond로 보내세요.",
    step2: "2. 은행 이름, 라우팅 번호, 계좌 번호, EVB‑xxxxxx 참조 코드를 은행 송금에 입력하세요.",
    step3: "3. 결제를 보낸 후 여기로 돌아와 “결제를 보냈습니다”를 누르세요.",
    step4: "4. 입금이 확인되면 EverCoin이 자동으로 추가됩니다.",
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
    instructions: "송금이 RTP/FedNow를 통해 즉시 처리되는지 다른 은행 송금 방식으로 처리되는지는 송금 은행이 결정합니다.",
    bankPickerHint: "은행을 누르면 EverBond가 수취인, 라우팅 번호, 계좌 번호, 정확한 금액과 참조 코드를 먼저 복사한 뒤 은행을 엽니다. 송금 화면에 붙여 넣으세요.",
    copyAndOpen: "정보 복사 후 열기",
    bankCopied: "결제 정보를 복사했습니다. {bank}을(를) 새 탭에서 열었습니다. 송금 화면에 붙여 넣으세요.",
    copyAllFirst: "자동 복사를 할 수 없습니다. ‘모든 결제 정보 복사’를 누른 뒤 은행을 여세요."
  }
};
