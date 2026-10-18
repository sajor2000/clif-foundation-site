import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalGate } from "@/components/portal/PortalGate";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Board portal",
  robots: { index: false, follow: false },
};

// Clerk and Convex load only inside the portal; public pages ship neither.
export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return (
    <AppProviders>
      <Suspense
        fallback={
          <div className="page-wrap" style={{ paddingTop: 48 }}>
            Loading portal…
          </div>
        }
      >
        <PortalGate>{children}</PortalGate>
      </Suspense>
    </AppProviders>
  );
}
