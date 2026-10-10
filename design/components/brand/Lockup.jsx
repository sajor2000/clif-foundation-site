import React from "react";

const SRC = {
  ink: "https://clif-icu.com/images/logos/clif_logo_transparent_FINAL_cropped.png",
  inverse: "https://clif-icu.com/images/logos/clif_logo_white_email.png",
  consortium: "https://clif-icu.com/images/logos/clif_logo_transparent_FINAL_cropped.png"
};

export function Lockup({ tone = "ink", height = 34, label = "Foundation", href, onClick }) {
  const fg = tone === "inverse" ? "var(--text-inverse)" : "var(--text-primary)";
  const inner = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.round(height * 0.4) }}>
      <img src={SRC[tone]} alt="CLIF" style={{ height, display: "block", filter: tone === "ink" ? "var(--logo-filter)" : tone === "inverse" ? "var(--logo-inverse-filter)" : "none" }} />
      {label && <span aria-hidden="true" style={{ width: 1, height: Math.round(height * 0.7), background: fg }} />}
      {label && <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: Math.round(height * 0.5), color: fg, letterSpacing: "-0.005em" }}>{label}</span>}
    </span>
  );
  return href || onClick ? <a href={href || "#"} onClick={onClick} aria-label={"CLIF " + (label || "") + " home"} style={{ textDecoration: "none", display: "inline-flex" }}>{inner}</a> : inner;
}
