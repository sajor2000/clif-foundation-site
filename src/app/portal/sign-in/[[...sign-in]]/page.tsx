"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function PortalSignInPage() {
  const clerkReady = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-sans)",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ display: "grid", gap: 24, justifyItems: "center" }}>
        <div style={{ textAlign: "center", display: "grid", gap: 8 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 32,
            }}
          >
            Board sign-in
          </h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 15 }}>
            CLIF Foundation portal · not linked from the public site
          </p>
        </div>
        {clerkReady ? (
          <SignIn />
        ) : (
          <div
            style={{
              border: "1px solid var(--border-strong)",
              borderRadius: 6,
              padding: 24,
              maxWidth: 420,
              background: "var(--bg-figure)",
            }}
          >
            <p style={{ margin: 0, color: "var(--text-body)", lineHeight: 1.55 }}>
              Board sign-in is not available right now. Please try again later.
            </p>
          </div>
        )}
        <Link href="/" className="linkish">
          Back to public site
        </Link>
      </div>
    </div>
  );
}
