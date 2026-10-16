import type { VercelConfig } from "@vercel/config/v1";

/**
 * Vercel project config for CLIF Foundation.
 * When CONVEX_DEPLOY_KEY is set, deploy Convex functions then run Next.js build
 * with NEXT_PUBLIC_CONVEX_URL injected. Without the key (common on first Preview
 * setups), fall back to `npm run build` so the public site can still deploy.
 *
 * @see https://docs.convex.dev/production/hosting/vercel
 */
export const config: VercelConfig = {
  framework: "nextjs",
  installCommand: "npm ci",
  buildCommand:
    "if [ -n \"$CONVEX_DEPLOY_KEY\" ]; then npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL; else npm run build; fi",
};
