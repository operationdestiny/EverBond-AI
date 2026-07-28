import type { LanguageCode } from "@/lib/site-language";

export type MyBondCopy = {
  loginSignup: string;
  logout: string;
  authTitle: string;
  authSubtitle: string;
  authImageAlt: string;
  email: string;
  password: string;
  continueWithEmail: string;
  oneMoment: string;
  enterEmailPassword: string;
  loginNotConfigured: string;
  checkEmail: string;
  legalPrefix: string;
  termsOfUse: string;
  and: string;
  privacyPolicy: string;
  close: string;
  loadingBond: string;
  lockedTitle: string;
  lockedDescription: string;
  dashboardEyebrow: string;
  welcomeBack: string;
  messagesLeft: string;
  buyMessages: string;
  recentChats: string;
  createdCompanions: string;
  favorites: string;
  continueChat: string;
  noRecentChats: string;
  startChatting: string;
  myCompanions: string;
  characterLimit: string;
  createCompanion: string;
  all: string;
  public: string;
  private: string;
  noCompanions: string;
  openCompanion: string;
  favoriteCompanions: string;
  noFavorites: string;
  exploreCompanions: string;
  accountInformation: string;
  accountEmail: string;
  username: string;
  memberSince: string;
  purchaseHistory: string;
  noPurchases: string;
  purchasesWillAppear: string;
  loadError: string;
  retry: string;
};

export const MY_BOND_COPY: Record<LanguageCode, MyBondCopy> = {
  EN: {
    loginSignup: "Log in / Sign up",
    logout: "Log out",
    authTitle: "Start your bond",
    authSubtitle: "Your bonds, stories, and memories—all in one place.",
    authImageAlt: "Welcome to EverBond",
    email: "Email",
    password: "Password",
    continueWithEmail: "Continue with email",
    oneMoment: "One moment...",
    enterEmailPassword: "Enter your email and password.",
    loginNotConfigured: "Login is not configured yet.",
    checkEmail: "Check your email to finish creating your account.",
    legalPrefix: "By continuing, you confirm that you are of legal age and agree to our",
    termsOfUse: "Terms of Use",
    and: "and",
    privacyPolicy: "Privacy Policy",
    close: "Close",
    loadingBond: "Loading your bond...",
    lockedTitle: "Log in or sign up to access My Bond.",
    lockedDescription:
      "My Bond is where your favorites, chats, account details, created companions, and personal EverBond info will live.",
    dashboardEyebrow: "MY BOND",
    welcomeBack: "Welcome back",
    messagesLeft: "Messages Left",
    buyMessages: "Buy Messages",
    recentChats: "Recent Chats",
    createdCompanions: "Created Companions",
    favorites: "Favorites",
    continueChat: "Continue Chat",
    noRecentChats: "No recent chats yet.",
    startChatting: "Explore Companions",
    myCompanions: "My Companions",
    characterLimit: "of 100 created",
    createCompanion: "Create Companion",
    all: "All",
    public: "Public",
    private: "Private",
    noCompanions: "You have not created any companions in this section yet.",
    openCompanion: "Open Companion",
    favoriteCompanions: "Favorite Companions",
    noFavorites: "You have not saved any favorites yet.",
    exploreCompanions: "Explore Companions",
    accountInformation: "Account Information",
    accountEmail: "Email",
    username: "Username",
    memberSince: "Member Since",
    purchaseHistory: "Purchase History",
    noPurchases: "No purchases yet.",
    purchasesWillAppear:
      "Message-bundle and EverCoin purchases will appear here after Paddle is connected.",
    loadError: "My Bond could not be loaded.",
    retry: "Try Again"
  },
  ES: {
    loginSignup: "Iniciar sesión / Registrarse",
    logout: "Cerrar sesión",
    authTitle: "Comienza tu vínculo",
    authSubtitle: "Tus vínculos, historias y recuerdos, todos en un solo lugar.",
    authImageAlt: "Bienvenido a EverBond",
    email: "Correo electrónico",
    password: "Contraseña",
    continueWithEmail: "Continuar con correo",
    oneMoment: "Un momento...",
    enterEmailPassword: "Introduce tu correo electrónico y contraseña.",
    loginNotConfigured: "El inicio de sesión aún no está configurado.",
    checkEmail: "Revisa tu correo para terminar de crear tu cuenta.",
    legalPrefix: "Al continuar, confirmas que tienes la edad legal y aceptas nuestros",
    termsOfUse: "Términos de uso",
    and: "y",
    privacyPolicy: "Política de privacidad",
    close: "Cerrar",
    loadingBond: "Cargando tu vínculo...",
    lockedTitle: "Inicia sesión o regístrate para acceder a Mi Vínculo.",
    lockedDescription:
      "Mi Vínculo es donde estarán tus favoritos, chats, detalles de cuenta, compañeros creados e información personal de EverBond.",
    dashboardEyebrow: "MI VÍNCULO",
    welcomeBack: "Te damos la bienvenida",
    messagesLeft: "Mensajes restantes",
    buyMessages: "Comprar mensajes",
    recentChats: "Chats recientes",
    createdCompanions: "Compañeros creados",
    favorites: "Favoritos",
    continueChat: "Continuar chat",
    noRecentChats: "Aún no tienes chats recientes.",
    startChatting: "Explorar compañeros",
    myCompanions: "Mis compañeros",
    characterLimit: "de 100 creados",
    createCompanion: "Crear compañero",
    all: "Todos",
    public: "Públicos",
    private: "Privados",
    noCompanions: "Todavía no has creado compañeros en esta sección.",
    openCompanion: "Abrir compañero",
    favoriteCompanions: "Compañeros favoritos",
    noFavorites: "Todavía no has guardado favoritos.",
    exploreCompanions: "Explorar compañeros",
    accountInformation: "Información de la cuenta",
    accountEmail: "Correo electrónico",
    username: "Nombre de usuario",
    memberSince: "Miembro desde",
    purchaseHistory: "Historial de compras",
    noPurchases: "Aún no hay compras.",
    purchasesWillAppear:
      "Las compras de paquetes de mensajes y EverCoin aparecerán aquí cuando Paddle esté conectado.",
    loadError: "No se pudo cargar Mi Vínculo.",
    retry: "Intentar de nuevo"
  },
  FR: {
    loginSignup: "Connexion / Inscription",
    logout: "Se déconnecter",
    authTitle: "Commencez votre lien",
    authSubtitle: "Vos liens, vos histoires et vos souvenirs, réunis au même endroit.",
    authImageAlt: "Bienvenue sur EverBond",
    email: "E-mail",
    password: "Mot de passe",
    continueWithEmail: "Continuer avec l’e-mail",
    oneMoment: "Un instant...",
    enterEmailPassword: "Saisissez votre e-mail et votre mot de passe.",
    loginNotConfigured: "La connexion n’est pas encore configurée.",
    checkEmail: "Consultez votre e-mail pour terminer la création de votre compte.",
    legalPrefix: "En continuant, vous confirmez avoir l’âge légal et accepter nos",
    termsOfUse: "Conditions d’utilisation",
    and: "et notre",
    privacyPolicy: "Politique de confidentialité",
    close: "Fermer",
    loadingBond: "Chargement de votre lien...",
    lockedTitle: "Connectez-vous ou inscrivez-vous pour accéder à Mon Lien.",
    lockedDescription:
      "Mon Lien rassemble vos favoris, vos chats, les informations de votre compte, vos compagnons créés et vos données personnelles EverBond.",
    dashboardEyebrow: "MON LIEN",
    welcomeBack: "Heureux de vous revoir",
    messagesLeft: "Messages restants",
    buyMessages: "Acheter des messages",
    recentChats: "Chats récents",
    createdCompanions: "Compagnons créés",
    favorites: "Favoris",
    continueChat: "Continuer le chat",
    noRecentChats: "Aucun chat récent pour le moment.",
    startChatting: "Explorer les compagnons",
    myCompanions: "Mes compagnons",
    characterLimit: "sur 100 créés",
    createCompanion: "Créer un compagnon",
    all: "Tous",
    public: "Publics",
    private: "Privés",
    noCompanions: "Vous n’avez encore créé aucun compagnon dans cette section.",
    openCompanion: "Ouvrir le compagnon",
    favoriteCompanions: "Compagnons favoris",
    noFavorites: "Vous n’avez encore enregistré aucun favori.",
    exploreCompanions: "Explorer les compagnons",
    accountInformation: "Informations du compte",
    accountEmail: "E-mail",
    username: "Nom d’utilisateur",
    memberSince: "Membre depuis",
    purchaseHistory: "Historique des achats",
    noPurchases: "Aucun achat pour le moment.",
    purchasesWillAppear:
      "Les achats de packs de messages et d’EverCoin apparaîtront ici une fois Paddle connecté.",
    loadError: "Impossible de charger Mon Lien.",
    retry: "Réessayer"
  },
  JA: {
    loginSignup: "ログイン / 新規登録",
    logout: "ログアウト",
    authTitle: "絆を始める",
    authSubtitle: "あなたの絆、物語、記憶をひとつの場所に。",
    authImageAlt: "EverBond へようこそ",
    email: "メールアドレス",
    password: "パスワード",
    continueWithEmail: "メールで続ける",
    oneMoment: "少々お待ちください...",
    enterEmailPassword: "メールアドレスとパスワードを入力してください。",
    loginNotConfigured: "ログインはまだ設定されていません。",
    checkEmail: "アカウント作成を完了するため、メールを確認してください。",
    legalPrefix: "続行すると、法定年齢に達しており、以下に同意したものとみなされます。",
    termsOfUse: "利用規約",
    and: "および",
    privacyPolicy: "プライバシーポリシー",
    close: "閉じる",
    loadingBond: "あなたの絆を読み込んでいます...",
    lockedTitle: "My Bond を利用するには、ログインまたは新規登録してください。",
    lockedDescription:
      "My Bond には、お気に入り、チャット、アカウント情報、作成したコンパニオン、個人の EverBond 情報が保存されます。",
    dashboardEyebrow: "MY BOND",
    welcomeBack: "おかえりなさい",
    messagesLeft: "残りメッセージ",
    buyMessages: "メッセージを購入",
    recentChats: "最近のチャット",
    createdCompanions: "作成したコンパニオン",
    favorites: "お気に入り",
    continueChat: "チャットを続ける",
    noRecentChats: "最近のチャットはまだありません。",
    startChatting: "コンパニオンを探す",
    myCompanions: "マイコンパニオン",
    characterLimit: "作成済み / 100",
    createCompanion: "コンパニオンを作成",
    all: "すべて",
    public: "公開",
    private: "非公開",
    noCompanions: "このセクションには、まだコンパニオンがありません。",
    openCompanion: "コンパニオンを開く",
    favoriteCompanions: "お気に入りのコンパニオン",
    noFavorites: "お気に入りはまだ保存されていません。",
    exploreCompanions: "コンパニオンを探す",
    accountInformation: "アカウント情報",
    accountEmail: "メールアドレス",
    username: "ユーザー名",
    memberSince: "登録日",
    purchaseHistory: "購入履歴",
    noPurchases: "購入履歴はまだありません。",
    purchasesWillAppear:
      "Paddle 接続後、メッセージバンドルと EverCoin の購入がここに表示されます。",
    loadError: "My Bond を読み込めませんでした。",
    retry: "再試行"
  },
  DE: {
    loginSignup: "Anmelden / Registrieren",
    logout: "Abmelden",
    authTitle: "Beginne deine Bindung",
    authSubtitle: "Deine Bindungen, Geschichten und Erinnerungen an einem Ort.",
    authImageAlt: "Willkommen bei EverBond",
    email: "E-Mail",
    password: "Passwort",
    continueWithEmail: "Mit E-Mail fortfahren",
    oneMoment: "Einen Moment...",
    enterEmailPassword: "Gib deine E-Mail-Adresse und dein Passwort ein.",
    loginNotConfigured: "Die Anmeldung ist noch nicht eingerichtet.",
    checkEmail: "Prüfe deine E-Mail, um die Kontoerstellung abzuschließen.",
    legalPrefix: "Wenn du fortfährst, bestätigst du dein gesetzliches Mindestalter und stimmst unseren",
    termsOfUse: "Nutzungsbedingungen",
    and: "und unserer",
    privacyPolicy: "Datenschutzerklärung",
    close: "Schließen",
    loadingBond: "Deine Bindung wird geladen...",
    lockedTitle: "Melde dich an oder registriere dich, um auf Meine Bindung zuzugreifen.",
    lockedDescription:
      "Meine Bindung ist der Ort für deine Favoriten, Chats, Kontodaten, erstellten Begleiter und persönlichen EverBond-Informationen.",
    dashboardEyebrow: "MEINE BINDUNG",
    welcomeBack: "Willkommen zurück",
    messagesLeft: "Verbleibende Nachrichten",
    buyMessages: "Nachrichten kaufen",
    recentChats: "Letzte Chats",
    createdCompanions: "Erstellte Begleiter",
    favorites: "Favoriten",
    continueChat: "Chat fortsetzen",
    noRecentChats: "Noch keine letzten Chats.",
    startChatting: "Begleiter entdecken",
    myCompanions: "Meine Begleiter",
    characterLimit: "von 100 erstellt",
    createCompanion: "Begleiter erstellen",
    all: "Alle",
    public: "Öffentlich",
    private: "Privat",
    noCompanions: "Du hast in diesem Bereich noch keine Begleiter erstellt.",
    openCompanion: "Begleiter öffnen",
    favoriteCompanions: "Favorisierte Begleiter",
    noFavorites: "Du hast noch keine Favoriten gespeichert.",
    exploreCompanions: "Begleiter entdecken",
    accountInformation: "Kontoinformationen",
    accountEmail: "E-Mail",
    username: "Benutzername",
    memberSince: "Mitglied seit",
    purchaseHistory: "Kaufverlauf",
    noPurchases: "Noch keine Käufe.",
    purchasesWillAppear:
      "Nachrichtenpaket- und EverCoin-Käufe erscheinen hier, sobald Paddle verbunden ist.",
    loadError: "Meine Bindung konnte nicht geladen werden.",
    retry: "Erneut versuchen"
  },
  KO: {
    loginSignup: "로그인 / 회원가입",
    logout: "로그아웃",
    authTitle: "유대를 시작하세요",
    authSubtitle: "당신의 유대, 이야기, 기억을 한곳에서 만나보세요.",
    authImageAlt: "EverBond에 오신 것을 환영합니다",
    email: "이메일",
    password: "비밀번호",
    continueWithEmail: "이메일로 계속",
    oneMoment: "잠시만요...",
    enterEmailPassword: "이메일과 비밀번호를 입력하세요.",
    loginNotConfigured: "로그인이 아직 설정되지 않았습니다.",
    checkEmail: "계정 생성을 완료하려면 이메일을 확인하세요.",
    legalPrefix: "계속하면 법적 연령에 도달했으며 다음에 동의함을 확인합니다.",
    termsOfUse: "이용 약관",
    and: "및",
    privacyPolicy: "개인정보 처리방침",
    close: "닫기",
    loadingBond: "유대를 불러오는 중...",
    lockedTitle: "My Bond를 이용하려면 로그인하거나 회원가입하세요.",
    lockedDescription:
      "My Bond에는 즐겨찾기, 채팅, 계정 정보, 만든 컴패니언, 개인 EverBond 정보가 저장됩니다.",
    dashboardEyebrow: "MY BOND",
    welcomeBack: "다시 오신 것을 환영합니다",
    messagesLeft: "남은 메시지",
    buyMessages: "메시지 구매",
    recentChats: "최근 채팅",
    createdCompanions: "만든 컴패니언",
    favorites: "즐겨찾기",
    continueChat: "채팅 계속",
    noRecentChats: "아직 최근 채팅이 없습니다.",
    startChatting: "컴패니언 둘러보기",
    myCompanions: "내 컴패니언",
    characterLimit: "100개 중 생성",
    createCompanion: "컴패니언 만들기",
    all: "전체",
    public: "공개",
    private: "비공개",
    noCompanions: "이 섹션에는 아직 만든 컴패니언이 없습니다.",
    openCompanion: "컴패니언 열기",
    favoriteCompanions: "즐겨찾는 컴패니언",
    noFavorites: "아직 저장한 즐겨찾기가 없습니다.",
    exploreCompanions: "컴패니언 둘러보기",
    accountInformation: "계정 정보",
    accountEmail: "이메일",
    username: "사용자 이름",
    memberSince: "가입일",
    purchaseHistory: "구매 내역",
    noPurchases: "아직 구매 내역이 없습니다.",
    purchasesWillAppear:
      "Paddle 연결 후 메시지 번들과 EverCoin 구매 내역이 여기에 표시됩니다.",
    loadError: "My Bond를 불러올 수 없습니다.",
    retry: "다시 시도"
  }
};
