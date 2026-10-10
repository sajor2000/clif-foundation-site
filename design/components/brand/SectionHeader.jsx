import React from "react";

export function SectionHeader({ index, label, title, lead, action, level = 2, size = "section", inverse = false }) {
  const H = "h" + level;
  const fs = size === "page" ? "var(--type-display-l)" : "var(--type-h2)";
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px 64px", alignItems: "flex-end", justifyContent: "space-between" }}>
      <div style={{ flex: "1 1 440px", display: "grid", gap: 16 }}>
        {(index || label) && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--type-mono-s)", color: inverse ? "var(--signal-400)" : "var(--text-eyebrow)" }}>
          {index}{index && label ? (size === "page" ? " / " : " — ") : ""}{label}</span>}
        {React.createElement(H, { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: fs, lineHeight: size === "page" ? 1 : "var(--leading-heading)", letterSpacing: size === "page" ? "var(--tracking-display)" : "-0.03em", color: inverse ? "var(--text-inverse)" : "var(--text-primary)", textWrap: "balance" } }, title)}
      </div>
      {lead && <p style={{ flex: "1 1 360px", margin: 0, fontSize: "var(--type-body)", lineHeight: "var(--leading-body)", color: inverse ? "var(--text-inverse-body)" : "var(--text-body)", borderLeft: size === "page" ? "1px solid var(--border-strong)" : "none", paddingLeft: size === "page" ? 20 : 0 }}>{lead}</p>}
      {action && <div style={{ flex: "none" }}>{action}</div>}
    </div>
  );
}
