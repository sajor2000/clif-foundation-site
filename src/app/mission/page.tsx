import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { PRINCIPLES } from "@/lib/content";

export const metadata: Metadata = { title: "Mission" };

export default function MissionPage() {
  return (
    <SiteShell current="mission">
      <section
        className="page-wrap"
        style={{
          paddingTop: "clamp(56px,8vw,112px)",
          paddingBottom: "clamp(48px,6vw,80px)",
          display: "grid",
          gap: 24,
        }}
      >
        <span className="eyebrow">01 / mission</span>
        <h1 className="display-l" style={{ maxWidth: 1100 }}>
          Make shared critical care data practical beyond research.
        </h1>
      </section>

      <section
        className="page-wrap"
        style={{
          paddingBottom: "clamp(72px,8vw,112px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "40px 72px",
        }}
      >
        <div
          style={{
            flex: "0 1 300px",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--text-muted)",
            display: "grid",
            gap: 8,
            alignContent: "start",
          }}
        >
          <span>Mission statement</span>
        </div>
        <div
          style={{
            flex: "1 1 560px",
            display: "grid",
            gap: 22,
            fontSize: "var(--type-lead-lg)",
            lineHeight: 1.6,
            maxWidth: 760,
          }}
        >
          <p style={{ margin: 0 }}>
            CLIF Foundation exists to scale adoption of the Common Longitudinal
            ICU data Format, an open standard for organizing critical care EHR
            data, across health systems, research groups, professional societies,
            and EHR vendors.
          </p>
          <p style={{ margin: 0, color: "var(--text-body)" }}>
            CLIF was built for federated observational research. Wider adoption
            needs different support: conversion tools, terminology mapping,
            implementation help, training, and long-term care of the open
            specification and tools. That is why the Foundation exists.
          </p>
        </div>
      </section>

      <section className="band">
        <div
          className="page-wrap"
          style={{
            paddingTop: "clamp(72px,8vw,112px)",
            paddingBottom: "clamp(72px,8vw,112px)",
            display: "grid",
            gap: 40,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "var(--type-display-m)",
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            Two organizations, distinct roles
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
              gap: 24,
            }}
          >
            <div
              style={{
                background: "var(--bg-figure)",
                border: "1px solid var(--border-strong)",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border-strong)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                }}
              >
                <span>CLIF Consortium</span>
                <span style={{ color: "var(--text-muted)" }}>existing</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                <li style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                  Supports investigators through federated, privacy-preserving
                  multicenter research
                </li>
                <li style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                  Guides the CLIF data standard and research methods
                </li>
                <li style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                  Credits research to the original investigators; patient data
                  remains at each member site
                </li>
                <li style={{ padding: "16px 20px" }}>
                  <a href="https://clif-icu.com/" style={{ color: "var(--link)" }}>
                    clif-icu.com ↗
                  </a>
                </li>
              </ul>
            </div>
            <div
              style={{
                background: "var(--bg-figure)",
                border: "1px solid var(--border-strong)",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border-strong)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  background: "var(--accent)",
                  color: "var(--accent-on)",
                }}
              >
                <span>CLIF Foundation</span>
                <span>Illinois nonprofit</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                <li style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                  Scales CLIF adoption across organizations beyond observational
                  research
                </li>
                <li style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                  Supports shared tools, terminology mapping, ETL help, and
                  training
                </li>
                <li style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                  Does not conduct research or hold patient data; sets budgets
                  for adoption work
                </li>
                <li style={{ padding: "16px 20px" }}>
                  <Link href="/our-work" style={{ color: "var(--link)" }}>
                    Programs
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        className="page-wrap"
        style={{
          paddingTop: "clamp(72px,8vw,112px)",
          paddingBottom: "clamp(72px,8vw,112px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "40px 72px",
        }}
      >
        <h2
          style={{
            flex: "0 1 360px",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "var(--type-display-m)",
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
            Values that guide the work
        </h2>
        <ol
          style={{
            flex: "1 1 520px",
            margin: 0,
            padding: 0,
            listStyle: "none",
            borderTop: "1px solid var(--border-strong)",
          }}
        >
          {PRINCIPLES.map((p) => (
            <li
              key={p.n}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 24px",
                padding: "22px 0",
                borderBottom: "1px solid var(--border)",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  flex: "0 0 40px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: 13,
                  letterSpacing: ".01em",
                  color: "var(--link)",
                }}
              >
                {p.n}
              </span>
              <span style={{ flex: "0 0 240px", fontSize: 19, fontWeight: 500 }}>
                {p.t}
              </span>
              <span
                style={{
                  flex: "1 1 280px",
                  color: "var(--text-body)",
                  fontSize: 16,
                }}
              >
                {p.d}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </SiteShell>
  );
}
