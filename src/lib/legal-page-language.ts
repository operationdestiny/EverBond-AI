import type { LanguageCode } from "@/lib/site-language";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type LegalPageCopy = {
  label: string;
  title: string;
  intro: string;
  effectiveDate: string;
  contents: string;
  controllingLanguage: string;
  sections: LegalSection[];
};

const ENGLISH_SECTIONS: LegalSection[] = [
  {
    "id": "terms",
    "title": "Terms of Use",
    "paragraphs": [
      "EverBond provides fictional AI companion chat, Ever Memory™, character creation, private and share-by-link characters, AI image and video generation, voice-based live calls, gifts, galleries, and related digital features for entertainment, creative storytelling, romance, and roleplay.",
      "You must be at least 18 years old and legally permitted to access adult content where you live. EverBond is not directed to minors. You may not create, request, upload, generate, or share sexualized content involving anyone under 18 or presented as under 18.",
      "By accessing EverBond, creating an account, purchasing EverCoin, or using any feature, you agree to these terms and all incorporated policies. If you do not agree, do not use the service.",
      "EverBond uses one-time EverCoin purchases rather than subscriptions. Features, providers, models, limits, prices, and availability may change. Material changes will be posted on the service, and continued use after the effective date means you accept the revised terms.",
      "EverBond may suspend or terminate access, remove content, preserve records, or restrict features when reasonably necessary to enforce these terms, protect users or the service, respond to legal process, investigate abuse, or comply with law."
    ]
  },
  {
    "id": "privacy",
    "title": "Privacy Policy",
    "paragraphs": [
      "Private means chats and user-created characters are not publicly listed or exposed to other users by default. It does not mean that data is never processed by EverBond systems, hosting providers, AI providers, storage providers, payment processors, security services, or authorities when legally required.",
      "EverBond may collect account and authentication data; device or session identifiers; purchase, EverCoin, and transaction records; chats, character profiles, Ever Memory™ data, prompts, reference images, generated images and videos; voice-call audio, transcripts, replies, and technical usage data; support communications; and security, error, and abuse-prevention logs.",
      "This information is used to operate accounts, generate responses and media, maintain continuity and memory, process purchases, provide voice calls, store private galleries, prevent fraud and abuse, secure the service, troubleshoot failures, comply with law, and improve reliability.",
      "Prompts, reference images, audio, transcripts, and related content may be sent to contracted service providers solely to provide the requested feature. Payment details are processed by the payment provider; EverBond does not need to store full payment-card numbers.",
      "EverBond does not sell personal information and does not share personal information for cross-context behavioral advertising. Share-by-link characters are disclosed only at the user’s direction, but anyone who receives a link may open or forward it.",
      "Data is retained only as reasonably necessary for the service, security, accounting, dispute resolution, and legal obligations. Generated media and account content may remain until deleted by the user or account deletion, subject to backups, fraud records, transaction records, pending disputes, and legal retention requirements. Voice audio may be stored temporarily to deliver a call and may be removed after calls end or during routine cleanup.",
      "Depending on location, users may have rights to access, correct, delete, restrict, object to, or receive a portable copy of personal data. Requests may be submitted through the account tools or the support contact. EverBond may verify identity and may retain information where legally permitted or required.",
      "EverBond uses reasonable administrative, technical, and organizational safeguards, but no service can guarantee absolute security. Data may be processed in countries other than the user’s country, subject to applicable safeguards and law."
    ]
  },
  {
    "id": "safety",
    "title": "Safety Policy",
    "paragraphs": [
      "EverBond permits fictional adult romance, consensual adult roleplay, mature storytelling, and lawful adult creative expression. Unrestricted or uncensored does not mean illegal, exploitative, non-consensual, or consequence-free.",
      "Prohibited content and conduct include child sexual abuse material or sexualized minors; grooming or exploitation; non-consensual intimate imagery; sexual deepfakes or impersonation of real people without permission; trafficking; credible threats; instructions for serious wrongdoing; terrorism support; doxxing; stalking; fraud; malware; unlawful weapons activity; and content that infringes intellectual-property, privacy, publicity, or other rights.",
      "All characters used in adult or sexual contexts must be fictional adults. Age-ambiguous characters, school-age framing, or attempts to evade this rule may be removed or blocked.",
      "EverBond does not routinely pre-review private or share-by-link characters. However, private or link-shared status does not exempt content from these rules. EverBond may investigate reports, automated signals, payment abuse, legal notices, or provider failures and may remove content or accounts without creating any duty to monitor all content.",
      "EverBond is not therapy, medical care, legal advice, financial advice, emergency service, or crisis support."
    ]
  },
  {
    "id": "ai-disclaimer",
    "title": "AI Disclaimer",
    "paragraphs": [
      "Companions, messages, memories, images, videos, and voices are generated or transformed by artificial-intelligence systems. They are fictional, may be inaccurate, inconsistent, unexpected, delayed, unavailable, or similar to other material, and must not be treated as statements from a real person.",
      "Ever Memory™ is an automated continuity system. It may omit, summarize, misinterpret, or retain details imperfectly. Users can reset conversations, edit or delete characters, and use available account-deletion tools.",
      "The current live uncensored voice video call experience is voice-based and displayed in a video-call-style companion interface using character artwork. It is not a live camera feed, a real human call, or real-time generated character video.",
      "Third-party AI and infrastructure providers may impose technical, safety, regional, capacity, or availability limits. EverBond does not guarantee that every prompt will be accepted or that every output will match the request."
    ]
  },
  {
    "id": "user-responsibility",
    "title": "User Responsibility",
    "paragraphs": [
      "Users are solely responsible for their messages, prompts, uploads, reference images, character profiles, generated outputs, shared links, gift selections, and use or distribution of content.",
      "A share-by-link character is not publicly listed by EverBond, but it is accessible to anyone who obtains the link. Recipients may copy, save, or forward the link. Users are responsible for choosing recipients, protecting links, obtaining all necessary permissions, and removing or changing access when needed.",
      "User-created or link-shared characters are user content. They are not created, reviewed, approved, endorsed, sponsored, or adopted by EverBond merely because the platform stores or processes them. EverBond is not responsible for promises, representations, transactions, disputes, or harm arising from a user’s character or distribution of a link.",
      "Users must not rely on companions for medical, legal, financial, safety-critical, identity-verification, or emergency decisions. Users remain responsible for real-world conduct and compliance with applicable law."
    ]
  },
  {
    "id": "content-ownership",
    "title": "Content Ownership",
    "paragraphs": [
      "Users retain whatever rights they lawfully hold in their messages, uploaded materials, reference images, and original character-profile content. Users represent that they have all rights and permissions needed to submit and share that content.",
      "Users grant EverBond and its service providers a worldwide, non-exclusive, limited license to host, store, reproduce, transmit, transform, generate from, display, and otherwise process user content only as reasonably necessary to operate, secure, improve, and provide the requested service, including display to people intentionally given a share link.",
      "As between the user and EverBond, EverBond does not claim ownership of user-specific AI outputs merely because they were generated through the service. AI outputs may not qualify for copyright, may not be exclusive, and may resemble outputs generated for others. Any use is subject to applicable law, third-party rights, and provider terms.",
      "EverBond retains all rights in its software, interfaces, branding, official characters, site content, curated catalogs, Ever Memory™, EverCoin, EverShop, databases, and other platform intellectual property. No rights in the platform are transferred except the limited right to use the service under these terms."
    ]
  },
  {
    "id": "copyright-impersonation",
    "title": "Copyright & Impersonation",
    "paragraphs": [
      "Users may not upload, generate, create, or share content that infringes copyright, trademark, publicity, privacy, or other rights. Users may not create a character that impersonates a real person, uses a real person’s likeness or voice without permission, falsely suggests endorsement, or is designed to deceive others about identity.",
      "Private or share-by-link status does not make infringement or impersonation lawful. Users are responsible for reference images, names, biographies, voices, trademarks, costumes, and other source material used to create characters or media.",
      "EverBond may disable access, remove material, preserve evidence, suspend repeat infringers, or terminate accounts in response to valid notices, court orders, provider requirements, or a reasonable belief that rights are being violated."
    ]
  },
  {
    "id": "ai-image-generation-similarity",
    "title": "AI Image Generation & Similarity Notice",
    "paragraphs": [
      "Image and video features may use a user-selected character image or uploaded image as an identity reference and combine it with a prompt to create a new synthetic composition, pose, outfit, angle, background, motion, or scene.",
      "Users must own the reference image or have permission from every person and rights holder needed for its use. Do not submit private images of another person, real-person intimate imagery, copyrighted material, or a likeness or voice that you are not authorized to use.",
      "Generative systems may produce unexpected similarities to real people, fictional characters, artworks, brands, or other outputs. EverBond does not guarantee originality, non-infringement, exact identity consistency, or suitability for publication or commercial use.",
      "Generated media is synthetic and is not proof that a depicted event occurred. EverBond does not use generated media for biometric identification. EverBond may remove media or block generation when required by law, a rights complaint, provider policy, or these terms."
    ]
  },
  {
    "id": "dmca-takedown",
    "title": "DMCA / Takedown Procedure",
    "paragraphs": [
      "A copyright owner or authorized agent may send a takedown notice through the legal or support contact listed below. The notice should identify the copyrighted work, identify and locate the allegedly infringing material, provide contact information, include a good-faith statement, include a statement under penalty of perjury that the notice is accurate and the sender is authorized, and include a physical or electronic signature.",
      "EverBond may remove or disable material while reviewing a notice and may notify the affected user. A user may submit a counter-notice containing the information required by applicable law. EverBond may restore material when legally permitted and may terminate repeat infringers.",
      "Impersonation, privacy, publicity, non-consensual intimate imagery, and other rights complaints may use the same contact even when the DMCA does not apply.",
      "A website notice alone does not create DMCA safe-harbor protection. The EverBond operator must separately register and keep current a designated DMCA agent with the U.S. Copyright Office and publish the required agent details."
    ]
  },
  {
    "id": "arbitration",
    "title": "Arbitration Agreement",
    "paragraphs": [
      "Before filing a claim, the user and EverBond agree to send written notice describing the dispute and requested resolution and to attempt informal resolution for at least 30 days.",
      "Except for eligible small-claims matters and requests for temporary or injunctive relief involving intellectual property, privacy, account security, or misuse of the service, disputes will be resolved by binding individual arbitration under the Federal Arbitration Act and the American Arbitration Association Consumer Arbitration Rules, unless applicable law requires otherwise.",
      "Arbitration may be conducted remotely or in the user’s county of residence. Claims must be brought individually. Class, collective, consolidated, representative, and private-attorney-general proceedings are waived to the fullest extent permitted by law.",
      "A user may opt out of arbitration by sending written notice to the legal contact within 30 days after first accepting these terms. The notice must include the user’s name, account email, and a clear statement that the user opts out of arbitration. Opting out does not affect access to EverBond.",
      "If any portion of this section is unenforceable, the remainder remains effective to the fullest extent permitted by law."
    ]
  },
  {
    "id": "limitation-of-liability",
    "title": "Limitation of Liability",
    "paragraphs": [
      "EverBond is provided as-is and as-available. To the fullest extent permitted by law, EverBond disclaims implied warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, uninterrupted availability, and fitness of AI output.",
      "EverBond is not liable for user-created or share-by-link characters; recipient conduct; loss or forwarding of a share link; AI errors; provider refusals or outages; lost data; emotional reactions; relationship outcomes; reliance on fictional content; unauthorized use of user content; or indirect, incidental, special, consequential, exemplary, or punitive damages.",
      "To the fullest extent permitted by law, EverBond’s aggregate liability arising from the service will not exceed the amount the claimant paid to EverBond during the 12 months before the event giving rise to the claim. Some jurisdictions do not allow certain exclusions, so those exclusions apply only to the extent permitted."
    ]
  },
  {
    "id": "indemnification",
    "title": "Indemnification",
    "paragraphs": [
      "To the extent permitted by law, users agree to defend, indemnify, and hold harmless EverBond, its operator, owners, affiliates, contractors, providers, employees, and agents from claims, losses, liabilities, damages, judgments, and reasonable legal fees arising from user content; reference images; generated media; shared links; infringement or impersonation; violation of law or these terms; or misuse of the service.",
      "EverBond may control the defense of a covered claim, and the user agrees to provide reasonable cooperation. This section does not require indemnification for EverBond’s own unlawful conduct where prohibited by law."
    ]
  },
  {
    "id": "refund",
    "title": "Refund Policy",
    "paragraphs": [
      "EverBond has no recurring subscription. EverCoin is purchased in one-time digital bundles, is non-transferable, has no cash value, and may be used only for eligible EverBond features.",
      "Chat, image, voice-call, gift, and video charges are deducted when a request is reserved or delivered. Video cost may change automatically based on the current provider quote and is displayed before generation. If the user does not have enough EverCoin, the request is not submitted and the purchase prompt is shown.",
      "When a qualifying generation or processing request fails before completion, reserved EverCoin may be returned automatically. Duplicate charges, unauthorized charges, technical failures, and other refund requests are reviewed case by case, subject to payment-provider rules and mandatory consumer law.",
      "Except where required by law, used EverCoin and successfully delivered digital services are non-refundable. Chargebacks, fraud, or payment reversals may cause EverCoin removal, debt adjustment, account restriction, or suspension."
    ]
  },
  {
    "id": "contact",
    "title": "Contact",
    "paragraphs": [
      "For support, privacy requests, legal notices, arbitration opt-outs, copyright complaints, impersonation reports, and takedown requests, use the EverBond support email shown in the Help Center.",
      "Include the account email, a clear subject line, the relevant URL or character link, and enough information to investigate the request. Do not include passwords, full payment-card numbers, or unnecessary sensitive information.",
      "Formal DMCA safe-harbor eligibility also requires the operator’s legal name, physical address, telephone number, designated-agent email, and active U.S. Copyright Office registration to be publicly posted and maintained."
    ]
  }
];

const PAGE_META: Record<
  LanguageCode,
  Omit<LegalPageCopy, "sections">
> = {
  "EN": {
    "label": "EverBond Legal",
    "title": "Policies and User Information",
    "intro": "These terms govern EverBond, EverCoin, private and share-by-link companions, generated media, and live voice features.",
    "effectiveDate": "Effective August 5, 2026",
    "contents": "Table of Contents",
    "controllingLanguage": "The English version is the controlling legal version. Translations are provided for convenience."
  },
  "ES": {
    "label": "Información legal de EverBond",
    "title": "Políticas e información para usuarios",
    "intro": "Estas condiciones regulan EverBond, EverCoin, los personajes privados o compartidos por enlace, los medios generados y las llamadas de voz.",
    "effectiveDate": "Vigente desde el 5 de agosto de 2026",
    "contents": "Índice",
    "controllingLanguage": "La versión inglesa es la versión legal que prevalece. Las traducciones se ofrecen por comodidad."
  },
  "FR": {
    "label": "Informations juridiques EverBond",
    "title": "Politiques et informations utilisateur",
    "intro": "Ces conditions régissent EverBond, EverCoin, les compagnons privés ou partagés par lien, les médias générés et les appels vocaux.",
    "effectiveDate": "En vigueur le 5 août 2026",
    "contents": "Table des matières",
    "controllingLanguage": "La version anglaise constitue la version juridique de référence. Les traductions sont fournies à titre pratique."
  },
  "DE": {
    "label": "EverBond Rechtliches",
    "title": "Richtlinien und Benutzerinformationen",
    "intro": "Diese Bedingungen gelten für EverBond, EverCoin, private oder per Link geteilte Begleiter, generierte Medien und Sprachanrufe.",
    "effectiveDate": "Gültig ab 5. August 2026",
    "contents": "Inhaltsverzeichnis",
    "controllingLanguage": "Die englische Fassung ist die maßgebliche Rechtsfassung. Übersetzungen dienen nur der besseren Verständlichkeit."
  },
  "JA": {
    "label": "EverBond法的情報",
    "title": "ポリシーとユーザー情報",
    "intro": "本規約は、EverBond、EverCoin、非公開またはリンク共有のコンパニオン、生成メディア、音声通話に適用されます。",
    "effectiveDate": "2026年8月5日施行",
    "contents": "目次",
    "controllingLanguage": "英語版が正式な法的文書です。翻訳は便宜のために提供されます。"
  },
  "KO": {
    "label": "EverBond 법률 정보",
    "title": "정책 및 사용자 정보",
    "intro": "본 약관은 EverBond, EverCoin, 비공개 또는 링크 공유 컴패니언, 생성 미디어, 음성 통화에 적용됩니다.",
    "effectiveDate": "2026년 8월 5일 시행",
    "contents": "목차",
    "controllingLanguage": "영문본이 우선하는 법적 문서입니다. 번역은 편의를 위해 제공됩니다."
  }
};

const LOCALIZED_TITLES: Partial<
  Record<LanguageCode, Record<string, string>>
> = {
  "ES": {
    "terms": "Condiciones de uso",
    "privacy": "Política de privacidad",
    "safety": "Política de seguridad",
    "ai-disclaimer": "Aviso sobre IA",
    "user-responsibility": "Responsabilidad del usuario",
    "content-ownership": "Propiedad del contenido",
    "copyright-impersonation": "Derechos de autor y suplantación",
    "ai-image-generation-similarity": "Generación de imágenes y aviso de similitud",
    "dmca-takedown": "Procedimiento DMCA / retirada",
    "arbitration": "Acuerdo de arbitraje",
    "limitation-of-liability": "Limitación de responsabilidad",
    "indemnification": "Indemnización",
    "refund": "Política de reembolso",
    "contact": "Contacto"
  },
  "FR": {
    "terms": "Conditions d’utilisation",
    "privacy": "Politique de confidentialité",
    "safety": "Politique de sécurité",
    "ai-disclaimer": "Avertissement relatif à l’IA",
    "user-responsibility": "Responsabilité de l’utilisateur",
    "content-ownership": "Propriété du contenu",
    "copyright-impersonation": "Droit d’auteur et usurpation",
    "ai-image-generation-similarity": "Génération d’images et avis de ressemblance",
    "dmca-takedown": "Procédure DMCA / retrait",
    "arbitration": "Convention d’arbitrage",
    "limitation-of-liability": "Limitation de responsabilité",
    "indemnification": "Indemnisation",
    "refund": "Politique de remboursement",
    "contact": "Contact"
  },
  "DE": {
    "terms": "Nutzungsbedingungen",
    "privacy": "Datenschutzerklärung",
    "safety": "Sicherheitsrichtlinie",
    "ai-disclaimer": "KI-Hinweis",
    "user-responsibility": "Verantwortung des Benutzers",
    "content-ownership": "Inhaltseigentum",
    "copyright-impersonation": "Urheberrecht und Identitätsnachahmung",
    "ai-image-generation-similarity": "KI-Bilderstellung und Ähnlichkeitshinweis",
    "dmca-takedown": "DMCA- / Entfernungsverfahren",
    "arbitration": "Schiedsvereinbarung",
    "limitation-of-liability": "Haftungsbeschränkung",
    "indemnification": "Freistellung",
    "refund": "Rückerstattungsrichtlinie",
    "contact": "Kontakt"
  },
  "JA": {
    "terms": "利用規約",
    "privacy": "プライバシーポリシー",
    "safety": "安全ポリシー",
    "ai-disclaimer": "AI免責事項",
    "user-responsibility": "ユーザーの責任",
    "content-ownership": "コンテンツの権利",
    "copyright-impersonation": "著作権と本人なりすまし",
    "ai-image-generation-similarity": "AI画像生成と類似性に関する通知",
    "dmca-takedown": "DMCA・削除手続",
    "arbitration": "仲裁合意",
    "limitation-of-liability": "責任の制限",
    "indemnification": "補償",
    "refund": "返金ポリシー",
    "contact": "連絡先"
  },
  "KO": {
    "terms": "이용약관",
    "privacy": "개인정보 처리방침",
    "safety": "안전 정책",
    "ai-disclaimer": "AI 면책조항",
    "user-responsibility": "사용자 책임",
    "content-ownership": "콘텐츠 소유권",
    "copyright-impersonation": "저작권 및 사칭",
    "ai-image-generation-similarity": "AI 이미지 생성 및 유사성 고지",
    "dmca-takedown": "DMCA / 삭제 절차",
    "arbitration": "중재 합의",
    "limitation-of-liability": "책임 제한",
    "indemnification": "면책 및 배상",
    "refund": "환불 정책",
    "contact": "연락처"
  }
};

function sectionsFor(language: LanguageCode): LegalSection[] {
  return ENGLISH_SECTIONS.map((section) => ({
    ...section,
    title:
      LOCALIZED_TITLES[language]?.[section.id] ??
      section.title,
    paragraphs: [...section.paragraphs]
  }));
}

export const LEGAL_PAGE_COPY: Record<LanguageCode, LegalPageCopy> = {
  EN: { ...PAGE_META.EN, sections: sectionsFor("EN") },
  ES: { ...PAGE_META.ES, sections: sectionsFor("ES") },
  FR: { ...PAGE_META.FR, sections: sectionsFor("FR") },
  DE: { ...PAGE_META.DE, sections: sectionsFor("DE") },
  JA: { ...PAGE_META.JA, sections: sectionsFor("JA") },
  KO: { ...PAGE_META.KO, sections: sectionsFor("KO") }
};
