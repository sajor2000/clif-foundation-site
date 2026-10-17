# CLIF Foundation website

Public site for the CLIF Foundation (Illinois nonprofit; 501(c)(3) pending), plus a **private board portal** at `/portal` (Clerk + Convex). Design system lives in `design/` (reference kit). Stack: **Next.js App Router**, **TypeScript**, **Tailwind**, **Effect 4**, **Clerk**, **Convex**. Stripe checkout is stubbed as Coming soon.

## Local development

```bash
npm install
cp .env.example .env.local   # optional: Clerk + Convex for /portal

# Terminal 1 — Convex (anonymous local dev)
npm run convex:dev

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
| `npm run test:e2e` | Browser tests (system Chrome) against the production build; run `npm run build` first. `BASE_URL=https://www.clificufoundation.org npm run test:e2e` tests the live site |
| `npm run test:unit` | Pure unit tests (e.g. quorum helpers) |
| `npm run convex:dev` | Anonymous local Convex backend |

### Env checklist

See `.env.example`. The public site needs no variables.

- `NEXT_PUBLIC_CONVEX_URL`, `CLERK_*`, `CLERK_JWT_ISSUER_DOMAIN` (Convex dashboard) — board portal
- `STRIPE_SECRET_KEY` — omit until bank + Stripe Nonprofit exist (UI stays Coming soon; `/api/donate` returns **503**)

## Routes

| Route | Auth |
|-------|------|
| `/`, `/mission`, `/our-work`, `/research`, `/board`, `/support` | Public |
| `/portal`, `/portal/reporting`, `/portal/documents`, … | Clerk-protected board workspace (not in public nav) |
| `/portal/sign-in` | Board sign-in |
| `/api/donate` | Public stub → 503 Coming soon |

## Effect 4

Workflow helpers use **effect@4.0.2** (Effect 4 APIs: `Effect.gen`, `Data.TaggedError`, `Schema.decodeUnknownEffect`, `Effect.runPromiseExit`, `Cause.squash`).

| Module | Program | Used by |
|--------|---------|---------|
| `src/lib/effect/donations.ts` | `createDonationSession` | `/api/donate` → `DonationsNotConfigured` / 503 |
| `src/lib/effect/inquiry.ts` | `validateInquiry` | `/api/inquiry` → mailto draft |
| `src/lib/effect/http.ts` | `exitToJsonResponse` | Route Handler Exit → HTTP mapping |

## Deploy on Vercel

Public site needs no env vars. For the **board portal**, production must deploy Convex functions and Next.js together:

```bash
# Set CONVEX_DEPLOY_KEY in Vercel (or CI). Override the project Build Command with:
npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL
```

`vercel.json` currently defaults to `npm run build` (Next only)—switch the Vercel Build Command to the Convex deploy line above when enabling `/portal` in production. Preview PRs without `CONVEX_DEPLOY_KEY` still build the public site.

### Board portal production checklist

1. Create a Clerk application; activate the **Convex** integration; copy Frontend API URL.
2. Create/link a Convex cloud project (`npx convex login` then `npx convex dev` locally).
3. On the Convex **prod** deployment, set `CLERK_JWT_ISSUER_DOMAIN` to that Frontend API URL.
4. On Vercel: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CONVEX_DEPLOY_KEY`; Build Command = Convex deploy line above.
5. First sign-in: open `/portal` → **Claim admin** → add director emails under **Members** (see `scripts/seed-board-allowlist.md`).

### Portal features (board)

| Job | Route |
| --- | --- |
| Get paperwork (ZIP / manifest) | `/portal/reporting` |
| Documents upload | `/portal/documents` |
| Meetings + minutes | `/portal/meetings` |
| Votes | `/portal/votes` |
| Compliance + audit CSV | `/portal/compliance` |
| Annual COI | `/portal/coi` |
| Policies | `/portal/policies` |
| Members allowlist (admin) | `/portal/members` |

`/portal` is noindex and omitted from the public sitemap. See [`docs/plans/private-board-portal.md`](docs/plans/private-board-portal.md).

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
