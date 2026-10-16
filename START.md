# Start here

## Local

```bash
npm install
cp .env.example .env.local
CONVEX_AGENT_MODE=anonymous npx convex dev   # terminal 1
npm run dev                                  # terminal 2 → http://127.0.0.1:43127
```

Public pages run without Clerk/Stripe. Full notes: `README.md`.

## Vercel + Convex (production)

1. `npx convex login` and link a cloud project (`npx convex dev` without agent mode).
2. Set `CLERK_JWT_ISSUER_DOMAIN` on the Convex production deployment; create Production (+ Preview) deploy keys.
3. Import https://github.com/sajor2000/clif-foundation-site in Vercel.
4. Add Clerk keys (and `CONVEX_DEPLOY_KEY` when the board portal needs a Convex backend). Build command is in `vercel.ts`; without the deploy key it falls back to `npm run build`.
5. Push to `main`.
