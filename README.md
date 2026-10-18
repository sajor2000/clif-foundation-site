# CLIF Foundation website

Public site for the CLIF Foundation (Illinois nonprofit; 501(c)(3) pending), plus a **private board portal** at `/portal` (Clerk + Convex). Design system lives in `design/` (reference kit). Stack: **Next.js App Router**, **TypeScript**, **Tailwind**, **Effect 4**, **Clerk**, **Convex**. Online giving uses **Givebutter** on `/support`.

## Local development

```bash
npm install
cp .env.example .env.local   # Givebutter widget ID; Clerk + Convex for /portal

# Terminal 1 — Convex dev deployment
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
| `npm run test:unit` | Pure unit tests (tally, quorum, access, minutes, uploads) |
| `npm run test:convex` | Convex function tests (convex-test + Vitest): access, voting, minutes, documents, compliance |
| `npm run convex:dev` | Convex dev deployment (watch + push functions) |

### Env checklist

See `.env.example`. The public site runs without variables; the giving form needs a Givebutter widget ID.

- `NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID` — required to show the Givebutter form on `/support` (or the older `NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_CODE`)
- `NEXT_PUBLIC_GIVEBUTTER_ACCOUNT_ID` — optional override (defaults to the Foundation widget account)
- Setup details: [`docs/GIVEBUTTER.md`](docs/GIVEBUTTER.md)
- `NEXT_PUBLIC_CONVEX_URL`, `CLERK_*`, `CLERK_JWT_ISSUER_DOMAIN` (Convex dashboard) — board portal

## Routes

| Route | Auth |
|-------|------|
| `/`, `/mission`, `/our-work`, `/research`, `/board`, `/support` | Public |
| `/portal`, `/portal/reporting`, `/portal/documents`, … | Clerk-protected board workspace (not in public nav) |
| `/portal/sign-in` | Board sign-in |
| `/api/donate` | Public stub → 503 (use Givebutter on `/support`) |

## Effect 4

Workflow helpers use **effect@4.0.2** (Effect 4 APIs: `Effect.gen`, `Data.TaggedError`, `Schema.decodeUnknownEffect`, `Effect.runPromiseExit`, `Cause.squash`).

| Module | Program | Used by |
|--------|---------|---------|
| `src/lib/effect/donations.ts` | `createDonationSession` | `/api/donate` → `DonationsNotConfigured` / 503 |
| `src/lib/effect/inquiry.ts` | `validateInquiry` | `/api/inquiry` → mailto draft |
| `src/lib/effect/http.ts` | `exitToJsonResponse` | Route Handler Exit → HTTP mapping |

## Deploy on Vercel

The Vercel project builds with `npm run build` (see `vercel.json`). Push to `main` for production; pull requests get preview deployments.

Set `NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID` on Production and Preview so the Support page shows the form.

For the **board portal**, `vercel.json` runs `npx convex deploy --cmd 'npm run build'` whenever `CONVEX_DEPLOY_KEY` is set, so Convex functions and the site ship together; without the key (e.g. previews) it builds the public site only.

### Board portal production setup

| Piece | Where | Value |
| --- | --- | --- |
| Clerk app | `CLIF Foundation Board Portal` | prod instance on `clificufoundation.org` (DNS records in Vercel DNS) |
| Clerk JWT template | Clerk prod instance | name `convex`; claims `aud=convex`, `email`, `name`, `email_verified` |
| Convex project | `j-c-rojas/clif-foundation-site` | prod env: `CLERK_JWT_ISSUER_DOMAIN=https://clerk.clificufoundation.org`, `BOOTSTRAP_ADMIN_EMAIL=info@clificufoundation.org` |
| Vercel (Production) | project env | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CONVEX_DEPLOY_KEY` |

### Backups

`scripts/backup-convex-prod.sh` exports the production Convex deployment (tables and stored files) to `~/Dropbox/Work/CLIF Foundation/Backups/convex-prod/` and keeps the newest 30. On J.C.'s MacBook it runs daily at 03:15 via the LaunchAgent `com.jc.clif-convex-backup` (log: `~/Library/Logs/clif-convex-backup.log`). Restore with `npx convex import --deployment <name> <snapshot.zip>`.

### Access

- Sign-up is open (email or Google). Signing up grants nothing: a person must click **Request access** on `/portal`, and an admin approves or denies it under **Members → Pending requests**.
- **Claim admin** only works while the allowlist is empty, and only for `BOOTSTRAP_ADMIN_EMAIL` (set on every Convex deployment; if it is missing, nobody can claim admin).
- The allowlist is keyed by verified email. See `scripts/seed-board-allowlist.md` to seed rows directly.

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
