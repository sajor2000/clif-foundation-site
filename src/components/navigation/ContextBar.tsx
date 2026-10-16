export function ContextBar({
  text = "An Illinois nonprofit scaling CLIF adoption beyond research · 501(c)(3) application pending",
  linkLabel = "Research is conducted by the CLIF Consortium ↗",
  href = "https://clif-icu.com/",
}: {
  text?: string;
  linkLabel?: string;
  href?: string;
}) {
  return (
    <aside
      aria-label="Foundation status"
      style={{
        background: "var(--bg-inverse)",
        color: "var(--text-inverse-body)",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        lineHeight: 1.4,
      }}
    >
      <div
        style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          padding: "0 var(--gutter)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0 24px",
          justifyContent: "space-between",
        }}
      >
        <span style={{ padding: "9px 0" }}>{text}</span>
        <a
          href={href}
          style={{
            color: "var(--accent-text)",
            // 44px hit area; no negative margins so it never overlaps wrapped text
            display: "inline-flex",
            alignItems: "center",
            minHeight: "var(--touch-min)",
          }}
        >
          {linkLabel}
        </a>
      </div>
    </aside>
  );
}
