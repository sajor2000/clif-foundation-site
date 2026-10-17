// Portal configuration, read in one place. NEXT_PUBLIC_* values are inlined at
// build time, so these are safe in client components; CLERK_SECRET_KEY is only
// present on the server (proxy, route handlers).

export const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || undefined;

export const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || undefined;

/** Client-safe: Clerk UI can render (publishable key present). */
export const isClerkConfigured = Boolean(clerkPublishableKey);

/** Server-only: Clerk can verify sessions (publishable and secret keys). */
export function isClerkServerConfigured(): boolean {
  return Boolean(clerkPublishableKey && process.env.CLERK_SECRET_KEY);
}

export const isConvexConfigured = Boolean(convexUrl);
