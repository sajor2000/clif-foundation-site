import { DataPanel } from "@/components/data/DataPanel";

type Mark = {
  left: string;
  width: string;
  top: string;
  height: string;
  bg: string;
  fg: string;
  border: string;
  radius: string;
  pad: string;
  label: string;
};

const H = 72;
const pct = (h: number) => `${(h / H) * 100}%`;

const seg = (a: number, b: number, label: string, hi = false): Mark => ({
  left: pct(a),
  width: pct(b - a),
  top: "6px",
  height: "24px",
  bg: hi ? "var(--accent)" : "var(--status-existing-bg)",
  fg: hi ? "var(--accent-on)" : "var(--status-existing-fg)",
  border: hi ? "1px solid var(--border-strong)" : "0",
  radius: "2px",
  pad: "8px",
  label,
});

const out = (a: number, b: number, label: string): Mark => ({
  ...seg(a, b, label),
  bg: "transparent",
  fg: "var(--text-primary)",
  border: "1px solid var(--border-strong)",
});

const dot = (h: number): Mark => ({
  left: `calc(${pct(h)} - 4px)`,
  width: "8px",
  top: "14px",
  height: "8px",
  bg: "var(--text-primary)",
  fg: "var(--text-primary)",
  border: "0",
  radius: "50%",
  pad: "0",
  label: "",
});

const tick = (h: number): Mark => ({
  left: pct(h),
  width: "1px",
  top: "8px",
  height: "20px",
  bg: "var(--text-body)",
  fg: "var(--text-primary)",
  border: "0",
  radius: "0",
  pad: "0",
  label: "",
});

const vit: Mark[] = [];
for (let h = 0; h <= 71; h += h > 4 && h < 52 ? 1 : 2) {
  vit.push(tick(h + 0.5));
}

const rows: Array<{ table: string; marks: Mark[] }> = [
  { table: "adt", marks: [out(0, 5, "ed"), seg(5, 52, "icu"), out(52, 72, "ward")] },
  { table: "vitals", marks: vit },
  {
    table: "labs",
    marks: [1, 6, 12, 18, 24, 30, 36, 48, 60, 70].map(dot),
  },
  {
    table: "respiratory_support",
    marks: [
      seg(6, 30, "IMV"),
      out(30, 40, "NIPPV"),
      out(40, 54, "High Flow NC"),
      out(54, 72, "Room Air"),
    ],
  },
  { table: "position", marks: [seg(10, 26, "prone", true)] },
  {
    table: "medication_admin_continuous",
    marks: [seg(8, 26, "norepinephrine", true), out(27, 42, "propofol")],
  },
  {
    table: "patient_assessments",
    marks: [2, 8, 12, 16, 20, 24, 28, 32, 36, 44, 52, 64].map(dot),
  },
  { table: "hospitalization", marks: [out(0, 72, "admission → discharge")] },
];

const hourTicks = [0, 12, 24, 36, 48, 60, 72].map((h, i, a) => ({
  left: pct(h),
  label: `${h}h`,
  shift: i === 0 ? "0" : i === a.length - 1 ? "-100%" : "-50%",
}));

export function IcuStayFigure() {
  return (
    <DataPanel
      title={<span id="fig-stay">One ICU stay, as CLIF records it</span>}
      meta="Illustrative schematic · not patient data"
      footer={
        <span
          style={{
            display: "flex",
            gap: "10px 28px",
            flexWrap: "wrap",
            fontSize: 13,
            color: "var(--text-body)",
          }}
        >
          <span>
            Simplified to show the idea. The full specification and mCIDE are
            maintained by the CLIF Consortium at{" "}
            <a
              href="https://clif-icu.com/data-dictionary"
              style={{ color: "var(--link)" }}
            >
              clif-icu.com ↗
            </a>
            .
          </span>
          <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
            <span
              style={{
                width: 14,
                height: 10,
                background: "var(--status-existing-bg)",
                borderRadius: "var(--radius-tag)",
              }}
            />
            Interval
          </span>
          <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
            <span
              style={{
                width: 14,
                height: 10,
                background: "var(--accent)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-tag)",
              }}
            />
            Highlighted interval
          </span>
          <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
            <span
              style={{
                width: 8,
                height: 8,
                background: "var(--status-existing-bg)",
                borderRadius: "50%",
              }}
            />
            Discrete measurement
          </span>
        </span>
      }
    >
      <div
        style={{
          padding: "16px 20px 8px",
          overflowX: "auto",
          maxWidth: "100%",
          overscrollBehaviorX: "contain",
        }}
        tabIndex={0}
        role="region"
        aria-label="ICU stay schematic timeline. Scroll horizontally on small screens."
      >
        <div style={{ minWidth: 640, width: "max-content", maxWidth: "none" }}>
        <div
          style={{
            display: "flex",
            columnGap: 16,
            paddingBottom: 8,
          }}
        >
          <span style={{ flex: "0 0 220px" }} />
          <div
            style={{
              flex: "1 1 auto",
              position: "relative",
              height: 16,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            {hourTicks.map((t) => (
              <span
                key={t.label}
                style={{
                  position: "absolute",
                  top: 0,
                  transform: `translateX(${t.shift})`,
                  left: t.left,
                }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>
        {rows.map((r) => (
          <div
            key={r.table}
            style={{
              display: "flex",
              columnGap: 16,
              alignItems: "center",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <span
              style={{
                flex: "0 0 220px",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                padding: "8px 0 2px",
              }}
            >
              {r.table}
            </span>
            <div
              style={{
                flex: "1 1 auto",
                position: "relative",
                height: 36,
                backgroundImage:
                  "linear-gradient(90deg,var(--grid-line) 1px,transparent 1px)",
                backgroundSize: "16.6667% 100%",
              }}
            >
              {r.marks.map((m, i) => (
                <span
                  key={`${r.table}-${i}`}
                  title={m.label || undefined}
                  style={{
                    position: "absolute",
                    top: m.top,
                    left: m.left,
                    width: m.width,
                    height: m.height,
                    background: m.bg,
                    border: m.border,
                    borderRadius: m.radius,
                    color: m.fg,
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    padding: `0 ${m.pad}`,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    </DataPanel>
  );
}
