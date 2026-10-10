"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function Inner({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ThemeProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  if (!publishableKey) {
    return <Inner>{children}</Inner>;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/portal/sign-in"
      afterSignOutUrl="/"
    >
      <Inner>{children}</Inner>
    </ClerkProvider>
  );
}
