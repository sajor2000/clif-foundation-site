"use client";

import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/core/Button";
import { pageTitle, panelStyle, sectionTitle } from "@/components/portal/portal-styles";

export function ReportingHub() {
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const pack = useQuery(api.reporting.getReportingPack, { taxYear });

  const downloadManifest = useMemo(() => {
    if (!pack) return null;
    return JSON.stringify(pack, null, 2);
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

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <h1 style={pageTitle}>Reporting pack</h1>
        <p style={{ margin: 0, maxWidth: 680, lineHeight: 1.55 }}>
          Board-ready downloads grouped for Form 990, audits, and grant reporting. Open any file
          ↗ or export the full manifest for your CPA.
        </p>
        <label style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14 }}>
          Tax year
          <input
            type="number"
            value={taxYear}
            onChange={(e) => setTaxYear(Number(e.target.value))}
            style={{ width: 100, height: 44, padding: "0 10px" }}
          />
        </label>
        <div>
          <Button type="button" onClick={downloadManifestFile} disabled={!pack}>
            Download manifest (JSON)
          </Button>
        </div>
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
                  No files in this section yet. Upload under Documents with category &quot;
                  {section.id === "tax" ? "Tax and Form 990" : section.label}&quot;.
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
                No approved minutes yet. Approve minutes on the Meetings page.
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
