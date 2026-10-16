import Image from "next/image";
import Link from "next/link";

const SRC = {
  ink: "/brand/clif-logo-ink.png",
  inverse: "/brand/clif-logo-white.png",
  consortium: "/brand/clif-logo-ink.png",
} as const;

/** Intrinsic logo aspect ≈ 2417×729 */
const LOGO_ASPECT = 2417 / 729;

type Tone = keyof typeof SRC;

export function Lockup({
  tone = "ink",
  height = 34,
  label = "Foundation",
  href = "/",
  priority = false,
}: {
  tone?: Tone;
  height?: number;
  label?: string | null;
  href?: string;
  priority?: boolean;
}) {
  const fg = tone === "inverse" ? "var(--text-inverse)" : "var(--text-primary)";
  const filter =
    tone === "ink"
      ? "var(--logo-filter)"
      : tone === "inverse"
        ? "var(--logo-inverse-filter)"
        : "none";
  const width = Math.round(height * LOGO_ASPECT);

  const inner = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.round(height * 0.4),
      }}
    >
      <Image
        src={SRC[tone]}
        alt="CLIF"
        width={width}
        height={height}
        priority={priority}
        style={{ height, width, display: "block", filter }}
      />
      {label ? (
        <span
          aria-hidden="true"
          style={{ width: 1, height: Math.round(height * 0.7), background: fg }}
        />
      ) : null}
      {label ? (
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: Math.round(height * 0.5),
            color: fg,
            letterSpacing: "-0.005em",
          }}
        >
          {label}
        </span>
      ) : null}
    </span>
  );

  return (
    <Link
      href={href}
      aria-label={`CLIF ${label ?? ""} home`}
      style={{
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        minHeight: "var(--touch-min)",
      }}
    >
      {inner}
    </Link>
  );
}
