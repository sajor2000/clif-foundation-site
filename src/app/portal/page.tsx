import type { Metadata } from "next";
import { DocumentPortal } from "@/components/portal/DocumentPortal";

export const metadata: Metadata = {
  title: "Board portal",
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  return <DocumentPortal />;
}
