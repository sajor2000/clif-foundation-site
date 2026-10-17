"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";

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
  const [hover, setHover] = useState(false);
  const v = {
    primary: {
      background: hover
        ? "var(--action-primary-hover)"
        : "var(--action-primary-bg)",
      color: "var(--action-primary-fg)",
      border: "1px solid transparent",
    },
    secondary: {
      background: hover ? "var(--action-secondary-hover)" : "transparent",
      color: "var(--text-primary)",
      border: "1px solid var(--action-secondary-border)",
    },
    ghost: {
      background: hover ? "var(--bg-hover)" : "transparent",
      color: "var(--text-primary)",
      border: "1px solid transparent",
    },
    inverse: {
      background: hover ? "var(--accent)" : "var(--text-inverse)",
      color: "var(--bg-inverse)",
      border: "1px solid transparent",
    },
  }[variant];

  const s: CSSProperties = {
    ...v,
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
    transition: "background var(--duration-fast) var(--ease-standard)",
    ...style,
  };

  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
  };

  if (href) {
    return (
      <Link href={href} style={s} aria-label={ariaLabel} {...handlers}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      style={s}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ariaPressed}
      aria-label={ariaLabel}
      {...handlers}
    >
      {children}
    </button>
  );
}
