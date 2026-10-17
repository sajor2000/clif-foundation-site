"use client";

import { useAuth } from "@clerk/nextjs";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useConvexAuth,
} from "convex/react";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Button } from "@/components/core/Button";
import { MemberNav, PortalShell } from "@/components/portal/PortalShell";
import { isClerkConfigured, isConvexConfigured } from "@/lib/env";

function StatusPanel({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border-strong)",
        borderRadius: 6,
        background: "var(--bg-figure)",
        padding: 28,
        display: "grid",
        gap: 14,
        maxWidth: 560,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 32,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h1>
      <p style={{ margin: 0, color: "var(--text-body)", lineHeight: 1.55 }}>
        {body}
      </p>
      {action}
    </div>
  );
}

/** Setup details for developers only; production visitors never see config names. */
const devHint = (hint: string, publicText: string) =>
  process.env.NODE_ENV === "production" ? publicText : `${publicText} (${hint})`;

const UNAVAILABLE = "The board portal is not available right now. Please try again later.";

export function PortalGate({ children }: { children: ReactNode }) {
  if (!isClerkConfigured) {
    return (
      <PortalShell>
        <StatusPanel
          title="Board portal unavailable"
          body={devHint("Clerk keys are not set", UNAVAILABLE)}
        />
      </PortalShell>
    );
  }

  if (!isConvexConfigured) {
    return (
      <PortalShell>
        <StatusPanel
          title="Board portal unavailable"
          body={devHint("NEXT_PUBLIC_CONVEX_URL is not set", UNAVAILABLE)}
        />
      </PortalShell>
    );
  }

  return (
    <Suspense
      fallback={
        <PortalShell>
          <StatusPanel title="Loading portal…" body="Checking board session." />
        </PortalShell>
      }
    >
      <SignedInGate>{children}</SignedInGate>
    </Suspense>
  );
}

function SignedInGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  const isSignInRoute = pathname?.startsWith("/portal/sign-in");

  if (isSignInRoute) {
    return <>{children}</>;
  }

  if (!isLoaded) {
    return (
      <PortalShell>
        <StatusPanel title="Loading portal…" body="Checking board session." />
      </PortalShell>
    );
  }

  if (!isSignedIn) {
    return (
      <PortalShell>
        <StatusPanel
          title="Board sign-in required"
          body="Sign in with your board Clerk account to access documents, minutes, and votes."
          action={<Button href="/portal/sign-in">Sign in</Button>}
        />
      </PortalShell>
    );
  }

  return (
    <PortalShell
      nav={
        <Authenticated>
          <MemberNav />
        </Authenticated>
      }
    >
      <AuthLoading>
        <StatusPanel
          title="Connecting…"
          body="Confirming your board session."
        />
      </AuthLoading>
      <Unauthenticated>
        <StatusPanel
          title="Session not ready"
          body={devHint(
            "Convex rejected the Clerk token; check CLERK_JWT_ISSUER_DOMAIN",
            "We could not confirm your session. Refresh the page, or sign out and sign in again.",
          )}
          action={<Button href="/portal/sign-in">Sign in again</Button>}
        />
      </Unauthenticated>
      <Authenticated>
        <ConvexReady>{children}</ConvexReady>
      </Authenticated>
    </PortalShell>
  );
}

/** Ensures useConvexAuth is authenticated before data children mount. */
function ConvexReady({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  if (isLoading) {
    return (
      <StatusPanel
        title="Connecting…"
        body="Confirming your board session."
      />
    );
  }
  if (!isAuthenticated) {
    return (
      <StatusPanel
        title="Session not ready"
        body="Confirming your board session."
      />
    );
  }
  return <>{children}</>;
}
