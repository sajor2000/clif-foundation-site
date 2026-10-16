import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Default share image for every route (DESIGN.md tokens: ink ground,
// mint accent, Funnel Display + Spline Sans Mono, hairline rule, no gradients).
export const alt =
  "CLIF Foundation — open infrastructure for critical care data";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK_950 = "#0E1111";
const INK_750 = "#3D423E";
const INK_400 = "#9AA19B";
const INK_50 = "#F5F6F3";
const SIGNAL_300 = "#B9E3D0";

const LOGO_W = 2417;
const LOGO_H = 729;
const LOGO_HEIGHT = 64;

// Read at module scope so the image is prerendered at build time.
const root = process.cwd();
const [display, mono, logo] = await Promise.all([
  readFile(join(root, "src/assets/og/funnel-display-600.woff")),
  readFile(join(root, "src/assets/og/spline-sans-mono-400.woff")),
  readFile(join(root, "public/brand/clif-logo-white.png")),
]);
const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK_950,
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <img
            src={logoSrc}
            alt=""
            width={Math.round((LOGO_HEIGHT * LOGO_W) / LOGO_H)}
            height={LOGO_HEIGHT}
          />
          <div style={{ width: 1, height: 46, background: INK_50 }} />
          <div
            style={{
              fontFamily: "Funnel Display",
              fontSize: 40,
              color: INK_50,
              letterSpacing: "-0.02em",
            }}
          >
            Foundation
          </div>
        </div>

        <div
          style={{
            fontFamily: "Funnel Display",
            fontSize: 84,
            lineHeight: 1,
            letterSpacing: "-0.035em",
            color: INK_50,
            maxWidth: 940,
          }}
        >
          Open infrastructure for critical care data.
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${INK_750}`,
            paddingTop: 24,
            fontFamily: "Spline Sans Mono",
            fontSize: 22,
            letterSpacing: "0.02em",
          }}
        >
          <span style={{ color: SIGNAL_300 }}>
            Common Longitudinal ICU data Format
          </span>
          <span style={{ color: INK_400 }}>clificufoundation.org</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Funnel Display", data: display, weight: 600, style: "normal" },
        { name: "Spline Sans Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
