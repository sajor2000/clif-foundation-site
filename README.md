# CLIF Foundation website

Public site for the CLIF Foundation (Illinois nonprofit; 501(c)(3) recognition in preparation) plus a Clerk-gated board portal for documents. Design system lives in `design/` (reference kit). Stack: **Next.js App Router**, **TypeScript**, **Tailwind**, **Effect 4**, **Convex**, **Clerk**. Gifts are sent by Zelle. Card checkout is not offered.

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
- `ZELLE_RECIPIENT` — optional email or US mobile enrolled for Zelle. Defaults to `info@clificufoundation.org`
- `STRIPE_SECRET_KEY` — unused. Card checkout is not the giving path

Without Clerk keys the public site still works; `/portal` shows a configure-env message. `/api/donate` returns Zelle instructions (`200`).

## Routes

| Route | Auth |
|-------|------|
| `/`, `/mission`, `/our-work`, `/research`, `/board`, `/support` | Public |
| `/portal` | Clerk-protected board documents |
| `/portal/sign-in` | Clerk sign-in (not linked from public nav) |
| `/api/donate` | Public → Zelle instructions |

## Effect 4

Workflow helpers use **effect@4.0.2** (Effect 4 APIs: `Effect.gen`, `Data.TaggedError`, `Schema.decodeUnknownEffect`, `Effect.runPromiseExit`, `Cause.squash`). Kept **out of** Convex UDF bodies.

| Module | Program | Used by |
|--------|---------|---------|
| `src/lib/effect/documents.ts` | `validateDocumentMeta` | Portal upload pipeline |
| `src/lib/effect/upload.ts` | `uploadDocumentProgram` | `/portal` client upload (validate → URL → POST → save) |
| `src/lib/effect/donations.ts` | `createDonationInstructions` | `/api/donate` → Zelle recipient, memo, optional amount |
| `src/lib/effect/inquiry.ts` | `validateInquiry` | `/api/inquiry` → mailto draft |
| `src/lib/effect/http.ts` | `exitToJsonResponse` | Route Handler Exit → HTTP mapping |

## Deploy on Vercel + Convex

Repo is wired for the [Convex + Vercel](https://docs.convex.dev/production/hosting/vercel) pattern. `vercel.ts` sets the build command to deploy Convex functions, then run `next build` with `NEXT_PUBLIC_CONVEX_URL` injected.

### One-time setup

1. **GitHub** — this repo: https://github.com/sajor2000/clif-foundation-site
2. **Convex cloud project** (not anonymous local):
   ```bash
   npx convex login
   npx convex dev   # link/create the cloud project (omit CONVEX_AGENT_MODE)
   ```
   Then in the Convex dashboard on the **production** deployment:
   - Set env `CLERK_JWT_ISSUER_DOMAIN` (Clerk Frontend API URL)
   - Generate a **Production** deploy key (`deployment:deploy`)
   - Generate a **Preview** deploy key if you want preview backends
3. **Vercel** — Import the GitHub repo (Framework: Next.js). Confirm build command matches `vercel.ts`:
   ```bash
   npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL
   ```
4. **Vercel environment variables**

   | Variable | Environments | Notes |
   |----------|--------------|--------|
   | `CONVEX_DEPLOY_KEY` | Production | Production deploy key from Convex |
   | `CONVEX_DEPLOY_KEY` | Preview | Preview deploy key (separate value) |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Production + Preview | Board portal |
   | `CLERK_SECRET_KEY` | Production + Preview | Board portal |
   | `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Production + Preview | `/portal/sign-in` |
   | `STRIPE_*` | — | Unused. Giving is Zelle, not card checkout |

   Do **not** set `CONVEX_AGENT_MODE` on Vercel. `NEXT_PUBLIC_CONVEX_URL` is set for the build by `convex deploy --cmd` when `CONVEX_DEPLOY_KEY` is present; you may also pin it in Vercel if you prefer.
5. **Clerk** — add the Vercel production (and preview) URLs to allowed origins / redirect URLs; sign-in path stays `/portal/sign-in`.
6. Deploy — push to `main` for production, or open a PR for preview. Optional: custom domain after the first green deploy.

Local development still uses `CONVEX_AGENT_MODE=anonymous npx convex dev` + `npm run dev` (see above). Use `npx convex deploy` only against the cloud production/preview backends.

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

Say: Illinois nonprofit corporation, EIN issued, 501(c)(3) recognition in preparation. Do not say the application is already pending. Do not claim tax-exempt status or that a gift is deductible today. On Support, a gift made while recognition is in preparation may qualify later if the IRS grants recognition effective as of formation (typical when the application is filed on time). Donors should ask a tax adviser.
