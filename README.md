<<<<<<< HEAD
# EverBond AI Launch

**EverBond AI** — AI companions that will remember you.

This Launch is aligned to the locked product direction:

- Premium memory-first AI character chat
- No signup before free trial
- 40 one-time free messages
- Paid unlocks Living Memory™ and continuation
- Paid users can create private/public characters
- Public characters require structured fields, automatic scan, and report path
- Static profile images only
- No voice, video, or AI image generation
- Dark cinematic UI
- Large character portrait in chat
- Fireworks-ready model adapter for `EverBond-27B`
- Supabase memory persistence
- Stripe subscription placeholders
- 200 high-quality AI character records

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Fireworks AI
- Stripe Checkout
- Resend
- Cloudflare DNS/security
- Private GitHub repo

## Install

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Core Product Rules

1. The free trial is no-signup.
2. The character quality is never paywalled.
3. Chat usage is limited because chat costs money.
4. Paid users get continuation, saved Living Memory™, private characters, and public creation.
5. Characters reply in scene style: action + dialogue + emotional subtext + story movement.
6. Supabase stores persistent memory; the model does not.
7. EverBond-27B has two prompt modes:
   - Chat Mode
   - Memory Mode

## Pricing

- Free: 40 one-time messages
- Standard: $9.99/mo — 2,000 messages
- Premium: $19.99/mo — 7,500 messages
- Elite: $24.99/mo — fair-use soft cap around 20,000 messages

## Important

The repo contains production-shaped scaffolding and frontend/UI. The live Supabase, Stripe, Fireworks, and Resend keys must be added in `.env.local`.


## Logo files

The uploaded EverBond AI logo is included at:

- `public/everbond-logo.png`
- `public/favicon.png`
- `src/app/icon.png`

Next.js uses `src/app/icon.png` and the metadata icons for the browser tab/favicon.


## V4 Product Rules

### Free users
- Start chatting instantly.
- A device token identifies the guest for message limits, favorites, and temporary chat history.
- No signup is required before chatting.

### Upgrade flow
- User clicks upgrade.
- Ask for email only.
- Send a magic link with Resend from `noreply@everbond.ai`.
- Verify the email.
- Create the user record.
- Attach the device token to the new account.
- Redirect to Stripe Checkout.

### Paying user profile
- Username
- Subscription status
- Created characters
- Favorites

### Public characters
- Public characters show tags, view count, creator label, favorite star, and quiet report button.
- Public characters cannot be deleted after publishing because users may have chatted with them or favorited them.
- User-generated public characters should match official character card styling.

### Private characters
- Private characters are visible only to the creator.
- Private characters can be deleted.

### Account deletion
- Deletes the EverBond profile.
- Deletes private characters.
- Does not automatically cancel Stripe subscriptions.
- Users must cancel through Stripe to prevent future charges.


## V5 polish

- Character catalog grid loosened for better card readability.
- Public character cards now show one view number only.
- Hero logo/title scaled up.
- Hero brand subtitle scaled slightly down.
- Homepage scroll cue updated to “Scroll down for details.”


## V6 polish

- Homepage scroll cue placed clearly under the hero buttons.
- Hero logo scaled up.
- Hero brand name is pink.
- Hero brand subtitle made slightly smaller.
- Seed character names/archetypes rewritten to feel more natural and human.
- Removed AI-bot-style seed character concepts.


## V7 polish

- Contact support email styled in pink.
- Homepage hero copy simplified and duplicate Living Memory line removed.
- Character cards no longer show creator labels at the bottom.
- Character detail pages show creator, views, Save, and Report controls.


## V8 updates

- Catalog now uses the uploaded assets:
  - EverBond Girls: 1056
  - Anime & Fantasy: 500
  - EverBond Guys: 200
  - Public Creations: 248
- Home video added: /everbond-home-video.mp4
- Memory branding changed to Ever Memory™.
- Character tabs added in the requested order.
- Official EverBond characters do not show views.
- Public Creations show views and share action.
- Character cards are back to 4 per row.
- Browser TTS play button added for character replies.
- Typing indicator added.
- Reset conversation added.
- Language dropdown added: English, Spanish, French, Japanese, German, Korean.
- Prompt includes: Respond in the same language the user uses.
- FAQ section added.
- Community creation rules: 100 max per user, complete profile requirements, public/private only.
- Legal age confirmation wording added without popup.


## V9 updates

- User-facing terminology changed from character to companion.
- Companion cards now open directly to chat.
- Former detail route redirects to chat.
- Chat avatar opens a clean full-image modal.
- Companion catalog regenerated with unique first + last names.
- Companion profiles are category-aware and no longer use AI-bot-style descriptions.


## V10 fixes

- Fixed CharacterGrid runtime error by making the grid defensive when no companion array is passed.
- Removed the homepage video.
- Updated slogan to “AI companions that will remember you.”


## V11 route fix

- Restored `/characters` as the working companions catalog route.
- Added `/companions` redirect to `/characters`.
- Fixed catalog imports and grid props.
- Kept visible wording as “Companions.”
- Cards still open directly to chat.


## V12 launch-ready pass

- Completed companion metadata inside the chat sidebar/header.
- Official companions show no creator label and no view count.
- Public Creations show creator, views, save, share, and report.
- Companion cards open directly to chat.
- `/character/[slug]` redirects to `/chat/[slug]`.
- Portrait modal supports X close, Escape close, and click-outside close.
- Added image-to-companion matching audit documentation.
- Added V12 sanity check documentation.


## V14 design rebuild

- Home page is now the companion browser/discovery page.
- EverBond Girls show first by default.
- Old homepage/marketing content moved to `/why-everbond`.
- Pricing page includes Why EverBond information underneath the price cards.
- Added `/coins` EverCoin visual scaffold for gifts, cached images, voice messages, and voice calls.
- Chat page redesigned with anchored companion panel and opening scenario.
- Voice playback button removed from chat.
- Chat input uses thin pink branded outline.
- Pink button border/highlight style added site-wide.
- Language selector added to the top navigation.
- Bottom catalog message: More Exciting Companions Coming!


## V15 layout refinement

- Top navigation simplified: left slide-out menu, top-right language, coin count, login.
- Main buttons moved into slide-out left panel.
- Home banner now stretches full width and advertises EverCoin with EverBond logo/slogan integrated.
- Removed top character image collage from homepage.
- Companion grid now starts closer to the left and fills the available page width.
- Chat page action buttons made smaller.


## V17 dashboard redesign

- Full PolyBuzz/Flipped-style dashboard layout with persistent left sidebar.
- EverBond gold infinity logo is used as the brand mark instead of the mockup heart.
- Neon pink EverBond theme applied across sidebar, cards, banner, and buttons.
- Home page rebuilt as a discovery dashboard with EverCoin hero banner.
- Cards restyled with image-first layout, view count, save star, Ever Memory badge, tags, and compact descriptions.
- Dashboard shell applied across key pages.


## New Design V1 Lock

This package locks the new EverBond AI dashboard direction:
- left sidebar
- EverCoin hero banner
- neon pink EverBond theme
- gold infinity logo
- discovery-first companion grid

Use this as the new base for future small edits.


## Final Usable Design Lock

Clean coded layout:
- no screenshot-based banner
- no duplicate top search
- fixed sidebar
- coded EverCoin hero
- 5-card desktop grid
- smaller companion card images


## Good Screenshot Build

This is the usable coded version of the good screenshot-style dashboard.


## Good Screenshot Build V2

- Taller companion image area.
- Smaller pulled-out page scale.
- Refined stacked pink infinity coins.


## EverBond Pixel UI v1.0

Measured rebuild from the approved screenshot direction:
- fixed 230px sidebar
- 56px topbar
- 182px EverCoin hero
- 5-card desktop companion grid
- 212px card image area
- solid black background
- pink infinity branding
- CSS-built stacked infinity coins


## V18 Screenshot Lock

This package is the locked homepage shell based on the approved screenshot reference.


## V19 Real Coin Hero

The hero banner now uses the approved uploaded banner artwork so the stacked coins match the reference instead of using CSS circles.


## V20 Fixed Controls + Categories

- Top controls forced to far right.
- Category tabs restored.
- Hero Buy EverCoin click area links to `/coins`.


## V21 Sidebar + Brand Cleanup

- Wider sidebar.
- Taller character cards.
- Brand text simplified to EverBond.
- Sidebar simplified.
- Legal now includes Safety section.


## V30 Finished Homepage

- Complete hero banner.
- Companion cards restored below the hero.
- Five-card desktop grid.


## V48 hero fix
- The hero now renders the finalized `2048x300` banner as a normal `<img>` instead of a CSS background.
- This prevents top/bottom cutoff, restores the full border, and avoids internal stretching/cropping.
- Run with `npm install` then `npm run dev`.
=======
# EverBond-AI
>>>>>>> 080d0371804f874dc4cdc53e81df8a6f4269fce6
