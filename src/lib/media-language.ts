import type { LanguageCode } from "@/lib/site-language";

export type MediaCopy = {
  callCharacter: (name: string) => string;
  imageGallery: (name: string) => string;
  galleryTitle: (name: string) => string;
  gallerySubtitle: string;
  describeImage: string;
  generateImage: string;
  generating: string;
  imageLimit: string;
  setAsChatImage: string;
  activeChatImage: string;
  deleteImage: string;
  emptyGallery: string;
  insufficientCoins: string;
  buyEverCoin: string;
  hangUp: string;
  tapToSpeak: string;
  stopSpeaking: string;
  listening: string;
  thinking: string;
  speaking: string;
  callEnded: string;
  microphoneDenied: string;
  voiceNotConfigured: string;
  mediaError: string;
};

export const MEDIA_COPY: Record<LanguageCode, MediaCopy> = {
  EN: {
    callCharacter: (name) => `Call ${name}`,
    imageGallery: (name) => `${name} Image Gallery`,
    galleryTitle: (name) => `${name} Image Gallery`,
    gallerySubtitle:
      "Create up to five private images. Only you can see them.",
    describeImage: "Describe exactly how you want the character to look...",
    generateImage: "Generate Image",
    generating: "Generating image...",
    imageLimit: "5 images maximum per character",
    setAsChatImage: "Use in my chat",
    activeChatImage: "Current chat image",
    deleteImage: "Delete",
    emptyGallery: "Your private gallery is empty.",
    insufficientCoins: "You do not have enough EverCoin for this request",
    buyEverCoin: "Buy EverCoin",
    hangUp: "Hang Up",
    tapToSpeak: "Tap to speak",
    stopSpeaking: "Tap when finished",
    listening: "Listening...",
    thinking: "Thinking...",
    speaking: "Speaking...",
    callEnded: "Call ended",
    microphoneDenied: "Microphone access is required for voice calls.",
    voiceNotConfigured: "This character's voice is not configured yet.",
    mediaError: "This request could not be completed."
  },
  ES: {
    callCharacter: (name) => `Llamar a ${name}`,
    imageGallery: (name) => `Galería de imágenes de ${name}`,
    galleryTitle: (name) => `Galería de imágenes de ${name}`,
    gallerySubtitle:
      "Crea hasta cinco imágenes privadas. Solo tú puedes verlas.",
    describeImage: "Describe exactamente cómo quieres que se vea el personaje...",
    generateImage: "Generar imagen",
    generating: "Generando imagen...",
    imageLimit: "Máximo 5 imágenes por personaje",
    setAsChatImage: "Usar en mi chat",
    activeChatImage: "Imagen actual del chat",
    deleteImage: "Eliminar",
    emptyGallery: "Tu galería privada está vacía.",
    insufficientCoins: "No tienes suficiente EverCoin para esta solicitud",
    buyEverCoin: "Comprar EverCoin",
    hangUp: "Colgar",
    tapToSpeak: "Toca para hablar",
    stopSpeaking: "Toca al terminar",
    listening: "Escuchando...",
    thinking: "Pensando...",
    speaking: "Hablando...",
    callEnded: "Llamada finalizada",
    microphoneDenied: "Se necesita acceso al micrófono para las llamadas de voz.",
    voiceNotConfigured: "La voz de este personaje aún no está configurada.",
    mediaError: "No se pudo completar esta solicitud."
  },
  FR: {
    callCharacter: (name) => `Appeler ${name}`,
    imageGallery: (name) => `Galerie d’images de ${name}`,
    galleryTitle: (name) => `Galerie d’images de ${name}`,
    gallerySubtitle:
      "Créez jusqu’à cinq images privées. Vous seul pouvez les voir.",
    describeImage: "Décrivez exactement l’apparence souhaitée du personnage...",
    generateImage: "Générer l’image",
    generating: "Génération de l’image...",
    imageLimit: "5 images maximum par personnage",
    setAsChatImage: "Utiliser dans mon chat",
    activeChatImage: "Image actuelle du chat",
    deleteImage: "Supprimer",
    emptyGallery: "Votre galerie privée est vide.",
    insufficientCoins: "Vous n’avez pas assez d’EverCoin pour cette demande",
    buyEverCoin: "Acheter des EverCoin",
    hangUp: "Raccrocher",
    tapToSpeak: "Touchez pour parler",
    stopSpeaking: "Touchez lorsque vous avez terminé",
    listening: "Écoute...",
    thinking: "Réflexion...",
    speaking: "Parle...",
    callEnded: "Appel terminé",
    microphoneDenied: "L’accès au microphone est requis pour les appels vocaux.",
    voiceNotConfigured: "La voix de ce personnage n’est pas encore configurée.",
    mediaError: "Cette demande n’a pas pu être effectuée."
  },
  DE: {
    callCharacter: (name) => `${name} anrufen`,
    imageGallery: (name) => `${name} Bildergalerie`,
    galleryTitle: (name) => `${name} Bildergalerie`,
    gallerySubtitle:
      "Erstelle bis zu fünf private Bilder. Nur du kannst sie sehen.",
    describeImage: "Beschreibe genau, wie der Charakter aussehen soll...",
    generateImage: "Bild erstellen",
    generating: "Bild wird erstellt...",
    imageLimit: "Maximal 5 Bilder pro Charakter",
    setAsChatImage: "In meinem Chat verwenden",
    activeChatImage: "Aktuelles Chatbild",
    deleteImage: "Löschen",
    emptyGallery: "Deine private Galerie ist leer.",
    insufficientCoins: "Du hast nicht genug EverCoin für diese Anfrage",
    buyEverCoin: "EverCoin kaufen",
    hangUp: "Auflegen",
    tapToSpeak: "Zum Sprechen tippen",
    stopSpeaking: "Tippen, wenn du fertig bist",
    listening: "Hört zu...",
    thinking: "Denkt nach...",
    speaking: "Spricht...",
    callEnded: "Anruf beendet",
    microphoneDenied: "Für Sprachanrufe ist Mikrofonzugriff erforderlich.",
    voiceNotConfigured: "Die Stimme dieses Charakters ist noch nicht eingerichtet.",
    mediaError: "Diese Anfrage konnte nicht abgeschlossen werden."
  },
  JA: {
    callCharacter: (name) => `${name}に電話`,
    imageGallery: (name) => `${name}の画像ギャラリー`,
    galleryTitle: (name) => `${name}の画像ギャラリー`,
    gallerySubtitle:
      "非公開画像を最大5枚作成できます。閲覧できるのはあなただけです。",
    describeImage: "キャラクターにどのような姿をしてほしいか詳しく説明してください...",
    generateImage: "画像を生成",
    generating: "画像を生成中...",
    imageLimit: "キャラクターごとに最大5枚",
    setAsChatImage: "チャットで使用",
    activeChatImage: "現在のチャット画像",
    deleteImage: "削除",
    emptyGallery: "非公開ギャラリーは空です。",
    insufficientCoins: "このリクエストに必要なEverCoinが足りません",
    buyEverCoin: "EverCoinを購入",
    hangUp: "通話終了",
    tapToSpeak: "タップして話す",
    stopSpeaking: "話し終えたらタップ",
    listening: "聞いています...",
    thinking: "考えています...",
    speaking: "話しています...",
    callEnded: "通話が終了しました",
    microphoneDenied: "音声通話にはマイクへのアクセスが必要です。",
    voiceNotConfigured: "このキャラクターの音声はまだ設定されていません。",
    mediaError: "リクエストを完了できませんでした。"
  },
  KO: {
    callCharacter: (name) => `${name}에게 전화`,
    imageGallery: (name) => `${name} 이미지 갤러리`,
    galleryTitle: (name) => `${name} 이미지 갤러리`,
    gallerySubtitle:
      "비공개 이미지를 최대 5장 만들 수 있습니다. 본인만 볼 수 있습니다.",
    describeImage: "캐릭터가 어떻게 보이길 원하는지 정확히 설명하세요...",
    generateImage: "이미지 생성",
    generating: "이미지 생성 중...",
    imageLimit: "캐릭터당 최대 5장",
    setAsChatImage: "내 채팅에서 사용",
    activeChatImage: "현재 채팅 이미지",
    deleteImage: "삭제",
    emptyGallery: "비공개 갤러리가 비어 있습니다.",
    insufficientCoins: "이 요청에 필요한 EverCoin이 부족합니다",
    buyEverCoin: "EverCoin 구매",
    hangUp: "통화 종료",
    tapToSpeak: "탭하여 말하기",
    stopSpeaking: "말이 끝나면 탭",
    listening: "듣는 중...",
    thinking: "생각하는 중...",
    speaking: "말하는 중...",
    callEnded: "통화 종료",
    microphoneDenied: "음성 통화에는 마이크 권한이 필요합니다.",
    voiceNotConfigured: "이 캐릭터의 음성이 아직 설정되지 않았습니다.",
    mediaError: "요청을 완료하지 못했습니다."
  }
};
