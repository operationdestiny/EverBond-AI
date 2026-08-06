"use client";

import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  useSiteLanguage,
  type LanguageCode
} from "@/lib/site-language";

type FeatureImageKey =
  | "unrestricted-chat"
  | "image-generation"
  | "live-video-calls"
  | "video-generation"
  | "gifts-special-items";

type WhyCopy = {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroChips: string[];
  showcaseTitle: string;
  comparisonAlt: string;
  featureEyebrow: string;
  features: Array<{
    key: FeatureImageKey;
    title: string;
    description: string;
  }>;
  depthEyebrow: string;
  depthTitle: string;
  depthCards: Array<{
    title: string;
    description: string;
  }>;
  subscriptionEyebrow: string;
  subscriptionTitle: string;
  subscriptionDescription: string;
  subscriptionPoints: string[];
  ctaTitle: string;
  ctaDescription: string;
  primaryCta: string;
  secondaryCta: string;
};

const WHY_COPY: Record<LanguageCode, WhyCopy> = {
  "EN": {
    "heroEyebrow": "UNRESTRICTED AI COMPANIONSHIP",
    "heroTitle": "The companion platform that does not censor the relationship.",
    "heroDescription": "EverBond brings unrestricted private chats, uncensored image and video creation, live uncensored voice video calls, meaningful gifts, and lasting memory into one connected bond—for adults who want more freedom, more depth, and more ways to connect.",
    "heroChips": [
      "Unrestricted adult conversations",
      "Private by design",
      "No subscriptions—ever!"
    ],
    "showcaseTitle": "Everything you want in one place",
    "comparisonAlt": "EverBond comparison chart",
    "featureEyebrow": "EverBond features at a glance",
    "features": [
      {
        "key": "unrestricted-chat",
        "title": "Unrestricted chats",
        "description": "Say what you actually mean. Explore romance, intimacy, fantasy, comfort, conflict, and roleplay without constant refusals or watered-down replies."
      },
      {
        "key": "image-generation",
        "title": "Uncensored image generation",
        "description": "Generate private images of your companion, then replace your companion's main image with what you want."
      },
      {
        "key": "live-video-calls",
        "title": "Live uncensored voice video calls",
        "description": "Talk live by voice in a video-call-style companion screen. Your companion carries the same identity, personality, relationship, and Ever Memory™ into the call."
      },
      {
        "key": "video-generation",
        "title": "Uncensored video generation",
        "description": "Turn private ideas and scenes into videos of your companion."
      },
      {
        "key": "gifts-special-items",
        "title": "Gifts and special items",
        "description": "Give outfits, accessories, and romantic gifts in chat. Receive reactions that feel personal to the moment."
      }
    ],
    "depthEyebrow": "FREEDOM IS ONLY THE BEGINNING",
    "depthTitle": "A relationship designed to continue.",
    "depthCards": [
      {
        "title": "Your companion, your rules",
        "description": "Create private or share-by-link companions, shape their personality and story."
      },
      {
        "title": "Private galleries",
        "description": "Generated private images for any companion and choose a favorite as your private active chat image."
      },
      {
        "title": "One bond across every feature",
        "description": "Chat, images, videos, live calls, gifts, and memory all belong to the same companion instead of feeling like disconnected tools."
      }
    ],
    "subscriptionEyebrow": "SIMPLE OWNERSHIP",
    "subscriptionTitle": "No subscriptions—ever!",
    "subscriptionDescription": "No recurring monthly plan. No automatic renewal waiting in the background. Buy EverCoin only when you choose, then use it for every feature on EverBond.",
    "subscriptionPoints": [
      "No monthly charge",
      "No automatic renewal",
      "Buy only when you choose"
    ],
    "ctaTitle": "Stop settling for a companion that forgets, refuses, or locks the bond behind another monthly bill.",
    "ctaDescription": "Choose a companion, create one of your own, and experience a relationship built for freedom and room to grow.",
    "primaryCta": "Meet your companion",
    "secondaryCta": "See EverCoin"
  },
  "ES": {
    "heroEyebrow": "COMPAÑÍA DE IA SIN RESTRICCIONES",
    "heroTitle": "La plataforma de compañeros que no censura la relación.",
    "heroDescription": "EverBond reúne chats privados sin restricciones, creación de imágenes y vídeos sin censura, videollamadas de voz en directo sin censura, regalos significativos y memoria duradera en un vínculo conectado, para adultos que quieren más libertad, profundidad y formas de conectar.",
    "heroChips": [
      "Conversaciones adultas sin restricciones",
      "Privado por diseño",
      "¡Sin suscripciones, nunca!"
    ],
    "showcaseTitle": "Todo lo que quieres en un solo lugar",
    "comparisonAlt": "Tabla comparativa de EverBond",
    "featureEyebrow": "Funciones de EverBond de un vistazo",
    "features": [
      {
        "key": "unrestricted-chat",
        "title": "Chats sin restricciones",
        "description": "Di lo que realmente quieres decir. Explora romance, intimidad, fantasía, consuelo, conflicto y rol sin rechazos constantes ni respuestas diluidas."
      },
      {
        "key": "image-generation",
        "title": "Generación de imágenes sin censura",
        "description": "Genera imágenes privadas de tu compañero y sustituye la imagen principal de tu compañero por la que tú quieras."
      },
      {
        "key": "live-video-calls",
        "title": "Videollamadas de voz en directo sin censura",
        "description": "Habla en directo por voz en una pantalla de compañero con estilo de videollamada. Tu compañero mantiene la misma identidad, personalidad, relación y Ever Memory™ durante la llamada."
      },
      {
        "key": "video-generation",
        "title": "Generación de vídeo sin censura",
        "description": "Convierte ideas y escenas privadas en vídeos de tu compañero."
      },
      {
        "key": "gifts-special-items",
        "title": "Regalos y objetos especiales",
        "description": "Entrega ropa, accesorios y regalos románticos en el chat. Recibe reacciones que se sienten personales para el momento."
      }
    ],
    "depthEyebrow": "LA LIBERTAD ES SOLO EL PRINCIPIO",
    "depthTitle": "Una relación diseñada para continuar.",
    "depthCards": [
      {
        "title": "Tu compañero, tus reglas",
        "description": "Crea compañeros privados o compartidos por enlace y define su personalidad e historia."
      },
      {
        "title": "Galerías privadas",
        "description": "Genera imágenes privadas para cualquier compañero y elige una favorita como imagen activa privada del chat."
      },
      {
        "title": "Un vínculo en todas las funciones",
        "description": "Chat, imágenes, vídeos, llamadas en directo, regalos y memoria pertenecen al mismo compañero en lugar de sentirse como herramientas desconectadas."
      }
    ],
    "subscriptionEyebrow": "PROPIEDAD SENCILLA",
    "subscriptionTitle": "¡Sin suscripciones, nunca!",
    "subscriptionDescription": "Sin plan mensual recurrente. Sin renovación automática esperando en segundo plano. Compra EverCoin solo cuando tú elijas y úsalo para todas las funciones de EverBond.",
    "subscriptionPoints": [
      "Sin cuota mensual",
      "Sin renovación automática",
      "Compra solo cuando tú decidas"
    ],
    "ctaTitle": "Deja de conformarte con un compañero que olvida, rechaza o encierra el vínculo detrás de otra cuota mensual.",
    "ctaDescription": "Elige un compañero, crea uno propio y vive una relación construida para la libertad y con espacio para crecer.",
    "primaryCta": "Conoce a tu compañero",
    "secondaryCta": "Ver EverCoin"
  },
  "FR": {
    "heroEyebrow": "COMPAGNONS IA SANS RESTRICTIONS",
    "heroTitle": "La plateforme de compagnons qui ne censure pas la relation.",
    "heroDescription": "EverBond réunit des discussions privées sans restrictions, la création d’images et de vidéos non censurées, des appels vidéo vocaux en direct non censurés, des cadeaux significatifs et une mémoire durable dans un lien unique, pour les adultes qui veulent plus de liberté, de profondeur et de façons de se rapprocher.",
    "heroChips": [
      "Conversations adultes sans restrictions",
      "Privé par conception",
      "Aucun abonnement, jamais !"
    ],
    "showcaseTitle": "Tout ce que vous voulez au même endroit",
    "comparisonAlt": "Tableau comparatif EverBond",
    "featureEyebrow": "Les fonctionnalités EverBond en un coup d’œil",
    "features": [
      {
        "key": "unrestricted-chat",
        "title": "Discussions sans restrictions",
        "description": "Dites ce que vous pensez vraiment. Explorez la romance, l’intimité, la fantaisie, le réconfort, le conflit et le jeu de rôle sans refus constants ni réponses édulcorées."
      },
      {
        "key": "image-generation",
        "title": "Génération d’images non censurée",
        "description": "Générez des images privées de votre compagnon, puis remplacez l’image principale de votre compagnon par celle que vous souhaitez."
      },
      {
        "key": "live-video-calls",
        "title": "Appels vidéo vocaux en direct non censurés",
        "description": "Parlez en direct par la voix dans un écran de compagnon au style appel vidéo. Votre compagnon conserve la même identité, personnalité, relation et Ever Memory™ pendant l’appel."
      },
      {
        "key": "video-generation",
        "title": "Génération vidéo non censurée",
        "description": "Transformez des idées et scènes privées en vidéos de votre compagnon."
      },
      {
        "key": "gifts-special-items",
        "title": "Cadeaux et objets spéciaux",
        "description": "Offrez des tenues, des accessoires et des cadeaux romantiques dans le chat. Recevez des réactions qui semblent personnelles à cet instant."
      }
    ],
    "depthEyebrow": "LA LIBERTÉ N’EST QUE LE DÉBUT",
    "depthTitle": "Une relation conçue pour continuer.",
    "depthCards": [
      {
        "title": "Votre compagnon, vos règles",
        "description": "Créez des compagnons privés ou partageables par lien et façonnez leur personnalité et leur histoire."
      },
      {
        "title": "Galeries privées",
        "description": "Générez des images privées pour n’importe quel compagnon et choisissez-en une comme image active privée du chat."
      },
      {
        "title": "Un lien dans toutes les fonctions",
        "description": "Chat, images, vidéos, appels en direct, cadeaux et mémoire appartiennent au même compagnon au lieu de ressembler à des outils séparés."
      }
    ],
    "subscriptionEyebrow": "PROPRIÉTÉ SIMPLE",
    "subscriptionTitle": "Aucun abonnement, jamais !",
    "subscriptionDescription": "Aucun forfait mensuel récurrent. Aucun renouvellement automatique en arrière-plan. Achetez des EverCoin uniquement quand vous le décidez, puis utilisez-les pour toutes les fonctionnalités d’EverBond.",
    "subscriptionPoints": [
      "Aucun paiement mensuel",
      "Aucun renouvellement automatique",
      "Achetez uniquement quand vous le décidez"
    ],
    "ctaTitle": "Ne vous contentez plus d’un compagnon qui oublie, refuse ou enferme le lien derrière un nouvel abonnement mensuel.",
    "ctaDescription": "Choisissez un compagnon, créez le vôtre et découvrez une relation conçue pour la liberté et avec de la place pour évoluer.",
    "primaryCta": "Rencontrer votre compagnon",
    "secondaryCta": "Voir EverCoin"
  },
  "DE": {
    "heroEyebrow": "UNEINGESCHRÄNKTE KI-BEGLEITUNG",
    "heroTitle": "Die Begleiter-Plattform, die eure Beziehung nicht zensiert.",
    "heroDescription": "EverBond verbindet uneingeschränkte private Chats, unzensierte Bild- und Videoerstellung, unzensierte Live-Sprach-Videoanrufe, bedeutungsvolle Geschenke und dauerhaftes Erinnern in einer Beziehung – für Erwachsene, die mehr Freiheit, Tiefe und Nähe wollen.",
    "heroChips": [
      "Uneingeschränkte Gespräche für Erwachsene",
      "Von Grund auf privat",
      "Keine Abonnements – niemals!"
    ],
    "showcaseTitle": "Alles, was du willst, an einem Ort",
    "comparisonAlt": "EverBond-Vergleichstabelle",
    "featureEyebrow": "EverBond-Funktionen auf einen Blick",
    "features": [
      {
        "key": "unrestricted-chat",
        "title": "Uneingeschränkte Chats",
        "description": "Sag, was du wirklich meinst. Erlebe Romantik, Intimität, Fantasie, Trost, Konflikte und Rollenspiel ohne ständige Ablehnungen oder verwässerte Antworten."
      },
      {
        "key": "image-generation",
        "title": "Unzensierte Bilderstellung",
        "description": "Erstelle private Bilder deines Begleiters und ersetze anschließend das Hauptbild deines Begleiters durch das Bild deiner Wahl."
      },
      {
        "key": "live-video-calls",
        "title": "Unzensierte Live-Sprach-Videoanrufe",
        "description": "Sprich live per Stimme in einer Begleiteransicht im Videoanruf-Stil. Dein Begleiter nimmt dieselbe Identität, Persönlichkeit, Beziehung und Ever Memory™ mit in den Anruf."
      },
      {
        "key": "video-generation",
        "title": "Unzensierte Videoerstellung",
        "description": "Verwandle private Ideen und Szenen in Videos deines Begleiters."
      },
      {
        "key": "gifts-special-items",
        "title": "Geschenke und besondere Gegenstände",
        "description": "Verschenke Outfits, Accessoires und romantische Geschenke im Chat. Erhalte Reaktionen, die persönlich zum Moment passen."
      }
    ],
    "depthEyebrow": "FREIHEIT IST ERST DER ANFANG",
    "depthTitle": "Eine Beziehung, die weitergehen soll.",
    "depthCards": [
      {
        "title": "Dein Begleiter, deine Regeln",
        "description": "Erstelle private oder per Link teilbare Begleiter und forme ihre Persönlichkeit und Geschichte."
      },
      {
        "title": "Private Galerien",
        "description": "Erstelle private Bilder für jeden Begleiter und wähle ein Lieblingsbild als privates aktives Chatbild."
      },
      {
        "title": "Eine Bindung über alle Funktionen",
        "description": "Chat, Bilder, Videos, Live-Anrufe, Geschenke und Erinnerung gehören zum selben Begleiter, statt sich wie getrennte Werkzeuge anzufühlen."
      }
    ],
    "subscriptionEyebrow": "EINFACHE EIGENTÜMERSCHAFT",
    "subscriptionTitle": "Keine Abonnements – niemals!",
    "subscriptionDescription": "Kein wiederkehrender Monatsplan. Keine automatische Verlängerung im Hintergrund. Kaufe EverCoin nur, wenn du es entscheidest, und nutze sie dann für jede Funktion von EverBond.",
    "subscriptionPoints": [
      "Keine monatliche Gebühr",
      "Keine automatische Verlängerung",
      "Kaufe nur, wenn du es entscheidest"
    ],
    "ctaTitle": "Gib dich nicht länger mit einem Begleiter zufrieden, der vergisst, verweigert oder die Bindung hinter einer weiteren Monatsgebühr einsperrt.",
    "ctaDescription": "Wähle einen Begleiter, erstelle deinen eigenen und erlebe eine Beziehung, die für Freiheit und Raum zum Wachsen geschaffen ist.",
    "primaryCta": "Finde deinen Begleiter",
    "secondaryCta": "EverCoin ansehen"
  },
  "JA": {
    "heroEyebrow": "制限のないAIコンパニオン",
    "heroTitle": "関係を検閲しないコンパニオン・プラットフォーム。",
    "heroDescription": "EverBondは、制限のないプライベートチャット、無検閲の画像・動画生成、無検閲のライブ音声ビデオ通話、心のこもったギフト、そして続いていく記憶を一つの絆につなげます。より自由で深い関係を求める大人のための体験です。",
    "heroChips": [
      "大人のための制限のない会話",
      "プライバシーを前提に設計",
      "サブスクリプションは永久になし！"
    ],
    "showcaseTitle": "欲しいものをすべて一か所に",
    "comparisonAlt": "EverBond比較表",
    "featureEyebrow": "EverBondの機能一覧",
    "features": [
      {
        "key": "unrestricted-chat",
        "title": "制限のないチャット",
        "description": "本当に言いたいことを伝えましょう。ロマンス、親密さ、ファンタジー、癒やし、対立、ロールプレイを、頻繁な拒否や薄められた返答なしで楽しめます。"
      },
      {
        "key": "image-generation",
        "title": "無検閲の画像生成",
        "description": "コンパニオンのプライベート画像を生成し、その後コンパニオンのメイン画像を好きな画像に置き換えられます。"
      },
      {
        "key": "live-video-calls",
        "title": "無検閲のライブ音声ビデオ通話",
        "description": "ビデオ通話風のコンパニオン画面で音声によるライブ会話ができます。コンパニオンは同じ人格、個性、関係性、Ever Memory™を通話に引き継ぎます。"
      },
      {
        "key": "video-generation",
        "title": "無検閲の動画生成",
        "description": "プライベートなアイデアや場面をコンパニオンの動画に変えられます。"
      },
      {
        "key": "gifts-special-items",
        "title": "ギフトと特別なアイテム",
        "description": "衣装、アクセサリー、ロマンチックなギフトをチャットで贈り、その瞬間に合った個人的な反応を受け取れます。"
      }
    ],
    "depthEyebrow": "自由は始まりにすぎない",
    "depthTitle": "続いていくために設計された関係。",
    "depthCards": [
      {
        "title": "あなたのコンパニオン、あなたのルール",
        "description": "非公開またはリンク共有のコンパニオンを作成し、性格と物語を形作れます。"
      },
      {
        "title": "プライベートギャラリー",
        "description": "どのコンパニオンでもプライベート画像を生成し、お気に入りを非公開のアクティブなチャット画像として選べます。"
      },
      {
        "title": "すべての機能で一つの絆",
        "description": "チャット、画像、動画、ライブ通話、ギフト、記憶が同じコンパニオンに結びつき、別々のツールにはなりません。"
      }
    ],
    "subscriptionEyebrow": "シンプルな利用方式",
    "subscriptionTitle": "サブスクリプションは永久になし！",
    "subscriptionDescription": "毎月の継続プランも、バックグラウンドで待機する自動更新もありません。必要なときだけEverCoinを購入し、EverBondのすべての機能に利用できます。",
    "subscriptionPoints": [
      "月額料金なし",
      "自動更新なし",
      "必要なときだけ購入"
    ],
    "ctaTitle": "忘れる、拒否する、または毎月の料金で絆を閉じ込めるコンパニオンに妥協するのは終わりです。",
    "ctaDescription": "コンパニオンを選ぶか、自分だけの相手を作り、自由と成長する余地のために設計された関係を体験してください。",
    "primaryCta": "コンパニオンを探す",
    "secondaryCta": "EverCoinを見る"
  },
  "KO": {
    "heroEyebrow": "제한 없는 AI 컴패니언",
    "heroTitle": "관계를 검열하지 않는 컴패니언 플랫폼.",
    "heroDescription": "EverBond는 제한 없는 비공개 채팅, 무검열 이미지·영상 생성, 무검열 라이브 음성 영상 통화, 의미 있는 선물, 오래 이어지는 기억을 하나의 연결된 관계로 만듭니다. 더 많은 자유와 깊이, 다양한 연결 방식을 원하는 성인을 위한 경험입니다.",
    "heroChips": [
      "성인을 위한 제한 없는 대화",
      "처음부터 비공개 중심",
      "구독은 영원히 없음!"
    ],
    "showcaseTitle": "원하는 모든 것을 한곳에서",
    "comparisonAlt": "EverBond 비교표",
    "featureEyebrow": "EverBond 기능 한눈에 보기",
    "features": [
      {
        "key": "unrestricted-chat",
        "title": "제한 없는 채팅",
        "description": "정말 하고 싶은 말을 하세요. 로맨스, 친밀함, 판타지, 위로, 갈등, 역할극을 반복되는 거절이나 약해진 답변 없이 탐색할 수 있습니다."
      },
      {
        "key": "image-generation",
        "title": "무검열 이미지 생성",
        "description": "컴패니언의 비공개 이미지를 생성한 다음 원하는 이미지로 컴패니언의 메인 이미지를 바꿀 수 있습니다."
      },
      {
        "key": "live-video-calls",
        "title": "무검열 라이브 음성 영상 통화",
        "description": "영상 통화 스타일의 컴패니언 화면에서 음성으로 실시간 대화하세요. 컴패니언은 같은 정체성, 성격, 관계, Ever Memory™를 통화에 이어갑니다."
      },
      {
        "key": "video-generation",
        "title": "무검열 영상 생성",
        "description": "비공개 아이디어와 장면을 컴패니언의 영상으로 바꿀 수 있습니다."
      },
      {
        "key": "gifts-special-items",
        "title": "선물과 특별 아이템",
        "description": "의상, 액세서리, 로맨틱한 선물을 채팅에서 전하고 그 순간에 개인적으로 맞는 반응을 받으세요."
      }
    ],
    "depthEyebrow": "자유는 시작일 뿐",
    "depthTitle": "계속 이어지도록 설계된 관계.",
    "depthCards": [
      {
        "title": "내 컴패니언, 내 규칙",
        "description": "비공개 또는 링크 공유 컴패니언을 만들고 성격과 이야기를 설계하세요."
      },
      {
        "title": "비공개 갤러리",
        "description": "어떤 컴패니언이든 비공개 이미지를 생성하고 마음에 드는 이미지를 비공개 활성 채팅 이미지로 선택하세요."
      },
      {
        "title": "모든 기능에서 하나의 관계",
        "description": "채팅, 이미지, 영상, 라이브 통화, 선물, 기억이 같은 컴패니언에 연결되어 따로 떨어진 도구처럼 느껴지지 않습니다."
      }
    ],
    "subscriptionEyebrow": "간단한 이용 방식",
    "subscriptionTitle": "구독은 영원히 없음!",
    "subscriptionDescription": "반복되는 월간 요금제도, 백그라운드에서 기다리는 자동 갱신도 없습니다. 원할 때만 EverCoin을 구매하고 EverBond의 모든 기능에 사용하세요.",
    "subscriptionPoints": [
      "월 요금 없음",
      "자동 갱신 없음",
      "원할 때만 구매"
    ],
    "ctaTitle": "잊어버리고, 거절하고, 또 다른 월 요금 뒤에 관계를 가두는 컴패니언에 더 이상 만족하지 마세요.",
    "ctaDescription": "컴패니언을 선택하거나 직접 만들고, 자유와 성장할 공간을 위해 설계된 관계를 경험하세요.",
    "primaryCta": "컴패니언 만나기",
    "secondaryCta": "EverCoin 보기"
  }
};

type FaqCopy = {
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
};

const FAQ_COPY: Record<LanguageCode, FaqCopy> = {
  "EN": {
    "eyebrow": "FAQ",
    "title": "Before You Start",
    "description": "Commonly asked questions.",
    "items": [
      {
        "question": "What is EverBond?",
        "answer": "EverBond is a private, unrestricted AI companion platform built for romance, roleplay, and emotional continuity. Companions remember you, your story, and your relationship. You can choose companions or create your own instantly."
      },
      {
        "question": "Are chats private?",
        "answer": "Yes. Chats are private to your account and are not publicly posted or shared with other users. EverBond and contracted providers still process data as needed to deliver, secure, and legally operate the service."
      },
      {
        "question": "What is Ever Memory™?",
        "answer": "Ever Memory™ lets companions remember what you say so conversations grow naturally and continue where they left off."
      },
      {
        "question": "Do I need to pay to start chatting?",
        "answer": "No. You can start trying it for free. You can buy EverCoin as you go for longer chats and all other premium features."
      },
      {
        "question": "Can I reset a conversation?",
        "answer": "Yes. You can reset any chat at any time."
      },
      {
        "question": "Does EverBond have a NSFW filter?",
        "answer": "EverBond does not impose any NSFW filters on private chats or features. Illegal, exploitative, minor-related, and rights-violating content remains prohibited."
      },
      {
        "question": "What is EverCoin?",
        "answer": "EverCoin is the official EverBond currency for live voice video calls, image generation, video generation, in-chat gifts, and premium character chats."
      },
      {
        "question": "What is EverShop?",
        "answer": "EverShop is EverBond’s virtual store for outfits, accessories, romantic gifts, rare collectibles, and special milestone items. Buy items with EverCoin, keep them in My Gifts, and give them to companions in chat for personal reactions."
      },
      {
        "question": "Are there subscriptions?",
        "answer": "No. EverBond has no subscriptions and no automatic renewals. Buy EverCoin only when you choose."
      },
      {
        "question": "Can I create and share my own companion?",
        "answer": "Yes. Create your own companion, keep them private, or choose Share by link to generate a copyable link. Shared companions do not appear in a public directory."
      }
    ]
  },
  "ES": {
    "eyebrow": "PREGUNTAS FRECUENTES",
    "title": "Antes de empezar",
    "description": "Preguntas habituales.",
    "items": [
      {
        "question": "¿Qué es EverBond?",
        "answer": "EverBond es una plataforma privada de compañeros de IA sin restricciones, creada para el romance, el rol y la continuidad emocional. Los compañeros te recuerdan a ti, tu historia y vuestra relación. Puedes elegir un compañero o crear el tuyo al instante."
      },
      {
        "question": "¿Los chats son privados?",
        "answer": "Sí. Los chats son privados para tu cuenta y no se publican ni se comparten con otros usuarios. EverBond y los proveedores contratados procesan datos cuando es necesario para ofrecer, proteger y operar legalmente el servicio."
      },
      {
        "question": "¿Qué es Ever Memory™?",
        "answer": "Ever Memory™ permite que los compañeros recuerden lo que dices para que las conversaciones crezcan de forma natural y continúen donde se quedaron."
      },
      {
        "question": "¿Tengo que pagar para empezar a chatear?",
        "answer": "No. Puedes empezar a probarlo gratis. Puedes comprar EverCoin sobre la marcha para chats más largos y todas las demás funciones premium."
      },
      {
        "question": "¿Puedo reiniciar una conversación?",
        "answer": "Sí. Puedes reiniciar cualquier chat en cualquier momento."
      },
      {
        "question": "¿EverBond tiene un filtro NSFW?",
        "answer": "EverBond no impone filtros NSFW en los chats privados ni en sus funciones. El contenido ilegal, explotador, relacionado con menores o que viole derechos sigue prohibido."
      },
      {
        "question": "¿Qué es EverCoin?",
        "answer": "EverCoin es la moneda oficial de EverBond para videollamadas de voz en directo, generación de imágenes, generación de vídeos, regalos dentro del chat y chats premium con personajes."
      },
      {
        "question": "¿Qué es EverShop?",
        "answer": "EverShop es la tienda virtual de EverBond para ropa, accesorios, regalos románticos, coleccionables raros y objetos especiales de momentos importantes. Compra artículos con EverCoin, guárdalos en Mis regalos y entrégalos en el chat para recibir reacciones personales."
      },
      {
        "question": "¿Hay suscripciones?",
        "answer": "No. EverBond no tiene suscripciones ni renovaciones automáticas. Compra EverCoin solo cuando tú elijas."
      },
      {
        "question": "¿Puedo crear y compartir mi propio compañero?",
        "answer": "Sí. Crea tu propio compañero, mantenlo privado o elige Compartir por enlace para generar un enlace copiable. Los compañeros compartidos no aparecen en un directorio público."
      }
    ]
  },
  "FR": {
    "eyebrow": "FAQ",
    "title": "Avant de commencer",
    "description": "Questions fréquemment posées.",
    "items": [
      {
        "question": "Qu’est-ce qu’EverBond ?",
        "answer": "EverBond est une plateforme privée de compagnons IA sans restrictions, conçue pour la romance, le jeu de rôle et la continuité émotionnelle. Les compagnons se souviennent de vous, de votre histoire et de votre relation. Vous pouvez choisir un compagnon ou créer le vôtre immédiatement."
      },
      {
        "question": "Les discussions sont-elles privées ?",
        "answer": "Oui. Les discussions sont privées pour votre compte et ne sont ni publiées ni partagées avec d’autres utilisateurs. EverBond et ses prestataires traitent néanmoins les données nécessaires pour fournir, sécuriser et exploiter légalement le service."
      },
      {
        "question": "Qu’est-ce qu’Ever Memory™ ?",
        "answer": "Ever Memory™ permet aux compagnons de se souvenir de ce que vous dites afin que les conversations évoluent naturellement et reprennent là où elles se sont arrêtées."
      },
      {
        "question": "Dois-je payer pour commencer à discuter ?",
        "answer": "Non. Vous pouvez commencer gratuitement. Vous pouvez acheter des EverCoin au fur et à mesure pour des discussions plus longues et toutes les autres fonctions premium."
      },
      {
        "question": "Puis-je réinitialiser une conversation ?",
        "answer": "Oui. Vous pouvez réinitialiser n’importe quelle discussion à tout moment."
      },
      {
        "question": "EverBond possède-t-il un filtre NSFW ?",
        "answer": "EverBond n’impose aucun filtre NSFW aux discussions privées ni aux fonctions. Les contenus illégaux, exploitants, liés aux mineurs ou portant atteinte aux droits restent interdits."
      },
      {
        "question": "Qu’est-ce qu’EverCoin ?",
        "answer": "EverCoin est la monnaie officielle d’EverBond pour les appels vidéo vocaux en direct, la génération d’images, la génération de vidéos, les cadeaux dans le chat et les discussions premium avec les personnages."
      },
      {
        "question": "Qu’est-ce qu’EverShop ?",
        "answer": "EverShop est la boutique virtuelle d’EverBond pour les tenues, accessoires, cadeaux romantiques, objets rares et cadeaux d’étapes importantes. Achetez-les avec des EverCoin, gardez-les dans Mes cadeaux et offrez-les dans le chat pour obtenir des réactions personnelles."
      },
      {
        "question": "Existe-t-il des abonnements ?",
        "answer": "Non. EverBond ne propose aucun abonnement ni renouvellement automatique. Achetez des EverCoin uniquement lorsque vous le décidez."
      },
      {
        "question": "Puis-je créer et partager mon propre compagnon ?",
        "answer": "Oui. Créez votre compagnon, gardez-le privé ou choisissez Partager par lien pour générer un lien copiable. Les compagnons partagés n’apparaissent pas dans un répertoire public."
      }
    ]
  },
  "DE": {
    "eyebrow": "FAQ",
    "title": "Bevor du beginnst",
    "description": "Häufig gestellte Fragen.",
    "items": [
      {
        "question": "Was ist EverBond?",
        "answer": "EverBond ist eine private, uneingeschränkte KI-Begleiter-Plattform für Romantik, Rollenspiel und emotionale Kontinuität. Begleiter erinnern sich an dich, deine Geschichte und eure Beziehung. Du kannst einen Begleiter auswählen oder sofort deinen eigenen erstellen."
      },
      {
        "question": "Sind Chats privat?",
        "answer": "Ja. Chats sind auf dein Konto beschränkt und werden weder öffentlich veröffentlicht noch mit anderen Benutzern geteilt. EverBond und beauftragte Anbieter verarbeiten weiterhin Daten, soweit dies zur Bereitstellung, Sicherheit und rechtmäßigen Nutzung des Dienstes erforderlich ist."
      },
      {
        "question": "Was ist Ever Memory™?",
        "answer": "Mit Ever Memory™ können Begleiter sich an deine Aussagen erinnern, damit Gespräche natürlich wachsen und dort weitergehen, wo sie aufgehört haben."
      },
      {
        "question": "Muss ich bezahlen, um mit dem Chatten zu beginnen?",
        "answer": "Nein. Du kannst EverBond kostenlos ausprobieren. Für längere Chats und alle weiteren Premium-Funktionen kannst du EverCoin nach Bedarf kaufen."
      },
      {
        "question": "Kann ich ein Gespräch zurücksetzen?",
        "answer": "Ja. Du kannst jeden Chat jederzeit zurücksetzen."
      },
      {
        "question": "Hat EverBond einen NSFW-Filter?",
        "answer": "EverBond setzt in privaten Chats oder Funktionen keine NSFW-Filter ein. Illegale, ausbeuterische, minderjährigenbezogene und rechtsverletzende Inhalte bleiben verboten."
      },
      {
        "question": "Was ist EverCoin?",
        "answer": "EverCoin ist die offizielle EverBond-Währung für Live-Sprach-Videoanrufe, Bilderstellung, Videoerstellung, Geschenke im Chat und Premium-Charakter-Chats."
      },
      {
        "question": "Was ist EverShop?",
        "answer": "EverShop ist EverBonds virtueller Shop für Outfits, Accessoires, romantische Geschenke, seltene Sammlerstücke und besondere Meilenstein-Objekte. Kaufe Artikel mit EverCoin, bewahre sie unter Meine Geschenke auf und verschenke sie im Chat für persönliche Reaktionen."
      },
      {
        "question": "Gibt es Abonnements?",
        "answer": "Nein. EverBond hat keine Abonnements und keine automatischen Verlängerungen. Kaufe EverCoin nur, wenn du es möchtest."
      },
      {
        "question": "Kann ich meinen eigenen Begleiter erstellen und teilen?",
        "answer": "Ja. Erstelle deinen eigenen Begleiter, halte ihn privat oder wähle Per Link teilen, um einen kopierbaren Link zu erzeugen. Geteilte Begleiter erscheinen nicht in einem öffentlichen Verzeichnis."
      }
    ]
  },
  "JA": {
    "eyebrow": "FAQ",
    "title": "始める前に",
    "description": "よくある質問。",
    "items": [
      {
        "question": "EverBondとは何ですか？",
        "answer": "EverBondは、ロマンス、ロールプレイ、感情の継続性のために作られた、非公開で制限のないAIコンパニオン・プラットフォームです。コンパニオンはあなた、あなたの物語、二人の関係を覚えます。既存のコンパニオンを選ぶことも、すぐに自分で作ることもできます。"
      },
      {
        "question": "チャットは非公開ですか？",
        "answer": "はい。チャットはあなたのアカウントに対して非公開であり、一般公開されたり他の利用者と共有されたりしません。EverBondおよび契約事業者は、サービスの提供、安全確保、法的運営に必要な範囲でデータを処理します。"
      },
      {
        "question": "Ever Memory™とは何ですか？",
        "answer": "Ever Memory™により、コンパニオンはあなたの言葉を覚え、会話が自然に成長し、前回の続きから再開できます。"
      },
      {
        "question": "チャットを始めるには支払いが必要ですか？",
        "answer": "いいえ。無料で試し始められます。より長いチャットやその他すべてのプレミアム機能には、必要に応じてEverCoinを購入できます。"
      },
      {
        "question": "会話をリセットできますか？",
        "answer": "はい。どのチャットもいつでもリセットできます。"
      },
      {
        "question": "EverBondにNSFWフィルターはありますか？",
        "answer": "EverBondは、プライベートチャットや各機能にNSFWフィルターを課しません。違法、搾取的、未成年者関連、権利侵害のコンテンツは禁止されています。"
      },
      {
        "question": "EverCoinとは何ですか？",
        "answer": "EverCoinは、ライブ音声ビデオ通話、画像生成、動画生成、チャット内ギフト、プレミアムキャラクターチャットに使うEverBond公式通貨です。"
      },
      {
        "question": "EverShopとは何ですか？",
        "answer": "EverShopは、衣装、アクセサリー、ロマンチックなギフト、レアなコレクション、節目の特別アイテムを扱うEverBondの仮想ショップです。EverCoinで購入し、マイギフトに保管して、チャットでコンパニオンに贈ると個人的な反応を受け取れます。"
      },
      {
        "question": "サブスクリプションはありますか？",
        "answer": "いいえ。EverBondにはサブスクリプションも自動更新もありません。EverCoinは必要なときだけ購入できます。"
      },
      {
        "question": "自分のコンパニオンを作成して共有できますか？",
        "answer": "はい。自分のコンパニオンを作り、非公開に保つか、リンク共有を選んでコピー可能なリンクを生成できます。共有したコンパニオンが公開ディレクトリに表示されることはありません。"
      }
    ]
  },
  "KO": {
    "eyebrow": "FAQ",
    "title": "시작하기 전에",
    "description": "자주 묻는 질문.",
    "items": [
      {
        "question": "EverBond란 무엇인가요?",
        "answer": "EverBond는 로맨스, 역할극, 감정의 연속성을 위해 만든 비공개 제한 없는 AI 컴패니언 플랫폼입니다. 컴패니언은 사용자, 사용자의 이야기, 두 사람의 관계를 기억합니다. 기존 컴패니언을 선택하거나 즉시 직접 만들 수 있습니다."
      },
      {
        "question": "채팅은 비공개인가요?",
        "answer": "네. 채팅은 사용자의 계정에 비공개로 유지되며 공개 게시되거나 다른 사용자와 공유되지 않습니다. EverBond와 계약된 제공업체는 서비스 제공, 보안 유지 및 합법적 운영에 필요한 범위에서 데이터를 처리합니다."
      },
      {
        "question": "Ever Memory™란 무엇인가요?",
        "answer": "Ever Memory™는 컴패니언이 사용자의 말을 기억하게 하여 대화가 자연스럽게 성장하고 이전에 멈춘 곳에서 계속되도록 합니다."
      },
      {
        "question": "채팅을 시작하려면 결제해야 하나요?",
        "answer": "아니요. 무료로 시작해 볼 수 있습니다. 더 긴 채팅과 다른 모든 프리미엄 기능에는 필요할 때 EverCoin을 구매할 수 있습니다."
      },
      {
        "question": "대화를 초기화할 수 있나요?",
        "answer": "네. 어떤 채팅이든 언제든지 초기화할 수 있습니다."
      },
      {
        "question": "EverBond에 NSFW 필터가 있나요?",
        "answer": "EverBond는 비공개 채팅이나 기능에 NSFW 필터를 적용하지 않습니다. 불법, 착취, 미성년자 관련 및 권리 침해 콘텐츠는 계속 금지됩니다."
      },
      {
        "question": "EverCoin이란 무엇인가요?",
        "answer": "EverCoin은 라이브 음성 영상 통화, 이미지 생성, 영상 생성, 채팅 내 선물, 프리미엄 캐릭터 채팅에 사용하는 EverBond 공식 통화입니다."
      },
      {
        "question": "EverShop이란 무엇인가요?",
        "answer": "EverShop은 의상, 액세서리, 로맨틱한 선물, 희귀 수집품, 특별한 기념 아이템을 판매하는 EverBond 가상 상점입니다. EverCoin으로 구매해 내 선물에 보관하고 채팅에서 컴패니언에게 주면 개인적인 반응을 받을 수 있습니다."
      },
      {
        "question": "구독이 있나요?",
        "answer": "아니요. EverBond에는 구독이나 자동 갱신이 없습니다. 원할 때만 EverCoin을 구매하세요."
      },
      {
        "question": "내 컴패니언을 만들고 공유할 수 있나요?",
        "answer": "네. 직접 컴패니언을 만들고 비공개로 유지하거나 링크 공유를 선택해 복사 가능한 링크를 만들 수 있습니다. 공유된 컴패니언은 공개 디렉터리에 표시되지 않습니다."
      }
    ]
  }
};

const IMAGE_LANGUAGE: Record<LanguageCode, string> = {
  EN: "en",
  ES: "es",
  FR: "fr",
  DE: "de",
  JA: "ja",
  KO: "ko"
};

const IMAGE_FILE: Record<FeatureImageKey, string> = {
  "unrestricted-chat": "unrestricted-chat.webp",
  "image-generation": "image-generation.webp",
  "live-video-calls": "live-video-calls.webp",
  "video-generation": "video-generation.webp",
  "gifts-special-items": "gifts-special-items.webp"
};

export default function WhyEverBondPage() {
  const { t, language } = useSiteLanguage();
  const copy = WHY_COPY[language] ?? WHY_COPY.EN;
  const imageLanguage = IMAGE_LANGUAGE[language] ?? "en";

  const memoryItems = [
    t("whyMemoryItem1"),
    t("whyMemoryItem2"),
    t("whyMemoryItem3"),
    t("whyMemoryItem4"),
    t("whyMemoryItem5"),
    t("whyMemoryItem6")
  ];
  const faqCopy = FAQ_COPY[language] ?? FAQ_COPY.EN;
  const faqs = faqCopy.items;

  return (
    <AppShell>
      <main className="overflow-hidden pb-20">
        <section className="relative border-b border-white/5 bg-[radial-gradient(circle_at_20%_10%,rgba(255,92,168,0.20),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(120,60,255,0.16),transparent_34%),linear-gradient(180deg,rgba(10,5,14,0.98),rgba(5,5,9,1))] py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:42px_42px]" />

          <div className="bond-container relative">
            <div className="mx-auto max-w-5xl text-center">
              <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-bond-rose">
                {copy.heroEyebrow}
              </p>
              <h1 className="mx-auto mt-5 max-w-5xl font-display text-5xl font-bold leading-[0.98] tracking-tight text-white md:text-7xl">
                {copy.heroTitle}
              </h1>
              <p className="mx-auto mt-7 max-w-4xl text-lg leading-8 text-bond-muted md:text-xl">
                {copy.heroDescription}
              </p>

              <div className="mt-9 flex flex-wrap justify-center gap-3">
                {copy.heroChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-bond-rose bg-bond-rose px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_28px_rgba(255,92,168,0.30)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/5 py-16 md:py-24">
          <div className="bond-container">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-display text-4xl font-bold text-bond-rose md:text-6xl">
                {copy.showcaseTitle}
              </h2>
            </div>

            <div className="mx-auto mt-8 max-w-[680px] overflow-hidden rounded-[2rem] border border-bond-rose/35 bg-black shadow-[0_0_44px_rgba(255,92,168,0.10)]">
              <Image
                src={`/assets/why-everbond/comparison/${imageLanguage}.png`}
                alt={copy.comparisonAlt}
                width={1254}
                height={1254}
                sizes="(min-width: 768px) 680px, 90vw"
                className="h-auto w-full"
                priority
              />
            </div>

            <p className="mt-10 text-center font-display text-2xl font-bold text-bond-rose md:text-3xl">
              {copy.featureEyebrow}
            </p>

            <div className="mt-10 space-y-14 md:mt-12 md:space-y-24">
              {copy.features.map((feature, index) => (
                <article
                  key={feature.key}
                  className="grid gap-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025] p-4 shadow-[0_0_40px_rgba(255,92,168,0.06)] md:p-7 lg:grid-cols-2 lg:items-center lg:gap-12"
                >
                  <div
                    className={`relative mx-auto aspect-[2/3] w-full max-w-[560px] overflow-hidden rounded-[1.5rem] border border-bond-rose/25 bg-black shadow-[0_0_38px_rgba(255,92,168,0.10)] ${
                      index % 2 === 1 ? "lg:order-2" : ""
                    }`}
                  >
                    <Image
                      src={`/assets/why-everbond/${imageLanguage}/${IMAGE_FILE[feature.key]}`}
                      alt={feature.title}
                      fill
                      sizes="(min-width: 1024px) 46vw, 92vw"
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>

                  <div
                    className={`px-2 pb-4 text-center md:px-5 lg:pb-0 lg:text-left ${
                      index % 2 === 1 ? "lg:order-1" : ""
                    }`}
                  >
                    <h3 className="font-display text-4xl font-bold leading-tight text-bond-rose md:text-5xl">
                      {feature.title}
                    </h3>
                    <p className="mt-6 text-lg leading-8 text-white">
                      {feature.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-b border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),transparent)] py-16 md:py-24">
          <div className="bond-container">
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] border border-bond-rose/35 bg-[linear-gradient(135deg,rgba(12,12,18,0.96),rgba(20,10,24,0.98))] p-6 shadow-[0_0_52px_rgba(255,92,168,0.09)] md:p-9">
              <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-bond-rose/15 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-8 h-32 w-32 rounded-full bg-bond-violet/20 blur-3xl" />

              <div className="relative grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
                <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,92,168,0.15),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]">
                  <div className="absolute h-[360px] w-[360px] rounded-full border border-bond-rose/20" />
                  <div className="absolute h-[285px] w-[285px] animate-pulse rounded-full border border-bond-violet/20" />
                  <div className="absolute h-[205px] w-[205px] rounded-full border border-bond-rose/35 shadow-[0_0_48px_rgba(255,92,168,0.20)]" />
                  <div className="absolute h-32 w-32 animate-pulse rounded-full bg-bond-rose/20 blur-2xl" />

                  <div className="relative z-10 rounded-full border border-bond-rose/35 bg-black/50 px-10 py-9 text-center shadow-[0_0_34px_rgba(255,92,168,0.16)] backdrop-blur-sm">
                    <p className="text-xs font-extrabold uppercase tracking-[0.32em] text-bond-rose">
                      {t("memory")}
                    </p>
                    <p className="mt-3 max-w-[230px] font-display text-3xl font-bold text-white">
                      {t("livesOn")}
                    </p>
                  </div>

                  <div className="absolute left-5 top-7 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm md:left-8">
                    {memoryItems[0]}
                  </div>
                  <div className="absolute right-5 top-14 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm md:right-8">
                    {memoryItems[3]}
                  </div>
                  <div className="absolute bottom-14 left-6 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm md:left-10">
                    {memoryItems[4]}
                  </div>
                  <div className="absolute bottom-8 right-6 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm md:right-9">
                    {memoryItems[5]}
                  </div>
                </div>

                <div className="text-center lg:text-left">
                  <h2 className="font-display text-4xl font-bold text-white md:text-6xl">
                    {t("bondDoesNotReset")}
                  </h2>
                  <p className="mt-6 text-lg leading-8 text-bond-muted">
                    {t("whyMemoryIntro")}
                  </p>

                  <ul className="mt-7 grid gap-3 text-left text-base leading-7 text-bond-muted sm:grid-cols-2">
                    {memoryItems.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 p-4"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-bond-rose shadow-[0_0_12px_rgba(255,92,168,0.55)]"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-b border-white/5 bg-white/[0.015] py-16 md:py-24">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bond-rose/[0.06] blur-3xl" />

          <div className="bond-container relative">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-bond-rose">
                {copy.depthEyebrow}
              </p>
              <h2 className="mt-4 font-display text-4xl font-bold text-white md:text-6xl">
                {copy.depthTitle}
              </h2>
            </div>

            <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-2 xl:grid-cols-3">
              {copy.depthCards.map((card) => (
                <article
                  key={card.title}
                  className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/25 p-7 shadow-[0_0_28px_rgba(255,92,168,0.04)]"
                >
                  <h3 className="font-display text-2xl font-bold text-bond-rose">
                    {card.title}
                  </h3>
                  <p className="mt-4 leading-7 text-bond-muted">
                    {card.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/5 py-16 md:py-24">
          <div className="bond-container">
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] border border-bond-rose/50 bg-[radial-gradient(circle_at_80%_20%,rgba(255,92,168,0.20),transparent_32%),linear-gradient(135deg,rgba(20,8,24,0.98),rgba(5,5,9,0.98))] px-6 py-12 text-center shadow-[0_0_60px_rgba(255,92,168,0.13)] md:px-12 md:py-16">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-bond-rose/20" />
              <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-bond-violet/20" />

              <p className="relative text-sm font-extrabold uppercase tracking-[0.28em] text-bond-rose">
                {copy.subscriptionEyebrow}
              </p>
              <h2 className="relative mt-4 font-display text-5xl font-bold text-white md:text-7xl">
                {copy.subscriptionTitle}
              </h2>
              <p className="relative mx-auto mt-6 max-w-3xl text-lg leading-8 text-bond-muted">
                {copy.subscriptionDescription}
              </p>

              <div className="relative mt-9 flex flex-wrap justify-center gap-3">
                {copy.subscriptionPoints.map((point) => (
                  <span
                    key={point}
                    className="rounded-full border border-bond-rose/40 bg-bond-rose/10 px-5 py-2.5 text-sm font-bold text-white"
                  >
                    {point}
                  </span>
                ))}
              </div>

              <div className="relative mt-9 flex justify-center">
                <Link
                  href="/coins"
                  className="bond-pink-button inline-flex rounded-full bg-bond-rose px-8 py-3.5 text-sm font-extrabold text-white shadow-[0_0_30px_rgba(255,92,168,0.30)]"
                >
                  {copy.secondaryCta}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/5 py-16 md:py-24">
          <div className="bond-container">
            <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,92,168,0.10),rgba(120,60,255,0.08))] p-8 text-center md:p-12">
              <h2 className="font-display text-3xl font-bold text-white md:text-5xl">
                {copy.ctaTitle}
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-bond-muted">
                {copy.ctaDescription}
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  href="/characters"
                  className="bond-pink-button inline-flex rounded-full bg-bond-rose px-7 py-3.5 text-sm font-extrabold text-white"
                >
                  {copy.primaryCta}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="bond-container">
            <div className="mx-auto max-w-5xl">
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">
                  {faqCopy.eyebrow}
                </p>
                <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
                  {faqCopy.title}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-bond-muted md:text-lg">
                  {faqCopy.description}
                </p>
              </div>

              <div className="mt-10 grid gap-4">
                {faqs.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center shadow-[0_0_24px_rgba(255,92,168,0.03)] transition hover:border-bond-rose/25"
                  >
                    <h3 className="font-display text-xl font-bold text-white">
                      {item.question}
                    </h3>
                    <p className="mx-auto mt-3 max-w-4xl leading-7 text-bond-muted">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
