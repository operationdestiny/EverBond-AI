import type { LanguageCode } from "@/lib/site-language";

export const DISCOVER_COPY: Record<
  LanguageCode,
  {
    loading: string;
    bannerLabel: string;
    translatingCharacters: string;
  }
> = {
  EN: {
    loading: "Loading…",
    bannerLabel: "EverBond Discover banner",
    translatingCharacters: "Translating companions…"
  },
  ES: {
    loading: "Cargando…",
    bannerLabel: "Banner Descubrir de EverBond",
    translatingCharacters: "Traduciendo compañeros…"
  },
  FR: {
    loading: "Chargement…",
    bannerLabel: "Bannière Découvrir d’EverBond",
    translatingCharacters: "Traduction des compagnons…"
  },
  DE: {
    loading: "Wird geladen…",
    bannerLabel: "EverBond-Entdecken-Banner",
    translatingCharacters: "Begleiter werden übersetzt…"
  },
  JA: {
    loading: "読み込み中…",
    bannerLabel: "EverBondのディスカバリーバナー",
    translatingCharacters: "コンパニオンを翻訳中…"
  },
  KO: {
    loading: "불러오는 중…",
    bannerLabel: "EverBond 둘러보기 배너",
    translatingCharacters: "컴패니언 번역 중…"
  }
};
