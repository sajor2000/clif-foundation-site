"use client";

export function FilterChip({
  label,
  count,
  pressed = false,
  onClick,
}: {
  label: string;
  count?: number;
  pressed?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      style={{
        height: "var(--control-md)",
        padding: "0 16px",
        borderRadius: "var(--radius-control)",
        border: "1px solid var(--border-strong)",
        background: pressed ? "var(--action-primary-bg)" : "transparent",
        color: pressed ? "var(--action-primary-fg)" : "var(--text-primary)",
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        fontSize: 14,
        cursor: "pointer",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {label}
      {count != null ? (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, opacity: 0.8 }}>
          {count}
        </span>
      ) : null}
    </button>
  );
}
