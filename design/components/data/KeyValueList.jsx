import React from "react";

export function KeyValueList({ rows = [] }) {
  return (
    <dl style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "var(--type-mono)", lineHeight: 1.45 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", padding: "11px 20px", borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
          <dt style={{ flex: "0 0 130px", color: "var(--text-muted)" }}>{r.k}</dt>
          <dd style={{ margin: 0, flex: "1 1 160px" }}>{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}
