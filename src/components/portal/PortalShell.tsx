"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";

const clerkReady = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const NAV = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/reporting", label: "Reporting pack" },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/meetings", label: "Meetings" },
  { href: "/portal/votes", label: "Votes" },
  { href: "/portal/compliance", label: "Compliance" },
  { href: "/portal/coi", label: "COI disclosure" },
  { href: "/portal/policies", label: "Policies" },
] as const;

function PortalNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Board portal"
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "0 var(--gutter)",
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
      }}
    >
      {NAV.map((item) => {
        const active =
          item.href === "/portal"
            ? path === "/portal"
            : path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: "12px 14px",
              fontSize: 14,
              fontWeight: active ? 600 : 500,
              color: active ? "var(--text-primary)" : "var(--link)",
              borderBottom: active
                ? "2px solid var(--accent-mint)"
                : "2px solid transparent",
              textDecoration: "none",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PortalShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <a className="skip-link" href="#portal-main">
        Skip to content
      </a>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "14px var(--gutter)",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            Board portal
          </p>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-muted)",
            }}
          >
            Private · CLIF Foundation
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ color: "var(--link)", fontSize: 14 }}>
            Public site
          </Link>
          {clerkReady ? <UserButton /> : null}
        </div>
      </header>
      <Suspense fallback={null}>
        <PortalNav />
      </Suspense>
      <main
        id="portal-main"
        className="page-wrap"
        tabIndex={-1}
        style={{ paddingTop: 36, paddingBottom: 80, outline: "none" }}
      >
        {children}
      </main>
    </div>
  );
}
