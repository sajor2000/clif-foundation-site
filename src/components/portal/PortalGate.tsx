"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Button } from "@/components/core/Button";
import { PortalShell } from "@/components/portal/PortalShell";

function clerkReady() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

function convexReady() {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}

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

export function PortalGate({ children }: { children: ReactNode }) {
  if (!clerkReady()) {
    return (
      <PortalShell>
        <StatusPanel
          title="Clerk not configured"
          body="Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to enable the board portal. Public pages work without Clerk."
        />
      </PortalShell>
    );
  }

  if (!convexReady()) {
    return (
      <PortalShell>
        <StatusPanel
          title="Convex not configured"
          body="Set NEXT_PUBLIC_CONVEX_URL (from npx convex dev) to use the board portal."
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
          body="Sign in with your board Clerk account to access documents, minutes, and compliance tools."
          action={<Button href="/portal/sign-in">Sign in</Button>}
        />
      </PortalShell>
    );
  }

  return <PortalShell>{children}</PortalShell>;
}
