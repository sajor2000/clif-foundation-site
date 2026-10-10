import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { PublicationFilter } from "@/components/research/PublicationFilter";
import { RESOURCES } from "@/lib/content";

export const metadata: Metadata = { title: "Research & Resources" };

export default function ResearchPage() {
  return (
    <SiteShell current="research">
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
          <span className="eyebrow">03 / research_and_resources</span>
          <h1 className="display-l">Research built on CLIF</h1>
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
          Studies listed here are conducted and published by the CLIF Consortium
          and the original investigators. Each entry links to the original source.
        </p>
      </section>

      <section
        className="page-wrap"
        style={{
          paddingBottom: "clamp(72px,8vw,112px)",
          display: "grid",
          gap: "clamp(56px,6vw,88px)",
        }}
      >
        <PublicationFilter />

        <div style={{ display: "grid", gap: 18 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "clamp(26px,2.8vw,36px)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Resources
            </h2>
            <span style={{ fontSize: 15, color: "var(--text-muted)" }}>
              Maintained by the CLIF Consortium
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))",
              columnGap: 48,
              borderTop: "1px solid var(--border-strong)",
            }}
          >
            {RESOURCES.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  minHeight: 68,
                  padding: "12px 0",
                  alignItems: "center",
                  borderBottom: "1px solid var(--border)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <span style={{ display: "grid", gap: 2 }}>
                  <span style={{ fontSize: 17, fontWeight: 500 }}>{r.name}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--text-muted)",
                    }}
                  >
                    {r.note}
                  </span>
                </span>
                <span aria-hidden>↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
