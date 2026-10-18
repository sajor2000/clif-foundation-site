"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const SIZES = {
  sm: "var(--control-sm)",
  md: "var(--control-md)",
  lg: "var(--control-lg)",
} as const;

type Variant = "primary" | "secondary" | "ghost" | "inverse";
type Size = keyof typeof SIZES;

export function Button({
  variant = "primary",
  size = "md",
  href,
  fullWidth = false,
  children,
  style,
  type = "button",
  onClick,
  disabled,
  "aria-pressed": ariaPressed,
  "aria-label": ariaLabel,
}: {
  variant?: Variant;
  size?: Size;
  href?: string;
  fullWidth?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  "aria-pressed"?: boolean;
  "aria-label"?: string;
}) {
  // Colours, hover and press live in globals.css (.btn--*): CSS hover is
  // gated to real pointers, so it never sticks after a tap.
  const s: CSSProperties = {
    height: SIZES[size],
    padding: size === "sm" ? "0 14px" : "0 22px",
    display: fullWidth ? "flex" : "inline-flex",
    width: fullWidth ? "100%" : undefined,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: "var(--radius-control)",
    fontFamily: "var(--font-sans)",
    fontWeight: 500,
    fontSize: size === "lg" ? 16 : 15,
    lineHeight: 1,
    textDecoration: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    whiteSpace: "nowrap",
    opacity: disabled ? 0.6 : 1,
    ...style,
  };
  const className = `btn btn--${variant}`;

  if (href) {
    return (
      <Link href={href} className={className} style={s} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={className}
      style={s}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ariaPressed}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
