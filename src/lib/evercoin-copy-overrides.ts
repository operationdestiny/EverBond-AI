import { MY_BOND_COPY } from "@/lib/my-bond-language";

const overrides = {
  EN: {
    balance: "EverCoin",
    buy: "Buy EverCoin",
    purchases: "Your EverCoin purchases will appear here after checkout."
  },
  ES: {
    balance: "EverCoin",
    buy: "Comprar EverCoin",
    purchases: "Tus compras de EverCoin aparecerán aquí después del pago."
  },
  FR: {
    balance: "EverCoin",
    buy: "Acheter des EverCoin",
    purchases: "Vos achats d’EverCoin apparaîtront ici après le paiement."
  },
  DE: {
    balance: "EverCoin",
    buy: "EverCoin kaufen",
    purchases: "Deine EverCoin-Käufe werden hier nach dem Bezahlen angezeigt."
  },
  JA: {
    balance: "EverCoin",
    buy: "EverCoinを購入",
    purchases: "EverCoinの購入履歴は決済後にここに表示されます。"
  },
  KO: {
    balance: "EverCoin",
    buy: "EverCoin 구매",
    purchases: "EverCoin 구매 내역은 결제 후 여기에 표시됩니다."
  }
} as const;

for (const language of Object.keys(overrides) as Array<keyof typeof overrides>) {
  MY_BOND_COPY[language].messagesLeft = overrides[language].balance;
  MY_BOND_COPY[language].buyMessages = overrides[language].buy;
  MY_BOND_COPY[language].purchasesWillAppear = overrides[language].purchases;
}
