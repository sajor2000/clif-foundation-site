import Link from "next/link";
import { Lockup } from "@/components/brand/Lockup";
import {
  CONTACT_EMAIL,
  CONSORTIUM_URL,
  FOOTER_NOTE,
  GITHUB_URL,
  NAV_ITEMS,
} from "@/lib/content";

export function SiteFooter() {
  const links = [
    ...NAV_ITEMS.map((n) => ({ label: n.label, href: n.href, external: false })),
    { label: "Support CLIF", href: "/support", external: false },
    { label: "CLIF Consortium ↗", href: CONSORTIUM_URL, external: true },
    { label: "GitHub ↗", href: GITHUB_URL, external: true },
  ];

  return (
    <footer
      style={{ background: "var(--bg-inverse)", color: "var(--text-inverse)" }}
    >
      <div
        style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          padding: "clamp(56px,6vw,80px) var(--gutter) 40px",
          display: "grid",
          gap: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "40px 64px",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              flex: "1 1 320px",
              display: "grid",
              gap: 20,
              alignContent: "start",
            }}
          >
            <Lockup tone="inverse" height={32} />
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--text-inverse-body)",
                maxWidth: 420,
              }}
            >
              {FOOTER_NOTE}
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={{
                color: "var(--accent-text)",
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                minHeight: "var(--touch-min)",
                display: "inline-flex",
                alignItems: "center",
                justifySelf: "start",
              }}
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <nav
            aria-label="Footer"
            style={{
              flex: "0 1 420px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: "4px 32px",
              fontSize: 15,
            }}
          >
            {links.map((l) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    minHeight: "var(--touch-min)",
                    display: "flex",
                    alignItems: "center",
                    color: "var(--text-inverse)",
                  }}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{
                    textDecoration: "none",
                    minHeight: "var(--touch-min)",
                    display: "flex",
                    alignItems: "center",
                    color: "var(--text-inverse)",
                  }}
                >
                  {l.label}
                </Link>
              ),
            )}
          </nav>
        </div>
        <div
          style={{
            borderTop: "1px solid var(--border-inverse)",
            paddingTop: 20,
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 24px",
            justifyContent: "space-between",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: "var(--text-inverse-muted)",
          }}
        >
          <span>CLIF is open source under the Apache License 2.0</span>
          <span>Design proposal · October 2026</span>
        </div>
      </div>
    </footer>
  );
}
