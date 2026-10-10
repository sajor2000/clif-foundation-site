import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export function TextLink({
  href,
  external = false,
  inverse = false,
  children,
  style,
}: {
  href: string;
  external?: boolean;
  inverse?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const s: CSSProperties = {
    color: inverse ? "var(--accent-text)" : "var(--link)",
    fontSize: "inherit",
    minHeight: "var(--touch-min)",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    ...style,
  };

  if (external || href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a
        href={href}
        style={s}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
        {external ? <span aria-hidden="true"> ↗</span> : null}
      </a>
    );
  }

  return (
    <Link href={href} style={s}>
      {children}
    </Link>
  );
}
