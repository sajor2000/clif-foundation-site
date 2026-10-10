import React from "react";

export function Tag({ status = "neutral", children }) {
  const m = {
    proposed: { background: "var(--status-proposed-bg)", color: "var(--status-proposed-fg)", border: "1px solid var(--border-strong)" },
    existing: { background: "var(--status-existing-bg)", color: "var(--status-existing-fg)", border: "1px solid var(--status-existing-bg)" },
    neutral: { background: "transparent", color: "var(--text-muted)", border: "1px solid var(--text-muted)" }
  }[status];
  return <span style={{ ...m, fontFamily: "var(--font-mono)", fontSize: "var(--type-mono-xs)", lineHeight: 1.4, padding: "2px 8px", borderRadius: "var(--radius-tag)", display: "inline-block", whiteSpace: "nowrap" }}>{children ?? status}</span>;
}
