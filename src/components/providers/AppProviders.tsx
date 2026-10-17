"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { clerkPublishableKey } from "@/lib/env";


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
    >
      {inner}
    </ClerkProvider>
  );
}
