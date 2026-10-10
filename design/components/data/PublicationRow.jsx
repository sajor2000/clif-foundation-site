import React from "react";

export function PublicationRow({ year, title, venue, type, href }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", padding: "22px 0", borderBottom: "1px solid var(--border)", alignItems: "baseline" }}>
      <span style={{ flex: "0 0 56px", fontFamily: "var(--font-mono)", fontSize: "var(--type-mono)", color: "var(--text-muted)" }}>{year}</span>
      <div style={{ flex: "1 1 420px", minWidth: 0, display: "grid", gap: 8 }}>
        <a href={href} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
          style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.35, textDecoration: hover ? "underline" : "none", color: hover ? "var(--link)" : "var(--text-primary)" }}>{title}</a>
        <span style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px", alignItems: "center", fontSize: "var(--type-small)", color: "var(--text-muted)" }}>
          <span>{venue} ↗</span>
          {type && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--type-mono-xs)", border: "1px solid var(--ink-600)", borderRadius: "var(--radius-tag)", padding: "1px 6px" }}>{type}</span>}
        </span>
      </div>
    </div>
  );
}
