export type CharacterCardData = {
  name: string;
  personality: string;
  tone: string;
  speechStyle: string;
  motivations: string;
  boundaries: string;
  relationshipStyle: string;
  worldContext: string;
  exampleDialogue: string[];
};

export type CharacterVisibility = "public" | "private";
export type CharacterCategory = "everbond-girls" | "anime-fantasy" | "everbond-guys" | "public-creations";

export type Character = {
  id: string;
  name: string;
  slug: string;
  archetype: string;
  category?: CharacterCategory;
  gender?: "female" | "male" | "neutral";
  voiceGender?: "female" | "male" | "neutral";
  image: string;
  imageFile?: string;
  tagline: string;
  description: string;
  openingMessage: string;
  tags: string[];
  visibility?: CharacterVisibility;
  official?: boolean;
  viewCount?: string | null;
  creatorUsername?: string;
  createdAt?: "today" | "older";
  relationshipContext?: string;
  aiProfile?: Record<string, unknown>;
  featureFlags?: Record<string, unknown>;
  generatedSeo?: Record<string, unknown>;
  card: CharacterCardData;
};
