"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Lockup } from "@/components/brand/Lockup";
import { NAV_ITEMS } from "@/lib/content";

export function SiteHeader({ current }: { current?: string }) {
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  // Next keeps earlier pages mounted (hidden) for instant back navigation, so
  // several headers can exist at once: each needs its own ids.
  const uid = useId().replace(/:/g, "");
  const panelId = `site-menu-${uid}`;
  const themeId = `clif-theme-toggle-${uid}`;
  const themeRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  // When Next hides this page (any navigation away: links, logo, Back), close
  // the menu so the page never comes back with it open. See Next's
  // "Preserving UI state" guide.
  useLayoutEffect(() => () => setOpen(false), []);

  useEffect(() => {
    // A header mounted after navigation must reflect the current theme.
    if (themeRef.current) {
      themeRef.current.checked = document.documentElement.dataset.theme === "dark";
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // Only Escape aimed at this menu: not one another widget already handled.
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if (!headerRef.current?.contains(document.activeElement)) return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    // Widening past the mobile breakpoint closes the panel (desktop nav takes
    // over). If focus was inside the panel, keep it on the page.
    const mq = window.matchMedia("(max-width: 999px)");
    const onChange = () => {
      if (mq.matches) return;
      const hadFocus = panelRef.current?.contains(document.activeElement);
      setOpen(false);
      if (hadFocus) headerRef.current?.querySelector<HTMLElement>(".site-header-brand a")?.focus();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header
      ref={headerRef}
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
        <span className="site-header-brand">
          <Lockup height={34} priority />
        </span>
        <nav className="site-nav-desktop" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={current === item.id ? "page" : undefined}
              className="site-nav-link"
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
            className="site-nav-cta"
            style={{
              marginLeft: 14,
              textDecoration: "none",
              whiteSpace: "nowrap",
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
            ref={themeRef}
            id={themeId}
            type="checkbox"
            className="clif-theme-toggle"
            aria-label="Toggle dark mode"
          />
          <label
            htmlFor={themeId}
            className="clif-theme-btn"
            style={{
              height: "var(--control-md)",
              padding: "0 12px",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-control)",
              color: "var(--text-primary)",
              font: "500 14px var(--font-sans)",
              cursor: "pointer",
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
          <button
            ref={buttonRef}
            type="button"
            className="site-menu-btn"
            aria-controls={panelId}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            style={{
              height: "var(--control-md)",
              padding: "0 16px",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-control)",
              color: "var(--text-primary)",
              font: "500 15px var(--font-sans)",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {/* Without JavaScript the toggle can't work: show the links instead. */}
      <noscript>
        <style>{`@media (max-width: 999px){.site-menu-panel{display:grid!important}.site-menu-btn{display:none!important}}`}</style>
      </noscript>
      {/* Closed = display:none (CSS), which also takes its links out of the tab order. */}
      <nav ref={panelRef} id={panelId} className="site-menu-panel" aria-label="Primary" data-open={open}>
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
          className="site-nav-cta"
          style={{
            marginTop: 20,
            textDecoration: "none",
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
        <button
          type="button"
          className="site-menu-theme"
          onClick={() => themeRef.current?.click()}
        >
          <span>Theme</span>
          <span className="clif-theme-label-light">Light</span>
          <span className="clif-theme-label-dark">Dark</span>
        </button>
      </nav>
    </header>
  );
}
