import React from "react";

export function TextLink({ href, external = false, inverse = false, children, style, ...rest }) {
  return (
    <a href={href} style={{ color: inverse ? "var(--accent-text)" : "var(--link)", fontSize: "inherit", minHeight: "var(--touch-min)", display: "inline-flex", alignItems: "center", gap: 4, ...style }}
      {...(external ? { target: "_blank", rel: "noopener" } : {})} {...rest}>
      {children}{external && <span aria-hidden="true"> ↗</span>}
      {external && <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}> (opens external site)</span>}
    </a>
  );
}
