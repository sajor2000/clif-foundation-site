# CLIF Foundation website

Public site for the CLIF Foundation (Illinois nonprofit; 501(c)(3) pending) plus a Clerk-gated board portal for documents. Design system lives in `design/` (reference kit). Stack: **Next.js App Router**, **TypeScript**, **Tailwind**, **Effect 4**, **Convex**, **Clerk**. Stripe checkout is stubbed as Coming soon.

## Local development

```bash
npm install
cp .env.example .env.local
# Optional: fill Clerk / Convex keys. Public pages run without them.

# Terminal 1 — Convex (agent/cloud: anonymous mode)
CONVEX_AGENT_MODE=anonymous npx convex dev

# Terminal 2 — Next.js on port 43127
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server on **43127** |
| `npm run build` | Production build (`next build`) |
| `npm run start` | Start production server on 43127 |
| `npm run convex:dev` | `CONVEX_AGENT_MODE=anonymous npx convex dev` |

### Env checklist

See `.env.example`. Minimum for a full local stack:

- `NEXT_PUBLIC_CONVEX_URL` — from Convex CLI
- `CLERK_JWT_ISSUER_DOMAIN` — Clerk Frontend API URL (Convex dashboard + `convex/auth.config.ts`)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — board portal
- `STRIPE_SECRET_KEY` — omit until bank + Stripe Nonprofit exist (UI stays Coming soon)

Without Clerk/Stripe keys the public site still works; `/portal` shows a configure-env message; `/api/donate` returns **503** with “Online giving — coming soon”.

## Routes

| Route | Auth |
|-------|------|
| `/`, `/mission`, `/our-work`, `/research`, `/board`, `/support` | Public |
| `/portal` | Clerk-protected board documents |
| `/portal/sign-in` | Clerk sign-in (not linked from public nav) |
| `/api/donate` | Public stub → 503 Coming soon |

## Effect 4

Workflow helpers use **effect@4.0.2** (Effect 4 APIs: `Effect.gen`, `Data.TaggedError`, `Schema.decodeUnknownEffect`, `Effect.runPromiseExit`, `Cause.squash`). Kept **out of** Convex UDF bodies.

| Module | Program | Used by |
|--------|---------|---------|
| `src/lib/effect/documents.ts` | `validateDocumentMeta` | Portal upload pipeline |
| `src/lib/effect/upload.ts` | `uploadDocumentProgram` | `/portal` client upload (validate → URL → POST → save) |
| `src/lib/effect/donations.ts` | `createDonationSession` | `/api/donate` → `DonationsNotConfigured` / 503 |
| `src/lib/effect/inquiry.ts` | `validateInquiry` | `/api/inquiry` → mailto draft |
| `src/lib/effect/http.ts` | `exitToJsonResponse` | Route Handler Exit → HTTP mapping |

## Deploy on Vercel

Production host is **Vercel** (stock Next.js App Router — no custom `output` mode, no special build command beyond `next build`).

1. Push this repo to GitHub and **Import** the project in Vercel (Framework Preset: **Next.js**).
2. Build settings: leave defaults (`next build` / Next.js preset). No `vercel.json` is required.
3. Set Production environment variables in the Vercel project:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
   - Later: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. In the Convex dashboard, set `CLERK_JWT_ISSUER_DOMAIN` on the **production** deployment, then run `npx convex deploy` only for that production backend (not during local/cloud agent development — use `npx convex dev` / `CONVEX_AGENT_MODE=anonymous` there).
5. Point Clerk production redirect URLs at the Vercel domain; keep `/portal/sign-in` as the board sign-in path.
6. Optional: attach a custom domain after the first successful deploy.

This README does not claim a live Vercel URL until you complete the steps above.

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
