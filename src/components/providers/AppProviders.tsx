"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AppProviders({ children }: { children: ReactNode }) {
  const inner = <ConvexClientProvider>{children}</ConvexClientProvider>;

  if (!publishableKey) {
    return inner;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/portal/sign-in"
      afterSignOutUrl="/"
    >
      {inner}
    </ClerkProvider>
  );
}
