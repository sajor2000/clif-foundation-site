import type { VercelConfig } from "@vercel/config/v1";

/** Vercel project config for CLIF Foundation (static-first Next.js site). */
export const config: VercelConfig = {
  framework: "nextjs",
  installCommand: "npm ci",
  buildCommand: "npm run build",
};
