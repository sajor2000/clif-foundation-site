"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { isClerkConfigured } from "@/lib/env";


const NAV = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/reporting", label: "Get paperwork" },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/meetings", label: "Meetings" },
  { href: "/portal/votes", label: "Votes" },
  { href: "/portal/compliance", label: "Compliance" },
  { href: "/portal/coi", label: "COI" },
  { href: "/portal/policies", label: "Policies" },
] as const;

/**
 * Tabs for approved board members only; people waiting for approval see just
 * the Overview page. Admins also get Members, with the pending-request count.
 */
export function MemberNav() {
  const role = useQuery(api.board.myRole);
  const isMember = role !== undefined && role !== null && role !== "bootstrap_eligible";
  const isAdmin = role === "admin";
  const pending = useQuery(api.board.listAccessRequests, isAdmin ? {} : "skip");
  if (!isMember) return null;
  const count = pending?.length ?? 0;
  return (
    <PortalNav
      items={[
        ...NAV,
        ...(isAdmin
          ? [{ href: "/portal/members", label: count ? `Members (${count} pending)` : "Members" }]
          : []),
      ]}
    />
  );
}

function PortalNav({ items }: { items: ReadonlyArray<{ href: string; label: string }> }) {
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
      {items.map((item) => {
        const active =
          item.href === "/portal"
            ? path === "/portal"
            : path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            style={{
              padding: "12px 14px",
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              fontSize: 14,
              fontWeight: active ? 600 : 500,
              color: active ? "var(--text-primary)" : "var(--link)",
              borderBottom: active
                ? "2px solid var(--accent)"
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

export function PortalShell({
  children,
  nav,
}: {
  children: ReactNode;
  /** Rendered under the header; omitted until the visitor is a signed-in member. */
  nav?: ReactNode;
}) {
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
              fontSize: 12,
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
          {isClerkConfigured ? <UserButton /> : null}
        </div>
      </header>
      {nav ? <Suspense fallback={null}>{nav}</Suspense> : null}
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
