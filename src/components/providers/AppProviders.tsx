"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { clerkPublishableKey } from "@/lib/env";

/**
 * Clerk UI in the CLIF design system: the "simple" base drops Clerk's shadows
 * and gradients, variables map to the theme tokens (so light/dark follows the
 * site), and the clerk-* rules in globals.css square the geometry.
 */
const clerkAppearance = {
  theme: "simple" as const,
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "var(--action-primary-bg)",
    colorPrimaryForeground: "var(--action-primary-fg)",
    colorDanger: "var(--status-error)",
    colorForeground: "var(--text-primary)",
    colorMutedForeground: "var(--text-muted)",
    colorMuted: "var(--bg-panel)",
    colorBackground: "var(--bg-figure)",
    colorInput: "var(--bg-page)",
    colorInputForeground: "var(--text-primary)",
    colorBorder: "var(--border-strong)",
    colorNeutral: "var(--text-primary)",
    colorRing: "var(--focus-ring)",
    colorShadow: "transparent",
    fontFamily: "var(--font-sans)",
    fontFamilyButtons: "var(--font-sans)",
    fontFamilyMono: "var(--font-mono)",
    borderRadius: "3px",
  },
};

export function AppProviders({ children }: { children: ReactNode }) {
  const inner = <ConvexClientProvider>{children}</ConvexClientProvider>;

  if (!clerkPublishableKey) {
    return inner;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      signInUrl="/portal/sign-in"
      afterSignOutUrl="/"
      appearance={clerkAppearance}
    >
      {inner}
    </ClerkProvider>
  );
}
