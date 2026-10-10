import React from "react";
import { Lockup } from "../brand/Lockup.jsx";

export function SiteFooter({ links = [], email = "info@clificufoundation.org", note = "A proposed nonprofit supporting adoption of the Common Longitudinal ICU data Format. Research is credited to the CLIF Consortium and its investigators." }) {
  return (
    <footer style={{ background: "var(--bg-inverse)", color: "var(--text-inverse)" }}>
      <div style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "clamp(56px,6vw,80px) var(--gutter) 40px", display: "grid", gap: 48 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "40px 64px", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 320px", display: "grid", gap: 20, alignContent: "start" }}>
            <Lockup tone="inverse" height={32} />
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--text-inverse-body)", maxWidth: 420 }}>{note}</p>
            <a href={"mailto:" + email} style={{ color: "var(--accent-text)", fontFamily: "var(--font-mono)", fontSize: 14, minHeight: "var(--touch-min)", display: "inline-flex", alignItems: "center", justifySelf: "start" }}>{email}</a>
          </div>
          <nav aria-label="Footer" style={{ flex: "0 1 420px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "4px 32px", fontSize: 15 }}>
            {links.map((l, i) => <a key={i} href={l.href || "#"} onClick={l.onClick} style={{ textDecoration: "none", minHeight: "var(--touch-min)", display: "flex", alignItems: "center" }}>{l.label}</a>)}
          </nav>
        </div>
        <div style={{ borderTop: "1px solid var(--border-inverse)", paddingTop: 20, display: "flex", flexWrap: "wrap", gap: "8px 24px", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-inverse-muted)" }}>
          <span>CLIF is open source under the Apache License 2.0</span><span>© CLIF Foundation (proposed)</span>
        </div>
      </div>
    </footer>
  );
}
