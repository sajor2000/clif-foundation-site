import React from "react";
import { Lockup } from "../brand/Lockup.jsx";

const ITEMS = [["mission", "Mission"], ["work", "Our Work"], ["research", "Research & Resources"], ["board", "Board & Governance"]];

export function SiteHeader({ current, onNavigate = () => {}, items = ITEMS, breakpoint = 1000, theme, onToggleTheme }) {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(1280);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => setW(el.getBoundingClientRect().width);
    measure();
    let ro; if (window.ResizeObserver) { ro = new ResizeObserver(measure); ro.observe(el); }
    window.addEventListener("resize", measure);
    return () => { ro && ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  const narrow = w < breakpoint;
  const go = id => e => { e.preventDefault(); setOpen(false); onNavigate(id); };
  return (
    <header ref={ref} style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-page)", position: "sticky", top: 0, zIndex: 5 }}>
      <div style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "0 var(--gutter)", minHeight: "var(--header-h)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <Lockup onClick={go("home")} height={narrow ? 28 : 34} />
        {!narrow && <nav aria-label="Primary" style={{ display: "flex", alignItems: "center", gap: 2, fontSize: "var(--type-ui)", fontWeight: 500 }}>
          {items.map(([id, label]) => <a key={id} href="#" onClick={go(id)} aria-current={current === id ? "page" : undefined}
            style={{ textDecoration: "none", whiteSpace: "nowrap", height: "var(--header-h)", padding: "0 14px", display: "flex", alignItems: "center", borderBottom: "2px solid " + (current === id ? "var(--text-primary)" : "transparent"), marginBottom: -1 }}>{label}</a>)}
          <a href="#" onClick={go("support")} aria-current={current === "support" ? "page" : undefined} style={{ marginLeft: 14, textDecoration: "none", whiteSpace: "nowrap", background: "var(--action-primary-bg)", color: "var(--action-primary-fg)", padding: "0 18px", height: 42, display: "inline-flex", alignItems: "center", borderRadius: "var(--radius-control)" }}>Support CLIF</a>
        </nav>}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
          {onToggleTheme && <button type="button" onClick={onToggleTheme} aria-pressed={theme === "dark"} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            style={{ height: "var(--control-md)", padding: "0 12px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-control)", background: "transparent", color: "var(--text-primary)", font: "500 14px var(--font-sans)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid currentColor", background: "linear-gradient(90deg, currentColor 50%, transparent 50%)" }} />{theme === "dark" ? "Dark" : "Light"}</button>}
          {narrow && <button type="button" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(!open)}
            style={{ height: "var(--control-md)", padding: "0 16px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-control)", background: open ? "var(--action-primary-bg)" : "transparent", color: open ? "var(--action-primary-fg)" : "var(--text-primary)", font: "500 15px var(--font-sans)", cursor: "pointer" }}>{open ? "Close" : "Menu"}</button>}
        </div>
      </div>
      {narrow && open && <nav id="site-menu" aria-label="Primary" onKeyDown={e => e.key === "Escape" && setOpen(false)} style={{ padding: "8px var(--gutter) 24px", display: "grid", borderTop: "1px solid var(--border)" }}>
        {items.map(([id, label], i) => <a key={id} href="#" onClick={go(id)} aria-current={current === id ? "page" : undefined} style={{ minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", textDecoration: "none", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22 }}>
          <span>{label}</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 400, color: "var(--text-muted)" }}>{String(i + 1).padStart(2, "0")}</span></a>)}
        <a href="#" onClick={go("support")} style={{ marginTop: 20, textDecoration: "none", background: "var(--action-primary-bg)", color: "var(--action-primary-fg)", height: 52, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-control)", fontWeight: 500 }}>Support CLIF</a>
      </nav>}
    </header>
  );
}
