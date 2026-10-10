"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { Lockup } from "@/components/brand/Lockup";
import { NAV_ITEMS } from "@/lib/content";

export function SiteHeader({ current }: { current?: string }) {
  const toggleId = useId();
  const toggleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && toggleRef.current?.checked) {
        toggleRef.current.checked = false;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 999px)");
    const onChange = () => {
      if (!mq.matches && toggleRef.current) {
        toggleRef.current.checked = false;
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header
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
        <Lockup height={34} priority />
        <nav className="site-nav-desktop" aria-label="Primary">
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
              height: "var(--control-md)",
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "var(--radius-control)",
            }}
          >
            Support CLIF
          </Link>
        </nav>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: "none",
          }}
        >
          <input
            id="clif-theme-toggle"
            type="checkbox"
            className="clif-theme-toggle"
            aria-label="Toggle dark mode"
          />
          <label
            htmlFor="clif-theme-toggle"
            className="clif-theme-btn"
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
              boxSizing: "border-box",
            }}
          >
            <span
              aria-hidden="true"
              className="clif-theme-icon"
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "1.5px solid currentColor",
                background:
                  "linear-gradient(90deg, currentColor 50%, transparent 50%)",
                flex: "none",
              }}
            />
            <span className="clif-theme-label-light">Light</span>
            <span className="clif-theme-label-dark">Dark</span>
          </label>
          <input
            ref={toggleRef}
            id={toggleId}
            type="checkbox"
            className="site-menu-toggle"
            aria-controls="site-menu"
          />
          <label
            htmlFor={toggleId}
            className="site-menu-btn"
            style={{
              height: "var(--control-md)",
              padding: "0 16px",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-control)",
              background: "transparent",
              color: "var(--text-primary)",
              font: "500 15px var(--font-sans)",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            <span className="site-menu-label-open">Menu</span>
            <span className="site-menu-label-close">Close</span>
          </label>
        </div>
      </div>
      <nav id="site-menu" className="site-menu-panel" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
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
    </header>
  );
}
