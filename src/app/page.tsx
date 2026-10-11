import Link from "next/link";
import { Button } from "@/components/core/Button";
import { Tag } from "@/components/core/Tag";
import { KeyValueList } from "@/components/data/KeyValueList";
import { DataPanel } from "@/components/data/DataPanel";
import { IcuStayFigure } from "@/components/home/IcuStayFigure";
import { SiteShell } from "@/components/layout/SiteShell";
import {
  HOME_PATHS,
  HOME_PUBS,
  MAPPINGS,
  NEEDS,
  ORG_RECORD,
  PROGRAMS,
} from "@/lib/content";

export default function HomePage() {
  return (
    <SiteShell current="home">
      <section
        className="page-wrap"
        style={{
          paddingTop: "clamp(56px,9vw,128px)",
          paddingBottom: "clamp(40px,5vw,64px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "48px 64px",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: "1 1 560px", minWidth: 0, display: "grid", gap: 28 }}>
          <span className="eyebrow">An Illinois nonprofit for critical care data</span>
          <h1 className="display-xl">Open infrastructure for critical care data.</h1>
          <p
            style={{
              fontSize: "clamp(17px,1.5vw,20px)",
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 620,
              color: "var(--text-body)",
              textWrap: "pretty",
            }}
          >
            Every hospital records intensive care differently. CLIF is a free,
            open standard that makes those records comparable, so clinicians at
            many hospitals can study critical illness together. CLIF Foundation
            proposes to fund the training, hands-on help, and long-term upkeep
            that let more hospitals use it.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Button href="/support" size="lg">
              Support CLIF
            </Button>
            <Button href="/mission" variant="secondary" size="lg">
              Read the mission
            </Button>
          </div>
        </div>
        <DataPanel
          title="organization.record"
          meta="1 row"
          style={{ flex: "0 1 380px", minWidth: 0 }}
        >
          <KeyValueList
            rows={ORG_RECORD.map((r) => ({ k: r.k, v: r.v }))}
          />
        </DataPanel>
      </section>

      <section
        aria-label="In plain terms"
        className="page-wrap"
        style={{ paddingBottom: "clamp(64px,8vw,112px)" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))",
            borderTop: "1px solid var(--border-strong)",
          }}
        >
          {[
            {
              eyebrow: "What CLIF is",
              title: "A shared format for ICU records",
              body: "Ventilators, infusions, labs and vital signs are stored differently at every hospital. CLIF puts them in one common layout so the same question can be asked at any site. It is open source and free to use.",
              pad: "28px 24px 32px 0",
              cta: null as string | null,
            },
            {
              eyebrow: "Why a Foundation",
              title:
                "The Consortium does research. The Foundation helps hospitals adopt.",
              body: "The CLIF Consortium is a network of academic centers that built the standard and runs studies with it. Getting a new hospital started takes training, technical help and maintenance that research grants do not cover. The Foundation funds that work.",
              pad: "28px 24px 32px",
              cta: null,
            },
            {
              eyebrow: "What a gift funds",
              title: "Training, implementation help and upkeep",
              body: "Gifts support courses for clinicians and data teams, hands-on help for hospitals converting their records, and maintenance of the open specification and tools. No gift funds research or touches patient data.",
              pad: "28px 0 32px 24px",
              cta: "How to give →",
            },
          ].map((col) => (
            <div
              key={col.eyebrow}
              style={{
                display: "grid",
                gap: 12,
                alignContent: "start",
                padding: col.pad,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span className="eyebrow" style={{ fontSize: 12 }}>
                {col.eyebrow}
              </span>
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
              {col.cta ? (
                <Link href="/support" className="linkish">
                  {col.cta}
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="fig-stay"
        className="page-wrap"
        style={{ paddingBottom: "clamp(80px,9vw,128px)" }}
      >
        <IcuStayFigure />
      </section>

      <section className="band-inverse">
        <div
          className="page-wrap"
          style={{
            paddingTop: "var(--section-y)",
            paddingBottom: "var(--section-y)",
            display: "grid",
            gap: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "24px 64px",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: "1 1 440px", display: "grid", gap: 18 }}>
              <span className="eyebrow" style={{ color: "var(--accent-text)", fontSize: 12 }}>
                01 — How CLIF research works
              </span>
              <h2 className="h2">Data stays at each hospital. Code travels.</h2>
            </div>
            <p
              style={{
                flex: "1 1 400px",
                margin: 0,
                fontSize: 18,
                lineHeight: 1.6,
                color: "var(--text-inverse-body)",
              }}
            >
              The CLIF Consortium conducts federated research: each site converts
              its EHR data to CLIF locally, runs shared analysis code, and returns
              only aggregate results. The Foundation’s work helps more sites
              reach that first step.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
              gap: 12,
            }}
          >
            {["A", "B", "C", "D", "E"].map((l) => (
              <div key={l} style={{ display: "grid", gap: 0 }}>
                <div
                  style={{
                    border: "1px solid var(--border-inverse)",
                    borderRadius: 4,
                    padding: "14px 16px",
                    display: "grid",
                    gap: 10,
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                  }}
                >
                  <span style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Site {l}</span>
                    <span style={{ color: "var(--accent-text)" }} aria-hidden>
                      ●
                    </span>
                  </span>
                  <span style={{ color: "var(--text-inverse-muted)", lineHeight: 1.7 }}>
                    EHR → CLIF tables
                    <br />
                    run shared code
                  </span>
                </div>
                <div style={{ height: 36, display: "flex", justifyContent: "center" }}>
                  <span
                    style={{
                      width: 1,
                      background:
                        "repeating-linear-gradient(var(--accent) 0 4px,transparent 4px 8px)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              border: "1px solid var(--accent)",
              borderRadius: 4,
              padding: "16px 20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px 28px",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 13,
            }}
          >
            <span style={{ color: "var(--accent-text)" }}>Aggregate results only</span>
            <span style={{ color: "var(--text-inverse-body)" }}>
              No patient-level data leaves an institution
            </span>
          </div>
        </div>
      </section>

      <section
        className="page-wrap"
        style={{
          paddingTop: "var(--section-y)",
          display: "grid",
          gap: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px 64px",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: "1 1 480px", display: "grid", gap: 14 }}>
            <span className="eyebrow" style={{ fontSize: 12 }}>
              02 — How CLIF organizes ICU data
            </span>
            <h2 className="h2">Life support, as connected tables.</h2>
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

        <div>
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
                <span style={{ fontSize: 15, lineHeight: 1.5, color: "var(--text-body)" }}>
                  {n.how}
                </span>
                <code
                  style={{
                    justifySelf: "start",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11.5,
                    background: "var(--bg-inverse)",
                    color: "var(--accent-text)",
                    borderRadius: 3,
                    padding: "4px 8px",
                  }}
                >
                  {n.ex}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="page-wrap"
        style={{
          paddingTop: "var(--section-y)",
          display: "grid",
          gap: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <span className="eyebrow" style={{ fontSize: 12 }}>
              03 — Our work
            </span>
            <h2 className="h2">Four programs</h2>
          </div>
          <Link href="/our-work" className="linkish">
            Program details
          </Link>
        </div>
        <div
          style={{
            border: "1px solid var(--border-strong)",
            borderRadius: 6,
            overflow: "hidden",
            background: "var(--bg-figure)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-muted)",
              background: "var(--bg-panel)",
              borderBottom: "1px solid var(--border-strong)",
              padding: "12px 20px",
              gap: 16,
            }}
          >
            <span style={{ flex: "0 0 150px" }}>program_id</span>
            <span style={{ flex: "1 1 200px" }}>name · scope</span>
          </div>
          {PROGRAMS.map((p) => (
            <Link
              key={p.id}
              href="/our-work"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 16px",
                padding: "22px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                textDecoration: "none",
                alignItems: "baseline",
                color: "inherit",
              }}
            >
              <span
                style={{
                  flex: "0 0 150px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: 13,
                  letterSpacing: ".01em",
                  color: "var(--link)",
                }}
              >
                {p.id}
              </span>
              <span
                style={{
                  flex: "1 1 320px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px 24px",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    flex: "0 0 260px",
                    fontSize: 20,
                    fontWeight: 500,
                    lineHeight: 1.3,
                  }}
                >
                  {p.name}
                </span>
                <span
                  style={{
                    flex: "1 1 280px",
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: "var(--text-body)",
                  }}
                >
                  {p.scope}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="page-wrap"
        style={{
          paddingTop: "var(--section-y)",
          display: "flex",
          flexWrap: "wrap",
          gap: "48px 72px",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: "1 1 380px", display: "grid", gap: 18 }}>
          <span className="eyebrow" style={{ fontSize: 12 }}>
            04 — Inside the standard
          </span>
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
            CLIF’s minimum Common ICU Data Elements (mCIDE) map each site’s local
            terms to the same permissible values, so one analysis runs the same
            way everywhere.
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
          style={{
            flex: "1 1 440px",
            minWidth: 0,
            border: "1px solid var(--border-strong)",
            borderRadius: 6,
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
              style={{
                display: "flex",
                gap: 16,
                padding: "11px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                alignItems: "center",
              }}
            >
              <span style={{ flex: "1 1 0", color: "var(--text-body)", minWidth: 0 }}>
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
      </section>

      <section className="band" style={{ marginTop: "var(--section-y)" }}>
        <div
          className="page-wrap"
          style={{
            paddingTop: "clamp(72px,9vw,112px)",
            paddingBottom: "clamp(72px,9vw,112px)",
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
            <span className="eyebrow" style={{ fontSize: 12 }}>
              05 — Research using CLIF
            </span>
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
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "var(--text-muted)" }}>
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
      </section>

      <section
        className="page-wrap"
        style={{
          paddingTop: "clamp(72px,9vw,112px)",
          paddingBottom: "clamp(72px,9vw,112px)",
          display: "grid",
          gap: 36,
        }}
      >
        <div style={{ display: "grid", gap: 14 }}>
          <span className="eyebrow" style={{ fontSize: 12 }}>
            06 — Where to start
          </span>
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
              <span style={{ fontSize: 15, lineHeight: 1.5, color: "var(--text-muted)" }}>
                {p.cta}
              </span>
            </a>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
