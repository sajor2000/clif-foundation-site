import React from "react";

export function DataPanel({ title, meta, children, footer, inverse = false, style }) {
  const line = inverse ? "var(--border-inverse)" : "var(--border-strong)";
  return (
    <figure style={{ margin: 0, border: "1px solid " + line, borderRadius: "var(--radius-panel)", background: inverse ? "var(--bg-inverse)" : "var(--bg-figure)", color: inverse ? "var(--text-inverse)" : "var(--text-primary)", overflow: "hidden", ...style }}>
      {(title || meta) && <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 24px", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid " + line, fontFamily: "var(--font-mono)", fontSize: "var(--type-mono-s)" }}>
        <span>{title}</span>{meta && <span style={{ color: inverse ? "var(--text-inverse-muted)" : "var(--text-muted)" }}>{meta}</span>}</div>}
      <div>{children}</div>
      {footer && <figcaption style={{ padding: "12px 20px", borderTop: "1px solid " + line, fontSize: 13, color: inverse ? "var(--text-inverse-body)" : "var(--text-body)" }}>{footer}</figcaption>}
    </figure>
  );
}
