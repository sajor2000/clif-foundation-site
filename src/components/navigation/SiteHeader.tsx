"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Lockup } from "@/components/brand/Lockup";
import { NAV_ITEMS } from "@/lib/content";

export function SiteHeader({ current }: { current?: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  // Next keeps a visited page mounted but hidden (React <Activity>), so ids
  // must be unique per page instance, not fixed strings.
  const menuId = useId();
  const themeToggleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const themeToggleRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Close the menu when Activity hides this page, so it is never open when the
  // reader comes Back (pattern from Next's "Preserving UI state" guide).
  useLayoutEffect(() => {
    return () => setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // Leave Escape to whatever already handled it. A hidden page's menu is
      // already closed, so an open menu is this page's. Return focus to the
      // button only when it was in the header or nowhere, never out of content.
      if (e.key !== "Escape" || e.defaultPrevented) return;
      const active = document.activeElement;
      const inHeader = !!headerRef.current?.contains(active);
      setOpen(false);
      if (inHeader || !active || active === document.body) buttonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Theme toggles on pages shown after a client navigation start unchecked;
  // match the current theme when this header mounts.
  useEffect(() => {
    if (themeToggleRef.current) {
      themeToggleRef.current.checked = document.documentElement.dataset.theme === "dark";
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 999px)");
    const panel = panelRef.current;
    // CSS can hide the panel (dropping focus to <body>) before the media
    // query handler runs, so track focus-in-panel ourselves.
    let focusInPanel = false;
    const onFocusIn = () => {
      focusInPanel = true;
    };
    const onFocusOut = (e: FocusEvent) => {
      if (e.relatedTarget && !panel?.contains(e.relatedTarget as Node)) focusInPanel = false;
    };
    panel?.addEventListener("focusin", onFocusIn);
    panel?.addEventListener("focusout", onFocusOut);
    const onChange = () => {
      if (mq.matches) return;
      // Widening to desktop hides the panel; keep focus on the equivalent
      // desktop link instead of dropping it to the document body.
      const focused = document.activeElement;
      if (focusInPanel || (focused && panel?.contains(focused))) {
        const href = focused?.getAttribute("href");
        const twin = href
          ? desktopNavRef.current?.querySelector<HTMLElement>(`a[href="${href}"]`)
          : null;
        (twin ?? desktopNavRef.current?.querySelector<HTMLElement>("a"))?.focus();
      }
      focusInPanel = false;
      setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      panel?.removeEventListener("focusin", onFocusIn);
      panel?.removeEventListener("focusout", onFocusOut);
    };
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
        <nav ref={desktopNavRef} className="site-nav-desktop" aria-label="Primary">
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
            ref={themeToggleRef}
            id={themeToggleId}
            type="checkbox"
            className="clif-theme-toggle"
            aria-label="Toggle dark mode"
          />
          <label
            htmlFor={themeToggleId}
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
            aria-controls={menuId}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
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
            Menu
          </button>
        </div>
      </div>
      {/* Without JavaScript the button cannot toggle, so show the links instead. */}
      <noscript>
        <style>{`@media (max-width: 999px) { .site-menu-panel { display: grid !important; } .site-menu-btn { display: none !important; } }`}</style>
      </noscript>
      <nav
        ref={panelRef}
        id={menuId}
        className="site-menu-panel"
        aria-label="Primary"
        data-open={open}
        onClick={(e) => {
          // Close on any link, including one to the page already shown.
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onNavigate={() => setOpen(false)}
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
          onNavigate={() => setOpen(false)}
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
          onClick={() => themeToggleRef.current?.click()}
        >
          <span>Theme</span>
          <span className="clif-theme-label-light">Light</span>
          <span className="clif-theme-label-dark">Dark</span>
        </button>
      </nav>
    </header>
  );
}
