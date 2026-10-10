import type { ReactNode } from "react";
import { ContextBar } from "@/components/navigation/ContextBar";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { SiteHeader } from "@/components/navigation/SiteHeader";

export function SiteShell({
  current,
  children,
}: {
  current?: string;
  children: ReactNode;
}) {
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
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ContextBar />
      <SiteHeader current={current} />
      <main id="main" tabIndex={-1} style={{ outline: "none", flex: 1 }}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
