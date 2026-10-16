import type { VercelConfig } from "@vercel/config/v1";

/**
 * Vercel project config for CLIF Foundation.
 * Build deploys Convex functions (via CONVEX_DEPLOY_KEY), then runs Next.js build
 * with NEXT_PUBLIC_CONVEX_URL injected. Previews without a Convex preview key
 * build the site alone; see scripts/vercel-build.sh.
 *
 * @see https://docs.convex.dev/production/hosting/vercel
 */
export const config: VercelConfig = {
  framework: "nextjs",
  installCommand: "npm ci",
  buildCommand: "sh scripts/vercel-build.sh",
};
