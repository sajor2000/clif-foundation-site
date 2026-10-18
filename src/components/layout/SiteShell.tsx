import type { ReactNode } from "react";
import { Main, MainIdProvider, SkipLink } from "@/components/layout/MainLandmark";
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
    <MainIdProvider>
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
      <SkipLink />
      <ContextBar />
      <SiteHeader current={current} />
      <Main>{children}</Main>
      <SiteFooter />
    </div>
    </MainIdProvider>
  );
}
