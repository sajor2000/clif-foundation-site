import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { BOARD_SEATS, GOVERNING_DOCS } from "@/lib/content";

export const metadata: Metadata = { title: "Board & Governance" };

export default function BoardPage() {
  return (
    <SiteShell current="board">
      <section
        className="page-wrap"
        style={{
          paddingTop: "clamp(56px,8vw,112px)",
          paddingBottom: "clamp(40px,5vw,64px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "32px 72px",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: "1 1 560px", display: "grid", gap: 24 }}>
          <span className="eyebrow">04 / board_and_governance</span>
          <h1 className="display-l">Board of directors</h1>
        </div>
        <p
          style={{
            flex: "1 1 360px",
            margin: 0,
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--text-body)",
            borderLeft: "1px solid var(--border-strong)",
            paddingLeft: 20,
          }}
        >
          Board appointments are proposed and not yet confirmed. Names and
          affiliations will be published once appointments are final.
        </p>
      </section>

      <section
        className="page-wrap"
        style={{ paddingBottom: "clamp(72px,8vw,112px)" }}
      >
        <div
          style={{
            border: "1px solid var(--border-strong)",
            borderRadius: 6,
            background: "var(--bg-figure)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              padding: "12px 20px",
              background: "var(--bg-panel)",
              borderBottom: "1px solid var(--border-strong)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            <span style={{ flex: "0 0 160px" }}>seat</span>
            <span style={{ flex: "1 1 200px" }}>name</span>
            <span style={{ flex: "1 1 200px" }}>affiliation</span>
            <span style={{ flex: "0 0 90px" }}>status</span>
          </div>
          {BOARD_SEATS.map((role) => (
            <div
              key={role}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px 16px",
                padding: 20,
                borderBottom: "1px solid var(--border-subtle)",
                alignItems: "baseline",
              }}
            >
              <span style={{ flex: "0 0 160px", fontSize: 18, fontWeight: 500 }}>
                {role}
              </span>
              <span style={{ flex: "1 1 200px", color: "var(--text-muted)" }}>
                To be announced
              </span>
              <span style={{ flex: "1 1 200px", color: "var(--text-muted)" }}>—</span>
              <span
                style={{
                  flex: "0 0 90px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                }}
              >
                proposed
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="band">
        <div
          className="page-wrap"
          style={{
            paddingTop: "clamp(72px,8vw,112px)",
            paddingBottom: "clamp(72px,8vw,112px)",
            display: "flex",
            flexWrap: "wrap",
            gap: "40px 72px",
          }}
        >
          <div
            style={{
              flex: "1 1 400px",
              display: "grid",
              gap: 16,
              alignContent: "start",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "var(--type-display-m)",
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                margin: 0,
              }}
            >
              Relationship to the Consortium
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.6,
                color: "var(--text-body)",
                maxWidth: 520,
              }}
            >
              The CLIF Consortium maintains its own governance for research, data,
              and the standard. The Foundation’s proposed role is limited to
              supporting adoption.
            </p>
            <a
              href="https://clif-icu.com/governance"
              className="linkish"
              target="_blank"
              rel="noopener noreferrer"
            >
              Consortium governance ↗
            </a>
          </div>
          <div style={{ flex: "1 1 440px" }} className="hairline-list">
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--text-muted)",
                padding: "14px 0",
              }}
            >
              governing_documents
            </span>
            {GOVERNING_DOCS.map((d) => (
              <div
                key={d.name}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px 16px",
                  justifyContent: "space-between",
                  minHeight: 60,
                  padding: "12px 0",
                  alignItems: "center",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 17 }}>{d.name}</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
