import Link from "next/link";
import { Button } from "@/components/core/Button";
import { Tag } from "@/components/core/Tag";
import { KeyValueList } from "@/components/data/KeyValueList";
import { DataPanel } from "@/components/data/DataPanel";
import { ChapterFolio } from "@/components/home/ChapterFolio";
import { FederationLattice } from "@/components/home/FederationLattice";
import { IcuStayFigure } from "@/components/home/IcuStayFigure";
import { ScrollCraftMount } from "@/components/home/ScrollCraftMount";
import { SiteShell } from "@/components/layout/SiteShell";
import {
  CONTACT_EMAIL,
  HOME_PATHS,
  HOME_PUBS,
  MAPPINGS,
  NEEDS,
  ORG_RECORD,
  PROGRAMS,
} from "@/lib/content";

export function HomeScroll() {
  return (
    <SiteShell current="home">
      <ScrollCraftMount>
        <ChapterFolio />

        {/* 00 · Title page */}
        <section
          id="ch-title"
          data-sc-act="flow"
          className="page-wrap"
          style={{
            paddingTop: "clamp(56px,9vw,128px)",
            paddingBottom: "clamp(64px,8vw,112px)",
          }}
          aria-labelledby="home-title"
        >
          <div
            data-sc-in
            data-sc-stagger="70"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "48px 64px",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: "1 1 560px", minWidth: 0, display: "grid", gap: 28 }}>
              <h1 id="home-title" className="display-xl">
                Open infrastructure for critical care data.
              </h1>
              <p
                style={{
                  fontSize: "clamp(17px,1.5vw,20px)",
                  lineHeight: 1.55,
                  margin: 0,
                  maxWidth: "62ch",
                  color: "var(--text-body)",
                  textWrap: "pretty",
                }}
              >
                Every hospital records intensive care differently. CLIF is a free,
                open standard that makes those records comparable. The Foundation
                exists to help CLIF move beyond observational research, supporting
                the tools, mapping, implementation help, and training that let more
                organizations use it.
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px 20px",
                  alignItems: "center",
                }}
              >
                <Button href="/support" size="lg">
                  Support CLIF
                </Button>
                <Link href="/mission" className="linkish">
                  Read the mission
                </Link>
              </div>
            </div>
            <DataPanel
              title="organization.record"
              meta="1 row"
              style={{ flex: "0 1 380px", minWidth: 0 }}
            >
              <KeyValueList rows={ORG_RECORD.map((r) => ({ k: r.k, v: r.v }))} />
            </DataPanel>
          </div>

          <div
            data-sc-in
            data-sc-stagger="60"
            className="sc-chapter-cut"
            style={{
              marginTop: "clamp(56px,7vw,96px)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))",
            }}
            aria-label="In plain terms"
          >
            {[
              {
                key: "what",
                title: "A shared format for ICU records",
                body: "Ventilators, infusions, labs and vital signs are stored differently at every hospital. CLIF puts them in one common layout so the same question can be asked at any site. It is open source and free to use.",
                pad: "28px 24px 32px 0",
              },
              {
                key: "why",
                title:
                  "Research built CLIF. Adoption needs its own infrastructure.",
                body: "The CLIF Consortium develops the standard and supports federated research. Bringing CLIF to health systems, research groups, societies, and EHR vendors requires conversion tools, terminology mapping, implementation support, and training. The Foundation helps organize and fund that work.",
                pad: "28px 24px 32px",
              },
              {
                key: "gift",
                title: "Tools, mapping, training, and implementation help",
                body: "Gifts support courses for clinicians and data teams, reusable mappings, hands-on implementation help, and maintenance of the open specification and tools. Foundation support is for adoption work, not research or patient data.",
                pad: "28px 0 32px 24px",
                cta: true,
              },
            ].map((col) => (
              <div
                key={col.key}
                style={{
                  display: "grid",
                  gap: 12,
                  alignContent: "start",
                  padding: col.pad,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 24,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {col.title}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: "var(--text-body)",
                    textWrap: "pretty",
                  }}
                >
                  {col.body}
                </p>
                {"cta" in col && col.cta ? (
                  <Link href="/support" className="linkish">
                    How to give →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* 01 · Peak: federation lattice */}
        <section
          id="ch-federation"
          data-sc-act="pin"
          data-sc-span="2.4"
          aria-labelledby="fig-fed"
        >
          <div data-sc-stage className="sc-chapter--ink">
            <div
              className="page-wrap"
              style={{
                height: "100%",
                display: "grid",
                alignContent: "center",
                gap: 28,
                paddingBlock: 36,
              }}
            >
              <header className="sc-intertitle" data-sc-cue="0">
                <span className="sc-intertitle__n">01</span>
                <span>Federation</span>
              </header>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "20px 64px",
                  alignItems: "flex-end",
                }}
              >
                <div style={{ flex: "1 1 440px", display: "grid", gap: 18 }}>
                  <h2
                    id="fig-fed"
                    className="h2"
                    data-sc-cue="0"
                    style={{ color: "var(--text-inverse)", margin: 0 }}
                  >
                    Data stays at each hospital. Code travels.
                  </h2>
                </div>
                <p
                  data-sc-cue="0.08"
                  style={{
                    flex: "1 1 400px",
                    margin: 0,
                    fontSize: 18,
                    lineHeight: 1.65,
                    letterSpacing: "0.01em",
                    color: "var(--text-inverse-body)",
                    maxWidth: "48ch",
                  }}
                >
                  The CLIF Consortium conducts federated research: each site
                  converts its EHR data to CLIF locally, runs shared analysis
                  code, and returns only aggregate results. The Foundation’s work
                  helps more sites reach that first step.
                </p>
              </div>

              <FederationLattice />
            </div>
          </div>
        </section>

        {/* 02 · Tables */}
        <section
          id="ch-tables"
          data-sc-act="flow"
          aria-labelledby="fig-stay"
        >
          <div
            className="page-wrap"
            style={{
              paddingTop: "var(--section-y)",
              paddingBottom: "var(--section-y)",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: 40,
            }}
          >
          <header className="sc-intertitle">
            <span className="sc-intertitle__n">02</span>
            <span>Tables</span>
          </header>
          <div
            data-sc-in
            data-sc-stagger="70"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "24px 64px",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: "1 1 480px", display: "grid", gap: 14 }}>
              <h2 id="fig-stay" className="h2">
                Life support, as connected tables.
              </h2>
            </div>
            <p
              style={{
                flex: "1 1 380px",
                margin: 0,
                fontSize: 17,
                lineHeight: 1.6,
                color: "var(--text-body)",
              }}
            >
              Ventilation, vasoactive infusions, renal replacement, and ECMO are
              recorded by different devices and systems. CLIF gives each its own
              table, timestamps every row, and links them all to the same
              hospitalization.
            </p>
          </div>

          <div data-sc-reveal="up" data-sc-reveal-at="0.12 0.55">
            <IcuStayFigure />
          </div>

          <div data-sc-in data-sc-stagger="50">
            <h3
              style={{
                margin: "0 0 20px",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "clamp(24px,2.4vw,32px)",
                letterSpacing: "-0.02em",
              }}
            >
              What ICU data needs, and what CLIF provides
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))",
                borderTop: "1px solid var(--border-strong)",
                borderLeft: "1px solid var(--border)",
              }}
            >
              {NEEDS.map((n) => (
                <div
                  key={n.n}
                  style={{
                    display: "grid",
                    gridTemplateRows: "auto auto 1fr auto",
                    gap: 10,
                    padding: "22px 20px",
                    borderRight: "1px solid var(--border)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span className="eyebrow" style={{ fontSize: 11 }}>
                    {n.n} need
                  </span>
                  <span style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.3 }}>
                    {n.need}
                  </span>
                  <span
                    style={{ fontSize: 15, lineHeight: 1.5, color: "var(--text-body)" }}
                  >
                    {n.how}
                  </span>
                  <code
                    style={{
                      justifySelf: "start",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11.5,
                      background: "var(--bg-inverse)",
                      color: "var(--accent-text)",
                      borderRadius: "var(--radius-control)",
                      padding: "4px 8px",
                    }}
                  >
                    {n.ex}
                  </code>
                </div>
              ))}
            </div>
          </div>
          </div>
        </section>

        {/* 03 · Programs pan */}
        <section
          id="ch-programs"
          data-sc-act="pan"
          data-sc-span="2.0"
          aria-labelledby="programs-heading"
        >
          <div data-sc-stage>
            <div
              className="sc-program-rail"
              data-sc-pan="0.08"
              style={{ height: "100%", alignItems: "center" }}
            >
              <div className="sc-program-rail__lead">
                <header className="sc-intertitle" style={{ marginBottom: 8 }}>
                  <span className="sc-intertitle__n">03</span>
                  <span>Programs</span>
                </header>
                <h2 id="programs-heading" className="h2">
                  Four programs
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: "var(--text-body)",
                    maxWidth: "36ch",
                  }}
                >
                  Training, implementation help, stewardship, and convening.
                  Choose a program, then continue.
                </p>
                <Link href="/our-work" className="linkish">
                  Program details
                </Link>
              </div>
              {PROGRAMS.map((p) => (
                <Link
                  key={p.id}
                  href="/our-work"
                  className="sc-program-card"
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--link)",
                    }}
                  >
                    {p.id}
                  </span>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 500,
                      lineHeight: 1.25,
                      fontFamily: "var(--font-display)",
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {p.name}
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      lineHeight: 1.55,
                      color: "var(--text-body)",
                    }}
                  >
                    {p.scope}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 04 · Close: crosswalk + paths + colophon */}
        <section id="ch-close" data-sc-act="flow">
          <div
            className="page-wrap"
            style={{
              paddingTop: "var(--section-y)",
              paddingBottom: "clamp(72px,9vw,112px)",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: 64,
            }}
          >
          <header className="sc-intertitle">
            <span className="sc-intertitle__n">04</span>
            <span>Start</span>
          </header>
          <div
            data-sc-in
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "48px 72px",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: "1 1 380px", display: "grid", gap: 18 }}>
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
                Shared vocabularies make multicenter code portable.
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
                CLIF’s minimum Common ICU Data Elements (mCIDE) map each site’s
                local terms to the same permissible values, so one analysis runs
                the same way everywhere.
              </p>
              <a
                href="https://clif-icu.com/data-dictionary"
                className="linkish"
                target="_blank"
                rel="noopener noreferrer"
              >
                Data Dictionary on clif-icu.com ↗
              </a>
            </div>
            <div
              data-sc-reveal="left"
              data-sc-reveal-at="0.1 0.55"
              style={{
                flex: "1 1 440px",
                minWidth: 0,
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-panel)",
                background: "var(--bg-figure)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid var(--border-strong)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  justifyContent: "space-between",
                }}
              >
                <span>respiratory_support.device_category</span>
                <span style={{ color: "var(--text-muted)" }}>mCIDE</span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "10px 20px",
                  color: "var(--text-muted)",
                  borderBottom: "1px solid var(--border-subtle)",
                  fontSize: 12,
                }}
              >
                <span style={{ flex: "1 1 0" }}>site-local device_name</span>
                <span style={{ flex: "1 1 0" }}>device_category</span>
              </div>
              {MAPPINGS.map((m) => (
                <div
                  key={m.local}
                  className="sc-crosswalk-row"
                  style={{
                    display: "flex",
                    gap: 16,
                    padding: "11px 20px",
                    borderBottom: "1px solid var(--border-subtle)",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      flex: "1 1 0",
                      color: "var(--text-body)",
                      minWidth: 0,
                    }}
                  >
                    {m.local}
                  </span>
                  <span style={{ flex: "1 1 0", minWidth: 0 }}>
                    <Tag status="existing">{m.cat}</Tag>
                  </span>
                </div>
              ))}
              <div
                style={{
                  padding: "11px 20px",
                  color: "var(--text-muted)",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                }}
              >
                Example local terms are illustrative.
              </div>
            </div>
          </div>

          <div className="band" style={{ marginInline: "calc(-1 * var(--gutter))" }}>
            <div
              className="page-wrap"
              data-sc-in
              data-sc-stagger="60"
              style={{
                paddingTop: "clamp(56px,7vw,88px)",
                paddingBottom: "clamp(56px,7vw,88px)",
                display: "flex",
                flexWrap: "wrap",
                gap: "40px 72px",
              }}
            >
              <div
                style={{
                  flex: "0 1 340px",
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
                  Recent publications
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: "var(--text-muted)",
                  }}
                >
                  Conducted by the CLIF Consortium and the original investigators.
                </p>
                <Link href="/research" className="linkish">
                  All research &amp; resources
                </Link>
              </div>
              <div style={{ flex: "1 1 520px", minWidth: 0 }} className="hairline-list">
                {HOME_PUBS.map((p) => (
                  <a
                    key={p.url}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px 24px",
                      padding: "22px 0",
                      borderBottom: "1px solid var(--border)",
                      textDecoration: "none",
                      alignItems: "baseline",
                      color: "inherit",
                    }}
                  >
                    <span
                      style={{
                        flex: "0 0 56px",
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        color: "var(--text-muted)",
                      }}
                    >
                      {p.year}
                    </span>
                    <span
                      style={{
                        flex: "1 1 360px",
                        fontSize: 19,
                        fontWeight: 500,
                        lineHeight: 1.35,
                      }}
                    >
                      {p.title}
                    </span>
                    <span
                      style={{
                        flex: "0 1 220px",
                        fontSize: 14,
                        color: "var(--text-muted)",
                      }}
                    >
                      {p.venue} ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div data-sc-in data-sc-stagger="50" style={{ display: "grid", gap: 36 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "var(--type-display-m)",
                  letterSpacing: "-0.025em",
                  margin: 0,
                }}
              >
                Choose your path
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))",
                borderTop: "1px solid var(--border-strong)",
              }}
            >
              {HOME_PATHS.map((p) => (
                <a
                  key={p.n}
                  href={p.href}
                  {...(p.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  style={{
                    display: "grid",
                    gap: 10,
                    alignContent: "start",
                    padding: "24px 24px 28px 0",
                    borderBottom: "1px solid var(--border)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <span className="eyebrow" style={{ fontSize: 12 }}>
                    {p.n}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 24,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {p.who} {p.arrow}
                  </span>
                  <span
                    style={{ fontSize: 15, lineHeight: 1.5, color: "var(--text-muted)" }}
                  >
                    {p.cta}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="sc-colophon" data-sc-in>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "var(--text-muted)" }}>
              CLIF Foundation · Illinois nonprofit · scaling CLIF adoption beyond
              research · 501(c)(3) application pending. Research credited to the
              CLIF Consortium.
            </p>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5 }}>
              Give online:{" "}
              <a href="/support#give">/support#give</a>
              {" · "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
          </div>
        </section>
      </ScrollCraftMount>
    </SiteShell>
  );
}
