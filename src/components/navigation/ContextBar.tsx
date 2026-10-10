export function ContextBar({
  text = "An Illinois nonprofit supporting adoption of the CLIF standard · 501(c)(3) application pending",
  linkLabel = "Research is conducted by the CLIF Consortium ↗",
  href = "https://clif-icu.com/",
}: {
  text?: string;
  linkLabel?: string;
  href?: string;
}) {
  return (
    <div
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
          padding: "9px var(--gutter)",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 24px",
          justifyContent: "space-between",
        }}
      >
        <span>{text}</span>
        <a href={href} style={{ color: "var(--accent-text)" }}>
          {linkLabel}
        </a>
      </div>
    </div>
  );
}
