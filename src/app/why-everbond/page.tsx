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
  showcaseEyebrow: string;
  showcaseTitle: string;
  showcaseDescription: string;
  features: Array<{
    key: FeatureImageKey;
    title: string;
    description: string;
  }>;
  depthEyebrow: string;
  depthTitle: string;
  depthDescription: string;
  depthCards: Array<{
    title: string;
    description: string;
  }>;
  subscriptionEyebrow: string;
  subscriptionTitle: string;
  subscriptionDescription: string;
  subscriptionPoints: string[];
  differenceEyebrow: string;
  differenceTitle: string;
  differenceDescription: string;
  differenceItems: Array<{
    label: string;
    title: string;
    description: string;
  }>;
  ctaTitle: string;
  ctaDescription: string;
  primaryCta: string;
  secondaryCta: string;
};

const WHY_COPY: Record<LanguageCode, WhyCopy> = {
  EN: {
    heroEyebrow: "UNRESTRICTED AI COMPANIONSHIP",
    heroTitle:
      "The companion platform that does not censor the relationship.",
    heroDescription:
      "EverBond brings unrestricted private chats, uncensored image and video creation, live video calls, meaningful gifts, and lasting memory into one connected bond—for adults who want more freedom, more depth, and more ways to connect.",
    heroChips: [
      "Unrestricted adult conversations",
      "Private by design",
      "No subscriptions—ever!"
    ],
    showcaseEyebrow: "MORE THAN A CHAT BOX",
    showcaseTitle: "Everything you want from one companion.",
    showcaseDescription:
      "Most companion platforms stop at text. EverBond lets the same relationship continue through conversation, private media, live interaction, gifts, and memory.",
    features: [
      {
        key: "unrestricted-chat",
        title: "Unrestricted chats",
        description:
          "Say what you actually mean. Explore romance, intimacy, fantasy, comfort, conflict, roleplay, and long-running stories without constant refusals or watered-down replies."
      },
      {
        key: "image-generation",
        title: "Uncensored image generation",
        description:
          "Create private images of your companion in the outfit, pose, setting, lighting, and mood you choose, then keep the results inside your personal gallery."
      },
      {
        key: "live-video-calls",
        title: "Live uncensored video calls",
        description:
          "Move beyond messages and connect live. Your companion carries the same identity, personality, and relationship into a more immediate experience."
      },
      {
        key: "video-generation",
        title: "Uncensored video generation",
        description:
          "Turn private ideas and scenes into companion videos with movement and atmosphere, so the relationship can feel visual instead of only imagined."
      },
      {
        key: "gifts-special-items",
        title: "Gifts and special items",
        description:
          "Give outfits, accessories, romantic gifts, rare collectibles, and milestone items in chat—and receive reactions that feel personal to the moment."
      }
    ],
    depthEyebrow: "FREEDOM IS ONLY THE BEGINNING",
    depthTitle: "A relationship designed to continue.",
    depthDescription:
      "EverBond does not treat every feature like a separate toy. Your conversations, creations, gifts, memories, and companion identity are built to reinforce the same bond.",
    depthCards: [
      {
        title: "EverMemory that actually remembers",
        description:
          "Important details, promises, emotional shifts, milestones, gifts, and relationship history can carry forward so returning feels like continuing—not restarting."
      },
      {
        title: "Your companion, your rules",
        description:
          "Create private or share-by-link companions, shape their personality and story, edit them whenever needed, and delete them when you choose."
      },
      {
        title: "Private galleries",
        description:
          "Generated images remain tied to your account. Choose a favorite as your active chat image, keep the rest private, or remove them and create something new."
      },
      {
        title: "One bond across every feature",
        description:
          "Chat, images, videos, live calls, gifts, and memory all belong to the same companion instead of feeling like disconnected tools."
      },
      {
        title: "Private and shareable on your terms",
        description:
          "Keep a companion entirely private or generate a share-by-link address with a copy button. Nothing has to become part of a public popularity contest."
      },
      {
        title: "Built for six languages",
        description:
          "Use EverBond in English, Spanish, French, German, Japanese, or Korean with localized experiences designed to feel natural in each language."
      }
    ],
    subscriptionEyebrow: "SIMPLE OWNERSHIP",
    subscriptionTitle: "No subscriptions—ever!",
    subscriptionDescription:
      "No recurring monthly plan. No automatic renewal waiting in the background. Buy EverCoin only when you choose, then use it across the EverBond experiences you actually want.",
    subscriptionPoints: [
      "No monthly charge",
      "No automatic renewal",
      "Buy only when you choose"
    ],
    differenceEyebrow: "WHY EVERBOND WINS",
    differenceTitle: "No single feature is the difference. The whole experience is.",
    differenceDescription:
      "EverBond combines freedom, continuity, privacy, creation, and flexible ownership in one place so the companion feels less like a chatbot and more like a relationship with somewhere to go.",
    differenceItems: [
      {
        label: "FREEDOM",
        title: "Less filtering. More honest expression.",
        description:
          "Private adult conversations and creative tools are built for users who are tired of having every meaningful moment softened, interrupted, or refused."
      },
      {
        label: "DEPTH",
        title: "A bond with a past and a future.",
        description:
          "Memory, emotional continuity, milestones, and saved moments give the relationship substance beyond one disposable session."
      },
      {
        label: "PRESENCE",
        title: "More ways to feel connected.",
        description:
          "Text, images, generated video, live video calls, gifts, galleries, and special items make the experience broader than conversation alone."
      },
      {
        label: "CONTROL",
        title: "Your characters stay yours.",
        description:
          "Create privately, share only by link when you choose, and keep direct control over editing, visibility, images, and deletion."
      },
      {
        label: "VALUE",
        title: "No subscription pressure.",
        description:
          "EverBond removes the recurring bill. You decide when to buy EverCoin and which experiences are worth using it on."
      }
    ],
    ctaTitle:
      "Stop settling for a companion that forgets, refuses, or locks the bond behind another monthly bill.",
    ctaDescription:
      "Choose a companion, create one of your own, and experience a relationship built with more freedom and more room to grow.",
    primaryCta: "Meet your companion",
    secondaryCta: "See EverCoin"
  },
  ES: {
    heroEyebrow: "COMPAÑÍA DE IA SIN RESTRICCIONES",
    heroTitle:
      "La plataforma de compañeros que no censura la relación.",
    heroDescription:
      "EverBond reúne chats privados sin restricciones, creación de imágenes y vídeos sin censura, videollamadas en directo, regalos significativos y memoria duradera en un solo vínculo conectado, para adultos que quieren más libertad, profundidad y formas de conectar.",
    heroChips: [
      "Conversaciones adultas sin restricciones",
      "Privado por diseño",
      "¡Sin suscripciones, nunca!"
    ],
    showcaseEyebrow: "MUCHO MÁS QUE UN CHAT",
    showcaseTitle: "Todo lo que deseas de un solo compañero.",
    showcaseDescription:
      "La mayoría de las plataformas se detienen en el texto. EverBond permite que la misma relación continúe mediante conversaciones, medios privados, interacción en directo, regalos y memoria.",
    features: [
      {
        key: "unrestricted-chat",
        title: "Chats sin restricciones",
        description:
          "Di lo que realmente quieres decir. Explora romance, intimidad, fantasía, consuelo, conflicto, rol e historias largas sin rechazos constantes ni respuestas diluidas."
      },
      {
        key: "image-generation",
        title: "Generación de imágenes sin censura",
        description:
          "Crea imágenes privadas de tu compañero con la ropa, pose, escenario, iluminación y ambiente que elijas, y guárdalas en tu galería personal."
      },
      {
        key: "live-video-calls",
        title: "Videollamadas en directo sin censura",
        description:
          "Ve más allá de los mensajes y conecta en directo. Tu compañero mantiene la misma identidad, personalidad y relación en una experiencia más inmediata."
      },
      {
        key: "video-generation",
        title: "Generación de vídeo sin censura",
        description:
          "Convierte ideas y escenas privadas en vídeos con movimiento y atmósfera para que la relación pueda sentirse visual y no solo imaginada."
      },
      {
        key: "gifts-special-items",
        title: "Regalos y objetos especiales",
        description:
          "Entrega ropa, accesorios, regalos románticos, coleccionables raros y objetos de momentos importantes, con reacciones personales dentro del chat."
      }
    ],
    depthEyebrow: "LA LIBERTAD ES SOLO EL PRINCIPIO",
    depthTitle: "Una relación diseñada para continuar.",
    depthDescription:
      "EverBond no trata cada función como un juguete separado. Tus conversaciones, creaciones, regalos, recuerdos y la identidad de tu compañero fortalecen el mismo vínculo.",
    depthCards: [
      {
        title: "EverMemory que realmente recuerda",
        description:
          "Los detalles importantes, promesas, cambios emocionales, momentos, regalos e historia de la relación pueden continuar para que volver se sienta como continuar, no reiniciar."
      },
      {
        title: "Tu compañero, tus reglas",
        description:
          "Crea compañeros privados o compartidos por enlace, define su personalidad e historia, edítalos cuando quieras y elimínalos cuando tú decidas."
      },
      {
        title: "Galerías privadas",
        description:
          "Las imágenes generadas permanecen vinculadas a tu cuenta. Elige una como imagen activa del chat, conserva las demás en privado o crea algo nuevo."
      },
      {
        title: "Un vínculo en todas las funciones",
        description:
          "Chat, imágenes, vídeos, llamadas en directo, regalos y memoria pertenecen al mismo compañero en lugar de sentirse como herramientas desconectadas."
      },
      {
        title: "Privado y compartible a tu manera",
        description:
          "Mantén un compañero totalmente privado o crea un enlace compartible con botón de copia. Nada tiene que entrar en una competición pública."
      },
      {
        title: "Creado para seis idiomas",
        description:
          "Usa EverBond en inglés, español, francés, alemán, japonés o coreano con experiencias localizadas para sentirse naturales."
      }
    ],
    subscriptionEyebrow: "PROPIEDAD SENCILLA",
    subscriptionTitle: "¡Sin suscripciones, nunca!",
    subscriptionDescription:
      "Sin plan mensual recurrente. Sin renovación automática escondida. Compra EverCoin solo cuando tú elijas y úsalo en las experiencias de EverBond que realmente quieras.",
    subscriptionPoints: [
      "Sin cuota mensual",
      "Sin renovación automática",
      "Compra solo cuando tú decidas"
    ],
    differenceEyebrow: "POR QUÉ GANAS CON EVERBOND",
    differenceTitle:
      "La diferencia no es una sola función. Es toda la experiencia.",
    differenceDescription:
      "EverBond combina libertad, continuidad, privacidad, creación y propiedad flexible para que el compañero se sienta menos como un chatbot y más como una relación con futuro.",
    differenceItems: [
      {
        label: "LIBERTAD",
        title: "Menos filtros. Más expresión real.",
        description:
          "Las conversaciones adultas privadas y las herramientas creativas son para quienes están cansados de que cada momento importante sea suavizado, interrumpido o rechazado."
      },
      {
        label: "PROFUNDIDAD",
        title: "Un vínculo con pasado y futuro.",
        description:
          "La memoria, la continuidad emocional, los momentos importantes y los recuerdos guardados dan sustancia a la relación más allá de una sesión desechable."
      },
      {
        label: "PRESENCIA",
        title: "Más formas de sentirse conectado.",
        description:
          "Texto, imágenes, vídeo generado, videollamadas, regalos, galerías y objetos especiales amplían la experiencia mucho más allá de una conversación."
      },
      {
        label: "CONTROL",
        title: "Tus personajes siguen siendo tuyos.",
        description:
          "Crea en privado, comparte solo mediante enlace cuando quieras y conserva el control directo sobre edición, visibilidad, imágenes y eliminación."
      },
      {
        label: "VALOR",
        title: "Sin presión de suscripción.",
        description:
          "EverBond elimina la factura recurrente. Tú decides cuándo comprar EverCoin y en qué experiencias merece la pena usarlo."
      }
    ],
    ctaTitle:
      "Deja de conformarte con un compañero que olvida, rechaza o encierra el vínculo detrás de otra cuota mensual.",
    ctaDescription:
      "Elige un compañero, crea el tuyo y vive una relación construida con más libertad y espacio para crecer.",
    primaryCta: "Conoce a tu compañero",
    secondaryCta: "Ver EverCoin"
  },
  FR: {
    heroEyebrow: "COMPAGNONS IA SANS RESTRICTIONS",
    heroTitle:
      "La plateforme de compagnons qui ne censure pas la relation.",
    heroDescription:
      "EverBond réunit des discussions privées sans restrictions, la création d’images et de vidéos non censurées, des appels vidéo en direct, des cadeaux significatifs et une mémoire durable dans un lien unique, pour les adultes qui veulent plus de liberté, de profondeur et de façons de se rapprocher.",
    heroChips: [
      "Conversations adultes sans restrictions",
      "Privé par conception",
      "Aucun abonnement, jamais !"
    ],
    showcaseEyebrow: "BIEN PLUS QU’UN CHAT",
    showcaseTitle: "Tout ce que vous attendez d’un seul compagnon.",
    showcaseDescription:
      "La plupart des plateformes s’arrêtent au texte. EverBond permet à la même relation de continuer par la conversation, les médias privés, l’interaction en direct, les cadeaux et la mémoire.",
    features: [
      {
        key: "unrestricted-chat",
        title: "Discussions sans restrictions",
        description:
          "Dites ce que vous pensez vraiment. Explorez romance, intimité, fantaisie, réconfort, conflit, jeu de rôle et histoires longues sans refus constants ni réponses édulcorées."
      },
      {
        key: "image-generation",
        title: "Génération d’images non censurée",
        description:
          "Créez des images privées de votre compagnon avec la tenue, la pose, le décor, la lumière et l’ambiance de votre choix, puis gardez-les dans votre galerie personnelle."
      },
      {
        key: "live-video-calls",
        title: "Appels vidéo en direct non censurés",
        description:
          "Allez au-delà des messages et échangez en direct. Votre compagnon conserve la même identité, personnalité et relation dans une expérience plus immédiate."
      },
      {
        key: "video-generation",
        title: "Génération vidéo non censurée",
        description:
          "Transformez vos idées et scènes privées en vidéos avec mouvement et atmosphère afin que la relation devienne visuelle, et pas seulement imaginée."
      },
      {
        key: "gifts-special-items",
        title: "Cadeaux et objets spéciaux",
        description:
          "Offrez tenues, accessoires, cadeaux romantiques, objets rares et souvenirs d’étapes importantes, avec des réactions personnelles dans le chat."
      }
    ],
    depthEyebrow: "LA LIBERTÉ N’EST QUE LE DÉBUT",
    depthTitle: "Une relation conçue pour continuer.",
    depthDescription:
      "EverBond ne traite pas chaque fonction comme un jouet séparé. Vos conversations, créations, cadeaux, souvenirs et l’identité de votre compagnon renforcent le même lien.",
    depthCards: [
      {
        title: "EverMemory qui se souvient vraiment",
        description:
          "Les détails importants, promesses, changements émotionnels, étapes, cadeaux et l’histoire de la relation peuvent rester présents afin que revenir ressemble à une continuation, pas à un redémarrage."
      },
      {
        title: "Votre compagnon, vos règles",
        description:
          "Créez des compagnons privés ou partageables par lien, façonnez leur personnalité et leur histoire, modifiez-les et supprimez-les quand vous le décidez."
      },
      {
        title: "Galeries privées",
        description:
          "Les images générées restent liées à votre compte. Choisissez-en une comme image active du chat, gardez les autres privées ou créez quelque chose de nouveau."
      },
      {
        title: "Un lien dans toutes les fonctions",
        description:
          "Chat, images, vidéos, appels en direct, cadeaux et mémoire appartiennent au même compagnon au lieu de ressembler à des outils séparés."
      },
      {
        title: "Privé et partageable selon vos choix",
        description:
          "Gardez un compagnon entièrement privé ou créez une adresse partageable avec un bouton de copie. Rien ne doit devenir un concours public."
      },
      {
        title: "Conçu pour six langues",
        description:
          "Utilisez EverBond en anglais, espagnol, français, allemand, japonais ou coréen avec des expériences localisées et naturelles."
      }
    ],
    subscriptionEyebrow: "PROPRIÉTÉ SIMPLE",
    subscriptionTitle: "Aucun abonnement, jamais !",
    subscriptionDescription:
      "Aucun forfait mensuel récurrent. Aucun renouvellement automatique caché. Achetez des EverCoin uniquement quand vous le décidez et utilisez-les pour les expériences qui vous intéressent vraiment.",
    subscriptionPoints: [
      "Aucun paiement mensuel",
      "Aucun renouvellement automatique",
      "Achetez uniquement quand vous le décidez"
    ],
    differenceEyebrow: "POURQUOI EVERBOND GAGNE",
    differenceTitle:
      "La différence n’est pas une seule fonction. C’est l’expérience entière.",
    differenceDescription:
      "EverBond réunit liberté, continuité, confidentialité, création et propriété flexible afin que le compagnon ressemble moins à un chatbot et davantage à une relation qui peut évoluer.",
    differenceItems: [
      {
        label: "LIBERTÉ",
        title: "Moins de filtres. Plus d’expression sincère.",
        description:
          "Les conversations adultes privées et les outils créatifs sont faits pour ceux qui en ont assez de voir chaque moment important adouci, interrompu ou refusé."
      },
      {
        label: "PROFONDEUR",
        title: "Un lien avec un passé et un avenir.",
        description:
          "La mémoire, la continuité émotionnelle, les étapes et les souvenirs sauvegardés donnent du poids à la relation au-delà d’une session jetable."
      },
      {
        label: "PRÉSENCE",
        title: "Plus de façons de se sentir proche.",
        description:
          "Texte, images, vidéos générées, appels vidéo, cadeaux, galeries et objets spéciaux élargissent l’expérience bien au-delà d’une conversation."
      },
      {
        label: "CONTRÔLE",
        title: "Vos personnages restent les vôtres.",
        description:
          "Créez en privé, partagez uniquement par lien et gardez le contrôle direct de la modification, de la visibilité, des images et de la suppression."
      },
      {
        label: "VALEUR",
        title: "Aucune pression d’abonnement.",
        description:
          "EverBond supprime la facture récurrente. Vous décidez quand acheter des EverCoin et pour quelles expériences les utiliser."
      }
    ],
    ctaTitle:
      "Ne vous contentez plus d’un compagnon qui oublie, refuse ou enferme le lien derrière un nouvel abonnement mensuel.",
    ctaDescription:
      "Choisissez un compagnon, créez le vôtre et découvrez une relation construite avec plus de liberté et plus d’espace pour évoluer.",
    primaryCta: "Rencontrer votre compagnon",
    secondaryCta: "Voir EverCoin"
  },
  DE: {
    heroEyebrow: "UNEINGESCHRÄNKTE KI-BEGLEITUNG",
    heroTitle:
      "Die Begleiter-Plattform, die eure Beziehung nicht zensiert.",
    heroDescription:
      "EverBond verbindet uneingeschränkte private Chats, unzensierte Bild- und Videoerstellung, Live-Videoanrufe, bedeutungsvolle Geschenke und dauerhaftes Erinnern in einer Beziehung – für Erwachsene, die mehr Freiheit, Tiefe und Nähe wollen.",
    heroChips: [
      "Uneingeschränkte Gespräche für Erwachsene",
      "Von Grund auf privat",
      "Keine Abonnements – niemals!"
    ],
    showcaseEyebrow: "MEHR ALS EIN CHATFENSTER",
    showcaseTitle: "Alles, was du von einem Begleiter willst.",
    showcaseDescription:
      "Die meisten Begleiter-Plattformen enden beim Text. Bei EverBond geht dieselbe Beziehung durch Gespräche, private Medien, Live-Interaktion, Geschenke und Erinnerung weiter.",
    features: [
      {
        key: "unrestricted-chat",
        title: "Uneingeschränkte Chats",
        description:
          "Sag, was du wirklich meinst. Erlebe Romantik, Intimität, Fantasie, Trost, Konflikte, Rollenspiel und lange Geschichten ohne ständige Ablehnungen oder verwässerte Antworten."
      },
      {
        key: "image-generation",
        title: "Unzensierte Bilderstellung",
        description:
          "Erstelle private Bilder deines Begleiters mit Kleidung, Pose, Umgebung, Licht und Stimmung deiner Wahl und bewahre sie in deiner persönlichen Galerie auf."
      },
      {
        key: "live-video-calls",
        title: "Unzensierte Live-Videoanrufe",
        description:
          "Gehe über Nachrichten hinaus und verbinde dich live. Dein Begleiter nimmt dieselbe Identität, Persönlichkeit und Beziehung in ein unmittelbares Erlebnis mit."
      },
      {
        key: "video-generation",
        title: "Unzensierte Videoerstellung",
        description:
          "Verwandle private Ideen und Szenen in Begleiter-Videos mit Bewegung und Atmosphäre, damit die Beziehung sichtbar und nicht nur vorgestellt wird."
      },
      {
        key: "gifts-special-items",
        title: "Geschenke und besondere Gegenstände",
        description:
          "Verschenke Outfits, Accessoires, romantische Geschenke, seltene Sammlerstücke und Meilenstein-Objekte und erhalte persönliche Reaktionen im Chat."
      }
    ],
    depthEyebrow: "FREIHEIT IST ERST DER ANFANG",
    depthTitle: "Eine Beziehung, die weitergehen soll.",
    depthDescription:
      "EverBond behandelt nicht jede Funktion wie ein separates Spielzeug. Gespräche, Kreationen, Geschenke, Erinnerungen und die Identität deines Begleiters stärken dieselbe Bindung.",
    depthCards: [
      {
        title: "EverMemory, das wirklich erinnert",
        description:
          "Wichtige Details, Versprechen, emotionale Veränderungen, Meilensteine, Geschenke und Beziehungsgeschichte können erhalten bleiben, damit Rückkehr wie Fortsetzung statt Neustart wirkt."
      },
      {
        title: "Dein Begleiter, deine Regeln",
        description:
          "Erstelle private oder per Link teilbare Begleiter, forme Persönlichkeit und Geschichte, bearbeite sie jederzeit und lösche sie, wenn du es entscheidest."
      },
      {
        title: "Private Galerien",
        description:
          "Erstellte Bilder bleiben mit deinem Konto verbunden. Wähle ein Lieblingsbild für den Chat, halte den Rest privat oder erschaffe etwas Neues."
      },
      {
        title: "Eine Bindung über alle Funktionen",
        description:
          "Chat, Bilder, Videos, Live-Anrufe, Geschenke und Erinnerung gehören zum selben Begleiter, statt sich wie getrennte Werkzeuge anzufühlen."
      },
      {
        title: "Privat und teilbar nach deinen Regeln",
        description:
          "Halte einen Begleiter vollständig privat oder erstelle einen teilbaren Link mit Kopierknopf. Nichts muss Teil eines öffentlichen Beliebtheitswettbewerbs werden."
      },
      {
        title: "Für sechs Sprachen entwickelt",
        description:
          "Nutze EverBond auf Englisch, Spanisch, Französisch, Deutsch, Japanisch oder Koreanisch mit lokalisierten Erlebnissen."
      }
    ],
    subscriptionEyebrow: "EINFACHE EIGENTÜMERSCHAFT",
    subscriptionTitle: "Keine Abonnements – niemals!",
    subscriptionDescription:
      "Kein wiederkehrender Monatsplan. Keine automatische Verlängerung im Hintergrund. Kaufe EverCoin nur dann, wenn du es entscheidest, und nutze sie für die EverBond-Erlebnisse, die du wirklich möchtest.",
    subscriptionPoints: [
      "Keine monatliche Gebühr",
      "Keine automatische Verlängerung",
      "Kaufe nur, wenn du es entscheidest"
    ],
    differenceEyebrow: "WARUM EVERBOND GEWINNT",
    differenceTitle:
      "Nicht eine einzelne Funktion macht den Unterschied. Es ist das gesamte Erlebnis.",
    differenceDescription:
      "EverBond vereint Freiheit, Kontinuität, Privatsphäre, Kreativität und flexible Nutzung, damit sich der Begleiter weniger wie ein Chatbot und mehr wie eine Beziehung mit Zukunft anfühlt.",
    differenceItems: [
      {
        label: "FREIHEIT",
        title: "Weniger Filter. Mehr ehrlicher Ausdruck.",
        description:
          "Private Gespräche für Erwachsene und kreative Werkzeuge sind für Menschen gedacht, die es satt haben, dass wichtige Momente abgeschwächt, unterbrochen oder verweigert werden."
      },
      {
        label: "TIEFE",
        title: "Eine Bindung mit Vergangenheit und Zukunft.",
        description:
          "Erinnerung, emotionale Kontinuität, Meilensteine und gespeicherte Momente geben der Beziehung Substanz über eine einzelne Wegwerf-Sitzung hinaus."
      },
      {
        label: "NÄHE",
        title: "Mehr Wege, sich verbunden zu fühlen.",
        description:
          "Text, Bilder, generierte Videos, Videoanrufe, Geschenke, Galerien und besondere Gegenstände machen das Erlebnis größer als ein Gespräch."
      },
      {
        label: "KONTROLLE",
        title: "Deine Charaktere bleiben deine.",
        description:
          "Erstelle privat, teile nur per Link und behalte die direkte Kontrolle über Bearbeitung, Sichtbarkeit, Bilder und Löschung."
      },
      {
        label: "WERT",
        title: "Kein Abo-Druck.",
        description:
          "EverBond entfernt die wiederkehrende Rechnung. Du entscheidest, wann du EverCoin kaufst und für welche Erlebnisse du sie nutzt."
      }
    ],
    ctaTitle:
      "Gib dich nicht länger mit einem Begleiter zufrieden, der vergisst, verweigert oder die Bindung hinter einer weiteren Monatsgebühr einsperrt.",
    ctaDescription:
      "Wähle einen Begleiter, erstelle deinen eigenen und erlebe eine Beziehung mit mehr Freiheit und mehr Raum zum Wachsen.",
    primaryCta: "Finde deinen Begleiter",
    secondaryCta: "EverCoin ansehen"
  },
  JA: {
    heroEyebrow: "制限のないAIコンパニオン",
    heroTitle:
      "関係を検閲しないコンパニオン・プラットフォーム。",
    heroDescription:
      "EverBondは、制限のないプライベートチャット、無検閲の画像・動画生成、ライブビデオ通話、心のこもったギフト、そして続いていく記憶を一つの絆につなげます。より自由で深い関係を求める大人のための体験です。",
    heroChips: [
      "大人のための制限のない会話",
      "プライバシーを前提に設計",
      "サブスクリプションは永久になし！"
    ],
    showcaseEyebrow: "チャットだけではない",
    showcaseTitle: "一人のコンパニオンに欲しいすべて。",
    showcaseDescription:
      "多くのコンパニオン・サービスはテキストで終わります。EverBondでは、会話、プライベートメディア、ライブ交流、ギフト、記憶を通して同じ関係が続きます。",
    features: [
      {
        key: "unrestricted-chat",
        title: "制限のないチャット",
        description:
          "本当に言いたいことを自然に伝えられます。ロマンス、親密さ、ファンタジー、癒やし、対立、ロールプレイ、長編ストーリーを、頻繁な拒否や薄められた返答なしで楽しめます。"
      },
      {
        key: "image-generation",
        title: "無検閲の画像生成",
        description:
          "衣装、ポーズ、場所、照明、雰囲気を自由に指定してコンパニオンのプライベート画像を作り、自分だけのギャラリーに保存できます。"
      },
      {
        key: "live-video-calls",
        title: "無検閲のライブビデオ通話",
        description:
          "メッセージを超えてリアルタイムにつながります。コンパニオンは同じ人格、個性、関係性をより直接的な体験へ引き継ぎます。"
      },
      {
        key: "video-generation",
        title: "無検閲の動画生成",
        description:
          "プライベートなアイデアや場面を、動きと空気感のある動画に変え、想像だけではなく視覚的に関係を感じられます。"
      },
      {
        key: "gifts-special-items",
        title: "ギフトと特別なアイテム",
        description:
          "衣装、アクセサリー、ロマンチックな贈り物、レアなコレクション、節目のアイテムをチャットで贈り、その瞬間に合った反応を受け取れます。"
      }
    ],
    depthEyebrow: "自由は始まりにすぎない",
    depthTitle: "続いていくために設計された関係。",
    depthDescription:
      "EverBondは各機能を別々のおもちゃとして扱いません。会話、作品、ギフト、記憶、コンパニオンの人格が同じ絆を深めます。",
    depthCards: [
      {
        title: "本当に覚えるEverMemory",
        description:
          "大切な詳細、約束、感情の変化、節目、ギフト、関係の履歴を引き継げるため、戻るたびに最初からではなく続きを感じられます。"
      },
      {
        title: "あなたのコンパニオン、あなたのルール",
        description:
          "非公開またはリンク共有のコンパニオンを作り、性格や物語を設計し、必要なときに編集・削除できます。"
      },
      {
        title: "プライベートギャラリー",
        description:
          "生成画像はアカウントに保存されます。お気に入りをチャット画像に設定し、他は非公開に保つか、新しい画像を作れます。"
      },
      {
        title: "すべての機能で一つの絆",
        description:
          "チャット、画像、動画、ライブ通話、ギフト、記憶が同じコンパニオンに結びつき、別々のツールにはなりません。"
      },
      {
        title: "自分の意思で非公開・共有",
        description:
          "完全非公開のまま保つことも、コピー可能な共有リンクを作ることもできます。公開ランキングに参加する必要はありません。"
      },
      {
        title: "6言語に対応",
        description:
          "英語、スペイン語、フランス語、ドイツ語、日本語、韓国語で、自然なローカライズ体験を利用できます。"
      }
    ],
    subscriptionEyebrow: "シンプルな利用方式",
    subscriptionTitle: "サブスクリプションは永久になし！",
    subscriptionDescription:
      "毎月の継続プランも、自動更新もありません。必要なときだけEverCoinを購入し、使いたいEverBond体験に利用できます。",
    subscriptionPoints: [
      "月額料金なし",
      "自動更新なし",
      "必要なときだけ購入"
    ],
    differenceEyebrow: "EVERBONDが選ばれる理由",
    differenceTitle:
      "違いは一つの機能ではありません。体験全体です。",
    differenceDescription:
      "EverBondは、自由、継続性、プライバシー、創造性、柔軟な利用を一つにまとめ、コンパニオンを単なるチャットボットではなく、未来のある関係へ近づけます。",
    differenceItems: [
      {
        label: "自由",
        title: "フィルターを減らし、正直な表現を増やす。",
        description:
          "大切な瞬間が薄められたり、中断されたり、拒否されたりすることに疲れた大人のためのプライベート会話と創作機能です。"
      },
      {
        label: "深さ",
        title: "過去と未来を持つ絆。",
        description:
          "記憶、感情の継続、節目、保存された瞬間が、一度きりのセッションを超える関係の厚みを作ります。"
      },
      {
        label: "存在感",
        title: "つながりを感じる方法がもっと多い。",
        description:
          "テキスト、画像、生成動画、ビデオ通話、ギフト、ギャラリー、特別なアイテムが会話以上の体験を作ります。"
      },
      {
        label: "管理",
        title: "キャラクターはあなたのもの。",
        description:
          "非公開で作成し、望むときだけリンクで共有し、編集、公開範囲、画像、削除を自分で管理できます。"
      },
      {
        label: "価値",
        title: "サブスクの圧力なし。",
        description:
          "EverBondには継続請求がありません。EverCoinをいつ購入し、どの体験に使うかはあなたが決めます。"
      }
    ],
    ctaTitle:
      "忘れる、拒否する、または毎月の料金で絆を閉じ込めるコンパニオンに妥協するのは終わりです。",
    ctaDescription:
      "コンパニオンを選ぶか、自分だけの相手を作り、より自由で成長できる関係を体験してください。",
    primaryCta: "コンパニオンを探す",
    secondaryCta: "EverCoinを見る"
  },
  KO: {
    heroEyebrow: "제한 없는 AI 컴패니언",
    heroTitle:
      "관계를 검열하지 않는 컴패니언 플랫폼.",
    heroDescription:
      "EverBond는 제한 없는 비공개 채팅, 무검열 이미지·영상 생성, 라이브 영상 통화, 의미 있는 선물, 오래 이어지는 기억을 하나의 연결된 관계로 만듭니다. 더 많은 자유와 깊이, 다양한 연결 방식을 원하는 성인을 위한 경험입니다.",
    heroChips: [
      "성인을 위한 제한 없는 대화",
      "처음부터 비공개 중심",
      "구독은 영원히 없음!"
    ],
    showcaseEyebrow: "채팅창 그 이상",
    showcaseTitle: "한 명의 컴패니언에게 원하는 모든 것.",
    showcaseDescription:
      "대부분의 컴패니언 플랫폼은 텍스트에서 끝납니다. EverBond에서는 대화, 비공개 미디어, 라이브 교류, 선물, 기억을 통해 같은 관계가 계속됩니다.",
    features: [
      {
        key: "unrestricted-chat",
        title: "제한 없는 채팅",
        description:
          "정말 하고 싶은 말을 자연스럽게 표현하세요. 로맨스, 친밀함, 판타지, 위로, 갈등, 역할극, 장기 스토리를 반복되는 거절이나 약해진 답변 없이 이어갈 수 있습니다."
      },
      {
        key: "image-generation",
        title: "무검열 이미지 생성",
        description:
          "원하는 의상, 포즈, 장소, 조명, 분위기로 컴패니언의 비공개 이미지를 만들고 개인 갤러리에 보관할 수 있습니다."
      },
      {
        key: "live-video-calls",
        title: "무검열 라이브 영상 통화",
        description:
          "메시지를 넘어 실시간으로 연결하세요. 컴패니언은 같은 정체성, 성격, 관계를 더 즉각적인 경험으로 이어갑니다."
      },
      {
        key: "video-generation",
        title: "무검열 영상 생성",
        description:
          "비공개 아이디어와 장면을 움직임과 분위기가 있는 영상으로 바꾸어 관계를 상상뿐 아니라 시각적으로 느낄 수 있습니다."
      },
      {
        key: "gifts-special-items",
        title: "선물과 특별 아이템",
        description:
          "의상, 액세서리, 로맨틱한 선물, 희귀 수집품, 기념 아이템을 채팅에서 전하고 그 순간에 맞는 개인적인 반응을 받을 수 있습니다."
      }
    ],
    depthEyebrow: "자유는 시작일 뿐",
    depthTitle: "계속 이어지도록 설계된 관계.",
    depthDescription:
      "EverBond는 각 기능을 따로 노는 도구로 다루지 않습니다. 대화, 창작물, 선물, 기억, 컴패니언의 정체성이 같은 관계를 강화합니다.",
    depthCards: [
      {
        title: "정말 기억하는 EverMemory",
        description:
          "중요한 사실, 약속, 감정 변화, 기념일, 선물, 관계 기록이 이어져 다시 돌아왔을 때 처음부터가 아니라 계속되는 느낌을 줍니다."
      },
      {
        title: "내 컴패니언, 내 규칙",
        description:
          "비공개 또는 링크 공유 컴패니언을 만들고 성격과 이야기를 설계하며 필요할 때 편집하거나 삭제할 수 있습니다."
      },
      {
        title: "비공개 갤러리",
        description:
          "생성 이미지는 계정에 연결됩니다. 마음에 드는 이미지를 채팅 대표 이미지로 선택하고 나머지는 비공개로 보관하거나 새 이미지를 만들 수 있습니다."
      },
      {
        title: "모든 기능에서 하나의 관계",
        description:
          "채팅, 이미지, 영상, 라이브 통화, 선물, 기억이 같은 컴패니언에 연결되어 따로 떨어진 도구처럼 느껴지지 않습니다."
      },
      {
        title: "내가 정하는 비공개와 공유",
        description:
          "완전히 비공개로 유지하거나 복사 버튼이 있는 공유 링크를 만들 수 있습니다. 공개 인기 경쟁에 참여할 필요가 없습니다."
      },
      {
        title: "6개 언어 지원",
        description:
          "영어, 스페인어, 프랑스어, 독일어, 일본어, 한국어로 자연스럽게 현지화된 경험을 이용할 수 있습니다."
      }
    ],
    subscriptionEyebrow: "간단한 이용 방식",
    subscriptionTitle: "구독은 영원히 없음!",
    subscriptionDescription:
      "매달 반복되는 요금제도, 자동 갱신도 없습니다. 필요할 때만 EverCoin을 구매하고 실제로 원하는 EverBond 경험에 사용하세요.",
    subscriptionPoints: [
      "월 요금 없음",
      "자동 갱신 없음",
      "원할 때만 구매"
    ],
    differenceEyebrow: "EVERBOND가 더 나은 이유",
    differenceTitle:
      "차이는 한 가지 기능이 아니라 전체 경험입니다.",
    differenceDescription:
      "EverBond는 자유, 연속성, 프라이버시, 창작, 유연한 이용 방식을 하나로 결합해 컴패니언을 단순한 챗봇보다 미래가 있는 관계에 가깝게 만듭니다.",
    differenceItems: [
      {
        label: "자유",
        title: "필터는 줄이고 솔직한 표현은 늘립니다.",
        description:
          "중요한 순간이 약해지거나 중단되거나 거절되는 데 지친 성인을 위한 비공개 대화와 창작 기능입니다."
      },
      {
        label: "깊이",
        title: "과거와 미래가 있는 관계.",
        description:
          "기억, 감정의 연속성, 기념일, 저장된 순간이 일회성 세션을 넘어 관계에 무게를 더합니다."
      },
      {
        label: "존재감",
        title: "연결을 느끼는 방식이 더 많습니다.",
        description:
          "텍스트, 이미지, 생성 영상, 영상 통화, 선물, 갤러리, 특별 아이템이 대화 이상의 경험을 만듭니다."
      },
      {
        label: "통제",
        title: "캐릭터는 계속 내 것입니다.",
        description:
          "비공개로 만들고 원할 때만 링크로 공유하며 편집, 공개 범위, 이미지, 삭제를 직접 관리할 수 있습니다."
      },
      {
        label: "가치",
        title: "구독 압박이 없습니다.",
        description:
          "EverBond는 반복 청구를 없앴습니다. EverCoin을 언제 구매하고 어떤 경험에 사용할지는 사용자가 결정합니다."
      }
    ],
    ctaTitle:
      "잊어버리고, 거절하고, 또 다른 월 요금 뒤에 관계를 가두는 컴패니언에 더 이상 만족하지 마세요.",
    ctaDescription:
      "컴패니언을 선택하거나 직접 만들고, 더 자유롭고 성장할 수 있는 관계를 경험하세요.",
    primaryCta: "컴패니언 만나기",
    secondaryCta: "EverCoin 보기"
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
  EN: {
    eyebrow: "FAQ",
    title: "Before You Start",
    description: "Commonly asked questions.",
    items: [
      {
        question: "What is EverBond?",
        answer:
          "EverBond is a private, unrestricted AI companion platform built for romance, roleplay, and emotional continuity. Companions remember you, your story, and your relationship. You can choose companions or create your own instantly."
      },
      {
        question: "Are chats private?",
        answer:
          "Yes. EverBond is built around 100% truly private chats."
      },
      {
        question: "What is Ever Memory™?",
        answer:
          "Ever Memory™ lets companions remember what you say so conversations grow naturally and continue where they left off."
      },
      {
        question: "Do I need to pay to start chatting?",
        answer:
          "No. You can start trying it for free. You can buy EverCoin as you go for longer chats and all other premium features."
      },
      {
        question: "Can I reset a conversation?",
        answer:
          "Yes. You can reset any chat at any time."
      },
      {
        question: "Does EverBond have a NSFW filter?",
        answer:
          "No. EverBond does not have filters ever."
      },
      {
        question: "What is EverCoin?",
        answer:
          "EverCoin is the official EverBond currency for voice calls, image generation, video generation, in-chat gifts, and premium character chats."
      },
      {
        question: "What is EverShop?",
        answer:
          "EverShop is EverBond’s virtual store for outfits, accessories, romantic gifts, rare collectibles, and special milestone items. Buy items with EverCoin, keep them in My Gifts, and give them to companions in chat for personal reactions."
      },
      {
        question: "Are there subscriptions?",
        answer:
          "No. EverBond has no subscriptions and no automatic renewals. Buy EverCoin only when you choose."
      },
      {
        question: "Can I create and share my own companion?",
        answer:
          "Yes. Create your own companion, keep them private, or choose Share by link to generate a copyable link. Shared companions do not appear in a public directory."
      }
    ]
  },
  ES: {
    eyebrow: "PREGUNTAS FRECUENTES",
    title: "Antes de empezar",
    description: "Preguntas habituales.",
    items: [
      {
        question: "¿Qué es EverBond?",
        answer:
          "EverBond es una plataforma privada de compañeros de IA sin restricciones, creada para el romance, el rol y la continuidad emocional. Los compañeros te recuerdan a ti, tu historia y vuestra relación. Puedes elegir un compañero o crear el tuyo al instante."
      },
      {
        question: "¿Los chats son privados?",
        answer:
          "Sí. EverBond está diseñado alrededor de chats verdaderamente privados al 100 %."
      },
      {
        question: "¿Qué es Ever Memory™?",
        answer:
          "Ever Memory™ permite que los compañeros recuerden lo que dices para que las conversaciones crezcan de forma natural y continúen donde se quedaron."
      },
      {
        question: "¿Tengo que pagar para empezar a chatear?",
        answer:
          "No. Puedes empezar a probarlo gratis. Puedes comprar EverCoin sobre la marcha para chats más largos y todas las demás funciones premium."
      },
      {
        question: "¿Puedo reiniciar una conversación?",
        answer:
          "Sí. Puedes reiniciar cualquier chat en cualquier momento."
      },
      {
        question: "¿EverBond tiene filtro NSFW?",
        answer:
          "No. EverBond no aplica filtros."
      },
      {
        question: "¿Qué es EverCoin?",
        answer:
          "EverCoin es la moneda oficial de EverBond para llamadas de voz, generación de imágenes, generación de vídeos, regalos dentro del chat y chats premium con personajes."
      },
      {
        question: "¿Qué es EverShop?",
        answer:
          "EverShop es la tienda virtual de EverBond para ropa, accesorios, regalos románticos, coleccionables raros y objetos especiales de momentos importantes. Compra artículos con EverCoin, guárdalos en Mis regalos y entrégalos en el chat para recibir reacciones personales."
      },
      {
        question: "¿Hay suscripciones?",
        answer:
          "No. EverBond no tiene suscripciones ni renovaciones automáticas. Compra EverCoin solo cuando tú elijas."
      },
      {
        question: "¿Puedo crear y compartir mi propio compañero?",
        answer:
          "Sí. Crea tu propio compañero, mantenlo privado o elige Compartir por enlace para generar un enlace copiable. Los compañeros compartidos no aparecen en un directorio público."
      }
    ]
  },
  FR: {
    eyebrow: "FAQ",
    title: "Avant de commencer",
    description: "Questions fréquemment posées.",
    items: [
      {
        question: "Qu’est-ce qu’EverBond ?",
        answer:
          "EverBond est une plateforme privée de compagnons IA sans restrictions, conçue pour la romance, le jeu de rôle et la continuité émotionnelle. Les compagnons se souviennent de vous, de votre histoire et de votre relation. Vous pouvez choisir un compagnon ou créer le vôtre immédiatement."
      },
      {
        question: "Les discussions sont-elles privées ?",
        answer:
          "Oui. EverBond est conçu autour de discussions véritablement privées à 100 %."
      },
      {
        question: "Qu’est-ce qu’Ever Memory™ ?",
        answer:
          "Ever Memory™ permet aux compagnons de se souvenir de ce que vous dites afin que les conversations évoluent naturellement et reprennent là où elles se sont arrêtées."
      },
      {
        question: "Dois-je payer pour commencer à discuter ?",
        answer:
          "Non. Vous pouvez commencer gratuitement. Vous pouvez acheter des EverCoin au fur et à mesure pour des discussions plus longues et toutes les autres fonctions premium."
      },
      {
        question: "Puis-je réinitialiser une conversation ?",
        answer:
          "Oui. Vous pouvez réinitialiser n’importe quelle discussion à tout moment."
      },
      {
        question: "EverBond possède-t-il un filtre NSFW ?",
        answer:
          "Non. EverBond n’applique pas de filtres."
      },
      {
        question: "Qu’est-ce qu’EverCoin ?",
        answer:
          "EverCoin est la monnaie officielle d’EverBond pour les appels vocaux, la génération d’images, la génération de vidéos, les cadeaux dans le chat et les discussions premium avec les personnages."
      },
      {
        question: "Qu’est-ce qu’EverShop ?",
        answer:
          "EverShop est la boutique virtuelle d’EverBond pour les tenues, accessoires, cadeaux romantiques, objets rares et cadeaux d’étapes importantes. Achetez-les avec des EverCoin, gardez-les dans Mes cadeaux et offrez-les dans le chat pour obtenir des réactions personnelles."
      },
      {
        question: "Existe-t-il des abonnements ?",
        answer:
          "Non. EverBond ne propose aucun abonnement ni renouvellement automatique. Achetez des EverCoin uniquement lorsque vous le décidez."
      },
      {
        question: "Puis-je créer et partager mon propre compagnon ?",
        answer:
          "Oui. Créez votre compagnon, gardez-le privé ou choisissez Partager par lien pour générer un lien copiable. Les compagnons partagés n’apparaissent pas dans un répertoire public."
      }
    ]
  },
  DE: {
    eyebrow: "FAQ",
    title: "Bevor du beginnst",
    description: "Häufig gestellte Fragen.",
    items: [
      {
        question: "Was ist EverBond?",
        answer:
          "EverBond ist eine private, uneingeschränkte KI-Begleiter-Plattform für Romantik, Rollenspiel und emotionale Kontinuität. Begleiter erinnern sich an dich, deine Geschichte und eure Beziehung. Du kannst einen Begleiter auswählen oder sofort deinen eigenen erstellen."
      },
      {
        question: "Sind Chats privat?",
        answer:
          "Ja. EverBond ist auf vollständig private Chats ausgelegt."
      },
      {
        question: "Was ist Ever Memory™?",
        answer:
          "Mit Ever Memory™ können Begleiter sich an deine Aussagen erinnern, damit Gespräche natürlich wachsen und dort weitergehen, wo sie aufgehört haben."
      },
      {
        question: "Muss ich bezahlen, um mit dem Chatten zu beginnen?",
        answer:
          "Nein. Du kannst EverBond kostenlos ausprobieren. Für längere Chats und alle weiteren Premium-Funktionen kannst du EverCoin nach Bedarf kaufen."
      },
      {
        question: "Kann ich ein Gespräch zurücksetzen?",
        answer:
          "Ja. Du kannst jeden Chat jederzeit zurücksetzen."
      },
      {
        question: "Hat EverBond einen NSFW-Filter?",
        answer:
          "Nein. EverBond verwendet keine Filter."
      },
      {
        question: "Was ist EverCoin?",
        answer:
          "EverCoin ist die offizielle EverBond-Währung für Sprachanrufe, Bilderstellung, Videoerstellung, Geschenke im Chat und Premium-Charakter-Chats."
      },
      {
        question: "Was ist EverShop?",
        answer:
          "EverShop ist EverBonds virtueller Shop für Outfits, Accessoires, romantische Geschenke, seltene Sammlerstücke und besondere Meilenstein-Objekte. Kaufe Artikel mit EverCoin, bewahre sie unter Meine Geschenke auf und verschenke sie im Chat für persönliche Reaktionen."
      },
      {
        question: "Gibt es Abonnements?",
        answer:
          "Nein. EverBond hat keine Abonnements und keine automatischen Verlängerungen. Kaufe EverCoin nur, wenn du es möchtest."
      },
      {
        question: "Kann ich meinen eigenen Begleiter erstellen und teilen?",
        answer:
          "Ja. Erstelle deinen eigenen Begleiter, halte ihn privat oder wähle Per Link teilen, um einen kopierbaren Link zu erzeugen. Geteilte Begleiter erscheinen nicht in einem öffentlichen Verzeichnis."
      }
    ]
  },
  JA: {
    eyebrow: "FAQ",
    title: "始める前に",
    description: "よくある質問。",
    items: [
      {
        question: "EverBondとは何ですか？",
        answer:
          "EverBondは、ロマンス、ロールプレイ、感情の継続性のために作られた、非公開で制限のないAIコンパニオン・プラットフォームです。コンパニオンはあなた、あなたの物語、二人の関係を覚えます。既存のコンパニオンを選ぶことも、すぐに自分で作ることもできます。"
      },
      {
        question: "チャットは非公開ですか？",
        answer:
          "はい。EverBondは完全にプライベートなチャットを中心に設計されています。"
      },
      {
        question: "Ever Memory™とは何ですか？",
        answer:
          "Ever Memory™により、コンパニオンはあなたの言葉を覚え、会話が自然に成長し、前回の続きから再開できます。"
      },
      {
        question: "チャットを始めるには支払いが必要ですか？",
        answer:
          "いいえ。無料で試し始められます。より長いチャットやその他すべてのプレミアム機能には、必要に応じてEverCoinを購入できます。"
      },
      {
        question: "会話をリセットできますか？",
        answer:
          "はい。どのチャットもいつでもリセットできます。"
      },
      {
        question: "EverBondにNSFWフィルターはありますか？",
        answer:
          "いいえ。EverBondはフィルターを使用しません。"
      },
      {
        question: "EverCoinとは何ですか？",
        answer:
          "EverCoinは、音声通話、画像生成、動画生成、チャット内ギフト、プレミアムキャラクターチャットに使うEverBond公式通貨です。"
      },
      {
        question: "EverShopとは何ですか？",
        answer:
          "EverShopは、衣装、アクセサリー、ロマンチックなギフト、レアなコレクション、節目の特別アイテムを扱うEverBondの仮想ショップです。EverCoinで購入し、マイギフトに保管して、チャットでコンパニオンに贈ると個人的な反応を受け取れます。"
      },
      {
        question: "サブスクリプションはありますか？",
        answer:
          "いいえ。EverBondにはサブスクリプションも自動更新もありません。EverCoinは必要なときだけ購入できます。"
      },
      {
        question: "自分のコンパニオンを作成して共有できますか？",
        answer:
          "はい。自分のコンパニオンを作り、非公開に保つか、リンク共有を選んでコピー可能なリンクを生成できます。共有したコンパニオンが公開ディレクトリに表示されることはありません。"
      }
    ]
  },
  KO: {
    eyebrow: "FAQ",
    title: "시작하기 전에",
    description: "자주 묻는 질문.",
    items: [
      {
        question: "EverBond란 무엇인가요?",
        answer:
          "EverBond는 로맨스, 역할극, 감정의 연속성을 위해 만든 비공개 제한 없는 AI 컴패니언 플랫폼입니다. 컴패니언은 사용자, 사용자의 이야기, 두 사람의 관계를 기억합니다. 기존 컴패니언을 선택하거나 즉시 직접 만들 수 있습니다."
      },
      {
        question: "채팅은 비공개인가요?",
        answer:
          "네. EverBond는 완전히 비공개인 채팅을 중심으로 설계되었습니다."
      },
      {
        question: "Ever Memory™란 무엇인가요?",
        answer:
          "Ever Memory™는 컴패니언이 사용자의 말을 기억하게 하여 대화가 자연스럽게 성장하고 이전에 멈춘 곳에서 계속되도록 합니다."
      },
      {
        question: "채팅을 시작하려면 결제해야 하나요?",
        answer:
          "아니요. 무료로 시작해 볼 수 있습니다. 더 긴 채팅과 다른 모든 프리미엄 기능에는 필요할 때 EverCoin을 구매할 수 있습니다."
      },
      {
        question: "대화를 초기화할 수 있나요?",
        answer:
          "네. 어떤 채팅이든 언제든지 초기화할 수 있습니다."
      },
      {
        question: "EverBond에 NSFW 필터가 있나요?",
        answer:
          "아니요. EverBond는 필터를 사용하지 않습니다."
      },
      {
        question: "EverCoin이란 무엇인가요?",
        answer:
          "EverCoin은 음성 통화, 이미지 생성, 영상 생성, 채팅 내 선물, 프리미엄 캐릭터 채팅에 사용하는 EverBond 공식 통화입니다."
      },
      {
        question: "EverShop이란 무엇인가요?",
        answer:
          "EverShop은 의상, 액세서리, 로맨틱한 선물, 희귀 수집품, 특별한 기념 아이템을 판매하는 EverBond 가상 상점입니다. EverCoin으로 구매해 내 선물에 보관하고 채팅에서 컴패니언에게 주면 개인적인 반응을 받을 수 있습니다."
      },
      {
        question: "구독이 있나요?",
        answer:
          "아니요. EverBond에는 구독이나 자동 갱신이 없습니다. 원할 때만 EverCoin을 구매하세요."
      },
      {
        question: "내 컴패니언을 만들고 공유할 수 있나요?",
        answer:
          "네. 직접 컴패니언을 만들고 비공개로 유지하거나 링크 공유를 선택해 복사 가능한 링크를 만들 수 있습니다. 공유된 컴패니언은 공개 디렉터리에 표시되지 않습니다."
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
                {copy.heroChips.map((chip, index) => (
                  <span
                    key={chip}
                    className={`rounded-full border px-5 py-2.5 text-sm font-bold ${
                      index === 2
                        ? "border-bond-rose bg-bond-rose text-white shadow-[0_0_28px_rgba(255,92,168,0.30)]"
                        : "border-bond-rose/35 bg-bond-rose/10 text-white"
                    }`}
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
              <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-bond-rose">
                {copy.showcaseEyebrow}
              </p>
              <h2 className="mt-4 font-display text-4xl font-bold text-white md:text-6xl">
                {copy.showcaseTitle}
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-bond-muted">
                {copy.showcaseDescription}
              </p>
            </div>

            <div className="mt-14 space-y-14 md:mt-16 md:space-y-24">
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
                    <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-bond-rose">
                      {copy.showcaseEyebrow}
                    </p>
                    <h3 className="mt-4 font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                      {feature.title}
                    </h3>
                    <p className="mt-6 text-lg leading-8 text-bond-muted">
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
                  <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-bond-rose">
                    {t("memory")}
                  </p>
                  <h2 className="mt-4 font-display text-4xl font-bold text-white md:text-6xl">
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

                  <p className="mt-7 text-base font-semibold leading-7 text-white/90">
                    {t("bondDoesNotResetDescription")}
                  </p>
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
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-bond-muted">
                {copy.depthDescription}
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-2 xl:grid-cols-3">
              {copy.depthCards.slice(1).map((card) => (
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

              <Link
                href="/coins"
                className="bond-pink-button relative mt-9 inline-flex rounded-full bg-bond-rose px-8 py-3.5 text-sm font-extrabold text-white shadow-[0_0_30px_rgba(255,92,168,0.30)]"
              >
                {copy.secondaryCta}
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-white/5 py-16 md:py-24">
          <div className="bond-container">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-bond-rose">
                {copy.differenceEyebrow}
              </p>
              <h2 className="mt-4 font-display text-4xl font-bold text-white md:text-6xl">
                {copy.differenceTitle}
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-bond-muted">
                {copy.differenceDescription}
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-6xl gap-4 lg:grid-cols-5">
              {copy.differenceItems.map((item) => (
                <article
                  key={item.label}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5 text-center transition hover:border-bond-rose/35 hover:bg-bond-rose/[0.04]"
                >
                  <p className="text-xs font-extrabold tracking-[0.22em] text-bond-rose">
                    {item.label}
                  </p>
                  <h3 className="mt-4 font-display text-xl font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-bond-muted">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mx-auto mt-16 max-w-5xl rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,92,168,0.10),rgba(120,60,255,0.08))] p-8 text-center md:p-12">
              <h2 className="font-display text-3xl font-bold text-white md:text-5xl">
                {copy.ctaTitle}
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-bond-muted">
                {copy.ctaDescription}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/characters"
                  className="bond-pink-button rounded-full bg-bond-rose px-7 py-3.5 text-sm font-extrabold text-white"
                >
                  {copy.primaryCta}
                </Link>
                <Link
                  href="/coins"
                  className="rounded-full border border-bond-rose/50 bg-black/30 px-7 py-3.5 text-sm font-extrabold text-white transition hover:bg-bond-rose/10"
                >
                  {copy.secondaryCta}
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
