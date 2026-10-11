import type { VercelConfig } from "@vercel/config/v1";

/**
 * Vercel project config for CLIF Foundation.
 * Build deploys Convex functions (via CONVEX_DEPLOY_KEY), then runs Next.js build
 * with NEXT_PUBLIC_CONVEX_URL injected for the production/preview deployment.
 *
 * @see https://docs.convex.dev/production/hosting/vercel
 */
export const config: VercelConfig = {
  framework: "nextjs",
  installCommand: "npm ci",
  buildCommand:
    "npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL",
};
