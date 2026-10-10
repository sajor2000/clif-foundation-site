"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Lockup } from "@/components/brand/Lockup";
import { NAV_ITEMS } from "@/lib/content";
import { useTheme } from "@/components/theme/ThemeProvider";

export function SiteHeader({ current }: { current?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [w, setW] = useState(1280);
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setW(el.getBoundingClientRect().width);
    measure();
    let ro: ResizeObserver | undefined;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const narrow = w < 1000;

  return (
    <header
      ref={ref}
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-page)",
        position: "sticky",
        top: 0,
        zIndex: 5,
      }}
    >
      <div
        style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          padding: "0 var(--gutter)",
          minHeight: "var(--header-h)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <Lockup height={narrow ? 28 : 34} />
        {!narrow ? (
          <nav
            aria-label="Primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontSize: "var(--type-ui)",
              fontWeight: 500,
            }}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                aria-current={current === item.id ? "page" : undefined}
                style={{
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  height: "var(--header-h)",
                  padding: "0 14px",
                  display: "flex",
                  alignItems: "center",
                  borderBottom: `2px solid ${
                    current === item.id ? "var(--text-primary)" : "transparent"
                  }`,
                  marginBottom: -1,
                }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/support"
              aria-current={current === "support" ? "page" : undefined}
              style={{
                marginLeft: 14,
                textDecoration: "none",
                whiteSpace: "nowrap",
                background: "var(--action-primary-bg)",
                color: "var(--action-primary-fg)",
                padding: "0 18px",
                height: 42,
                display: "inline-flex",
                alignItems: "center",
                borderRadius: "var(--radius-control)",
              }}
            >
              Support CLIF
            </Link>
          </nav>
        ) : null}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: "none",
          }}
        >
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={theme === "dark"}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            style={{
              height: "var(--control-md)",
              padding: "0 12px",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-control)",
              background: "transparent",
              color: "var(--text-primary)",
              font: "500 14px var(--font-sans)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "1.5px solid currentColor",
                background:
                  "linear-gradient(90deg, currentColor 50%, transparent 50%)",
              }}
            />
            {theme === "dark" ? "Dark" : "Light"}
          </button>
          {narrow ? (
            <button
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen(!open)}
              style={{
                height: "var(--control-md)",
                padding: "0 16px",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-control)",
                background: open
                  ? "var(--action-primary-bg)"
                  : "transparent",
                color: open
                  ? "var(--action-primary-fg)"
                  : "var(--text-primary)",
                font: "500 15px var(--font-sans)",
                cursor: "pointer",
              }}
            >
              {open ? "Close" : "Menu"}
            </button>
          ) : null}
        </div>
      </div>
      {narrow && open ? (
        <nav
          id="site-menu"
          aria-label="Primary"
          style={{
            padding: "8px var(--gutter) 24px",
            display: "grid",
            borderTop: "1px solid var(--border)",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={current === item.id ? "page" : undefined}
              style={{
                minHeight: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--border)",
                textDecoration: "none",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 22,
              }}
            >
              <span>{item.label}</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 400,
                  color: "var(--text-muted)",
                }}
              >
                {item.index}
              </span>
            </Link>
          ))}
          <Link
            href="/support"
            onClick={() => setOpen(false)}
            style={{
              marginTop: 20,
              textDecoration: "none",
              background: "var(--action-primary-bg)",
              color: "var(--action-primary-fg)",
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-control)",
              fontWeight: 500,
            }}
          >
            Support CLIF
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
