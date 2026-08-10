# Offline chat-intro translation model

EverBond's one-time/resumable chat-intro localization workflow uses:

- `facebook/m2m100_418M`
- Purpose: offline machine translation of the public companion opening scenario and first message into ES, FR, DE, JA, and KO.
- License: MIT (as declared by the model publisher on Hugging Face).
- The model is not used at runtime by EverBond and is not called per user/chat.
- No Venice/OpenAI translation API is used by this workflow.

The generated translations are stored in Supabase table `public.character_chat_translations` and read as static cached content.
