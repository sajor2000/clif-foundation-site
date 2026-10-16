#!/bin/sh
# Vercel build entrypoint.
# With CONVEX_DEPLOY_KEY: deploy Convex functions, then build Next.js with
# NEXT_PUBLIC_CONVEX_URL injected (production, and previews once a Convex
# preview deploy key is added for the Preview environment).
# Without it: previews build the site alone; Convex-backed features stay off.
# Production must never ship without Convex, so it fails loudly instead.
set -eu

if [ -n "${CONVEX_DEPLOY_KEY:-}" ]; then
  exec npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL
fi

if [ "${VERCEL_ENV:-}" = "production" ]; then
  echo "CONVEX_DEPLOY_KEY is missing for the Production environment." >&2
  exit 1
fi

echo "CONVEX_DEPLOY_KEY not set for ${VERCEL_ENV:-this} build; building without Convex deploy."
exec npm run build
