"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import JSZip from "jszip";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/core/Button";
import { pageTitle, panelStyle, sectionTitle } from "@/components/portal/portal-styles";

export function ReportingHub() {
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [zipping, setZipping] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const pack = useQuery(api.reporting.getReportingPack, { taxYear });

  /** Manifest omits signed download URLs so the JSON file is safe to share with a CPA. */
  const downloadManifest = useMemo(() => {
    if (!pack) return null;
    const redacted = {
      ...pack,
      sections: pack.sections.map((section) => ({
        ...section,
        documents: section.documents.map(({ downloadUrl: _url, ...doc }) => doc),
      })),
    };
    return JSON.stringify(redacted, null, 2);
  }, [pack]);

  function downloadManifestFile() {
    if (!downloadManifest) return;
    const blob = new Blob([downloadManifest], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clif-board-reporting-${taxYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadMinutes(text: string, title: string) {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").slice(0, 60)}-minutes.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadZip() {
    if (!pack) return;
    setZipError(null);
    setZipping(true);
    try {
      const zip = new JSZip();
      zip.file(
        `manifest-${taxYear}.json`,
        downloadManifest ?? JSON.stringify({ generatedAt: pack.generatedAt }),
      );
      for (const section of pack.sections) {
        const folder = zip.folder(section.id) ?? zip;
        for (const doc of section.documents) {
          if (!doc.downloadUrl) continue;
          const res = await fetch(doc.downloadUrl);
          if (!res.ok) continue;
          const buf = await res.arrayBuffer();
          const safe = doc.title.replace(/[^\w.\-]+/g, "_").slice(0, 80);
          folder.file(safe || `${doc._id}`, buf);
        }
      }
      const minutesFolder = zip.folder("minutes") ?? zip;
      for (const m of pack.approvedMinutesExports) {
        const safe = m.title.replace(/[^\w.\-]+/g, "_").slice(0, 80);
        minutesFolder.file(`${safe}.md`, m.exportText);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clif-board-reporting-${taxYear}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setZipError(e instanceof Error ? e.message : "ZIP failed");
    } finally {
      setZipping(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <h1 style={pageTitle}>Get paperwork</h1>
        <p style={{ margin: 0, maxWidth: 680, lineHeight: 1.55 }}>
          Board-ready downloads for Form 990, audits, and grant reporting. Open any file ↗ or
          download everything as a ZIP for your CPA.
        </p>
        <label style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14 }}>
          Tax year
          <input
            type="number"
            value={taxYear}
            onChange={(e) => setTaxYear(Number(e.target.value))}
            style={{ width: 100, height: 44, padding: "0 10px" }}
            aria-label="Tax year"
          />
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Button type="button" onClick={downloadZip} disabled={!pack || zipping}>
            {zipping ? "Building ZIP…" : "Download all (ZIP)"}
          </Button>
          <Button type="button" variant="secondary" onClick={downloadManifestFile} disabled={!pack}>
            Download manifest (JSON)
          </Button>
        </div>
        {zipError ? (
          <p role="alert" style={{ margin: 0, color: "var(--status-error)", fontSize: 14 }}>
            {zipError}
          </p>
        ) : null}
      </div>

      {!pack ? (
        <p style={{ color: "var(--text-muted)" }}>Loading reporting pack…</p>
      ) : (
        <>
          {pack.sections.map((section) => (
            <section key={section.id} style={{ display: "grid", gap: 12 }}>
              <div>
                <h2 style={sectionTitle}>{section.label}</h2>
                <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--text-muted)" }}>
                  {section.description}
                </p>
              </div>
              {section.documents.length === 0 ? (
                <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                  No files yet.{" "}
                  <Link
                    href={`/portal/documents?category=${section.id === "policies" ? "policy" : section.id === "meetings" ? "meeting" : section.id}`}
                    style={{ color: "var(--link)" }}
                  >
                    Upload under Documents →
                  </Link>
                </p>
              ) : (
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    borderTop: "1px solid var(--border-strong)",
                  }}
                >
                  {section.documents.map((doc) => (
                    <li
                      key={doc._id}
                      style={{
                        padding: "14px 0",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <span style={{ flex: "1 1 200px", fontWeight: 500 }}>
                        {doc.downloadUrl ? (
                          <a
                            href={doc.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--link)" }}
                          >
                            {doc.title} ↗
                          </a>
                        ) : (
                          doc.title
                        )}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--text-muted)",
                        }}
                      >
                        {doc.retentionClass} · {new Date(doc.createdAt).toISOString().slice(0, 10)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section style={{ display: "grid", gap: 12 }}>
            <h2 style={sectionTitle}>Approved minutes</h2>
            {pack.approvedMinutesExports.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                No approved minutes yet.{" "}
                <Link href="/portal/meetings" style={{ color: "var(--link)" }}>
                  Approve minutes →
                </Link>
              </p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {pack.approvedMinutesExports.map((m) => (
                  <div key={m.meetingId} style={panelStyle}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{m.title}</p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => downloadMinutes(m.exportText, m.title)}
                    >
                      Download minutes (.md)
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
