import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalGate } from "@/components/portal/PortalGate";

export const metadata: Metadata = {
  title: "Board portal",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return (
    <Suspense
      fallback={
        <div className="page-wrap" style={{ paddingTop: 48 }}>
          Loading portal…
        </div>
      }
    >
      <PortalGate>{children}</PortalGate>
    </Suspense>
  );
}
