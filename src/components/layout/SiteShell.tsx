import type { ReactNode } from "react";
import { RouteFocus } from "@/components/layout/RouteFocus";
import { ContextBar } from "@/components/navigation/ContextBar";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { SiteHeader } from "@/components/navigation/SiteHeader";

export function SiteShell({
  current,
  children,
}: {
  /** Page key: also names this page's <main> (must be unique per route). */
  current: string;
  children: ReactNode;
}) {
  // Unique per page: earlier pages stay mounted (hidden) after navigation, and
  // the skip link must reach this page's <main>, not a cached one.
  const mainId = `main-${current}`;
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-sans)",
        fontSize: 17,
        lineHeight: 1.6,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <a className="skip-link" href={`#${mainId}`}>
        Skip to content
      </a>
      <ContextBar />
      <SiteHeader current={current} />
      <main id={mainId} tabIndex={-1} style={{ outline: "none", flex: 1 }}>
        <RouteFocus />
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
