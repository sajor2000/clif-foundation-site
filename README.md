# CLIF Foundation website

Public site for the CLIF Foundation (Illinois nonprofit; 501(c)(3) pending). Design system lives in `design/` (reference kit). Stack: **Next.js App Router**, **TypeScript**, **Tailwind**, **Effect 4**. Stripe checkout is stubbed as Coming soon.

## Local development

```bash
npm install
npm run dev   # Next.js on port 43127
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server on **43127** |
| `npm run build` | Production build (`next build`) |
| `npm run start` | Start production server on 43127 |

### Env checklist

See `.env.example`. The public site needs no variables.

- `STRIPE_SECRET_KEY` — omit until bank + Stripe Nonprofit exist (UI stays Coming soon; `/api/donate` returns **503**)

## Routes

| Route | Auth |
|-------|------|
| `/`, `/mission`, `/our-work`, `/research`, `/board`, `/support` | Public |
| `/api/donate` | Public stub → 503 Coming soon |

## Effect 4

Workflow helpers use **effect@4.0.2** (Effect 4 APIs: `Effect.gen`, `Data.TaggedError`, `Schema.decodeUnknownEffect`, `Effect.runPromiseExit`, `Cause.squash`).

| Module | Program | Used by |
|--------|---------|---------|
| `src/lib/effect/donations.ts` | `createDonationSession` | `/api/donate` → `DonationsNotConfigured` / 503 |
| `src/lib/effect/inquiry.ts` | `validateInquiry` | `/api/inquiry` → mailto draft |
| `src/lib/effect/http.ts` | `exitToJsonResponse` | Route Handler Exit → HTTP mapping |

## Deploy on Vercel

The Vercel project builds with `npm run build` (see `vercel.ts`). Push to `main` for production; pull requests get preview deployments. No environment variables are required.

A board document portal (Clerk + Convex) was removed in October 2026 to keep the site static; it is recoverable from git history if needed.

## Design

`design/` contains the approved design kit (tokens, components, `CLIF Foundation Site.dc.html`). UI primitives are ported into `src/components/` — not shadcn.

Agent design context (Impeccable):

- `PRODUCT.md` — product truth for agents
- `DESIGN.md` + `.impeccable/design.json` — CLIF visual system (ink / petrol / mint, Funnel fonts); do not replace with generic aesthetics
- `.cursor/skills/impeccable` — Cursor-scoped skill + `preToolUse` design hook (`.cursor/hooks.json`, enabled in `.impeccable/config.json`)

```bash
# Optional: refresh skills if the CLI download works in your environment
npx impeccable install
# Hooks
./.cursor/skills/impeccable/scripts/impeccable hook-admin on
```

## Legal copy bounds

Say exactly: Illinois nonprofit corporation, EIN issued, 501(c)(3) application pending. Do not claim deductibility until the IRS determination letter is posted.
