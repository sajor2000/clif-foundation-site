"use client";

import { useState } from "react";

export function PublicationRow({
  year,
  title,
  venue,
  type,
  href,
}: {
  year: number | string;
  title: string;
  venue: string;
  type?: string;
  href: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 24px",
        // 9px of the row padding moves onto the link so it is a 44px tap target.
        padding: "13px 0",
        borderBottom: "1px solid var(--border)",
        alignItems: "baseline",
      }}
    >
      <span
        style={{
          flex: "0 0 56px",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--type-mono)",
          color: "var(--text-muted)",
        }}
      >
        {year}
      </span>
      {/* No gap: the link's own 9px bottom padding spaces title and venue. */}
      <div style={{ flex: "1 1 420px", minWidth: 0, display: "grid" }}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            display: "block",
            paddingBlock: 9,
            minHeight: 44,
            fontSize: 19,
            fontWeight: 500,
            lineHeight: 1.35,
            textDecoration: hover ? "underline" : "none",
            color: hover ? "var(--link)" : "var(--text-primary)",
          }}
        >
          {title}
        </a>
        <span
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 12px",
            alignItems: "center",
            fontSize: "var(--type-small)",
            color: "var(--text-muted)",
          }}
        >
          <span>{venue} ↗</span>
          {type ? (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--type-mono-xs)",
                border: "1px solid var(--text-muted)",
                borderRadius: "var(--radius-tag)",
                padding: "1px 6px",
              }}
            >
              {type}
            </span>
          ) : null}
        </span>
      </div>
    </div>
  );
}
