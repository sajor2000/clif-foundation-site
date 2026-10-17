import type { CSSProperties } from "react";

export const inputStyle: CSSProperties = {
  height: 44,
  padding: "0 12px",
  border: "1px solid var(--border-strong)",
  borderRadius: 3,
  background: "var(--bg-page)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-sans)",
  fontSize: 15,
};

export const panelStyle: CSSProperties = {
  border: "1px solid var(--border-strong)",
  borderRadius: 6,
  background: "var(--bg-figure)",
  padding: 20,
  display: "grid",
  gap: 12,
};

export const pageTitle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: "var(--type-display-m)",
  letterSpacing: "-0.02em",
};

export const sectionTitle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 24,
};
