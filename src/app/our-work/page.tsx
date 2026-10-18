import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Button } from "@/components/core/Button";
import { SiteShell } from "@/components/layout/SiteShell";
import { CONTACT_EMAIL, PROGRAMS } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Our Work",
  description:
    "Four CLIF Foundation programs: implementation support for EHR-to-CLIF conversion, education, open-source stewardship, and convening on the ICU data standard.",
  path: "/our-work",
});

export default function OurWorkPage() {
  return (
    <SiteShell current="work">
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
          <span className="eyebrow">02 / our_work</span>
          <h1 className="display-l">Programs</h1>
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
          Four programs that help organizations adopt CLIF. Each builds on
          resources the CLIF Consortium already publishes.
        </p>
      </section>

      <section
        className="page-wrap"
        style={{
          paddingBottom: "clamp(72px,8vw,112px)",
          display: "grid",
          gap: 20,
        }}
      >
        {PROGRAMS.map((p) => (
          <article
            key={p.id}
            id={p.id}
            style={{
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-panel)",
              background: "var(--bg-figure)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 24px",
                justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom: "1px solid var(--border-strong)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
            >
              <span style={{ color: "var(--link)" }}>{p.id}</span>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "24px 56px",
                padding: "28px 20px 32px",
              }}
            >
              <div
                style={{
                  flex: "1 1 360px",
                  display: "grid",
                  gap: 12,
                  alignContent: "start",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "clamp(24px,2.4vw,32px)",
                    letterSpacing: "-0.02em",
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  {p.name}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 17,
                    lineHeight: 1.6,
                    color: "var(--text-body)",
                    maxWidth: 560,
                  }}
                >
                  {p.scope}
                </p>
              </div>
              <dl
                style={{
                  flex: "1 1 320px",
                  margin: 0,
                  display: "grid",
                  fontSize: 15,
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px 16px",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <dt
                    style={{
                      flex: "0 0 110px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--text-muted)",
                      paddingTop: 2,
                    }}
                  >
                    serves
                  </dt>
                  <dd style={{ margin: 0, flex: "1 1 180px" }}>{p.serves}</dd>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px 16px",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <dt
                    style={{
                      flex: "0 0 110px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--text-muted)",
                      paddingTop: 2,
                    }}
                  >
                    builds_on
                  </dt>
                  <dd style={{ margin: 0, flex: "1 1 180px" }}>
                    <a href={p.baseUrl} className="prose-link">
                      {p.base} ↗
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </article>
        ))}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px 32px",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 0 0",
            borderTop: "1px solid var(--border-strong)",
            marginTop: 20,
          }}
        >
          <p style={{ margin: 0, fontSize: 18, maxWidth: 640 }}>
            Interested in shaping or supporting a program? Start with an email.
          </p>
          <Button href={`mailto:${CONTACT_EMAIL}?subject=Program%20inquiry`} size="lg">
            {CONTACT_EMAIL}
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
