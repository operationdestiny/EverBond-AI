# EverBond AI

EverBond AI is a memory-first AI character platform where every conversation can continue over time.

Unlike traditional AI chat apps, EverBond companions remember shared experiences, routines, promises, and relationship progress through Living Memory™.

---

## Current Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- Vercel

### Backend
- Supabase
  - PostgreSQL
  - Authentication
  - Living Memory
  - Storage
  - Row Level Security

### Payments
- Paddle Billing

### Email
- Resend

### DNS / Security
- Cloudflare

### Version Control
- GitHub

---

## AI

The AI provider has intentionally been abstracted.

The project supports plugging in a hosted language model later without changing the application architecture.

Future providers include:

- AI Chat Model
- Image Generation
- Text-to-Speech
- Realtime Voice

---

## Character System

Characters are stored as structured JSON and imported into Supabase.

Each character includes:

- identity
- relationship
- personality
- opening scenario
- first message
- AI profile
- SEO metadata
- feature flags

The repository currently contains:

- EverBond Girls
- Anime & Fantasy
- EverBond Guys
- Public Creations

---

## Living Memory™

EverBond stores relationship information instead of only conversation history.

Examples include:

- shared routines
- promises
- inside jokes
- important events
- emotional moments
- relationship progression

This allows conversations to continue naturally over time.

---

## Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Import characters:

```bash
npm run import:characters
```

---

## Environment Variables

Copy:

```
.env.example
```

to

```
.env.local
```

and fill in the required credentials.

---

## Documentation

Additional documentation is located in:

```
/docs
```

Including:

- Character Import
- Ever Memory
- Database
- AI Provider
- Deployment

---

## Project Status

Current development focuses on:

- Character system
- Living Memory
- AI prompt assembly
- Fine-tuned roleplay model
- Paddle subscriptions
- Voice
- Image generation

---

© 2026 EverBond AI
