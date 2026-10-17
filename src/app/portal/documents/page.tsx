import { Suspense } from "react";
import { DocumentsWorkspace } from "@/components/portal/DocumentsWorkspace";

export default function PortalDocumentsPage() {
  return (
    <Suspense fallback={<p>Loading documents…</p>}>
      <DocumentsWorkspace />
    </Suspense>
  );
}
