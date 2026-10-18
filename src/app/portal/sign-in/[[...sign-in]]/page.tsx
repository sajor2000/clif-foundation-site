"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Lockup } from "@/components/brand/Lockup";
import { isClerkConfigured } from "@/lib/env";

export default function PortalSignInPage() {
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
        <Lockup height={28} />
        <div style={{ textAlign: "center", display: "grid", gap: 8, maxWidth: 400 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "var(--type-display-m)",
              letterSpacing: "-0.025em",
              lineHeight: 1.06,
            }}
          >
            Board sign-in
          </h1>
          <p style={{ margin: 0, color: "var(--text-body)", fontSize: 16, lineHeight: 1.5 }}>
            The private workspace for CLIF Foundation directors. New here? Sign up, then request
            access from the board.
          </p>
        </div>
        {isClerkConfigured ? (
          <SignIn appearance={{ elements: { header: { display: "none" } } }} />
        ) : (
          <div
            style={{
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-panel)",
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
