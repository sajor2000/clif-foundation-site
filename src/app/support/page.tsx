import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/core/Button";
import { SiteShell } from "@/components/layout/SiteShell";
import { CopyEmailButton } from "@/components/support/CopyEmailButton";
import { DonateSoon } from "@/components/support/DonateSoon";
import { InquiryForm } from "@/components/support/InquiryForm";
import { CONTACT_EMAIL, SUPPORT_PATHS } from "@/lib/content";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <SiteShell current="support">
      <section
        className="page-wrap"
        style={{
          paddingTop: "clamp(56px,8vw,120px)",
          paddingBottom: "clamp(56px,6vw,96px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "40px 80px",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: "1 1 560px", display: "grid", gap: 24 }}>
          <span className="eyebrow">05 / support</span>
          <h1
            className="display-xl"
            style={{ fontSize: "var(--type-display-xl)" }}
          >
            Giving starts with a conversation.
          </h1>
        </div>
        <div style={{ flex: "1 1 380px", display: "grid", gap: 20 }}>
          <p
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.55,
              color: "var(--text-body)",
            }}
          >
            We are not accepting online payments. Email us to discuss a gift, a
            partnership, or another way to help.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button href={`mailto:${CONTACT_EMAIL}`} size="lg">
              {CONTACT_EMAIL}
            </Button>
            <CopyEmailButton />
          </div>
        </div>
      </section>

      <section
        className="page-wrap"
        style={{
          paddingBottom: "clamp(72px,8vw,112px)",
          display: "grid",
          gap: 32,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))",
            gap: 16,
          }}
        >
          {SUPPORT_PATHS.map((p) => (
            <div
              key={p.n}
              style={{
                display: "grid",
                gridTemplateRows: "auto auto 1fr auto",
                gap: 12,
                padding: "22px 20px",
                border: "1px solid var(--border-strong)",
                borderRadius: 6,
                background: "var(--bg-figure)",
              }}
            >
              <span className="eyebrow" style={{ fontSize: 12 }}>
                {p.n}
              </span>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                {p.who}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: 1.55,
                  color: "var(--text-body)",
                }}
              >
                {p.body}
              </p>
              <a
                href={p.href}
                {...(p.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="linkish"
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  marginTop: 8,
                }}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          <InquiryForm />
          <DonateSoon />
        </div>
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
            flex: "1 1 360px",
            display: "grid",
            gap: 14,
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
            What a gift would fund
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--text-body)",
              textWrap: "pretty",
            }}
          >
            Four proposed programs, all aimed at helping hospitals use CLIF. None
            are funded or operating yet; gifts would start them.
          </p>
          <Link href="/our-work" className="linkish">
            Program details
          </Link>
        </div>
        <ul
          style={{
            flex: "1 1 520px",
            margin: 0,
            padding: 0,
            listStyle: "none",
            borderTop: "1px solid var(--border-strong)",
          }}
        >
          {[
            [
              "01",
              "Education",
              "Courses and workshops so clinicians and data teams can work with CLIF data.",
            ],
            [
              "02",
              "Implementation help",
              "Hands-on guidance for a hospital converting its records to the standard.",
            ],
            [
              "03",
              "Upkeep of the open standard",
              "Maintaining the specification, data dictionary and free tools that everyone relies on.",
            ],
            [
              "04",
              "Convening",
              "Bringing adopting hospitals together to agree on future versions.",
            ],
          ].map(([n, t, d]) => (
            <li
              key={n}
              style={{
                padding: "20px 0",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 20px",
              }}
            >
              <span
                style={{
                  flex: "0 0 32px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: 13,
                  color: "var(--link)",
                  paddingTop: 4,
                }}
              >
                {n}
              </span>
              <div style={{ flex: "1 1 320px", display: "grid", gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 500 }}>{t}</span>
                <span
                  style={{
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: "var(--text-body)",
                  }}
                >
                  {d}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="band">
        <div
          className="page-wrap"
          style={{
            paddingTop: "clamp(72px,8vw,104px)",
            paddingBottom: "clamp(72px,8vw,104px)",
            display: "flex",
            flexWrap: "wrap",
            gap: "40px 72px",
          }}
        >
          <div
            style={{
              flex: "1 1 360px",
              display: "grid",
              gap: 14,
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
              How giving works
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.6,
                color: "var(--text-body)",
                textWrap: "pretty",
              }}
            >
              There is no online donation form. Every gift begins with a short
              email and a conversation.
            </p>
          </div>
          <ol
            style={{
              flex: "1 1 520px",
              margin: 0,
              padding: 0,
              listStyle: "none",
              borderTop: "1px solid var(--border-strong)",
            }}
          >
            {[
              [
                "1",
                "Email us",
                `Write to ${CONTACT_EMAIL} with your name and what you are considering.`,
              ],
              [
                "2",
                "We talk",
                "We reply to arrange a call about your interests and the proposed programs.",
              ],
              [
                "3",
                "Terms in writing",
                "Gift purpose, timing and acknowledgment would be confirmed in writing before anything is transferred.",
              ],
              [
                "4",
                "Tax status, stated plainly",
                "CLIF Foundation is an Illinois nonprofit corporation with an EIN. Our application for 501(c)(3) recognition is pending with the IRS. Until it is approved, we cannot promise that a gift is tax-deductible; please ask your tax adviser.",
              ],
            ].map(([n, t, d]) => (
              <li
                key={n}
                style={{
                  padding: "20px 0",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px 20px",
                }}
              >
                <span
                  style={{
                    flex: "0 0 32px",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: 13,
                    color: "var(--link)",
                    paddingTop: 4,
                  }}
                >
                  {n}
                </span>
                <div style={{ flex: "1 1 320px", display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 18, fontWeight: 500 }}>{t}</span>
                  <span
                    style={{
                      fontSize: 15,
                      lineHeight: 1.55,
                      color: "var(--text-body)",
                    }}
                  >
                    {d}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="page-wrap"
        style={{
          paddingTop: "clamp(72px,8vw,104px)",
          paddingBottom: "clamp(72px,8vw,104px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "32px 72px",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: "1 1 360px", display: "grid", gap: 14 }}>
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
            Who is behind it
          </h2>
        </div>
        <div
          style={{
            flex: "1 1 520px",
            display: "grid",
            gap: 18,
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--text-body)",
            maxWidth: 720,
          }}
        >
          <p style={{ margin: 0 }}>
            CLIF was built by the CLIF Consortium, a network of clinician-scientists
            and data scientists at academic medical centers. CLIF Foundation was
            incorporated in Illinois to carry out adoption work that sits outside
            the Consortium’s research mission.
          </p>
          <p style={{ margin: 0 }}>
            Board seats are proposed and will be named here once confirmed.
            Governing documents will be published on the same page.
          </p>
          <Link href="/board" className="linkish">
            Board and governance →
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
