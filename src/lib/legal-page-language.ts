import type { LanguageCode } from "@/lib/site-language";

export type LegalEmailParagraph = {
  prefix: string;
  email: string;
};

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  emailParagraph?: LegalEmailParagraph;
};

export type DmcaAgentCopy = {
  title: string;
  department: string;
  organization: string;
  addressLine1: string;
  addressLine2: string;
  phoneLabel: string;
  phone: string;
  emailLabel: string;
  email: string;
};

export type LegalPageCopy = {
  label: string;
  title: string;
  contents: string;
  controllingLanguage: string;
  sections: LegalSection[];
  dmcaAgent: DmcaAgentCopy;
};

export const LEGAL_PAGE_COPY: Record<
  LanguageCode,
  LegalPageCopy
> = {
  "EN": {
    "label": "EverBond Legal",
    "title": "Policies and User Information",
    "contents": "Table of Contents",
    "controllingLanguage": "The English version is the controlling legal version. Translations are provided for convenience.",
    "sections": [
      {
        "id": "terms",
        "title": "Terms of Use",
        "paragraphs": [
          "EverBond provides fictional romantic AI companion chat, Ever Memory™, character creation, private and share-by-link characters, AI image and video generation, voice-based live calls, gifts, galleries, and related digital features for entertainment, creative storytelling, romance, and roleplay.",
          "You must be at least 18 years old and legally permitted to access adult content where you live. EverBond is not directed to minors. You may not create, request, upload, generate, or share sexualized content involving anyone under 18 or presented as under 18.",
          "By accessing EverBond, creating an account, purchasing EverCoin, or using any feature, you agree to these terms and all incorporated policies. If you do not agree, do not use the service.",
          "EverBond uses one-time EverCoin purchases rather than subscriptions. Features, providers, models, limits, prices, and availability may change. Material changes may be posted on the service, and continued use after the effective date means you accept the revised terms.",
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
          "EverBond does not routinely pre-review private or share-by-link characters. However, private or link-shared status does not exempt content from these rules. EverBond may investigate reports, payment abuse, legal notices, or provider failures and may remove content or accounts without creating any duty to monitor all content.",
          "EverBond may restrict features, suspend access, or close accounts at its discretion and is not required to provide advance notice or a specific reason when doing so. EverBond is not therapy, medical care, legal advice, financial advice, emergency service, or crisis support."
        ]
      },
      {
        "id": "ai-disclaimer",
        "title": "AI Disclaimer",
        "paragraphs": [
          "Companions, messages, memories, images, videos, and voices are generated or transformed by artificial-intelligence systems. They are fictional, may be inaccurate, inconsistent, unexpected, delayed, unavailable, or similar to other material, and must not be treated as statements from a real person.",
          "Ever Memory™ is an automated continuity system. It may omit, summarize, misinterpret, or retain details imperfectly. Users can reset conversations, edit or delete their characters, and use available account-deletion tools.",
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
          "Users grant EverBond and its service providers a worldwide, non-exclusive, limited license to host, store, reproduce, transmit, transform, generate from, display, and otherwise process user content only as reasonably necessary to operate, secure, improve, and provide the requested service, including display to people given a share link.",
          "As between the user and EverBond, EverBond does not claim ownership of user-specific AI outputs merely because they were generated through the service. AI outputs may not qualify for copyright, may not be exclusive, and may resemble outputs generated for others. Any use is subject to applicable law, third-party rights, and provider terms.",
          "EverBond retains all rights in its software, interfaces, branding, official characters, site content, curated catalogs, Ever Memory™, EverCoin™, EverShop™, databases, and other platform intellectual property. No rights in the platform are transferred except the limited right to use the service under these terms."
        ]
      },
      {
        "id": "copyright-impersonation",
        "title": "Copyright & Impersonation",
        "paragraphs": [
          "Users may not upload, generate, create, or share content that infringes copyright, trademark, publicity, privacy, or other rights. Users may not create a character that impersonates a real person, uses a real person’s likeness without permission, falsely suggests endorsement, or is designed to deceive others about identity.",
          "Private or share-by-link status does not make infringement or impersonation lawful. Users are responsible for reference images, names, biographies, trademarks, costumes, and other source material used to create characters or media.",
          "EverBond may disable access, remove material, preserve evidence, suspend repeat infringers, or terminate accounts in response to valid notices, court orders, provider requirements, or a reasonable belief that rights are being violated."
        ]
      },
      {
        "id": "ai-image-generation-similarity",
        "title": "AI Image Generation & Similarity Notice",
        "paragraphs": [
          "Image and video features may use a user-selected character image or uploaded image as an identity reference and combine it with a prompt to create a new synthetic composition, pose, outfit, angle, background, motion, or scene.",
          "Users must own the reference image or have permission from every person and rights holder needed for its use. Do not submit private images of another real person, real-person intimate imagery, copyrighted material, or a likeness that you are not authorized to use.",
          "Generative systems may produce unexpected similarities to real people, fictional characters, artworks, brands, or other outputs. EverBond does not guarantee originality, non-infringement, exact identity consistency, or suitability for publication or commercial use.",
          "Generated media is synthetic and is not proof that a depicted event occurred. EverBond does not use generated media for biometric identification. EverBond may remove media or block generation when required by law, a rights complaint, provider policy, or these terms.",
          "EverBond’s official character images are synthetic outputs created using licensed remix-based AI platforms and are not based on any specific real person. Any resemblance to real individuals or user-uploaded photos from external platforms is coincidental and does not grant any rights or claims over EverBond’s characters."
        ]
      },
      {
        "id": "section-2257",
        "title": "18 U.S.C. §§ 2257 and 2257A Notice",
        "paragraphs": [
          "EverBond does not hire, film, photograph, or direct real performers to create sexually explicit content. EverBond’s official companion imagery is generated by artificial-intelligence systems.",
          "Users may submit prompts, permitted reference images, or other user content. Those submissions remain subject to EverBond’s Safety Policy, User Responsibility, Copyright & Impersonation, and AI Image Generation & Similarity Notice.",
          "To the extent a visual depiction is wholly computer-generated and does not depict an actual human being engaged in actual or simulated sexually explicit conduct, EverBond understands the recordkeeping and labeling requirements of 18 U.S.C. §§ 2257 and 2257A not to apply to that depiction. This notice is not a representation that every item of user-submitted content is synthetic or exempt."
        ],
        "emailParagraph": {
          "prefix": "Questions regarding this notice may be sent to:",
          "email": "support@everbond.ai"
        }
      },
      {
        "id": "dmca-takedown",
        "title": "DMCA / Takedown Procedure",
        "paragraphs": [
          "A copyright owner or authorized agent may send a takedown notice through the legal or support contact listed below. The notice should identify the copyrighted work, identify and locate the allegedly infringing material, provide contact information, include a good-faith statement, include a statement under penalty of perjury that the notice is accurate and the sender is authorized, and include a physical or electronic signature.",
          "EverBond may remove or disable material while reviewing a notice and may notify the affected user. A user may submit a counter-notice containing the information required by applicable law. EverBond may restore material when legally permitted and may terminate repeat infringers.",
          "Impersonation, privacy, publicity, non-consensual intimate imagery, and other rights complaints may use the same contact even when the DMCA does not apply.",
          "EverBond maintains and reasonably implements a policy providing for the termination, in appropriate circumstances, of users who repeatedly infringe copyright or other intellectual-property rights."
        ]
      },
      {
        "id": "arbitration",
        "title": "Arbitration Agreement",
        "paragraphs": [
          "Before filing a claim, the user agrees to send written notice describing the dispute and requested resolution and to attempt informal resolution for at least 30 days.",
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
          "To the extent permitted by law, users agree to defend, indemnify, and hold harmless EverBond, its operator, owners, affiliates, contractors, providers, employees, and agents from claims, losses, liabilities, damages, judgments, and legal fees arising from user content; reference images; generated media; shared links; infringement or impersonation; violation of law or these terms; or misuse of the service.",
          "EverBond may control the defense of a covered claim, and the user agrees to provide reasonable cooperation. This section does not require indemnification for EverBond’s own unlawful conduct where prohibited by law."
        ]
      },
      {
        "id": "refund",
        "title": "Refund Policy",
        "paragraphs": [
          "EverBond has no recurring subscription. EverCoin™ is purchased in one-time digital bundles, is non-transferable, has no cash value, and may be used only for eligible EverBond features.",
          "Chat, image, voice-call, gift, and video charges are deducted when a request is reserved or delivered. When a qualifying generation or processing request fails before completion, reserved EverCoin™ may be returned automatically. Duplicate charges, unauthorized charges, technical failures, and other refund requests are reviewed case by case, subject to payment-provider rules and mandatory consumer law.",
          "Except where required by law, used EverCoin™ and successfully delivered digital services are non-refundable. Chargebacks, fraud, or payment reversals may cause EverCoin™ removal, debt adjustment, account restriction, or suspension."
        ]
      },
      {
        "id": "contact",
        "title": "Contact",
        "paragraphs": [
          "For support, privacy requests, legal notices, arbitration opt-outs, copyright complaints, impersonation reports, and takedown requests, use the EverBond support email shown in the Help Center.",
          "Include the account email, a clear subject line, the relevant URL or character link, and enough information to investigate the request. Do not include passwords, full payment-card numbers, or unnecessary sensitive information."
        ]
      }
    ],
    "dmcaAgent": {
      "title": "DMCA Designated Agent",
      "department": "Copyright Compliance Department",
      "organization": "EverBond",
      "addressLine1": "1407 Sinclair Rd Ste 207",
      "addressLine2": "Early Branch, SC 29916",
      "phoneLabel": "Phone",
      "phone": "803-903-2810",
      "emailLabel": "Email",
      "email": "support@everbond.ai"
    }
  },
  "ES": {
    "label": "Información legal de EverBond",
    "title": "Políticas e información para el usuario",
    "contents": "Índice",
    "controllingLanguage": "La versión en inglés es la versión legal que prevalece. Las traducciones se proporcionan por comodidad.",
    "sections": [
      {
        "id": "terms",
        "title": "Condiciones de uso",
        "paragraphs": [
          "EverBond ofrece chats ficticios con compañeros románticos de IA, Ever Memory™, creación de personajes, personajes privados y compartidos mediante enlace, generación de imágenes y vídeos con IA, llamadas de voz en directo, regalos, galerías y funciones digitales relacionadas para entretenimiento, narración creativa, romance y rol.",
          "Debes tener al menos 18 años y estar legalmente autorizado para acceder a contenido para adultos donde vives. EverBond no está dirigido a menores. No puedes crear, solicitar, subir, generar ni compartir contenido sexualizado que involucre a una persona menor de 18 años o presentada como menor de 18 años.",
          "Al acceder a EverBond, crear una cuenta, comprar EverCoin o utilizar cualquier función, aceptas estas condiciones y todas las políticas incorporadas. Si no estás de acuerdo, no utilices el servicio.",
          "EverBond utiliza compras únicas de EverCoin en lugar de suscripciones. Las funciones, los proveedores, los modelos, los límites, los precios y la disponibilidad pueden cambiar. Los cambios sustanciales pueden publicarse en el servicio, y el uso continuado después de la fecha de entrada en vigor significa que aceptas las condiciones revisadas.",
          "EverBond puede suspender o terminar el acceso, eliminar contenido, conservar registros o restringir funciones cuando sea razonablemente necesario para hacer cumplir estas condiciones, proteger a los usuarios o al servicio, responder a procesos legales, investigar abusos o cumplir la ley."
        ]
      },
      {
        "id": "privacy",
        "title": "Política de privacidad",
        "paragraphs": [
          "Privado significa que los chats y los personajes creados por los usuarios no se incluyen públicamente ni se exponen a otros usuarios de forma predeterminada. No significa que los sistemas de EverBond, proveedores de alojamiento, proveedores de IA, proveedores de almacenamiento, procesadores de pagos, servicios de seguridad o autoridades nunca procesen los datos cuando la ley lo exija.",
          "EverBond puede recopilar datos de cuenta y autenticación; identificadores de dispositivo o sesión; registros de compras, EverCoin y transacciones; chats, perfiles de personajes, datos de Ever Memory™, indicaciones, imágenes de referencia, imágenes y vídeos generados; audio de llamadas de voz, transcripciones, respuestas y datos técnicos de uso; comunicaciones de soporte; y registros de seguridad, errores y prevención de abusos.",
          "Esta información se utiliza para gestionar cuentas, generar respuestas y contenido multimedia, mantener la continuidad y la memoria, procesar compras, proporcionar llamadas de voz, almacenar galerías privadas, prevenir el fraude y el abuso, proteger el servicio, solucionar fallos, cumplir la ley y mejorar la fiabilidad.",
          "Las indicaciones, imágenes de referencia, audio, transcripciones y contenido relacionado pueden enviarse a proveedores de servicios contratados únicamente para proporcionar la función solicitada. Los datos de pago son procesados por el proveedor de pagos; EverBond no necesita almacenar números completos de tarjetas de pago.",
          "EverBond no vende información personal ni comparte información personal para publicidad conductual entre contextos. Los personajes compartidos mediante enlace se divulgan únicamente por decisión del usuario, pero cualquier persona que reciba un enlace puede abrirlo o reenviarlo.",
          "Los datos se conservan solo durante el tiempo razonablemente necesario para el servicio, la seguridad, la contabilidad, la resolución de disputas y las obligaciones legales. El contenido multimedia generado y el contenido de la cuenta pueden permanecer hasta que el usuario los elimine o se elimine la cuenta, con sujeción a copias de seguridad, registros de fraude, registros de transacciones, disputas pendientes y requisitos legales de conservación. El audio de voz puede almacenarse temporalmente para prestar una llamada y puede eliminarse al terminar las llamadas o durante la limpieza rutinaria.",
          "Según la ubicación, los usuarios pueden tener derechos de acceso, corrección, eliminación, restricción, oposición o a recibir una copia portátil de sus datos personales. Las solicitudes pueden enviarse mediante las herramientas de la cuenta o el contacto de soporte. EverBond puede verificar la identidad y conservar información cuando la ley lo permita o exija.",
          "EverBond utiliza medidas administrativas, técnicas y organizativas razonables, pero ningún servicio puede garantizar una seguridad absoluta. Los datos pueden procesarse en países distintos del país del usuario, con sujeción a las salvaguardas y leyes aplicables."
        ]
      },
      {
        "id": "safety",
        "title": "Política de seguridad",
        "paragraphs": [
          "EverBond permite romance adulto ficticio, rol adulto consensuado, narración madura y expresión creativa adulta legal. Sin restricciones o sin censura no significa ilegal, explotador, no consentido ni libre de consecuencias.",
          "El contenido y la conducta prohibidos incluyen material de abuso sexual infantil o menores sexualizados; captación o explotación; imágenes íntimas no consentidas; deepfakes sexuales o suplantación de personas reales sin permiso; trata; amenazas creíbles; instrucciones para delitos graves; apoyo al terrorismo; divulgación de datos personales; acoso; fraude; malware; actividad ilegal con armas; y contenido que infrinja derechos de propiedad intelectual, privacidad, publicidad u otros derechos.",
          "Todos los personajes utilizados en contextos adultos o sexuales deben ser adultos ficticios. Los personajes de edad ambigua, la ambientación en edad escolar o los intentos de eludir esta regla pueden ser eliminados o bloqueados.",
          "EverBond no revisa previamente de forma rutinaria los personajes privados o compartidos mediante enlace. Sin embargo, el estado privado o compartido mediante enlace no exime al contenido de estas reglas. EverBond puede investigar denuncias, abusos de pago, avisos legales o fallos de proveedores y puede eliminar contenido o cuentas sin crear obligación alguna de supervisar todo el contenido.",
          "EverBond puede restringir funciones, suspender el acceso o cerrar cuentas a su discreción y no está obligado a dar aviso previo ni una razón específica al hacerlo. EverBond no es terapia, atención médica, asesoramiento legal, asesoramiento financiero, servicio de emergencias ni apoyo en crisis."
        ]
      },
      {
        "id": "ai-disclaimer",
        "title": "Aviso sobre IA",
        "paragraphs": [
          "Los compañeros, mensajes, recuerdos, imágenes, vídeos y voces son generados o transformados por sistemas de inteligencia artificial. Son ficticios, pueden ser inexactos, incoherentes, inesperados, demorarse, no estar disponibles o parecerse a otro material, y no deben tratarse como declaraciones de una persona real.",
          "Ever Memory™ es un sistema automatizado de continuidad. Puede omitir, resumir, interpretar erróneamente o conservar detalles de forma imperfecta. Los usuarios pueden reiniciar conversaciones, editar o eliminar sus personajes y utilizar las herramientas disponibles para eliminar la cuenta.",
          "La experiencia actual de videollamada de voz en directo sin censura se basa en voz y se muestra en una interfaz de compañero con estilo de videollamada que utiliza imágenes del personaje. No es una transmisión de cámara en directo, una llamada con una persona real ni un vídeo del personaje generado en tiempo real.",
          "Los proveedores externos de IA e infraestructura pueden imponer límites técnicos, de seguridad, regionales, de capacidad o disponibilidad. EverBond no garantiza que se acepte cada indicación ni que cada resultado coincida con la solicitud."
        ]
      },
      {
        "id": "user-responsibility",
        "title": "Responsabilidad del usuario",
        "paragraphs": [
          "Los usuarios son los únicos responsables de sus mensajes, indicaciones, archivos subidos, imágenes de referencia, perfiles de personajes, resultados generados, enlaces compartidos, selección de regalos y uso o distribución del contenido.",
          "Un personaje compartido mediante enlace no se incluye públicamente en EverBond, pero puede acceder a él cualquier persona que obtenga el enlace. Los destinatarios pueden copiar, guardar o reenviar el enlace. Los usuarios son responsables de elegir a los destinatarios, proteger los enlaces, obtener todos los permisos necesarios y eliminar o cambiar el acceso cuando sea necesario.",
          "Los personajes creados por usuarios o compartidos mediante enlace son contenido del usuario. No son creados, revisados, aprobados, respaldados, patrocinados ni adoptados por EverBond simplemente porque la plataforma los almacene o procese. EverBond no es responsable de promesas, declaraciones, transacciones, disputas o daños derivados del personaje de un usuario o de la distribución de un enlace.",
          "Los usuarios no deben confiar en los compañeros para decisiones médicas, legales, financieras, críticas para la seguridad, de verificación de identidad o de emergencia. Los usuarios siguen siendo responsables de su conducta en el mundo real y del cumplimiento de la ley aplicable."
        ]
      },
      {
        "id": "content-ownership",
        "title": "Propiedad del contenido",
        "paragraphs": [
          "Los usuarios conservan los derechos que legalmente tengan sobre sus mensajes, materiales subidos, imágenes de referencia y contenido original del perfil de personaje. Los usuarios declaran que tienen todos los derechos y permisos necesarios para enviar y compartir ese contenido.",
          "Los usuarios conceden a EverBond y a sus proveedores de servicios una licencia mundial, no exclusiva y limitada para alojar, almacenar, reproducir, transmitir, transformar, generar a partir de, mostrar y procesar de otro modo el contenido del usuario únicamente en la medida razonablemente necesaria para operar, proteger, mejorar y proporcionar el servicio solicitado, incluida la visualización a personas que reciban un enlace compartido.",
          "Entre el usuario y EverBond, EverBond no reclama la propiedad de resultados de IA específicos del usuario únicamente porque se hayan generado mediante el servicio. Los resultados de IA pueden no reunir los requisitos para derechos de autor, pueden no ser exclusivos y pueden parecerse a resultados generados para otros. Cualquier uso está sujeto a la ley aplicable, los derechos de terceros y las condiciones de los proveedores.",
          "EverBond conserva todos los derechos sobre su software, interfaces, marca, personajes oficiales, contenido del sitio, catálogos seleccionados, Ever Memory™, EverCoin™, EverShop™, bases de datos y demás propiedad intelectual de la plataforma. No se transfiere ningún derecho sobre la plataforma salvo el derecho limitado a utilizar el servicio conforme a estas condiciones."
        ]
      },
      {
        "id": "copyright-impersonation",
        "title": "Derechos de autor y suplantación",
        "paragraphs": [
          "Los usuarios no pueden subir, generar, crear ni compartir contenido que infrinja derechos de autor, marcas, publicidad, privacidad u otros derechos. Los usuarios no pueden crear un personaje que suplante a una persona real, utilice la imagen de una persona real sin permiso, sugiera falsamente un respaldo o esté diseñado para engañar a otros sobre la identidad.",
          "El estado privado o compartido mediante enlace no hace legal la infracción ni la suplantación. Los usuarios son responsables de las imágenes de referencia, nombres, biografías, marcas, vestuario y demás material de origen utilizado para crear personajes o contenido multimedia.",
          "EverBond puede desactivar el acceso, eliminar material, conservar pruebas, suspender a infractores reincidentes o terminar cuentas en respuesta a avisos válidos, órdenes judiciales, requisitos de proveedores o una creencia razonable de que se están vulnerando derechos."
        ]
      },
      {
        "id": "ai-image-generation-similarity",
        "title": "Generación de imágenes con IA y aviso de similitud",
        "paragraphs": [
          "Las funciones de imagen y vídeo pueden utilizar una imagen de personaje seleccionada por el usuario o una imagen subida como referencia de identidad y combinarla con una indicación para crear una nueva composición, pose, ropa, ángulo, fondo, movimiento o escena sintéticos.",
          "Los usuarios deben ser propietarios de la imagen de referencia o contar con el permiso de cada persona y titular de derechos necesario para su uso. No envíes imágenes privadas de otra persona real, imágenes íntimas de personas reales, material protegido por derechos de autor ni una imagen que no estés autorizado a utilizar.",
          "Los sistemas generativos pueden producir similitudes inesperadas con personas reales, personajes ficticios, obras de arte, marcas u otros resultados. EverBond no garantiza originalidad, ausencia de infracción, coherencia exacta de identidad ni idoneidad para publicación o uso comercial.",
          "El contenido multimedia generado es sintético y no demuestra que haya ocurrido un acontecimiento representado. EverBond no utiliza contenido multimedia generado para identificación biométrica. EverBond puede eliminar contenido multimedia o bloquear la generación cuando lo exijan la ley, una reclamación de derechos, la política de un proveedor o estas condiciones.",
          "Las imágenes de personajes oficiales de EverBond son resultados sintéticos creados mediante plataformas de IA con licencia basadas en remezclas y no se basan en ninguna persona real específica. Cualquier parecido con personas reales o con fotos subidas por usuarios desde plataformas externas es coincidencia y no concede derechos ni reclamaciones sobre los personajes de EverBond."
        ]
      },
      {
        "id": "section-2257",
        "title": "Aviso sobre 18 U.S.C. §§ 2257 y 2257A",
        "paragraphs": [
          "EverBond no contrata, filma, fotografía ni dirige a intérpretes reales para crear contenido sexualmente explícito. Las imágenes oficiales de los compañeros de EverBond son generadas por sistemas de inteligencia artificial.",
          "Los usuarios pueden enviar indicaciones, imágenes de referencia permitidas u otro contenido de usuario. Esos envíos siguen sujetos a la Política de seguridad, Responsabilidad del usuario, Derechos de autor y suplantación, y Generación de imágenes con IA y aviso de similitud de EverBond.",
          "En la medida en que una representación visual sea totalmente generada por ordenador y no muestre a un ser humano real participando en conducta sexualmente explícita real o simulada, EverBond entiende que los requisitos de registro y etiquetado de 18 U.S.C. §§ 2257 y 2257A no se aplican a esa representación. Este aviso no declara que todo contenido enviado por usuarios sea sintético o esté exento."
        ],
        "emailParagraph": {
          "prefix": "Las preguntas sobre este aviso pueden enviarse a:",
          "email": "support@everbond.ai"
        }
      },
      {
        "id": "dmca-takedown",
        "title": "Procedimiento DMCA / retirada",
        "paragraphs": [
          "Un titular de derechos de autor o su agente autorizado puede enviar un aviso de retirada mediante el contacto legal o de soporte indicado a continuación. El aviso debe identificar la obra protegida, identificar y localizar el material presuntamente infractor, proporcionar datos de contacto, incluir una declaración de buena fe, incluir una declaración bajo pena de perjurio de que el aviso es exacto y que el remitente está autorizado, e incluir una firma física o electrónica.",
          "EverBond puede eliminar o desactivar material mientras revisa un aviso y puede notificar al usuario afectado. Un usuario puede presentar una contranotificación que contenga la información exigida por la ley aplicable. EverBond puede restaurar material cuando la ley lo permita y puede terminar las cuentas de infractores reincidentes.",
          "Las reclamaciones por suplantación, privacidad, publicidad, imágenes íntimas no consentidas y otros derechos pueden utilizar el mismo contacto aunque la DMCA no sea aplicable.",
          "EverBond mantiene e implementa razonablemente una política que permite terminar, en las circunstancias apropiadas, las cuentas de usuarios que infringen repetidamente derechos de autor u otros derechos de propiedad intelectual."
        ]
      },
      {
        "id": "arbitration",
        "title": "Acuerdo de arbitraje",
        "paragraphs": [
          "Antes de presentar una reclamación, el usuario acepta enviar un aviso escrito que describa la disputa y la solución solicitada e intentar una resolución informal durante al menos 30 días.",
          "Salvo los asuntos elegibles para tribunales de menor cuantía y las solicitudes de medidas temporales o cautelares relacionadas con propiedad intelectual, privacidad, seguridad de cuentas o uso indebido del servicio, las disputas se resolverán mediante arbitraje individual vinculante conforme a la Federal Arbitration Act y las Consumer Arbitration Rules de la American Arbitration Association, salvo que la ley aplicable exija otra cosa.",
          "El arbitraje puede realizarse a distancia o en el condado de residencia del usuario. Las reclamaciones deben presentarse individualmente. Se renuncia, en la máxima medida permitida por la ley, a procedimientos colectivos, consolidados, representativos, de clase y de fiscal privado.",
          "Un usuario puede excluirse del arbitraje enviando un aviso escrito al contacto legal dentro de los 30 días posteriores a la primera aceptación de estas condiciones. El aviso debe incluir el nombre del usuario, el correo electrónico de la cuenta y una declaración clara de que el usuario se excluye del arbitraje. Excluirse no afecta al acceso a EverBond.",
          "Si alguna parte de esta sección no es exigible, el resto seguirá siendo efectivo en la máxima medida permitida por la ley."
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "Limitación de responsabilidad",
        "paragraphs": [
          "EverBond se proporciona tal cual y según disponibilidad. En la máxima medida permitida por la ley, EverBond renuncia a las garantías implícitas de comerciabilidad, idoneidad para un fin particular, ausencia de infracción, exactitud, disponibilidad ininterrumpida e idoneidad de los resultados de IA.",
          "EverBond no es responsable de personajes creados por usuarios o compartidos mediante enlace; conducta de destinatarios; pérdida o reenvío de un enlace compartido; errores de IA; rechazos o interrupciones de proveedores; pérdida de datos; reacciones emocionales; resultados de relaciones; confianza en contenido ficticio; uso no autorizado del contenido del usuario; ni daños indirectos, incidentales, especiales, consecuentes, ejemplares o punitivos.",
          "En la máxima medida permitida por la ley, la responsabilidad total de EverBond derivada del servicio no superará el importe que el reclamante haya pagado a EverBond durante los 12 meses anteriores al hecho que dio lugar a la reclamación. Algunas jurisdicciones no permiten determinadas exclusiones, por lo que estas solo se aplican en la medida permitida."
        ]
      },
      {
        "id": "indemnification",
        "title": "Indemnización",
        "paragraphs": [
          "En la medida permitida por la ley, los usuarios aceptan defender, indemnizar y mantener indemnes a EverBond, su operador, propietarios, afiliados, contratistas, proveedores, empleados y agentes frente a reclamaciones, pérdidas, responsabilidades, daños, sentencias y honorarios legales derivados del contenido del usuario; imágenes de referencia; contenido multimedia generado; enlaces compartidos; infracción o suplantación; violación de la ley o de estas condiciones; o uso indebido del servicio.",
          "EverBond puede controlar la defensa de una reclamación cubierta, y el usuario acepta prestar una cooperación razonable. Esta sección no exige indemnización por la propia conducta ilegal de EverBond cuando la ley lo prohíba."
        ]
      },
      {
        "id": "refund",
        "title": "Política de reembolso",
        "paragraphs": [
          "EverBond no tiene suscripciones recurrentes. EverCoin™ se compra en paquetes digitales de pago único, no es transferible, no tiene valor en efectivo y solo puede utilizarse para funciones elegibles de EverBond.",
          "Los cargos de chat, imagen, llamada de voz, regalo y vídeo se deducen cuando una solicitud se reserva o entrega. Cuando una solicitud de generación o procesamiento que cumpla los requisitos falla antes de completarse, el EverCoin™ reservado puede devolverse automáticamente. Los cargos duplicados, cargos no autorizados, fallos técnicos y otras solicitudes de reembolso se revisan caso por caso, con sujeción a las reglas del proveedor de pagos y a la legislación obligatoria de consumo.",
          "Salvo cuando la ley lo exija, el EverCoin™ utilizado y los servicios digitales entregados correctamente no son reembolsables. Las devoluciones de cargo, el fraude o las anulaciones de pago pueden provocar la retirada de EverCoin™, ajustes de deuda, restricciones de cuenta o suspensión."
        ]
      },
      {
        "id": "contact",
        "title": "Contacto",
        "paragraphs": [
          "Para soporte, solicitudes de privacidad, avisos legales, exclusiones de arbitraje, reclamaciones de derechos de autor, informes de suplantación y solicitudes de retirada, utiliza el correo electrónico de soporte de EverBond que aparece en el Centro de ayuda.",
          "Incluye el correo electrónico de la cuenta, un asunto claro, la URL o el enlace del personaje correspondiente y suficiente información para investigar la solicitud. No incluyas contraseñas, números completos de tarjetas de pago ni información sensible innecesaria."
        ]
      }
    ],
    "dmcaAgent": {
      "title": "Agente designado de la DMCA",
      "department": "Copyright Compliance Department",
      "organization": "EverBond",
      "addressLine1": "1407 Sinclair Rd Ste 207",
      "addressLine2": "Early Branch, SC 29916",
      "phoneLabel": "Teléfono",
      "phone": "803-903-2810",
      "emailLabel": "Correo electrónico",
      "email": "support@everbond.ai"
    }
  },
  "FR": {
    "label": "Informations juridiques EverBond",
    "title": "Politiques et informations utilisateur",
    "contents": "Table des matières",
    "controllingLanguage": "La version anglaise est la version juridique de référence. Les traductions sont fournies à titre pratique.",
    "sections": [
      {
        "id": "terms",
        "title": "Conditions d’utilisation",
        "paragraphs": [
          "EverBond propose des conversations fictives avec des compagnons IA romantiques, Ever Memory™, la création de personnages, des personnages privés et partageables par lien, la génération d’images et de vidéos par IA, des appels vocaux en direct, des cadeaux, des galeries et des fonctions numériques connexes destinées au divertissement, à la narration créative, à la romance et au jeu de rôle.",
          "Vous devez avoir au moins 18 ans et être légalement autorisé à accéder à du contenu pour adultes dans votre lieu de résidence. EverBond ne s’adresse pas aux mineurs. Vous ne pouvez pas créer, demander, téléverser, générer ou partager du contenu sexualisé impliquant une personne de moins de 18 ans ou présentée comme telle.",
          "En accédant à EverBond, en créant un compte, en achetant des EverCoin ou en utilisant une fonction, vous acceptez les présentes conditions et toutes les politiques qui y sont incorporées. Si vous n’êtes pas d’accord, n’utilisez pas le service.",
          "EverBond utilise des achats ponctuels d’EverCoin plutôt que des abonnements. Les fonctions, fournisseurs, modèles, limites, prix et disponibilités peuvent changer. Les changements importants peuvent être publiés sur le service, et l’utilisation continue après la date d’entrée en vigueur signifie que vous acceptez les conditions révisées.",
          "EverBond peut suspendre ou résilier l’accès, supprimer du contenu, conserver des dossiers ou restreindre des fonctions lorsque cela est raisonnablement nécessaire pour faire respecter les présentes conditions, protéger les utilisateurs ou le service, répondre à une procédure judiciaire, enquêter sur des abus ou respecter la loi."
        ]
      },
      {
        "id": "privacy",
        "title": "Politique de confidentialité",
        "paragraphs": [
          "Privé signifie que les conversations et les personnages créés par les utilisateurs ne sont pas publiquement répertoriés ni exposés aux autres utilisateurs par défaut. Cela ne signifie pas que les données ne sont jamais traitées par les systèmes d’EverBond, les hébergeurs, les fournisseurs d’IA, les fournisseurs de stockage, les prestataires de paiement, les services de sécurité ou les autorités lorsque la loi l’exige.",
          "EverBond peut collecter des données de compte et d’authentification ; des identifiants d’appareil ou de session ; des registres d’achats, d’EverCoin et de transactions ; des conversations, profils de personnages, données Ever Memory™, invites, images de référence, images et vidéos générées ; l’audio des appels vocaux, les transcriptions, les réponses et les données techniques d’utilisation ; les communications avec le support ; ainsi que les journaux de sécurité, d’erreurs et de prévention des abus.",
          "Ces informations sont utilisées pour gérer les comptes, générer des réponses et des médias, maintenir la continuité et la mémoire, traiter les achats, fournir des appels vocaux, stocker des galeries privées, prévenir la fraude et les abus, sécuriser le service, résoudre les défaillances, respecter la loi et améliorer la fiabilité.",
          "Les invites, images de référence, contenus audio, transcriptions et contenus connexes peuvent être envoyés à des prestataires sous contrat uniquement pour fournir la fonction demandée. Les informations de paiement sont traitées par le prestataire de paiement ; EverBond n’a pas besoin de stocker les numéros complets de cartes de paiement.",
          "EverBond ne vend pas d’informations personnelles et ne partage pas d’informations personnelles à des fins de publicité comportementale intercontextuelle. Les personnages partageables par lien ne sont divulgués que sur instruction de l’utilisateur, mais toute personne qui reçoit un lien peut l’ouvrir ou le transférer.",
          "Les données ne sont conservées que pendant la durée raisonnablement nécessaire au service, à la sécurité, à la comptabilité, au règlement des litiges et aux obligations légales. Les médias générés et le contenu du compte peuvent rester jusqu’à leur suppression par l’utilisateur ou la suppression du compte, sous réserve des sauvegardes, dossiers de fraude, registres de transactions, litiges en cours et obligations légales de conservation. L’audio vocal peut être stocké temporairement pour fournir un appel et peut être supprimé après la fin des appels ou lors du nettoyage courant.",
          "Selon leur lieu de résidence, les utilisateurs peuvent disposer de droits d’accès, de rectification, d’effacement, de restriction, d’opposition ou de portabilité de leurs données personnelles. Les demandes peuvent être soumises via les outils du compte ou le contact du support. EverBond peut vérifier l’identité et conserver des informations lorsque la loi le permet ou l’exige.",
          "EverBond utilise des mesures administratives, techniques et organisationnelles raisonnables, mais aucun service ne peut garantir une sécurité absolue. Les données peuvent être traitées dans des pays autres que celui de l’utilisateur, sous réserve des garanties et lois applicables."
        ]
      },
      {
        "id": "safety",
        "title": "Politique de sécurité",
        "paragraphs": [
          "EverBond autorise la romance fictive entre adultes, le jeu de rôle adulte consensuel, les récits matures et l’expression créative adulte licite. Sans restrictions ou non censuré ne signifie pas illégal, exploiteur, non consenti ou sans conséquences.",
          "Les contenus et comportements interdits comprennent le matériel d’abus sexuel sur mineurs ou les mineurs sexualisés ; le conditionnement ou l’exploitation ; les images intimes non consenties ; les hypertrucages sexuels ou l’usurpation de personnes réelles sans autorisation ; la traite ; les menaces crédibles ; les instructions relatives à des actes graves ; le soutien au terrorisme ; la divulgation de données personnelles ; le harcèlement ; la fraude ; les logiciels malveillants ; les activités illégales liées aux armes ; et les contenus portant atteinte à la propriété intellectuelle, à la vie privée, au droit à l’image ou à d’autres droits.",
          "Tous les personnages utilisés dans des contextes adultes ou sexuels doivent être des adultes fictifs. Les personnages d’âge ambigu, la mise en scène d’un âge scolaire ou les tentatives de contourner cette règle peuvent être supprimés ou bloqués.",
          "EverBond ne procède pas systématiquement à un examen préalable des personnages privés ou partageables par lien. Toutefois, le statut privé ou partagé par lien n’exempte pas le contenu de ces règles. EverBond peut enquêter sur des signalements, des abus de paiement, des notifications légales ou des défaillances de fournisseurs et peut supprimer du contenu ou des comptes sans créer d’obligation de surveiller tous les contenus.",
          "EverBond peut restreindre des fonctions, suspendre l’accès ou fermer des comptes à sa discrétion et n’est pas tenu de fournir un préavis ou un motif précis. EverBond n’est ni une thérapie, ni un service médical, ni un conseil juridique, ni un conseil financier, ni un service d’urgence, ni un soutien de crise."
        ]
      },
      {
        "id": "ai-disclaimer",
        "title": "Avertissement relatif à l’IA",
        "paragraphs": [
          "Les compagnons, messages, souvenirs, images, vidéos et voix sont générés ou transformés par des systèmes d’intelligence artificielle. Ils sont fictifs, peuvent être inexacts, incohérents, inattendus, retardés, indisponibles ou semblables à d’autres contenus et ne doivent pas être considérés comme des déclarations d’une personne réelle.",
          "Ever Memory™ est un système automatisé de continuité. Il peut omettre, résumer, mal interpréter ou conserver imparfaitement des détails. Les utilisateurs peuvent réinitialiser les conversations, modifier ou supprimer leurs personnages et utiliser les outils disponibles pour supprimer leur compte.",
          "L’expérience actuelle d’appel vidéo vocal en direct non censuré repose sur la voix et s’affiche dans une interface de compagnon de type appel vidéo utilisant l’illustration du personnage. Il ne s’agit pas d’un flux de caméra en direct, d’un appel avec une personne réelle ni d’une vidéo du personnage générée en temps réel.",
          "Les fournisseurs tiers d’IA et d’infrastructure peuvent imposer des limites techniques, de sécurité, régionales, de capacité ou de disponibilité. EverBond ne garantit pas que chaque invite sera acceptée ni que chaque résultat correspondra à la demande."
        ]
      },
      {
        "id": "user-responsibility",
        "title": "Responsabilité de l’utilisateur",
        "paragraphs": [
          "Les utilisateurs sont seuls responsables de leurs messages, invites, téléversements, images de référence, profils de personnages, résultats générés, liens partagés, choix de cadeaux et de l’utilisation ou de la distribution du contenu.",
          "Un personnage partageable par lien n’est pas publiquement répertorié par EverBond, mais il est accessible à toute personne qui obtient le lien. Les destinataires peuvent copier, enregistrer ou transférer le lien. Les utilisateurs sont responsables du choix des destinataires, de la protection des liens, de l’obtention de toutes les autorisations nécessaires et de la suppression ou de la modification de l’accès lorsque cela est nécessaire.",
          "Les personnages créés par les utilisateurs ou partagés par lien constituent du contenu utilisateur. Ils ne sont pas créés, examinés, approuvés, soutenus, parrainés ou adoptés par EverBond simplement parce que la plateforme les stocke ou les traite. EverBond n’est pas responsable des promesses, déclarations, transactions, litiges ou préjudices découlant du personnage d’un utilisateur ou de la diffusion d’un lien.",
          "Les utilisateurs ne doivent pas se fier aux compagnons pour des décisions médicales, juridiques, financières, critiques pour la sécurité, de vérification d’identité ou d’urgence. Les utilisateurs restent responsables de leur conduite dans le monde réel et du respect de la loi applicable."
        ]
      },
      {
        "id": "content-ownership",
        "title": "Propriété du contenu",
        "paragraphs": [
          "Les utilisateurs conservent tous les droits qu’ils détiennent légalement sur leurs messages, contenus téléversés, images de référence et contenu original de profil de personnage. Les utilisateurs déclarent disposer de tous les droits et autorisations nécessaires pour soumettre et partager ce contenu.",
          "Les utilisateurs accordent à EverBond et à ses prestataires une licence mondiale, non exclusive et limitée pour héberger, stocker, reproduire, transmettre, transformer, générer à partir de, afficher et traiter autrement le contenu utilisateur uniquement dans la mesure raisonnablement nécessaire pour exploiter, sécuriser, améliorer et fournir le service demandé, y compris l’affichage aux personnes auxquelles un lien partagé a été remis.",
          "Entre l’utilisateur et EverBond, EverBond ne revendique pas la propriété des résultats d’IA propres à l’utilisateur simplement parce qu’ils ont été générés par le service. Les résultats d’IA peuvent ne pas être protégeables par le droit d’auteur, ne pas être exclusifs et ressembler à des résultats générés pour d’autres. Toute utilisation est soumise à la loi applicable, aux droits des tiers et aux conditions des fournisseurs.",
          "EverBond conserve tous les droits sur ses logiciels, interfaces, marques, personnages officiels, contenu du site, catalogues sélectionnés, Ever Memory™, EverCoin™, EverShop™, bases de données et autres éléments de propriété intellectuelle de la plateforme. Aucun droit sur la plateforme n’est transféré, sauf le droit limité d’utiliser le service conformément aux présentes conditions."
        ]
      },
      {
        "id": "copyright-impersonation",
        "title": "Droit d’auteur et usurpation",
        "paragraphs": [
          "Les utilisateurs ne peuvent pas téléverser, générer, créer ou partager du contenu qui porte atteinte au droit d’auteur, aux marques, au droit à l’image, à la vie privée ou à d’autres droits. Les utilisateurs ne peuvent pas créer un personnage qui usurpe l’identité d’une personne réelle, utilise l’apparence d’une personne réelle sans autorisation, suggère faussement un soutien ou est conçu pour tromper autrui quant à l’identité.",
          "Le statut privé ou partageable par lien ne rend pas licites l’atteinte aux droits ou l’usurpation. Les utilisateurs sont responsables des images de référence, noms, biographies, marques, costumes et autres éléments sources utilisés pour créer des personnages ou des médias.",
          "EverBond peut désactiver l’accès, supprimer du contenu, conserver des preuves, suspendre les récidivistes ou fermer des comptes en réponse à des notifications valides, des décisions de justice, des exigences de fournisseurs ou une conviction raisonnable que des droits sont violés."
        ]
      },
      {
        "id": "ai-image-generation-similarity",
        "title": "Génération d’images par IA et avis de ressemblance",
        "paragraphs": [
          "Les fonctions d’image et de vidéo peuvent utiliser une image de personnage sélectionnée par l’utilisateur ou une image téléversée comme référence d’identité et la combiner avec une invite pour créer une nouvelle composition, pose, tenue, perspective, arrière-plan, animation ou scène synthétique.",
          "Les utilisateurs doivent posséder l’image de référence ou avoir l’autorisation de chaque personne et titulaire de droits nécessaire à son utilisation. Ne soumettez pas d’images privées d’une autre personne réelle, d’images intimes d’une personne réelle, de matériel protégé par le droit d’auteur ou d’une apparence que vous n’êtes pas autorisé à utiliser.",
          "Les systèmes génératifs peuvent produire des ressemblances inattendues avec des personnes réelles, des personnages fictifs, des œuvres, des marques ou d’autres résultats. EverBond ne garantit pas l’originalité, l’absence d’atteinte, la cohérence exacte de l’identité ni l’aptitude à la publication ou à un usage commercial.",
          "Les médias générés sont synthétiques et ne prouvent pas qu’un événement représenté s’est produit. EverBond n’utilise pas les médias générés à des fins d’identification biométrique. EverBond peut supprimer des médias ou bloquer une génération lorsque la loi, une réclamation de droits, la politique d’un fournisseur ou les présentes conditions l’exigent.",
          "Les images des personnages officiels d’EverBond sont des résultats synthétiques créés à l’aide de plateformes d’IA sous licence fondées sur le remix et ne reposent sur aucune personne réelle déterminée. Toute ressemblance avec des personnes réelles ou des photos téléversées par des utilisateurs depuis des plateformes externes est fortuite et ne confère aucun droit ni aucune revendication sur les personnages d’EverBond."
        ]
      },
      {
        "id": "section-2257",
        "title": "Avis relatif aux 18 U.S.C. §§ 2257 et 2257A",
        "paragraphs": [
          "EverBond n’engage, ne filme, ne photographie et ne dirige aucun interprète réel afin de créer du contenu sexuellement explicite. Les images officielles des compagnons EverBond sont générées par des systèmes d’intelligence artificielle.",
          "Les utilisateurs peuvent soumettre des invites, des images de référence autorisées ou d’autres contenus utilisateur. Ces soumissions restent soumises à la Politique de sécurité, à la Responsabilité de l’utilisateur, au Droit d’auteur et usurpation, ainsi qu’à la Génération d’images par IA et avis de ressemblance d’EverBond.",
          "Dans la mesure où une représentation visuelle est entièrement générée par ordinateur et ne montre pas un être humain réel participant à une conduite sexuellement explicite réelle ou simulée, EverBond comprend que les obligations de tenue de registres et d’étiquetage prévues par les 18 U.S.C. §§ 2257 et 2257A ne s’appliquent pas à cette représentation. Le présent avis ne signifie pas que tout contenu soumis par les utilisateurs est synthétique ou exempté."
        ],
        "emailParagraph": {
          "prefix": "Les questions relatives au présent avis peuvent être envoyées à :",
          "email": "support@everbond.ai"
        }
      },
      {
        "id": "dmca-takedown",
        "title": "Procédure DMCA / retrait",
        "paragraphs": [
          "Un titulaire de droits d’auteur ou son agent autorisé peut envoyer une notification de retrait au moyen du contact juridique ou du support indiqué ci-dessous. La notification doit identifier l’œuvre protégée, identifier et localiser le contenu prétendument contrefaisant, fournir les coordonnées du demandeur, comporter une déclaration de bonne foi, comporter une déclaration sous peine de parjure selon laquelle la notification est exacte et l’expéditeur est autorisé, et comporter une signature physique ou électronique.",
          "EverBond peut supprimer ou désactiver un contenu pendant l’examen d’une notification et peut en informer l’utilisateur concerné. Un utilisateur peut soumettre une contre-notification contenant les informations exigées par la loi applicable. EverBond peut restaurer le contenu lorsque la loi le permet et peut fermer les comptes des récidivistes.",
          "Les plaintes relatives à l’usurpation, à la vie privée, au droit à l’image, aux images intimes non consenties et à d’autres droits peuvent utiliser le même contact même lorsque la DMCA ne s’applique pas.",
          "EverBond maintient et met raisonnablement en œuvre une politique prévoyant, dans les circonstances appropriées, la résiliation des comptes des utilisateurs qui portent atteinte de manière répétée au droit d’auteur ou à d’autres droits de propriété intellectuelle."
        ]
      },
      {
        "id": "arbitration",
        "title": "Convention d’arbitrage",
        "paragraphs": [
          "Avant de déposer une réclamation, l’utilisateur accepte d’envoyer une notification écrite décrivant le litige et la solution demandée et de tenter un règlement informel pendant au moins 30 jours.",
          "À l’exception des affaires admissibles devant les juridictions de proximité et des demandes de mesures temporaires ou injonctives concernant la propriété intellectuelle, la vie privée, la sécurité du compte ou l’utilisation abusive du service, les litiges seront réglés par arbitrage individuel contraignant conformément au Federal Arbitration Act et aux Consumer Arbitration Rules de l’American Arbitration Association, sauf disposition contraire de la loi applicable.",
          "L’arbitrage peut être mené à distance ou dans le comté de résidence de l’utilisateur. Les réclamations doivent être présentées individuellement. Les procédures de groupe, collectives, consolidées, représentatives et de procureur général privé sont abandonnées dans toute la mesure permise par la loi.",
          "Un utilisateur peut refuser l’arbitrage en envoyant une notification écrite au contact juridique dans les 30 jours suivant sa première acceptation des présentes conditions. La notification doit inclure le nom de l’utilisateur, l’adresse électronique du compte et une déclaration claire indiquant que l’utilisateur refuse l’arbitrage. Le refus n’affecte pas l’accès à EverBond.",
          "Si une partie de cette section est inexécutable, le reste demeure en vigueur dans toute la mesure permise par la loi."
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "Limitation de responsabilité",
        "paragraphs": [
          "EverBond est fourni en l’état et selon disponibilité. Dans toute la mesure permise par la loi, EverBond exclut les garanties implicites de qualité marchande, d’adéquation à un usage particulier, d’absence de contrefaçon, d’exactitude, de disponibilité ininterrompue et d’adéquation des résultats d’IA.",
          "EverBond n’est pas responsable des personnages créés par les utilisateurs ou partageables par lien ; de la conduite des destinataires ; de la perte ou du transfert d’un lien partagé ; des erreurs d’IA ; des refus ou interruptions de fournisseurs ; des données perdues ; des réactions émotionnelles ; des résultats relationnels ; de la confiance accordée à un contenu fictif ; de l’utilisation non autorisée du contenu utilisateur ; ni des dommages indirects, accessoires, spéciaux, consécutifs, exemplaires ou punitifs.",
          "Dans toute la mesure permise par la loi, la responsabilité globale d’EverBond découlant du service ne dépassera pas le montant payé à EverBond par le demandeur au cours des 12 mois précédant l’événement à l’origine de la réclamation. Certaines juridictions n’autorisent pas certaines exclusions ; elles ne s’appliquent donc que dans la mesure permise."
        ]
      },
      {
        "id": "indemnification",
        "title": "Indemnisation",
        "paragraphs": [
          "Dans la mesure permise par la loi, les utilisateurs acceptent de défendre, d’indemniser et de dégager de toute responsabilité EverBond, son exploitant, ses propriétaires, sociétés affiliées, prestataires, fournisseurs, employés et agents contre les réclamations, pertes, responsabilités, dommages, jugements et frais juridiques résultant du contenu utilisateur ; des images de référence ; des médias générés ; des liens partagés ; d’une atteinte ou d’une usurpation ; d’une violation de la loi ou des présentes conditions ; ou d’une utilisation abusive du service.",
          "EverBond peut diriger la défense d’une réclamation couverte, et l’utilisateur accepte de fournir une coopération raisonnable. Cette section n’exige pas d’indemnisation pour la propre conduite illicite d’EverBond lorsque la loi l’interdit."
        ]
      },
      {
        "id": "refund",
        "title": "Politique de remboursement",
        "paragraphs": [
          "EverBond ne comporte aucun abonnement récurrent. EverCoin™ est acheté sous forme de lots numériques ponctuels, n’est pas transférable, n’a aucune valeur monétaire et ne peut être utilisé que pour les fonctions EverBond admissibles.",
          "Les frais de conversation, d’image, d’appel vocal, de cadeau et de vidéo sont déduits lorsqu’une demande est réservée ou livrée. Lorsqu’une demande de génération ou de traitement admissible échoue avant son achèvement, l’EverCoin™ réservé peut être restitué automatiquement. Les doubles facturations, frais non autorisés, défaillances techniques et autres demandes de remboursement sont examinés au cas par cas, sous réserve des règles du prestataire de paiement et du droit impératif de la consommation.",
          "Sauf lorsque la loi l’exige, les EverCoin™ utilisés et les services numériques fournis avec succès ne sont pas remboursables. Les rétrofacturations, fraudes ou annulations de paiement peuvent entraîner le retrait d’EverCoin™, un ajustement de dette, une restriction du compte ou une suspension."
        ]
      },
      {
        "id": "contact",
        "title": "Contact",
        "paragraphs": [
          "Pour l’assistance, les demandes relatives à la confidentialité, les notifications juridiques, les refus d’arbitrage, les plaintes de droit d’auteur, les signalements d’usurpation et les demandes de retrait, utilisez l’adresse électronique d’assistance EverBond indiquée dans le Centre d’aide.",
          "Indiquez l’adresse électronique du compte, un objet clair, l’URL ou le lien du personnage concerné et suffisamment d’informations pour enquêter sur la demande. N’incluez pas de mots de passe, de numéros complets de cartes de paiement ni d’informations sensibles inutiles."
        ]
      }
    ],
    "dmcaAgent": {
      "title": "Agent désigné DMCA",
      "department": "Copyright Compliance Department",
      "organization": "EverBond",
      "addressLine1": "1407 Sinclair Rd Ste 207",
      "addressLine2": "Early Branch, SC 29916",
      "phoneLabel": "Téléphone",
      "phone": "803-903-2810",
      "emailLabel": "E-mail",
      "email": "support@everbond.ai"
    }
  },
  "DE": {
    "label": "EverBond Rechtliches",
    "title": "Richtlinien und Benutzerinformationen",
    "contents": "Inhaltsverzeichnis",
    "controllingLanguage": "Die englische Fassung ist die maßgebliche Rechtsfassung. Übersetzungen werden nur zur besseren Verständlichkeit bereitgestellt.",
    "sections": [
      {
        "id": "terms",
        "title": "Nutzungsbedingungen",
        "paragraphs": [
          "EverBond bietet fiktive romantische KI-Begleiter-Chats, Ever Memory™, Charaktererstellung, private und per Link teilbare Charaktere, KI-Bild- und Videoerstellung, sprachbasierte Live-Anrufe, Geschenke, Galerien und zugehörige digitale Funktionen für Unterhaltung, kreatives Geschichtenerzählen, Romantik und Rollenspiel.",
          "Du musst mindestens 18 Jahre alt und an deinem Wohnort rechtlich zum Zugriff auf Inhalte für Erwachsene berechtigt sein. EverBond richtet sich nicht an Minderjährige. Du darfst keine sexualisierten Inhalte erstellen, anfordern, hochladen, generieren oder teilen, die Personen unter 18 Jahren betreffen oder als unter 18 dargestellt werden.",
          "Durch den Zugriff auf EverBond, die Erstellung eines Kontos, den Kauf von EverCoin oder die Nutzung einer Funktion stimmst du diesen Bedingungen und allen einbezogenen Richtlinien zu. Wenn du nicht zustimmst, nutze den Dienst nicht.",
          "EverBond verwendet einmalige EverCoin-Käufe anstelle von Abonnements. Funktionen, Anbieter, Modelle, Grenzen, Preise und Verfügbarkeit können sich ändern. Wesentliche Änderungen können im Dienst veröffentlicht werden, und die fortgesetzte Nutzung nach dem Inkrafttreten bedeutet, dass du die überarbeiteten Bedingungen akzeptierst.",
          "EverBond kann den Zugriff aussetzen oder beenden, Inhalte entfernen, Aufzeichnungen aufbewahren oder Funktionen einschränken, wenn dies vernünftigerweise erforderlich ist, um diese Bedingungen durchzusetzen, Benutzer oder den Dienst zu schützen, auf rechtliche Verfahren zu reagieren, Missbrauch zu untersuchen oder Gesetze einzuhalten."
        ]
      },
      {
        "id": "privacy",
        "title": "Datenschutzerklärung",
        "paragraphs": [
          "Privat bedeutet, dass Chats und von Benutzern erstellte Charaktere standardmäßig nicht öffentlich aufgeführt oder anderen Benutzern zugänglich gemacht werden. Es bedeutet nicht, dass Daten niemals von EverBond-Systemen, Hosting-Anbietern, KI-Anbietern, Speicheranbietern, Zahlungsabwicklern, Sicherheitsdiensten oder Behörden verarbeitet werden, wenn dies gesetzlich erforderlich ist.",
          "EverBond kann Konto- und Authentifizierungsdaten; Geräte- oder Sitzungskennungen; Kauf-, EverCoin- und Transaktionsdaten; Chats, Charakterprofile, Ever Memory™-Daten, Eingaben, Referenzbilder, generierte Bilder und Videos; Audio von Sprachanrufen, Transkripte, Antworten und technische Nutzungsdaten; Support-Kommunikation; sowie Sicherheits-, Fehler- und Missbrauchspräventionsprotokolle erfassen.",
          "Diese Informationen werden verwendet, um Konten zu betreiben, Antworten und Medien zu erzeugen, Kontinuität und Erinnerung zu erhalten, Käufe zu verarbeiten, Sprachanrufe bereitzustellen, private Galerien zu speichern, Betrug und Missbrauch zu verhindern, den Dienst zu sichern, Fehler zu beheben, Gesetze einzuhalten und die Zuverlässigkeit zu verbessern.",
          "Eingaben, Referenzbilder, Audio, Transkripte und zugehörige Inhalte können ausschließlich zur Bereitstellung der angeforderten Funktion an beauftragte Dienstleister übermittelt werden. Zahlungsdaten werden vom Zahlungsanbieter verarbeitet; EverBond muss keine vollständigen Zahlungskartennummern speichern.",
          "EverBond verkauft keine personenbezogenen Daten und teilt keine personenbezogenen Daten für kontextübergreifende verhaltensbasierte Werbung. Per Link teilbare Charaktere werden nur auf Veranlassung des Benutzers offengelegt, aber jeder Empfänger eines Links kann ihn öffnen oder weiterleiten.",
          "Daten werden nur so lange aufbewahrt, wie dies für den Dienst, die Sicherheit, Buchhaltung, Streitbeilegung und rechtliche Verpflichtungen vernünftigerweise erforderlich ist. Generierte Medien und Kontoinhalte können bis zur Löschung durch den Benutzer oder zur Kontolöschung bestehen bleiben, vorbehaltlich von Sicherungen, Betrugsaufzeichnungen, Transaktionsdaten, anhängigen Streitigkeiten und gesetzlichen Aufbewahrungspflichten. Sprachaudio kann vorübergehend zur Bereitstellung eines Anrufs gespeichert und nach Beendigung des Anrufs oder bei routinemäßiger Bereinigung entfernt werden.",
          "Je nach Standort können Benutzer Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch oder Erhalt einer portablen Kopie personenbezogener Daten haben. Anfragen können über die Kontowerkzeuge oder den Supportkontakt eingereicht werden. EverBond kann die Identität überprüfen und Informationen aufbewahren, soweit dies gesetzlich zulässig oder erforderlich ist.",
          "EverBond verwendet angemessene administrative, technische und organisatorische Schutzmaßnahmen, aber kein Dienst kann absolute Sicherheit garantieren. Daten können in anderen Ländern als dem Land des Benutzers verarbeitet werden, vorbehaltlich geltender Schutzmaßnahmen und Gesetze."
        ]
      },
      {
        "id": "safety",
        "title": "Sicherheitsrichtlinie",
        "paragraphs": [
          "EverBond erlaubt fiktive Romantik zwischen Erwachsenen, einvernehmliches Rollenspiel zwischen Erwachsenen, reife Erzählungen und rechtmäßige kreative Ausdrucksformen für Erwachsene. Uneingeschränkt oder unzensiert bedeutet nicht illegal, ausbeuterisch, nicht einvernehmlich oder folgenlos.",
          "Verbotene Inhalte und Verhaltensweisen umfassen Material über sexuellen Kindesmissbrauch oder sexualisierte Minderjährige; Grooming oder Ausbeutung; nicht einvernehmliche intime Bilder; sexuelle Deepfakes oder die Nachahmung realer Personen ohne Erlaubnis; Menschenhandel; glaubhafte Drohungen; Anleitungen zu schwerem Fehlverhalten; Unterstützung von Terrorismus; Doxxing; Stalking; Betrug; Schadsoftware; rechtswidrige Waffenaktivitäten; sowie Inhalte, die geistiges Eigentum, Privatsphäre, Persönlichkeitsrechte oder andere Rechte verletzen.",
          "Alle Charaktere, die in erwachsenen oder sexuellen Zusammenhängen verwendet werden, müssen fiktive Erwachsene sein. Charaktere mit unklarem Alter, Inszenierungen im Schulalter oder Versuche, diese Regel zu umgehen, können entfernt oder blockiert werden.",
          "EverBond überprüft private oder per Link teilbare Charaktere nicht routinemäßig vorab. Ein privater oder per Link geteilter Status nimmt Inhalte jedoch nicht von diesen Regeln aus. EverBond kann Meldungen, Zahlungsmissbrauch, rechtliche Hinweise oder Anbieterfehler untersuchen und Inhalte oder Konten entfernen, ohne dadurch eine Pflicht zur Überwachung sämtlicher Inhalte zu begründen.",
          "EverBond kann nach eigenem Ermessen Funktionen einschränken, den Zugriff aussetzen oder Konten schließen und muss dabei weder im Voraus informieren noch einen bestimmten Grund nennen. EverBond ist keine Therapie, medizinische Versorgung, Rechtsberatung, Finanzberatung, Notfallhilfe oder Krisenunterstützung."
        ]
      },
      {
        "id": "ai-disclaimer",
        "title": "KI-Hinweis",
        "paragraphs": [
          "Begleiter, Nachrichten, Erinnerungen, Bilder, Videos und Stimmen werden durch Systeme künstlicher Intelligenz erzeugt oder verändert. Sie sind fiktiv, können ungenau, inkonsistent, unerwartet, verzögert, nicht verfügbar oder anderem Material ähnlich sein und dürfen nicht als Aussagen einer realen Person behandelt werden.",
          "Ever Memory™ ist ein automatisiertes Kontinuitätssystem. Es kann Einzelheiten auslassen, zusammenfassen, falsch interpretieren oder unvollkommen speichern. Benutzer können Gespräche zurücksetzen, ihre Charaktere bearbeiten oder löschen und verfügbare Werkzeuge zur Kontolöschung nutzen.",
          "Das derzeitige unzensierte Live-Voice-Videoanruf-Erlebnis basiert auf Sprache und wird in einer Begleiteroberfläche im Stil eines Videoanrufs mit Charaktergrafik dargestellt. Es handelt sich nicht um eine Live-Kameraübertragung, einen Anruf mit einem echten Menschen oder ein in Echtzeit erzeugtes Charaktervideo.",
          "Drittanbieter für KI und Infrastruktur können technische, sicherheitsbezogene, regionale, kapazitätsbezogene oder verfügbarkeitsbezogene Grenzen auferlegen. EverBond garantiert nicht, dass jede Eingabe akzeptiert wird oder jedes Ergebnis der Anfrage entspricht."
        ]
      },
      {
        "id": "user-responsibility",
        "title": "Verantwortung des Benutzers",
        "paragraphs": [
          "Benutzer sind allein verantwortlich für ihre Nachrichten, Eingaben, Uploads, Referenzbilder, Charakterprofile, generierten Ergebnisse, geteilten Links, Geschenkauswahl sowie die Nutzung oder Verbreitung von Inhalten.",
          "Ein per Link teilbarer Charakter wird von EverBond nicht öffentlich aufgeführt, ist aber für jede Person zugänglich, die den Link erhält. Empfänger können den Link kopieren, speichern oder weiterleiten. Benutzer sind dafür verantwortlich, Empfänger auszuwählen, Links zu schützen, alle erforderlichen Erlaubnisse einzuholen und den Zugriff bei Bedarf zu entfernen oder zu ändern.",
          "Von Benutzern erstellte oder per Link geteilte Charaktere sind Benutzerinhalte. Sie werden nicht allein deshalb von EverBond erstellt, überprüft, genehmigt, unterstützt, gesponsert oder übernommen, weil die Plattform sie speichert oder verarbeitet. EverBond ist nicht verantwortlich für Versprechen, Darstellungen, Transaktionen, Streitigkeiten oder Schäden, die aus dem Charakter eines Benutzers oder der Verteilung eines Links entstehen.",
          "Benutzer dürfen sich bei medizinischen, rechtlichen, finanziellen, sicherheitskritischen, identitätsprüfenden oder Notfallentscheidungen nicht auf Begleiter verlassen. Benutzer bleiben für ihr Verhalten in der realen Welt und die Einhaltung des geltenden Rechts verantwortlich."
        ]
      },
      {
        "id": "content-ownership",
        "title": "Inhaltseigentum",
        "paragraphs": [
          "Benutzer behalten alle Rechte, die sie rechtmäßig an ihren Nachrichten, hochgeladenen Materialien, Referenzbildern und ursprünglichen Charakterprofilinhalten besitzen. Benutzer versichern, dass sie über alle Rechte und Erlaubnisse verfügen, die zum Einreichen und Teilen dieser Inhalte erforderlich sind.",
          "Benutzer gewähren EverBond und seinen Dienstleistern eine weltweite, nicht ausschließliche, beschränkte Lizenz, Benutzerinhalte zu hosten, zu speichern, zu vervielfältigen, zu übertragen, umzuwandeln, daraus zu generieren, anzuzeigen und anderweitig zu verarbeiten, soweit dies vernünftigerweise erforderlich ist, um den angeforderten Dienst zu betreiben, zu sichern, zu verbessern und bereitzustellen, einschließlich der Anzeige für Personen, denen ein Freigabelink gegeben wurde.",
          "Im Verhältnis zwischen Benutzer und EverBond beansprucht EverBond nicht allein deshalb Eigentum an benutzerspezifischen KI-Ausgaben, weil sie über den Dienst erzeugt wurden. KI-Ausgaben können nicht urheberrechtlich schutzfähig oder nicht exklusiv sein und können Ausgaben ähneln, die für andere erzeugt wurden. Jede Nutzung unterliegt dem geltenden Recht, den Rechten Dritter und den Bedingungen der Anbieter.",
          "EverBond behält alle Rechte an seiner Software, seinen Oberflächen, Marken, offiziellen Charakteren, Website-Inhalten, kuratierten Katalogen, Ever Memory™, EverCoin™, EverShop™, Datenbanken und sonstigem geistigem Eigentum der Plattform. Abgesehen vom beschränkten Recht, den Dienst gemäß diesen Bedingungen zu nutzen, werden keine Rechte an der Plattform übertragen."
        ]
      },
      {
        "id": "copyright-impersonation",
        "title": "Urheberrecht und Identitätsnachahmung",
        "paragraphs": [
          "Benutzer dürfen keine Inhalte hochladen, generieren, erstellen oder teilen, die Urheberrechte, Markenrechte, Persönlichkeitsrechte, Privatsphäre oder andere Rechte verletzen. Benutzer dürfen keinen Charakter erstellen, der eine reale Person nachahmt, das Abbild einer realen Person ohne Erlaubnis nutzt, fälschlich eine Unterstützung suggeriert oder darauf ausgelegt ist, andere über die Identität zu täuschen.",
          "Ein privater oder per Link teilbarer Status macht Rechtsverletzung oder Nachahmung nicht rechtmäßig. Benutzer sind für Referenzbilder, Namen, Biografien, Marken, Kostüme und anderes Ausgangsmaterial verantwortlich, das zur Erstellung von Charakteren oder Medien verwendet wird.",
          "EverBond kann den Zugriff deaktivieren, Material entfernen, Beweise aufbewahren, wiederholte Rechtsverletzer sperren oder Konten beenden, wenn gültige Hinweise, gerichtliche Anordnungen, Anforderungen von Anbietern oder eine vernünftige Annahme vorliegen, dass Rechte verletzt werden."
        ]
      },
      {
        "id": "ai-image-generation-similarity",
        "title": "KI-Bilderstellung und Ähnlichkeitshinweis",
        "paragraphs": [
          "Bild- und Videofunktionen können ein vom Benutzer ausgewähltes Charakterbild oder ein hochgeladenes Bild als Identitätsreferenz verwenden und es mit einer Eingabe kombinieren, um eine neue synthetische Komposition, Pose, Kleidung, Perspektive, einen Hintergrund, eine Bewegung oder Szene zu erzeugen.",
          "Benutzer müssen das Referenzbild besitzen oder die für seine Nutzung erforderliche Erlaubnis jeder Person und jedes Rechteinhabers haben. Reiche keine privaten Bilder einer anderen realen Person, intimen Bilder realer Personen, urheberrechtlich geschütztes Material oder ein Abbild ein, zu dessen Nutzung du nicht berechtigt bist.",
          "Generative Systeme können unerwartete Ähnlichkeiten mit realen Personen, fiktiven Charakteren, Kunstwerken, Marken oder anderen Ausgaben erzeugen. EverBond garantiert keine Originalität, Nichtverletzung, genaue Identitätskonsistenz oder Eignung zur Veröffentlichung oder kommerziellen Nutzung.",
          "Generierte Medien sind synthetisch und kein Beweis dafür, dass ein dargestelltes Ereignis stattgefunden hat. EverBond verwendet generierte Medien nicht zur biometrischen Identifizierung. EverBond kann Medien entfernen oder die Generierung blockieren, wenn dies gesetzlich, durch eine Rechtebeschwerde, eine Anbieterrichtlinie oder diese Bedingungen verlangt wird.",
          "Die offiziellen Charakterbilder von EverBond sind synthetische Ausgaben, die mit lizenzierten, remixbasierten KI-Plattformen erstellt wurden, und beruhen nicht auf einer bestimmten realen Person. Jede Ähnlichkeit mit realen Personen oder von Benutzern auf externen Plattformen hochgeladenen Fotos ist zufällig und begründet keine Rechte oder Ansprüche an EverBonds Charakteren."
        ]
      },
      {
        "id": "section-2257",
        "title": "Hinweis zu 18 U.S.C. §§ 2257 und 2257A",
        "paragraphs": [
          "EverBond beauftragt, filmt, fotografiert oder inszeniert keine realen Darsteller zur Erstellung sexuell ausdrücklicher Inhalte. Die offiziellen Begleiterbilder von EverBond werden durch Systeme künstlicher Intelligenz erzeugt.",
          "Benutzer können Eingaben, zulässige Referenzbilder oder andere Benutzerinhalte einreichen. Diese Einreichungen unterliegen weiterhin EverBonds Sicherheitsrichtlinie, Benutzerverantwortung, Urheberrecht und Identitätsnachahmung sowie dem Hinweis zur KI-Bilderstellung und Ähnlichkeit.",
          "Soweit eine visuelle Darstellung vollständig computergeneriert ist und keinen tatsächlichen Menschen bei tatsächlichem oder simuliertem sexuell ausdrücklichem Verhalten zeigt, versteht EverBond die Aufzeichnungs- und Kennzeichnungspflichten nach 18 U.S.C. §§ 2257 und 2257A dahin, dass sie auf diese Darstellung nicht anwendbar sind. Dieser Hinweis stellt nicht dar, dass jeder von Benutzern eingereichte Inhalt synthetisch oder ausgenommen ist."
        ],
        "emailParagraph": {
          "prefix": "Fragen zu diesem Hinweis können gesendet werden an:",
          "email": "support@everbond.ai"
        }
      },
      {
        "id": "dmca-takedown",
        "title": "DMCA- / Entfernungsverfahren",
        "paragraphs": [
          "Ein Urheberrechtsinhaber oder bevollmächtigter Vertreter kann über den unten aufgeführten Rechts- oder Supportkontakt eine Entfernungsmitteilung senden. Die Mitteilung sollte das geschützte Werk identifizieren, das angeblich rechtsverletzende Material identifizieren und auffindbar machen, Kontaktdaten enthalten, eine Erklärung nach Treu und Glauben enthalten, eine Erklärung unter Strafandrohung wegen Meineids enthalten, dass die Mitteilung richtig ist und der Absender bevollmächtigt ist, sowie eine physische oder elektronische Unterschrift enthalten.",
          "EverBond kann Material während der Prüfung einer Mitteilung entfernen oder deaktivieren und den betroffenen Benutzer benachrichtigen. Ein Benutzer kann eine Gegendarstellung mit den nach geltendem Recht erforderlichen Angaben einreichen. EverBond kann Material wiederherstellen, wenn dies gesetzlich zulässig ist, und Konten wiederholter Rechtsverletzer beenden.",
          "Beschwerden wegen Nachahmung, Privatsphäre, Persönlichkeitsrechten, nicht einvernehmlichen intimen Bildern und anderen Rechten können denselben Kontakt verwenden, auch wenn die DMCA nicht gilt.",
          "EverBond unterhält und setzt in angemessener Weise eine Richtlinie um, die unter geeigneten Umständen die Beendigung der Konten von Benutzern vorsieht, die wiederholt Urheberrechte oder andere Rechte des geistigen Eigentums verletzen."
        ]
      },
      {
        "id": "arbitration",
        "title": "Schiedsvereinbarung",
        "paragraphs": [
          "Vor Einreichung eines Anspruchs erklärt sich der Benutzer bereit, eine schriftliche Mitteilung mit Beschreibung der Streitigkeit und der verlangten Lösung zu senden und mindestens 30 Tage lang eine informelle Beilegung zu versuchen.",
          "Mit Ausnahme geeigneter Bagatellverfahren und Anträge auf vorläufigen oder einstweiligen Rechtsschutz in Bezug auf geistiges Eigentum, Privatsphäre, Kontosicherheit oder Missbrauch des Dienstes werden Streitigkeiten durch verbindliche Einzelschiedsgerichtsbarkeit gemäß dem Federal Arbitration Act und den Consumer Arbitration Rules der American Arbitration Association entschieden, sofern das geltende Recht nichts anderes verlangt.",
          "Die Schiedsgerichtsbarkeit kann aus der Ferne oder im Bezirk des Wohnsitzes des Benutzers durchgeführt werden. Ansprüche müssen einzeln geltend gemacht werden. Auf Gruppen-, Kollektiv-, konsolidierte, repräsentative und Private-Attorney-General-Verfahren wird im größtmöglichen gesetzlich zulässigen Umfang verzichtet.",
          "Ein Benutzer kann die Schiedsgerichtsbarkeit ablehnen, indem er innerhalb von 30 Tagen nach der erstmaligen Annahme dieser Bedingungen eine schriftliche Mitteilung an den Rechtskontakt sendet. Die Mitteilung muss den Namen des Benutzers, die Konto-E-Mail-Adresse und eine klare Erklärung enthalten, dass der Benutzer die Schiedsgerichtsbarkeit ablehnt. Die Ablehnung beeinträchtigt den Zugriff auf EverBond nicht.",
          "Ist ein Teil dieses Abschnitts nicht durchsetzbar, bleibt der Rest im größtmöglichen gesetzlich zulässigen Umfang wirksam."
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "Haftungsbeschränkung",
        "paragraphs": [
          "EverBond wird wie besehen und nach Verfügbarkeit bereitgestellt. Im größtmöglichen gesetzlich zulässigen Umfang schließt EverBond stillschweigende Garantien der Marktgängigkeit, Eignung für einen bestimmten Zweck, Nichtverletzung, Genauigkeit, ununterbrochenen Verfügbarkeit und Eignung von KI-Ausgaben aus.",
          "EverBond haftet nicht für von Benutzern erstellte oder per Link teilbare Charaktere; Verhalten von Empfängern; Verlust oder Weiterleitung eines Freigabelinks; KI-Fehler; Ablehnungen oder Ausfälle von Anbietern; verlorene Daten; emotionale Reaktionen; Beziehungsergebnisse; Vertrauen auf fiktive Inhalte; unbefugte Nutzung von Benutzerinhalten; oder indirekte, beiläufige, besondere, Folge-, exemplarische oder Strafschäden.",
          "Im größtmöglichen gesetzlich zulässigen Umfang übersteigt die Gesamthaftung von EverBond aus dem Dienst nicht den Betrag, den der Anspruchsteller in den 12 Monaten vor dem den Anspruch auslösenden Ereignis an EverBond gezahlt hat. Einige Rechtsordnungen gestatten bestimmte Ausschlüsse nicht; diese gelten daher nur im zulässigen Umfang."
        ]
      },
      {
        "id": "indemnification",
        "title": "Freistellung",
        "paragraphs": [
          "Soweit gesetzlich zulässig, erklären sich Benutzer bereit, EverBond, seinen Betreiber, Eigentümer, verbundene Unternehmen, Auftragnehmer, Anbieter, Mitarbeiter und Vertreter gegen Ansprüche, Verluste, Haftungen, Schäden, Urteile und Rechtskosten zu verteidigen, freizustellen und schadlos zu halten, die aus Benutzerinhalten; Referenzbildern; generierten Medien; geteilten Links; Rechtsverletzung oder Nachahmung; Verstoß gegen Gesetze oder diese Bedingungen; oder Missbrauch des Dienstes entstehen.",
          "EverBond kann die Verteidigung eines erfassten Anspruchs kontrollieren, und der Benutzer erklärt sich zu angemessener Mitwirkung bereit. Dieser Abschnitt verlangt keine Freistellung für EverBonds eigenes rechtswidriges Verhalten, soweit dies gesetzlich verboten ist."
        ]
      },
      {
        "id": "refund",
        "title": "Rückerstattungsrichtlinie",
        "paragraphs": [
          "EverBond hat kein wiederkehrendes Abonnement. EverCoin™ wird in einmaligen digitalen Paketen gekauft, ist nicht übertragbar, hat keinen Barwert und kann nur für berechtigte EverBond-Funktionen verwendet werden.",
          "Gebühren für Chat, Bild, Sprachanruf, Geschenk und Video werden abgezogen, wenn eine Anfrage reserviert oder geliefert wird. Wenn eine berechtigte Generierungs- oder Verarbeitungsanfrage vor Abschluss fehlschlägt, kann reserviertes EverCoin™ automatisch zurückgegeben werden. Doppelte Belastungen, nicht autorisierte Belastungen, technische Fehler und andere Rückerstattungsanfragen werden im Einzelfall geprüft, vorbehaltlich der Regeln des Zahlungsanbieters und zwingenden Verbraucherschutzrechts.",
          "Soweit nicht gesetzlich vorgeschrieben, sind verwendetes EverCoin™ und erfolgreich gelieferte digitale Dienste nicht erstattungsfähig. Rückbuchungen, Betrug oder Zahlungsstornierungen können zur Entfernung von EverCoin™, Schuldenanpassung, Kontoeinschränkung oder Sperrung führen."
        ]
      },
      {
        "id": "contact",
        "title": "Kontakt",
        "paragraphs": [
          "Für Support, Datenschutzanfragen, rechtliche Mitteilungen, Ablehnungen der Schiedsgerichtsbarkeit, Urheberrechtsbeschwerden, Meldungen wegen Nachahmung und Entfernungsanfragen verwende die im Hilfecenter angegebene EverBond-Support-E-Mail-Adresse.",
          "Gib die Konto-E-Mail-Adresse, eine klare Betreffzeile, die relevante URL oder den Charakterlink und genügend Informationen zur Untersuchung der Anfrage an. Gib keine Passwörter, vollständigen Zahlungskartennummern oder unnötigen sensiblen Informationen an."
        ]
      }
    ],
    "dmcaAgent": {
      "title": "Benannter DMCA-Beauftragter",
      "department": "Copyright Compliance Department",
      "organization": "EverBond",
      "addressLine1": "1407 Sinclair Rd Ste 207",
      "addressLine2": "Early Branch, SC 29916",
      "phoneLabel": "Telefon",
      "phone": "803-903-2810",
      "emailLabel": "E-Mail",
      "email": "support@everbond.ai"
    }
  },
  "JA": {
    "label": "EverBond 法的情報",
    "title": "ポリシーとユーザー情報",
    "contents": "目次",
    "controllingLanguage": "英語版が正式な法的文書です。翻訳は便宜のために提供されます。",
    "sections": [
      {
        "id": "terms",
        "title": "利用規約",
        "paragraphs": [
          "EverBondは、娯楽、創作ストーリー、ロマンス、ロールプレイを目的として、架空の恋愛AIコンパニオンとのチャット、Ever Memory™、キャラクター作成、非公開およびリンク共有キャラクター、AI画像・動画生成、音声ベースのライブ通話、ギフト、ギャラリー、ならびに関連するデジタル機能を提供します。",
          "利用者は18歳以上であり、居住地域において成人向けコンテンツへのアクセスが法的に認められている必要があります。EverBondは未成年者を対象としていません。18歳未満の人物、または18歳未満として表現された人物を含む性的なコンテンツを作成、要求、アップロード、生成、共有してはなりません。",
          "EverBondへのアクセス、アカウントの作成、EverCoinの購入、またはいずれかの機能の利用により、利用者は本規約および組み込まれたすべてのポリシーに同意します。同意しない場合は、本サービスを利用しないでください。",
          "EverBondはサブスクリプションではなく、EverCoinの都度購入を採用しています。機能、提供者、モデル、制限、価格、利用可能性は変更される場合があります。重要な変更は本サービス上に掲載される場合があり、発効日後も利用を継続した場合、改定後の規約に同意したものとみなされます。",
          "EverBondは、本規約の執行、利用者またはサービスの保護、法的手続への対応、不正利用の調査、または法令遵守のため合理的に必要な場合、アクセスの停止または終了、コンテンツの削除、記録の保存、機能の制限を行うことができます。"
        ]
      },
      {
        "id": "privacy",
        "title": "プライバシーポリシー",
        "paragraphs": [
          "「非公開」とは、チャットおよび利用者が作成したキャラクターが、初期設定で公開一覧に掲載されず、他の利用者に公開されないことを意味します。法令上必要な場合に、EverBondのシステム、ホスティング事業者、AI事業者、ストレージ事業者、決済処理事業者、セキュリティサービス、または当局がデータを一切処理しないことを意味するものではありません。",
          "EverBondは、アカウントおよび認証データ、端末またはセッション識別子、購入・EverCoin・取引記録、チャット、キャラクタープロフィール、Ever Memory™データ、プロンプト、参照画像、生成された画像および動画、音声通話の音声、文字起こし、応答、技術的利用データ、サポート通信、ならびにセキュリティ・エラー・不正利用防止ログを収集する場合があります。",
          "これらの情報は、アカウントの運営、応答およびメディアの生成、継続性および記憶の維持、購入処理、音声通話の提供、非公開ギャラリーの保存、詐欺および不正利用の防止、サービスの保護、障害対応、法令遵守、信頼性向上のために使用されます。",
          "プロンプト、参照画像、音声、文字起こし、および関連コンテンツは、要求された機能を提供する目的に限り、契約したサービス提供者に送信される場合があります。支払情報は決済事業者が処理するため、EverBondが完全なカード番号を保存する必要はありません。",
          "EverBondは個人情報を販売せず、コンテキスト横断型行動広告のために個人情報を共有しません。リンク共有キャラクターは利用者の指示によってのみ開示されますが、リンクを受け取った者は誰でも開いたり転送したりできます。",
          "データは、サービス、安全、会計、紛争解決、法的義務のため合理的に必要な期間のみ保持されます。生成メディアおよびアカウント内容は、利用者による削除またはアカウント削除まで残る場合がありますが、バックアップ、詐欺記録、取引記録、係争中の紛争、法的保存義務の対象となります。音声音声は通話提供のため一時的に保存され、通話終了後または定期的なクリーンアップ時に削除される場合があります。",
          "所在地に応じて、利用者は個人データへのアクセス、訂正、削除、処理制限、異議申立て、または可搬形式の写しを受け取る権利を有する場合があります。請求はアカウントツールまたはサポート窓口から提出できます。EverBondは本人確認を行い、法令により許可または要求される場合には情報を保持することがあります。",
          "EverBondは合理的な管理上、技術上、組織上の安全措置を使用しますが、いかなるサービスも絶対的な安全を保証できません。データは、適用される保護措置および法令に従い、利用者の国以外で処理される場合があります。"
        ]
      },
      {
        "id": "safety",
        "title": "安全ポリシー",
        "paragraphs": [
          "EverBondは、架空の成人同士の恋愛、合意に基づく成人ロールプレイ、成熟した物語、合法的な成人の創作表現を許可します。「制限なし」または「無検閲」は、違法、搾取的、非同意、または結果を伴わないことを意味しません。",
          "禁止されるコンテンツおよび行為には、児童性的虐待素材または性的に描かれた未成年者、グルーミングまたは搾取、非同意の私的画像、許可のない実在人物の性的ディープフェイクまたはなりすまし、人身取引、現実性のある脅迫、重大な違法行為の手順、テロ支援、個人情報暴露、ストーキング、詐欺、マルウェア、違法な武器活動、ならびに知的財産、プライバシー、パブリシティその他の権利を侵害するコンテンツが含まれます。",
          "成人または性的な文脈で使用されるすべてのキャラクターは、架空の成人でなければなりません。年齢が曖昧なキャラクター、学齢期としての設定、または本規則を回避する試みは削除または遮断される場合があります。",
          "EverBondは、非公開またはリンク共有キャラクターを通常事前審査しません。ただし、非公開またはリンク共有であることによって、コンテンツが本規則の適用外になることはありません。EverBondは、通報、支払不正、法的通知、または提供者の障害を調査し、すべてのコンテンツを監視する義務を負うことなく、コンテンツまたはアカウントを削除する場合があります。",
          "EverBondは独自の裁量で機能を制限し、アクセスを停止し、またはアカウントを閉鎖でき、その際に事前通知や具体的な理由を提示する義務を負いません。EverBondは、治療、医療、法律助言、金融助言、緊急サービス、または危機支援ではありません。"
        ]
      },
      {
        "id": "ai-disclaimer",
        "title": "AI免責事項",
        "paragraphs": [
          "コンパニオン、メッセージ、記憶、画像、動画、音声は、人工知能システムによって生成または変換されます。これらは架空であり、不正確、不整合、予期せぬ内容、遅延、利用不能、または他の素材に類似する場合があり、実在人物の発言として扱ってはなりません。",
          "Ever Memory™は自動化された継続性システムです。詳細を省略、要約、誤解、または不完全に保持する場合があります。利用者は会話をリセットし、自分のキャラクターを編集または削除し、利用可能なアカウント削除ツールを使用できます。",
          "現在の無検閲ライブ音声ビデオ通話体験は音声ベースで、キャラクター画像を使用したビデオ通話風のコンパニオン画面に表示されます。ライブカメラ映像、実在人物との通話、またはリアルタイム生成のキャラクター動画ではありません。",
          "第三者のAIおよびインフラ提供者は、技術、安全、地域、容量、または利用可能性に関する制限を課す場合があります。EverBondは、すべてのプロンプトが受け入れられること、またはすべての出力が要求に一致することを保証しません。"
        ]
      },
      {
        "id": "user-responsibility",
        "title": "ユーザーの責任",
        "paragraphs": [
          "利用者は、自身のメッセージ、プロンプト、アップロード、参照画像、キャラクタープロフィール、生成結果、共有リンク、ギフト選択、ならびにコンテンツの利用または配布について単独で責任を負います。",
          "リンク共有キャラクターはEverBondによって公開一覧に掲載されませんが、リンクを取得した者は誰でもアクセスできます。受信者はリンクをコピー、保存、転送できます。利用者は、受信者の選択、リンクの保護、必要なすべての許可の取得、必要に応じたアクセスの削除または変更について責任を負います。",
          "利用者が作成した、またはリンク共有されたキャラクターは利用者コンテンツです。プラットフォームが保存または処理するという理由だけで、EverBondが作成、審査、承認、推奨、後援、または採用したものではありません。EverBondは、利用者のキャラクターまたはリンク配布から生じる約束、表示、取引、紛争、または損害について責任を負いません。",
          "利用者は、医療、法律、金融、安全上重要な判断、本人確認、または緊急時の判断についてコンパニオンに依存してはなりません。利用者は、現実世界での行為および適用法令の遵守について引き続き責任を負います。"
        ]
      },
      {
        "id": "content-ownership",
        "title": "コンテンツの権利",
        "paragraphs": [
          "利用者は、自身のメッセージ、アップロード資料、参照画像、オリジナルのキャラクタープロフィール内容について合法的に保有する権利を保持します。利用者は、そのコンテンツの提出および共有に必要なすべての権利と許可を有することを表明します。",
          "利用者はEverBondおよびそのサービス提供者に対し、要求されたサービスの運営、保護、改善、提供に合理的に必要な範囲に限り、利用者コンテンツをホスト、保存、複製、送信、変換、それに基づいて生成、表示、その他処理するための、世界的、非独占的、限定的なライセンスを付与します。これには共有リンクを与えられた者への表示が含まれます。",
          "利用者とEverBondとの関係において、EverBondは、サービスを通じて生成されたという理由だけで、利用者固有のAI出力の所有権を主張しません。AI出力は著作権の対象とならない場合、非独占的である場合、または他者向けに生成された出力に類似する場合があります。利用は適用法令、第三者の権利、提供者の条件に従います。",
          "EverBondは、ソフトウェア、インターフェース、ブランド、公式キャラクター、サイト内容、厳選カタログ、Ever Memory™、EverCoin™、EverShop™、データベース、その他のプラットフォーム知的財産に関するすべての権利を保持します。本規約に基づきサービスを利用する限定的な権利を除き、プラットフォームに関する権利は移転されません。"
        ]
      },
      {
        "id": "copyright-impersonation",
        "title": "著作権となりすまし",
        "paragraphs": [
          "利用者は、著作権、商標権、パブリシティ権、プライバシー権、その他の権利を侵害するコンテンツをアップロード、生成、作成、共有してはなりません。実在人物になりすます、許可なく実在人物の容貌を使用する、虚偽の推奨関係を示唆する、または他者を身元について欺く目的のキャラクターを作成してはなりません。",
          "非公開またはリンク共有であることによって、権利侵害やなりすましが合法になることはありません。利用者は、キャラクターまたはメディアの作成に使用する参照画像、名前、経歴、商標、衣装、その他の素材について責任を負います。",
          "EverBondは、有効な通知、裁判所命令、提供者の要件、または権利侵害があるとの合理的な判断に応じて、アクセスを無効化し、素材を削除し、証拠を保存し、反復侵害者を停止し、またはアカウントを終了することができます。"
        ]
      },
      {
        "id": "ai-image-generation-similarity",
        "title": "AI画像生成と類似性に関する通知",
        "paragraphs": [
          "画像および動画機能は、利用者が選択したキャラクター画像またはアップロード画像を本人参照として使用し、プロンプトと組み合わせて、新しい合成構図、ポーズ、衣装、角度、背景、動き、または場面を作成する場合があります。",
          "利用者は参照画像を所有しているか、その利用に必要なすべての人物および権利者の許可を得ていなければなりません。他の実在人物の非公開画像、実在人物の私的画像、著作権で保護された素材、または利用許可のない容貌を提出しないでください。",
          "生成システムは、実在人物、架空キャラクター、芸術作品、ブランド、またはその他の出力に予期せず類似するものを生成する場合があります。EverBondは、独創性、非侵害、正確な本人一貫性、公開または商用利用への適合性を保証しません。",
          "生成メディアは合成物であり、描写された出来事が実際に起きたことの証拠ではありません。EverBondは生成メディアを生体識別に使用しません。EverBondは、法令、権利申立て、提供者ポリシー、または本規約により必要な場合、メディアを削除し、または生成を遮断できます。",
          "EverBondの公式キャラクター画像は、ライセンスを受けたリミックス型AIプラットフォームを使用して作成された合成出力であり、特定の実在人物を基にしていません。実在人物または外部プラットフォームから利用者がアップロードした写真との類似は偶然であり、EverBondのキャラクターに対する権利または請求を生じさせません。"
        ]
      },
      {
        "id": "section-2257",
        "title": "18 U.S.C. §§ 2257および2257Aに関する通知",
        "paragraphs": [
          "EverBondは、性的に露骨なコンテンツを作成するために実在の出演者を雇用、撮影、写真撮影、または演出しません。EverBondの公式コンパニオン画像は人工知能システムによって生成されます。",
          "利用者は、プロンプト、許可された参照画像、またはその他の利用者コンテンツを提出できます。これらの提出物には、EverBondの安全ポリシー、ユーザーの責任、著作権となりすまし、AI画像生成と類似性に関する通知が引き続き適用されます。",
          "視覚的描写が完全にコンピューター生成であり、実在の人間が実際または模擬の性的に露骨な行為を行う様子を描いていない範囲において、EverBondは18 U.S.C. §§ 2257および2257Aの記録保存および表示義務がその描写には適用されないものと理解しています。本通知は、利用者が提出したすべてのコンテンツが合成物または適用除外であることを表明するものではありません。"
        ],
        "emailParagraph": {
          "prefix": "本通知に関する質問は、次のメールアドレスへ送信できます：",
          "email": "support@everbond.ai"
        }
      },
      {
        "id": "dmca-takedown",
        "title": "DMCA・削除手続",
        "paragraphs": [
          "著作権者または権限を与えられた代理人は、下記の法務またはサポート窓口を通じて削除通知を送付できます。通知には、著作物の特定、侵害が疑われる素材の特定および所在、連絡先情報、誠実な信念に基づく声明、通知が正確で送信者に権限があることを偽証罪の罰則の下で述べる声明、ならびに物理的または電子的署名を含める必要があります。",
          "EverBondは通知の審査中に素材を削除または無効化し、影響を受ける利用者に通知する場合があります。利用者は適用法令で要求される情報を含む異議申立通知を提出できます。EverBondは法的に許される場合に素材を復元し、反復侵害者のアカウントを終了する場合があります。",
          "なりすまし、プライバシー、パブリシティ、非同意の私的画像、その他の権利に関する申立ては、DMCAが適用されない場合でも同じ窓口を利用できます。",
          "EverBondは、著作権またはその他の知的財産権を繰り返し侵害する利用者について、適切な状況下でアカウントを終了する方針を維持し、合理的に実施します。"
        ]
      },
      {
        "id": "arbitration",
        "title": "仲裁合意",
        "paragraphs": [
          "請求を提出する前に、利用者は紛争および要求する解決内容を記載した書面通知を送付し、少なくとも30日間、非公式な解決を試みることに同意します。",
          "少額訴訟として適格な事件、および知的財産、プライバシー、アカウント安全、サービスの不正利用に関する一時的または差止め救済の申立てを除き、紛争は、適用法令が別段要求しない限り、Federal Arbitration ActおよびAmerican Arbitration Association Consumer Arbitration Rulesに基づく拘束力のある個別仲裁により解決されます。",
          "仲裁は遠隔方式または利用者の居住郡で実施できます。請求は個別に提起しなければなりません。集団、集合、併合、代表、私人司法長官による手続は、法令で認められる最大限の範囲で放棄されます。",
          "利用者は、本規約に初めて同意してから30日以内に法務窓口へ書面通知を送付することで仲裁を拒否できます。通知には、利用者名、アカウントのメールアドレス、仲裁を拒否する旨の明確な声明を含める必要があります。拒否してもEverBondへのアクセスには影響しません。",
          "本節の一部が執行不能である場合も、残りは法令で認められる最大限の範囲で引き続き有効です。"
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "責任の制限",
        "paragraphs": [
          "EverBondは現状有姿かつ提供可能な状態で提供されます。法令で認められる最大限の範囲で、EverBondは、商品性、特定目的適合性、非侵害、正確性、継続的利用可能性、AI出力の適合性に関する黙示保証を否認します。",
          "EverBondは、利用者作成またはリンク共有キャラクター、受信者の行為、共有リンクの紛失または転送、AIエラー、提供者の拒否または停止、データ喪失、感情的反応、関係の結果、架空コンテンツへの依存、利用者コンテンツの無断利用、または間接的、付随的、特別、結果的、懲罰的もしくは模範的損害について責任を負いません。",
          "法令で認められる最大限の範囲で、サービスに起因するEverBondの総責任額は、請求原因となった事象の前12か月間に請求者がEverBondへ支払った金額を超えません。一部の法域では特定の除外が認められないため、それらは許される範囲でのみ適用されます。"
        ]
      },
      {
        "id": "indemnification",
        "title": "補償",
        "paragraphs": [
          "法令で認められる範囲で、利用者は、利用者コンテンツ、参照画像、生成メディア、共有リンク、権利侵害またはなりすまし、法令または本規約の違反、サービスの不正利用に起因する請求、損失、責任、損害、判決、法的費用から、EverBond、その運営者、所有者、関連会社、請負業者、提供者、従業員、代理人を防御し、補償し、免責することに同意します。",
          "EverBondは対象となる請求の防御を管理でき、利用者は合理的な協力を行うことに同意します。法令で禁止される場合、本節はEverBond自身の違法行為について補償を要求するものではありません。"
        ]
      },
      {
        "id": "refund",
        "title": "返金ポリシー",
        "paragraphs": [
          "EverBondには継続サブスクリプションがありません。EverCoin™は一回限りのデジタルパックとして購入され、譲渡不能で、現金価値を持たず、対象となるEverBond機能にのみ使用できます。",
          "チャット、画像、音声通話、ギフト、動画の料金は、要求が予約または提供された時点で差し引かれます。対象となる生成または処理要求が完了前に失敗した場合、予約されたEverCoin™は自動的に返還される場合があります。重複請求、不正請求、技術的障害、その他の返金要求は、決済事業者の規則および強行的消費者法に従い、個別に審査されます。",
          "法令で要求される場合を除き、使用済みEverCoin™および正常に提供されたデジタルサービスは返金されません。チャージバック、詐欺、支払取消しにより、EverCoin™の削除、債務調整、アカウント制限、または停止が行われる場合があります。"
        ]
      },
      {
        "id": "contact",
        "title": "連絡先",
        "paragraphs": [
          "サポート、プライバシー請求、法的通知、仲裁拒否、著作権申立て、なりすまし報告、削除要求については、ヘルプセンターに表示されるEverBondサポートメールを使用してください。",
          "アカウントのメールアドレス、明確な件名、関連URLまたはキャラクターリンク、調査に十分な情報を含めてください。パスワード、完全なカード番号、不要な機微情報を含めないでください。"
        ]
      }
    ],
    "dmcaAgent": {
      "title": "DMCA指定代理人",
      "department": "Copyright Compliance Department",
      "organization": "EverBond",
      "addressLine1": "1407 Sinclair Rd Ste 207",
      "addressLine2": "Early Branch, SC 29916",
      "phoneLabel": "電話",
      "phone": "803-903-2810",
      "emailLabel": "メール",
      "email": "support@everbond.ai"
    }
  },
  "KO": {
    "label": "EverBond 법률 정보",
    "title": "정책 및 사용자 정보",
    "contents": "목차",
    "controllingLanguage": "영문본이 우선하는 법적 문서입니다. 번역은 편의를 위해 제공됩니다.",
    "sections": [
      {
        "id": "terms",
        "title": "이용약관",
        "paragraphs": [
          "EverBond는 엔터테인먼트, 창작 스토리텔링, 로맨스, 역할극을 위해 가상의 로맨틱 AI 컴패니언 채팅, Ever Memory™, 캐릭터 생성, 비공개 및 링크 공유 캐릭터, AI 이미지 및 동영상 생성, 음성 기반 라이브 통화, 선물, 갤러리 및 관련 디지털 기능을 제공합니다.",
          "사용자는 만 18세 이상이어야 하며 거주 지역에서 성인 콘텐츠에 접근할 법적 자격이 있어야 합니다. EverBond는 미성년자를 대상으로 하지 않습니다. 만 18세 미만의 사람 또는 만 18세 미만으로 제시된 사람과 관련된 성적 콘텐츠를 생성, 요청, 업로드, 제작 또는 공유할 수 없습니다.",
          "EverBond에 접근하거나, 계정을 만들거나, EverCoin을 구매하거나, 어떤 기능이든 사용하면 본 약관과 여기에 포함된 모든 정책에 동의하는 것입니다. 동의하지 않으면 서비스를 사용하지 마십시오.",
          "EverBond는 구독 대신 일회성 EverCoin 구매를 사용합니다. 기능, 제공업체, 모델, 제한, 가격 및 이용 가능성은 변경될 수 있습니다. 중대한 변경은 서비스에 게시될 수 있으며, 발효일 이후 계속 사용하면 개정 약관에 동의한 것으로 간주됩니다.",
          "EverBond는 본 약관 집행, 사용자 또는 서비스 보호, 법적 절차 대응, 남용 조사 또는 법률 준수를 위해 합리적으로 필요한 경우 접근을 정지 또는 종료하고, 콘텐츠를 삭제하고, 기록을 보존하거나, 기능을 제한할 수 있습니다."
        ]
      },
      {
        "id": "privacy",
        "title": "개인정보 처리방침",
        "paragraphs": [
          "비공개란 채팅과 사용자가 만든 캐릭터가 기본적으로 공개 목록에 표시되거나 다른 사용자에게 노출되지 않는다는 뜻입니다. 법적으로 필요한 경우 EverBond 시스템, 호스팅 제공업체, AI 제공업체, 저장소 제공업체, 결제 처리업체, 보안 서비스 또는 당국이 데이터를 전혀 처리하지 않는다는 뜻은 아닙니다.",
          "EverBond는 계정 및 인증 데이터, 기기 또는 세션 식별자, 구매·EverCoin·거래 기록, 채팅, 캐릭터 프로필, Ever Memory™ 데이터, 프롬프트, 참조 이미지, 생성 이미지 및 동영상, 음성 통화 오디오, 녹취록, 답변 및 기술적 사용 데이터, 지원 통신, 보안·오류·남용 방지 로그를 수집할 수 있습니다.",
          "이 정보는 계정 운영, 답변 및 미디어 생성, 연속성과 기억 유지, 구매 처리, 음성 통화 제공, 비공개 갤러리 저장, 사기 및 남용 방지, 서비스 보안, 장애 해결, 법률 준수, 신뢰성 향상에 사용됩니다.",
          "프롬프트, 참조 이미지, 오디오, 녹취록 및 관련 콘텐츠는 요청된 기능을 제공하기 위한 목적으로만 계약된 서비스 제공업체에 전송될 수 있습니다. 결제 정보는 결제 제공업체가 처리하므로 EverBond는 전체 결제 카드 번호를 저장할 필요가 없습니다.",
          "EverBond는 개인정보를 판매하지 않으며 교차 맥락 행동 광고를 위해 개인정보를 공유하지 않습니다. 링크 공유 캐릭터는 사용자의 지시에 의해서만 공개되지만, 링크를 받은 사람은 누구나 열거나 전달할 수 있습니다.",
          "데이터는 서비스, 보안, 회계, 분쟁 해결 및 법적 의무에 합리적으로 필요한 기간만 보관됩니다. 생성 미디어와 계정 콘텐츠는 사용자가 삭제하거나 계정을 삭제할 때까지 남을 수 있으며, 백업, 사기 기록, 거래 기록, 계류 중인 분쟁 및 법적 보존 요건의 적용을 받습니다. 음성 오디오는 통화 제공을 위해 일시적으로 저장될 수 있고 통화 종료 후 또는 정기 정리 과정에서 삭제될 수 있습니다.",
          "위치에 따라 사용자는 개인정보에 대한 접근, 정정, 삭제, 제한, 이의 제기 또는 이동 가능한 사본을 받을 권리가 있을 수 있습니다. 요청은 계정 도구 또는 지원 연락처를 통해 제출할 수 있습니다. EverBond는 본인 확인을 할 수 있으며 법적으로 허용되거나 요구되는 경우 정보를 보관할 수 있습니다.",
          "EverBond는 합리적인 관리적, 기술적, 조직적 보호조치를 사용하지만 어떤 서비스도 절대적인 보안을 보장할 수 없습니다. 데이터는 적용되는 보호조치와 법률에 따라 사용자의 국가가 아닌 다른 국가에서 처리될 수 있습니다."
        ]
      },
      {
        "id": "safety",
        "title": "안전 정책",
        "paragraphs": [
          "EverBond는 가상의 성인 로맨스, 합의된 성인 역할극, 성숙한 스토리텔링, 합법적인 성인 창작 표현을 허용합니다. 제한 없음 또는 무검열은 불법, 착취, 비동의 또는 결과가 없다는 뜻이 아닙니다.",
          "금지되는 콘텐츠와 행위에는 아동 성적 학대물 또는 성적으로 묘사된 미성년자, 그루밍 또는 착취, 비동의 사적 이미지, 허가 없는 실존 인물의 성적 딥페이크 또는 사칭, 인신매매, 신빙성 있는 위협, 중대한 불법 행위 지침, 테러 지원, 신상 공개, 스토킹, 사기, 악성코드, 불법 무기 활동, 지식재산권·개인정보·퍼블리시티권 또는 기타 권리를 침해하는 콘텐츠가 포함됩니다.",
          "성인 또는 성적 맥락에서 사용되는 모든 캐릭터는 가상의 성인이어야 합니다. 나이가 모호한 캐릭터, 학령기 설정 또는 이 규칙을 회피하려는 시도는 삭제되거나 차단될 수 있습니다.",
          "EverBond는 비공개 또는 링크 공유 캐릭터를 통상적으로 사전 검토하지 않습니다. 그러나 비공개 또는 링크 공유 상태라고 해서 콘텐츠가 본 규칙에서 제외되는 것은 아닙니다. EverBond는 신고, 결제 남용, 법적 통지 또는 제공업체 장애를 조사할 수 있으며 모든 콘텐츠를 감시할 의무를 발생시키지 않고 콘텐츠나 계정을 삭제할 수 있습니다.",
          "EverBond는 재량에 따라 기능을 제한하고, 접근을 정지하거나, 계정을 폐쇄할 수 있으며, 사전 통지나 구체적인 이유를 제공할 의무가 없습니다. EverBond는 치료, 의료, 법률 자문, 금융 자문, 긴급 서비스 또는 위기 지원이 아닙니다."
        ]
      },
      {
        "id": "ai-disclaimer",
        "title": "AI 면책조항",
        "paragraphs": [
          "컴패니언, 메시지, 기억, 이미지, 동영상 및 음성은 인공지능 시스템에 의해 생성되거나 변환됩니다. 이는 가상이며 부정확하거나, 일관되지 않거나, 예상치 못하거나, 지연되거나, 이용할 수 없거나, 다른 자료와 유사할 수 있으며 실존 인물의 발언으로 취급해서는 안 됩니다.",
          "Ever Memory™는 자동화된 연속성 시스템입니다. 세부사항을 누락, 요약, 오해하거나 불완전하게 보관할 수 있습니다. 사용자는 대화를 초기화하고, 자신의 캐릭터를 편집하거나 삭제하며, 제공되는 계정 삭제 도구를 사용할 수 있습니다.",
          "현재의 무검열 라이브 음성 영상 통화 경험은 음성 기반이며 캐릭터 이미지를 사용하는 영상 통화 스타일의 컴패니언 인터페이스에 표시됩니다. 라이브 카메라 영상, 실제 사람과의 통화 또는 실시간 생성 캐릭터 동영상이 아닙니다.",
          "제3자 AI 및 인프라 제공업체는 기술, 안전, 지역, 용량 또는 이용 가능성 제한을 적용할 수 있습니다. EverBond는 모든 프롬프트가 수락되거나 모든 결과가 요청과 일치한다고 보장하지 않습니다."
        ]
      },
      {
        "id": "user-responsibility",
        "title": "사용자 책임",
        "paragraphs": [
          "사용자는 자신의 메시지, 프롬프트, 업로드, 참조 이미지, 캐릭터 프로필, 생성 결과, 공유 링크, 선물 선택, 콘텐츠 사용 또는 배포에 대해 전적으로 책임집니다.",
          "링크 공유 캐릭터는 EverBond의 공개 목록에 표시되지 않지만 링크를 얻은 사람은 누구나 접근할 수 있습니다. 수신자는 링크를 복사, 저장 또는 전달할 수 있습니다. 사용자는 수신자 선택, 링크 보호, 필요한 모든 허가 취득, 필요 시 접근 삭제 또는 변경에 책임이 있습니다.",
          "사용자가 만들거나 링크로 공유한 캐릭터는 사용자 콘텐츠입니다. 플랫폼이 저장하거나 처리한다는 이유만으로 EverBond가 이를 생성, 검토, 승인, 보증, 후원 또는 채택한 것이 아닙니다. EverBond는 사용자의 캐릭터 또는 링크 배포에서 발생하는 약속, 표시, 거래, 분쟁 또는 피해에 책임이 없습니다.",
          "사용자는 의료, 법률, 금융, 안전 중요, 신원 확인 또는 긴급 의사결정에 컴패니언을 의존해서는 안 됩니다. 사용자는 실제 세계의 행동과 적용 법률 준수에 계속 책임이 있습니다."
        ]
      },
      {
        "id": "content-ownership",
        "title": "콘텐츠 소유권",
        "paragraphs": [
          "사용자는 자신의 메시지, 업로드 자료, 참조 이미지 및 원본 캐릭터 프로필 콘텐츠에 대해 합법적으로 보유한 권리를 유지합니다. 사용자는 해당 콘텐츠를 제출하고 공유하는 데 필요한 모든 권리와 허가가 있음을 진술합니다.",
          "사용자는 EverBond와 그 서비스 제공업체에 요청된 서비스를 운영, 보호, 개선 및 제공하기 위해 합리적으로 필요한 범위에서만 사용자 콘텐츠를 호스팅, 저장, 복제, 전송, 변환, 이를 기반으로 생성, 표시 및 기타 처리할 수 있는 전 세계적, 비독점적, 제한적 라이선스를 부여하며, 여기에는 공유 링크를 받은 사람에게 표시하는 것이 포함됩니다.",
          "사용자와 EverBond 사이에서 EverBond는 서비스로 생성되었다는 이유만으로 사용자별 AI 결과의 소유권을 주장하지 않습니다. AI 결과는 저작권 보호 대상이 아닐 수 있고, 독점적이지 않을 수 있으며, 다른 사람을 위해 생성된 결과와 유사할 수 있습니다. 모든 사용은 적용 법률, 제3자 권리 및 제공업체 약관의 적용을 받습니다.",
          "EverBond는 소프트웨어, 인터페이스, 브랜드, 공식 캐릭터, 사이트 콘텐츠, 선별 카탈로그, Ever Memory™, EverCoin™, EverShop™, 데이터베이스 및 기타 플랫폼 지식재산에 대한 모든 권리를 보유합니다. 본 약관에 따른 제한적 서비스 이용권을 제외하고 플랫폼의 어떠한 권리도 이전되지 않습니다."
        ]
      },
      {
        "id": "copyright-impersonation",
        "title": "저작권 및 사칭",
        "paragraphs": [
          "사용자는 저작권, 상표권, 퍼블리시티권, 개인정보 또는 기타 권리를 침해하는 콘텐츠를 업로드, 생성, 제작 또는 공유할 수 없습니다. 실존 인물을 사칭하거나, 허가 없이 실존 인물의 외모를 사용하거나, 허위로 보증을 암시하거나, 타인을 신원에 관해 속이도록 설계된 캐릭터를 만들 수 없습니다.",
          "비공개 또는 링크 공유 상태라고 해서 침해나 사칭이 합법이 되는 것은 아닙니다. 사용자는 캐릭터 또는 미디어 생성에 사용되는 참조 이미지, 이름, 약력, 상표, 의상 및 기타 원본 자료에 책임이 있습니다.",
          "EverBond는 유효한 통지, 법원 명령, 제공업체 요구 또는 권리가 침해되고 있다는 합리적인 판단에 따라 접근을 비활성화하고, 자료를 삭제하고, 증거를 보존하고, 반복 침해자를 정지하거나 계정을 종료할 수 있습니다."
        ]
      },
      {
        "id": "ai-image-generation-similarity",
        "title": "AI 이미지 생성 및 유사성 고지",
        "paragraphs": [
          "이미지 및 동영상 기능은 사용자가 선택한 캐릭터 이미지 또는 업로드 이미지를 정체성 참조로 사용하고 프롬프트와 결합하여 새로운 합성 구도, 포즈, 의상, 각도, 배경, 움직임 또는 장면을 만들 수 있습니다.",
          "사용자는 참조 이미지를 소유하거나 그 사용에 필요한 모든 사람 및 권리자의 허가를 받아야 합니다. 다른 실존 인물의 비공개 이미지, 실존 인물의 사적 이미지, 저작권 자료 또는 사용 권한이 없는 외모를 제출하지 마십시오.",
          "생성 시스템은 실존 인물, 가상 캐릭터, 예술작품, 브랜드 또는 기타 결과와 예상치 못한 유사성을 만들 수 있습니다. EverBond는 독창성, 비침해, 정확한 정체성 일관성 또는 공개나 상업적 이용에 대한 적합성을 보장하지 않습니다.",
          "생성 미디어는 합성물이며 묘사된 사건이 실제로 발생했다는 증거가 아닙니다. EverBond는 생성 미디어를 생체 식별에 사용하지 않습니다. EverBond는 법률, 권리 주장, 제공업체 정책 또는 본 약관에 따라 필요한 경우 미디어를 삭제하거나 생성을 차단할 수 있습니다.",
          "EverBond의 공식 캐릭터 이미지는 라이선스된 리믹스 기반 AI 플랫폼을 사용해 만든 합성 결과이며 특정 실존 인물을 기반으로 하지 않습니다. 실존 인물 또는 외부 플랫폼에서 사용자가 업로드한 사진과의 유사성은 우연이며 EverBond 캐릭터에 대한 어떠한 권리나 주장도 부여하지 않습니다."
        ]
      },
      {
        "id": "section-2257",
        "title": "18 U.S.C. §§ 2257 및 2257A 고지",
        "paragraphs": [
          "EverBond는 성적으로 노골적인 콘텐츠를 만들기 위해 실제 출연자를 고용하거나 촬영, 사진 촬영 또는 연출하지 않습니다. EverBond의 공식 컴패니언 이미지는 인공지능 시스템으로 생성됩니다.",
          "사용자는 프롬프트, 허용된 참조 이미지 또는 기타 사용자 콘텐츠를 제출할 수 있습니다. 이러한 제출물에는 EverBond의 안전 정책, 사용자 책임, 저작권 및 사칭, AI 이미지 생성 및 유사성 고지가 계속 적용됩니다.",
          "시각적 묘사가 전적으로 컴퓨터로 생성되었고 실제 사람이 실제 또는 모의 성적으로 노골적인 행위에 참여하는 모습을 묘사하지 않는 범위에서, EverBond는 18 U.S.C. §§ 2257 및 2257A의 기록 보관 및 표시 요건이 해당 묘사에 적용되지 않는 것으로 이해합니다. 본 고지는 사용자가 제출한 모든 콘텐츠가 합성물이거나 적용 제외 대상임을 의미하지 않습니다."
        ],
        "emailParagraph": {
          "prefix": "본 고지에 관한 문의는 다음 이메일로 보낼 수 있습니다:",
          "email": "support@everbond.ai"
        }
      },
      {
        "id": "dmca-takedown",
        "title": "DMCA / 삭제 절차",
        "paragraphs": [
          "저작권자 또는 권한 있는 대리인은 아래에 기재된 법률 또는 지원 연락처를 통해 삭제 통지를 보낼 수 있습니다. 통지는 저작물을 식별하고, 침해가 의심되는 자료를 식별하고 위치를 설명하며, 연락처 정보를 제공하고, 선의의 진술과 통지가 정확하고 발신자가 권한을 보유한다는 위증죄 처벌 아래의 진술 및 물리적 또는 전자 서명을 포함해야 합니다.",
          "EverBond는 통지를 검토하는 동안 자료를 삭제하거나 비활성화할 수 있으며 영향을 받는 사용자에게 알릴 수 있습니다. 사용자는 적용 법률이 요구하는 정보를 포함한 반대 통지를 제출할 수 있습니다. EverBond는 법적으로 허용되는 경우 자료를 복원할 수 있으며 반복 침해자의 계정을 종료할 수 있습니다.",
          "사칭, 개인정보, 퍼블리시티권, 비동의 사적 이미지 및 기타 권리 관련 신고는 DMCA가 적용되지 않더라도 동일한 연락처를 사용할 수 있습니다.",
          "EverBond는 저작권 또는 기타 지식재산권을 반복적으로 침해하는 사용자의 계정을 적절한 상황에서 종료하도록 하는 정책을 유지하고 합리적으로 시행합니다."
        ]
      },
      {
        "id": "arbitration",
        "title": "중재 합의",
        "paragraphs": [
          "청구를 제기하기 전에 사용자는 분쟁과 요구하는 해결책을 설명하는 서면 통지를 보내고 최소 30일 동안 비공식 해결을 시도하는 데 동의합니다.",
          "적격 소액재판 사안과 지식재산, 개인정보, 계정 보안 또는 서비스 오용에 관한 임시 또는 금지명령 구제를 제외하고, 분쟁은 적용 법률이 달리 요구하지 않는 한 Federal Arbitration Act와 American Arbitration Association Consumer Arbitration Rules에 따른 구속력 있는 개별 중재로 해결됩니다.",
          "중재는 원격으로 또는 사용자의 거주 카운티에서 진행될 수 있습니다. 청구는 개별적으로 제기해야 합니다. 집단, 공동, 병합, 대표 및 사적 법무장관 절차는 법이 허용하는 최대 범위에서 포기됩니다.",
          "사용자는 본 약관을 처음 수락한 날부터 30일 이내에 법률 연락처로 서면 통지를 보내 중재를 거부할 수 있습니다. 통지에는 사용자 이름, 계정 이메일 및 중재를 거부한다는 명확한 진술이 포함되어야 합니다. 거부해도 EverBond 접근에는 영향을 주지 않습니다.",
          "본 조항의 일부가 집행 불가능한 경우에도 나머지는 법이 허용하는 최대 범위에서 계속 효력이 있습니다."
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "책임 제한",
        "paragraphs": [
          "EverBond는 있는 그대로, 이용 가능한 상태로 제공됩니다. 법이 허용하는 최대 범위에서 EverBond는 상품성, 특정 목적 적합성, 비침해, 정확성, 중단 없는 이용 가능성 및 AI 결과의 적합성에 관한 묵시적 보증을 부인합니다.",
          "EverBond는 사용자가 만들거나 링크로 공유한 캐릭터, 수신자 행위, 공유 링크의 분실 또는 전달, AI 오류, 제공업체 거부 또는 장애, 데이터 손실, 감정적 반응, 관계 결과, 가상 콘텐츠 의존, 사용자 콘텐츠의 무단 사용, 또는 간접적·부수적·특별·결과적·징벌적·모범적 손해에 책임이 없습니다.",
          "법이 허용하는 최대 범위에서 서비스로 인한 EverBond의 총 책임은 청구 원인이 된 사건 전 12개월 동안 청구인이 EverBond에 지급한 금액을 초과하지 않습니다. 일부 관할권은 특정 제외를 허용하지 않으므로 해당 제외는 허용되는 범위에서만 적용됩니다."
        ]
      },
      {
        "id": "indemnification",
        "title": "면책 및 배상",
        "paragraphs": [
          "법이 허용하는 범위에서 사용자는 사용자 콘텐츠, 참조 이미지, 생성 미디어, 공유 링크, 침해 또는 사칭, 법률 또는 본 약관 위반, 서비스 오용에서 발생하는 청구, 손실, 책임, 손해, 판결 및 법률 비용으로부터 EverBond, 그 운영자, 소유자, 계열사, 계약자, 제공업체, 직원 및 대리인을 방어하고, 배상하며, 면책하는 데 동의합니다.",
          "EverBond는 적용되는 청구의 방어를 통제할 수 있으며 사용자는 합리적인 협조를 제공하는 데 동의합니다. 법률이 금지하는 경우 본 조항은 EverBond 자체의 불법 행위에 대한 배상을 요구하지 않습니다."
        ]
      },
      {
        "id": "refund",
        "title": "환불 정책",
        "paragraphs": [
          "EverBond에는 반복 구독이 없습니다. EverCoin™은 일회성 디지털 번들로 구매되며 양도할 수 없고 현금 가치가 없으며 적격 EverBond 기능에만 사용할 수 있습니다.",
          "채팅, 이미지, 음성 통화, 선물 및 동영상 비용은 요청이 예약되거나 제공될 때 차감됩니다. 적격 생성 또는 처리 요청이 완료 전에 실패하면 예약된 EverCoin™이 자동으로 반환될 수 있습니다. 중복 청구, 무단 청구, 기술적 장애 및 기타 환불 요청은 결제 제공업체 규칙과 강행 소비자법에 따라 사례별로 검토됩니다.",
          "법률이 요구하는 경우를 제외하고 사용된 EverCoin™과 성공적으로 제공된 디지털 서비스는 환불되지 않습니다. 지불 거절, 사기 또는 결제 취소로 인해 EverCoin™ 제거, 채무 조정, 계정 제한 또는 정지가 발생할 수 있습니다."
        ]
      },
      {
        "id": "contact",
        "title": "연락처",
        "paragraphs": [
          "지원, 개인정보 요청, 법적 통지, 중재 거부, 저작권 신고, 사칭 신고 및 삭제 요청에는 도움말 센터에 표시된 EverBond 지원 이메일을 사용하십시오.",
          "계정 이메일, 명확한 제목, 관련 URL 또는 캐릭터 링크 및 요청을 조사하기에 충분한 정보를 포함하십시오. 비밀번호, 전체 결제 카드 번호 또는 불필요한 민감정보를 포함하지 마십시오."
        ]
      }
    ],
    "dmcaAgent": {
      "title": "DMCA 지정 대리인",
      "department": "Copyright Compliance Department",
      "organization": "EverBond",
      "addressLine1": "1407 Sinclair Rd Ste 207",
      "addressLine2": "Early Branch, SC 29916",
      "phoneLabel": "전화",
      "phone": "803-903-2810",
      "emailLabel": "이메일",
      "email": "support@everbond.ai"
    }
  }
};
