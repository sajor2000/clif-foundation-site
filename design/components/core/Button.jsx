import React from "react";

const SIZES = { sm: "var(--control-sm)", md: "var(--control-md)", lg: "var(--control-lg)" };

export function Button({ variant = "primary", size = "md", href, fullWidth = false, children, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const v = {
    primary: { background: hover ? "var(--action-primary-hover)" : "var(--action-primary-bg)", color: "var(--action-primary-fg)", border: "1px solid transparent" },
    secondary: { background: hover ? "var(--action-secondary-hover)" : "transparent", color: "var(--text-primary)", border: "1px solid var(--action-secondary-border)" },
    ghost: { background: hover ? "var(--bg-hover)" : "transparent", color: "var(--text-primary)", border: "1px solid transparent" },
    inverse: { background: hover ? "var(--accent)" : "var(--text-inverse)", color: "var(--bg-inverse)", border: "1px solid transparent" }
  }[variant];
  const s = {
    ...v, height: SIZES[size], padding: size === "sm" ? "0 14px" : "0 22px",
    display: fullWidth ? "flex" : "inline-flex", width: fullWidth ? "100%" : undefined,
    alignItems: "center", justifyContent: "center", gap: 8, borderRadius: "var(--radius-control)",
    fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: size === "lg" ? 16 : 15, lineHeight: 1,
    textDecoration: "none", cursor: "pointer", whiteSpace: "nowrap",
    transition: "background var(--duration-fast) var(--ease-standard)", ...style
  };
  const h = { onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) };
  return href ? <a href={href} style={s} {...h} {...rest}>{children}</a> : <button type="button" style={s} {...h} {...rest}>{children}</button>;
}
