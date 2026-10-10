import type { ReactNode } from "react";

export function SectionHeader({
  index,
  label,
  title,
  lead,
  action,
  level = 2,
  size = "section",
  inverse = false,
}: {
  index?: string;
  label?: string;
  title: string;
  lead?: string;
  action?: ReactNode;
  level?: 1 | 2 | 3;
  size?: "section" | "page";
  inverse?: boolean;
}) {
  const Tag = (`h${level}` as "h1" | "h2" | "h3");
  const fs = size === "page" ? "var(--type-display-l)" : "var(--type-h2)";

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px 64px",
        alignItems: "flex-end",
        justifyContent: "space-between",
      }}
    >
      <div style={{ flex: "1 1 440px", display: "grid", gap: 16 }}>
        {index || label ? (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: size === "page" ? 13 : 12,
              letterSpacing: ".01em",
              color: inverse ? "var(--accent-text)" : "var(--link)",
            }}
          >
            {index}
            {index && label ? (size === "page" ? " / " : " — ") : ""}
            {label}
          </span>
        ) : null}
        <Tag
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: fs,
            lineHeight: size === "page" ? 1 : "var(--leading-heading)",
            letterSpacing:
              size === "page" ? "var(--tracking-display)" : "-0.03em",
            color: inverse ? "var(--text-inverse)" : "var(--text-primary)",
            textWrap: "balance",
          }}
        >
          {title}
        </Tag>
      </div>
      {lead ? (
        <p
          style={{
            flex: "1 1 360px",
            margin: 0,
            fontSize: "var(--type-body)",
            lineHeight: "var(--leading-body)",
            color: inverse ? "var(--text-inverse-body)" : "var(--text-body)",
            borderLeft: size === "page" ? "1px solid var(--border-strong)" : "none",
            paddingLeft: size === "page" ? 20 : 0,
          }}
        >
          {lead}
        </p>
      ) : null}
      {action ? <div style={{ flex: "none" }}>{action}</div> : null}
    </div>
  );
}
